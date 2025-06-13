import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { promptIABoceto, promptIAComponentsFlutter, promptIAGenerateFromPrompt } from "../constants/prompts";
import OpenAI from "openai";

interface Element {
    type: string;
    x: number;
    y: number;
    [key: string]: any;
}

@Injectable()
export class AiProcessingService {
    private openaiApiKey: string;
    private openai: OpenAI;
    private readonly logger = new Logger(AiProcessingService.name);

    constructor(private configService: ConfigService) {
        this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
        
        if (this.openaiApiKey) {
            try {
                this.openai = new OpenAI({
                    apiKey: this.openaiApiKey
                });
                this.logger.log('Servicio de OpenAI inicializado correctamente');
            } catch (error) {
                this.logger.error(`Error al inicializar OpenAI: ${error.message}`);
            }
        } else {
            this.logger.error('No se encontró la clave API de OpenAI. El servicio no funcionará correctamente.');
        }
    }

    async processSketch(imageBuffer: Buffer): Promise<{elements: Element[]}> {
        try {
            const base64Image = imageBuffer.toString('base64');
            
            this.logger.log('Procesando boceto con OpenAI...');
            return await this.processWithOpenAI(base64Image);
        } catch (error) {
            this.logger.error(`Error al procesar con OpenAI: ${error.message}`);
            this.logger.warn('Usando elementos por defecto.');
            return { elements: [] };
        }
    }

    private async processWithOpenAI(base64Image: string): Promise<{elements: Element[]}> {
        try {
            if (!this.openai) {
                throw new Error('OpenAI no está inicializado. Verifica tu API key.');
            }
            
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { 
                                type: "text", 
                                text: promptIABoceto
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`,
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 10000, 
            });

            const content = response.choices[0].message.content;

            console.log('Respuesta de OpenAI:', content);
            
            // Extraer y parsear la respuesta JSON
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                         content.match(/```([\s\S]*?)```/) || 
                         [null, content];
            console.log('JSON Match:', jsonMatch);
            let jsonString = jsonMatch[1] || content;
            console.log('JSON String:', jsonString);
            
            // Limpiar el JSON si es necesario
            if(!jsonString.trim().startsWith('{')) {
                const startIndex = jsonString.indexOf('{');
                if (startIndex === -1) {
                    throw new Error('No se pudo encontrar un objeto JSON válido en la respuesta de OpenAI');
                }
                jsonString = jsonString.substring(startIndex);
            }
            
            // Asegurar que el JSON termine correctamente
            if(!jsonString.trim().endsWith('}')) {
                const lastBraceIndex = jsonString.lastIndexOf('}');
                if (lastBraceIndex !== -1) {
                    jsonString = jsonString.substring(0, lastBraceIndex + 1);
                }
            }

            const parsedData = JSON.parse(jsonString);
            
            // Validar estructura GrapesJS ProjectData
            if (!this.isValidProjectData(parsedData)) {
                this.logger.warn('Estructura ProjectData inválida, usando datos por defecto');
                return {elements: []};
            }
            console.log('Datos procesados:', parsedData);
            return parsedData;
        } catch (error) {
            this.logger.error(`Error al procesar el boceto con OpenAI: ${error.message}`);
            throw error;
        }
    }

    private isValidProjectData(data: any): boolean {
        return data &&
                typeof data === 'object' &&
                Array.isArray(data.assets) &&
                Array.isArray(data.styles) &&
                Array.isArray(data.pages) &&
                data.pages.length > 0 &&
                data.pages[0].frames &&
                Array.isArray(data.pages[0].frames);
    }


    public async generateFlutterComponentsFromGrapesJS(grapesJsData: string) : Promise<any[]> {
        try {
            if(!this.openai){
                throw new Error('OpenAI no está inicializado. Verifica tu API key.');
            }

            const modifiedGrapesJsData = JSON.stringify({
                ...JSON.parse(typeof grapesJsData === 'string' ? grapesJsData : '{}'),
                _meta: {
                    dartSdkVersion: "2.19.0", // Versión compatible con tu template
                    flutterVersion: "3.24.5", // Versión compatible con tu template
                    useCompatibleDependencies: true,
                    useTemplate: true // Indicar que estamos usando un template
                }
            });

            const prompt = promptIAComponentsFlutter(modifiedGrapesJsData);
            const key = process.env.OPENAI_API_KEY;
            const response = await fetch(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    method: 'POST',
                    headers: {
                        "Authorization": `Bearer ${key}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "model": "openai/o1-mini",
                        "messages": [
                            {
                                "role": "user",
                                "content": [
                                    {
                                        "type": "text",
                                        "text": prompt
                                    }
                                    ]
                                }
                            ]
                    })
                },
                
            )

            // const response = await this.openai.chat.completions.create({
            //     model: "gpt-4o",
            //     messages: [
            //         {
            //             role: "user",
            //             content: prompt
            //         }
            //     ],
            //     max_tokens: 10000, // Aumentar límite para código Flutter más extenso
            //     temperature: 0.3,
            // });
            // const content = response.choices[0].message.content;
            
            const data = await response.json();
            console.log('Datos de OpenAI:', data);
            const content = data.choices[0].message.content;
            console.log('Contenido de OpenAI:', content);

            this.logger.log('Respuesta de OpenAI recibida para componentes de Flutter');
            console.log('Respuesta de OpenAI:', content);

            // Extraer y parsear la respuesta JSON
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                            content.match(/```([\s\S]*?)```/) || 
                            [null, content];

            let jsonString = jsonMatch[1] || content;

            // Limpiar el JSON si es necesario
            if(!jsonString.trim().startsWith('[')) {
                const startIndex = jsonString.indexOf('[');
                if (startIndex === -1) {
                    throw new Error('No se pudo encontrar un array JSON válido en la respuesta de OpenAI');
                }
                jsonString = jsonString.substring(startIndex);
            }
            
            // Asegurar que el JSON termine correctamente
            if(!jsonString.trim().endsWith(']')) {
                const lastBracketIndex = jsonString.lastIndexOf(']');
                if (lastBracketIndex !== -1) {
                    jsonString = jsonString.substring(0, lastBracketIndex + 1);
                }
            }

            const parsedData = JSON.parse(jsonString);
        
            if (!Array.isArray(parsedData)) {
                throw new Error('La respuesta debe ser un array de archivos Flutter');
            }

            return parsedData;
        } catch (error) {
            this.logger.error(`Error al generar componentes Flutter:`, error);
            throw new Error(`Error al generar componentes Flutter: ` + error.message);
        }
    }

    // Método para generar un proyecto a partir de un prompt
    public async generateFromPrompt(propmt: string): Promise<any> {
        try {
            if (!this.openai) {
                throw new Error('OpenAI no está inicializado. Verifica tu API key.');
            }

            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: promptIAGenerateFromPrompt(propmt)
                    }
                ],
                max_tokens: 10000, 
                temperature: 0.7
            });

            const content = response.choices[0].message.content;
            
            console.log('Respuesta de OpenAI:', content);

            // Extraer y parsear la respuesta JSON
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                         content.match(/```([\s\S]*?)```/) || 
                         [null, content];
            console.log('JSON Match:', jsonMatch);
            let jsonString = jsonMatch[1] || content;
            console.log('JSON String:', jsonString);

            // Limpiar el JSON si es necesario
            if(!jsonString.trim().startsWith('{')) {
                const startIndex = jsonString.indexOf('{');
                if (startIndex === -1) {
                    throw new Error('No se pudo encontrar un objeto JSON válido en la respuesta de OpenAI');
                }
                jsonString = jsonString.substring(startIndex);
            }
            
            // Asegurar que el JSON termine correctamente
            if(!jsonString.trim().endsWith('}')) {
                const lastBraceIndex = jsonString.lastIndexOf('}');
                if (lastBraceIndex !== -1) {
                    jsonString = jsonString.substring(0, lastBraceIndex + 1);
                }
            }

            const parsedData = JSON.parse(jsonString);

            // Validar estructura GrapesJS ProjectData
            if (!this.isValidProjectData(parsedData)) {
                this.logger.warn('Estructura ProjectData inválida, usando datos por defecto');
                return {elements: []}
            }
            console.log('Datos procesados:', parsedData);
            return parsedData;

        } catch (error) {
            this.logger.error(`Error al generar desde el prompt:`, error);
            throw new Error(`Error al generar desde el prompt: ` + error.message);
        }
    }
}