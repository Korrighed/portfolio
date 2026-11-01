# T107 — Retirer les points du fond et le losange de la FAQ

Statut : à faire
Story : US-04 · Exigences : F-07, F-19, T-19
Dépend de : T106
Parallélisable : non
Exécutant : executor

## Objectif

Aucun point ne s'affiche sur la section FAQ : le canvas `#projets-bg` (sticky, `z-index: 0`) se dessinait par-dessus la section, qui passe maintenant au-dessus de lui avec son fond Platinum uni. Le losange à chevrons autour de la réponse disparaît (balisage et style). Le reste de la scène (onglets, une réponse à la fois, tient dans un écran) ne change pas.

## Fichiers à lire

- `src/sections/faq.html` — le bloc `<svg class="faq__diamond" …>`
- `public/css/faq.css` — règles `.faq`, `.faq__diamond`, `.faq__chev`, `.faq__plate` et media queries

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/sections/faq.html` | modifier | bloc `<svg class="faq__diamond">` supprimé |
| `public/css/faq.css` | modifier | règles du losange supprimées, marges du panneau supprimées, section passée au-dessus du canvas |

## Étapes

1. Dans `src/sections/faq.html`, supprimer le bloc entier qui commence par `<svg class="faq__diamond"` et finit par `</svg>` (les 8 `<polyline>` comprises). Garder `<div class="faq__plate">` et `<div class="faq__panels">` avec leur marqueur `<!-- faq:panels -->`.
2. Dans `public/css/faq.css`, dans la règle `.faq { … }` (celle qui contient `--faq-vh: 100vh;`), ajouter ces deux lignes après `background: var(--color-platinum);` :

```css
  position: relative;
  z-index: 1;
```

et ajouter juste au-dessus de la règle ce commentaire : `/* Au-dessus du canvas #projets-bg (sticky, z-index 0) qui deborde sur cette section */`.

3. Dans `public/css/faq.css`, supprimer les trois blocs `.faq__diamond { … }`, `.faq__chev { … }` et `.faq__chev--in { … }`, ainsi que le commentaire `/* Panneau + losange ouvert */` (le remplacer par `/* Panneau de reponse */`).
4. Dans `public/css/faq.css`, règle `.faq__plate` (hors media query) : remplacer `padding: var(--space-lg) 12%;` par `padding: var(--space-md) 0;`.
5. Dans la media query `@media (min-width: 64rem)`, règle `.faq__plate` : remplacer la ligne `padding: var(--space-xl) clamp(3rem, 10%, 5rem);` par `padding: 0;`.
6. Dans `@media (min-width: 64rem) and (max-height: 800px)`, supprimer le bloc `.faq__plate { padding-block: var(--space-lg); }`. Dans `@media (max-width: 63.99rem) and (max-height: 800px)`, supprimer le bloc `.faq__plate { padding-block: var(--space-md); }`.
7. Lancer `npm run build`.

## Critères d'acceptation

- [ ] AC-01 : Étant donné `public/index.html`, alors il ne contient ni `faq__diamond` ni `faq__chev`, et contient encore 5 `class="faq__tab"` et 5 `class="faq__panel"`.
- [ ] AC-02 : Étant donné `public/css/faq.css`, alors il ne contient ni `faq__diamond`, ni `faq__chev`, ni `radial-gradient`, et la règle `.faq` contient `z-index: 1`.
- [ ] AC-03 : Étant donné `npm run build`, alors il réussit.

## Vérification

```bash
npm run build
```

Utiliser l'outil Grep (le `grep` du shell est peu fiable ici) pour AC-01 et AC-02.

Parcours navigateur : à rejouer par moi après la tâche (aucun point sur la section, plus de losange, la scène tient toujours dans l'écran).

## Hors périmètre

- Ne pas modifier `public/css/projets.css`, `public/js/projets-scroll.js` ni le canvas.
- Ne pas modifier `public/js/faq.js`, `scripts/build-index.js` ni `src/data/faq.json`.
- Ne pas ajouter de nouvelle décoration.
- Ne pas committer.

## Notes d'exécution

- Fichiers modifiés : `src/sections/faq.html`, `public/css/faq.css`. `public/index.html` régénéré par `npm run build` (non édité à la main).
- `faq.html` : bloc `<svg class="faq__diamond">` (8 `<polyline>`) supprimé. `<div class="faq__plate">`, `<div class="faq__panels">` et `<!-- faq:panels -->` conservés.
- `faq.css` : commentaire `/* Au-dessus du canvas #projets-bg ... */` posé juste au-dessus de la règle `.faq`, sous l'en-tête de section existant. `position: relative;` et `z-index: 1;` ajoutés à `.faq`. Règles `.faq__diamond`, `.faq__chev`, `.faq__chev--in` supprimées ; commentaire renommé `/* Panneau de reponse */`. `.faq__plate` : `padding: var(--space-md) 0;` (base), `padding: 0;` (min-width 64rem), blocs `padding-block` supprimés dans les deux media queries `max-height: 800px`.
- `position: relative` conservé sur `.faq__plate` (il n'a plus d'enfant absolu) : absent des étapes, non retiré.
- AC-01 (Grep sur `public/index.html`) : `faq__diamond` 0 occurrence, `faq__chev` 0, `class="faq__tab"` 5, `class="faq__panel"` 5.
- AC-02 (Grep sur `public/css/faq.css`) : `faq__diamond`, `faq__chev`, `radial-gradient` 0 occurrence ; `z-index: 1;` ligne 39, dans la règle `.faq` (lignes 32 à 40).
- AC-03 : `npm run build` réussi (`public/index.html genere depuis src/`).
- `npm run lint` non lancé : aucun script `lint` dans `package.json`.
- Point hors périmètre à traiter : `docs/DESIGN-BRIEF.md:106` décrit encore le « Losange ouvert (`.faq__diamond`) ». Non modifié (docs hors périmètre).
- Parcours navigateur : non exécuté (à rejouer par l'utilisateur).
