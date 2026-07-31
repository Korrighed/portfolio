import { verifyCredentials, createSessionCookie } from '../../lib/auth.js';

export const prerender = false;

export async function POST({ request, cookies, redirect }) {
  const form = await request.formData();
  const username = form.get('username');
  const password = form.get('password');

  if (verifyCredentials(username, password)) {
    await createSessionCookie(cookies);
    return redirect('/fiches-reflexives');
  }

  return redirect('/login?error=1');
}
