import pacyDevtools from '@pacy-dev/plugin-devtools'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [pacyDevtools({ bundler: 'vite' }), preact()],
})
