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
| COM-04 | Consultar recursos de una comunidad desde una cuenta ajena con sesión válida. | Denegar el acceso y no filtrar datos. | Pendiente; no probé este caso con una cuenta válida ajena. |
| CAN-01 | Crear un segundo canal y cambiar entre `general` y ese canal. | Actualizar encabezado, lista activa e historial según el canal. | Pasó; el canal vacío mostró su propio estado y `general` conservó su mensaje. |
| CAN-02 | Cambiar entre dos comunidades con canales distintos. | No conservar canales ni mensajes de otra comunidad. | Pendiente; esta ejecución usó una sola comunidad. |
| CAN-03 | Comparar las acciones de canales para propietaria y miembro. | Solo mostrar administración a quien tenga permiso. | Pasó en la interfaz; la miembro no vio el control para crear canales. |
| MEM-01 | Revisar el panel con propietaria y miembro. | Mostrar integrantes y sus roles para la comunidad activa. | Pasó; se vieron los dos roles y las dos cuentas. |
| MEM-02 | Dar y quitar el rol de administrador desde la cuenta propietaria. | Actualizar la agrupación y las acciones disponibles. | Pasó; el cambio en ambos sentidos se reflejó en el panel. |
| MSG-01 | Enviar un mensaje largo en un canal y volver a ese canal. | Guardar y mostrar el texto en el historial correcto. | Pasó para el texto probado; falta probar el límite máximo. |
| DATA-01 | Editar datos desde el panel de administración de Strapi y volver a Next.js. | La interfaz refleja los cambios del CMS. | Pendiente; no abrí el panel de administración. |
| DATA-02 | Probar campos opcionales, contenido en el límite y colecciones vacías. | Manejar datos largos y vacíos sin errores bloqueantes. | Parcial; el canal vacío y un mensaje largo funcionaron; campos opcionales y límite pendientes. |
| NET-01 | Detener Strapi mientras se consulta una invitación y se actualizan mensajes. | Informar el error y no presentar una respuesta como exitosa. | Pasó; ambos pedidos mostraron el error de conexión. |
| UI-01 | Revisar navegación y contenido a 375 × 812 px. | No desbordar horizontalmente ni recortar contenido. | Falló; el ancho del documento llegó a 448 px. Lo dejo para #15, abierta y asignada a otra persona. |
| UI-02 | Revisar carga, error, estado vacío y accesibilidad con teclado. | Mostrar estados claros y permitir recorrer controles con teclado. | Parcial; vi estados de carga, error y canal vacío. No hice el recorrido completo de teclado ni probé el panel de miembros vacío. |

## Validaciones ejecutadas

- `npm ci --offline --no-audit --no-fund` — pasó; instaló las dependencias
  desde la caché local.
- `npm run lint --workspace=frontend -- src/components/home.tsx src/components/comunidad-view.tsx src/components/miembros-panel.tsx src/components/canal-chat.tsx` — pasó.
- `npm run build --workspace=frontend` — pasó; compilación de producción y
  verificación de TypeScript completas.
- `curl.exe -sS -o NUL -w 'GET /api/membresias without JWT: HTTP %{http_code}\n' 'http://127.0.0.1:1337/api/membresias'` — respondió HTTP `403`.
- `git diff --check` — pasó.
- No ejecuté `npm test`: el frontend no tiene un runner de pruebas configurado.

## Pendientes antes de cerrar

- Repetir los casos de aislamiento entre comunidades y editar un dato desde el
  panel de Strapi.
- Probar el límite de contenido y los campos opcionales.
- Completar la revisión de teclado, consola y tamaños responsive. La prueba a
  375 px encontró desbordamiento horizontal; #15 sigue abierta y está asignada
  a otra persona.
- Adjuntar capturas de los recorridos cuando se prepare la entrega.

La base temporal y las cuentas de prueba se descartaron al terminar. No guardé
datos de acceso ni secretos en el repositorio.
