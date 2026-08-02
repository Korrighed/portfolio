import { isAuthenticated } from './lib/auth.js';
import { fiches } from './lib/fiches.js';
import { renderPage } from './lib/page.js';

export const handler = async (event) => {
  const authed = await isAuthenticated(event.headers.cookie);
  if (!authed) {
    return { statusCode: 302, headers: { Location: '/login.html' }, body: '' };
  }

  const items = fiches
    .map((f) => `<li><a href="/fiches-reflexives/${f.id}">${f.title}</a></li>`)
    .join('');

  const body = renderPage({
    title: 'Fiches réflexives',
    body: `
    <header>
      <nav>
        <a href="/">Accueil</a>
        <form method="post" action="/api/logout">
          <button type="submit">Se déconnecter</button>
        </form>
      </nav>
    </header>
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
};
