// Nav commune aux pages protegees (fiches reflexives) : lien(s) de retour + formulaire de deconnexion.
export function renderNav(links = []) {
  const linkItems = links.map((l) => `<a href="${l.href}">${l.label}</a>`).join('\n        ');

  return `<header class="espace__bar">
      <nav class="espace__links">
        ${linkItems}
      </nav>
      <form method="post" action="/api/logout">
        <button type="submit">Se déconnecter</button>
      </form>
    </header>`;
}

// `nav` : tableau de { href, label } a injecter via renderNav, ou omis/falsy pour une page sans nav.
// `styles` et `scripts` : chemins publics (feuilles de style, modules JS) a charger apres main.css.
// Les pages protegees ne doivent pas etre indexees.
export function renderPage({ title, nav, body, bodyClass = '', styles = [], scripts = [] }) {
  const navHtml = nav ? renderNav(nav) : '';
  const styleTags = styles.map((href) => `<link rel="stylesheet" href="${href}" />`).join('\n    ');
  const scriptTags = scripts.map((src) => `<script type="module" src="${src}"></script>`).join('\n    ');

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${title}</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="stylesheet" href="/css/main.css" />
    ${styleTags}
  </head>
  <body${bodyClass ? ` class="${bodyClass}"` : ''}>
    ${navHtml}
    ${body}
    ${scriptTags}
  </body>
</html>`;
}
