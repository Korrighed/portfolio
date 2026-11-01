# T102 — Créer la section FAQ dans un losange ouvert et retirer Compétences et CV

Statut : à faire
Story : US-04 · Exigences : F-07, F-08, F-19, NF-09, T-18, T-19
Dépend de : T101
Parallélisable : non
Exécutant : executor

## Objectif

La dernière section de l'accueil est la FAQ : cinq questions dans un cadre à quatre chevrons (losange ouvert), sans fond de points. Les sections Compétences et CV et leurs feuilles de style n'existent plus. L'`<head>` porte un titre, une description, des balises Open Graph et le JSON-LD de la FAQ.

## Fichiers à lire

- `src/index.template.html` — `<head>`, liens CSS, marqueurs `include`
- `src/sections/competences.html` — le séparateur (`section-divider`) à reprendre tel quel
- `public/css/competences.css` — lignes 1 à 28 : règles `.section-divider*` à reprendre tel quel
- `public/css/main.css` — variables `--space-*`, `--color-*`, `--font-display-family`, classes `.section-head`, `.text-eyebrow`
- `scripts/build-index.js` — marqueurs `<!-- faq:items -->` et `<!-- faq:jsonld -->` gérés par T101

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `src/sections/faq.html` | créer | section FAQ avec séparateur, losange ouvert et marqueur `<!-- faq:items -->` |
| `public/css/faq.css` | créer | séparateur repris, cadre, chevrons, liste |
| `src/index.template.html` | modifier | titre, métadonnées, marqueur JSON-LD, liens CSS, includes |
| `src/sections/competences.html` | supprimer | remplacé par `faq.html` |
| `src/sections/cv.html` | supprimer | CV retiré du site |
| `public/css/competences.css` | supprimer | remplacé par `faq.css` |
| `public/css/cv.css` | supprimer | CV retiré du site |
| `public/css/main.css` | modifier | 4 commentaires qui citent `competences` et `cv.css` (aucun effet sur le rendu) |

## Étapes

1. Lire `public/css/competences.css`. Créer `public/css/faq.css` : copier d'abord, mot pour mot, les lignes 1 à 28 (commentaire `/* Separateur … */` puis les règles `.section-divider`, `.section-divider__inner`, `.section-divider__line`, `.section-divider__marker`). Changer seulement le commentaire en `/* Separateur entre projets et FAQ */`. Ajouter ensuite exactement :

```css

/* ---------- FAQ dans un losange ouvert ---------- */
.faq {
  padding: var(--space-xl) var(--space-lg);
}

/* Le cadre porte quatre chevrons aux milieux des cotes : un losange dont seuls
   les sommets sont traces. Le SVG est etire sur tout le cadre (viewBox 100x100,
   preserveAspectRatio none) ; vector-effect garde le trait a 3 px. */
.faq__frame {
  position: relative;
  max-width: 72rem;
  margin: 0 auto;
  padding: 5rem clamp(2.5rem, 9%, 7rem);
}

.faq__diamond {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.faq__diamond polyline {
  fill: none;
  stroke: var(--color-ink-black);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.faq__content {
  position: relative;
}

.faq__list {
  max-width: 48rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.faq__item {
  padding: var(--space-md) 0;
  border-top: 1px solid var(--color-powder-blue);
}

.faq__item:last-child {
  border-bottom: 1px solid var(--color-powder-blue);
}

.faq__q {
  margin: 0 0 var(--space-xs);
  font-family: var(--font-display-family);
  font-weight: 700;
  font-size: 1.25rem;
  line-height: 1.3;
}

.faq__a {
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--color-slate-dark);
}

@media (max-width: 48rem) {
  .faq {
    padding: var(--space-lg) var(--space-sm);
  }

  .faq__frame {
    padding: 4rem 12%;
  }
}
```

2. Créer `src/sections/faq.html` avec exactement ce contenu (le marqueur `<!-- faq:items -->` doit rester sur sa propre ligne, indenté de 8 espaces) :

```html
  <section id="faq" class="faq" aria-labelledby="faq-title">
    <div class="section-divider">
      <div class="section-divider__inner">
        <div class="section-divider__line" aria-hidden="true">
          <span class="section-divider__marker"></span>
        </div>
      </div>
    </div>

    <div class="faq__frame">
      <svg class="faq__diamond" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <polyline points="38,7 50,0 62,7" />
        <polyline points="7,38 0,50 7,62" />
        <polyline points="93,38 100,50 93,62" />
        <polyline points="38,93 50,100 62,93" />
      </svg>

      <div class="faq__content">
        <div class="section-head">
          <span class="section-head__eyebrow text-eyebrow">02 — Questions</span>
          <h2 id="faq-title" class="section-head__title">Questions fréquentes</h2>
        </div>

        <div class="faq__list">
        <!-- faq:items -->
        </div>
      </div>
    </div>
  </section>
```

Remarque : le séparateur est dans `faq.html` mais en dehors du cadre ; le `.faq` a un `padding` qui s'applique à la section entière, donc dans le fichier le séparateur doit rester le premier enfant de la `<section>` comme ci-dessus (ne pas le déplacer).

3. Dans `src/index.template.html`, remplacer la ligne `  <title>Portfolio</title>` par ce bloc (garder les 3 lignes `<link rel="icon" …>` / `apple-touch-icon` qui suivent le titre) :

```html
  <title>Alex, développeur full stack applicatif | Portfolio</title>
  <meta name="description" content="Portfolio d'Alex, développeur full stack applicatif : projets, profil et réponses aux questions fréquentes." />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="fr_FR" />
  <meta property="og:title" content="Alex, développeur full stack applicatif" />
  <meta property="og:description" content="Portfolio d'Alex, développeur full stack applicatif : projets, profil et réponses aux questions fréquentes." />
  <!-- faq:jsonld -->
```

4. Toujours dans `src/index.template.html` : remplacer les deux lignes `<link rel="stylesheet" href="/css/competences.css" />` et `<link rel="stylesheet" href="/css/cv.css" />` par la seule ligne `  <link rel="stylesheet" href="/css/faq.css" />` (à la place de la ligne competences, avant `footer.css`).
5. Toujours dans `src/index.template.html` : remplacer les deux blocs `<!-- include:competences.html -->` et `<!-- include:cv.html -->` (avec la ligne vide qui sépare chaque bloc) par le seul bloc `<!-- include:faq.html -->`.
6. Supprimer `src/sections/competences.html`, `src/sections/cv.html`, `public/css/competences.css`, `public/css/cv.css`.
7. Dans `public/css/main.css`, reformuler exactement ces 4 commentaires (ne rien changer d'autre dans le fichier) :
   - ligne 51 : `/* Typo partagee (eviter la duplication entre main.css/cv.css/competences.css/projets.css) */` devient `/* Typo partagee (eviter la duplication entre main.css/faq.css/projets.css) */`
   - ligne 93 : `/* En-tete de section (eyebrow + titre), reutilise dans projets/competences */` devient `/* En-tete de section (eyebrow + titre), reutilise dans projets/faq */`
   - lignes 103 et 104 : `/* Typo "eyebrow" (label court, majuscules, tracking large) - partagee avec` suivie de `   .cv__label (cv.css) via cette classe utilitaire. */` deviennent `/* Typo "eyebrow" (label court, majuscules, tracking large), partagee` suivie de `   entre les sections via cette classe utilitaire. */`
   - ligne 135 : `/* Liste a puces carrees, reutilisee dans projets/competences */` devient `/* Liste a puces carrees, disponible pour les sections */`
8. Lancer `npm run build`.

## Critères d'acceptation

- [ ] AC-01 : Étant donné le build, quand je l'ouvre, alors `public/index.html` contient `id="faq"`, 5 occurrences de `class="faq__item"` et aucun `id="competences"` ni `id="cv"`.
- [ ] AC-02 : Étant donné `public/index.html`, alors il contient exactement un bloc `application/ld+json` avec 5 occurrences de `"@type": "Question"`, et plus aucun marqueur `faq:` ni `include:`.
- [ ] AC-03 : Étant donné `public/index.html`, alors le `<head>` contient `<title>Alex, développeur full stack applicatif | Portfolio</title>`, une `meta description` et 4 balises `og:`.
- [ ] AC-04 : Étant donné les sources, alors `public/css/faq.css` existe, `competences.css` et `cv.css` n'existent plus et aucun fichier sous `src/` ou `public/` ne les référence.
- [ ] AC-05 : Étant donné la section FAQ, alors elle contient 4 `<polyline>` dans un SVG `aria-hidden="true"` et aucune règle `background` à points.

## Vérification

```bash
npm run build
grep -c 'class="faq__item"' public/index.html
grep -c 'application/ld+json' public/index.html
grep -rn 'competences\|cv.css\|id="cv"' src public/css public/index.html
```

Attendu : build réussi, `5`, `1`, puis aucune ligne pour le dernier `grep`.

Parcours navigateur : à rejouer par moi après la tâche (ouvrir l'accueil à 1280×720, 1024×768 et 390×844, aller en bas : la FAQ est encadrée par quatre chevrons, rien ne chevauche le texte).

## Hors périmètre

- Ne pas modifier `src/sections/nav.html` ni `src/sections/footer.html` (tâche T103).
- Ne pas modifier `scripts/build-index.js` ni `src/data/faq.json`.
- Ne pas toucher aux sections hero et projets, ni à `public/css/projets.css`.
- Ne pas éditer `public/index.html` à la main : il est généré.
- Ne pas ajouter d'animation ni de fond de points.
- Ne pas committer.

## Notes d'exécution

- Escalade initiale (contradiction AC-04 / grep vs `public/css/main.css`) : arbitrée par l'orchestrateur, option A. `public/css/main.css` ajouté aux Fichiers cibles, étape 7 ajoutée.
- Étapes 1 à 8 exécutées dans l'ordre.
- Créés : `public/css/faq.css` (lignes 1 à 28 identiques à `competences.css` sauf ligne 1 ; fins de ligne LF, le dépôt stocke du LF via `text=auto`), `src/sections/faq.html`.
- Modifiés : `src/index.template.html` (titre, métadonnées, marqueur JSON-LD, lien CSS, include), `public/css/main.css` (4 commentaires seulement, vérifié par `git diff`).
- Supprimés : `src/sections/competences.html`, `src/sections/cv.html`, `public/css/competences.css`, `public/css/cv.css`.
- `npm run build` : réussi, une seule exécution.
- Vérifications (outil Grep, les résultats du grep Bash étaient incohérents) : `class="faq__item"` = 5 ; `application/ld+json` = 1 ; `competences|cv.css|id="cv"` sur `src`, `public/css`, `public/index.html` = aucune occurrence ; `"@type": "Question"` = 5 ; 4 `<polyline>` dans un SVG `aria-hidden="true"` ; titre, meta description et 4 `og:` présents dans le `<head>` ; aucun marqueur `faq:` ni `include:` dans `public/index.html` ; aucune règle de fond à motif dans `faq.css`.
- Hors périmètre, non modifié : `background` du script Vanta (`backgroundColor`, hero) dans `public/index.html`.
- Non fait : commit, parcours navigateur (à rejouer par l'utilisateur).
