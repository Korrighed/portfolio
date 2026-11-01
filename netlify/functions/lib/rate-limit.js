// Limite des tentatives de connexion : compteur d'echecs par adresse IP, conserve dans Netlify Blobs.
// Si Blobs est indisponible, la connexion reste possible (on ne bloque pas l'enseignant) et l'erreur est journalisee.
import { connectLambda, getStore } from '@netlify/blobs';

export const MAX_FAILURES = 5;
export const WINDOW_SECONDS = 15 * 60;

// Adresse posee par Netlify, que l'appelant ne peut pas falsifier (contrairement a X-Forwarded-For).
export function clientKey(event) {
  const ip = event?.headers?.['x-nf-client-connection-ip'] || 'inconnue';
  return ip.replace(/[^0-9a-zA-Z.]/g, '_');
}

// Renvoie le store, ou null si Blobs n'est pas disponible.
export function openAttemptsStore(event) {
  try {
    connectLambda(event);
    return getStore('login-attempts');
  } catch (error) {
    console.error('Limite de tentatives indisponible :', error.message);
    return null;
  }
}

async function readEntry(store, key, now) {
  const entry = await store.get(key, { type: 'json' });
  if (!entry || now - entry.first > WINDOW_SECONDS * 1000) return null;
  return entry;
}

// Secondes restantes avant la fin du blocage ; 0 si la connexion est permise.
export async function lockedSeconds(store, key, now = Date.now()) {
  if (!store) return 0;
  try {
    const entry = await readEntry(store, key, now);
    if (!entry || entry.count < MAX_FAILURES) return 0;
    return Math.ceil((entry.first + WINDOW_SECONDS * 1000 - now) / 1000);
  } catch (error) {
    console.error('Lecture du compteur impossible :', error.message);
    return 0;
  }
}

export async function recordFailure(store, key, now = Date.now()) {
  if (!store) return;
  try {
    const entry = (await readEntry(store, key, now)) ?? { count: 0, first: now };
    await store.setJSON(key, { count: entry.count + 1, first: entry.first });
  } catch (error) {
    console.error('Ecriture du compteur impossible :', error.message);
  }
}

export async function clearFailures(store, key) {
  if (!store) return;
  try {
    await store.delete(key);
  } catch (error) {
    console.error('Remise a zero du compteur impossible :', error.message);
  }
}
