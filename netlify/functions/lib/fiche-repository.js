// Metadonnees des fiches reflexives. Le fichier PDF correspondant
// vit dans le store Netlify Blobs (cf. storage.js), jamais commite dans le repo.
export const fiches = [
  {
    id: 'fiche-1',
    title: 'Fiche reflexive 1',
    file: 'fiche-1.pdf',
  },
];

export function findFiche(event) {
  const id = event.queryStringParameters?.id;
  return fiches.find((f) => f.id === id) || null;
}
