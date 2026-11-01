# T401 — Code d'accès en clair dans AUTH_CODE, sans bcrypt

Statut : fait
Story : US-07 · Exigences : F-10, NF-02, T-02, T-03
Dépend de : aucune
Parallélisable : non
Exécutant : executor

## Objectif

Le code d'accès enseignant est lu dans la variable `AUTH_CODE` (valeur en clair, dans `.env` et dans les variables Netlify). `verifyCode` le compare au code reçu en temps constant (`crypto.timingSafeEqual` sur les empreintes SHA-256 des deux valeurs). `bcryptjs`, `AUTH_PASSWORD_HASH` et `scripts/hash-password.js` disparaissent.

## Fichiers à lire

- `netlify/functions/lib/auth.js` — `verifyCode`, import de `bcryptjs`
- `.env.example`, `README.md`
- `scripts/hash-password.js`, `package.json`

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `netlify/functions/lib/auth.js` | modifier | import `node:crypto`, `verifyCode` en temps constant, plus de `bcryptjs` |
| `scripts/hash-password.js` | supprimer | plus de hash |
| `package.json`, `package-lock.json` | modifier | dépendance `bcryptjs` retirée (par `npm uninstall`) |
| `.env.example` | modifier | `AUTH_CODE=` remplace `AUTH_PASSWORD_HASH=` |
| `README.md` | modifier | ligne `bcryptjs` retirée, ligne de lancement local mise à jour |

## Étapes

1. Dans `netlify/functions/lib/auth.js`, remplacer exactement les deux premières lignes :

```js
import { sealData, unsealData } from 'iron-session';
import bcrypt from 'bcryptjs';
```

par :

```js
import { createHash, timingSafeEqual } from 'node:crypto';
import { sealData, unsealData } from 'iron-session';
```

2. Dans le même fichier, remplacer exactement le bloc :

```js
// Code d'acces unique : seul le hash bcrypt (AUTH_PASSWORD_HASH) est stocke, jamais le code en clair.
export async function verifyCode(code) {
  const expectedHash = process.env.AUTH_PASSWORD_HASH;
  if (!expectedHash) return false;
  if (typeof code !== 'string' || code.length === 0) return false;

  return bcrypt.compare(code, expectedHash);
}
```

par :

```js
// Les deux valeurs sont reduites a une empreinte SHA-256 (32 octets) : timingSafeEqual exige des
// longueurs egales, et la duree de comparaison ne depend plus du nombre de caracteres justes.
function digest(value) {
  return createHash('sha256').update(value).digest();
}

// Code d'acces unique, lu en clair dans AUTH_CODE (.env local, variables Netlify).
export function verifyCode(code) {
  const expected = process.env.AUTH_CODE;
  if (!expected) return false;
  if (typeof code !== 'string' || code.length === 0) return false;

  return timingSafeEqual(digest(code), digest(expected));
}
```

3. Supprimer le fichier `scripts/hash-password.js`.
4. Lancer `npm uninstall bcryptjs` à la racine du dépôt. Vérifier ensuite que `package.json` ne contient plus `bcryptjs` et que `package-lock.json` n'en contient plus non plus.
5. Dans `.env.example`, remplacer exactement :

```
# Code d'acces enseignant (un seul code, pas d'identifiant)
# Hash bcrypt du code (jamais le code en clair)
# Generer avec : node scripts/hash-password.js "mon-code"
AUTH_PASSWORD_HASH=
```

par :

```
# Code d'acces enseignant (un seul code, pas d'identifiant), en clair.
# Au moins 12 caracteres. Meme valeur dans les variables Netlify. Ne jamais le committer.
AUTH_CODE=
```

Le fichier peut être en CRLF : conserver ses fins de ligne. Ne jamais écrire de valeur après `AUTH_CODE=`.

6. Dans `README.md` :
   - supprimer entièrement la ligne qui commence par `- **bcryptjs**` ;
   - supprimer entièrement la ligne `node scripts/hash-password.js "mot-de-passe" # coller le hash dans .env` ;
   - remplacer `cp .env.example .env` par `cp .env.example .env # puis renseigner AUTH_CODE et SESSION_SECRET`.
7. Lancer `node --check netlify/functions/lib/auth.js`.
8. Lancer ce contrôle (il ne doit afficher que `code ok`) :

```bash
node --input-type=module -e "const { verifyCode } = await import('./netlify/functions/lib/auth.js'); delete process.env.AUTH_CODE; if (verifyCode('x')) throw new Error('sans variable'); process.env.AUTH_CODE = 'code-de-test-123'; const cases = [['code-de-test-123', true], ['mauvais', false], ['code-de-test-12', false], ['code-de-test-1234', false], ['', false], [null, false], [undefined, false], [123, false]]; for (const [input, expected] of cases) if (verifyCode(input) !== expected) throw new Error('cas ' + String(input)); console.log('code ok')"
```

## Critères d'acceptation

- [ ] AC-01 : Étant donné `AUTH_CODE` défini, quand `verifyCode` reçoit le même texte, alors elle renvoie `true` ; pour un texte différent, plus court, plus long, vide, `null`, `undefined` ou un nombre, elle renvoie `false`, sans lever d'erreur.
- [ ] AC-02 : Étant donné `AUTH_CODE` absent, alors `verifyCode` renvoie `false`.
- [ ] AC-03 : Étant donné le dépôt, alors `bcryptjs`, `bcrypt` et `AUTH_PASSWORD_HASH` n'apparaissent plus dans `netlify/`, `scripts/`, `package.json`, `.env.example` ni `README.md`, et `scripts/hash-password.js` n'existe plus.
- [ ] AC-04 : Étant donné `.env.example`, alors la ligne `AUTH_CODE=` n'a aucune valeur.

## Vérification

Les commandes des étapes 7 et 8. Utiliser l'outil Grep (le `grep` du shell est peu fiable ici) pour AC-03 et AC-04.

## Hors périmètre

- Ne pas modifier `netlify/functions/login.js` (la ligne `await verifyCode(code)` reste valable : `await` sur un booléen est sans effet).
- Ne pas modifier le reste de `auth.js` (cookie, session, `withAuth`), ni les fichiers sous `docs/`.
- Ne pas toucher au fichier `.env` local s'il existe.
- Ne jamais écrire un vrai code dans le dépôt.
- Ne pas committer.

## Notes d'exécution

- Étapes 1 à 8 appliquées ; blocs source trouvés à l'identique.
- `npm uninstall bcryptjs` : seule entrée retirée du lockfile. `iron-webcrypto` contient la sous-chaîne « bcrypt » : faux positif.
- `npm audit` signale 43 vulnérabilités après l'installation. Non traitées, hors périmètre.
- Fins de ligne conservées : `package.json` et `package-lock.json` en CRLF, les autres fichiers modifiés en LF.
- `.env` local non touché. Il contient encore `AUTH_PASSWORD_HASH` et `AUTH_USERNAME`, pas `AUTH_CODE` : en local, `verifyCode` renvoie `false` tant que `AUTH_CODE` n'est pas ajouté.
- Hors périmètre, docs non modifiées : `docs/TRD.md` et `docs/reports/2026-10-26-constats.md` citent encore `bcryptjs` / `AUTH_PASSWORD_HASH`.
- Déploiement : `AUTH_CODE` doit être posé dans les variables Netlify, sinon la connexion échoue. Action manuelle, hors dépôt.
- Non committé.
