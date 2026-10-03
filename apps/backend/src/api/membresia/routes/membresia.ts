/**
 * membresia router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::membresia.membresia', {
  // Las membresías se crean al crear una comunidad o al unirse por invitación.
  except: ['create'],
});
