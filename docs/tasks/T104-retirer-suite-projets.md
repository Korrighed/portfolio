# T104 — Retirer les liens « Suite : … » de la section Projets

Statut : à faire
Story : US-01 · Exigences : F-04
Dépend de : aucune
Parallélisable : oui (aucun fichier en commun avec T101, T102 et T103)
Exécutant : executor

## Objectif

Les cinq scènes de la section Projets n'ont plus de bouton « Suite : … ». La navigation passe uniquement par le menu des projets (colonne de gauche, ou vue latérale sous 48rem). Aucun code mort ne reste pour ces boutons.

## Fichiers à lire

- `src/sections/projets.html` — les cinq `<button class="project__next" …>` (lignes 39, 78, 118, 159, 199 environ)
- `public/css/projets.css` — règles `.project__next` (vers les lignes 196 à 217) et la liste de sélecteurs en fin de fichier (vers la ligne 829)
- `public/js/projets-scroll.js` — fonction `goTo` et le gestionnaire des éléments `[data-goto]` (vers les lignes 287 à 303 et 355 à 365)

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/sections/projets.html` | modifier | 5 lignes `<button class="project__next" …>…</button>` supprimées |
| `public/css/projets.css` | modifier | règles `.project__next` supprimées |
| `public/js/projets-scroll.js` | modifier | paramètre `atStart` et commentaire « Suite » supprimés |

## Étapes

1. Dans `src/sections/projets.html`, supprimer chacune des 5 lignes entières qui contiennent `class="project__next"` (une par projet, avec `data-goto="1"`, `"2"`, `"3"`, `"4"` puis `"contact"`). Ne toucher ni au `<p class="project__links">` ni au `<div class="step project__foot">` qui les entoure. Conserver la fin de ligne du fichier.
2. Dans `public/css/projets.css`, supprimer les trois blocs `.project__next { … }`, `.project__next b { … }` et `.project__next:hover b { … }` (et la ligne vide qui les suit).
3. Dans `public/css/projets.css`, dans la dernière règle du fichier, remplacer le sélecteur

```css
  .project__links a,
  .project__next {
```

par

```css
  .project__links a {
```

4. Dans `public/js/projets-scroll.js`, remplacer le commentaire et la signature

```js
  // Menu : on atterrit sur le projet entierement revele (fin de scene).
  // "Suite" : au debut du projet suivant.
  function goTo(target, atStart) {
```

par

```js
  // Menu : on atterrit sur le projet entierement revele (fin de scene).
  function goTo(target) {
```

5. Dans `public/js/projets-scroll.js`, remplacer les deux lignes

```js
      const start = project.getBoundingClientRect().top + window.scrollY;
      top = atStart ? start : start + project.offsetHeight - window.innerHeight;
```

par

```js
      const start = project.getBoundingClientRect().top + window.scrollY;
      top = start + project.offsetHeight - window.innerHeight;
```

6. Dans `public/js/projets-scroll.js`, dans le gestionnaire des `[data-goto]`, remplacer

```js
      goTo(element.getAttribute('data-goto'), element.getAttribute('data-at') === 'start');
```

par

```js
      goTo(element.getAttribute('data-goto'));
```

7. Lancer `npm run build`. Si le build échoue parce que `scripts/build-index.js` ou `src/index.template.html` est en cours de modification par une autre tâche, attendre 20 secondes et relancer une seule fois.

## Critères d'acceptation

- [ ] AC-01 : Étant donné `src/sections/projets.html`, alors il ne contient ni `project__next` ni `Suite :` ni `data-at`.
- [ ] AC-02 : Étant donné `public/css/projets.css` et `public/js/projets-scroll.js`, alors ils ne contiennent ni `project__next` ni `atStart` ni `data-at`.
- [ ] AC-03 : Étant donné le menu des projets (`.projets-nav` et `.projets-sheet`), alors ses liens `data-goto` sont intacts (5 projets plus « Me contacter » dans chacun).
- [ ] AC-04 : Étant donné `npm run build`, alors il réussit.

## Vérification

```bash
npm run build
grep -rn "project__next\|atStart\|data-at\|Suite :" src public/css public/js
grep -c "data-goto" src/sections/projets.html
```

Attendu : build réussi ; aucune ligne pour le premier `grep` ; le compte `data-goto` est supérieur à 0 (menus intacts).

Parcours navigateur : à rejouer par moi après la tâche (aller dans un projet, vérifier qu'il n'y a plus de « Suite » en bas de scène et que le menu mène bien à chaque projet).

## Hors périmètre

- Ne pas modifier le menu des projets, la vue latérale, ni le lien « Me contacter » du menu.
- Ne pas modifier le hero, les autres sections ni `src/index.template.html`.
- Ne pas committer.

## Notes d'exécution

Exécuté le 2026-11-01 par executor. Statut : completed.

- `src/sections/projets.html` : 5 lignes `project__next` supprimées (data-goto `1`, `2`, `3`, `4`, `contact`). `project__links` et `project__foot` intacts.
- `public/css/projets.css` : blocs `.project__next`, `.project__next b`, `.project__next:hover b` supprimés. Sélecteur de fin de fichier ramené à `.project__links a`.
- `public/js/projets-scroll.js` : paramètre `atStart` et commentaire « Suite » supprimés ; calcul de `top` et appel `goTo(element.getAttribute('data-goto'))` mis à jour. `const start` conservé (encore utilisé).
- `npm run build` : réussi (exit 0), sans relance.
- Effet de bord : `public/index.html` (versionné, généré par le build) a été régénéré. Il contient aussi les modifications en cours d'autres tâches (marque « korrighed.dev », lien « Questions » vers `#faq`, email retiré du footer). À régénérer à la clôture de T101 à T103.
- Vérification : `grep -rn "project__next\|atStart\|data-at\|Suite :" src public/css public/js` sans résultat ; `grep -c "data-goto" src/sections/projets.html` = 12 (6 liens par menu, `.projets-nav` et `.projets-sheet`).
- Pas de `CLAUDE.md` à la racine du dépôt (non trouvé). Pas de script `lint` dans `package.json` : non exécuté.
- Rien commité.
- Parcours navigateur : à rejouer par Alex.
