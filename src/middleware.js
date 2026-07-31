import { defineMiddleware } from 'astro:middleware';
import { isAuthenticated } from './lib/auth.js';

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;
  const isApi = path.startsWith('/api/pdf');
  const isProtectedPage = path.startsWith('/fiches-reflexives');

  if (!isApi && !isProtectedPage) {
    return next();
  }

  const authenticated = await isAuthenticated(context.cookies);
  if (authenticated) {
    return next();
  }

  if (isApi) {
    return new Response('Non autorise', { status: 401 });
  }

  return context.redirect('/login');
});
