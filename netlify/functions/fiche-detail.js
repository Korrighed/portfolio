import { isAuthenticated } from './lib/auth.js';
import { fiches } from './lib/fiches.js';
import { renderPage } from './lib/page.js';

export const handler = async (event) => {
  const authed = await isAuthenticated(event.headers.cookie);
  if (!authed) {
    return { statusCode: 302, headers: { Location: '/login.html' }, body: '' };
  }

  const id = event.queryStringParameters?.id;
  const fiche = fiches.find((f) => f.id === id);
  if (!fiche) {
    return { statusCode: 404, body: 'Introuvable' };
  }

  const body = renderPage({
    title: fiche.title,
    body: `
    <header>
      <nav>
        <a href="/fiches-reflexives">Fiches réflexives</a>
        <form method="post" action="/api/logout">
          <button type="submit">Se déconnecter</button>
        </form>
      </nav>
    </header>
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
};
