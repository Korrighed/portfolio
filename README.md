# portfolio

Portfolio + espace fiches réflexives (accès enseignant, compte unique).

## Stack

- **HTML/CSS/JS vanilla** dans `public/` — pages publiques statiques (accueil, projets, login), aucun framework de rendu.
- **Netlify Functions** (`netlify/functions/`) — logique protégée : vérification de session, pages fiches réflexives, service du PDF. Node pur, pas de dépendance à un framework web.
- **iron-session** — cookie de session signé/chiffré, pas de base de données.
- **bcryptjs** — hash du mot de passe du compte enseignant.
- Stockage PDF en local, hors de `public/` (`storage/fiches-reflexives`), embarqué en lecture seule dans la fonction (`included_files` dans `netlify.toml`) et servi via une fonction protégée. Ajouter/retirer un PDF nécessite un redeploy — pour un usage plus dynamique, migrer vers Netlify Blobs.

## public/index.html est généré

La page d'accueil est découpée en sections dans `src/sections/*.html`, assemblées dans `src/index.template.html`
(marqueurs `<!-- include:nom.html -->`) par `scripts/build-index.js`, qui écrit le résultat dans `public/index.html`.

Ne pas éditer `public/index.html` à la main (il porte un commentaire de rappel en tête) : modifier la section
concernée dans `src/sections/`, puis régénérer avec `npm run build`. `npm run dev` régénère automatiquement
avant de lancer `netlify dev` (hook `predev`).

## Distribution / lancement local

```bash
npm install
cp .env.example .env
node scripts/hash-password.js "mot-de-passe" # coller le hash dans .env
```

| Commande | Usage |
|---|---|
| `npm run build` | Régénère `public/index.html` depuis `src/` |
| `npm run dev` | Régénère `public/index.html` puis `netlify dev` — sert `public/` + exécute les fonctions localement, avec les redirects de `netlify.toml` |

Déploiement : push sur le repo connecté à Netlify (`command = npm run build`, `publish = public`, `functions = netlify/functions`).

## Mise en page

Principe directeur : grille suisse (International Typographic Style) — colonnes et modules réguliers, marges/gouttières fixes, alignement strict des blocs, hiérarchie posée par l'échelle plutôt que par la décoration. L'espacement entre les blocs découle des mêmes unités que la grille : une échelle fixe type `xs/sm/md/lg/xl` (base 4px/8px), pas de valeurs arbitraires par composant.

## Palette de couleurs

| Nom | Hex | Usage suggéré |
|---|---|---|
| Ink Black | `#0d1821` | fond très sombre / texte sur fond clair |
| Yale Blue | `#344966` | couleur de marque, accents, éléments interactifs |
| Powder Blue | `#b4cded` | fond secondaire, éléments doux |
| Platinum | `#f0f4ef` | fond clair principal |
