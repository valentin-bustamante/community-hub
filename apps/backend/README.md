# Community Hub API

## Crear una comunidad

`POST /api/comunidades`

Requiere un JWT de usuario de la aplicación:

```http
Authorization: Bearer <jwt>
Content-Type: application/json
```

```json
{
  "data": {
    "nombre": "Mi comunidad"
  }
}
```

El backend genera el código de invitación y crea, en una transacción, el canal
`general` y la membresía `propietario` para el usuario autenticado. El cliente
no debe enviar relaciones, membresías, canales ni un código de invitación.
La respuesta incluye la comunidad creada y el código que el propietario puede
compartir.

## Unirse mediante código de invitación

`POST /api/comunidades/unirse`

Requiere el JWT del usuario que desea unirse:

```http
Authorization: Bearer <jwt>
Content-Type: application/json
```

```json
{
  "codigoInvitacion": "A1B2C3D4E5F6"
}
```

El código se normaliza a mayúsculas y espacios exteriores se eliminan. Una
solicitud válida crea la membresía con el rol `miembro` y responde con el
identificador y nombre de la comunidad.

## Consultas autenticadas de comunidades, canales y membresías

Todas estas rutas requieren el JWT del usuario de la aplicación en el header
`Authorization: Bearer <jwt>`. No se debe enviar un token de administrador ni
un token de API al navegador.

| Método y ruta | Resultado |
| --- | --- |
| `GET /api/membresias` | Membresías y comunidades del usuario autenticado. |
| `GET /api/membresias?comunidad=<documentId>` | Miembros de la comunidad; requiere pertenecer a ella. |
| `GET /api/canales?comunidad=<documentId>` | Canales de la comunidad; requiere pertenecer a ella. |
| `GET /api/membresias/<documentId>` | Una membresía de una comunidad a la que pertenece el usuario. |
| `GET /api/canales/<documentId>` | Un canal de una comunidad a la que pertenece el usuario. |
| `GET /api/comunidades/<documentId>` | La comunidad; el código de invitación se incluye solo para sus miembros. |

Las acciones de canales y membresías comprueban la pertenencia y el rol en el
controlador. Crear, editar o eliminar canales y transferir la propiedad requiere
ser propietario; eliminar membresías permite salir de la comunidad o, al
propietario, expulsar a otra persona. El propietario no puede salir sin
transferir antes el rol. Las membresías se crean desde los flujos de creación
de comunidad o unión por invitación, no con una operación genérica del cliente.

Las respuestas usan el envelope de Strapi 5 `{ "data": [...] }` para
colecciones y `{ "data": { ... } }` para un recurso. Cada comunidad, canal o
membresía incluye `id` y `documentId`; las comunidades incluyen `nombre`, los
canales `nombre` y las membresías `rol` y su relación `comunidad`. La lista de
miembros de una comunidad también incluye `usuario` con su `id` y `username`.

Durante el arranque, `src/index.ts` agrega al rol **Authenticated** las acciones
de lectura necesarias y las operaciones que validan permisos en esos
controladores. No hace falta asignar tokens de API ni activar manualmente esas
acciones en el panel. El frontend consulta con el JWT de la sesión y desactiva
la caché (`no-store`) para no reutilizar datos privados entre usuarios.

## Respuestas de error

Además de los errores de creación y unión documentados arriba, las consultas
pueden responder `401` sin sesión, `403` si el usuario no pertenece a la
comunidad, `404` si no existe y `409` cuando la operación entra en conflicto
con las reglas de roles o canales.

## Respuestas de error

| Estado | Caso |
| --- | --- |
| `400` | Falta el nombre de la comunidad o el código de invitación. |
| `401` / `403` | No se autenticó el usuario o la acción no está permitida para su rol. |
| `404` | El código no corresponde a una comunidad. |
| `409` | El usuario ya pertenece a esa comunidad. |