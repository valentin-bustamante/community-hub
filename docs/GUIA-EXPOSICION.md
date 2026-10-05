# Guía de exposición y entrega

## Material

- Repositorio: https://github.com/valentin-bustamante/community-hub
- Tablero: https://github.com/users/valentin-bustamante/projects/1
- Informe: [INFORME-TP2.md](INFORME-TP2.md) y su versión PDF.
- Presentación: abrir `PRESENTACION.html` en un navegador, usar flechas o botones.
- Evidencia: [T-16-pruebas-funcionales.md](T-16-pruebas-funcionales.md).

## Preparación

1. Desde un clon limpio ejecutar `npm ci`, `npm run setup` y `npm run dev`.
2. Crear la cuenta administrativa del CMS en `/admin`. Registrar dos cuentas de aplicación desde `/registro`. Usar datos ficticios, sin publicar contraseñas.
3. Crear dos comunidades desde la primera cuenta. Crear un segundo canal, invitar a la segunda cuenta y dejar algunos mensajes de demostración.
4. Mantener abiertos el panel del CMS, la aplicación y las capturas históricas del template.
5. Confirmar antes de la clase que los docentes pueden abrir el repositorio y el tablero. La concesión de accesos requiere identificar sus cuentas.

## Recorrido en vivo

1. Presentar el dominio y el alcance del TP. Explicar Next.js y Strapi y por qué se descartaron las alternativas del informe.
2. Mostrar el estado previo conservado en el commit `d235a95` y las capturas del original. Comparar con la vista final.
3. Recorrer comunidades, cambiar de canal y demostrar que el chat pertenece al contexto activo.
4. Desde la cuenta propietaria crear y renombrar un canal. Desde la cuenta miembro mostrar que las acciones administrativas no aparecen.
5. Cambiar el rol de un integrante, enviar mensajes y expulsar al miembro. Comprobar que la API deniega su acceso posterior.
6. Editar un nombre de canal en Content Manager, guardar y pulsar Actualizar comunidad en Next.js.
7. Mostrar la navegación en teléfono, abrir miembros, usar Tab y cerrar con Escape.
8. Ejecutar `npm run test:api` en una instancia descartable o mostrar sus resultados documentados. Explicar los límites del polling, localStorage y SQLite.

## Distribución entre tres integrantes

| Parte | Contenido |
| --- | --- |
| Integrante 1 | Dominio, elección y alternativas, template original |
| Integrante 2 | Modelo de datos, CMS, API y autorización |
| Integrante 3 | Interfaz, demostración, pruebas y conclusiones |

Adaptar quién presenta cada parte al trabajo realmente realizado. No se atribuyen contribuciones individuales sin evidencia.

## Control de entrega

El código y la documentación pueden entregarse desde el repositorio. La exposición en vivo y compartir accesos con las cuentas docentes son acciones del equipo. No se certifican como realizadas mediante un archivo.
