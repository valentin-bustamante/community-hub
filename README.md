# Community Hub

Chat por comunidades, hecho con Strapi y Next.js. Trabajo Práctico 2 de Frameworks e Interoperabilidad.

- [Tablero](https://github.com/users/valentin-bustamante/projects/1)
- [Issues](https://github.com/valentin-bustamante/community-hub/issues)

## Qué hace

- Registro e inicio de sesión.
- Crear comunidades y unirse con un código de invitación.
- Canales de texto dentro de cada comunidad.
- Mensajes en cada canal.
- Roles por comunidad: propietario, administrador y miembro.

## Stack

| Parte | Tecnología |
| --- | --- |
| Backend | Strapi 5, SQLite |
| Frontend | Next.js 16, React 19, Tailwind, shadcn/ui |
| Repositorio | npm workspaces |

## Cómo levantarlo

Requiere Node.js 20 o superior.

```sh
npm install
cp apps/backend/.env.example apps/backend/.env
```

En `apps/backend/.env`, reemplazá cada `tobemodified` por un texto aleatorio. Después:

```sh
npm run dev
```

- Frontend: http://localhost:3000
- Admin de Strapi: http://localhost:1337/admin (la primera vez pide crear un usuario administrador)

La base de datos es local: cada integrante arranca con la suya, vacía. Los permisos de la API se configuran solos al iniciar Strapi.

## Estructura

```text
apps/
├── backend/    Strapi: modelos, API y permisos
└── frontend/   Next.js: interfaz
docs/           Pruebas y documentación
```

Más detalle en [apps/backend/README.md](apps/backend/README.md) y [apps/frontend/README.md](apps/frontend/README.md).

## Cómo colaborar

1. Asignate el issue y creá una rama desde `main`: `feat/T-XX-descripcion`, `fix/T-XX-descripcion` o `chore/T-XX-descripcion`.
2. Abrí un PR hacia `main` con `Closes #<número del issue>`.
3. Pedí revisión a otro integrante antes de mergear.

No subas `.env`, `node_modules` ni la base de datos.
