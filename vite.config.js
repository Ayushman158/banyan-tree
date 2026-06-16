import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    // Split large, stable vendor libs into their own chunks so repeat visits
    // hit cache instead of re-downloading app code bundled in with them.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'vendor-motion'
          if (id.includes('@iconify')) return 'vendor-iconify'
          if (id.includes('gsap')) return 'vendor-gsap'
          if (id.includes('react') || id.includes('scheduler')) return 'vendor-react'
        },
      },
    },
  },
})
