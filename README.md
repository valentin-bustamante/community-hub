# Community Hub

Trabajo Práctico 2 de Framework e Interoperabilidad: aplicación web basada en Next.js, Strapi CMS y la adaptación de un template de chat.

## Objetivo y alcance

Administrar servidores, canales y membresías desde Strapi y presentarlos en una interfaz personalizada con Next.js. El desarrollo comprende T-01 a T-17 y [T-21 Autenticación](https://github.com/valentin-bustamante/community-hub/issues/22). T-18, T-19 y T-20 se gestionan fuera de este repositorio.

- [Tablero del TP2](https://github.com/users/valentin-bustamante/projects/1)
- [Issues y criterios de aceptación](https://github.com/valentin-bustamante/community-hub/issues)

## Estado del proyecto

Esta etapa prepara el repositorio y el flujo Git (T-01). El frontend se inicializa en T-02 y el CMS en T-05; todavía no hay una aplicación ejecutable ni comandos de instalación de dependencias para ejecutar aquí.

La referencia al diseño original y sus diferencias con la interfaz actual está en [docs/T-04-template-original.md](docs/T-04-template-original.md).

## Stack y organización prevista

| Componente | Tecnología / responsabilidad | Tarea |
| --- | --- | --- |
| Frontend | Next.js: rutas, componentes, navegación y consumo de datos | T-02 |
| CMS | Strapi: modelos Server, Channel y Membership y API | T-05 a T-09 |
| Autenticación | Inicio y cierre de sesión, identidad de usuario y permisos por membresía | T-21 (#22) |
| Interfaz | Template de chat, documentado antes de su adaptación | T-03, T-04, T-13 a T-15 |

Estructura acordada como punto de partida; las carpetas de aplicación se crearán al inicializar cada componente:

```text
community-hub/
├── frontend/                 # Next.js (T-02)
├── backend/                  # Strapi (T-05)
├── docs/                     # Template, decisiones y evidencia (T-04, T-16, T-17)
├── .github/
│   └── pull_request_template.md
├── .gitignore
└── README.md
```

Las versiones de Node.js, Next.js, Strapi, el gestor de paquetes y la base de datos se fijarán y documentarán al inicializar los proyectos, verificando su compatibilidad. Versionar el archivo de bloqueo del gestor elegido.

## Comenzar a colaborar

1. Tener Git instalado y acceso con la cuenta de GitHub acordada por el equipo.
2. Clonar el repositorio:

```sh
git clone https://github.com/valentin-bustamante/community-hub.git
cd community-hub
git status
```

3. Consultar el Issue, sus dependencias y criterios. Asignarse antes de comenzar y moverlo a **En progreso**.
4. Actualizar `main` y crear una rama por tarea:

```sh
git switch main
git pull --ff-only origin main
git switch -c feature/T-02-nextjs-setup
```

Usar `feature/T-XX-descripcion`, `fix/T-XX-descripcion` o `chore/T-XX-descripcion`. Mantener commits pequeños, por ejemplo `docs: documentar flujo Git (#1)`. Revisar `git diff` y `git status` antes de agregar archivos.

5. Subir la rama (`git push -u origin <rama>`) y abrir un PR hacia `main` con la plantilla del repositorio.
6. Incluir resumen, evidencia de validación y `Closes #<numero-del-issue>`. El número del Issue no debe deducirse del código T-XX: verificarlo en GitHub.
7. Solicitar revisión a otro integrante, resolver observaciones y hacer merge solo cuando se cumplan los criterios. Este acuerdo de trabajo no implica que existan reglas de protección de ramas configuradas.

## Kanban

| Estado | Uso |
| --- | --- |
| Backlog | Pendiente de preparación o con dependencias |
| Por hacer | Lista para comenzar |
| En progreso | Responsable trabajando en una rama |
| En revisión | PR preparado para revisión del equipo |
| Finalizado | Criterios verificados, cambio integrado e Issue cerrado |

Prioridad: **P0** base bloqueante, **P1** funcionalidad principal, **P2** mejoras y cierre. El Project dispone de responsables y PRs vinculados. Vincular un PR mueve el Issue a En revisión; si es un PR borrador, devolverlo manualmente a En progreso hasta estar listo. Cerrar el Issue lo mueve a Finalizado. No cerrar tareas solo por marcar sus casillas.

## Archivos locales y configuración

`.gitignore` excluye dependencias, compilaciones, cachés, logs, entornos locales y datos generados. No subir credenciales ni tokens. Documentar variables mediante `.env.example` con valores ficticios y copiarlo localmente cuando cada aplicación lo requiera.

Los archivos de bloqueo y las migraciones o esquemas deben versionarse. Los recursos de prueba intencionales se deben diferenciar de datos locales y subidas generadas por usuarios. `.gitignore` no elimina archivos ya versionados: revisar siempre el diff antes del commit.

## Validación y entrega

Cada PR debe explicar los pasos ejecutados y sus resultados. Para T-02 y T-05 se añadirán instrucciones reales de instalación, ejecución y compilación. Las pruebas funcionales integradas se documentarán en T-16.

Para cerrar T-01 falta que otro integrante revise el primer PR y confirme que puede clonar el repositorio y colaborar. El propietario debe comprobar también el acceso al Project privado; el acceso al repositorio no garantiza acceso al tablero.
