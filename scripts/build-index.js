import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const templatePath = join(root, 'src', 'index.template.html');
const sectionsDir = join(root, 'src', 'sections');
const outPath = join(root, 'public', 'index.html');
const faqPath = join(root, 'src', 'data', 'faq.json');
const sitemapPath = join(root, 'public', 'sitemap.xml');
const robotsPath = join(root, 'public', 'robots.txt');

// Domaine du site : variable SITE_URL (variables Netlify) ; domaine Netlify par defaut, sans barre finale.
const SITE_URL = (process.env.SITE_URL || 'https://kaporfolio.netlify.app').replace(/\/+$/, '');

// Sous Windows (core.autocrlf), les sources de src/ sont en CRLF dans la copie
// de travail. Le depot stocke du LF : on genere du LF pour que git ne voie
// pas public/index.html comme modifie a chaque build.
const toLf = (text) => text.replace(/\r\n/g, '\n');

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pad = (n) => String(n).padStart(2, '0');

// Les roles ARIA des onglets sont poses par faq.js.
export function renderFaqTabs(items) {
  return items
    .map(
      ({ q }, i) =>
        `        <button class="faq__tab" type="button"><span class="faq__num" aria-hidden="true">${pad(i + 1)}</span><span class="faq__label">${escapeHtml(q)}</span></button>`,
    )
    .join('\n');
}

export function renderFaqPanels(items) {
  return items
    .map(
      ({ q, a }, i) =>
        `          <article class="faq__panel" id="faq-panel-${i + 1}">\n            <p class="faq__count" aria-hidden="true">${pad(i + 1)} / ${pad(items.length)}</p>\n            <h3 class="faq__q">${escapeHtml(q)}</h3>\n            <p class="faq__a">${escapeHtml(a)}</p>\n          </article>`,
    )
    .join('\n');
}

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

export function renderSitemap(siteUrl) {
  const pages = ['/', '/mentions-legales.html'];
  const urls = pages.map((page) => `  <url><loc>${siteUrl}${page}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function renderRobots(siteUrl) {
  return `User-agent: *\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

// Marqueurs <!-- faq:xxx --> : chacun doit exister dans les sources, une seule fois.
const faqSlots = { tabs: renderFaqTabs, panels: renderFaqPanels, jsonld: renderFaqJsonLd };

export function buildIndex() {
  const template = toLf(readFileSync(templatePath, 'utf8'));
  const faq = JSON.parse(readFileSync(faqPath, 'utf8'));
  const seen = new Set();

  const html = template
    .replace(/<!-- include:(.+?) -->/g, (_match, file) =>
      toLf(readFileSync(join(sectionsDir, file.trim()), 'utf8')).trimEnd(),
    )
    .replace(/<!-- faq:(\w+) -->/g, (_match, key) => {
      if (!faqSlots[key]) throw new Error(`Marqueur inconnu : faq:${key}`);
      seen.add(key);
      return faqSlots[key](faq);
    })
    .replace(/%SITE_URL%/g, SITE_URL);

  const missing = Object.keys(faqSlots).filter((key) => !seen.has(key));
  if (missing.length > 0) throw new Error(`Marqueur absent des sources : ${missing.map((key) => 'faq:' + key).join(', ')}`);

  writeFileSync(outPath, html);
  writeFileSync(sitemapPath, renderSitemap(SITE_URL));
  writeFileSync(robotsPath, renderRobots(SITE_URL));
  return outPath;
}

// Usage CLI (npm run build / predev) : execute uniquement si le fichier est
// lance directement, pas quand il est importe (ex: vite.config.js).
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  buildIndex();
  console.log('public/index.html, sitemap.xml et robots.txt generes depuis src/');
}
