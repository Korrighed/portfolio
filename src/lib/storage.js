import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';

const STORAGE_DIR = path.resolve(
  process.cwd(),
  import.meta.env.PDF_STORAGE_DIR || 'storage/fiches-reflexives'
);

export async function getPdfStream(filename) {
  const filePath = path.join(STORAGE_DIR, filename);

  // Empeche de sortir de STORAGE_DIR via un filename type "../../"
  if (path.relative(STORAGE_DIR, filePath).startsWith('..')) {
    throw new Error('Chemin de fichier invalide.');
  }

  await stat(filePath);
  return Readable.toWeb(createReadStream(filePath));
}
