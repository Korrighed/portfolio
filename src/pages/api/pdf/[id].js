import { fiches } from '../../../lib/fiches.js';
import { getPdfStream } from '../../../lib/storage.js';

export const prerender = false;

export async function GET({ params }) {
  const fiche = fiches.find((f) => f.id === params.id);
  if (!fiche) {
    return new Response('Introuvable', { status: 404 });
  }

  let stream;
  try {
    stream = await getPdfStream(fiche.file);
  } catch {
    return new Response('Introuvable', { status: 404 });
  }

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fiche.file}"`,
    },
  });
}
