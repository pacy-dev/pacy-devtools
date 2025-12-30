import pacyDevtools from '@pacy-dev/plugin-devtools'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [pacyDevtools({ bundler: 'vite' }), vue()],
})
