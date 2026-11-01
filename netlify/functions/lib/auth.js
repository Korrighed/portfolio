import { createHash, timingSafeEqual } from 'node:crypto';
import { sealData, unsealData } from 'iron-session';

const SESSION_COOKIE = 'session';
const TTL_SECONDS = 60 * 60 * 8; // 8h

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET manquant ou trop court (min 32 caracteres).');
  }
  return secret;
}

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

// CONTEXT est une variable de build Netlify, pas du runtime des fonctions :
// on se fie donc au protocole de la requete. En local (http://localhost) le
// cookie reste sans Secure, sinon le navigateur le refuserait.
function secureAttribute(event) {
  const forwarded = event?.headers?.['x-forwarded-proto'];
  const isHttps = forwarded
    ? forwarded.split(',')[0].trim() === 'https'
    : Boolean(event?.rawUrl?.startsWith('https:'));
  return isHttps ? '; Secure' : '';
}

export async function createSessionCookieHeader(event) {
  const seal = await sealData(
    { authenticated: true },
    { password: getSessionSecret(), ttl: TTL_SECONDS }
  );

  return `${SESSION_COOKIE}=${seal}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TTL_SECONDS}${secureAttribute(event)}`;
}

export function destroySessionCookieHeader(event) {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureAttribute(event)}`;
}

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

export async function isAuthenticated(cookieHeader) {
  const seal = parseCookies(cookieHeader)[SESSION_COOKIE];
  if (!seal) return false;

  try {
    const data = await unsealData(seal, {
      password: getSessionSecret(),
      ttl: TTL_SECONDS,
    });
    return Boolean(data?.authenticated);
  } catch {
    return false;
  }
}

// 'redirect' (defaut) pour les pages HTML, '401' pour les endpoints fetch (ex. PDF).
function unauthorizedResponse(onFail) {
  if (onFail === '401') {
    return { statusCode: 401, body: 'Non autorise' };
  }
  return { statusCode: 302, headers: { Location: '/login.html' }, body: '' };
}

export function withAuth(handler, { onFail = 'redirect' } = {}) {
  return async (event, context) => {
    const authed = await isAuthenticated(event.headers.cookie);
    const response = authed ? await handler(event, context) : unauthorizedResponse(onFail);

    // Les [[headers]] de netlify.toml ne s'appliquent pas aux reponses des
    // fonctions : le cache prive est donc pose ici, pour pages et PDF.
    return {
      ...response,
      headers: { ...response.headers, 'Cache-Control': 'private, no-store' },
    };
  };
}
