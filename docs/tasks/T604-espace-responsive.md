# T604 — Espace enseignant : responsive (écrans bas, très petits écrans)

Statut : fait
Story : US-08 · Exigences : F-20, F-22, NF-08
Dépend de : T602
Parallélisable : oui (aucun fichier en commun avec T603, T701, T801)
Exécutant : executor

## Objectif

Mesuré après T601 et T602 : sur écran bas (1280×720 : 35 px de trop ; 1024×768 : 23 px de trop), la scène dépasse l'écran à cause de l'en-tête, du pied de page et du bouton PDF ; à 320 px, le pied de page se désordonne (liens sous la marque, hauteur 115 px). Cette tâche resserre la scène sur les écrans bas et recompose le pied de page sur très petit écran. Les autres tailles ne changent pas.

## Fichiers à lire

- `public/css/fiches.css` — le fichier à modifier
- `public/css/footer.css`, `public/css/nav.css`, `public/css/faq.css`

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `public/css/fiches.css` | modifier | règles ajoutées en fin de fichier |

## Étapes

1. À la fin de `public/css/fiches.css`, après la dernière règle, ajouter une ligne vide puis exactement :

```css

/* Ecrans bas (portables 1280x720, 1024x768) : en-tete, scene et pied de page tiennent dans l'ecran */
@media (min-width: 64rem) and (max-height: 50rem) {
  .espace .nav__inner {
    padding-block: var(--space-xs);
  }

  .espace .faq__stage {
    padding-block: var(--space-sm);
  }

  .espace .site-footer__inner {
    padding-block: 0.75rem;
  }
}

/* Tres petit ecran : le pied de page s'empile et se centre */
@media (max-width: 30rem) {
  .espace .site-footer__inner {
    flex-direction: column;
    gap: var(--space-xs);
    text-align: center;
  }
}
```

2. Lancer ce contrôle des accolades (il ne doit afficher que `css ok`) :

```bash
node -e "const s = require('fs').readFileSync('public/css/fiches.css', 'utf8'); const o = (s.match(/{/g) || []).length; const c = (s.match(/}/g) || []).length; if (o !== c) throw new Error(o + ' { pour ' + c + ' }'); console.log('css ok')"
```

## Critères d'acceptation

- [ ] AC-01 : Étant donné `fiches.css`, alors il contient les deux blocs `@media` ci-dessus à la fin et ses accolades sont équilibrées.
- [ ] AC-02 : Étant donné le reste du fichier, alors aucune règle existante n'est modifiée ni supprimée.

## Vérification

La commande de l'étape 2 ; `git diff --stat public/css/fiches.css` ne montre que des ajouts.

Rendu navigateur : à rejouer par moi (1280×720, 1024×768, 320×568). Je peux ajuster les valeurs après mesure.

## Hors périmètre

- Ne pas modifier d'autre fichier.
- Ne pas committer.

## Notes d'exécution

<Réservé à l'exécuteur.>

- Dépendance T602 : son champ `Statut` indique « à faire », mais son contenu est déjà dans `fiches.css` et ses notes sont remplies. Traitée comme satisfaite.
- Étape 1 : bloc ajouté en fin de `fiches.css` (24 lignes ajoutées, LF).
- Étape 2 : `css ok`.
- AC-01 : vérifié (accolades équilibrées, deux `@media` à la fin).
- AC-02 : vérifié contre une copie prise avant édition : +24 / -0.
- « `git diff --stat` ne montre que des ajouts » : non vérifiable contre HEAD, les 30 suppressions viennent du remplacement T602 non committé. Vérification faite contre la copie d'avant édition.
- Rendu navigateur (1280×720, 1024×768, 320×568) : non fait, à rejouer.
