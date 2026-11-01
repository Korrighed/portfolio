// Metadonnees des fiches reflexives, affichees sur la page protegee /fiches-reflexives.
// Le PDF de chaque fiche vit dans le store Netlify Blobs (cf. storage.js), jamais commite dans le repo.
export const author = {
  name: 'Alexis Boutin',
  program: "Licence professionnelle Métiers de l'informatique — Applications web",
};

export const fiches = [
  {
    id: 'affmar',
    file: 'fiche-affmar.pdf',
    title: 'Générateur PDF AFFMAR',
    subtitle: 'Signalement officiel de navire avec limites de caractères validées',
    date: '2026-06-12',
    competences: [
      'Assurer la qualité, la sûreté, la sécurité et la performance des applications',
      'Concevoir, déployer, gérer et faire évoluer une application',
      'Maîtriser la programmation',
    ],
    livrables: [
      'Formulaire de signalement navire côté pilote (mobile-first, Next.js)',
      'Service de génération PDF AFFMAR automatisé (Laravel)',
      'Système de validation des limites de caractères par champ',
      "Interface d'administration pour édition et génération du PDF",
      'Service de pré-remplissage automatique des champs (~40 % des champs)',
    ],
    status: 'En qualification (juin 2026), en attente des retours clients.',
    links: [],
  },
  {
    id: 'hotfix-ci-cd',
    file: 'fiche-hotfix-ci-cd.pdf',
    title: 'Gestion des HotFix en CI/CD',
    subtitle: 'Pipeline Git Flow et maintenance parallèle en environnement agile',
    date: '2026-07-01',
    competences: [
      "Analyse, conception, déploiement et maintenance d'applications et de serveurs d'applications",
      "Appliquer les normes et standards en vigueur dans un environnement de développement normatif",
      "Travailler en équipe et en réseau ainsi qu'en autonomie et responsabilité au service d'un projet",
      'Communiquer par oral et par écrit, de façon claire et non-ambiguë, en français et dans au moins une langue étrangère',
    ],
    livrables: [
      "Processus d'application de hotfixes en production sans bloquer le développement en cours",
      'Guide étape-par-étape documenté dans le README du projet',
      "Communication formalisée avec l'équipe via merge requests GitLab",
      "Intégration d'un hotfix de la branche main vers la branche de développement",
      "Synchronisation de l'historique Git après merge et suppression des branches hotfix",
    ],
    status: "Processus opérationnel et documenté pour l'équipe de développement.",
    links: [],
  },
  {
    id: 'twitch',
    file: 'fiche-twitch.pdf',
    title: 'Site yozoravtfan.netlify.app',
    subtitle: 'Sécurité, CI/CD et communication API',
    date: '2026-05-18',
    competences: [
      'Assurer la qualité, la sûreté, la sécurité et la performance des applications',
      'Concevoir, déployer, gérer et faire évoluer une application',
      'Maîtriser la programmation',
    ],
    livrables: [
      "Site public de promotion sans friction d'accès pour créateur de contenu",
      "Le visiteur consulte directement les informations Twitch en temps réel sans authentification préalable.",
      'Gestion des secrets hors du contrôle de version, via .env local et tableau de bord Netlify en production.',
      'Communication API sécurisée par OAuth server-to-server.',
      'Pipeline CI/CD entièrement automatisé du commit au déploiement.',
    ],
    status: 'Online and ready for update.',
    links: [
      { label: 'Dépôt du front', href: 'https://github.com/Korrighed/Yozora_Site/' },
      { label: 'Site en ligne', href: 'https://yozoravtfan.netlify.app' },
    ],
  },
];

export function findFiche(event) {
  const id = event.queryStringParameters?.id;
  return fiches.find((f) => f.id === id) || null;
}
