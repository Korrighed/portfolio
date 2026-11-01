# Design brief — Portfolio d'Alex

Statut : brouillon
Sources : ancien `README.md` (sections « Mise en page » et « Palette de couleurs », déplacées ici), `public/css/*.css`, `public/js/projets-scroll.js`. Les contrastes ont été calculés le 2026-10-26 (formule WCAG 2.x).

## 1. Intention

Prestige académique et sobriété. Une identité typographique éditoriale (empattements), des bleus profonds, peu de décoration. La hiérarchie vient de l'échelle et de l'alignement, pas des effets. Le mouvement sert la lecture : il révèle le contenu, il ne le décore.

## 2. Références visuelles

| Référence | Ce qu'on en garde |
|---|---|
| Hero Vanta « dots » du site (points Powder / Yale sur Ink Black, espacement 34) | La grille de points, reprise en canvas pour le fond de la section Projets, avec le même espacement |
| Maquette « Portfolio Dossier » (artefact claude.ai, version 7, validée par Alex le 2026-10-31) | Une scène par projet ; aperçu dans un cadre de navigateur ; menu à gauche ; barre de section et vue latérale sur mobile |
| Trait du bouton « Projets » du hero | Le trait qui s'estompe en bas de chaque scène : indice de défilement, identité du site |

### Principe directeur : grille suisse

International Typographic Style : colonnes et modules réguliers, marges et gouttières fixes, alignement strict des blocs. L'espacement entre blocs découle des mêmes unités que la grille. Pas de valeur arbitraire par composant : on utilise l'échelle ci-dessous.

| Élément | Valeur actuelle |
|---|---|
| Colonnes | 12 |
| Largeur de contenu | `72rem` (accueil), `48rem` (pages génériques `main`) |
| Gouttière | `--space-md` (1.5rem) |
| Marge latérale | `--space-lg` (2.5rem) |
| En-tête de section | eyebrow colonnes 1 à 3, titre colonnes 4 à 10 |
| Compétences | Compétences colonnes 1 à 5, Technologies colonnes 7 à 12 |
| CV | label 1 à 3, texte 4 à 8, action 9 à 12 |

## 3. Fondations

### Couleurs

Palette validée par Alex : Ink Black, Yale Blue, Powder Blue, Platinum. Les autres valeurs sont des dérivés déjà présents dans `main.css`.

| Token | Valeur | Usage | Contraste vérifié |
|---|---|---|---|
| `--color-ink-black` | `#0d1821` | Fond du hero et du pied de page ; texte sur fond clair | 16.15:1 sur Platinum |
| `--color-ink-black-3` | `#0b141c` | Fond de la section Projets et du séparateur | Powder 11.40:1, Platinum 16.70:1 |
| `--color-yale-blue` | `#344966` | Couleur de marque, eyebrow, liens du menu, bouton CV | 8.25:1 sur Platinum |
| `--color-powder-blue` | `#b4cded` | Texte secondaire sur fond sombre, filets, points du fond de la section Projets | 11.02:1 sur Ink Black |
| `--projets-abyss` (local à `#projets`) | `#08111a` | Bas du dégradé de fond : Ink Black → Ink Black 3 → abyss → Ink Black 3 (la plongée) | décoratif |
| `--color-powder-blue-light` | `#dce6f1` | Bordure des blocs de code sur fond clair | décoratif |
| `--color-platinum` | `#f0f4ef` | Fond clair principal, texte sur fond sombre | 16.15:1 avec Ink Black |
| `--color-slate` | `#6d7d8e` | Titres de groupe techno, lien Espace enseignant | **3.80:1 sur Platinum, 4.25:1 sur Ink Black : sous 4.5:1** |
| `--color-slate-dark` | `#3c4a56` | Texte courant sur fond clair | 8.19:1 sur Platinum |
| (en dur) `#b3261e` | erreur | Message « Identifiants incorrects. » | 5.88:1 sur Platinum ; à promouvoir en token |

Points sous le seuil (texte ≥ 4.5:1) :

- `--color-slate` en petit texte (0.75rem, `tech-group h4`) sur Platinum : 3.80:1.
- `private-link` dans le pied de page : slate sur Ink Black, 4.25:1.
- Liens inactifs du menu latéral : Powder Blue à 55 % d'opacité sur Ink Black 3, environ 4.22:1.

### Typographie

| Rôle | Police | Taille / graisse | Repli |
|---|---|---|---|
| Titres de section, titres de colonne | Inria Serif Bold | `2.25rem` / 700 / interligne 1.15 (`--font-display`) ; h3 de colonne `1.25rem` | `serif` |
| Titres de carte projet | Inria Serif Bold | `clamp(2.5rem, 6vw, 4.5rem)` / 700 / 1.05 | `serif` |
| Identité (nav, hero, pied de page) | Libre Caslon Text (Regular, Italic, Bold) | marque nav `1.25rem` 700 ; hero nom et rôle `3.5rem` italique ; sous-titre `1.8rem` ; pied `1.125rem` italique | `serif` |
| Texte courant | `system-ui` | `1rem` à `1.125rem`, interligne 1.55 à 1.7 | `sans-serif` |
| Eyebrow | `system-ui` | `0.75rem` / 600 / espacement `0.18em` / majuscules | — |
| Code, tags, index | `ui-monospace` (`--font-mono`) | `0.75rem` à `0.8125rem` | `monospace` |

### Espacements

Échelle fixe en `rem` (base 8 px) : pas de valeur hors échelle dans les composants.

| Token | Valeur |
|---|---|
| `--space-xs` | 0.5rem (8 px) |
| `--space-sm` | 1rem (16 px) |
| `--space-md` | 1.5rem (24 px) |
| `--space-lg` | 2.5rem (40 px) |
| `--space-xl` | 4rem (64 px) |

### Textures, images, icônes

| Ressource | Format | Poids max | Chemin |
|---|---|---|---|
| Fond du hero | Canvas Vanta « dots » : points Powder Blue / Yale Blue sur Ink Black, taille 6.3, espacement 34 | — | script inline de `src/index.template.html` |
| Aperçu de projet | Image ou gif dans un cadre de navigateur (`.frame`), ratio 16:9 en colonne large, `object-fit: cover` ; sur mobile le cadre prend la hauteur libre | gif Twitch : 1,7 Mo ; JPG 45 à 155 Ko ; budget à fixer (voir PRD, Questions ouvertes) | `public/video/twitch.gif`, `public/img/projets/*.jpg` (provisoires) |
| Fond de la section Projets | Canvas 2D `#projets-bg`, points espacés de 34 px, Powder Blue qui glisse vers un bleu plus profond d'un projet à l'autre | — | Dessiné par `public/js/projets-scroll.js` |
| Polices | TTF | — | `public/fonts/` |
| Icônes | Aucune ; carré creux CSS pour le lien Espace enseignant, flèche `↗` en texte | — | — |

## 4. Composants

Les états de focus ne sont pas stylés : le navigateur applique son contour par défaut. Cible : un focus visible explicite sur fond clair comme sur fond sombre.

| Composant | États actuels | Notes |
|---|---|---|
| Barre de navigation | repos, survol (Yale vers Ink) | Burger sous 48rem, `aria-expanded` mis à jour. La marque est le logo KA (hauteur 2,5 rem, se trace une fois au chargement) suivi de « Alex.dev » |
| Logo KA | statique, intro (une fois), boucle de 6 s, favicon | Losange à double bord, lettres en Inria Serif Bold (glyphes convertis en tracés), double ligne horizontale qui naît du bord intérieur et s'arrête contre les lettres ; aucun trait n'en coupe un autre. Trait de 5 sur un dessin de 400. Yale Blue sur Platinum. Fichiers : `public/img/logo/logo-ka.svg`, `logo-ka-intro.svg`, `logo-ka-anime.svg` ; favicon plein (lettres Platinum en négatif) `public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`. En dessous de 56 px le double bord et la double ligne ne sont plus lisibles : on utilise le favicon plein |
| Bouton « Projets » du hero | repos, survol (fond Powder), actif (échelle 0.94 + anneau 450 ms) | Pastille arrondie ; l'anneau est coupé sous `prefers-reduced-motion` |
| Scène projet (`.project`) | repos (informations apparues ou non), fin de scène (`is-done`), lecture normale (`is-flow`) | Plein écran ; grille 5/7 colonnes sur desktop, une colonne sous 64rem |
| Cadre de navigateur (`.frame`) | repos, survol du lien | Barre d'adresse = lien du site ; plaque Yale décalée en arrière-plan |
| Menu des projets (`.projets-nav`) | masqué, visible, survol, actif, focus | Fixe à gauche dès 48rem ; libellés courts |
| Barre de section (`.projets-bar`) | masquée, visible | Sous 48rem : « Projets » puis projet en cours, bouton menu à droite |
| Vue latérale (`.projets-sheet`) | fermée, ouverte | Sous 48rem : moitié de l'écran (min 12,5rem), pleine hauteur, fond Ink Black plein ; le reste s'assombrit à 60 % |
| Tag | repos | Mono, bordure Powder à 50 % |
| Lien de scène (`.project__links a`) | repos, survol (Platinum vers Powder), focus | Souligné Powder ; zone tactile de 44 px |
| Points clés (`.project__facts`) | repos | Un filet par point, pas de puce ; 3 ou 4 colonnes sur desktop |
| Bouton CV | repos, survol (Yale vers Ink) | Plat, sans arrondi |
| Liste à puces rondes (`.list-dotted`) | repos | Puce 6 px, Yale ; utilisée dans Compétences (plus dans Projets) |
| Lien Espace enseignant (`.private-link`) | repos, survol | Carré creux 8 px devant le libellé |
| Eyebrow (`.text-eyebrow`) | repos | Partagé entre sections et CV |
| Fond de points (`#projets-bg`) | progression 0 à 100 % par projet | Indicateur de progression : cercle lumineux depuis l'aperçu ; remplace la barre en onde |
| Indice de défilement (`.project__cue`) | visible, masqué en fin de scène | Trait de 1 px qui s'estompe, comme sur le bouton du hero |

## 5. Mise en page et responsive

| Point de rupture | Comportement |
|---|---|
| `max-width: 48rem` | Burger de la nav du site ; grilles 12 colonnes à 1 colonne ; hero recalé (tailles réduites). Section Projets : menu fixe remplacé par la barre de section et la vue latérale ; aperçu au-dessus du titre et il prend la hauteur libre ; marges de 16 px |
| `min-width: 48rem` | Colonne de gauche réservée au menu des projets (`2.5rem + 7.5rem + 1.5rem`) : la scène ne passe pas dessous |
| `max-width: 64rem` | Scène en une colonne : aperçu, titre, tags, puis résumé et points clés dans la même cellule (le résumé laisse la place aux points clés) |
| `max-height: 800px` | Scène compactée (marges, titre, texte réduits) pour tenir sans défilement |
| `max-width: 48rem` et `max-height: 760px` | Mobile bas (iPhone SE) : titre 1,75rem, texte 0,8125 à 0,875rem, aperçu réduit à 6rem minimum |
| Scène plus haute que l'écran | Repli en lecture normale (`is-flow`) : ni pin ni masquage. Constaté à 1024×768 (disposition en colonne à 1024 px) et à 700×340 |
| Hauteur d'une scène | `100vh`, puis `100svh` si pris en charge (hauteur avec barres du navigateur affichées) ; défilement du projet : 190 % de la hauteur de l'écran en plus |

## 6. Mouvement

| Élément | Réglage |
|---|---|
| Scène projet | Épinglée (`sticky`) sur 190 % de la hauteur de l'écran en plus. Les informations ne se déplacent pas : elles passent de 0 à 1 d'opacité et d'un flou de 6 px à net en 700 ms, quand la progression atteint 0, 0,2, 0,4, 0,62 et 0,82 (seuils, pas de `scrub`). Sur mobile l'aperçu apparaît avant le titre |
| Fond de points | Boucle `requestAnimationFrame` active seulement quand la section est à l'écran et l'onglet visible. Cercle lumineux : rayon proportionnel à la progression du projet (lissé), anneau plus gros à son bord ; houle douce dont la phase suit le scroll, sans dérive ; 700 ms de fondu au changement de projet |
| Défilement vers un projet | Défilement lisse du navigateur ; menu : fin de scène (tout révélé) ; « Suite » : début du projet suivant |
| Menu des projets | Fondu 300 ms ; liens 200 ms |
| Vue latérale (mobile) | Glissement 300 ms depuis la droite ; fond assombri 300 ms |
| Bouton « Projets » | 200 ms ; anneau 450 ms |
| `prefers-reduced-motion` | Section Projets : ni pin ni révélation (règles sous `no-preference`), informations visibles d'emblée, fond de points dessiné une fois, trait de défilement fixe, transitions coupées. Anneau du bouton « Projets » du hero coupé (inchangé) |

## 7. Accessibilité

- Contraste texte ≥ 4.5:1, éléments d'interface ≥ 3:1 : trois points à corriger (voir §3).
- Focus visible sur tout élément interactif : à styler.
- Cibles tactiles ≥ 44 × 44 px : section Projets traitée (liens, bouton menu, croix de la vue latérale, lignes du menu à 44 ou 48 px) ; bouton burger de la nav du site (22 px + padding) encore à vérifier.
- Les informations non révélées ne reçoivent pas le focus : `inert` (TRD T-11).
- Focus visible dans la section Projets : anneau Powder de 2 px (`#projets :focus-visible`).

## 8. Questions ouvertes

- Maquette : celle de la section Projets est l'artefact « Portfolio Dossier » (§2). Aucune maquette n'est documentée pour les autres sections ni pour les pages hors accueil (login, fiches) : une maquette Figma existe-t-elle ?
- Section CV : à reprendre dans un second temps, hors de cette passe.
- Faut-il corriger les trois contrastes sous 4.5:1 en assombrissant `--color-slate`, ou en changeant les usages ?
- Les pages login et fiches reprennent-elles la grille et les polices de l'accueil ? Aujourd'hui elles n'utilisent que `main.css`.
