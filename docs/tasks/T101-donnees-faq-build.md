# T101 — Créer les données FAQ et leur rendu au build

Statut : à faire
Story : US-04 · Exigences : F-07, T-18
Dépend de : aucune
Parallélisable : non
Exécutant : executor

## Objectif

`src/data/faq.json` contient les 5 questions. `scripts/build-index.js` remplace deux marqueurs dans le HTML assemblé : `<!-- faq:items -->` par les blocs de questions, `<!-- faq:jsonld -->` par un bloc `<script type="application/ld+json">` de type `FAQPage`. Les deux fonctions de rendu sont exportées.

## Fichiers à lire

- `scripts/build-index.js` — fonction `buildIndex`, conversion `toLf`, détection du lancement direct
- `vite.config.js` — le plugin surveille déjà `src/` : aucun changement à faire

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/data/faq.json` | créer | tableau de 5 objets `{ "q": …, "a": … }` |
| `scripts/build-index.js` | modifier | lecture du JSON, deux fonctions de rendu exportées, remplacement des deux marqueurs |

## Étapes

1. Créer `src/data/faq.json` avec exactement ce contenu (UTF-8, indentation de 2 espaces, apostrophes droites `'`) :

```json
[
  {
    "q": "Quel est mon profil de développeur ?",
    "a": "Je suis capable de travailler aussi bien sur le front que sur le back, avec une préférence marquée pour l'applicatif et le back. Mon objectif est toujours de traduire les règles et les besoins métier en un outil qui facilite le quotidien."
  },
  {
    "q": "Est-ce que je suis capable de travailler en équipe ?",
    "a": "Oui. J'ai assuré la gestion de différents projets en tant que développeur junior, ainsi que l'infrastructure de certains d'entre eux. Je maîtrise des outils comme Git Flow et GitLab pour faciliter au mieux le travail en équipe."
  },
  {
    "q": "Est-ce que je travaille en architecture distribuée ?",
    "a": "Oui. Je sais m'adapter aux différentes technologies, qu'il s'agisse de SOAP ou de REST. Concernant le MCP (Model Context Protocol), c'est une compétence que je suis encore en train de développer."
  },
  {
    "q": "Est-ce que j'utilise l'IA pour coder ?",
    "a": "Oui, principalement Claude Code. J'accorde un effort particulier au travail préparatoire : le choix de la technologie et l'identification du besoin, via des documents comme les PRD et les TRD, pour cadrer au mieux le développement avec ces nouveaux outils. J'essaie aussi d'exploiter les agents au mieux, en les répartissant entre plusieurs tâches et flux de travail."
  },
  {
    "q": "Est-ce que je suis capable de respecter et de créer une identité visuelle ?",
    "a": "Ce n'est pas mon domaine d'expertise. En revanche, je sais parfaitement créer ou respecter une identité visuelle propre et cohérente pour chaque projet."
  }
]
```

2. Dans `scripts/build-index.js`, après la ligne `const outPath = …`, ajouter :

```js
const faqPath = join(root, 'src', 'data', 'faq.json');
```

3. Dans `scripts/build-index.js`, après la fonction `toLf` et avant `export function buildIndex`, ajouter exactement :

```js
const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Blocs de questions de la section FAQ (marqueur <!-- faq:items -->).
export function renderFaqItems(items) {
  return items
    .map(
      ({ q, a }) =>
        `        <div class="faq__item">\n          <h3 class="faq__q">${escapeHtml(q)}</h3>\n          <p class="faq__a">${escapeHtml(a)}</p>\n        </div>`,
    )
    .join('\n');
}

// Donnees structurees schema.org FAQPage (marqueur <!-- faq:jsonld -->).
export function renderFaqJsonLd(items) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
  const json = JSON.stringify(data, null, 2).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">\n${json}\n  </script>`;
}
```

4. Dans `buildIndex`, remplacer la déclaration `const html = template.replace(…)` par ce qui suit (les includes d'abord, puis les marqueurs) :

```js
  const faq = JSON.parse(readFileSync(faqPath, 'utf8'));
  const html = template
    .replace(/<!-- include:(.+?) -->/g, (_match, file) =>
      toLf(readFileSync(join(sectionsDir, file.trim()), 'utf8')).trimEnd(),
    )
    .replace('<!-- faq:items -->', () => renderFaqItems(faq))
    .replace('<!-- faq:jsonld -->', () => renderFaqJsonLd(faq));
```

5. Ne rien changer d'autre dans le fichier (le bloc `isMain` reste identique).

## Critères d'acceptation

- [ ] AC-01 : Étant donné `src/data/faq.json`, quand je le parse, alors c'est un tableau de 5 objets ayant chacun les clés `q` et `a`.
- [ ] AC-02 : Étant donné le script modifié, quand je lance `npm run build`, alors il réussit et `public/index.html` est écrit.
- [ ] AC-03 : Étant donné `renderFaqItems(items)`, alors la sortie contient 5 occurrences de `class="faq__item"`.
- [ ] AC-04 : Étant donné `renderFaqJsonLd(items)`, alors la sortie commence par `<script type="application/ld+json">` et le JSON contient 5 `Question`.

## Vérification

```bash
npm run build
node --input-type=module -e "import { renderFaqItems, renderFaqJsonLd } from './scripts/build-index.js'; import { readFileSync } from 'node:fs'; const items = JSON.parse(readFileSync('src/data/faq.json', 'utf8')); console.log(renderFaqItems(items).split('faq__item').length - 1); console.log(JSON.parse(renderFaqJsonLd(items).replace(/<\/?script[^>]*>/g, '')).mainEntity.length)"
```

Attendu : le build réussit, puis `5` et `5`.

Parcours navigateur : aucun (pas d'impact visible).

## Hors périmètre

- Ne pas modifier `vite.config.js`, `src/index.template.html` ni `src/sections/*`.
- Ne pas reformuler les textes de `faq.json`.
- Ne pas committer.

## Notes d'exécution

- Fichiers : `src/data/faq.json` créé (5 objets `q`/`a`, texte repris tel quel, saut de ligne final ajouté) ; `scripts/build-index.js` modifié (`faqPath`, `escapeHtml`, `renderFaqItems`, `renderFaqJsonLd` exportées, `buildIndex` lit le JSON et remplace les deux marqueurs). Bloc `isMain` inchangé.
- `npm run build` : réussit, `public/index.html` écrit.
- Commande de vérification : `5` puis `5`.
- AC-01 à AC-04 : vérifiés par script node (tableau de 5 objets avec clés `q`,`a` ; 5 occurrences de `class="faq__item"` ; sortie qui commence par `<script type="application/ld+json">` ; 5 `Question` ; corps JSON sans `<` brut).
- Marqueurs `<!-- faq:items -->` et `<!-- faq:jsonld -->` absents de `src/` à l'exécution : le remplacement ne fait rien tant que T102 ne les ajoute pas.
- `package.json` n'a pas de script `lint` : non lancé (non prévu par la section Vérification).
- `public/index.html` diffère de HEAD, mais pas à cause de T101 : le worktree contient des modifications de `src/sections/nav.html`, `footer.html`, `projets.html` et `public/css/projets.css` absentes au démarrage de la session (modifications concurrentes, non faites par cet exécuteur). Le build les a intégrées.
- `CLAUDE.md` projet : absent à la racine, rien à appliquer.
- Non committé.
