import chromapper from '../assets/img/cv/chromapper.png';
import mapCheck from '../assets/img/cv/bsmc.png';
import editorEnhanced from '../assets/img/cv/bsee.png';

export const selectedProjects = [
   {
      id: 'map-check',
      title: 'Map Check',
      role: 'Personal project',
      summary:
         'A browser-based checker used by more than 500 mappers to inspect Beat Saber maps before release. I built the app and its reusable map-reading and error-checking library, BSMap.',
      stack: ['TypeScript', 'SolidJS'],
      image: mapCheck,
      imageAlt: 'Beat Saber Map Check interface',
      links: [
         {
            label: 'Open Map Check',
            href: 'https://kivalevan.github.io/BeatSaber-MapCheck/',
         },
         {
            label: 'View source',
            href: 'https://github.com/KivalEvan/BeatSaber-MapCheck',
         },
      ],
   },
   {
      id: 'chromapper',
      title: 'ChroMapper',
      role: 'Open-source contributor',
      summary:
         'An open-source Beat Saber map editor. My contributions include the Unity 6.3 migration and C# and HLSL refactoring for performance, memory use, and lighting-preview parity.',
      stack: ['Unity', 'C#', 'HLSL'],
      image: chromapper,
      imageAlt: 'ChroMapper editor preview',
      links: [
         {
            label: 'View repository',
            href: 'https://github.com/Caeden117/ChroMapper',
         },
      ],
   },
   {
      id: 'editor-enhanced',
      title: 'Editor Enhanced',
      role: 'Personal project',
      summary:
         'A C# modification for the official Beat Saber editor that improves lighting and event-box editing. It adds interactive v3 controls for lighting and event boxes.',
      stack: ['Unity', 'C#', 'HLSL'],
      image: editorEnhanced,
      imageAlt: 'Beat Saber Editor Enhanced preview',
      links: [
         {
            label: 'View repository',
            href: 'https://github.com/KivalEvan/BeatSaber-EditorEnhanced',
         },
      ],
   },
];

export const supportingProject = {
   title: 'BSMap',
   summary:
      'A TypeScript library for Beat Saber mapping. It provides the reusable code that reads maps and applies the rules used by Map Check.',
   href: 'https://github.com/KivalEvan/BeatSaber-Deno',
};

export const mappingLinks = [
   {
      title: 'Published Beat Saber maps',
      summary: 'Browse my public map portfolio on BeatSaver.',
      href: 'https://beatsaver.com/profile/4285062',
   },
   {
      title: 'Mapping Utility',
      summary: 'A collection of web tools for Beat Saber mapping.',
      href: 'https://kivalevan.github.io/BeatSaber-MappingUtility/',
   },
   {
      title: 'Mapping Script',
      summary: 'TypeScript scripts for making Beat Saber maps with BSMap.',
      href: 'https://github.com/KivalEvan/BeatSaber-MappingScript',
   },
   {
      title: 'ChroMapper Selector Plugin',
      summary: 'A ChroMapper plugin for selecting map objects.',
      href: 'https://github.com/KivalEvan/ChroMapper-Selector',
   },
];
