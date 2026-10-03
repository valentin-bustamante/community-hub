/**
 * canal controller
 */

import { factories } from '@strapi/strapi';

const canalUid = 'api::canal.canal';
const comunidadUid = 'api::comunidad.comunidad';
const membresiaUid = 'api::membresia.membresia';
const mensajeUid = 'api::mensaje.mensaje';

type Canal = { id: number; documentId: string; nombre: string };

const serializar = ({ id, documentId, nombre }: Canal) => ({ id, documentId, nombre });

export default factories.createCoreController(canalUid, ({ strapi }) => {
  const rolEnComunidad = async (userId: number, comunidadId: number): Promise<string | null> => {
    const membresia = await strapi.db.query(membresiaUid).findOne({
      where: { usuario: userId, comunidad: comunidadId },
    });

    return membresia?.rol ?? null;
  };

  const canalConComunidad = (documentId: string) =>
    strapi.db.query(canalUid).findOne({
      where: { documentId },
      populate: ['comunidad'],
    });

  // Devuelve el nombre normalizado o null si no cumple las reglas del schema.
  const leerNombre = (body: unknown): string | null => {
    const nombre = (body as { data?: { nombre?: unknown } })?.data?.nombre;
    if (typeof nombre !== 'string') {
      return null;
    }

    const limpio = nombre.trim();
    return limpio.length >= 1 && limpio.length <= 20 ? limpio : null;
  };

  const nombreEnUso = async (nombre: string, comunidadId: number, exceptoId?: number) => {
    const existente = await strapi.db.query(canalUid).findOne({
      where: {
        nombre,
        comunidad: comunidadId,
        ...(exceptoId ? { id: { $ne: exceptoId } } : {}),
      },
    });

    return Boolean(existente);
  };

  return {
    async find(ctx) {
      const user = ctx.state.user;
      const comunidadDocumentId = ctx.query.comunidad;

      if (!user) {
        return ctx.unauthorized();
      }

      if (typeof comunidadDocumentId !== 'string' || !comunidadDocumentId) {
        return ctx.badRequest('Se requiere el parámetro comunidad.');
      }

      const comunidad = await strapi.db.query(comunidadUid).findOne({
        where: { documentId: comunidadDocumentId },
      });

      if (!comunidad) {
        return ctx.notFound('No se encontró la comunidad.');
      }

      if (!(await rolEnComunidad(user.id, comunidad.id))) {
        return ctx.forbidden('No pertenecés a esta comunidad.');
      }

      const canales = await strapi.db.query(canalUid).findMany({
        where: { comunidad: comunidad.id },
        orderBy: { id: 'asc' },
      });

      ctx.body = { data: canales.map(serializar) };
    },

    async findOne(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized();
      }

      const canal = await canalConComunidad(ctx.params.id);

      if (!canal?.comunidad) {
        return ctx.notFound('No se encontró el canal.');
      }

      if (!(await rolEnComunidad(user.id, canal.comunidad.id))) {
        return ctx.forbidden('No pertenecés a esta comunidad.');
      }

      ctx.body = { data: serializar(canal) };
    },

    async create(ctx) {
      const user = ctx.state.user;
      const comunidadDocumentId = ctx.request.body?.data?.comunidad;

      if (!user) {
        return ctx.unauthorized();
      }

      const nombre = leerNombre(ctx.request.body);
      if (!nombre) {
        return ctx.badRequest('El nombre del canal debe tener entre 1 y 20 caracteres.');
      }

      if (typeof comunidadDocumentId !== 'string' || !comunidadDocumentId) {
        return ctx.badRequest('Se requiere la comunidad del canal.');
      }

      const comunidad = await strapi.db.query(comunidadUid).findOne({
        where: { documentId: comunidadDocumentId },
      });

      if (!comunidad) {
        return ctx.notFound('No se encontró la comunidad.');
      }

      if ((await rolEnComunidad(user.id, comunidad.id)) !== 'propietario') {
        return ctx.forbidden('Solo el propietario puede crear canales.');
      }

      if (await nombreEnUso(nombre, comunidad.id)) {
        return ctx.conflict('Ya existe un canal con ese nombre en la comunidad.');
      }

      const canal = await strapi.documents(canalUid).create({
        data: { nombre, comunidad: comunidad.id },
      });

      ctx.status = 201;
      ctx.body = { data: serializar(canal as Canal) };
    },

    async update(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized();
      }

      const nombre = leerNombre(ctx.request.body);
      if (!nombre) {
        return ctx.badRequest('El nombre del canal debe tener entre 1 y 20 caracteres.');
      }

      const canal = await canalConComunidad(ctx.params.id);

      if (!canal?.comunidad) {
        return ctx.notFound('No se encontró el canal.');
      }

      if ((await rolEnComunidad(user.id, canal.comunidad.id)) !== 'propietario') {
        return ctx.forbidden('Solo el propietario puede editar canales.');
      }

      if (await nombreEnUso(nombre, canal.comunidad.id, canal.id)) {
        return ctx.conflict('Ya existe un canal con ese nombre en la comunidad.');
      }

      const actualizado = await strapi.db.query(canalUid).update({
        where: { id: canal.id },
        data: { nombre },
      });

      ctx.body = { data: serializar(actualizado) };
    },

    async delete(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized();
      }

      const canal = await canalConComunidad(ctx.params.id);

      if (!canal?.comunidad) {
        return ctx.notFound('No se encontró el canal.');
      }

      if ((await rolEnComunidad(user.id, canal.comunidad.id)) !== 'propietario') {
        return ctx.forbidden('Solo el propietario puede eliminar canales.');
      }

      const restantes = await strapi.db.query(canalUid).count({
        where: { comunidad: canal.comunidad.id },
      });

      if (restantes <= 1) {
        return ctx.conflict('La comunidad debe tener al menos un canal.');
      }

      await strapi.db.transaction(async () => {
        await strapi.db.query(mensajeUid).deleteMany({ where: { canal: canal.id } });
        await strapi.db.query(canalUid).delete({ where: { id: canal.id } });
      });

      ctx.status = 204;
    },
  };
});
