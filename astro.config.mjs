import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
   site: 'https://kivalevan.me',
   base: '/',
   integrations: [
      svelte(),
      sitemap({
         filter: (page) => new URL(page).pathname.replace(/\/+$/, '') !== '/cv',
      }),
      icon({
         include: {
            bi: [
               'book',
               'briefcase',
               'chevron-up',
               'envelope',
               'geo-alt',
               'globe',
               'hammer',
               'kanban',
               'link-45deg',
               'pause-fill',
               'play-fill',
               'star',
               'telephone',
               'trophy',
            ],
            'simple-icons': [
               'discord',
               'github',
               'kofi',
               'linkedin',
               'steam',
               'twitch',
               'x',
               'youtube',
            ],
         },
      }),
   ],
   vite: {
      plugins: [tailwindcss()],
   },
});
