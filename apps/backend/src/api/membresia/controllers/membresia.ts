/**
 * membresia controller
 */

import { factories } from '@strapi/strapi';

const membresiaUid = 'api::membresia.membresia';
const comunidadUid = 'api::comunidad.comunidad';

const roles = ['propietario', 'administrador', 'miembro'];

type Membresia = {
  id: number;
  documentId: string;
  rol: string;
  usuario?: { id: number; username: string } | null;
  comunidad?: { id: number; documentId: string; nombre: string } | null;
};

const serializar = ({ id, documentId, rol, usuario }: Membresia) => ({
  id,
  documentId,
  rol,
  usuario: usuario ? { id: usuario.id, username: usuario.username } : null,
});

export default factories.createCoreController(membresiaUid, ({ strapi }) => {
  const membresiaDe = (userId: number, comunidadId: number): Promise<Membresia | null> =>
    strapi.db.query(membresiaUid).findOne({
      where: { usuario: userId, comunidad: comunidadId },
    });

  const membresiaCompleta = (documentId: string): Promise<Membresia | null> =>
    strapi.db.query(membresiaUid).findOne({
      where: { documentId },
      populate: ['usuario', 'comunidad'],
    });

  return {
    // Con ?comunidad=<documentId> lista los miembros de esa comunidad;
    // sin el parámetro devuelve las membresías del usuario autenticado.
    async find(ctx) {
      const user = ctx.state.user;
      const comunidadDocumentId = ctx.query.comunidad;

      if (!user) {
        return ctx.unauthorized();
      }

      if (comunidadDocumentId === undefined) {
        const propias: Membresia[] = await strapi.db.query(membresiaUid).findMany({
          where: { usuario: user.id },
          populate: ['comunidad'],
          orderBy: { id: 'asc' },
        });

        ctx.body = {
          data: propias.flatMap(({ id, documentId, rol, comunidad }) =>
            comunidad
              ? [
                  {
                    id,
                    documentId,
                    rol,
                    comunidad: {
                      id: comunidad.id,
                      documentId: comunidad.documentId,
                      nombre: comunidad.nombre,
                    },
                  },
                ]
              : []
          ),
        };
        return;
      }

      if (typeof comunidadDocumentId !== 'string' || !comunidadDocumentId) {
        return ctx.badRequest('El parámetro comunidad no es válido.');
      }

      const comunidad = await strapi.db.query(comunidadUid).findOne({
        where: { documentId: comunidadDocumentId },
      });

      if (!comunidad) {
        return ctx.notFound('No se encontró la comunidad.');
      }

      if (!(await membresiaDe(user.id, comunidad.id))) {
        return ctx.forbidden('No pertenecés a esta comunidad.');
      }

      const miembros: Membresia[] = await strapi.db.query(membresiaUid).findMany({
        where: { comunidad: comunidad.id },
        populate: ['usuario'],
        orderBy: { id: 'asc' },
      });

      ctx.body = { data: miembros.map(serializar) };
    },

    async findOne(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized();
      }

      const membresia = await membresiaCompleta(ctx.params.id);

      if (!membresia?.comunidad) {
        return ctx.notFound('No se encontró la membresía.');
      }

      if (!(await membresiaDe(user.id, membresia.comunidad.id))) {
        return ctx.forbidden('No pertenecés a esta comunidad.');
      }

      ctx.body = { data: serializar(membresia) };
    },

    // Solo el propietario cambia roles. Asignar "propietario" a otro miembro
    // transfiere la comunidad: el propietario actual pasa a ser miembro.
    async update(ctx) {
      const user = ctx.state.user;
      const rol = ctx.request.body?.data?.rol;

      if (!user) {
        return ctx.unauthorized();
      }

      if (typeof rol !== 'string' || !roles.includes(rol)) {
        return ctx.badRequest('El rol debe ser "propietario", "administrador" o "miembro".');
      }

      const membresia = await membresiaCompleta(ctx.params.id);

      if (!membresia?.comunidad) {
        return ctx.notFound('No se encontró la membresía.');
      }

      const propia = await membresiaDe(user.id, membresia.comunidad.id);

      if (propia?.rol !== 'propietario') {
        return ctx.forbidden('Solo el propietario puede cambiar roles.');
      }

      if (propia.id === membresia.id) {
        return ctx.conflict('Para dejar de ser propietario, transferí la comunidad a otro miembro.');
      }

      if (rol === 'propietario') {
        await strapi.db.transaction(async () => {
          await strapi.db.query(membresiaUid).update({
            where: { id: membresia.id },
            data: { rol: 'propietario' },
          });
          await strapi.db.query(membresiaUid).update({
            where: { id: propia.id },
            data: { rol: 'miembro' },
          });
        });
      } else {
        await strapi.db.query(membresiaUid).update({
          where: { id: membresia.id },
          data: { rol },
        });
      }

      ctx.body = { data: serializar({ ...membresia, rol }) };
    },

    // Un miembro puede salir de la comunidad; el propietario puede expulsar a otros.
    async delete(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized();
      }

      const membresia = await membresiaCompleta(ctx.params.id);

      if (!membresia?.comunidad) {
        return ctx.notFound('No se encontró la membresía.');
      }

      const propia = await membresiaDe(user.id, membresia.comunidad.id);

      if (!propia) {
        return ctx.forbidden('No pertenecés a esta comunidad.');
      }

      const esPropia = propia.id === membresia.id;

      if (!esPropia && propia.rol !== 'propietario') {
        return ctx.forbidden('Solo el propietario puede expulsar miembros.');
      }

      if (esPropia && propia.rol === 'propietario') {
        return ctx.conflict('El propietario no puede salir sin transferir la comunidad.');
      }

      await strapi.db.query(membresiaUid).delete({ where: { id: membresia.id } });

      ctx.status = 204;
    },
  };
});
