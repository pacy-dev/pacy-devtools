import pacyDevtools from '@pacy-dev/plugin-devtools'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [pacyDevtools({ bundler: 'vite' }), solid()],
})
