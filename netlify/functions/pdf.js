import { isAuthenticated } from './lib/auth.js';
import { fiches } from './lib/fiches.js';
import { getPdfBuffer } from './lib/storage.js';

export const handler = async (event) => {
  const authed = await isAuthenticated(event.headers.cookie);
  if (!authed) {
    return { statusCode: 401, body: 'Non autorise' };
  }

  const id = event.queryStringParameters?.id;
  const fiche = fiches.find((f) => f.id === id);
  if (!fiche) {
    return { statusCode: 404, body: 'Introuvable' };
  }

  let buffer;
  try {
    buffer = await getPdfBuffer(fiche.file);
  } catch {
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
};
