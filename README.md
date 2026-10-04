# Community Hub

**Trabajo Práctico 2 — Frameworks e Interoperabilidad**

Community Hub es una aplicación web de comunidades con canales de texto,
mensajes y membresías. Combina un frontend en Next.js con un CMS Strapi que
expone una API protegida. Este repositorio reúne el código, las instrucciones
para ejecutarlo y la documentación técnica y de validación para la entrega.

## Resumen

El proyecto adapta una interfaz de chat de referencia a una aplicación en la
que cada usuario puede crear comunidades, invitar a otras personas, organizar
conversaciones en canales y administrar las membresías. Strapi conserva los
datos y aplica las reglas de acceso; Next.js presenta el contexto activo,
consume la API autenticada y actualiza la experiencia de usuario.

La aplicación cubre autenticación, comunidades, canales, mensajes y roles de
propietario, administrador y miembro. La estructura de navegación y el panel
de integrantes se ajustan al tamaño de pantalla. La validación funcional se
registra por recorrido, con los resultados observados y las limitaciones que
siguen abiertas.

## Objetivos

- Integrar un frontend React/Next.js con un CMS headless y su API.
- Modelar comunidades, canales, mensajes y membresías con sus relaciones.
- Aplicar autenticación y autorización en el servidor, según la pertenencia y
  el rol del usuario.
- Adaptar el template de referencia y reemplazar los datos de demostración por
  información persistida en Strapi.
- Documentar las decisiones de implementación y verificar los recorridos
  principales con datos de prueba aislados.

## Funcionalidades

- Registro, inicio y cierre de sesión.
- Creación de comunidades y unión mediante código de invitación.
- Canales por comunidad, con acciones de administración para el propietario.
- Historial y envío de mensajes de texto por canal.
- Listado de integrantes y cambio de roles o expulsión por parte del
  propietario.
- Estados de carga, error y colección vacía en las vistas integradas.
- Navegación adaptable: selector de comunidades y panel de integrantes en
  pantallas angostas; navegación y panel lateral en pantallas grandes.

## Arquitectura

```text
Navegador
   │
   ├── Next.js / React
   │     ├── autenticación y sesión de interfaz
   │     ├── comunidades, canales, mensajes y miembros
   │     └── cliente HTTP autenticado
   │
   └── Strapi 5
         ├── API REST y controladores de dominio
         ├── Users & Permissions y autorización por membresía
         └── SQLite local
```

El frontend envía el JWT de la sesión como `Authorization: Bearer …` en las
consultas protegidas. El backend identifica al usuario desde ese token y
comprueba su membresía antes de devolver canales, mensajes o integrantes.
Ocultar una acción en la interfaz mejora la experiencia, pero no reemplaza
esa verificación en Strapi.

### Modelo de datos

| Entidad | Datos principales | Relación |
| --- | --- | --- |
| Comunidad | Nombre, código de invitación privado e icono opcional | Tiene canales y membresías |
| Canal | Nombre de hasta 20 caracteres | Pertenece a una comunidad y contiene mensajes |
| Mensaje | Contenido de 1 a 3000 caracteres y fecha de creación | Pertenece a un canal y a un usuario |
| Membresía | Rol: `propietario`, `administrador` o `miembro` | Vincula un usuario con una comunidad |
| Usuario | Identidad gestionada por el plugin Users & Permissions | Puede tener membresías y enviar mensajes |

Las comunidades requieren un nombre de entre 5 y 30 caracteres. Al crear una,
Strapi genera el código de invitación, un canal `general` y la membresía de
propietario. Los códigos son privados y se entregan solo mediante el endpoint
autorizado de invitación.

### Permisos principales

| Acción | Regla |
| --- | --- |
| Consultar comunidades propias | Usuario autenticado; la respuesta contiene solo sus membresías |
| Unirse a una comunidad | Usuario autenticado con un código válido |
| Leer canales, mensajes o integrantes | Requiere pertenecer a la comunidad correspondiente |
| Enviar mensajes | Requiere pertenecer a la comunidad del canal |
| Crear, renombrar o eliminar canales | Propietario de la comunidad |
| Cambiar roles o expulsar integrantes | Propietario de la comunidad |
| Salir de una comunidad | El propio miembro; el propietario debe transferir primero la propiedad |

Strapi carga los permisos del rol `Authenticated` al iniciar. Los controladores
de dominio aplican además la autorización por recurso y por comunidad.

## Tecnologías

| Área | Tecnología |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript |
| Interfaz | Tailwind CSS, shadcn/ui, Radix UI, Lucide |
| CMS y API | Strapi 5, TypeScript, Users & Permissions |
| Persistencia local | SQLite mediante `better-sqlite3` |
| Organización | Monorepo npm workspaces |

## Requisitos

- Node.js 20.9 o superior, dentro del rango admitido por Strapi (`<=26.x`).
- npm.
- Git para clonar el repositorio.

La base SQLite es local y comienza vacía. Para uso académico o de desarrollo,
cada instalación mantiene sus propios datos; no se sincronizan entre clones.

## Instalación y ejecución

Desde la raíz del repositorio:

```sh
npm ci
```

Crear el archivo de entorno del backend. En Windows PowerShell:

```powershell
Copy-Item apps/backend/.env.example apps/backend/.env
```

En macOS o Linux:

```sh
cp apps/backend/.env.example apps/backend/.env
```

Reemplazar los valores de ejemplo de `APP_KEYS`, `API_TOKEN_SALT`,
`ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET` y `ENCRYPTION_KEY` por
valores aleatorios propios. No usar los valores de ejemplo en un entorno
compartido o publicado, ni subir el archivo `.env` al repositorio.

Iniciar Strapi y Next.js juntos:

```sh
npm run dev
```

| Servicio | Dirección |
| --- | --- |
| Aplicación web | <http://localhost:3000> |
| API y administración de Strapi | <http://localhost:1337> |
| Panel de administración | <http://localhost:1337/admin> |

La primera vez, Strapi solicita crear el usuario administrador del CMS. La
aplicación registra usuarios desde sus pantallas de `/registro` e
`/login`; son cuentas distintas del administrador de Strapi.

Para iniciar cada servicio por separado:

```sh
npm run dev:backend
npm run dev:frontend
```

Si Strapi usa otra URL, copiar `apps/frontend/.env.example` a
`apps/frontend/.env.local` y actualizar `NEXT_PUBLIC_STRAPI_URL`.

## Comprobaciones

Lint de los componentes frontend modificados:

```sh
npm run lint --workspace=frontend -- src/components/sidebar/app-sidebar.tsx src/components/miembros-panel.tsx src/components/comunidad-view.tsx src/components/home.tsx src/components/canal-chat.tsx
```

Compilación de producción y verificación de tipos del frontend:

```sh
npm run build --workspace=frontend
```

Compilación de todos los workspaces:

```sh
npm run build
```

No hay un runner automatizado de pruebas funcionales configurado para el
frontend. Los recorridos manuales y su resultado se registran en
[`docs/T-16-pruebas-funcionales.md`](docs/T-16-pruebas-funcionales.md). Esa
matriz separa los casos que pasaron de aquellos pendientes y detalla el
entorno de ejecución.

## Documentación de la entrega

- [Origen, estructura y capturas del template de referencia](docs/T-04-template-original.md)
- [Adaptación y validación de la vista principal](docs/T-14-vista-principal.md)
- [Matriz de pruebas funcionales y resultados](docs/T-16-pruebas-funcionales.md)
- [Instrucciones específicas del frontend](apps/frontend/README.md)
- [Modelos, endpoints y permisos del backend](apps/backend/README.md)
- [Tablero del proyecto](https://github.com/users/valentin-bustamante/projects/1)
- [Issues, alcance y criterios de aceptación](https://github.com/valentin-bustamante/community-hub/issues)

### Referencia del template

El punto de partida documentado es `chat-template`, variante `whatsapp-mock`,
atribuido a Manoj (`rayimanoj8`) en 21st.dev. La documentación del template
registra la atribución y la licencia indicada, aclara que la ficha original ya
no está disponible y conserva capturas históricas del snapshot previo a la
adaptación. No se redistribuyen fotografías de avatares externos. El detalle y
las fuentes consultadas están en
[`docs/T-04-template-original.md`](docs/T-04-template-original.md).

## Decisiones y límites conocidos

- **JWT en `localStorage`:** la interfaz guarda el token y el nombre de usuario
  en el navegador. Las consultas protegidas no se cachean; una respuesta `401`
  limpia la sesión y vuelve al inicio de sesión. Esta decisión permite la
  integración directa con la API, pero hace importante evitar scripts
  inyectados y no guardar tokens en logs o capturas.
- **Autorización en Strapi:** la pertenencia y los permisos por rol se
  verifican en los controladores del backend; el estado visual del frontend
  no se considera un control de seguridad.
- **Actualización de mensajes:** el historial inicial devuelve hasta 50
  mensajes y el cliente consulta mensajes nuevos cada tres segundos. No se usa
  una conexión de tiempo real.
- **Datos de desarrollo:** la instalación usa SQLite local. No incluye
  sincronización, despliegue ni configuración de una base de producción.
- **Pruebas manuales:** el informe indica exactamente qué casos se ejecutaron.
  No se presenta como cobertura automatizada ni se marca como pasada una
  prueba que no se observó.

## Estructura del repositorio

```text
apps/
├── backend/                 # Strapi, API, modelos y permisos
└── frontend/                # Next.js, pantallas y cliente de API
docs/
├── assets/                  # Capturas históricas del template
├── T-04-template-original.md
├── T-14-vista-principal.md
└── T-16-pruebas-funcionales.md
README.md                    # Guía y documentación principal de entrega
```

No subir `.env`, bases SQLite locales, `node_modules`, compilaciones ni datos
personales de prueba.
