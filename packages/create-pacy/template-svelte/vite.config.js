import pacyDevtools from '@pacy-dev/plugin-devtools'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [pacyDevtools({ bundler: 'vite' }), svelte()],
})
