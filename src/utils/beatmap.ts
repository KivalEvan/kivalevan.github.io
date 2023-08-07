import * as bsmap from 'https://raw.githubusercontent.com/KivalEvan/BeatSaber-Deno/main/mod.ts';
import { existsSync } from 'https://deno.land/std@0.192.0/fs/mod.ts';
import { resolve } from 'https://deno.land/std@0.192.0/path/mod.ts';
import { Image } from 'https://deno.land/x/imagescript@1.2.15/mod.ts';
import { mediainfo } from './mediainfo.ts';

bsmap.logger.setLevel(5);

const INPUT_PATH =
   '/mnt/plextor/SteamLibrary/steamapps/common/Beat Saber/Beat Saber_Data/Kival Map/';
const OUTPUT_PATH = '/mnt/plextor/GitRepository/kivalevan.github.io/';

const showcase = [
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

const request = ['1edda', '200cb', '21660', '2295d'];

export interface BeatmapDetails {
   id: string;
   songName: string;
   songSubName: string;
   songAuthorName: string;
   coverImage: string;
   environment: string;
   environment360: string | null;
   beatsPerMinute: {
      base: number;
      min: number;
      max: number;
   };
   songDuration: number;
   link: {
      [key: string]: {
         name: string;
         url: string;
      };
   };
   mode: string[];
   difficulty: number;
   tag: ('request' | 'showcase')[];
}

const mapData: BeatmapDetails[] = [];

for await (const folder of Deno.readDir(INPUT_PATH)) {
   if (folder.isDirectory) {
      console.log(folder.name);
      const path = resolve(INPUT_PATH, folder.name);
      if (existsSync(resolve(path, 'Info.dat')) || existsSync(resolve(path, 'info.dat'))) {
         let info: bsmap.types.IInfo;
         try {
            info = bsmap.load.infoSync(2, {
               directory: path,
               filePath: 'Info.dat',
            });
         } catch {
            try {
               info = bsmap.load.infoSync(2, {
                  directory: path,
                  filePath: 'info.dat',
               });
            } catch {
               console.error('wtf?');
               continue;
            }
         }

         const mapDetails = {
            id: '',
            songName: '',
            songSubName: '',
            songAuthorName: '',
            coverImage: '',
            environment: '',
            environment360: '',
            beatsPerMinute: {
               base: 0,
               min: 0,
               max: 0,
            },
            songDuration: 0,
            link: {},
            mode: [],
            difficulty: 0,
            tag: [],
         } as BeatmapDetails;

         const r = await mediainfo.get(resolve(path, info.songFilename));
         mapDetails.songDuration = parseFloat(r.info[0].Duration);

         const beatsaverID = folder.name.slice(0, 5).trim();
         mapDetails.id = beatsaverID;
         mapDetails.songName = info.songName;
         mapDetails.songSubName = info.songSubName;
         mapDetails.songAuthorName = info.songAuthorName;
         mapDetails.beatsPerMinute.base = info.beatsPerMinute;
         mapDetails.beatsPerMinute.min = info.beatsPerMinute;
         mapDetails.beatsPerMinute.max = info.beatsPerMinute;
         mapDetails.environment = info.environmentName;
         mapDetails.environment360 = info.allDirectionsEnvironmentName || null;

         mapDetails.coverImage = beatsaverID + '.jpg';
         const img = await Image.decode(Deno.readFileSync(resolve(path, info.coverImageFilename)));
         img.resize(256, 256);
         Deno.writeFileSync(
            resolve(OUTPUT_PATH, 'public', 'assets', 'img', 'cover', mapDetails.coverImage),
            await img.encodeJPEG(80),
         );

         mapDetails.link = {};
         mapDetails.link.BeatSaver = {
            name: 'BeatSaver',
            url: `https://beatsaver.com/maps/${beatsaverID}`,
         };
         mapDetails.link.WebViewer = {
            name: 'Web Viewer',
            url: 'https://allpoland.github.io/ArcViewer/?id=' + beatsaverID,
         };
         if (showcase.includes(beatsaverID)) {
            mapDetails.tag.push('showcase');
         }
         if (request.includes(beatsaverID)) {
            mapDetails.tag.push('request');
         }
         mapDetails.mode = Array.from(new Set(info.listMap().map((s) => s[0])));
         mapDetails.difficulty = info.listMap().length;

         const diffList = bsmap.load.difficultyFromInfoSync(info, {
            directory: path,
         });

         diffList.forEach((d) => updateData(info, d.data, mapDetails));
         mapData.push(mapDetails);
      }
   }
}

function updateData(
   info: bsmap.types.IInfo,
   diff: bsmap.types.wrapper.IWrapDifficulty,
   mapDetails: BeatmapDetails,
) {
   let curMinBPM = info.beatsPerMinute,
      curMaxBPM = info.beatsPerMinute;
   if (diff.bpmEvents.length) {
      diff.bpmEvents.forEach((e) => {
         if (e.bpm < curMinBPM) {
            curMinBPM = e.bpm;
         } else if (e.bpm > curMaxBPM) {
            curMaxBPM = e.bpm;
         }
      });
      if (!mapDetails.beatsPerMinute.min || !mapDetails.beatsPerMinute.max) {
         mapDetails.beatsPerMinute.min = curMinBPM;
         mapDetails.beatsPerMinute.max = curMaxBPM;
      }
      if (curMinBPM < mapDetails.beatsPerMinute.min) {
         mapDetails.beatsPerMinute.min = curMinBPM;
      }
      if (curMaxBPM > mapDetails.beatsPerMinute.max) {
         mapDetails.beatsPerMinute.max = curMaxBPM;
      }
      return;
   }
   if (diff.basicEvents.filter((e) => e.type === 100).length) {
      diff.basicEvents
         .filter((e) => e.type === 100)
         .forEach((e) => {
            if (e.floatValue < curMinBPM) {
               curMinBPM = e.floatValue;
            } else if (e.floatValue > curMaxBPM) {
               curMaxBPM = e.floatValue;
            }
         });
      if (!mapDetails.beatsPerMinute.min || !mapDetails.beatsPerMinute.max) {
         mapDetails.beatsPerMinute.min = curMinBPM;
         mapDetails.beatsPerMinute.max = curMaxBPM;
      }
      if (curMinBPM < mapDetails.beatsPerMinute.min) {
         mapDetails.beatsPerMinute.min = curMinBPM;
      }
      if (curMaxBPM > mapDetails.beatsPerMinute.max) {
         mapDetails.beatsPerMinute.max = curMaxBPM;
      }
      return;
   }
   if (diff.customData) {
      const customData = diff.customData;
      let BPMChanges;
      if (customData._BPMChanges) {
         BPMChanges = customData._BPMChanges;
      } else if (customData._bpmChanges) {
         BPMChanges = customData._bpmChanges;
      } else if (customData.BPMChanges) {
         BPMChanges = customData._bpmChanges;
      }
      if (BPMChanges && Array.isArray(BPMChanges) && BPMChanges.length > 0) {
         for (let i = 0, len = BPMChanges.length; i < len; i++) {
            if (BPMChanges[i]._BPM < curMinBPM) {
               curMinBPM = BPMChanges[i]._BPM;
            } else if (BPMChanges[i]._BPM > curMaxBPM) {
               curMaxBPM = BPMChanges[i]._BPM;
            } else if (BPMChanges[i]._bpm < curMinBPM) {
               curMinBPM = BPMChanges[i]._bpm;
            } else if (BPMChanges[i]._bpm > curMaxBPM) {
               curMaxBPM = BPMChanges[i]._bpm;
            } else if (BPMChanges[i].m < curMinBPM) {
               curMinBPM = BPMChanges[i]._bpm;
            } else if (BPMChanges[i].m > curMaxBPM) {
               curMaxBPM = BPMChanges[i]._bpm;
            }
         }
         if (!mapDetails.beatsPerMinute.min || !mapDetails.beatsPerMinute.max) {
            mapDetails.beatsPerMinute.min = curMinBPM;
            mapDetails.beatsPerMinute.max = curMaxBPM;
         }
         if (curMinBPM < mapDetails.beatsPerMinute.min) {
            mapDetails.beatsPerMinute.min = curMinBPM;
         }
         if (curMaxBPM > mapDetails.beatsPerMinute.max) {
            mapDetails.beatsPerMinute.max = curMaxBPM;
         }
      }
   }
}

mapData.sort((a, b) => parseInt(b.id, 16) - parseInt(a.id, 16));
Deno.writeTextFileSync(`${OUTPUT_PATH}/src/data/beatmap.json`, JSON.stringify(mapData, null, 4));
