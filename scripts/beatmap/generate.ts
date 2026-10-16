import * as bsmap from 'bsmap';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Image } from 'imagescript';
import { readDuration } from './mediainfo.ts';
import { bpmRange } from './bpm.ts';
import type { BeatmapDetails } from '../../src/data/beatmap.ts';

const USAGE =
   'Usage: deno run -A scripts/beatmap/generate.ts --input <map-directory> [--output <repository-root>]';

function parseArgs(args: string[]) {
   let input: string | undefined;
   let output = fileURLToPath(new URL('../../', import.meta.url));
   for (let i = 0; i < args.length; i++) {
      const flag = args[i];
      if (flag !== '--input' && flag !== '--output')
         throw new Error(`Unknown argument: ${flag}\n${USAGE}`);
      const value = args[++i];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}\n${USAGE}`);
      if (flag === '--input') input = value;
      else output = value;
   }
   if (!input) throw new Error(`An explicit input directory is required.\n${USAGE}`);
   return { input: resolve(input), output: resolve(output) };
}

const showcase = [
   '47a18',
   '45254',
   '3db37',
   '3d69b',
   '3d58d',
   '3a68e',
   '39f80',
   '33024',
   '2eafa',
   '2c663',
   '2b298',
   '2a038',
   '2848c',
   '269a7',
   '23d4d',
   '21b0b',
   '20ab6',
   '1d32b',
   '1d28c',
   '1988c',
   '193c1',
   '1902e',
   '1857c',
   '1815a',
   '18159',
   '14182',
   '10b39',
   '1095f',
   '10479',
   'f018',
   'dda4',
   'b642',
   'abd5',
   '7f35',
   '7b30',
   '713b',
   '65c7',
   '57e0',
   '5487',
];

const request = [
   '1edda',
   '200cb',
   '21660',
   '2295d',
   '45504',
   '45509',
   '4550b',
   '45ff6',
   '45ff7',
   '4de13',
   '4f953',
];

function text(value: unknown, field: string, required = false): string {
   if (typeof value !== 'string' || (required && !value.trim())) {
      throw new Error(`Expected ${required ? 'a nonempty string' : 'a string'} for ${field}`);
   }
   return value;
}

async function generate(input: string, output: string) {
   const mapData: BeatmapDetails[] = [];
   const covers: { filename: string; data: Uint8Array }[] = [];

   for (const folder of readdirSync(input, { withFileTypes: true })) {
      if (!folder.isDirectory()) continue;
      console.log(folder.name);
      const path = resolve(input, folder.name);
      if (!existsSync(resolve(path, 'Info.dat')) && !existsSync(resolve(path, 'info.dat')))
         continue;
      try {
         const info = bsmap.readInfoFileSync(
            existsSync(resolve(path, 'Info.dat')) ? 'Info.dat' : 'info.dat',
            {
               directory: path,
            },
         );
         const audioFilename = text(info.audio.filename, 'audio filename', true);
         const coverFilename = text(info.coverImageFilename, 'cover filename', true);
         const beatsaverID = folder.name.slice(0, 5).trim();
         if (!/^[\da-f]+$/i.test(beatsaverID))
            throw new Error('Folder name must start with a hexadecimal BeatSaver ID');
         const range = bpmRange(info.audio.bpm);
         const difficulties = info.difficulties.reduce(
            (p, v) => {
               const characteristic = text(v.characteristic, 'difficulty characteristic', true);
               text(v.filename, 'difficulty filename', true);
               p[characteristic] ||= [];
               p[characteristic].push(text(v.difficulty, 'difficulty name', true));
               return p;
            },
            {} as { [key: string]: string[] },
         );

         const diffList = bsmap.readFromInfoSync(info, {
            directory: path,
         });

         for (const d of diffList) {
            const difficultyRange = bpmRange(info.audio.bpm, d.beatmap);
            range.min = Math.min(range.min, difficultyRange.min);
            range.max = Math.max(range.max, difficultyRange.max);
         }

         const mapDetails: BeatmapDetails & { mode: string[] } = {
            id: beatsaverID,
            songName: text(info.song.title, 'song title'),
            songSubName: text(info.song.subTitle, 'song subtitle'),
            songAuthorName: text(info.song.author, 'song author'),
            coverImage: beatsaverID + '.jpg',
            environment: text(info.environmentBase.normal, 'environment') || 'DefaultEnvironment',
            environment360: text(info.environmentBase.allDirections, '360 environment') || null,
            beatsPerMinute: { base: info.audio.bpm, ...range },
            songDuration: await readDuration(resolve(path, audioFilename)),
            link: {
               BeatSaver: { name: 'BeatSaver', url: `https://beatsaver.com/maps/${beatsaverID}` },
               WebViewer: {
                  name: 'Web Viewer',
                  url: 'https://allpoland.github.io/ArcViewer/?id=' + beatsaverID,
               },
            },
            mode: [],
            difficulties,
            tag: [],
         };
         if (showcase.includes(beatsaverID)) mapDetails.tag.push('showcase');
         if (request.includes(beatsaverID)) mapDetails.tag.push('request');

         const img = await Image.decode(readFileSync(resolve(path, coverFilename)));
         img.resize(256, 256);
         covers.push({ filename: mapDetails.coverImage, data: await img.encodeJPEG(80) });
         mapData.push(mapDetails);
      } catch (error) {
         throw new Error(
            `Failed to generate map ${path}: ${error instanceof Error ? error.message : String(error)}`,
            { cause: error },
         );
      }
   }

   if (!mapData.length)
      throw new Error(
         `No map folders containing Info.dat or info.dat found in ${input}; output unchanged`,
      );
   mapData.sort((a, b) => parseInt(b.id, 16) - parseInt(a.id, 16));
   // Do not overwrite outputs until every map has been read and validated.
   const coverDirectory = resolve(output, 'public', 'assets', 'img', 'cover');
   mkdirSync(coverDirectory, { recursive: true });
   mkdirSync(resolve(output, 'src', 'data'), { recursive: true });
   for (const cover of covers) writeFileSync(resolve(coverDirectory, cover.filename), cover.data);
   writeFileSync(resolve(output, 'src', 'data', 'beatmap.json'), JSON.stringify(mapData));
}

if (import.meta.main) {
   try {
      if (Deno.args.length === 1 && Deno.args[0] === '--help') console.log(USAGE);
      else {
         const { input, output } = parseArgs(Deno.args);
         await generate(input, output);
      }
   } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      Deno.exitCode = 1;
   }
}
