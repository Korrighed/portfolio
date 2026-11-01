# T105 — Rendre la FAQ en onglets et panneaux au build

Statut : à faire
Story : US-04 · Exigences : F-07, T-18
Dépend de : T101
Parallélisable : non
Exécutant : executor

## Objectif

`scripts/build-index.js` ne produit plus le marqueur `<!-- faq:items -->` mais deux marqueurs : `<!-- faq:tabs -->` (un bouton par question) et `<!-- faq:panels -->` (un panneau par question : numéro, question, réponse). `renderFaqJsonLd` et le marqueur `<!-- faq:jsonld -->` restent identiques.

## Fichiers à lire

- `scripts/build-index.js` — fonctions `renderFaqItems`, `renderFaqJsonLd`, `buildIndex`
- `src/data/faq.json` — les 5 questions (ne pas modifier)

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `scripts/build-index.js` | modifier | `renderFaqItems` remplacée par `renderFaqTabs` et `renderFaqPanels`, deux marqueurs dans `buildIndex` |

## Étapes

1. Dans `scripts/build-index.js`, supprimer la fonction exportée `renderFaqItems` (avec son commentaire) et la remplacer, à la même place, par exactement ce code :

```js
const pad = (n) => String(n).padStart(2, '0');

// Boutons des questions (marqueur <!-- faq:tabs -->). Les roles ARIA sont poses par faq.js.
export function renderFaqTabs(items) {
  return items
    .map(
      ({ q }, i) =>
        `        <button class="faq__tab" type="button" data-faq="${i + 1}"><span class="faq__num" aria-hidden="true">${pad(i + 1)}</span><span class="faq__label">${escapeHtml(q)}</span></button>`,
    )
    .join('\n');
}

// Panneaux de reponse (marqueur <!-- faq:panels -->).
export function renderFaqPanels(items) {
  return items
    .map(
      ({ q, a }, i) =>
        `          <article class="faq__panel" id="faq-panel-${i + 1}" data-faq="${i + 1}">\n            <p class="faq__count" aria-hidden="true">${pad(i + 1)} / ${pad(items.length)}</p>\n            <h3 class="faq__q">${escapeHtml(q)}</h3>\n            <p class="faq__a">${escapeHtml(a)}</p>\n          </article>`,
    )
    .join('\n');
}
```

2. Dans `buildIndex`, remplacer la ligne `.replace('<!-- faq:items -->', () => renderFaqItems(faq))` par ces deux lignes (garder la ligne `faq:jsonld` qui suit) :

```js
    .replace('<!-- faq:tabs -->', () => renderFaqTabs(faq))
    .replace('<!-- faq:panels -->', () => renderFaqPanels(faq))
```

3. Ne rien changer d'autre (`escapeHtml`, `renderFaqJsonLd`, bloc `isMain`).
4. Lancer `npm run build`. Le build réussit même si les marqueurs n'existent pas encore dans les sources (le remplacement est alors sans effet).

## Critères d'acceptation

- [ ] AC-01 : Étant donné `renderFaqTabs(items)`, alors la sortie contient 5 `class="faq__tab"`.
- [ ] AC-02 : Étant donné `renderFaqPanels(items)`, alors la sortie contient 5 `class="faq__panel"`, les identifiants `faq-panel-1` à `faq-panel-5` et le texte `01 / 05`.
- [ ] AC-03 : Étant donné `renderFaqJsonLd(items)`, alors le résultat est inchangé (5 `Question`).
- [ ] AC-04 : Étant donné `scripts/build-index.js`, alors il ne contient plus `renderFaqItems` ni `faq:items`.

## Vérification

```bash
npm run build
node --input-type=module -e "import { renderFaqTabs, renderFaqPanels, renderFaqJsonLd } from './scripts/build-index.js'; import { readFileSync } from 'node:fs'; const items = JSON.parse(readFileSync('src/data/faq.json', 'utf8')); console.log(renderFaqTabs(items).split('class=\"faq__tab\"').length - 1); console.log(renderFaqPanels(items).split('class=\"faq__panel\"').length - 1); console.log(JSON.parse(renderFaqJsonLd(items).replace(/<\/?script[^>]*>/g, '')).mainEntity.length)"
```

Attendu : build réussi, puis `5`, `5`, `5`. (Le `grep` du shell est peu fiable ici : utiliser l'outil Grep pour AC-04.)

Parcours navigateur : aucun (pas d'impact visible avant T106).

## Hors périmètre

- Ne pas modifier `src/data/faq.json`, `src/sections/*` ni `src/index.template.html`.
- Ne pas committer.

## Notes d'exécution

- Lecture : aucun `CLAUDE.md` à la racine du projet (seul `node_modules/hot-shots/CLAUDE.md` existe). Aucune convention projet supplémentaire appliquée.
- Préconditions T101 vérifiées : `renderFaqItems` présent, `src/data/faq.json` = 5 entrées.
- Étapes 1 à 3 appliquées dans `scripts/build-index.js` uniquement. `escapeHtml`, `renderFaqJsonLd` et le bloc `isMain` non touchés.
- Étape 4 : `npm run build` réussi. `public/index.html` régénéré.
- Vérification node : `5`, `5`, `5`. Panneaux : `faq-panel-1` à `faq-panel-5` présents, `01 / 05` présent.
- AC-04 : outil Grep sur `scripts/build-index.js`, aucune occurrence de `renderFaqItems` ni `faq:items`.
- `npm run lint` : pas de script `lint` dans `package.json`, non exécuté.
- Point à surveiller (écart avec « pas d'impact visible avant T106 ») : `src/sections/faq.html:25` contient encore `<!-- faq:items -->`. Ce marqueur n'est plus remplacé. Résultat dans `public/index.html` : marqueur littéral à la ligne 376 et 0 occurrence de `faq__item` (avant T105 : 5). Les questions n'apparaissent plus dans le build tant que T106 ne remplace pas ce marqueur. Non corrigé : `src/sections/*` est hors périmètre.
- Aucun commit, aucune commande git en écriture.
