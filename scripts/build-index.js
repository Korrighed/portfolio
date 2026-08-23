import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const templatePath = join(root, 'src', 'index.template.html');
const sectionsDir = join(root, 'src', 'sections');
const outPath = join(root, 'public', 'index.html');

const template = readFileSync(templatePath, 'utf8');

const html = template.replace(/<!-- include:(.+?) -->/g, (_match, file) =>
  readFileSync(join(sectionsDir, file.trim()), 'utf8').trimEnd(),
);

writeFileSync(outPath, html);
console.log('public/index.html genere depuis src/');
