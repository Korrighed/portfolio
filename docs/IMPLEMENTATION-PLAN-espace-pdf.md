# Plan d'implémentation — Espace enseignant : distribution, PDF en avant, responsive

Statut : livré sur la branche, en attente de validation d'Alex
Couvre : PRD F-02, F-04, F-15, F-21, F-22, F-23 ; TRD T-25 à T-28
Branche : `feature/distribution-netlify-pdf` (depuis `dev`). Merge sur `dev` en `--no-ff` après accord d'Alex.

## 1. Objectif du lot

Mettre l'espace enseignant en état d'être distribué sur Netlify : PDF déposés dans Blobs, page des fiches lisible sur tous les écrans avec le PDF comme action principale, en-tête et pied de page clairs. En parallèle, corrections demandées sur le reste du site : hero responsive, menu des projets (retour au hero, lien enseignant sur mobile), périodes retirées, mentions légales.

## 2. Décisions préalables

| # | Question | Décision | Raison |
|---|---|---|---|
| 1 | Fiche « yozora » | Renommée `twitch` (`fiche-twitch.pdf`, lien `/api/pdf/twitch`) | Demande d'Alex |
| 2 | Où poser les PDF en local | `storage/fiches-reflexives/` (ignoré par git) ; envoi dans Blobs par `netlify blobs:set` | NF-11 : jamais de PDF dans le dépôt ni sous `public/` |
| 3 | Distribution | Site `kaporfolio` déjà relié à `Korrighed/portfolio` ; variables `SESSION_SECRET`, `AUTH_CODE`, `PDF_BLOB_STORE`, `NODE_VERSION` posées ; déploiement par push | Constaté avec le CLI |
| 4 | Lien PDF | Grand bouton plein sous le sous-titre de chaque fiche | « L'attraction principale de la page » |
| 5 | En-tête et pied de page | Clairs, mêmes styles que la barre de l'accueil (`nav.css`, `footer.css` + `site-footer--light`) | Demande d'Alex ; une seule source de style |
| 6 | Hero | Deux blocs en position absolue, placés par quatre classes (`hero-pos-desktop-1/2`, `hero-pos-mobile-1/2`) en % du hero | Alex veut replacer le texte lui-même ; valeurs choisies par Alex le 2026-11-01 |
| 7 | Mentions légales | Page statique, contact par GitHub, aucune adresse email | NF-13 |
| 8 | Logo IUT | `LogoIUT.png` avant la mention « Espace enseignant » (page des fiches et fenêtre de connexion) | Demande d'Alex |

## 3. Tâches

| ID | Tâche | Fichiers cibles | Statut |
|---|---|---|---|
| T501 | Renommer la fiche yozora en twitch | `netlify/functions/lib/fiche-repository.js` | fait |
| T601 | Balisage : en-tête, pied de page, bouton PDF | `lib/page.js`, `lib/fiches-view.js`, `fiche-list.js` | fait |
| T602 | Styles : en-tête et pied clairs, bouton PDF | `public/css/fiches.css`, `public/css/footer.css` | fait |
| T603 | Menu des projets : retour au hero, lien enseignant mobile, périodes retirées | `src/sections/projets.html`, `public/js/projets-scroll.js`, `public/css/projets.css` | fait |
| T604 | Espace enseignant responsive (écrans bas, 320 px) | `public/css/fiches.css` | fait |
| T701 | Hero responsive (mise en flux) | `public/css/hero.css` | fait, remplacé par T703 |
| T702 | Retouches : pied de page 320 px, retour à la ligne du titre | `fiches.css`, `hero.css` | fait |
| T703 | Hero : quatre classes de placement en position absolue | `public/css/hero.css`, `src/sections/hero.html` | fait |
| T801 | Mentions légales | `public/mentions-legales.html`, `public/css/legal.css`, `footer.html`, `page.js` | fait |
| T901 | Logo de l'IUT devant le portail enseignant | `fiches-view.js`, `fiches.css`, `login-dialog.html`, `login-dialog.css` | fait |
| T902 | Logo de l'IUT : taille et cadre | `fiches.css`, `login-dialog.css` | fait |

Hors tâche : envoi des trois PDF dans le store Blobs `fiches-reflexives` (`netlify blobs:set`), relecture par empreinte SHA-256 identique à l'original.

## 4. Vérification du lot

| Contrôle | Méthode | Résultat |
|---|---|---|
| Syntaxe | `node --check` sur chaque fichier JS modifié ; accolades CSS équilibrées | passé |
| Blobs | `blobs:list` puis `blobs:get` et comparaison SHA-256 des trois PDF | identiques |
| Espace enseignant | Edge, 1920 à 320 px et 844×390 : débordement horizontal, en-tête, bouton PDF, pied de page | aucun débordement ; tient dans l'écran à 1280×720 et 1024×768 ; défilement normal sur mobile |
| Hero | Edge, 11 tailles : texte hors écran, chevauchement, proximité du bouton | aucun texte hors écran, chevauchement ni proximité du bouton, avec les valeurs d'Alex |
| Menus | Edge, 390 px et 1280 px : « Accueil » ramène au hero ; « Espace enseignant » ferme la vue et ouvre la fenêtre | conforme |
| Mentions légales | Edge, 1280 et 390 px | 200, cinq sections, aucun `@` ni `mailto:` |
| Fenêtre de connexion | Edge avec le logo | s'ouvre, focus dans le champ, erreur, Échap, fond |

## 5. Risques

| Risque | Probabilité | Impact | Parade |
|---|---|---|---|
| Position absolue du hero : un texte peut sortir de l'écran ou chevaucher le bouton si Alex déplace trop | Moyenne | Faible | Valeurs choisies par Alex vérifiées sur 11 tailles ; nombres en % commentés dans `hero.css` |
| Adresse de Netlify, Inc. dans les mentions légales non confirmée | Moyenne | Faible | Alex vérifie sur netlify.com |
| Adresse IP enregistrée par le compteur de connexion jamais purgée | Moyenne | Faible | Mentionnée dans les mentions légales ; purge à prévoir dans un lot séparé |
| `text-wrap: balance` non pris en charge partout | Faible | Faible | Repli : retour à la ligne normal |

## 6. Suivi

| Lot | Commit | Vérifié le | Remarque |
|---|---|---|---|

## Questions ouvertes

- Faut-il purger les entrées expirées du compteur de connexion (adresses IP) ?
- Le texte des mentions légales convient-il à Alex (statut d'éditeur non professionnel, contact par GitHub) ?
