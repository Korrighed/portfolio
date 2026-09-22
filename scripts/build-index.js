import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const templatePath = join(root, 'src', 'index.template.html');
const sectionsDir = join(root, 'src', 'sections');
const outPath = join(root, 'public', 'index.html');

export function buildIndex() {
  const template = readFileSync(templatePath, 'utf8');

  const html = template.replace(/<!-- include:(.+?) -->/g, (_match, file) =>
    readFileSync(join(sectionsDir, file.trim()), 'utf8').trimEnd(),
  );

  writeFileSync(outPath, html);
  return outPath;
}

// Usage CLI (npm run build / predev) : execute uniquement si le fichier est
// lance directement, pas quand il est importe (ex: vite.config.js).
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  buildIndex();
  console.log('public/index.html genere depuis src/');
}
