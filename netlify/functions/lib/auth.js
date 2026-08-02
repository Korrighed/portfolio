import { sealData, unsealData } from 'iron-session';
import bcrypt from 'bcryptjs';

const SESSION_COOKIE = 'session';
const TTL_SECONDS = 60 * 60 * 8; // 8h

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET manquant ou trop court (min 32 caracteres).');
  }
  return secret;
}

export function verifyCredentials(username, password) {
  const expectedUsername = process.env.AUTH_USERNAME;
  const expectedHash = process.env.AUTH_PASSWORD_HASH;

  if (!expectedUsername || !expectedHash) return false;
  if (username !== expectedUsername) return false;

  return bcrypt.compareSync(password, expectedHash);
}

export async function createSessionCookieHeader() {
  const seal = await sealData(
    { authenticated: true },
    { password: getSessionSecret(), ttl: TTL_SECONDS }
  );

  const secure = process.env.CONTEXT === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${seal}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TTL_SECONDS}${secure}`;
}

export function destroySessionCookieHeader() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
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
