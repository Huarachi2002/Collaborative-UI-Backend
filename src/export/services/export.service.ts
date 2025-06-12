import { Injectable, Logger } from "@nestjs/common";
import { AiProcessingService } from "src/import/services/ai-processing.service";
import * as JSZip from 'jszip';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { CreateFlutterDto } from "../dto/create-flutter.dto";
import { promptIAComponentsFlutter } from "src/import/constants/prompts";

const execAsync = promisify(exec);

@Injectable()
export class ExportService {
    private readonly logger = new Logger(ExportService.name);
    
    constructor(
        private readonly aiProcessingService: AiProcessingService
    ) {}

    public async generateFlutterProject(createFlutterDto: CreateFlutterDto): Promise<Buffer> {
        try {
            const { projectName, grapesJsData } = createFlutterDto;
            
            // Sanitizar el nombre del proyecto (eliminar espacios y caracteres especiales)
            const safeProjectName = this.sanitizeProjectName(projectName);
            
            // Crear un directorio único temporal para el proyecto
            const tempDir = path.join(process.cwd(), 'temp');
            const projectDir = path.join(tempDir, `flutter-${safeProjectName}-${uuidv4()}`);
            
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            // Crear el directorio del proyecto
            fs.mkdirSync(projectDir, { recursive: true });
            
            // Generar el proyecto Flutter usando Flutter CLI
            await this.createFlutterProject(projectDir, safeProjectName);
            
            // Generar componentes desde los datos de GrapesJS
            const generatedComponents = await this.generateFlutterCodeFromGrapesJS(grapesJsData);
            
            // Comprimir el proyecto en un archivo ZIP
            const zipBuffer = await this.zipProject(projectDir);
            
            // Limpiar los archivos temporales
            this.cleanupTempFiles(projectDir);
            
            return zipBuffer;
        } catch (error) {
            this.logger.error('Error generando proyecto Flutter:', error);
            throw new Error('Error al generar el proyecto Flutter: ' + error.message);
        }
    }
    
    private sanitizeProjectName(name: string): string {
        // Eliminar espacios y caracteres especiales, convertir a minúsculas
        return name
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')
            .replace(/^[0-9]/, 'app_$&');
    }
    
    private async createFlutterProject(projectDir: string, projectName: string): Promise<void> {
        try {
            this.logger.log(`Generando proyecto Flutter "${projectName}" en ${projectDir}...`);
            
            // Construir comando para ng new
            let flutterCreateCommand = `flutter create ${projectName} --project-name ${projectName}`;
            
            // Ejecutar comando para crear el proyecto
            this.logger.log(`Ejecutando: ${flutterCreateCommand}`);
            await execAsync(flutterCreateCommand, { cwd: projectDir });
            
            // Actualizar pubspec.yaml con las dependencias necesarias
            await this.updatePubspecYaml(path.join(projectDir, projectName));
            
            this.logger.log('Proyecto Flutter generado correctamente');
        } catch (error) {
            this.logger.error('Error al generar proyecto Flutter con CLI:', error);
            throw new Error('Error al ejecutar Flutter CLI: ' + error.message);
        }
    }

    private async updatePubspecYaml(projectDir: string): Promise<void> {
        const pubspecPath = path.join(projectDir, 'pubspec.yaml');
        
        if (fs.existsSync(pubspecPath)) {
            let pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
            
            // Agregar dependencias necesarias
            const dependencies = `
  # State management
  flutter_riverpod: ^2.6.1
  
  # Navigation
  go_router: ^15.1.1
  
  # HTTP requests
  http: ^1.4.0
  
  # Local database
  isar: 3.1.0
  isar_flutter_libs: 3.1.0
  
  # Utilities
  connectivity_plus: ^6.1.4
  geolocator: ^10.1.0
  path_provider: ^2.1.5
  shared_preferences: ^2.5.3
  socket_io_client: ^3.1.2
  
  # Background services and notifications
  flutter_background_service: ^5.1.0
  flutter_background_service_android: ^6.3.0
  android_alarm_manager_plus: ^4.0.7
  permission_handler: ^11.4.0
  flutter_local_notifications: ^18.0.1`;

            const devDependencies = `
  isar_generator: 3.1.0
  build_runner: any`;

            // Reemplazar sección de dependencies
            pubspecContent = pubspecContent.replace(
                /(dependencies:\s*\n(?:\s+[^\n]*\n)*)/,
                `dependencies:\n  flutter:\n    sdk: flutter\n  cupertino_icons: ^1.0.2${dependencies}\n\n`
            );
            
            // Agregar dev_dependencies
            pubspecContent = pubspecContent.replace(
                /(dev_dependencies:\s*\n(?:\s+[^\n]*\n)*)/,
                `dev_dependencies:\n  flutter_test:\n    sdk: flutter\n  flutter_lints: ^4.0.0${devDependencies}\n\n`
            );
            
            fs.writeFileSync(pubspecPath, pubspecContent);
            
            // Ejecutar flutter pub get
            await execAsync('flutter pub get', { cwd: projectDir });
            
            this.logger.log('pubspec.yaml actualizado con dependencias necesarias');
        }
    }

    private async generateFlutterCodeFromGrapesJS(grapesJsData: any): Promise<any[]> {
        try {
            this.logger.log('Generando código Flutter desde datos de GrapesJS...');
            
            // Usar el servicio de IA para generar código Flutter
            const grapesJsJsonString = typeof grapesJsData === 'string' ? grapesJsData : JSON.stringify(grapesJsData);
            
            const generatedCode = await this.aiProcessingService.generateFlutterComponents({
                grapesJsData: grapesJsJsonString,
            });

            return generatedCode;
        } catch (error) {
            this.logger.error('Error generando código Flutter:', error);
            throw new Error('Error al generar código Flutter desde GrapesJS: ' + error.message);
        }
    }
    

    
    private async zipProject(projectDir: string): Promise<Buffer> {
        this.logger.log(`Comprimiendo proyecto en ${projectDir}...`);
        
        const zip = new JSZip();
        
        // Función recursiva para agregar archivos al ZIP
        const addFilesToZip = (currentPath: string, zipFolder: JSZip) => {
            const files = fs.readdirSync(currentPath);
            
            for (const file of files) {
                const filePath = path.join(currentPath, file);
                
                // Excluir ciertos directorios/archivos que no son necesarios
                if (this.shouldExcludeFromZip(file, filePath)) {
                    continue;
                }
                
                if (fs.statSync(filePath).isDirectory()) {
                    // Si es un directorio, crear carpeta en ZIP y procesar recursivamente
                    const newZipFolder = zipFolder.folder(file);
                    addFilesToZip(filePath, newZipFolder);
                } else {
                    // Si es un archivo, agregarlo al ZIP
                    const fileContent = fs.readFileSync(filePath);
                    zipFolder.file(file, fileContent);
                }
            }
        };
        
        // Agregar todos los archivos al ZIP
        addFilesToZip(projectDir, zip);
        
        // Generar el buffer del ZIP
        return await zip.generateAsync({
            type: "nodebuffer",
            compression: "DEFLATE",
            compressionOptions: { level: 6 },
            platform: "UNIX",
            comment: "Proyecto Flutter generado por Collaborative Project"
        });
    }
    
    private shouldExcludeFromZip(fileName: string, filePath: string): boolean {
        // Excluir archivos y directorios innecesarios
        const excludePatterns = [
            'node_modules',
            '.dart_tool',
            'build',
            '.packages',
            '.pub-cache',
            '.gradle',
            'ios/Pods',
            'android/.gradle',
            'android/app/build',
            '.git',
            '.gitignore',
            '.DS_Store'
        ];
        
        return excludePatterns.some(pattern => fileName.includes(pattern) || filePath.includes(pattern));
    }
    

    private cleanupTempFiles(projectDir: string): void {
        try {
            this.logger.log(`Limpiando archivos temporales en ${projectDir}...`);
            
            if (fs.existsSync(projectDir)) {
                // Eliminar directorio recursivamente
                fs.rmSync(projectDir, { recursive: true, force: true });
            }
        } catch (error) {
            this.logger.error('Error limpiando archivos temporales:', error);
            // No lanzamos error, solo registramos para no interrumpir el flujo principal
        }
    }
}