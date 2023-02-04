import { defineConfig } from 'astro/config';

// https://astro.build/config
import svelte from '@astrojs/svelte';
import image from '@astrojs/image';

// https://astro.build/config
export default defineConfig({
    site: 'https://kivalevan.me',
    base: '/',
    integrations: [svelte(), image()],
});
