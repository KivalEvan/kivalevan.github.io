import { defineConfig, passthroughImageService } from 'astro/config';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  site: 'https://kivalevan.me',
  base: '/',
  integrations: [svelte()],
  image: {
    service: passthroughImageService()
  }
});