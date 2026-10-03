# Pruebas funcionales — T-16

Este documento registra los recorridos probados entre Next.js y Strapi. Se
usan cuentas y datos descartables en una base local aislada; no se guardan
contraseñas, tokens ni datos de usuarios reales.

## Entorno

| Elemento | Configuración |
| --- | --- |
| Frontend | Next.js, `http://localhost:3000` |
| CMS | Strapi, `http://localhost:1337` |
| Base de datos | SQLite local aislada para esta ejecución |
| Viewport revisado | 375 × 812 px |
| Fecha | 2026-10-03 |

Estados: **Pendiente**, **Pasó**, **Falló** o **Bloqueado**. Un caso solo se
marca como pasado después de observar el resultado, no por inspección del
código.

## Casos

| ID | Recorrido y pasos | Resultado esperado | Resultado |
| --- | --- | --- | --- |
| AUTH-01 | Abrir `/` sin sesión. | Se redirige a `/login` y no se muestra contenido privado. | Pasó; redirigió a `/login`. |
| AUTH-02 | Registrar dos cuentas de prueba e iniciar sesión. | El registro e inicio de sesión terminan correctamente y se abre la vista principal. | Pasó en ambas cuentas. |
| AUTH-03 | Intentar iniciar sesión con una contraseña incorrecta. | Se muestra un error comprensible y no se crea una sesión. | Pasó; Strapi muestra `Invalid identifier or password` en inglés. |
| AUTH-04 | Cerrar sesión desde el menú del usuario y volver a `/`. | Se borran los datos de sesión y se vuelve a `/login`. | Pasó; después de cerrar sesión `/` volvió a `/login`. |
| AUTH-05 | Consultar un endpoint privado sin JWT y con un JWT inválido. | La sesión inválida responde `401`, se borra y se vuelve a `/login`. | Pasó tras corregir el manejo de `401`. Sin JWT, Strapi respondió `403` por los permisos del rol público. |
| COM-01 | Crear una comunidad con la cuenta autenticada. | La comunidad aparece en la lista; se genera invitación, canal `general` y membresía propietaria. | Pasó desde Next.js y se verificaron el canal y el rol por API. |
| COM-02 | Consultar la lista de comunidades con una cuenta sin membresías. | La respuesta es una colección vacía y la interfaz muestra el estado vacío. | Pasó; API vacía y estado vacío visible. |
| COM-03 | Unirse a una comunidad desde una segunda cuenta usando un código válido. | La comunidad aparece para esa cuenta y su membresía tiene rol `miembro`. | Pasó desde Next.js. |
| COM-04 | Unirse con un código inexistente e intentar unirse de nuevo a una comunidad ya integrada. | El primer intento responde `404`; el duplicado responde `409`. | Pasó; ambos estados fueron comprobados por API. |
| CAN-01 | Consultar canales de una comunidad con una cuenta miembro y con una cuenta ajena. | Integrantes reciben sus canales; cuentas ajenas no acceden. | Pasó; integrantes `200`, ajeno `403`, sin JWT `403` y JWT inválido `401`. |
| CAN-02 | Crear, actualizar y eliminar un canal, con roles de propietario y miembro. | El propietario puede administrar canales; un miembro no puede hacerlo. | Pasó por API; también se rechazó un nombre vacío con `400`. |
| MEM-01 | Consultar las membresías propias y las de una comunidad con dos cuentas. | Cada cuenta ve solo sus comunidades; la lista de miembros solo se devuelve a integrantes. | Pasó; la cuenta ajena recibió lista propia vacía y `403` al consultar miembros. |
| MEM-02 | Intentar cambiar roles o quitar miembros con rol insuficiente y revocar una membresía. | Se rechazan cambios no autorizados y la revocación quita el acceso. | Pasó; miembro recibió `403`, revocación quitó acceso y volver a unirse lo restauró. |
| DATA-01 | Actualizar un canal y volver a consultarlo. | La nueva consulta refleja el dato actualizado. | Pasó por API. No se probó editar desde el panel de administración de Strapi. |
| DATA-02 | Probar valores opcionales, contenido largo y colecciones vacías. | No hay errores bloqueantes; los valores inválidos se rechazan con un mensaje entendible. | Parcial; colección vacía y nombre de canal inválido probados. Contenido largo y campos opcionales pendientes. |
| NET-01 | Detener Strapi y cargar la lista de comunidades. | Se informa que no se pudo conectar con el CMS; la solicitud no aparenta éxito. | Pasó en navegador; se mostró el error de conexión esperado. |
| UI-01 | Recorrer formularios con teclado y revisar una pantalla angosta. | Los controles tienen nombre accesible, el foco es visible y la navegación no se desborda. | Parcial; Tab recorrió email, contraseña y botón; a 375 px no hubo desborde horizontal. No se hizo recorrido completo de todos los controles. |
| UI-02 | Seleccionar una comunidad y revisar canales, miembros y mensajes. | El contenido corresponde al contexto seleccionado y muestra los estados pertinentes. | Bloqueado para canales y miembros: esas vistas aún no están implementadas. La pantalla de comunidad muestra el estado de mensajes vacío. |

## Resultado de ejecución

Los registros se hicieron el 2026-10-03 con una base SQLite descartable y dos
cuentas creadas solo para esta prueba. También se usó una tercera cuenta sin
membresías para comprobar la denegación de acceso. Los canales creados para
probar permisos se eliminaron al terminar. No se guardaron credenciales,
códigos de invitación ni tokens.

La primera prueba de sesión vencida encontró que la interfaz conservaba un JWT
inválido. Se corrigió para borrar la sesión y redirigir al inicio de sesión
cuando Strapi responde `401`, y luego se repitió el caso con resultado correcto.

## Limitaciones conocidas al iniciar la prueba

- T-12, T-13, T-14 y T-15 siguen abiertas. La interfaz todavía no ofrece el
  recorrido visual de canales ni la gestión y presentación de membresías;
  UI-02 queda bloqueado hasta que esas tareas se integren.
- No hay un runner de pruebas funcionales configurado para el frontend. La
  cobertura de interfaz se registra como prueba manual reproducible.
- La prueba de credenciales incorrectas devuelve un mensaje en inglés. Conviene
  unificar ese texto con la interfaz en español.
