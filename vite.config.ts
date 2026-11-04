import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Static single-page build for Cloudflare Pages: output goes to dist/.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    target: 'es2022',
    // Inline nothing larger than 4 KB so artwork is always a cacheable, hashed file.
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Keep GSAP in its own long-lived chunk; it changes far less often than site code.
        manualChunks(id) {
          if (id.includes('node_modules/gsap')) return 'gsap';
          if (id.includes('node_modules/react')) return 'react';
          return undefined;
        },
      },
    },
  },
});
