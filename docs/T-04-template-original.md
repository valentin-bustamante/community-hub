# Template original de chat

Dejo acá registrado el punto de partida de la interfaz antes de seguir adaptándola a Community Hub. Para reconstruirlo uso la versión que quedó en el commit [`d235a95`](https://github.com/valentin-bustamante/community-hub/blob/d235a95/apps/frontend/src/components/home.tsx), no la pantalla actual, que ya tiene cambios posteriores.

## Procedencia y licencia

El template figura en 21st.dev como `chat-template`, variante `whatsapp-mock`, de Manoj (`rayimanoj8`) y con licencia MIT. La [ficha específica](https://21st.dev/community/components/rayimanoj8/chat-template/whatsapp-mock) y el [registro del componente](https://21st.dev/r/rayimanoj8/chat-template) aparecen en el catálogo; al verificarlos, el sitio devolvió 404. El código que quedó en el repo también enlaza la cuenta `rayimanoj8` en el menú original. Como referencia adicional, la [barra lateral de WhatsApp](https://21st.dev/@rayimanoj8/components/whatsapp-sidebar) tiene una ficha activa en 21st.dev con el mismo autor y licencia.

La licencia indicada para el componente es MIT. No encontré una licencia para las fotografías servidas desde el CDN, así que no las incluyo en las capturas.

## Qué incluía el original

La pantalla estaba hecha como un componente React dentro de Next.js. Usaba Tailwind CSS, componentes de shadcn/Radix, iconos de Lucide y paneles redimensionables.

La distribución tenía una navegación lateral con accesos a Messages, Phone y Status, además de Settings y un menú de cuenta. El área principal se dividía en dos paneles: a la izquierda, búsqueda, filtros de no leídos y borradores y una lista de contactos; a la derecha, el contacto seleccionado, acciones de llamada y una caja para escribir mensajes. Los contactos, nombres, avatares y textos eran datos de ejemplo definidos en el propio componente. No era un chat conectado a una API.

## Adaptación actual

La aplicación reemplaza los contactos y conversaciones ficticias por comunidades, canales, mensajes y membresías persistidos en Strapi. Retira llamadas y estados que no pertenecen al alcance del TP. Incorpora sesión de usuario, invitaciones, roles, estados de carga/error y navegación móvil. La tabla de cambios y las decisiones visuales están en [T-14](T-14-vista-principal.md).

## Demostración del estado previo

Las capturas siguientes muestran la versión integrada sin personalización funcional. Para ejecutar el código histórico en una carpeta independiente:

```sh
git worktree add ../community-hub-original d235a95
cd ../community-hub-original
npm ci
npm run dev:frontend -- --port 3001
```

Si la instalación histórica encuentra dependencias opcionales ausentes para su plataforma, ejecutar `npm install` dentro de esa carpeta histórica. La versión final y su bloqueo corregido permanecen independientes. Para la comparación del framework/CMS sin contenido del dominio, mostrar sus pantallas iniciales en instalaciones nuevas y luego el modelo de esta implementación. No hay una segunda copia del template en el código final.

## Capturas del original

Las capturas se hicieron ejecutando el snapshot del commit `d235a95`, antes de los cambios posteriores de autenticación. La primera muestra la pantalla completa; la segunda, el menú de cuenta abierto. Dejé vacíos los avatares que venían del CDN de 21st.dev porque no encontré una licencia para redistribuir esas fotografías.

![Pantalla original del template de chat](assets/template-original.png)

![Menú de cuenta original](assets/template-original-account-menu.png)

## Referencias para continuar

- [Versión original del componente en el commit `d235a95`](https://github.com/valentin-bustamante/community-hub/blob/d235a95/apps/frontend/src/components/home.tsx)
- [Componente adaptado actualmente](../apps/frontend/src/components/home.tsx)
- [Issue #4: Documentar template original](https://github.com/valentin-bustamante/community-hub/issues/4)
- [21st.dev](https://21st.dev/)
