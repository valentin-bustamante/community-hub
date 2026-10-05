# Frontend

Interfaz de Community Hub, hecha con Next.js, Tailwind y shadcn/ui.

## Levantar

Desde la raíz del repositorio, con Strapi ya iniciado:

```sh
npm run dev:frontend
```

Queda en http://localhost:3000.

Si Strapi no está en `http://localhost:1337`, copiá `.env.example` a `.env.local` y cambiá `NEXT_PUBLIC_STRAPI_URL`.

## Estructura

| Carpeta | Contenido |
| --- | --- |
| `src/app` | Rutas: `/`, `/login`, `/registro` |
| `src/components` | Pantallas y piezas de la interfaz |
| `src/components/sidebar` | Barra lateral de comunidades y canales |
| `src/components/ui` | Componentes de shadcn/ui |
| `src/lib` | Llamadas a la API de Strapi |

## Acceso a la API

Los pedidos autenticados pasan por `src/lib/strapi.ts`, que agrega el token de la sesión y traduce los errores. `comunidades.ts` y `mensajes.ts` lo usan para cada parte de la API. El login y el registro están en `auth.ts`.

La sesión se guarda en `localStorage`. Si el token vence, se cierra la sesión y se vuelve al login.

La vista principal y sus diferencias respecto del template están descritas en
[`docs/T-14-vista-principal.md`](../../docs/T-14-vista-principal.md).

El botón **Actualizar comunidad** vuelve a consultar comunidades, canales,
roles, miembros y mensajes. Usarlo después de guardar una edición en el CMS.

Los paneles móviles usan diálogos de Radix para gestionar el foco, recorrer
controles con Tab y cerrar con Escape. `npm run verify` desde la raíz valida
los recorridos con Playwright sobre el frontend de producción.
