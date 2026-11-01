# T202 — Thème sombre de la scène et styles des fiches

Statut : à faire
Story : US-08 · Exigences : F-20, T-23, NF-07
Dépend de : aucune
Parallélisable : oui (aucun fichier en commun avec T201)
Exécutant : executor

## Objectif

La scène à onglets de la FAQ sert aussi la page des fiches : `faq.css` passe par des jetons de couleur `--faq-*` (la FAQ de l'accueil reste identique, fond clair), un modificateur `faq--dark` donne le thème sombre (fond Ink Black, texte Platinum, accent et filets Powder Blue), `fiches.css` stylise la barre et le contenu des panneaux de fiche, et les points du fond prennent la couleur du thème.

## Fichiers à lire

- `public/css/faq.css`, `public/js/faq.js`, `public/js/faq-ripple.js` — l'existant à adapter
- `public/css/main.css` — jetons `--color-*`, `--space-*`, `--font-*`, règle générique `main` (limitée à 48rem) et `.text-eyebrow`
- `docs/tasks/T201-fiches-donnees-rendu.md` — le balisage rendu côté serveur (classes `espace__*`, `fiche__*`, `fiches__author`)

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `public/css/faq.css` | modifier | couleurs passées en jetons, thème `faq--dark` |
| `public/css/fiches.css` | créer | barre de l'espace enseignant, contenu des panneaux de fiche |
| `public/js/faq.js` | modifier | sélecteur `.faq` au lieu de `#faq` |
| `public/js/faq-ripple.js` | modifier | sélecteur `.faq` ; couleur des points lue dans `--faq-dot` |

## Étapes

1. Dans `public/css/faq.css`, remplacer exactement ce bloc :

```css
.faq {
  display: flex;
  flex-direction: column;
  min-height: var(--vh-screen);
  background: var(--color-platinum);
}

.faq :focus-visible {
  outline: 2px solid var(--color-yale-blue);
  outline-offset: 3px;
}
```

par :

```css
/* Jetons de theme : clair par defaut (accueil), sombre avec .faq--dark (espace enseignant) */
.faq {
  --faq-bg: var(--color-platinum);
  --faq-fg: var(--color-ink-black);
  --faq-muted: var(--color-slate-dark);
  --faq-accent: var(--color-yale-blue);
  --faq-on-accent: var(--color-platinum);
  --faq-line: var(--color-powder-blue);
  --faq-dot: 52, 73, 102; /* Yale Blue, en rgb pour le canvas */
  display: flex;
  flex-direction: column;
  min-height: var(--vh-screen);
  background: var(--faq-bg);
  color: var(--faq-fg);
}

.faq--dark {
  --faq-bg: var(--color-ink-black);
  --faq-fg: var(--color-platinum);
  --faq-muted: var(--color-powder-blue);
  --faq-accent: var(--color-powder-blue);
  --faq-on-accent: var(--color-ink-black);
  --faq-line: color-mix(in srgb, var(--color-powder-blue) 28%, transparent);
  --faq-dot: 180, 205, 237; /* Powder Blue */
}

.faq .text-eyebrow {
  color: var(--faq-accent);
}

.faq :focus-visible {
  outline: 2px solid var(--faq-accent);
  outline-offset: 3px;
}
```

2. Dans `public/css/faq.css`, remplacer exactement :

```css
  border: 1px solid var(--color-powder-blue);
  color: var(--color-yale-blue);
  font: inherit;
  cursor: pointer;
}

.faq__tab:hover {
  border-color: var(--color-yale-blue);
}

.faq__tab[aria-selected='true'] {
  background: var(--color-yale-blue);
  border-color: var(--color-yale-blue);
  color: var(--color-platinum);
}
```

par :

```css
  border: 1px solid var(--faq-line);
  color: var(--faq-accent);
  font: inherit;
  cursor: pointer;
}

.faq__tab:hover {
  border-color: var(--faq-accent);
}

.faq__tab[aria-selected='true'] {
  background: var(--faq-accent);
  border-color: var(--faq-accent);
  color: var(--faq-on-accent);
}
```

3. Dans `public/css/faq.css`, remplacer exactement :

```css
  letter-spacing: 0.14em;
  color: var(--color-yale-blue);
}
```

par :

```css
  letter-spacing: 0.14em;
  color: var(--faq-accent);
}
```

4. Dans `public/css/faq.css`, remplacer exactement :

```css
  line-height: 1.65;
  color: var(--color-slate-dark);
}
```

par :

```css
  line-height: 1.65;
  color: var(--faq-muted);
}
```

5. Dans `public/css/faq.css`, dans le bloc `@media (min-width: 64rem)`, remplacer exactement :

```css
    border-top: 1px solid var(--color-powder-blue);
    color: var(--color-slate-dark);
    text-align: left;
  }

  .faq__tab:last-child {
    border-bottom: 1px solid var(--color-powder-blue);
  }

  .faq__tab:hover {
    color: var(--color-ink-black);
  }

  .faq__tab[aria-selected='true'] {
    background: none;
    border-top-color: var(--color-yale-blue);
    color: var(--color-ink-black);
  }

  .faq__num {
    color: var(--color-yale-blue);
  }
```

par :

```css
    border-top: 1px solid var(--faq-line);
    color: var(--faq-muted);
    text-align: left;
  }

  .faq__tab:last-child {
    border-bottom: 1px solid var(--faq-line);
  }

  .faq__tab:hover {
    color: var(--faq-fg);
  }

  .faq__tab[aria-selected='true'] {
    background: none;
    border-top-color: var(--faq-accent);
    color: var(--faq-fg);
  }

  .faq__num {
    color: var(--faq-accent);
  }
```

6. Créer `public/css/fiches.css` avec exactement :

```css
/* Espace enseignant : fiches reflexives. Reprend la scene a onglets de la FAQ (faq.css)
   en version sombre (.faq--dark). Chargee apres faq.css. */
body.espace {
  --espace-bar-h: 4.75rem;
  background: var(--color-ink-black);
  color: var(--color-platinum);
}

/* main.css limite <main> a 48rem : la scene prend toute la largeur */
.espace__main {
  max-width: none;
  margin: 0;
  padding: 0;
}

.espace .faq {
  min-height: calc(var(--vh-screen) - var(--espace-bar-h));
}

/* Barre : retour a l'accueil et deconnexion */
.espace__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  min-height: var(--espace-bar-h);
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.espace__links {
  display: flex;
  gap: var(--space-md);
}

.espace__bar a,
.espace__bar button {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0;
  background: none;
  border: 0;
  color: var(--color-powder-blue);
  font: inherit;
  font-size: 0.9375rem;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--color-powder-blue) 50%, transparent);
  text-underline-offset: 0.3em;
}

.espace__bar a:hover,
.espace__bar button:hover {
  color: var(--color-platinum);
}

.espace__bar :focus-visible {
  outline: 2px solid var(--color-powder-blue);
  outline-offset: 3px;
}

/* En-tete : auteur et formation */
.fiches__author {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--faq-muted);
}

/* Panneau d'une fiche */
.fiche__sub {
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
  font-style: italic;
  color: var(--faq-muted);
}

.fiche__cols {
  display: grid;
  gap: var(--space-md);
}

.fiche__h {
  margin: 0 0 var(--space-xs);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--faq-accent);
}

.fiche__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--faq-muted);
}

.fiche__list li {
  position: relative;
  padding-left: 1.25rem;
}

/* Puce : petit losange creux, clin d'oeil au logo */
.fiche__list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5em;
  width: 6px;
  height: 6px;
  border: 1.5px solid var(--faq-accent);
  transform: rotate(45deg);
}

/* Les competences sont l'information principale */
.fiche__block--skills .fiche__list {
  font-size: 1rem;
  color: var(--faq-fg);
}

.fiche__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 var(--space-md);
  margin: 0;
  font-size: 0.875rem;
  color: var(--faq-muted);
}

.fiche__status {
  color: var(--faq-fg);
}

.fiche__link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-weight: 600;
  color: var(--faq-fg);
  text-decoration: underline;
  text-decoration-color: var(--faq-accent);
  text-underline-offset: 0.3em;
}

.fiche__link:hover {
  color: var(--faq-accent);
}

@media (max-width: 48rem) {
  .espace__bar {
    padding-inline: var(--space-sm);
  }
}

/* Menu a gauche (colonnes 1 a 4), fiche a droite (colonnes 5 a 12), deux colonnes de contenu */
@media (min-width: 64rem) {
  .espace .faq__head {
    grid-column: 1 / span 4;
  }

  .espace .faq.is-tabs .faq__tabs {
    grid-column: 1 / span 4;
  }

  .espace .faq__plate {
    grid-column: 5 / span 8;
    padding-inline-start: var(--space-lg);
  }

  .fiche__cols {
    grid-template-columns: 1fr 1fr;
  }
}
```

7. Dans `public/js/faq.js`, remplacer `const section = document.querySelector('#faq');` par `const section = document.querySelector('.faq');`.
8. Dans `public/js/faq-ripple.js`, remplacer `const section = document.querySelector('#faq');` par `const section = document.querySelector('.faq');`.
9. Dans `public/js/faq-ripple.js`, remplacer la ligne `  const COLOR = '52, 73, 102'; // Yale Blue` par :

```js
  // Couleur des points (rgb) : jeton --faq-dot du theme (Yale Blue en clair, Powder Blue en sombre)
  const COLOR = getComputedStyle(section).getPropertyValue('--faq-dot').trim() || '52, 73, 102';
```

10. Lancer `node --check public/js/faq.js` et `node --check public/js/faq-ripple.js`.

## Critères d'acceptation

- [ ] AC-01 : Étant donné `public/css/faq.css`, alors il contient `.faq--dark`, les jetons `--faq-bg`, `--faq-fg`, `--faq-muted`, `--faq-accent`, `--faq-on-accent`, `--faq-line`, `--faq-dot`, et plus aucune des couleurs `var(--color-yale-blue)` ni `var(--color-slate-dark)` dans les règles `.faq__tab`, `.faq__count`, `.faq__a` et `.faq__num`.
- [ ] AC-02 : Étant donné `public/css/fiches.css`, alors il existe et contient `.espace__bar`, `.fiche__list` et `.faq--dark` n'y est pas redéfini.
- [ ] AC-03 : Étant donné `public/js/faq.js` et `public/js/faq-ripple.js`, alors ils utilisent `document.querySelector('.faq')`, plus aucun `'#faq'`, et `faq-ripple.js` lit `--faq-dot`.
- [ ] AC-04 : Étant donné les deux scripts, alors `node --check` ne signale aucune erreur.

## Vérification

```bash
node --check public/js/faq.js
node --check public/js/faq-ripple.js
```

Utiliser l'outil Grep (le `grep` du shell est peu fiable ici) pour AC-01 à AC-03. Ne pas lancer `npm run build` : la tâche ne touche pas aux sources de l'accueil (il sera lancé par moi).

Parcours navigateur : à rejouer par moi (accueil : la FAQ est inchangée ; page des fiches : thème sombre).

## Hors périmètre

- Ne pas modifier `netlify/`, `src/`, `scripts/`, `public/css/main.css` ni `public/css/projets.css`.
- Ne pas modifier le balisage de la FAQ de l'accueil (`src/sections/faq.html`).
- Ne pas committer.

## Notes d'exécution

- Étapes 1 à 10 appliquées à la lettre. `fiches.css` créé avec le contenu de l'étape 6.
- Aucun `CLAUDE.md` à la racine du projet (Glob : seul `node_modules/hot-shots/CLAUDE.md`).
- `node --check public/js/faq.js` et `node --check public/js/faq-ripple.js` : aucune erreur.
- AC-01 (Grep sur `faq.css`) : `var(--color-yale-blue)` et `var(--color-slate-dark)` restent seulement hors des règles listées, à savoir `.section-divider__line` (ligne 16) et les définitions de jetons dans `.faq` (lignes 35-36). Les jetons `--faq-*` et `.faq--dark` sont présents.
- AC-02 (Grep sur `fiches.css`) : `.espace__bar` et `.fiche__list` présents. `.faq--dark` n'apparaît qu'en commentaire d'en-tête (ligne 2), jamais en règle.
- AC-03 (Grep) : `faq.js` et `faq-ripple.js` utilisent `querySelector('.faq')`, plus aucun `'#faq'` dans ces deux fichiers. `faq-ripple.js` lit `--faq-dot` (ligne 22).
- Accueil : `id="faq" class="faq"` figure une seule fois dans `src/sections/faq.html` et `public/index.html`, donc `.faq` le cible. Les jetons clairs reprennent les valeurs précédentes : rendu attendu inchangé (contrôle navigateur à faire).
- Hors périmètre, non modifié : `public/js/projets-scroll.js:292` utilise encore `querySelector('#faq')`. Il reste valide tant que l'accueil garde `id="faq"`.
- `npm run build` non lancé (volontaire, selon la tâche). Parcours navigateur à rejouer par l'orchestrateur.
- Aucun fichier de `netlify/`, `src/`, `scripts/`, `main.css` ou `projets.css` touché. Aucun commit.
