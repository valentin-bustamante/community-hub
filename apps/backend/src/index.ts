import type { Core } from '@strapi/strapi';

const permisosAutenticado = [
  'api::comunidad.comunidad.create',
  'api::comunidad.comunidad.join',
  'api::comunidad.comunidad.find',
  'api::comunidad.comunidad.findOne',
  'api::membresia.membresia.find',
  'api::membresia.membresia.findOne',
  'api::membresia.membresia.update',
  'api::membresia.membresia.delete',
  'api::canal.canal.find',
  'api::canal.canal.findOne',
  'api::canal.canal.create',
  'api::canal.canal.update',
  'api::canal.canal.delete',
  'api::mensaje.mensaje.find',
  'api::mensaje.mensaje.create',
];

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const rol = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'authenticated' }, populate: ['permissions'] });

    if (!rol) {
      return;
    }

    const existentes = rol.permissions.map((permiso: { action: string }) => permiso.action);

    for (const action of permisosAutenticado) {
      if (!existentes.includes(action)) {
        await strapi.db
          .query('plugin::users-permissions.permission')
          .create({ data: { action, role: rol.id } });
      }
    }
  },
};
