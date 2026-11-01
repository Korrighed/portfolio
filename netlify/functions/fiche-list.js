import { withAuth } from './lib/auth.js';
import { author, fiches } from './lib/fiche-repository.js';
import { renderFichesScene } from './lib/fiches-view.js';
import { renderPage } from './lib/page.js';

export const handler = withAuth(async () => {
  const body = renderPage({
    title: 'Fiches réflexives',
    nav: [{ href: '/', label: 'Accueil' }],
    bodyClass: 'espace',
    styles: ['/css/nav.css', '/css/footer.css', '/css/faq.css', '/css/fiches.css'],
    scripts: ['/js/faq.js', '/js/faq-ripple.js'],
    footer: true,
    body: `<main class="espace__main">${renderFichesScene(fiches, author)}</main>`,
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body,
  };
}, { onFail: 'redirect' });
