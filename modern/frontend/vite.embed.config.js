import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Builds the strangler embed as a self-executing bundle the legacy PHP pages
// can include with a plain <script> tag (no module loader on those pages).
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist/embed',
    emptyOutDir: true,
    lib: {
      entry: 'src/embed.jsx',
      name: 'ModernCatalogEmbed',
      formats: ['iife'],
      fileName: () => 'embed.js',
    },
    rollupOptions: {
      output: {
        assetFileNames: 'embed.[ext]',
      },
    },
  },
})
