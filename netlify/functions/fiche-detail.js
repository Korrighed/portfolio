import { withAuth } from './lib/auth.js';
import { findFiche } from './lib/fiche-repository.js';
import { renderPage } from './lib/page.js';

export const handler = withAuth(async (event) => {
  const fiche = findFiche(event);
  if (!fiche) {
    return { statusCode: 404, body: 'Introuvable' };
  }

  const body = renderPage({
    title: fiche.title,
    nav: [{ href: '/fiches-reflexives', label: 'Fiches réflexives' }],
    body: `
    <main>
      <h1>${fiche.title}</h1>
      <a href="/api/pdf/${fiche.id}" target="_blank" rel="noopener">Ouvrir le PDF</a>
    </main>`,
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body,
  };
}, { onFail: 'redirect' });
