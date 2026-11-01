import { connectLambda, getStore } from '@netlify/blobs';

const STORE_NAME = process.env.PDF_BLOB_STORE || 'fiches-reflexives';

function getPdfStore(event) {
  // Signature "Lambda compatibility mode" (netlify/functions classiques) :
  // le contexte Blobs n'est pas configure automatiquement, il faut l'attacher
  // a l'event de la requete courante avant tout appel a getStore().
  connectLambda(event);
  return getStore(STORE_NAME);
}

// Les fonctions Netlify classiques repondent en un seul payload (pas de stream),
// donc on lit le blob entier en memoire avant de l'encoder en base64.
export async function getPdfBuffer(event, filename) {
  const store = getPdfStore(event);
  const arrayBuffer = await store.get(filename, { type: 'arrayBuffer' });

  if (!arrayBuffer) {
    throw new Error(`PDF introuvable dans le store Blobs "${STORE_NAME}": ${filename}`);
  }

  return Buffer.from(arrayBuffer);
}
