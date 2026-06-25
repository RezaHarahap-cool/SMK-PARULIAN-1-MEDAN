import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.VITE_API_BASE_URL || env.VITE_API_URL || 'http://localhost:3000'

  return {
    plugins: [
      {
        name: 'replace-api-base-url',
        enforce: 'pre',
        transform(code, id) {
          if (!id.includes('/src/') && !id.includes('\\src\\')) return null
          if (!/\.[jt]sx?$/.test(id)) return null
          return code.replaceAll('http://localhost:3000', apiBaseUrl)
        },
      },
      react(),
      tailwindcss(),
    ],
    base: '/',
  }
})
