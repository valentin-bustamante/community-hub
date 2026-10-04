# Vista principal — T-14

La pantalla principal ya no muestra el contenido de ejemplo del template. Al
elegir una comunidad, el encabezado muestra su nombre y el canal seleccionado;
el centro de la pantalla carga los mensajes de ese canal y el panel lateral
muestra a sus integrantes. Las acciones para administrar integrantes aparecen
solo para quien tiene el rol de propietario. La navegación de comunidades y
canales queda en la barra lateral.

También dejé explícitos los estados que antes podían confundirse con datos
vacíos: mientras se cargan las comunidades se informa que la consulta sigue en
curso; si falla una consulta se muestra el error; y las listas vacías tienen
un mensaje propio. Si falla la consulta del código de invitación, el error se
muestra aparte y se puede volver a intentar.

## Diferencias respecto del template

- Reemplacé los servidores, canales y mensajes de muestra por comunidades,
  canales, mensajes y membresías consultados a Strapi.
- El contenido central cambia con la comunidad y el canal activos; si no hay
  una comunidad seleccionada se invita a elegir o crear una.
- El panel de miembros refleja los roles reales. Solo el propietario ve las
  acciones para cambiar roles o expulsar integrantes. En pantallas angostas se
  abre como un diálogo para no quitarle espacio al chat.
- Los mensajes largos tienen salto de línea. Las consultas que fallan se
  muestran con una alerta y una respuesta correcta posterior limpia el error.
- En teléfonos, el rail de comunidades se reemplaza por un selector de
  navegación desplegable; el rail completo se mantiene en escritorio. Esta
  adaptación responsive llegó a `main` en el PR #38 de T-15 y es la que usa
  esta rama.

## Validación realizada

Probé la pantalla en Next.js y Strapi con una base SQLite aislada y dos cuentas
temporales. No guardé credenciales, tokens ni códigos de invitación.

- Creé una comunidad, invité a una segunda cuenta y confirmé que se vieran los
  nombres y roles de sus integrantes.
- Como propietaria, creé un segundo canal y cambié entre canales. El encabezado,
  el historial y el estado sin mensajes cambiaron con la selección.
- Comprobé que la propietaria puede dar y quitar el rol de administrador, y
  que una cuenta miembro no ve esas acciones.
- Envié un mensaje largo y confirmé que aparece en el historial.
- Apagué Strapi: la consulta de invitación y la actualización de mensajes
  mostraron errores, sin ocultarlos como si fueran datos válidos.
- Probé una contraseña incorrecta y un token inválido. El primero mostró el
  error de Strapi en inglés; el segundo cerró la sesión y volvió a `/login`.

La primera versión llegó a medir 448 px de ancho con un viewport de 375 px.
Antes de que se integrara el PR #38, medí la versión de trabajo en viewports de
375 × 812, 768 × 900 y 1440 × 900 px: el ancho del documento y del `body`
coincidió con el ancho del viewport en los tres tamaños. También comprobé en
móvil el selector de comunidades y el diálogo de integrantes. La comparación
visual con el template original está en
[T-04-template-original.md](T-04-template-original.md); el detalle de la
validación funcional y sus límites está en
[T-16-pruebas-funcionales.md](T-16-pruebas-funcionales.md).
