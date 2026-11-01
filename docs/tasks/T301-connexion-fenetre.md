# T301 — Connexion enseignant dans une fenêtre sur le site

Statut : à faire
Story : US-07 · Exigences : F-10, F-21, T-24, NF-07
Dépend de : aucune
Parallélisable : non
Exécutant : executor

## Objectif

Le lien « Espace enseignant » (barre de navigation et pied de page) ouvre une fenêtre (`<dialog>`) sur l'accueil, en thème sombre, avec un champ « Code d'accès ». Le code est envoyé à `/api/login` sans quitter la page : en cas de succès on va sur `/fiches-reflexives`, sinon « Code incorrect. » s'affiche dans la fenêtre. Sans JavaScript, le lien mène toujours à `/login.html` (inchangé, repli). Avec JavaScript, `/login.html` renvoie vers `/?connexion=1`, qui ouvre la fenêtre.

## Fichiers à lire

- `src/index.template.html` — liens CSS, includes, scripts
- `src/sections/nav.html`, `src/sections/footer.html` — liens `href="/login.html"` (ne pas les modifier)
- `public/login.html` — page de repli
- `public/css/main.css` — jetons `--color-*`, `--space-*`, `--font-display-family`, `.text-eyebrow`

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/sections/login-dialog.html` | créer | balisage de la fenêtre |
| `public/css/login-dialog.css` | créer | style de la fenêtre |
| `public/js/login-dialog.js` | créer | ouverture, envoi, erreur |
| `src/index.template.html` | modifier | lien CSS, include, script |
| `public/login.html` | modifier | redirection vers `/?connexion=1` quand JavaScript est actif |

## Étapes

1. Créer `src/sections/login-dialog.html` avec exactement :

```html
  <dialog id="login-dialog" class="login" aria-labelledby="login-title">
    <form class="login__form" method="post" action="/api/login">
      <button class="login__close" type="button" aria-label="Fermer" data-login-close><span aria-hidden="true">×</span></button>
      <span class="text-eyebrow">Espace enseignant</span>
      <h2 id="login-title" class="login__title">Connexion</h2>
      <p class="login__error" id="login-error" role="alert" hidden>Code incorrect.</p>
      <label class="login__label" for="login-code">Code d'accès</label>
      <input class="login__input" type="password" id="login-code" name="code" required autocomplete="current-password" />
      <button class="login__submit" type="submit">Se connecter</button>
    </form>
  </dialog>
```

2. Créer `public/css/login-dialog.css` avec exactement :

```css
/* Fenetre de connexion enseignant (sombre, comme les fiches) */
.login {
  width: min(92vw, 26rem);
  max-height: 92vh;
  padding: 0;
  border: 1px solid color-mix(in srgb, var(--color-powder-blue) 28%, transparent);
  background: var(--color-ink-black);
  color: var(--color-platinum);
}

.login::backdrop {
  background: rgb(8 17 26 / 72%);
}

.login__form {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-lg);
}

.login .text-eyebrow {
  color: var(--color-powder-blue);
}

.login__title {
  margin: 0;
  font: 700 2rem / 1.1 var(--font-display-family);
}

.login__label {
  font-size: 0.875rem;
  color: var(--color-powder-blue);
}

.login__input {
  min-height: 44px;
  padding: 0 var(--space-sm);
  background: var(--color-ink-black-3);
  border: 1px solid color-mix(in srgb, var(--color-powder-blue) 40%, transparent);
  color: var(--color-platinum);
  font: inherit;
}

.login__submit {
  min-height: 44px;
  background: var(--color-powder-blue);
  border: 0;
  color: var(--color-ink-black);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.login__submit:hover {
  background: var(--color-platinum);
}

.login__submit:disabled {
  opacity: 0.6;
  cursor: wait;
}

.login__error {
  margin: 0;
  color: #ffb4ab;
}

.login__close {
  position: absolute;
  top: var(--space-xs);
  right: var(--space-xs);
  width: 44px;
  height: 44px;
  background: none;
  border: 0;
  color: var(--color-powder-blue);
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
}

.login__close:hover {
  color: var(--color-platinum);
}

.login :focus-visible {
  outline: 2px solid var(--color-powder-blue);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: no-preference) {
  .login[open] {
    animation: login-in 250ms ease;
  }

  @keyframes login-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
  }
}
```

3. Créer `public/js/login-dialog.js` avec exactement :

```js
// Connexion enseignant dans une fenetre : le lien « Espace enseignant » ouvre le <dialog>.
// Sans JavaScript, le lien mene a /login.html (page de repli).
const dialog = document.querySelector('#login-dialog');

if (dialog && typeof dialog.showModal === 'function') {
  const form = dialog.querySelector('form');
  const input = dialog.querySelector('#login-code');
  const error = dialog.querySelector('#login-error');
  const submit = dialog.querySelector('.login__submit');

  const open = () => {
    form.reset();
    error.hidden = true;
    dialog.showModal();
    input.focus();
  };

  document.querySelectorAll('a[href="/login.html"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      open();
    });
  });

  dialog.querySelector('[data-login-close]').addEventListener('click', () => dialog.close());
  // Un clic sur le fond (le <dialog> lui-meme, sans marge interne) ferme la fenetre.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.hidden = true;
    submit.disabled = true;
    try {
      // /api/login repond par une redirection : succes vers /fiches-reflexives, echec vers /login.html?error=1.
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)),
        credentials: 'same-origin',
      });
      if (response.ok && new URL(response.url).pathname.startsWith('/fiches-reflexives')) {
        location.assign('/fiches-reflexives');
        return;
      }
      error.textContent = 'Code incorrect.';
    } catch {
      error.textContent = 'Connexion impossible, réessayez.';
    }
    error.hidden = false;
    submit.disabled = false;
    input.select();
  });

  // Arrivee depuis /login.html (acces refuse a une page protegee) : on ouvre la fenetre.
  if (new URLSearchParams(location.search).has('connexion')) {
    history.replaceState(null, '', location.pathname + location.hash);
    open();
  }
}
```

4. Dans `src/index.template.html` : ajouter, juste après la ligne `<link rel="stylesheet" href="/css/footer.css" />`, la ligne `  <link rel="stylesheet" href="/css/login-dialog.css" />` ; ajouter le bloc `<!-- include:login-dialog.html -->` (précédé d'une ligne vide) juste après `<!-- include:footer.html -->` ; ajouter, juste après la ligne `<script type="module" src="/js/faq-ripple.js"></script>`, une ligne vide puis `  <script type="module" src="/js/login-dialog.js"></script>`.
5. Dans `public/login.html`, juste après la balise ouvrante `<body>`, ajouter ces lignes (conserver les fins de ligne du fichier) :

```html
    <script>
      // Avec JavaScript : la connexion se fait dans la fenetre de l'accueil.
      location.replace('/?connexion=1');
    </script>
```

6. Lancer `npm run build`, puis `node --check public/js/login-dialog.js`.

## Critères d'acceptation

- [ ] AC-01 : Étant donné `public/index.html`, alors il contient un seul `<dialog id="login-dialog"`, `href="/css/login-dialog.css"` et `src="/js/login-dialog.js"`, et aucun marqueur `include:`.
- [ ] AC-02 : Étant donné `public/js/login-dialog.js`, alors il appelle `showModal`, envoie le code par `fetch('/api/login'` et gère `connexion` dans l'URL.
- [ ] AC-03 : Étant donné `public/login.html`, alors il contient `location.replace('/?connexion=1')` et conserve son formulaire (repli sans JavaScript).
- [ ] AC-04 : Étant donné le build, alors `npm run build` réussit et `node --check` ne signale aucune erreur.

## Vérification

```bash
npm run build
node --check public/js/login-dialog.js
```

Utiliser l'outil Grep (le `grep` du shell est peu fiable ici) pour AC-01 à AC-03.

Parcours navigateur : à rejouer par moi (ouvrir la fenêtre depuis la barre et le pied de page, code faux, code juste, Échap, mobile).

## Hors périmètre

- Ne pas modifier `netlify/`, `src/sections/nav.html`, `src/sections/footer.html`, ni les autres feuilles de style.
- Ne pas ajouter de limite de tentatives.
- Ne pas committer.

## Notes d'exécution

- Fichiers créés : `src/sections/login-dialog.html`, `public/css/login-dialog.css`, `public/js/login-dialog.js` (contenu repris tel quel de la tâche).
- Fichiers modifiés : `src/index.template.html` (lien CSS, include, script), `public/login.html` (redirection vers `/?connexion=1`, 4 lignes ajoutées).
- Fichier régénéré par `npm run build` : `public/index.html` (non listé dans les cibles, produit par le build).
- `npm run build` : OK. `node --check public/js/login-dialog.js` : OK.
- AC-01 : Grep sur `public/index.html` : 1 occurrence de `<dialog id="login-dialog"`, `href="/css/login-dialog.css"` et `src="/js/login-dialog.js"` présents, 0 occurrence de `include:`.
- AC-02 : Grep sur `public/js/login-dialog.js` : `showModal` (ligne 5 et 14), `fetch('/api/login'` (ligne 37), `connexion` (ligne 57).
- AC-03 : Grep sur `public/login.html` : `location.replace('/?connexion=1')` (ligne 15), formulaire `action="/api/login"` et champ `name="code"` conservés.
- Diff git : 24 insertions, 0 suppression (pas de churn de fins de ligne, fichiers en LF).
- Constat sans modification : `netlify.toml` déclare `/api/login` en `status = 200` (réécriture vers la fonction). La fonction renvoie un 302 ; `fetch` suit la redirection et `response.url` reflète la destination. Ce comportement n'a pas été testé en environnement déployé : à valider dans le parcours navigateur.
- Constat : avec JavaScript actif, `/login.html` redirige avant l'affichage, donc le bloc `#error-msg` de `login.html` ne s'affiche plus que sans JavaScript. Comportement attendu, pas de correction demandée.
- Pas de `CLAUDE.md` à la racine du dépôt (seul `node_modules/hot-shots/CLAUDE.md` existe). Conventions suivies d'après les fichiers voisins.
- Statut de la tâche laissé à « à faire » (hors étapes).
- Parcours navigateur non exécuté (à rejouer par l'utilisateur : barre et pied de page, code faux, code juste, Échap, mobile).
- Aucun commit.
