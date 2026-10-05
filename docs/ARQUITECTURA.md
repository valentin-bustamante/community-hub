# Arquitectura y mantenimiento

Esta documentación describe el código del repositorio. El informe académico
y la presentación se preparan por separado.

## Responsabilidades

| Ubicación | Responsabilidad |
| --- | --- |
| `apps/frontend/src/app` | Rutas de Next.js, layout y estilos compartidos |
| `apps/frontend/src/components` | Formularios, navegación y vistas del dominio |
| `apps/frontend/src/components/ui` | Primitivas de interfaz basadas en shadcn/Radix |
| `apps/frontend/src/lib` | Sesión, cliente HTTP, contratos y lectura de respuestas |
| `apps/backend/src/api` | Modelos, rutas, controladores y servicios de Strapi |
| `apps/backend/src/extensions/users-permissions` | Relaciones del usuario con el dominio |
| `apps/backend/src/index.ts` | Permisos iniciales del rol autenticado |
| `scripts` | Generación de entorno y verificación aislada |
| `tests` | Recorridos de API y navegador con datos descartables |

Los servicios generados por Strapi se conservan porque forman parte de la
estructura de cada API. Los tipos de `apps/backend/types/generated` describen
los modelos y permiten compilar sus identificadores. No son datos de ejecución.
Los archivos de configuración y las primitivas visuales se mantienen donde
los espera cada framework, evitando una segunda implementación del template.

## Modelo y reglas

Una comunidad agrupa canales y membresías. Cada membresía relaciona un usuario
con una comunidad y un rol. Cada mensaje pertenece a un canal y a un usuario.
Los esquemas están en `src/api/<entidad>/content-types/<entidad>/schema.json`.
El `documentId` identifica recursos en la API; el `id` numérico se utiliza en
las relaciones de las consultas internas.

Crear una comunidad desde la API genera, dentro de una transacción, su código,
el canal `general` y una membresía de propietario. Unirse comprueba el código
y la membresía existente. El propietario administra canales y miembros.
La transferencia de propiedad cambia las dos membresías en una transacción;
la eliminación de un canal elimina también sus mensajes.

El control de acceso se aplica en dos niveles: permisos de Users & Permissions
y autorización del controlador sobre la comunidad concreta. El autor del
mensaje se toma de `ctx.state.user`. Las respuestas seleccionan campos del
dominio y no exponen correos, contraseñas ni hashes de otros integrantes.

Los contratos, cuerpos de las solicitudes y estados HTTP están en el
[README del backend](../apps/backend/README.md).

## Decisiones de implementación

- **Monorepo:** npm workspaces permite instalar ambos servicios con un único
  bloqueo y ejecutar sus comandos desde la raíz.
- **Next.js:** organiza rutas y componentes React. La integración con Strapi
  sucede desde componentes de cliente autenticados; no se comparte la sesión
  de administración del CMS.
- **Strapi:** administra el modelo y Content Manager. Los controladores de
  dominio agregan pertenencia, roles y operaciones coordinadas.
- **SQLite:** facilita una instalación local sin configurar un servidor de
  datos. Los archivos de base pertenecen a cada instalación y se excluyen de Git.
- **Contratos de cliente:** `comunidades.ts` y `mensajes.ts` validan los campos
  recibidos; `strapi.ts` concentra JWT, errores HTTP y respuestas sin caché.
- **Estado de pantalla:** `Home` conserva la selección y las cargas por
  comunidad. Ignora respuestas de consultas anteriores y reinicia las vistas
  al actualizar. `CanalChat` conserva el historial del canal montado y consulta
  mensajes nuevos cada tres segundos.
- **Interfaz adaptable:** Tailwind controla la distribución. Radix gestiona
  foco, teclado y cierre de los diálogos móviles; Lucide aporta iconos.

## Límites del alcance

- El rol administrador se distingue visualmente; los controles de gestión se
  reservan al propietario. La transferencia y la salida voluntaria están en
  la API, sin acciones dedicadas en la UI.
- El historial inicial y cada consulta incremental devuelven hasta 50 mensajes.
  No hay paginación histórica ni garantía de recuperar una ráfaga mayor a 50
  entre consultas. No se usa WebSocket.
- El JWT se conserva en `localStorage`; una respuesta 401 elimina la sesión.
  La expiración se detecta al consultar la API.
- El icono del modelo Comunidad es opcional y la interfaz muestra iniciales.
- Content Manager opera por fuera de los controladores REST del dominio. Las
  ediciones manuales deben conservar relaciones y reglas; crear una comunidad
  allí no crea automáticamente canal y propietario. Usar **Actualizar comunidad**
  después de editar datos del CMS.
- Se documenta y verifica una instalación local. No se configura un servicio
  de producción, recuperación de contraseña por correo ni sincronización de bases.

## Cambiar una funcionalidad

1. Ajustar el esquema si cambia el modelo, iniciar Strapi y revisar los tipos
   generados antes de compilar.
2. Implementar la validación y la autorización en el controlador. Si aparece
   una acción nueva, registrar el permiso necesario en `src/index.ts`.
3. Ajustar el contrato del cliente HTTP y la vista correspondiente.
4. Documentar el endpoint o el límite afectado, y verificar el recorrido con
   `npm run lint`, `npm run build` y `npm run verify`.

El verificador fuerza SQLite y una base temporal independiente, aunque el
entorno local configure otro cliente. Solo admite servicios locales. Los casos
simulados se distinguen en [T-16](T-16-pruebas-funcionales.md). Para problemas de
arranque, revisar los logs en la carpeta temporal del sistema. No versionar
entornos, bases, builds, dependencias ni datos personales de prueba.
