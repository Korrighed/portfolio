import { withAuth } from './lib/auth.js';
import { findFiche } from './lib/fiche-repository.js';
import { getPdfBuffer } from './lib/storage.js';

export const handler = withAuth(async (event) => {
  const fiche = findFiche(event);
  if (!fiche) {
    return { statusCode: 404, body: 'Introuvable' };
  }

  let buffer;
  try {
    buffer = await getPdfBuffer(event, fiche.file);
  } catch (err) {
    // On logge le detail cote serveur uniquement : la reponse HTTP reste
    // generique pour ne pas exposer de details internes (store, chemin...).
    console.error(`Echec de lecture du PDF "${fiche.file}" (fiche ${fiche.id}):`, err);
    return { statusCode: 404, body: 'Introuvable' };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fiche.file}"`,
    },
    body: buffer.toString('base64'),
    isBase64Encoded: true,
  };
}, { onFail: '401' });
