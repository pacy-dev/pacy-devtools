import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import type { Plugin } from 'vite';

export function createBuildErrorsPlugin(): Plugin {
  return {
    name: 'pacy-build-errors',
    apply: 'serve', // Only apply in development
    configureServer(server) {
      // Inject client code to handle HMR errors
      server.middlewares.use('/__pacy_build_errors_client__', (_req, res) => {
        res.setHeader('Content-Type', 'application/javascript');

        try {
          // Read the client script from external file
          const __filename = fileURLToPath(import.meta.url);
          const __dirname = dirname(__filename);
          const clientScriptPath = resolve(__dirname, './build-errors-inject.js');
          const clientScript = readFileSync(clientScriptPath, 'utf-8');

          res.end(clientScript);
        } catch (error) {
          console.error('Failed to load build errors client script:', error);
          res.statusCode = 500;
          res.end('// Failed to load HMR error handler');
        }
      });
    },
    transformIndexHtml(html) {
      // Inject the client script
      return html.replace(
        '<head>',
        '<head>\n  <script type="module" src="/__pacy_build_errors_client__"></script>',
      );
    },
    buildStart() {
      // Hook into build start to catch early errors
    },
    handleHotUpdate(ctx) {
      // This hook is called on file changes
      // We can use it to catch and forward compilation errors
      try {
        return ctx.modules;
      } catch (error) {
        console.error('Error in handleHotUpdate:', error);
        // Re-throw to let Vite handle it normally
        throw error;
      }
    },
    transform(_code, id) {
      // Intercept transform errors, especially for .svelte files
      if (id.endsWith('.svelte')) {
        try {
          // Let the transform continue normally
          return null;
        } catch (error) {
          console.error(`Transform error in ${id}:`, error);
          throw error;
        }
      }

      return null;
    },
  };
}
