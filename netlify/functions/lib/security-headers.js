// En-tetes de securite des reponses des fonctions : les [[headers]] de netlify.toml ne s'y appliquent pas.
// Meme jeu que les pages statiques, sans jsDelivr (aucune page de fonction n'y charge de script).
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
};

// Les en-tetes deja poses par la fonction (Cache-Control, Location, ...) restent prioritaires.
export function secure(response) {
  return { ...response, headers: { ...SECURITY_HEADERS, ...response.headers } };
}
