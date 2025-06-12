const promptGeneral: string = `
    TAREA: Genera un Objeto compatible con el formato y estructura empleado en la libreria de GrapesJS SDK. Se debe identificar para que tamaño de pantalla se realizó el boceto 360x640, 375x812 o 768x1024.

    PASOS:
    1. Identifica los bordes y contornos principales
    2. Detecta figuras geométricas básicas
    3. IMPORTANTE: Asocia cada elemento identificado con un componente específico de GrapesJS o de los plugins configurados:
       - Para tablas, usa los componentes del plugin 'tableComponent'
       - Para galerías, usa 'fsLightboxComponent' o 'lightGalleryComponent'
       - Para carruseles, usa 'swiperComponent'
       - Para iconos, usa el plugin 'iconifyComponent'
       - Para acordeones, usa 'accordionComponent'
       - Para layouts flexibles, usa 'flexComponent'
       - Para texto enriquecido, usa 'rteTinyMce'
    4. Busca texto y elementos tipográficos
    5. Captura relaciones espaciales entre elementos
    6. Usa colores coherentes con los tonos observados en la imagen
    7. Identifica los estilos de posicionamiento y alineación de los elementos
    8. Construye la estructura usando los tipos de componente correctos de los plugins disponibles

    ## PLUGINS DISPONIBLES Y SUS COMPONENTES

    1. tableComponent: 
       - Tipo: "table"
       - Propiedades específicas: rows, columns, headers
       Ejemplo: {"type":"table","rows":3,"columns":4,"headers":true}

    2. fsLightboxComponent y lightGalleryComponent:
       - Tipo: "lightbox" o "gallery"
       - Propiedades específicas: images[], thumbnails, lightboxOptions
       Ejemplo: {"type":"lightbox","images":["url1.jpg","url2.jpg"]}

    3. swiperComponent:
       - Tipo: "swiper"
       - Propiedades específicas: slides[], loop, navigation
       Ejemplo: {"type":"swiper","slides":[{"content":"Slide 1"},{"content":"Slide 2"}],"loop":true,"navigation":true}

    4. iconifyComponent:
       - Tipo: "iconify"
       - Propiedades específicas: icon, width, height, color
       Ejemplo: {"type":"iconify","icon":"mdi:home","width":"24px","height":"24px","color":"#333"}

    5. accordionComponent:
       - Tipo: "accordion"
       - Propiedades específicas: items[], multiple, collapse
       Ejemplo: {"type":"accordion","items":[{"title":"Sección 1","content":"Contenido 1"},{"title":"Sección 2","content":"Contenido 2"}]}

    6. flexComponent:
       - Tipo: "flex"
       - Propiedades específicas: direction, justifyContent, alignItems
       Ejemplo: {"type":"flex","direction":"row","justifyContent":"space-between","alignItems":"center","components":[...]}

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
        * Cuando identifiques un elemento en el boceto, SIEMPRE busca primero el componente más adecuado de los plugins disponibles.
        * Para layouts y contenedores, prioriza el uso de 'flexComponent'.
        * Para iconos, SIEMPRE usa 'iconifyComponent' con el ícono apropiado de la librería Iconify.
        * Para elementos interactivos como acordeones o carruseles, usa los plugins específicos en lugar de div genéricos.
        
        * Los plugins específicos configurados en GrapesJS son: 
            plugins: [
              tableComponent.init({}),
              listPagesComponent.init({}),
              fsLightboxComponent.init({}),
              lightGalleryComponent.init({}),
              swiperComponent.init({}),
              iconifyComponent.init({}),
              accordionComponent.init({}),
              flexComponent.init({}),
              rteTinyMce.init({}),
              canvasGridMode.init({}),
              layoutSidebarButtons.init({}),
            ]

        * Ejemplos adicionales de uso correcto de componentes:
          
          1. Barra de navegación: 
             {"type":"flex","direction":"row","justifyContent":"space-between","attributes":{"class":"navbar"},"components":[
               {"type":"iconify","icon":"mdi:menu"},
               {"type":"text","content":"Mi App"},
               {"type":"iconify","icon":"mdi:account"}
             ]}
          
          2. Carrusel de imágenes: 
             {"type":"swiper","slides":[
               {"type":"image","attributes":{"src":"img1.jpg"}},
               {"type":"image","attributes":{"src":"img2.jpg"}}
             ],"navigation":true,"pagination":true}
          
          3. Lista con iconos:
             {"type":"flex","direction":"column","components":[
               {"type":"flex","direction":"row","components":[
                 {"type":"iconify","icon":"mdi:check","color":"green"},
                 {"type":"text","content":"Item completado"}
               ]},
               {"type":"flex","direction":"row","components":[
                 {"type":"iconify","icon":"mdi:close","color":"red"},
                 {"type":"text","content":"Item pendiente"}
               ]}
             ]}
`;

export const promptIABoceto:string = `
    Analiza esta imagen que corresponde a un boceto de Interfaz de Usuario de una aplicacion movil y extrae todos los elementos visuales para convertirlos en un Objeto compatible con GrapesJS SDK, UTILIZANDO EXCLUSIVAMENTE los componentes y plugins ya configurados en el proyecto.

    ${promptGeneral}
`;


export const promptIAGenerateFromPrompt = (prompt:string) => {
  return `
    El usuario ha proporcionado el siguiente prompt: "${prompt}".
    Tu tarea es generar un objeto JSON que represente un proyecto de GrapesJS SDK basado en este prompt.

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
         - Flutter 3.24.5
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
                  "filepath": "lib/",
                  "filename": "main.dart",
                  "filecontent": "import 'package:flutter/material.dart';\n// código completo aquí"
              },
              {
                  "filepath": "lib/",
                  "filename": "app.dart", 
                  "filecontent": "// código completo de configuración de la app"
              },
              {
                  "filepath": "lib/router/",
                  "filename": "app_router.dart",
                  "filecontent": "// configuración de rutas con GoRouter"
              }
              // ... demás archivos necesarios
          ]

      Donde cada objeto representa un archivo necesario para la aplicación Flutter, con su ruta relativa desde lib/, nombre de archivo y contenido completo.
      
      NOTA: El código generado debe ser compatible con las dependencias del pubspec.yaml:
      - flutter_riverpod: ^2.6.1
      - go_router: ^15.1.1  
      - http: ^1.4.0
      - isar: 3.1.0
      - isar_flutter_libs: 3.1.0
      - connectivity_plus: ^6.1.4
      - geolocator: ^10.1.0
      - shared_preferences: ^2.5.3
      - flutter_local_notifications: ^18.0.1
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