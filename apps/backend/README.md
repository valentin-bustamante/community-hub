# Backend

API de Community Hub, hecha con Strapi 5 y SQLite.

## Levantar

Desde la raíz del repositorio:

```sh
npm run setup
npm run dev:backend
```

El script genera secretos aleatorios y conserva una configuración existente. El admin queda en http://localhost:1337/admin.

## Modelos

| Modelo | Campos |
| --- | --- |
| Comunidad | `nombre`, `codigoInvitacion` (privado), `icono` |
| Canal | `nombre`, pertenece a una comunidad |
| Mensaje | `contenido`, pertenece a un canal y a un usuario |
| Membresia | `rol` (`propietario`, `administrador`, `miembro`), une un usuario con una comunidad |

## Endpoints

Todos requieren el header `Authorization: Bearer <jwt>`. El token se obtiene con `POST /api/auth/local` o `POST /api/auth/local/register`.

| Método y ruta | Qué hace | Quién puede |
| --- | --- | --- |
| `GET /api/comunidades` | Lista únicamente las comunidades propias, sin códigos de invitación | Usuario autenticado |
| `POST /api/comunidades` | Crea la comunidad, su canal `general` y la membresía de propietario | Cualquier usuario |
| `POST /api/comunidades/unirse` | Une al usuario con un código de invitación | Cualquier usuario |
| `GET /api/comunidades/:id` | Devuelve la comunidad, con el código de invitación | Miembros |
| `GET /api/membresias` | Lista las comunidades del usuario | Cualquier usuario |
| `GET /api/membresias?comunidad=:id` | Lista los miembros de la comunidad | Miembros |
| `PUT /api/membresias/:id` | Cambia el rol de un miembro | Propietario |
| `DELETE /api/membresias/:id` | Sale de la comunidad o expulsa a un miembro | El propio miembro o el propietario |
| `GET /api/canales?comunidad=:id` | Lista los canales | Miembros |
| `POST /api/canales` | Crea un canal | Propietario |
| `PUT /api/canales/:id` | Renombra un canal | Propietario |
| `DELETE /api/canales/:id` | Borra un canal y sus mensajes | Propietario |
| `GET /api/mensajes?canal=:id` | Devuelve los últimos 50 mensajes; con `&desde=<fecha>`, solo los posteriores | Miembros |
| `POST /api/mensajes` | Envía un mensaje al canal | Miembros |

Los `:id` son el `documentId` de cada registro.

Ejemplos de cuerpo:

```json
{ "data": { "nombre": "Mi comunidad" } }
```

```json
{ "codigoInvitacion": "A1B2C3D4E5F6" }
```

```json
{ "data": { "contenido": "Hola", "canal": "<documentId del canal>" } }
```

## Errores

| Estado | Caso |
| --- | --- |
| `400` | Faltan datos o no son válidos |
| `401` | No hay sesión o el token venció |
| `403` | El usuario no pertenece a la comunidad o su rol no alcanza |
| `404` | El recurso no existe |
| `409` | Conflicto: ya es miembro, nombre de canal repetido, último canal o propietario que intenta salir |

## Permisos

Los permisos del rol **Authenticated** se cargan al iniciar Strapi, desde `src/index.ts`. No hay que configurarlos en el panel. Para habilitar una acción nueva, se agrega a esa lista.

El control por comunidad y por rol está en los controladores de `src/api/`.

## Validación

Desde la raíz, ejecutar `npm run build` y `npm run verify:api`. La verificación
inicia una base descartable y comprueba los controles de acceso sin modificar
los datos de la instalación local. Los modelos de blog de ejemplo del
generador se eliminaron; solo se conservan las entidades del dominio.
