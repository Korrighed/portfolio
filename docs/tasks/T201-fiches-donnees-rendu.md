# T201 — Données des fiches et rendu serveur de la scène

Statut : à faire
Story : US-08 · Exigences : F-11, F-12, F-20, T-22
Dépend de : aucune
Parallélisable : oui (aucun fichier en commun avec T202)
Exécutant : executor

## Objectif

La fonction `fiche-list` (page protégée `/fiches-reflexives`) rend une scène à onglets : un onglet par fiche (titre du document), un panneau par fiche (sous-titre, compétences, livrables, statut, date, liens). Les trois fiches réelles remplacent la fiche de test. `fiche-detail` redirige vers la liste.

## Fichiers à lire

- `netlify/functions/lib/fiche-repository.js`, `lib/page.js`, `fiche-list.js`, `fiche-detail.js`, `lib/auth.js` (ne pas modifier `auth.js`)
- `src/sections/faq.html` et `scripts/build-index.js` (`renderFaqTabs`, `renderFaqPanels`) — le balisage à reproduire côté serveur, à ne pas modifier

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `netlify/functions/lib/fiche-repository.js` | remplacer | auteur et trois fiches |
| `netlify/functions/lib/fiches-view.js` | créer | rendu HTML de la scène |
| `netlify/functions/lib/page.js` | remplacer | options `bodyClass`, `styles`, `scripts`, métadonnées |
| `netlify/functions/fiche-list.js` | remplacer | rend la scène |
| `netlify/functions/fiche-detail.js` | remplacer | redirection vers la liste |

## Étapes

1. Remplacer **tout** le contenu de `netlify/functions/lib/fiche-repository.js` par exactement :

```js
// Metadonnees des fiches reflexives, affichees sur la page protegee /fiches-reflexives.
// Le PDF de chaque fiche vit dans le store Netlify Blobs (cf. storage.js), jamais commite dans le repo.
export const author = {
  name: 'Alexis Boutin',
  program: "Licence professionnelle Métiers de l'informatique — Applications web",
};

export const fiches = [
  {
    id: 'affmar',
    file: 'fiche-affmar.pdf',
    title: 'Générateur PDF AFFMAR',
    subtitle: 'Signalement officiel de navire avec limites de caractères validées',
    date: '2026-06-12',
    competences: [
      'Assurer la qualité, la sûreté, la sécurité et la performance des applications',
      'Concevoir, déployer, gérer et faire évoluer une application',
      'Maîtriser la programmation',
    ],
    livrables: [
      'Formulaire de signalement navire côté pilote (mobile-first, Next.js)',
      'Service de génération PDF AFFMAR automatisé (Laravel)',
      'Système de validation des limites de caractères par champ',
      "Interface d'administration pour édition et génération du PDF",
      'Service de pré-remplissage automatique des champs (~40 % des champs)',
    ],
    status: 'En qualification (juin 2026), en attente des retours clients.',
    links: [],
  },
  {
    id: 'hotfix-ci-cd',
    file: 'fiche-hotfix-ci-cd.pdf',
    title: 'Gestion des HotFix en CI/CD',
    subtitle: 'Pipeline Git Flow et maintenance parallèle en environnement agile',
    date: '2026-07-01',
    competences: [
      "Analyse, conception, déploiement et maintenance d'applications et de serveurs d'applications",
      "Appliquer les normes et standards en vigueur dans un environnement de développement normatif",
      "Travailler en équipe et en réseau ainsi qu'en autonomie et responsabilité au service d'un projet",
      'Communiquer par oral et par écrit, de façon claire et non-ambiguë, en français et dans au moins une langue étrangère',
    ],
    livrables: [
      "Processus d'application de hotfixes en production sans bloquer le développement en cours",
      'Guide étape-par-étape documenté dans le README du projet',
      "Communication formalisée avec l'équipe via merge requests GitLab",
      "Intégration d'un hotfix de la branche main vers la branche de développement",
      "Synchronisation de l'historique Git après merge et suppression des branches hotfix",
    ],
    status: "Processus opérationnel et documenté pour l'équipe de développement.",
    links: [],
  },
  {
    id: 'yozora',
    file: 'fiche-yozora.pdf',
    title: 'Site yozoravtfan.netlify.app',
    subtitle: 'Sécurité, CI/CD et communication API',
    date: '2026-05-18',
    competences: [
      'Assurer la qualité, la sûreté, la sécurité et la performance des applications',
      'Concevoir, déployer, gérer et faire évoluer une application',
      'Maîtriser la programmation',
    ],
    livrables: [
      "Site public de promotion sans friction d'accès pour créateur de contenu",
      "Le visiteur consulte directement les informations Twitch en temps réel sans authentification préalable.",
      'Gestion des secrets hors du contrôle de version, via .env local et tableau de bord Netlify en production.',
      'Communication API sécurisée par OAuth server-to-server.',
      'Pipeline CI/CD entièrement automatisé du commit au déploiement.',
    ],
    status: 'Online and ready for update.',
    links: [
      { label: 'Dépôt du front', href: 'https://github.com/Korrighed/Yozora_Site/' },
      { label: 'Site en ligne', href: 'https://yozoravtfan.netlify.app' },
    ],
  },
];

export function findFiche(event) {
  const id = event.queryStringParameters?.id;
  return fiches.find((f) => f.id === id) || null;
}
```

2. Créer `netlify/functions/lib/fiches-view.js` avec exactement :

```js
// Scene a onglets des fiches reflexives (meme balisage que la FAQ de l'accueil, version sombre).
// Les roles ARIA et les changements d'onglet sont poses par /js/faq.js.
const escapeHtml = (text) =>
  String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pad = (n) => String(n).padStart(2, '0');

const list = (items) => `<ul class="fiche__list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;

function renderTab(fiche, index) {
  return `          <button class="faq__tab" type="button"><span class="faq__num" aria-hidden="true">${pad(index + 1)}</span><span class="faq__label">${escapeHtml(fiche.title)}</span></button>`;
}

function renderPanel(fiche, index, total) {
  const links = fiche.links
    .map((link) => `<a class="fiche__link" href="${escapeHtml(link.href)}" target="_blank" rel="noopener">${escapeHtml(link.label)} ↗</a>`)
    .join('');
  const pdf = fiche.file
    ? `<a class="fiche__link" href="/api/pdf/${escapeHtml(fiche.id)}" target="_blank" rel="noopener">Ouvrir la fiche (PDF)</a>`
    : '';
  return `            <article class="faq__panel" id="faq-panel-${index + 1}">
              <p class="faq__count" aria-hidden="true">${pad(index + 1)} / ${pad(total)}</p>
              <h2 class="faq__q">${escapeHtml(fiche.title)}</h2>
              <p class="fiche__sub">${escapeHtml(fiche.subtitle)}</p>
              <div class="fiche__cols">
                <section class="fiche__block fiche__block--skills">
                  <h3 class="fiche__h">Compétences</h3>
                  ${list(fiche.competences)}
                </section>
                <section class="fiche__block">
                  <h3 class="fiche__h">Livrables</h3>
                  ${list(fiche.livrables)}
                </section>
              </div>
              <p class="fiche__foot">
                <span class="fiche__status">Statut : ${escapeHtml(fiche.status)}</span>
                <time class="fiche__date" datetime="${escapeHtml(fiche.date)}">${escapeHtml(fiche.date)}</time>
                ${links}${pdf}
              </p>
            </article>`;
}

export function renderFichesScene(fiches, author) {
  const tabs = fiches.map(renderTab).join('\n');
  const panels = fiches.map((fiche, index) => renderPanel(fiche, index, fiches.length)).join('\n');
  return `<section class="faq faq--dark" aria-labelledby="fiches-title">
      <div class="faq__scene">
        <canvas class="faq__bg" aria-hidden="true"></canvas>
        <div class="faq__stage">
          <header class="faq__head">
            <span class="text-eyebrow">Espace enseignant</span>
            <h1 id="fiches-title" class="faq__title">Fiches réflexives</h1>
            <p class="fiches__author">${escapeHtml(author.name)} · ${escapeHtml(author.program)}</p>
          </header>
          <div class="faq__tabs">
${tabs}
          </div>
          <div class="faq__plate">
            <div class="faq__panels">
${panels}
            </div>
          </div>
        </div>
      </div>
    </section>`;
}
```

3. Remplacer **tout** le contenu de `netlify/functions/lib/page.js` par exactement :

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
```

4. Remplacer **tout** le contenu de `netlify/functions/fiche-list.js` par exactement :

```js
import { withAuth } from './lib/auth.js';
import { author, fiches } from './lib/fiche-repository.js';
import { renderFichesScene } from './lib/fiches-view.js';
import { renderPage } from './lib/page.js';

export const handler = withAuth(async () => {
  const body = renderPage({
    title: 'Fiches réflexives',
    nav: [{ href: '/', label: 'Accueil' }],
    bodyClass: 'espace',
    styles: ['/css/faq.css', '/css/fiches.css'],
    scripts: ['/js/faq.js', '/js/faq-ripple.js'],
    body: `<main class="espace__main">${renderFichesScene(fiches, author)}</main>`,
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body,
  };
}, { onFail: 'redirect' });
```

5. Remplacer **tout** le contenu de `netlify/functions/fiche-detail.js` par exactement :

```js
import { withAuth } from './lib/auth.js';
import { findFiche } from './lib/fiche-repository.js';

// Le panneau de la scene remplace la page de detail : on renvoie vers la liste.
export const handler = withAuth(async (event) => {
  if (!findFiche(event)) {
    return { statusCode: 404, body: 'Introuvable' };
  }

  return { statusCode: 302, headers: { Location: '/fiches-reflexives' }, body: '' };
}, { onFail: 'redirect' });
```

6. Lancer `node --check` sur les cinq fichiers.
7. Lancer ce contrôle de rendu (il ne doit rien afficher d'autre que `rendu ok`) :

```bash
node --input-type=module -e "process.env.SESSION_SECRET='x'.repeat(40); const { createSessionCookieHeader } = await import('./netlify/functions/lib/auth.js'); const { handler } = await import('./netlify/functions/fiche-list.js'); const cookie = (await createSessionCookieHeader({ headers: {} })).split(';')[0]; const ok = await handler({ headers: { cookie } }); const ko = await handler({ headers: {} }); const tabs = (ok.body.match(/class=\"faq__tab\"/g) || []).length; const panels = (ok.body.match(/class=\"faq__panel\"/g) || []).length; if (ok.statusCode !== 200 || tabs !== 3 || panels !== 3 || ko.statusCode !== 302 || ko.headers.Location !== '/login.html' || !ok.body.includes('faq--dark')) throw new Error(JSON.stringify({ s: ok.statusCode, tabs, panels, ko: ko.statusCode })); console.log('rendu ok')"
```

## Critères d'acceptation

- [ ] AC-01 : Étant donné une session valide, quand j'appelle `fiche-list`, alors la réponse est 200 avec 3 `class="faq__tab"`, 3 `class="faq__panel"` et `faq--dark`.
- [ ] AC-02 : Étant donné aucune session, quand j'appelle `fiche-list`, alors la réponse est 302 vers `/login.html`.
- [ ] AC-03 : Étant donné `fiche-detail` avec un `id` inconnu, alors 404 ; avec `affmar`, alors 302 vers `/fiches-reflexives`.
- [ ] AC-04 : Étant donné les cinq fichiers, alors `node --check` ne signale aucune erreur.

## Vérification

Les commandes des étapes 6 et 7. Utiliser l'outil Grep (le `grep` du shell est peu fiable ici) pour tout contrôle de contenu.

Parcours navigateur : à rejouer par moi après T202 (rendu complet).

## Hors périmètre

- Ne pas modifier `auth.js`, `storage.js`, `pdf.js`, `login.js`, `logout.js`, `netlify.toml`, ni `public/login.html`.
- Ne pas modifier `public/` ni `scripts/` ni `src/` (T202 s'en charge).
- Ne pas committer.

## Notes d'exécution

- Étapes 1 à 5 appliquées. Contrôle par diff contre les blocs de la tâche : aucune différence sur les cinq fichiers.
- Étape 6 (`node --check`, cinq fichiers) : OK.
- Étape 7 (contrôle de rendu) : `rendu ok`.
- AC-01 : 200, 3 `faq__tab`, 3 `faq__panel`, `faq--dark` (contrôle étape 7 + HTML rendu vérifié à l'outil Grep).
- AC-02 : sans session, 302 vers `/login.html` (contrôle étape 7).
- AC-03 : `fiche-detail` id `inconnu` → 404 ; id `affmar` → 302 vers `/fiches-reflexives` ; sans session → 302 vers `/login.html`.
- AC-04 : `node --check` sans erreur sur les cinq fichiers.
- Liens PDF rendus : `/api/pdf/affmar`, `/api/pdf/hotfix-ci-cd`, `/api/pdf/yozora`. Liens externes Yozora : dépôt front et site en ligne.
- Points ouverts (hors périmètre T201) :
  - `/css/fiches.css` est référencé par `fiche-list.js` : le fichier doit exister (T202), sinon la scène est non stylée.
  - Les trois PDF doivent exister dans le store Netlify Blobs sous les noms `fiche-affmar.pdf`, `fiche-hotfix-ci-cd.pdf`, `fiche-yozora.pdf` : sinon `/api/pdf/:id` renvoie 404 (`pdf.js`). Non vérifié, le store n'a pas été interrogé.
- Fins de ligne : les quatre fichiers modifiés et `fiches-view.js` sont en LF ; la copie de travail est en CRLF (`core.autocrlf=true`). Aucun effet sur le contenu ni sur le commit.
- Pas de `CLAUDE.md` à la racine du projet (seul `node_modules/hot-shots/CLAUDE.md` existe) : conventions tirées du code voisin.
- `package.json` n'a pas de script `lint` : non lancé. La tâche ne le demande pas.
- `npm run build` non lancé (il régénère `public/index.html`, hors périmètre).
