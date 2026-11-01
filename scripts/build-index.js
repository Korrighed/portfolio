import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const templatePath = join(root, 'src', 'index.template.html');
const sectionsDir = join(root, 'src', 'sections');
const outPath = join(root, 'public', 'index.html');
const faqPath = join(root, 'src', 'data', 'faq.json');

// Sous Windows (core.autocrlf), les sources de src/ sont en CRLF dans la copie
// de travail. Le depot stocke du LF : on genere du LF pour que git ne voie
// pas public/index.html comme modifie a chaque build.
const toLf = (text) => text.replace(/\r\n/g, '\n');

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pad = (n) => String(n).padStart(2, '0');

// Boutons des questions (marqueur <!-- faq:tabs -->). Les roles ARIA sont poses par faq.js.
export function renderFaqTabs(items) {
  return items
    .map(
      ({ q }, i) =>
        `        <button class="faq__tab" type="button" data-faq="${i + 1}"><span class="faq__num" aria-hidden="true">${pad(i + 1)}</span><span class="faq__label">${escapeHtml(q)}</span></button>`,
    )
    .join('\n');
}

// Panneaux de reponse (marqueur <!-- faq:panels -->).
export function renderFaqPanels(items) {
  return items
    .map(
      ({ q, a }, i) =>
        `          <article class="faq__panel" id="faq-panel-${i + 1}" data-faq="${i + 1}">\n            <p class="faq__count" aria-hidden="true">${pad(i + 1)} / ${pad(items.length)}</p>\n            <h3 class="faq__q">${escapeHtml(q)}</h3>\n            <p class="faq__a">${escapeHtml(a)}</p>\n          </article>`,
    )
    .join('\n');
}

// Donnees structurees schema.org FAQPage (marqueur <!-- faq:jsonld -->).
export function renderFaqJsonLd(items) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
  const json = JSON.stringify(data, null, 2).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">\n${json}\n  </script>`;
}

export function buildIndex() {
  const template = toLf(readFileSync(templatePath, 'utf8'));

  const faq = JSON.parse(readFileSync(faqPath, 'utf8'));
  const html = template
    .replace(/<!-- include:(.+?) -->/g, (_match, file) =>
      toLf(readFileSync(join(sectionsDir, file.trim()), 'utf8')).trimEnd(),
    )
    .replace('<!-- faq:tabs -->', () => renderFaqTabs(faq))
    .replace('<!-- faq:panels -->', () => renderFaqPanels(faq))
    .replace('<!-- faq:jsonld -->', () => renderFaqJsonLd(faq));

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
