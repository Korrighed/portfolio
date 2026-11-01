# TRD — Portfolio d'Alex

Statut : brouillon
Couvre : PRD F-01 … F-18, NF-01 … NF-12

## 1. Stack

| Couche | Choix | Version | Raison |
|---|---|---|---|
| Pages | HTML / CSS / JS vanilla | — | Décision C-03 : pas de framework de rendu |
| Assemblage de l'accueil | `scripts/build-index.js` (Node, ESM) | Node 24.14 en local ; version Netlify non épinglée | Découpe de l'accueil en sections |
| Dev local | Vite (HMR) derrière `netlify dev` | 5.4.21 | Rechargement à chaud ; `netlify dev` fournit Functions et redirects |
| CLI | `netlify-cli` | 27.0.1 | Dev local, upload Blobs |
| Back | Netlify Functions classiques (handler `event`) | — | C-02 |
| Session | `iron-session` | ^8.0.0 | Cookie scellé, sans base |
| Mot de passe | `bcryptjs` | ^2.4.3 | Hash du compte unique |
| Fichiers | `@netlify/blobs` | ^10.7.10 | Stockage des PDF hors dépôt |
| Animation des projets | Aucune bibliothèque : `position: sticky`, canvas 2D, `matchMedia`, transitions CSS | — | Scènes épinglées ; GSAP retiré le 2026-10-31 (voir §9) |
| Hero | Three.js + Vanta (dots), via CDN | 0.134.0 / 0.5.24 | Fond animé |
| Polices | Libre Caslon Text, Inria Serif (TTF locaux) | — | Voir `DESIGN-BRIEF.md` |

## 2. Architecture

```mermaid
flowchart TD
  subgraph Build["Build"]
    S["src/sections/*.html + index.template.html"] --> B["scripts/build-index.js"]
    B --> I["public/index.html (généré)"]
  end
  subgraph Statique["Statique (public/)"]
    I
    L["login.html, css/, js/, fonts/"]
  end
  subgraph Fn["Netlify Functions"]
    H["login, logout, fiche-list, fiche-detail, pdf"]
    A["lib/auth.js"]
    R["lib/fiche-repository.js"]
    ST["lib/storage.js"]
  end
  BL[("Netlify Blobs : fiches-reflexives")]
  H --> A
  H --> R
  H --> ST
  ST --> BL
```

- **Build** : assemble l'accueil. Netlify l'exécute à chaque déploiement (`npm run build`).
- **Statique** : servi tel quel par le CDN Netlify.
- **Functions** : toute la logique protégée. Les redirects de `netlify.toml` exposent des URL propres.
- **Blobs** : seul stockage. Aucune base de données.

## 3. Modules et responsabilités

| Module / dossier | Responsabilité | Dépend de |
|---|---|---|
| `src/index.template.html`, `src/sections/` | Source de l'accueil | — |
| `scripts/build-index.js` | Remplace les marqueurs `<!-- include:… -->` | `src/` |
| `scripts/hash-password.js` | Produit le hash bcrypt à coller dans `.env` | `bcryptjs` |
| `public/js/nav.js` | Menu repliable | DOM |
| `public/js/projets-scroll.js` | Progression par projet, apparition des informations (`is-on`, `inert`), fond de points (`#projets-bg`), menu des projets, vue latérale mobile, mesure du repli en lecture normale (`is-flow`) | DOM, `matchMedia`, canvas 2D |
| `public/css/projets.css` | Scènes (`sticky`), grille, menu, barre de section, vue latérale ; repli sans JS et sous `prefers-reduced-motion` | Tokens de `main.css` |
| `netlify/functions/lib/auth.js` | Identifiants, scellement et lecture du cookie, garde `withAuth` | `iron-session`, `bcryptjs` |
| `netlify/functions/lib/fiche-repository.js` | Liste des fiches (en dur) et recherche par `id` | — |
| `netlify/functions/lib/storage.js` | Lecture d'un PDF dans Blobs | `@netlify/blobs` |
| `netlify/functions/lib/page.js` | Gabarit HTML des pages protégées | — |
| `netlify.toml` | Build, dev, redirects | — |
| `vite.config.js` | Racine `public/`, port 5173 strict, régénération de l'accueil | `scripts/build-index.js` |

## 4. Intégrations externes

| Service | Usage | Auth | Limites, erreurs connues |
|---|---|---|---|
| Netlify Blobs | Lecture des PDF (`getStore('fiches-reflexives')`, `connectLambda(event)`) | Contexte Netlify | Lecture entière en mémoire (pas de stream) ; échec = 404 générique, détail dans les logs |
| jsDelivr | Three.js, Vanta (hero) | Aucune | Pas de SRI ; CDN indisponible = fond du hero absent. La section Projets n'en dépend plus |
| API Netlify (CLI) | Variables d'environnement et état du site au `netlify dev` | Session `netlify login` | Session expirée : appels réseau lents (voir §10) |

```mermaid
sequenceDiagram
  participant E as Enseignant
  participant F as Fonction
  participant A as lib/auth.js
  participant B as Blobs
  E->>F: POST /api/login (username, password)
  F->>A: verifyCredentials
  A-->>F: ok
  F-->>E: 302 /fiches-reflexives + cookie session
  E->>F: GET /api/pdf/fiche-1
  F->>A: isAuthenticated(cookie)
  A-->>F: true
  F->>B: get fiche-1.pdf
  B-->>F: octets
  F-->>E: 200 application/pdf
```

## 5. Exigences techniques

| ID | Exigence | Lien PRD | Vérification |
|---|---|---|---|
| T-01 | `parseCookies` ne lève jamais : `decodeURIComponent` dans un `try/catch`, cookie invalide traité comme absent | NF-02 | `curl -H "Cookie: session=%E0%A4%A" /api/pdf/fiche-1` renvoie 401, pas 500 |
| T-02 | `login.js` valide que `username` et `password` sont des chaînes non vides avant `verifyCredentials` | NF-02, F-10 | `curl -X POST /api/login` sans corps renvoie 302 vers `/login.html?error=1` |
| T-03 | Comparaison asynchrone du mot de passe (`bcrypt.compare`) et de l'identifiant en temps constant | NF-03 | Lecture du code ; test T-02 inchangé |
| T-04 | Limitation des tentatives de connexion ; mécanisme à trancher (voir §11) | NF-03 | Après N échecs, réponse refusée pendant une durée donnée |
| T-05 | En-têtes de sécurité via `[[headers]]` dans `netlify.toml` : `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `frame-ancestors` (CSP), CSP complète autorisant jsDelivr | NF-04 | `curl -I` sur `/` et `/login.html` |
| T-06 | `Cache-Control: private, no-store` sur `fiche-list`, `fiche-detail`, `pdf` | NF-04, NF-11 | `curl -I` avec cookie valide |
| T-07 | `Secure` posé dès que la connexion est HTTPS (ne plus dépendre de `CONTEXT === 'production'`), y compris sur le cookie de déconnexion | NF-01 | Test sur un deploy-preview |
| T-08 | Scripts CDN : version exacte conservée, ajout de `integrity` et `crossorigin="anonymous"` | NF-05 | Inspection de `index.template.html` ; console sans erreur SRI |
| T-09 | Médias : GIF Twitch (`<img loading="lazy">`) ; autres projets en `<video muted loop playsinline preload="none" poster>` MP4 H.264 sans piste audio (0,1 à 1,1 Mo, `media-src 'self'`). `projets-scroll.js` ne joue que la vidéo du projet actif, section visible et onglet affiché, précharge la suivante, ne démarre rien sous `prefers-reduced-motion` ; bouton Pause / Lecture (WCAG 2.2.2) | F-05, NF-06 | Onglet Réseau : aucune vidéo chargée avant d'approcher de la section ; une seule vidéo en lecture |
| T-10 | Sous `prefers-reduced-motion` ou sans JS : pas de `sticky`, pas de masquage des informations (les règles sont sous `@media (prefers-reduced-motion: no-preference)` et la classe `js`) ; le fond de points est dessiné une fois, sans boucle | F-16 | Émulation de la préférence : toutes les informations visibles par projet, aucun pin |
| T-11 | Une information non révélée est `inert` (JS) et `visibility: hidden` (CSS) ; en mode lecture normale (`is-flow`), plus rien n'est masqué | NF-07 | Parcours Tab : aucun lien invisible focalisé |
| T-16 | Une scène épinglée fait un écran : `measureFlow()` mesure `grid.scrollHeight` contre `clientHeight` et pose `is-flow` si le contenu est plus haut (petit mobile, paysage, zoom) | F-16 | À 700×340 : les 5 projets sont en lecture normale, tout visible, aucun défilement horizontal |
| T-17 | Menu : `projets-nav` (fixe, dès 48rem) ; sous 48rem, barre `projets-bar` et vue `projets-sheet` (`role="dialog"`, `aria-modal`, `inert` fermée, `Esc`, piège de focus, focus rendu au bouton) | F-04, F-17 | À 390×844 : la vue mesure 50 % de la largeur ; le focus revient au bouton à la fermeture |
| T-18 | Les questions vivent dans `src/data/faq.json` ; `scripts/build-index.js` remplace `<!-- faq:items -->` par les blocs HTML et `<!-- faq:jsonld -->` par un bloc `application/ld+json` `FAQPage` (échappement de `<`) | F-07, NF-09 | `public/index.html` : 5 `faq__item` et 5 `Question`, aucun marqueur restant |
| T-19 | FAQ en onglets (`public/js/faq.js`) : cinq panneaux empilés dans la même cellule de grille, donc la hauteur du panneau est celle de la réponse la plus longue ; `visibility` et `opacity` ; flou de 6 px vers net en 300 ms sous `no-preference` ; rôles `tablist`, `tab`, `tabpanel`, flèches, Début et Fin ; sans JavaScript, toutes les réponses à la suite | F-07, F-19 | À 1280×720, 1024×768 et 390×844 : la section mesure l'écran et changer d'onglet ne modifie ni sa hauteur ni celle du panneau |
| T-20 | `#projets` porte `overflow: clip` (sans conteneur de défilement : le sticky continue de fonctionner) : le canvas `#projets-bg`, dont la marge négative le laisse dépasser du bas de la section, ne se peint plus sur la FAQ | F-19 | Canvas de la FAQ masqué : 0 pixel hors du fond Platinum dans la FAQ et à 120 px au-dessus ; scènes projet toujours épinglées |
| T-21 | Fond de la FAQ : canvas 2D `.faq__bg` (`public/js/faq-ripple.js`), grille de 34 px à 10 % d'opacité ; onde = anneau de 40 px qui part du centre du bloc de réponse (1,9 s au changement de question via l'événement `faq:change`, 3 s à la première arrivée, `IntersectionObserver`), pic à 42 % ; zones sans point (titre, liste, réponse affichée, marge de 16 px), géométrie et points visibles calculés au redimensionnement et au départ d'une onde, points au repos tracés en un seul remplissage ; boucle `requestAnimationFrame` seulement pendant une onde ; grille fixe sous `prefers-reduced-motion` | F-19, NF-07 | À 1280, 1024 et 390 px : 0 pixel de point dans les zones de texte, aucune boucle active au repos |
| T-12 | Garde sur l'initialisation de Vanta (`typeof VANTA`) et respect de `prefers-reduced-motion` | NF-10 | CDN bloqué : aucune erreur console bloquante |
| T-13 | Échappement HTML des champs interpolés dans `page.js` et `fiche-*.js` | F-11, F-12 | Titre contenant `<` rendu en texte |
| T-14 | `[dev] command` de `netlify.toml` lance Vite sans `npx` ; documenter `netlify login` ou `--offline` | NF-12 | Chronométrer `npm run dev` jusqu'à « Local dev server ready » |
| T-15 | Retirer `PDF_STORAGE_DIR` du `.env` local (variable orpheline depuis la migration Blobs ; absente du dépôt et de `.env.example`) | NF-11 | Le CLI n'affiche plus `PDF_STORAGE_DIR` dans « Injected .env file env vars » |

## 6. Gestion des erreurs et états

| Situation | Comportement attendu |
|---|---|
| Pas de session sur page protégée | 302 vers `/login.html` |
| Pas de session sur `/api/pdf/:id` | 401 |
| Identifiants faux ou champs absents | 302 vers `/login.html?error=1` |
| `id` de fiche inconnu | 404 « Introuvable » |
| PDF absent de Blobs | 404 générique ; détail dans les logs serveur uniquement |
| `SESSION_SECRET` absent ou court | Erreur serveur explicite dans les logs |
| JavaScript absent ou en échec | La classe `js` n'est pas posée : aucune information masquée, scènes non épinglées, tout lisible |
| Scène plus haute que l'écran | Le projet passe en lecture normale (`is-flow`) : pas de pin, tout visible, rien de coupé |
| Vanta absent | Fond uni Ink Black (garde à ajouter, T-12) |

## 7. Sécurité et vie privée

- Le mot de passe n'est jamais stocké en clair : hash bcrypt dans `AUTH_PASSWORD_HASH`.
- Le cookie est scellé par `iron-session` ; sa lecture échoue proprement si le secret change.
- `.env` est ignoré par git. `.env.example` donne les noms attendus. Les mêmes variables doivent exister côté Netlify : `SESSION_SECRET`, `AUTH_USERNAME`, `AUTH_PASSWORD_HASH`, `PDF_BLOB_STORE` (optionnel).
- Menaces connues : force brute sur le login (T-04), contenu tiers non vérifié (T-08), mise en cache d'une page protégée par un intermédiaire (T-06), XSS latent si la liste devient dynamique (T-13).

## 8. Qualité

- Lint : aucun outil en place.
- Build : `npm run build`.
- Tests : aucun framework de test.
- Vérification navigateur : passe manuelle ou `qa` sur desktop et mobile (parcours visiteur et parcours enseignant).
- Dev local : `npm run dev`.

## 9. Décisions

| Date | Décision | Alternatives écartées | Raison |
|---|---|---|---|
| 2026-08-02 | Abandon d'Astro pour HTML vanilla + Netlify Functions (42681f8) | Garder Astro | Simplicité, contrôle |
| 2026-08-24 | Accueil découpé en sections HTML assemblées par script (3e47df1) | Fichier unique | Lisibilité |
| 2026-08-24 | CSS découpé par section (c8d3834) | `main.css` unique | Maintenance |
| 2026-09-22 | Vite pour le HMR local (f5e217a) | `netlify dev` seul | Rechargement à chaud |
| 2026-09-22 | PDF dans Netlify Blobs (65c0cef) | Stockage local `storage/` | Pas de redéploiement pour un PDF |
| 2026-10-26 | PRD = état cible ; pas de `DATA-MODEL` ; `APP-FLOW` réduit à des schémas ; direction artistique déplacée dans `DESIGN-BRIEF` | PRD de l'existant ; document de données | Demande d'Alex ; pas de base de données |
| 2026-10-31 | Section Projets : scènes épinglées en CSS `sticky`, informations qui émergent sur place, fond de points en canvas 2D comme indicateur ; GSAP retiré | Garder GSAP (pin + scrub) ; cartes empilées sans pin ; carrousel horizontal ; vague de progression globale ; indicateur qui descend dans la scène | Alex : le lecteur ne doit pas se décaler dans un projet, le fond sert d'indicateur par projet ; moins de dépendances et plus de bug de pin ; maquette validée par Alex (artefact « Portfolio Dossier ») |
| 2026-11-01 | Aperçus des projets en MP4 H.264 muet (bureau + mobile en incrustation) lus uniquement pour le projet actif | GIF (3 à 10 fois plus lourds) ; WebM en plus (non nécessaire) ; lecture permanente de toutes les vidéos | Poids, CPU, accessibilité |
| 2026-11-01 | Lot FAQ : Compétences remplacées par une FAQ (données uniques HTML + JSON-LD), section CV et email retirés du site, liens « Suite » supprimés, marque « korrighed.dev » | Garder Compétences ; FAQ écrite deux fois (HTML et JSON-LD) ; formulaire de contact dans ce lot | Demande d'Alex ; une seule source évite la divergence entre texte et données structurées |

## 10. Dette et risques connus

| Risque | Gravité | Effort | Conséquence si ignoré |
|---|---|---|---|
| Login sans limite de tentatives (T-04) | Moyenne | Moyen | Force brute possible |
| Cookie ou corps malformé donne un 500 (T-01, T-02) | Moyenne | Faible | Erreurs serveur, bruit dans les logs |
| Aucun en-tête de sécurité ni `Cache-Control` (T-05, T-06) | Moyenne | Faible | Exposition au cadrage et à la mise en cache |
| CDN sans SRI, Three.js 0.134.0 de 2021 (T-08) | Moyenne | Faible | Script tiers modifiable ; poids du hero non mesuré |
| `public/index.html` généré mais versionné | Moyenne | Faible | Deux sources de vérité ; 2 resynchronisations déjà nécessaires (a8e7f5f, c9fa098) |
| `npm run dev` lent (voir ci-dessous) | Moyenne | Faible | Perte de temps à chaque session |
| Aucun test, lint ni CI | Moyenne | Moyen | Régressions non détectées |
| Fond de points en canvas : boucle `requestAnimationFrame` (~800 points) non mesurée sur appareil modeste | Faible | Faible | Saccades possibles ; la boucle est pausée hors de la section et onglet masqué |
| Vidéos non lisibles sans MP4/H.264 (navigateurs libres) | Faible | Faible | L'affiche JPG reste affichée |
| Hero positionné en pixels absolus (`hero.css`) | Faible | Moyen | Mise en page fragile entre 48rem et grands écrans (à vérifier au navigateur) |
| `main` toujours sur le scaffold Astro, 27 commits de retard | Faible | Faible | Confusion sur la branche de référence |
| Dossier `storage/` et règles `.astro/`, `dist/` dans `.gitignore` obsolètes | Faible | Faible | Bruit |

**Mesures de `npm run dev` (2026-10-26, Windows, Node 24.14, Nouméa)**

| Étape | Durée |
|---|---|
| `predev` (build de l'accueil) | 0,1 s |
| `npx vite --version` | 5,1 s |
| `node node_modules/vite/bin/vite.js --version` | 0,5 s |
| `npx netlify --version` | 4,6 s |
| `netlify dev` jusqu'à « Setting up local dev server » | ~20 s (≈ 9 s avec `--offline`) |

Cause constatée : la session Netlify est expirée (`netlify status` : « Your session has expired ») et le site n'est pas lié (`.netlify/state.json` sans `siteId`). Le CLI fait des appels réseau avant de démarrer. Ensuite `npx` ajoute ≈ 5 s au lancement de Vite. Autre cause d'échec constatée : si un autre `npm run dev` tourne déjà, Vite (port 5173 strict) s'arrête avec « Port 5173 is already in use ».

## 11. Questions ouvertes

- Faut-il continuer à versionner `public/index.html` ? Recommandation : l'ignorer dans git (Netlify le régénère, `predev` aussi). Risque : lancer `npx vite` seul sans build préalable donne un accueil absent.
- Mécanisme de limitation des tentatives de connexion : compteur dans Blobs, ou service externe ?
- Faut-il introduire un linter et un formateur (le CV annonce Prettier) ?
- Version de Node à épingler côté Netlify : 24 comme en local ?
