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

## Permisos de Strapi

En **Settings → Users & Permissions → Roles → Authenticated**, habilitar solo
las acciones necesarias:

- `Comunidad.create` para crear comunidades.
- `Comunidad.join` para unirse con invitación.

La ruta de unión es una acción personalizada del controlador de comunidades.
No habilitar operaciones de gestión de membresías para el cliente como
consecuencia de estos permisos. Los permisos configurados en el panel se
guardan en la base de datos local y cada integrante debe configurarlos en su
instancia.

## Respuestas de error

| Estado | Caso |
| --- | --- |
| `400` | Falta el nombre de la comunidad o el código de invitación. |
| `401` / `403` | No se autenticó el usuario o la acción no está permitida para su rol. |
| `404` | El código no corresponde a una comunidad. |
| `409` | El usuario ya pertenece a esa comunidad. |