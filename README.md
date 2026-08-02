# portfolio

Portfolio + espace fiches réflexives (accès enseignant, compte unique).

## Stack

- **HTML/CSS/JS vanilla** dans `public/` — pages publiques statiques (accueil, projets, login), aucun framework de rendu.
- **Netlify Functions** (`netlify/functions/`) — logique protégée : vérification de session, pages fiches réflexives, service du PDF. Node pur, pas de dépendance à un framework web.
- **iron-session** — cookie de session signé/chiffré, pas de base de données.
- **bcryptjs** — hash du mot de passe du compte enseignant.
- Stockage PDF en local, hors de `public/` (`storage/fiches-reflexives`), embarqué en lecture seule dans la fonction (`included_files` dans `netlify.toml`) et servi via une fonction protégée. Ajouter/retirer un PDF nécessite un redeploy — pour un usage plus dynamique, migrer vers Netlify Blobs.

## Distribution / lancement local

```bash
npm install
cp .env.example .env
node scripts/hash-password.js "mot-de-passe" # coller le hash dans .env
```

| Commande | Usage |
|---|---|
| `npm run dev` | `netlify dev` — sert `public/` + exécute les fonctions localement, avec les redirects de `netlify.toml` |

Déploiement : push sur le repo connecté à Netlify (build = aucun, `publish = public`, `functions = netlify/functions`).

## Mise en page

Principe directeur : grille suisse (International Typographic Style) — colonnes et modules réguliers, marges/gouttières fixes, alignement strict des blocs, hiérarchie posée par l'échelle plutôt que par la décoration. L'espacement entre les blocs découle des mêmes unités que la grille : une échelle fixe type `xs/sm/md/lg/xl` (base 4px/8px), pas de valeurs arbitraires par composant.

## Palette de couleurs

| Nom | Hex | Usage suggéré |
|---|---|---|
| Ink Black | `#0d1821` | fond très sombre / texte sur fond clair |
| Yale Blue | `#344966` | couleur de marque, accents, éléments interactifs |
| Powder Blue | `#b4cded` | fond secondaire, éléments doux |
| Platinum | `#f0f4ef` | fond clair principal |
