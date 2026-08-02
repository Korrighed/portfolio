import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const STORAGE_DIR = path.resolve(
  process.cwd(),
  process.env.PDF_STORAGE_DIR || 'storage/fiches-reflexives'
);

// Les fonctions Netlify classiques repondent en un seul payload (pas de stream),
// donc on lit le fichier entier en memoire avant de l'encoder en base64.
export async function getPdfBuffer(filename) {
  const filePath = path.join(STORAGE_DIR, filename);

  if (path.relative(STORAGE_DIR, filePath).startsWith('..')) {
    throw new Error('Chemin de fichier invalide.');
  }

  await stat(filePath);
  return readFile(filePath);
}
