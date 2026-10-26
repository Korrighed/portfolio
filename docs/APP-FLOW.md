# App flow — Portfolio d'Alex

Statut : brouillon
Couvre : US-01 … US-12

Schémas seulement. Le détail des exigences est dans `PRD.md`.

## 1. Carte des écrans

```mermaid
flowchart TD
  Accueil["Accueil /"]
  Login["Connexion /login.html"]
  Liste["Fiches /fiches-reflexives"]
  Fiche["Fiche /fiches-reflexives/:id"]
  Pdf["PDF /api/pdf/:id"]
  Accueil -->|Espace enseignant| Login
  Login -->|identifiants valides| Liste
  Login -->|identifiants faux| Login
  Liste --> Fiche
  Fiche --> Pdf
  Fiche --> Liste
  Liste -->|Se déconnecter| Accueil
```

## 2. Parcours visiteur sur l'accueil

```mermaid
flowchart LR
  A([Arrivée]) --> B["Hero"]
  B -->|bouton Projets| C["Carte projet 1"]
  C -->|défilement| D["Cartes 2 à 5"]
  D --> E["Compétences"]
  E --> F["CV"]
  F --> G["Pied de page : contact"]
  C -->|menu latéral| D
  D -->|Me contacter| G
```

## 3. Parcours enseignant

```mermaid
flowchart LR
  A([Début]) --> B["Espace enseignant"]
  B --> C["Saisie identifiant et mot de passe"]
  C --> D{Valides ?}
  D -- oui --> E["Liste des fiches"]
  D -- non --> F["Message d'erreur"]
  F --> C
  E --> G["Fiche"]
  G --> H["Ouverture du PDF"]
  E --> I([Déconnexion])
```

## 4. États d'une carte projet

```mermaid
stateDiagram-v2
  [*] --> Vierge
  Vierge --> Epinglee: la carte atteint le haut de l'écran
  Epinglee --> Revelee: les 5 étapes sont affichées
  Revelee --> Liberee: le défilement reprend
  Liberee --> Epinglee: retour en arrière
  Epinglee --> Revelee: clic dans le menu latéral
```

## 5. Accès aux pages protégées

```mermaid
stateDiagram-v2
  [*] --> SansSession
  SansSession --> AvecSession: connexion réussie (8 h)
  AvecSession --> SansSession: déconnexion ou expiration
```

## 6. Questions ouvertes

- Sur mobile, comment atteindre un projet précis sans le menu latéral (PRD F-17) : liste en tête de section, ou barre fixe ?
