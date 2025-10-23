import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/cli.ts'),
      formats: ['es'],
      fileName: () => 'cli.js',
    },
    rollupOptions: {
      external: (id: string) => {
        // Handle Node.js built-in modules
        if (id.startsWith('node:') || id.match(/^[a-z]+$/)) {
          return true;
        }

        if (id.startsWith('@modelcontextprotocol/sdk')) {
          return true;
        }

        if (id.startsWith('@pacy/shared')) {
          return false;
        }

        return false;
      },
    },
    sourcemap: false,
    target: 'node18',
    minify: false,
  },
  plugins: [dts()],
});
