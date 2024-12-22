import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Garante que caminhos relativos sejam usados
  build: {
    outDir: 'dist', // Output para o diretório `dist`
  },
        rollupOptions: {
            output: {
             manualChunks: {
              vendor: ["three", "gsap"], // Módulos grandes separados em chunks
      },
    },
  },
});

