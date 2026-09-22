import { withAuth } from './lib/auth.js';
import { fiches } from './lib/fiche-repository.js';
import { renderPage } from './lib/page.js';

export const handler = withAuth(async () => {
  const items = fiches
    .map((f) => `<li><a href="/fiches-reflexives/${f.id}">${f.title}</a></li>`)
    .join('');

  const body = renderPage({
    title: 'Fiches réflexives',
    nav: [{ href: '/', label: 'Accueil' }],
    body: `
    <main>
      <h1>Fiches réflexives</h1>
      <ul>${items}</ul>
    </main>`,
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body,
  };
}, { onFail: 'redirect' });
