# T601 — Espace enseignant : balisage de l'en-tête, du pied de page et du bouton PDF

Statut : fait
Story : US-08 · Exigences : F-22, F-12, NF-07
Dépend de : aucune
Parallélisable : oui (aucun fichier en commun avec T602 ; le contrat est la liste des classes ci-dessous)
Exécutant : executor

## Objectif

La page `/fiches-reflexives` gagne un en-tête clair (marque « korrighed.dev » + liens), un pied de page clair, et le lien vers le PDF devient un grand bouton placé juste sous le sous-titre de chaque fiche (action principale de la page). Cette tâche ne produit que le balisage HTML (rendu côté serveur) ; les styles sont dans T602.

Contrat de classes avec T602 : `nav`, `nav__inner`, `nav__brand`, `nav__logo` (déjà dans `nav.css`), `espace__bar`, `espace__menu`, `espace__logout`, `site-footer`, `site-footer--light`, `site-footer__inner`, `site-footer__brand`, `site-footer__links` (déjà dans `footer.css` sauf `--light`), `fiche__cta`, `fiche__cta-icon`, `fiche__cta-text`, `fiche__cta-label`, `fiche__cta-meta`, `fiche__cta-arrow`.

## Fichiers à lire

- `netlify/functions/lib/page.js`, `netlify/functions/lib/fiches-view.js`, `netlify/functions/fiche-list.js`
- `src/sections/nav.html` et `src/sections/footer.html` — le balisage de l'accueil dont on reprend la marque

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `netlify/functions/lib/page.js` | modifier | en-tête clair, pied de page clair optionnel |
| `netlify/functions/lib/fiches-view.js` | modifier | bouton PDF sous le sous-titre |
| `netlify/functions/fiche-list.js` | modifier | feuilles de style `nav.css` et `footer.css`, pied de page activé |

## Étapes

1. Dans `netlify/functions/lib/page.js`, remplacer exactement le bloc de tête du fichier, de la première ligne jusqu'à la fin de la fonction `renderNav` incluse :

```js
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
```

par :

```js
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
        </div>
      </div>
    </footer>`;
}
```

2. Dans le même fichier, remplacer exactement :

```js
// `styles` et `scripts` : chemins publics (feuilles de style, modules JS) a charger apres main.css.
// Les pages protegees ne doivent pas etre indexees.
export function renderPage({ title, nav, body, bodyClass = '', styles = [], scripts = [] }) {
  const navHtml = nav ? renderNav(nav) : '';
```

par :

```js
// `styles` et `scripts` : chemins publics (feuilles de style, modules JS) a charger apres main.css.
// `footer` : true pour ajouter le pied de page clair apres le contenu.
// Les pages protegees ne doivent pas etre indexees.
export function renderPage({ title, nav, body, bodyClass = '', styles = [], scripts = [], footer = false }) {
  const navHtml = nav ? renderNav(nav) : '';
  const footerHtml = footer ? renderFooter() : '';
```

puis remplacer exactement :

```
    ${navHtml}
    ${body}
    ${scriptTags}
```

par :

```
    ${navHtml}
    ${body}
    ${footerHtml}
    ${scriptTags}
```

3. Dans `netlify/functions/lib/fiches-view.js`, remplacer exactement :

```js
  const pdf = fiche.file
    ? `<a class="fiche__link" href="/api/pdf/${escapeHtml(fiche.id)}" target="_blank" rel="noopener">Ouvrir la fiche (PDF)</a>`
    : '';
```

par :

```js
  // Action principale de la page : le PDF de la fiche, en grand bouton sous le sous-titre.
  const pdf = fiche.file
    ? `<a class="fiche__cta" href="/api/pdf/${escapeHtml(fiche.id)}" target="_blank" rel="noopener">
                <svg class="fiche__cta-icon" aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>
                <span class="fiche__cta-text"><span class="fiche__cta-label">Ouvrir la fiche réflexive</span><span class="fiche__cta-meta">PDF · s'ouvre dans un nouvel onglet</span></span>
                <span class="fiche__cta-arrow" aria-hidden="true">↗</span>
              </a>`
    : '';
```

4. Dans le même fichier, remplacer exactement :

```js
              <p class="fiche__sub">${escapeHtml(fiche.subtitle)}</p>
              <div class="fiche__cols">
```

par :

```js
              <p class="fiche__sub">${escapeHtml(fiche.subtitle)}</p>
              ${pdf}
              <div class="fiche__cols">
```

puis remplacer exactement `                ${links}${pdf}` par `                ${links}`.

5. Dans `netlify/functions/fiche-list.js`, remplacer exactement :

```js
    styles: ['/css/faq.css', '/css/fiches.css'],
    scripts: ['/js/faq.js', '/js/faq-ripple.js'],
```

par :

```js
    styles: ['/css/nav.css', '/css/footer.css', '/css/faq.css', '/css/fiches.css'],
    scripts: ['/js/faq.js', '/js/faq-ripple.js'],
    footer: true,
```

6. Lancer `node --check` sur les trois fichiers modifiés.
7. Lancer ce contrôle (il ne doit afficher que `balisage ok`) :

```bash
node --input-type=module -e "const { renderPage } = await import('./netlify/functions/lib/page.js'); const { renderFichesScene } = await import('./netlify/functions/lib/fiches-view.js'); const { fiches, author } = await import('./netlify/functions/lib/fiche-repository.js'); const html = renderPage({ title: 't', nav: [{ href: '/', label: 'Accueil' }], bodyClass: 'espace', styles: ['/css/nav.css', '/css/footer.css', '/css/faq.css', '/css/fiches.css'], footer: true, body: '<main class=\"espace__main\">' + renderFichesScene(fiches, author) + '</main>' }); const count = (re) => (html.match(re) || []).length; const need = [['header nav', count(/<header class=\"nav espace__bar\">/g), 1], ['marque', count(/korrighed\.dev<\/span>/g), 1], ['deconnexion', count(/class=\"espace__logout\"/g), 1], ['pied clair', count(/site-footer site-footer--light/g), 1], ['cta', count(/class=\"fiche__cta\"/g), 3], ['cta twitch', count(/href=\"\/api\/pdf\/twitch\"/g), 1], ['ancien lien pdf', count(/Ouvrir la fiche \(PDF\)/g), 0], ['nav.css', count(/href=\"\/css\/nav\.css\"/g), 1], ['footer.css', count(/href=\"\/css\/footer\.css\"/g), 1]]; for (const [n, got, want] of need) if (got !== want) throw new Error(n + ' : ' + got + ' au lieu de ' + want); const sans = renderPage({ title: 't', body: '' }); if (sans.includes('site-footer') || sans.includes('espace__bar')) throw new Error('page sans nav ni pied'); console.log('balisage ok')"
```

## Critères d'acceptation

- [ ] AC-01 : Étant donné la page des fiches rendue avec `footer: true`, alors elle contient un seul `<header class="nav espace__bar">` avec la marque « korrighed.dev » et un bouton « Se déconnecter », et un seul pied de page `site-footer site-footer--light`.
- [ ] AC-02 : Étant donné trois fiches avec fichier, alors la page contient trois `fiche__cta`, chacun vers `/api/pdf/<id>` en `target="_blank" rel="noopener"`, placé après le sous-titre et avant les colonnes ; l'ancien texte « Ouvrir la fiche (PDF) » n'existe plus.
- [ ] AC-03 : Étant donné `renderPage` sans `nav` ni `footer`, alors ni en-tête ni pied de page ne sont produits.
- [ ] AC-04 : Étant donné la liste des feuilles de style, alors `nav.css` et `footer.css` sont chargées avant `faq.css` et `fiches.css`.

## Vérification

Les commandes des étapes 6 et 7. Utiliser l'outil Grep (le `grep` du shell est peu fiable ici) pour AC-04.

Rendu navigateur : à rejouer par moi (T602 fournit les styles).

## Hors périmètre

- Ne pas modifier de fichier CSS (T602), ni `fiche-repository.js`, ni les fichiers sous `docs/`.
- Ne pas committer.

## Notes d'exécution

<Réservé à l'exécuteur.>

- Étapes 1 à 7 appliquées telles quelles. `node --check` OK sur les trois fichiers. Contrôle de balisage : `balisage ok`. Contrôle supplémentaire : CTA entre sous-titre et colonnes sur les trois fiches, ordre des feuilles de style correct.
- AC-04 vérifié par Grep : `fiche-list.js` ligne 11, `nav.css` et `footer.css` avant `faq.css` et `fiches.css`.
- Point non couvert par la tâche : `public/css/nav.css` (lignes 71-83) masque `.nav__menu` sous 48rem sauf `.nav__menu.is-open`. Le nouvel en-tête n'a ni `.nav__toggle` ni `#nav-menu`, et `public/js/nav.js` (qui pose `is-open`) n'est pas chargé sur la page. Sur mobile, « Accueil » et « Se déconnecter » ne sont pas accessibles. Correction à arbitrer hors T601.
