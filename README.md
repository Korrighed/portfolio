# portfolio

Portfolio + espace fiches réflexives (accès enseignant, compte unique).

## Stack

- **HTML/CSS/JS vanilla** dans `public/` — pages publiques statiques (accueil, projets, login), aucun framework de rendu.
- **Netlify Functions** (`netlify/functions/`) — logique protégée : vérification de session, pages fiches réflexives, service du PDF. Node pur, pas de dépendance à un framework web.
- **iron-session** — cookie de session signé/chiffré, pas de base de données.
- **bcryptjs** — hash du mot de passe du compte enseignant.
- Stockage PDF dans **Netlify Blobs** (store `fiches-reflexives`, cf. `netlify/functions/lib/storage.js`), servi via une fonction protégée. Upload/retrait d'un PDF se fait via `netlify blobs:set` / `netlify blobs:delete`, pas de redeploy nécessaire.

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
| `npm run dev` | Régénère `public/index.html` puis `netlify dev` — lance Vite (HMR, port 5173 strict) et exécute les fonctions localement, avec les redirects de `netlify.toml`. Un seul `npm run dev` à la fois : un second échoue avec « Port 5173 is already in use » |

Démarrage lent : `netlify dev` interroge l'API Netlify au lancement. Avec une session expirée (`netlify status`), compter environ 9 s de plus. Relancer `netlify login`, ou démarrer sans réseau avec `npm run dev -- --offline`.

Déploiement : push sur le repo connecté à Netlify (`command = npm run build`, `publish = public`, `functions = netlify/functions`).

## Documentation

| Document | Contenu |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | Produit : objectifs, user stories, exigences |
| [`docs/TRD.md`](docs/TRD.md) | Architecture, exigences techniques, décisions, dette |
| [`docs/APP-FLOW.md`](docs/APP-FLOW.md) | Parcours en schémas |
| [`docs/DESIGN-BRIEF.md`](docs/DESIGN-BRIEF.md) | Direction artistique : grille suisse, palette, typographie, composants |
| [`docs/reports/`](docs/reports/) | Rapports de constats |
