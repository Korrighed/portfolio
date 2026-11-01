# T702 — Retouches responsive : pied de page enseignant et titre du hero

Statut : fait
Story : US-01, US-08 · Exigences : NF-08
Dépend de : T604, T701
Parallélisable : non
Exécutant : executor

## Objectif

Deux retouches relevées à la mesure : (1) sur très petit écran, les liens du pied de page de l'espace enseignant (Accueil, GitHub, Mentions légales) ne sont pas centrés sous la marque ; (2) dans le hero à 390 px, le titre « Développeur full stack » passe à la ligne en laissant « stack » seul.

## Fichiers à lire

- `public/css/fiches.css` — bloc `@media (max-width: 30rem)` en fin de fichier
- `public/css/hero.css` — règle `.hero-block__subtitle`

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `public/css/fiches.css` | modifier | une règle dans le bloc `@media (max-width: 30rem)` de fin de fichier |
| `public/css/hero.css` | modifier | une règle |

## Étapes

1. Dans `public/css/fiches.css`, dans le DERNIER bloc `@media (max-width: 30rem)` du fichier (celui qui contient `.espace .site-footer__inner` avec `flex-direction: column`), ajouter après la règle `.espace .site-footer__inner { ... }` (avant l'accolade fermante du bloc), en respectant l'indentation :

```css

  .espace .site-footer__links {
    justify-content: center;
  }
```

2. Dans `public/css/hero.css`, juste avant la règle `.hero-block__subtitle {`, ajouter :

```css
/* Retour a la ligne equilibre : evite un mot seul sur la derniere ligne */
.hero-block__role {
  text-wrap: balance;
}

```

3. Lancer ce contrôle des accolades (il ne doit afficher que `css ok`) :

```bash
node -e "const fs = require('fs'); for (const f of ['public/css/fiches.css', 'public/css/hero.css']) { const s = fs.readFileSync(f, 'utf8'); const o = (s.match(/{/g) || []).length; const c = (s.match(/}/g) || []).length; if (o !== c) throw new Error(f + ' : ' + o + ' { pour ' + c + ' }'); } console.log('css ok')"
```

## Critères d'acceptation

- [ ] AC-01 : Étant donné `fiches.css`, alors le dernier bloc `@media (max-width: 30rem)` contient `.espace .site-footer__links { justify-content: center; }`.
- [ ] AC-02 : Étant donné `hero.css`, alors `.hero-block__role { text-wrap: balance; }` précède `.hero-block__subtitle`.
- [ ] AC-03 : Étant donné les deux fichiers, alors leurs accolades sont équilibrées et aucune autre règle n'a changé.

## Vérification

La commande de l'étape 3, puis l'outil Grep (le `grep` du shell est peu fiable ici) pour AC-01 et AC-02.

## Hors périmètre

- Ne pas modifier d'autre fichier, ni `docs/`.
- Ne pas committer.

## Notes d'exécution

<Réservé à l'exécuteur.>
