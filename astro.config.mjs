import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

export default defineConfig({
  site: 'https://kivalevan.me',
  base: '/',
  integrations: [svelte()]
});