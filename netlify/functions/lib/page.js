// Nav commune aux pages protegees (fiches reflexives). Toujours un lien de
// retour contextuel + le formulaire de deconnexion.
export function renderNav(links = []) {
  const linkItems = links.map((l) => `<a href="${l.href}">${l.label}</a>`).join('\n        ');

  return `<header>
      <nav>
        ${linkItems}
        <form method="post" action="/api/logout">
          <button type="submit">Se déconnecter</button>
        </form>
      </nav>
    </header>`;
}

// `nav` : tableau de { href, label } a injecter via renderNav, ou omis/falsy
// pour une page sans nav (ex. pages publiques hors perimetre de ce pipeline).
export function renderPage({ title, nav, body }) {
  const navHtml = nav ? renderNav(nav) : '';

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="stylesheet" href="/css/main.css" />
  </head>
  <body>
    ${navHtml}
    ${body}
  </body>
</html>`;
}
