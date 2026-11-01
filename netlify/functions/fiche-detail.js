import { withAuth } from './lib/auth.js';
import { findFiche } from './lib/fiche-repository.js';

// Le panneau de la scene remplace la page de detail : on renvoie vers la liste.
export const handler = withAuth(async (event) => {
  if (!findFiche(event)) {
    return { statusCode: 404, body: 'Introuvable' };
  }

  return { statusCode: 302, headers: { Location: '/fiches-reflexives' }, body: '' };
}, { onFail: 'redirect' });
