/**
 * comunidad controller
 */

import { randomBytes } from 'node:crypto';
import { factories } from '@strapi/strapi';

const comunidadUid = 'api::comunidad.comunidad';
const membresiaUid = 'api::membresia.membresia';
const canalUid = 'api::canal.canal';

export default factories.createCoreController(comunidadUid, ({ strapi }) => ({
  // Los endpoints REST exponen únicamente comunidades del usuario autenticado.
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const propias = await strapi.db.query(membresiaUid).findMany({
      where: { usuario: user.id }, populate: ['comunidad'],
    });
    ctx.body = { data: propias.flatMap(({ comunidad }) => comunidad ? [{
      id: comunidad.id, documentId: comunidad.documentId, nombre: comunidad.nombre,
    }] : []) };
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const comunidad = await strapi.db.query(comunidadUid).findOne({
      where: { documentId: ctx.params.id },
    });
    if (!comunidad) return ctx.notFound('No se encontró la comunidad.');
    const membresia = await strapi.db.query(membresiaUid).findOne({
      where: { usuario: user.id, comunidad: comunidad.id },
    });
    if (!membresia) return ctx.forbidden('No pertenecés a esta comunidad.');
    ctx.body = { data: {
      id: comunidad.id, documentId: comunidad.documentId,
      nombre: comunidad.nombre, codigoInvitacion: comunidad.codigoInvitacion,
    } };
  },

  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized();
    }

    if (!this.validateInput || !this.sanitizeInput || !this.transformResponse) {
      throw new Error('Los helpers del controlador de comunidades no están disponibles.');
    }

    await this.validateInput(ctx.request.body, ctx);
    const sanitizedInput = await this.sanitizeInput(ctx.request.body, ctx);
    if (
      !sanitizedInput ||
      typeof sanitizedInput !== 'object' ||
      !('data' in sanitizedInput) ||
      !sanitizedInput.data ||
      typeof sanitizedInput.data !== 'object'
    ) {
      return ctx.badRequest('Los datos de la comunidad no son válidos.');
    }

    const { nombre } = sanitizedInput.data as Record<string, unknown>;
    if (typeof nombre !== 'string' || !nombre.trim()) {
      return ctx.badRequest('El nombre de la comunidad es obligatorio.');
    }

    const comunidad = await strapi.db.transaction(async () => {
      let codigoInvitacion: string;
      do {
        codigoInvitacion = randomBytes(6).toString('hex').toUpperCase();
      } while (
        await strapi.db.query(comunidadUid).findOne({
          where: { codigoInvitacion },
        })
      );

      const createdCommunity = await strapi.documents(comunidadUid).create({
        data: {
          nombre: nombre.trim(),
          codigoInvitacion,
        },
      });

      await strapi.db.query(canalUid).create({
        data: {
          nombre: 'general',
          comunidad: createdCommunity.id,
        },
      });

      await strapi.db.query(membresiaUid).create({
        data: {
          rol: 'propietario',
          usuario: user.id,
          comunidad: createdCommunity.id,
        },
      });

      return createdCommunity;
    });

    return this.transformResponse(comunidad);
  },

  async join(ctx) {
    const user = ctx.state.user;
    const code = ctx.request.body?.codigoInvitacion;

    if (!user) {
      return ctx.unauthorized();
    }

    if (typeof code !== 'string' || !code.trim()) {
      return ctx.badRequest('Se requiere un código de invitación.');
    }

    const comunidad = await strapi.db.query(comunidadUid).findOne({
      where: { codigoInvitacion: code.trim().toUpperCase() },
    });

    if (!comunidad) {
      return ctx.notFound('No se encontró una comunidad con ese código.');
    }

    const membershipCreated = await strapi.db.transaction(async () => {
      const existingMembership = await strapi.db.query(membresiaUid).findOne({
        where: {
          usuario: user.id,
          comunidad: comunidad.id,
        },
      });

      if (existingMembership) {
        return false;
      }

      await strapi.db.query(membresiaUid).create({
        data: {
          rol: 'miembro',
          usuario: user.id,
          comunidad: comunidad.id,
        },
      });

      return true;
    });

    if (!membershipCreated) {
      return ctx.conflict('Ya pertenecés a esta comunidad.');
    }

    ctx.status = 201;
    ctx.body = {
      data: {
        id: comunidad.id,
        documentId: comunidad.documentId,
        nombre: comunidad.nombre,
      },
    };
  },
}));
