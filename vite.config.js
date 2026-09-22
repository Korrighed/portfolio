import { defineConfig } from 'vite';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildIndex } from './scripts/build-index.js';

const root = dirname(fileURLToPath(import.meta.url));
const srcDir = join(root, 'src');

// root: 'public' limite le watch par defaut a public/ ; ce plugin ajoute
// src/ pour regenerer public/index.html quand la source change.
function regenerateIndexOnSrcChange() {
  return {
    name: 'regenerate-index-on-src-change',
    configureServer(server) {
      server.watcher.add(srcDir);
      server.watcher.on('change', (file) => {
        if (file.startsWith(srcDir)) {
          buildIndex();
        }
      });
    },
  };
}

export default defineConfig({
  root: 'public',
  plugins: [regenerateIndexOnSrcChange()],
  server: {
    port: 5173,
    strictPort: true,
  },
});
