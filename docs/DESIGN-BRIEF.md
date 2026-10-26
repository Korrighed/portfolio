# Design brief — Portfolio d'Alex

Statut : brouillon
Sources : ancien `README.md` (sections « Mise en page » et « Palette de couleurs », déplacées ici), `public/css/*.css`, `public/js/projets-scroll.js`. Les contrastes ont été calculés le 2026-10-26 (formule WCAG 2.x).

## 1. Intention

Prestige académique et sobriété. Une identité typographique éditoriale (empattements), des bleus profonds, peu de décoration. La hiérarchie vient de l'échelle et de l'alignement, pas des effets. Le mouvement sert la lecture : il révèle le contenu, il ne le décore.

## 2. Principe directeur : grille suisse

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
| `--color-powder-blue` | `#b4cded` | Texte secondaire sur fond sombre, filets, onde | 11.02:1 sur Ink Black |
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
| Aperçu de projet | Vidéo ou gif, ratio 4:5, largeur `min(22vw, 22rem)` | à fixer (voir PRD, Questions ouvertes) | emplacement `.reel__preview` ; chemin à décider |
| Polices | TTF | — | `public/fonts/` |
| Icônes | Aucune ; carré creux CSS pour le lien Espace enseignant, flèche `↗` en texte | — | — |

## 4. Composants

Les états de focus ne sont pas stylés : le navigateur applique son contour par défaut. Cible : un focus visible explicite sur fond clair comme sur fond sombre.

| Composant | États actuels | Notes |
|---|---|---|
| Barre de navigation | repos, survol (Yale vers Ink) | Burger sous 48rem, `aria-expanded` mis à jour |
| Bouton « Projets » du hero | repos, survol (fond Powder), actif (échelle 0.94 + anneau 450 ms) | Pastille arrondie ; l'anneau est coupé sous `prefers-reduced-motion` |
| Carte projet (`.reel`) | repos | Plein écran, 5 étapes révélées |
| Menu latéral (`.reel-nav`) | masqué, visible, survol, actif | Absent sous 48rem |
| Tag | repos | Mono, bordure Powder à 50 % |
| Lien de carte (`.reel__link`) | repos, survol (Platinum vers Powder) | Filet Powder en bas |
| Bouton CV | repos, survol (Yale vers Ink) | Plat, sans arrondi |
| Liste à puces rondes (`.list-dotted`) | repos | Puce 6 px, Yale sur clair, Powder sur sombre |
| Lien Espace enseignant (`.private-link`) | repos, survol | Carré creux 8 px devant le libellé |
| Eyebrow (`.text-eyebrow`) | repos | Partagé entre sections et CV |
| Barre de progression en onde | repos | Trait de fond Powder 25 %, trait rempli Powder |

## 5. Mise en page et responsive

| Point de rupture | Comportement |
|---|---|
| `max-width: 48rem` | Burger ; grilles 12 colonnes passent à 1 colonne ; menu latéral masqué ; hero recalé (tailles réduites) ; padding des cartes réduit |
| `max-width: 64rem` | Emplacement d'aperçu masqué |
| `max-height: 800px` | Cartes compactées (espaces, titre et texte réduits) pour tenir sans défilement interne |
| `max-width: 48rem` et `max-height: 800px` | Padding des cartes recalé (mobile paysage) |
| Hauteur d'une carte | `100vh` (pas `dvh` : à vérifier sur mobile avec barre d'adresse) |

## 6. Mouvement

| Élément | Réglage |
|---|---|
| Carte projet | Épinglée sur 4 hauteurs de viewport ; chaque étape monte de 24 px et passe de 0 à 1 d'opacité en 1 s (`power2.out`), écart 0.3 s, `scrub: 1` |
| Défilement vers une carte | 1.2 s, `power2.inOut` |
| Onde de progression | Amplitude 8, fréquence 0.06, vitesse 0.03, redessinée à chaque image |
| Menu latéral | Fondu 300 ms ; liens 200 ms |
| Bouton « Projets » | 200 ms ; anneau 450 ms |
| `prefers-reduced-motion` | Aujourd'hui : onde figée, défilement lisse coupé, anneau coupé. Pin et révélation restent actifs. Cible (PRD F-16) : pas de pin ni de révélation, contenu visible d'emblée |

## 7. Accessibilité

- Contraste texte ≥ 4.5:1, éléments d'interface ≥ 3:1 : trois points à corriger (voir §3).
- Focus visible sur tout élément interactif : à styler.
- Cibles tactiles ≥ 44 × 44 px : à vérifier (liens du menu latéral, bouton burger de 22 px de large + padding).
- Les étapes non révélées ne doivent pas recevoir le focus (TRD T-11).

## 8. Questions ouvertes

- Aucune référence visuelle ni maquette n'est documentée : une maquette Figma existe-t-elle pour les pages hors accueil (login, fiches) ?
- Faut-il corriger les trois contrastes sous 4.5:1 en assombrissant `--color-slate`, ou en changeant les usages ?
- Les pages login et fiches reprennent-elles la grille et les polices de l'accueil ? Aujourd'hui elles n'utilisent que `main.css`.
