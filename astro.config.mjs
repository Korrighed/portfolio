import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// output: 'static' est le defaut Astro 5 (tout prerender).
// Les routes avec `export const prerender = false` (login, fiches, api)
// basculent en rendu serveur via l'adapter ci-dessous.
export default defineConfig({
  adapter: node({
    mode: 'standalone',
  }),
});
