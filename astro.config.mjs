// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  vite: {
    build: {
      minify: false,
    },
    plugins: [tailwindcss()]
  },
  integrations: [vue({
    appEntrypoint: '/src/pages/_app',
    template: {
      compilerOptions: {
        // Trata a emoji-picker como un elemento personalizado nativo
        isCustomElement: (tag) => tag === 'emoji-picker'
      }
    }
  })]
});