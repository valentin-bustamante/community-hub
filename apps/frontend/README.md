# Frontend

Interfaz de Community Hub hecha con Next.js. Las solicitudes autenticadas a Strapi usan el JWT del usuario conectado; el frontend no necesita ni debe recibir tokens de API o de administrador.

## Configuración local

Desde la raíz del repositorio, instalá las dependencias y prepará la URL del CMS:

```powershell
npm install
Copy-Item apps/frontend/.env.example apps/frontend/.env.local
```

Si Strapi no está escuchando en `http://localhost:1337`, actualizá `NEXT_PUBLIC_STRAPI_URL` en `apps/frontend/.env.local`. Este valor es público y solo indica la URL del CMS; no pongas tokens ni credenciales en variables `NEXT_PUBLIC_*`.

Con Strapi iniciado en otra terminal, ejecutá Next.js:

```powershell
npm run dev:frontend
```

La interfaz queda disponible en `http://localhost:3000`. Para compilar:

```powershell
npm run build -w frontend
```

## Acceso a la API

Las llamadas autenticadas se centralizan en `src/lib/strapi.ts`: agregan el JWT de la sesión, interpretan los errores HTTP de Strapi y validan el formato de la respuesta. Las consultas usan `cache: "no-store"` para no reutilizar datos de una sesión o comunidad en otra.

`src/lib/comunidades.ts` expone las consultas de comunidades, canales y membresías. La vista principal consulta los canales de la comunidad seleccionada y permite cambiar el canal activo; la solicitud se vuelve a hacer al cambiar de comunidad y no se reutiliza desde caché. El endpoint de membresías devuelve las del usuario autenticado; al solicitar miembros o canales de una comunidad, el backend comprueba primero que el usuario pertenezca a ella. Los nombres de comunidades corresponden al modelo `Comunidad` que se usa como servidor en esta aplicación.

El rol **Authenticated** y las acciones habilitadas se configuran desde el backend durante el arranque. Consultá [la guía de la API](../backend/README.md) para ver endpoints y permisos. El frontend no usa tokens administrativos ni tokens de API de Strapi.
