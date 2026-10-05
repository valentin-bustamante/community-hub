# Pruebas funcionales (T-16)

## Entorno y reproducción

La revisión final usa el código consolidado de T-14 y T-16, una base SQLite
descartable y cuentas ficticias creadas durante la prueba. No se guardan
contraseñas, JWT ni códigos de invitación. La matriz sustituye los resultados
parciales previos y describe exactamente la fuente de cada comprobación.

| Elemento | Configuración |
| --- | --- |
| Fecha local | 4 de octubre de 2026, America/Argentina/Buenos_Aires |
| Node / npm | Node 24.19.0 / npm 11.9.0 |
| Frontend | Next.js 16.3.8, React 19.2.8, build de producción |
| CMS | Strapi 5.55.1 y SQLite con base temporal independiente |
| Navegador | Chromium 153 headless, Playwright 1.62.1 |
| Tamaños | 1440 × 900, 768 × 900 y 375 × 812 |
| Datos | Tres usuarios de API, dos usuarios de interfaz y un administrador del CMS, todos ficticios |

```sh
npm ci
npm run setup
npm run lint
npm run build
npx playwright install chromium
npm run verify
```

En el entorno de revisión se usó un ejecutable Chromium local mediante
`PLAYWRIGHT_CHROMIUM_EXECUTABLE`, porque la descarga estándar de Playwright
no devolvía un archivo válido. Esa variable es opcional para otras
instalaciones. El script valida solo hosts locales, inicia los servicios,
ejecuta las pruebas y descarta su base. Para API únicamente, ejecutar
`npm run verify:api` después del build.

## Matriz de casos

| ID | Pasos y datos | Resultado esperado y obtenido | Evidencia |
| --- | --- | --- | --- |
| AUTH-01 | Abrir / sin JWT. Registrar cuenta ficticia. | Redirige a /login y, tras registro, muestra estado sin comunidades. Pasó. | UI: Sin sesión, registro y estado vacío |
| AUTH-02 | Acceder con contraseña válida e incorrecta. | Acepta la válida. Rechaza la incorrecta y muestra error en español sin abrir sesión. Pasó. | API autenticación; UI sesión |
| AUTH-03 | Cerrar sesión e invalidar JWT. | Borra token y usuario, redirige al login; JWT inválido responde 401. Pasó. | API autenticación; UI sesión |
| AUTH-04 | Consultar membresías sin JWT. | Rechaza acceso privado con 403 del plugin. Pasó. | API autenticación |
| COM-01 | Crear Alfa/Beta en API y dos comunidades desde UI. | Cada creación produce general y propietario; selección coherente. Pasó. | API creación; UI comunidades |
| COM-02 | Consultar con cuenta ajena y unirse por invitación. | Lista propia vacía antes de unirse. Invitación válida crea membresía; repetición 409 y código inexistente 404. Pasó. | API invitaciones; UI membresías |
| COM-03 | Consultar comunidad, canales, miembros y mensajes ajenos. | 403 sin datos ajenos. El listado de comunidades incluye únicamente las propias. Pasó. | API aislamiento |
| CAN-01 | Cambiar entre dos comunidades con mensajes diferentes. | Encabezado e historial siguen la selección y no mezclan mensajes. Pasó. | UI contextos |
| CAN-02 | Crear, renombrar y eliminar canal como propietario. | Funciona. Nombre repetido 409, más de 20 caracteres 400, último canal 409. Pasó. | API canales; UI creación |
| CAN-03 | Intentar administrar canal como miembro. | 403 en API y controles administrativos ausentes en UI. Pasó. | API canales; UI membresías |
| MEM-01 | Invitar usuario, dar y quitar administrador. | Se actualizan rol y agrupación del panel. Pasó. | API roles; UI roles |
| MEM-02 | Expulsar miembro y volver a consultar el chat. | DELETE 204 y acceso posterior 403. Propietario no puede salir sin transferir: 409. Pasó. | API revocación |
| MSG-01 | Enviar texto vacío, 3000 y 3001 caracteres. | Acepta 3000 (201), rechaza vacío y exceso (400). Autor proviene de la sesión aunque el cuerpo indique otro. Pasó. | API mensajes; UI contenido largo |
| MSG-02 | Abrir canal vacío, enviar texto y cambiar de contexto. | Estado vacío, envío e historial correctos. Fecha desde inválida devuelve 400. Pasó. | API mensajes; UI canales |
| DATA-01 | Editar practicas en Content Manager, guardar y actualizar la comunidad en Next.js. | La vista cargada muestra editado-cms y conserva el historial del canal. Pasó. | UI CMS |
| DATA-02 | Comunidades sin imagen opcional y mensajes largos sin espacios. | Iniciales disponibles y contenido sin desbordar a tres tamaños. Pasó. | UI contextos y pantallas |
| EMPTY-01 | Interceptar respuestas con canales y miembros vacíos. | Textos específicos para cero canales y cero miembros. Pasó con datos simulados. | UI estados controlados |
| NET-01 | Retrasar y abortar la consulta de canales desde el navegador. | Muestra carga y error de conexión; Actualizar recupera la vista. Pasó con fallo simulado. | UI estados controlados |
| UI-01 | Medir ancho a 1440, 768 y 375 px con texto largo. | Ancho del documento no excede el viewport. Pasó. | UI pantallas y capturas |
| UI-02 | Abrir navegación y miembros, usar Tab/Escape y enviar con Enter. | El foco queda dentro del diálogo, Escape cierra y Enter envía. Pasó. | UI teclado |
| UI-03 | Registrar excepciones JavaScript de la aplicación durante el recorrido. | Sin errores de página bloqueantes. Pasó. | UI sesión, verificación de pageerror |

Las pruebas de teclado cubren los recorridos principales y los diálogos
móviles. No equivalen a una auditoría exhaustiva WCAG ni de todas las
combinaciones de tecnologías de asistencia. El caso de cero miembros es
simulado porque una comunidad creada correctamente siempre tiene propietario.

## Resultados de comandos

| Comprobación | Resultado |
| --- | --- |
| Instalación desde bloqueo corregido, npm ci | Pasó |
| npm run lint, todo el frontend | Pasó |
| npm run build, ambos workspaces | Pasó |
| Pruebas REST | 8 pruebas contabilizadas: recorrido y 7 subcasos, sin fallos |
| Pruebas de interfaz | 9 pruebas contabilizadas: recorrido y 8 subcasos, sin fallos |
| git diff --check | Pasó |

## Defectos encontrados y correcciones

| Defecto | Corrección y nueva comprobación |
| --- | --- |
| Rutas genéricas de comunidad podían devolver datos ajenos. | Listado limitado a membresías propias y detalle con autorización. API aislamiento pasó. |
| Instalación no incluía dependencias nativas opcionales para Linux. | Bloqueo regenerado desde un directorio sin dependencias. Instalación y build pasaron. |
| Datos modificados en CMS no tenían actualización explícita en UI. | Botón Actualizar comunidad recarga el contexto. Caso DATA-01 pasó. |
| Paneles móviles sin gestión modal de foco. | Diálogos Radix, Tab y Escape comprobados. UI-02 pasó. |
| Mensajes sin espacios podían ensanchar la vista. | Ajuste de palabras y ancho mínimo cero. UI-01 pasó con el límite de caracteres. |
| Documentación de template describía todavía un chat ficticio. | T-04 e informe actualizados con cambios y capturas actuales. |

## Capturas

- [Escritorio](assets/community-hub-1440.png)
- [Tablet](assets/community-hub-768.png)
- [Teléfono](assets/community-hub-375.png)
- [Miembros en teléfono](assets/community-hub-miembros-mobile.png)
- [Template original](assets/template-original.png)

Las capturas contienen únicamente datos ficticios. Los límites funcionales del
prototipo (polling, historial, sesión local e imágenes opcionales) están en
[el informe](INFORME-TP2.md). El acceso docente y la exposición en vivo deben
completarse por el equipo según la organización de la cátedra.
