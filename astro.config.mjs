import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
   site: 'https://kivalevan.me',
   base: '/',
   // Scope component styles without changing their authored specificity.
   scopedStyleStrategy: 'where',
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
});
