# T801 — Mentions légales

Statut : fait
Story : US-06 · Exigences : F-23, F-09, NF-13
Dépend de : aucune
Parallélisable : oui (aucun fichier en commun avec T603, T604, T701)
Exécutant : executor

## Objectif

Une page statique `/mentions-legales.html` (éditeur, hébergeur, propriété intellectuelle, données personnelles et cookies, liens externes), liée depuis le pied de page de l'accueil et celui de l'espace enseignant. L'adresse email d'Alex n'apparaît nulle part : le contact passe par le profil GitHub.

## Fichiers à lire

- `src/sections/footer.html` — pied de page de l'accueil
- `netlify/functions/lib/page.js` — fonction `renderFooter`
- `public/login.html` — exemple de page statique (têtes, favicons)
- `public/css/main.css` — jetons `--color-*`, `--space-*`, `--font-display`

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `public/mentions-legales.html` | créer | la page |
| `public/css/legal.css` | créer | styles de la page |
| `src/sections/footer.html` | modifier | lien « Mentions légales » |
| `netlify/functions/lib/page.js` | modifier | lien « Mentions légales » dans `renderFooter` |

## Étapes

1. Créer `public/mentions-legales.html` avec exactement :

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Mentions légales | korrighed.dev</title>
    <meta name="description" content="Mentions légales du portfolio korrighed.dev : éditeur, hébergeur, données personnelles et cookies." />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="stylesheet" href="/css/main.css" />
    <link rel="stylesheet" href="/css/legal.css" />
  </head>
  <body>
    <header class="legal__bar">
      <a class="legal__back" href="/">← Retour au site</a>
    </header>

    <main class="legal">
      <h1>Mentions légales</h1>

      <section>
        <h2>Éditeur du site</h2>
        <p>
          Ce site est un portfolio personnel, édité à titre non professionnel par Alexis Boutin.
          Directeur de la publication : Alexis Boutin.
          Contact : par message sur <a href="https://github.com/Korrighed">GitHub</a>.
        </p>
      </section>

      <section>
        <h2>Hébergement</h2>
        <p>
          Netlify, Inc., 512 2nd Street, Suite 200, San Francisco, CA 94107, États-Unis.
          Site : <a href="https://www.netlify.com">netlify.com</a>.
        </p>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          Les textes, le logo et les captures présentés sont la propriété d'Alexis Boutin, sauf mention contraire.
          Les noms de jeux, de services et de marques cités (Guild Wars 2, Twitch, etc.) appartiennent à leurs propriétaires respectifs.
        </p>
      </section>

      <section>
        <h2>Données personnelles et cookies</h2>
        <ul>
          <li>Le site n'utilise ni statistiques de visite, ni cookie publicitaire ou de suivi.</li>
          <li>L'espace enseignant dépose un cookie de session, strictement nécessaire à la connexion : durée de 8 heures, inaccessible au JavaScript, supprimé à la déconnexion.</li>
          <li>Lors d'une tentative de connexion à l'espace enseignant, l'adresse IP du visiteur est enregistrée pour limiter les essais (blocage de 15 minutes après 5 échecs). Elle n'est utilisée que dans ce but.</li>
          <li>Le fond animé de l'accueil charge des scripts depuis le réseau de diffusion jsDelivr, qui peut recevoir l'adresse IP du visiteur.</li>
        </ul>
        <p>
          Vous pouvez demander l'accès, la rectification ou l'effacement de vos données en contactant l'éditeur (voir « Éditeur du site »).
        </p>
      </section>

      <section>
        <h2>Liens externes</h2>
        <p>
          Le site renvoie vers des sites tiers (GitHub, projets hébergés sur Netlify, etc.). L'éditeur n'est pas responsable de leur contenu.
        </p>
      </section>
    </main>
  </body>
</html>
```

2. Créer `public/css/legal.css` avec exactement :

```css
/* Page des mentions legales : une colonne de lecture sur fond clair */
.legal__bar {
  max-width: 40rem;
  margin: 0 auto;
  padding: var(--space-sm) var(--space-sm) 0;
}

.legal__back {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--color-yale-blue);
  font-weight: 500;
}

.legal__back:hover {
  color: var(--color-ink-black);
}

.legal {
  max-width: 40rem;
  padding: var(--space-md) var(--space-sm) var(--space-xl);
  line-height: 1.6;
}

.legal h1 {
  margin: 0 0 var(--space-md);
  font: var(--font-display);
}

.legal h2 {
  margin: var(--space-lg) 0 var(--space-xs);
  font-size: 1.125rem;
  line-height: 1.3;
  color: var(--color-yale-blue);
}

.legal p,
.legal ul {
  margin: 0 0 var(--space-sm);
}

.legal ul {
  padding-left: 1.25rem;
}

.legal li + li {
  margin-top: 0.5rem;
}

.legal a {
  color: var(--color-yale-blue);
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.legal a:hover {
  color: var(--color-ink-black);
}

.legal :focus-visible,
.legal__back:focus-visible {
  outline: 2px solid var(--color-yale-blue);
  outline-offset: 3px;
}
```

3. Dans `src/sections/footer.html`, remplacer exactement la ligne :

```html
        <a href="https://github.com/Korrighed">GitHub</a>
```

par :

```html
        <a href="https://github.com/Korrighed">GitHub</a>
        <a href="/mentions-legales.html">Mentions légales</a>
```

4. Dans `netlify/functions/lib/page.js`, dans `renderFooter`, remplacer exactement la ligne :

```js
          <a href="https://github.com/Korrighed">GitHub</a>
```

par :

```js
          <a href="https://github.com/Korrighed">GitHub</a>
          <a href="/mentions-legales.html">Mentions légales</a>
```

5. Lancer `node --check netlify/functions/lib/page.js`. Ne PAS lancer `npm run build` (je le fais moi-même).

## Critères d'acceptation

- [ ] AC-01 : Étant donné `public/mentions-legales.html`, alors il contient les cinq titres `h2` (Éditeur du site, Hébergement, Propriété intellectuelle, Données personnelles et cookies, Liens externes), un lien `/` de retour et aucun `mailto:` ni `@`.
- [ ] AC-02 : Étant donné `src/sections/footer.html` et `page.js`, alors chacun contient un lien `href="/mentions-legales.html"`.
- [ ] AC-03 : Étant donné `public/css/legal.css`, alors ses accolades sont équilibrées.

## Vérification

`node --check netlify/functions/lib/page.js`, puis l'outil Grep (le `grep` du shell est peu fiable ici) pour AC-01 à AC-03.

Rendu navigateur : à rejouer par moi (bureau et 390 px).

## Hors périmètre

- Ne pas modifier `public/index.html` (généré), `nav.html`, ni les fichiers sous `docs/`.
- Ne jamais écrire d'adresse email.
- Ne pas committer.

## Notes d'exécution

<Réservé à l'exécuteur.>

- Étapes 1 à 5 appliquées, aucun fichier hors liste cible modifié. `npm run build` non lancé, rien commité.
- AC-01 à AC-03 vérifiés : 5 `h2` présents, `href="/"` présent, aucun `mailto:` ni `@`, lien `/mentions-legales.html` présent dans `footer.html` (ligne 6) et `page.js` (ligne 34), accolades de `legal.css` 12/12. `node --check netlify/functions/lib/page.js` : OK.
- Fins de ligne CRLF conservées, comme le reste du worktree.
- Affirmations légales recoupées dans le code : cookie 8 h, HttpOnly, Max-Age=0 à la déconnexion (`auth.js`) ; 5 échecs / 15 min (`rate-limit.js`) ; jsDelivr (`src/index.template.html`) ; aucun analytics dans `src/`.
- Non recoupé : adresse de Netlify, Inc. (copiée de la tâche). Inconnu, à vérifier.
- Rendu navigateur (bureau et 390 px) : à faire par l'éditeur.
