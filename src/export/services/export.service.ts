import { Injectable, Logger } from "@nestjs/common";
import { AiProcessingService } from "src/import/services/ai-processing.service";
import * as JSZip from 'jszip';
import * as fs from 'fs';
import * as path from 'path';
import { CreateFlutterDto } from "../dto/create-flutter.dto";

@Injectable()
export class ExportService {
    private readonly logger = new Logger(ExportService.name);
    private readonly flutterTemplatePath: string;
    
    constructor(
        private readonly aiProcessingService: AiProcessingService
    ) {
        // Ruta al proyecto template de Flutter
        this.flutterTemplatePath = path.join(
            process.cwd(), 
            'src', 
            'export', 
            'templates', 
            'flutter_template',
            'flutter_project_template'  // Añadir este directorio
        );
        
         // Verificar que el template existe
        if (!fs.existsSync(this.flutterTemplatePath)) {
            this.logger.error(`Template de Flutter no encontrado en ${this.flutterTemplatePath}`);
            throw new Error(`Template de Flutter no encontrado en ${this.flutterTemplatePath}`);
        }
        
        // Verificar que el pubspec.yaml existe
        const pubspecPath = path.join(this.flutterTemplatePath, 'pubspec.yaml');
        if (!fs.existsSync(pubspecPath)) {
            this.logger.error(`No se encontró pubspec.yaml en el template`);
            throw new Error(`No se encontró pubspec.yaml en el template`);
        }
        
        this.logger.log(`Template de Flutter listo para usar`);
    }

    public async generateFlutterProject(createFlutterDto: CreateFlutterDto): Promise<Buffer> {
        try {
            const { projectName, grapesJsData } = createFlutterDto;
            
            // Sanitizar el nombre del proyecto
            const safeProjectName = this.sanitizeProjectName(projectName);
            
            // Generar componentes desde los datos de GrapesJS
            const generatedFiles = await this.generateFlutterCodeFromGrapesJS(grapesJsData);

            // Generar el archivo ZIP directamente en memoria
            const zipBuffer = await this.createProjectZipInMemory(safeProjectName, generatedFiles);
            
            return zipBuffer;
        } catch (error) {
            this.logger.error('Error generando proyecto Flutter:', error);
            throw new Error('Error al generar el proyecto Flutter: ' + error.message);
        }
    }

    private async createProjectZipInMemory(projectName: string, generatedFiles: any[]): Promise<Buffer> {
        this.logger.log(`Creando ZIP en memoria para el proyecto ${projectName}...`);
        
        const zip = new JSZip();
        const projectFolder = zip.folder(projectName);
        
        if (!projectFolder) {
            throw new Error('Error creando carpeta raíz en el ZIP');
        }
        
        // 1. Añadir todos los archivos del template excepto la carpeta lib
        await this.addTemplateFilesToZip(projectFolder);
        
        // 2. Actualizar el pubspec.yaml con el nombre del proyecto
        await this.addModifiedPubspecToZip(projectFolder, projectName);
        
        // 3. Crear la carpeta lib y añadir los archivos generados por la IA
        await this.addGeneratedFilesToZip(projectFolder, generatedFiles);
        
        // 4. Generar el buffer del ZIP
        this.logger.log('Comprimiendo proyecto...');
        return await zip.generateAsync({
            type: "nodebuffer",
            compression: "DEFLATE",
            compressionOptions: { level: 6 }
        });
    }

    private async addTemplateFilesToZip(projectFolder: JSZip): Promise<void> {
        // Función recursiva para agregar archivos del template al ZIP
        const addDirToZip = async (sourcePath: string, zipFolder: JSZip, relativePath: string = '') => {
        try {
            const fullSourcePath = path.join(sourcePath, relativePath);
            this.logger.log(`Procesando directorio: ${fullSourcePath}`);
            
            // Verificar que el directorio existe
            if (!fs.existsSync(fullSourcePath)) {
                this.logger.error(`Directorio no encontrado: ${fullSourcePath}`);
                return;
            }
            
            const entries = fs.readdirSync(fullSourcePath);
            this.logger.log(`Encontrados ${entries.length} archivos/carpetas en ${relativePath || 'raíz'}`);
            
            for (const entry of entries) {
                const fullPath = path.join(fullSourcePath, entry);
                const zipPath = relativePath ? path.join(relativePath, entry) : entry;
                
                // Excluir solo la carpeta lib
                if ((entry === 'lib') && fs.statSync(fullPath).isDirectory()) {
                    this.logger.log(`Excluyendo carpeta lib para reemplazo`);
                    continue;
                }
                
                // Excluir archivos temporales o de desarrollo
                if (['.dart_tool', '.idea', 'build', '.git'].includes(entry)) {
                    this.logger.log(`Excluyendo directorio de desarrollo: ${entry}`);
                    continue;
                }
                
                const isDirectory = fs.statSync(fullPath).isDirectory();
                
                if (isDirectory) {
                    // Si es un directorio, crear en el ZIP y procesar recursivamente
                    this.logger.log(`Creando directorio en ZIP: ${zipPath}`);
                    const newFolder = zipFolder.folder(entry);
                    if (newFolder) {
                        await addDirToZip(sourcePath, newFolder, zipPath);
                    }
                } else {
                    // Agregar archivo al ZIP
                    try {
                        const fileContent = fs.readFileSync(fullPath);
                        zipFolder.file(entry, fileContent);
                        this.logger.log(`Archivo añadido: ${zipPath}`);
                    } catch (fileError) {
                        this.logger.error(`Error leyendo archivo ${fullPath}: ${fileError.message}`);
                    }
                }
            }
        } catch (error) {
            this.logger.error(`Error procesando directorio ${relativePath}: ${error.message}`);
            throw error;
        }
    };
    
    // Agregar todos los archivos del template excepto la carpeta lib
    this.logger.log(`Añadiendo archivos del template desde: ${this.flutterTemplatePath}`);
    await addDirToZip(this.flutterTemplatePath, projectFolder);
    }

    private async addModifiedPubspecToZip(projectFolder: JSZip, projectName: string): Promise<void> {
        const pubspecPath = path.join(this.flutterTemplatePath, 'pubspec.yaml');
        
        if (fs.existsSync(pubspecPath)) {
            this.logger.log('pubspec.yaml encontrado correctamente');
            let pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
            
            // Actualizar el nombre del proyecto y la descripción
            pubspecContent = pubspecContent.replace(/name:\s*[\w_]+/, `name: ${projectName}`);
            
            projectFolder.file('pubspec.yaml', pubspecContent);
        } else {
            throw new Error('No se encontró el archivo pubspec.yaml en el template');
        }
    }

    private async addGeneratedFilesToZip(projectFolder: JSZip, generatedFiles: any[]): Promise<void> {
        // Crear la carpeta lib si no existe
        const libFolder = projectFolder.folder('lib');
        
        if (!libFolder) {
            throw new Error('Error creando carpeta lib en el ZIP');
        }

        this.logger.log(`Añadiendo ${generatedFiles.length} archivos generados a la carpeta lib`);
        
        // Agregar los archivos generados
        for (const file of generatedFiles) {
            try {
                // Normalizar la ruta: eliminar 'lib/' al principio si existe
                let filepath = file.filepath || '';
                if (filepath.startsWith('lib/')) {
                    filepath = filepath.substring(4);
                }

                // Normalizar otras rutas problemáticas
                filepath = filepath.replace(/^\/+/, '');
                
                if (filepath) {
                    // Crear directorios anidados si es necesario
                    libFolder.file(path.join(filepath, file.filename), file.filecontent);
                    this.logger.log(`Archivo añadido: lib/${filepath}/${file.filename}`);
                } else {
                    // Añadir archivo directamente en la raíz de lib/
                    libFolder.file(file.filename, file.filecontent);
                    this.logger.log(`Archivo añadido: lib/${file.filename}`);
                }
            } catch (error) {
                this.logger.error(`Error añadiendo archivo ${file.filename}:`, error);
                throw error;
            }
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

    private async generateFlutterCodeFromGrapesJS(grapesJsData: any): Promise<any[]> {
        try {
            this.logger.log('Generando código Flutter desde datos de GrapesJS...');
            
            /// Convertir datos a string si es necesario
            const grapesJsJsonString = typeof grapesJsData === 'string' 
                ? grapesJsData 
                : JSON.stringify(grapesJsData);
            
            // Usar el nuevo método específico para Flutter
            const generatedFiles = await this.aiProcessingService.generateFlutterComponentsFromGrapesJS(grapesJsJsonString);
            this.logger.log(`Generados ${generatedFiles.length} archivos Flutter`);

            return generatedFiles;
        } catch (error) {
            this.logger.error('Error generando código Flutter:', error);
            throw new Error('Error al generar código Flutter desde GrapesJS: ' + error.message);
        }
    }
    
}