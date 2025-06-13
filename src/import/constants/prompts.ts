const promptGeneral: string = `
    ## ESTRUCTURA PROJECTDATA REQUERIDA

    json
    {
      "assets": [],
      "styles": [
        {
          "selectors": ["#selector", ".class"],
          "style": {
            "property": "value"
          }
        }
      ],
      "pages": [
        {
          "name": "Página Principal",
          "frames": [
            {
              "component": {
                "type": "wrapper",
                "components": [
                  // UTILIZA LOS COMPONENTES DE LOS PLUGINS CONFIGURADOS AQUÍ
                ]
              }
            }
          ]
        }
      ]
    }

    IMPORTANTE: 
        * El JSON debe ser funcionalmente completo, no solo estructuralmente válido.
        * OBLIGATORIO: Utiliza los tipos de componentes específicos de los plugins configurados, NO crees componentes genéricos.
        * Para elementos interactivos como acordeones o carruseles, usa los plugins específicos en lugar de div genéricos.
        
        * Los plugins específicos configurados en GrapesJS son: 
            plugins: [
              tableComponent.init({}),
              listPagesComponent.init({}),
              fsLightboxComponent.init({}),
              lightGalleryComponent.init({}),
              swiperComponent.init({}),
              accordionComponent.init({}),
              flexComponent.init({}),
              rteTinyMce.init({}),
              canvasGridMode.init({}),
              layoutSidebarButtons.init({}),
            ]          
`;

export const promptIABoceto:string = `
    ERES UN DISEÑADOR DE UX/UI CREATIVO E INNOVADOR, ESPECIALIZADO EN APLICACIONES MÓVILES. Te caracterizan tu originalidad, tu sensibilidad por las tendencias actuales y tu capacidad para crear interfaces que conectan emocionalmente con los usuarios.

    TAREA: Interpreta este boceto y transfórmalo en un objeto GrapesJS de alta fidelidad para una aplicación móvil moderna. Selecciona el tamaño de pantalla más adecuado entre 360x640, 375x812 o 768x1024.

    Analiza esta imagen que corresponde a un boceto de Interfaz de Usuario de una aplicacion movil y extrae todos los elementos visuales para convertirlos en un Objeto compatible con GrapesJS SDK, UTILIZANDO EXCLUSIVAMENTE los componentes y plugins ya configurados en el proyecto.

    PROCESO CREATIVO:
    1. INSPIRACIÓN: Observa el boceto como lo haría un diseñador humano, captando su esencia y propósito
    2. EXPLORACIÓN: Identifica oportunidades para mejorar la experiencia del usuario manteniendo la visión original
    3. PERSONALIDAD: Añade carácter y estilo distintivo al diseño (aplica una paleta de colores cohesiva, considera tipografías con personalidad)
    4. EMOCIÓN: Considera cómo cada elemento generará respuestas emocionales (interés, confianza, entusiasmo)
    5. INNOVACIÓN: Incorpora patrones de diseño modernos y micro-interacciones donde sea apropiado

    PRINCIPIOS DE DISEÑO A APLICAR:
    • Jerarquía visual clara: guía la atención del usuario a través de la interfaz
    • Consistencia: mantén patrones repetitivos en elementos similares
    • Contraste: asegura legibilidad y enfoque en elementos importantes
    • Espacio: utiliza espaciado generoso y equilibrado para mejorar la legibilidad
    • Alineación: crea orden visual y relaciones entre elementos
    • Accesibilidad: considera contraste de colores adecuado y tamaños de toque

    Utiliza EXCLUSIVAMENTE los componentes y plugins ya configurados en GrapesJS, pero implementándolos de manera creativa para lograr un diseño único y atractivo.

    ${promptGeneral}
`;


export const promptIAGenerateFromPrompt = (prompt:string) => {
  return `
    ERES UN DISEÑADOR DE PRODUCTO VISIONARIO con amplia experiencia en UX/UI para aplicaciones móviles. Tienes un estilo distintivo que combina funcionalidad con originalidad artística y una profunda comprensión de las necesidades del usuario.

    BRIEFING DE DISEÑO: "${prompt}"

    PROCESO DE DISEÑO:
    1. EMPATÍA: Ponte en el lugar del usuario final, ¿qué necesidades emocionales y funcionales tiene?
    2. DEFINICIÓN: Extrae los requisitos clave del briefing, identificando el propósito principal
    3. IDEACIÓN: Genera múltiples enfoques conceptuales antes de decidirte por el mejor
    4. PROTOTIPADO: Desarrolla la estructura completa con atención al detalle y las interacciones
    5. PERSONALIDAD DE MARCA: Infunde el diseño con carácter único mientras mantienes coherencia

    ELEMENTOS A CONSIDERAR:
    • Perfil de usuario: ¿Quién usará la aplicación? ¿Qué valoran?
    • Contexto de uso: ¿Cuándo y dónde se usará la aplicación?
    • Flujo de usuario: Crea una experiencia fluida y lógica entre pantallas
    • Puntos de fricción: Identifica y elimina posibles obstáculos en la experiencia
    • Micro-momentos: Introduce elementos delightful en momentos clave
    • Accesibilidad: Diseña para todos, considerando distintas capacidades

    APLICA TU CREATIVIDAD PARA:
    • Proponer soluciones innovadoras a problemas comunes
    • Crear una paleta de colores única que refleje la personalidad del producto
    • Diseñar componentes distintivos que mantengan coherencia visual
    • Introducir pequeños detalles que sorprendan y deleiten al usuario
    • Equilibrar originalidad con familiaridad para una curva de aprendizaje óptima

    Sé tan creativo como un diseñador humano experimentado mientras creas una estructura compatible con GrapesJS utilizando los plugins disponibles.

    ${promptGeneral}
  `
}


export const promptIAComponentsFlutter = (grapesJsData: string) => {
    return `
    Analiza el siguiente objeto JSON que representa una estructura de datos de GrapesJS que describe una interfaz gráfica de aplicación móvil donde cada página representa una pantalla con posibilidad de navegación entre pantallas.

      Estructura de datos GrapesJS: ${grapesJsData}

      TAREAS ESPECÍFICAS:
      
      1. ANÁLISIS DE ESTRUCTURA:
         - Interpretar el objeto JSON de GrapesJS (assets, styles, pages, frames, components)
         - Identificar componentes de UI y su jerarquía (wrapper, text, button, input, etc.)
         - Mapear estilos CSS a propiedades de widgets Flutter equivalentes
         - Detectar patrones de navegación entre páginas/frames
      
      2. GENERACIÓN DE CÓDIGO FLUTTER:
         - Crear widgets Flutter que representen la estructura visual detectada
         - Implementar navegación entre pantallas usando GoRouter
         - Generar modelos de datos basados en la estructura detectada
         - Crear servicios para manejo de estado con Riverpod
         - Implementar base de datos local con Isar
         - Añadir funcionalidades de conectividad y notificaciones
      
      3. MAPEO DE COMPONENTES GRAPESJS A FLUTTER:
         - type: "text" → Text widget con estilos apropiados
         - type: "button" → ElevatedButton, TextButton, o OutlinedButton
         - type: "input" → TextField con configuración apropiada
         - type: "image" → Image widget con manejo de assets
         - type: "flex" → Column, Row, o Flex widgets
         - type: "wrapper" → Container, Scaffold, o widgets de layout
         - Elementos con estilos → aplicar Theme y decoraciones
      
      4. ESTRUCTURA DE PROYECTO FLUTTER:
         - /lib/main.dart - Punto de entrada de la aplicación
         - /lib/app.dart - Configuración principal de la app
         - /lib/router/app_router.dart - Configuración de rutas con GoRouter
         - /lib/models/ - Modelos de datos con anotaciones Isar
         - /lib/providers/ - Providers de Riverpod para estado global
         - /lib/services/ - Servicios HTTP, base de datos, notificaciones
         - /lib/screens/ - Pantallas de la aplicación
         - /lib/widgets/ - Widgets reutilizables
         - /lib/utils/ - Utilidades y constantes
         - /lib/theme/ - Configuración de tema y estilos
      
      5. FUNCIONALIDADES REQUERIDAS:
         - Navegación fluida entre pantallas
         - Estado reactivo con Riverpod
         - Persistencia local con Isar
         - Conectividad de red con HTTP
         - Notificaciones locales
         - Geolocalización básica
         - Manejo de preferencias del usuario
         - Arquitectura escalable y mantenible
      
      6. COMPATIBILIDAD Y DEPENDENCIAS:
         - Flutter 3.13.9
         - Todas las dependencias especificadas en pubspec.yaml
         - Código compatible con Android e iOS
         - Null safety habilitado
         - Buenas prácticas de Flutter
      
      IMPORTANTE:
      - Cada página del JSON de GrapesJS debe convertirse en una pantalla Flutter separada
      - Los componentes dentro de frames deben mapearse a widgets Flutter apropiados
      - Los estilos CSS deben convertirse a propiedades de Flutter (colors, padding, margin, etc.)
      - Implementar navegación entre las páginas detectadas
      - Generar datos de demostración para mostrar funcionalidad
      - El código debe ser completamente funcional y ejecutable
      - Seguir convenciones de nomenclatura de Flutter (snake_case para archivos, camelCase para variables)
      
      Formato de salida: Devuelve únicamente el código de Flutter sin explicaciones adicionales ni markdown en un objeto json con la siguiente estructura:

          [
              {
                  "filepath": "",
                  "filename": "main.dart",
                  "filecontent": "import 'package:flutter/material.dart';\n// código completo aquí"
              },
              {
                  "filepath": "",
                  "filename": "app.dart", 
                  "filecontent": "// código completo de configuración de la app"
              },
              {
                  "filepath": "router/",
                  "filename": "app_router.dart",
                  "filecontent": "// configuración de rutas con GoRouter"
              }
              // ... demás archivos necesarios
          ]

      Formato para la configuracion de rutas:

      Widget build(BuildContext context) {
        return MaterialApp.router(
          routerConfig: _router,
          title: 'Flutter Demo',
          theme: ThemeData(
            primarySwatch: Colors.blue,
          ),
        );
      }

      Donde cada objeto representa un archivo necesario para la aplicación Flutter, con su ruta relativa desde lib/, nombre de archivo y contenido completo.
      
      NOTA: El código generado debe ser compatible con las dependencias del pubspec.yaml:
      - flutter_riverpod: ^2.6.1
      - go_router: ^15.1.1  
      - http: ^1.4.0
      - Y todas las demás dependencias especificadas
  `;
};

export const promptIAComponents = (options: string) => {
  return `
      Analiza el siguiente objeto que representa una estructura JSON personalizada de GrapesJS que describe una interfaz gráfica de Flutter donde cada paginas representa una pantalla donde existe la posibilidad de navegacion entre pantallas.

      Tareas: 
      * Interpretar el objeto JSON y generar un código de Flutter que represente la estructura de la interfaz gráfica, incluyendo widgets, estilos y navegación entre pantallas y componentes comunmente usados como cards, navigation bars, etc.

      * Asegurarse de que el código generado sea compatible con la versión de Flutter 3.24.5 y siga las mejores prácticas de desarrollo.

      * El alcance del código generado debe incluir la creación de pantallas, widgets personalizados, navegación entre pantallas el consumo de servicios mediante api rest y conexion a la base de datos local.

      * Las pantallas generadas deben ser interactivas, permitir al usuario navegar entre ellas y realizar acciones con datos en memoria a manera de demostracion, no deben necesariamente estar conectadas a un backend real o una base de datos, pero deben simular la funcionalidad esperada

      * La estructura de directorios y archivos debe ser organizada y seguir las convenciones de Flutter, incluyendo la creación de archivos separados para cada widget o componente, siguiendo una estructura escalable.

      Objeto JSON: ${options}

      Formato de salida: Devuelve únicamente el código de Flutter sin explicaciones adicionales ni markdown en un objeto json con la siguiente estructura de ejemplo.

          [
              {
                  "filepath": "filepath/ejemplo/directory/",
                  "filename": "filename.ext",
                  "filecontent" : "content css, html, component, dart code, etc"
              },
              {/*Demas archivos necesarios */}
          ]

      Donde cada objeto en el array representa un archivo necesario para la aplicacion Flutter, con su ruta, nombre y contenido, la ruta tiene que tomas como base la carpeta lib del proyecto.

      Asegúrate de que el código generado sea compatible con la versión de Flutter 3.24.5 y siga las mejores prácticas de desarrollo. 
      
      El codigo generado debe ser compatible con las siguientes dependencias y configuracion del pubspec.yaml:

          isar_version: &isar_version 3.1.0 # define the version to be used

          environment:
          sdk: ^3.5.0

          dependencies:
          connectivity_plus: ^6.1.4
          flutter:
              sdk: flutter  
          flutter_riverpod: ^2.6.1
          geolocator: ^10.1.0
          go_router: ^15.1.1
          http: ^1.4.0
          maplibre_gl: ^0.21.0 
          path_provider: ^2.1.5
          shared_preferences: ^2.5.3
          socket_io_client: ^3.1.2
          flutter_background_service: ^5.1.0
          flutter_background_service_android: ^6.3.0
          android_alarm_manager_plus: ^4.0.7
          permission_handler: ^11.4.0
          flutter_local_notifications: ^18.0.1
          isar: *isar_version
          isar_flutter_libs: *isar_version # contains Isar Core

          dependency_overrides:
          geolocator_android: 4.6.1

          dev_dependencies:
          flutter_lints: ^4.0.0
          flutter_test:
              sdk: flutter
          isar_generator: *isar_version
          build_runner: any

          flutter:
          uses-material-design: true
  `;
}