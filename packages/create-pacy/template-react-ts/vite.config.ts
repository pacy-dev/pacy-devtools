import pacyDevtools from '@pacy-dev/plugin-devtools'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [pacyDevtools({ bundler: 'vite' }), react()],
})
