import { destroySessionCookie } from '../../lib/auth.js';

export const prerender = false;

export async function POST({ cookies, redirect }) {
  destroySessionCookie(cookies);
  return redirect('/');
}
