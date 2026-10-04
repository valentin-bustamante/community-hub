# Pruebas funcionales — T-16

Rehice la matriz sobre la versión actual de la aplicación. Las pruebas se
hicieron con cuentas descartables y una base SQLite aislada; no guardé
contraseñas, tokens ni códigos de invitación. Los casos no ejecutados quedan
marcados como pendientes, aunque la inspección del código sugiera que deberían
funcionar.

## Entorno

| Elemento | Configuración |
| --- | --- |
| Frontend | Next.js 16.3.8, `http://localhost:3000` |
| CMS | Strapi 5.55.1, `http://localhost:1337` |
| Node.js | 24.15.0 |
| Base de datos | SQLite aislada en `apps/backend/.tmp`; eliminada al terminar |
| Navegador | Navegador integrado, viewport emulado de 375 × 812 px |
| Fecha | 2026-10-04 |

## Casos

| ID | Recorrido | Resultado esperado | Resultado |
| --- | --- | --- | --- |
| AUTH-01 | Abrir `/` sin sesión. | Ir a `/login` sin mostrar información privada. | Pendiente en esta ejecución. |
| AUTH-02 | Registrar dos cuentas e iniciar sesión con ambas. | El registro y el acceso abren la aplicación. | Pasó en las dos cuentas. |
| AUTH-03 | Iniciar sesión con una contraseña incorrecta. | Mostrar un error y no iniciar sesión. | Pasó; el mensaje de Strapi aparece en inglés: `Invalid identifier or password`. |
| AUTH-04 | Cerrar sesión desde el menú del usuario. | Borrar la sesión y volver a `/login`. | Pasó. |
| AUTH-05 | Reemplazar el JWT por uno inválido y solicitar canales. | Strapi responde `401`, la sesión se borra y se vuelve a `/login`. | Pasó; se observaron las respuestas `401` y la redirección. |
| AUTH-06 | Consultar `/api/membresias` sin JWT. | El CMS rechaza el pedido privado. | Pasó; respondió `403`. |
| COM-01 | Crear una comunidad con la primera cuenta. | La comunidad queda seleccionada, con canal `general` y rol de propietaria. | Pasó desde la interfaz. |
| COM-02 | Registrar una cuenta que todavía no pertenece a comunidades. | Mostrar el estado vacío y no listar comunidades ajenas. | Pasó; antes de unirse, la lista estaba vacía. |
| COM-03 | Unirse desde la segunda cuenta con el código de invitación. | Mostrar la comunidad y el rol de miembro. | Pasó desde la interfaz. |
| COM-04 | Consultar recursos de una comunidad desde una cuenta ajena con sesión válida. | Denegar el acceso y no filtrar datos. | Pasó; una cuenta registrada sin membresía obtuvo `403` en canales, integrantes y mensajes, y su lista propia de membresías quedó vacía. |
| CAN-01 | Crear un segundo canal y cambiar entre `general` y ese canal. | Actualizar encabezado, lista activa e historial según el canal. | Pasó; el canal vacío mostró su propio estado y `general` conservó su mensaje. |
| CAN-02 | Cambiar entre dos comunidades con canales distintos. | No conservar canales ni mensajes de otra comunidad. | Pendiente; esta ejecución usó una sola comunidad. |
| CAN-03 | Comparar las acciones de canales para propietaria y miembro. | Solo permitir administración a quien tenga permiso. | Pasó en la interfaz y en la API; la miembro no vio el control para crear canales y sus intentos de crear un canal o cambiar un rol respondieron `403`. |
| MEM-01 | Revisar el panel con propietaria y miembro. | Mostrar integrantes y sus roles para la comunidad activa. | Pasó; se vieron los dos roles y las dos cuentas. |
| MEM-02 | Dar y quitar el rol de administrador desde la cuenta propietaria. | Actualizar la agrupación y las acciones disponibles. | Pasó; el cambio en ambos sentidos se reflejó en el panel. |
| MSG-01 | Enviar mensajes de 3000 y 3001 caracteres. | Aceptar el máximo definido y rechazar el exceso. | Pasó; el mensaje de 3000 caracteres respondió `201` y el de 3001 respondió `400`. |
| DATA-01 | Editar datos desde el panel de administración de Strapi y volver a Next.js. | La interfaz refleja los cambios del CMS. | Parcial; cambié el nombre en el panel y la API autenticada devolvió el dato nuevo. No alcancé a comprobar el cambio en una vista de Next.js antes de cerrar el entorno temporal. |
| DATA-02 | Probar campos opcionales, contenido en el límite y colecciones vacías. | Manejar datos largos y vacíos sin errores bloqueantes. | Parcial; el canal vacío y el límite de mensaje funcionaron. No recorrí todos los campos opcionales. |
| NET-01 | Detener Strapi mientras se consulta una invitación y se actualizan mensajes. | Informar el error y no presentar una respuesta como exitosa. | Pasó; ambos pedidos mostraron el error de conexión. |
| UI-01 | Revisar navegación y contenido a 375 × 812, 768 × 900 y 1440 × 900 px. | No desbordar horizontalmente; mantener accesibles navegación y miembros. | Pasó en la versión de trabajo anterior al merge de #38; `document.documentElement.scrollWidth` y `document.body.scrollWidth` coincidieron con el viewport en los tres tamaños. En móvil abrí el selector de comunidades y el diálogo de integrantes. |
| UI-02 | Revisar carga, error, estado vacío y accesibilidad con teclado. | Mostrar estados claros y permitir recorrer controles con teclado. | Parcial; vi estados de carga, error y canal vacío. No hice el recorrido completo de teclado ni probé el panel de miembros vacío. |

## Validaciones ejecutadas

- `npm ci --offline --no-audit --no-fund` — pasó; instaló las dependencias
  desde la caché local.
- `npm run lint --workspace=frontend -- src/components/sidebar/app-sidebar.tsx src/components/miembros-panel.tsx src/components/comunidad-view.tsx src/components/home.tsx src/components/canal-chat.tsx` — pasó.
- `npm run build --workspace=frontend` — pasó; compilación de producción y
  verificación de TypeScript completas.
- `npm run build` — pasó después de integrar T-14 y el PR #38; compiló Strapi
  y el frontend.
- `curl.exe -sS -o NUL -w 'GET /api/membresias without JWT: HTTP %{http_code}\n' 'http://127.0.0.1:1337/api/membresias'` — respondió HTTP `403`.
- Con tokens de cuentas de prueba no incluidos en el repositorio, la API respondió `403` a una cuenta sin membresía al consultar canales, integrantes y mensajes; la miembro recibió `403` al intentar crear canales o cambiar roles.
- La API aceptó un mensaje de 3000 caracteres (`201`) y rechazó uno de 3001 (`400`).
- Después de editar el nombre de un canal en `/admin`, la consulta autenticada de canales devolvió el nombre editado.
- `git diff --check` — pasó.
- No ejecuté `npm test`: el frontend no tiene un runner de pruebas configurado.

## Pendientes antes de cerrar

- Probar el cambio entre dos comunidades, confirmar en la interfaz un dato
  editado desde el CMS y completar la revisión de campos opcionales y
  navegación por teclado.
- Revisar los avisos de consola del panel de Strapi y validar el panel de
  miembros sin integrantes.
- El arreglo responsive se incluye en T-14. El issue #15 figura cerrado en
  GitHub; esta rama no modifica su estado.
- Adjuntar capturas de los recorridos cuando se prepare la entrega.

La base temporal y las cuentas de prueba se descartaron al terminar. No guardé
datos de acceso ni secretos en el repositorio.
