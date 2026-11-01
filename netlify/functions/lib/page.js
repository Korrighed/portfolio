// En-tete commun aux pages protegees (fiches reflexives) : meme marque que l'accueil,
// lien(s) de retour + formulaire de deconnexion. Styles : nav.css + fiches.css.
export function renderNav(links = []) {
  const linkItems = links.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join('\n            ');

  return `<header class="nav espace__bar">
      <div class="nav__inner">
        <a class="nav__brand" href="/" aria-label="korrighed.dev, accueil">
          <img class="nav__logo" src="/img/logo/logo-ka-intro.svg" alt="" width="43" height="40" />
          <span>korrighed.dev</span>
        </a>
        <nav class="nav__menu espace__menu" aria-label="Espace enseignant">
          <ul>
            ${linkItems}
            <li>
              <form method="post" action="/api/logout">
                <button class="espace__logout" type="submit">Se déconnecter</button>
              </form>
            </li>
          </ul>
        </nav>
      </div>
    </header>`;
}

// Pied de page clair des pages protegees. Styles : footer.css (site-footer--light) + fiches.css.
export function renderFooter() {
  return `<footer class="site-footer site-footer--light">
      <div class="site-footer__inner">
        <span class="site-footer__brand">Alex Portfolio</span>
        <div class="site-footer__links">
          <a href="/">Accueil</a>
          <a href="https://github.com/Korrighed">GitHub</a>
          <a href="/mentions-legales.html">Mentions légales</a>
        </div>
      </div>
    </footer>`;
}

// `nav` : tableau de { href, label } a injecter via renderNav, ou omis/falsy pour une page sans nav.
// `styles` et `scripts` : chemins publics (feuilles de style, modules JS) a charger apres main.css.
// `footer` : true pour ajouter le pied de page clair apres le contenu.
// Les pages protegees ne doivent pas etre indexees.
export function renderPage({ title, nav, body, bodyClass = '', styles = [], scripts = [], footer = false }) {
  const navHtml = nav ? renderNav(nav) : '';
  const footerHtml = footer ? renderFooter() : '';
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
    ${footerHtml}
    ${scriptTags}
  </body>
</html>`;
}
