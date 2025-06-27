import * as bsmap from 'bsmap';
import * as bstypes from 'bsmap/types';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Image } from 'imagescript';
import { mediainfo } from './mediainfo.ts';

bsmap.logger.setLevel(0);

const INPUT_PATH =
   '/mnt/programs/SteamLibrary/steamapps/common/Beat Saber/Beat Saber_Data/Kival Map/';
const OUTPUT_PATH = '/home/kival/Code/GitRepository/kivalevan.github.io/';

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

const request = ['1edda', '200cb', '21660', '2295d', '45504', '45509', '4550b', '45ff6', '45ff7'];

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
   difficulties: { [key: string]: string[] };
   tag: ('request' | 'showcase')[];
}

const mapData: BeatmapDetails[] = [];

for (const folder of readdirSync(INPUT_PATH, { withFileTypes: true })) {
   if (folder.isDirectory()) {
      console.log(folder.name);
      const path = resolve(INPUT_PATH, folder.name);
      if (existsSync(resolve(path, 'Info.dat')) || existsSync(resolve(path, 'info.dat'))) {
         let info;
         try {
            info = bsmap.readInfoFileSync('Info.dat', 2, {
               directory: path,
            });
         } catch (e2) {
            try {
               info = bsmap.readInfoFileSync('info.dat', 2, {
                  directory: path,
               });
            } catch (e) {
               console.error(e2);
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
            difficulties: {},
            tag: [],
         } as BeatmapDetails;

         try {
            const r = await mediainfo.get(resolve(path, info.audio.filename));
            mapDetails.songDuration = parseFloat(r.info[0].Duration);
         } catch (e) {
            console.error(e);
         }

         const beatsaverID = folder.name.slice(0, 5).trim();
         mapDetails.id = beatsaverID;
         mapDetails.songName = info.song.title;
         mapDetails.songSubName = info.song.subTitle;
         mapDetails.songAuthorName = info.song.author;
         mapDetails.beatsPerMinute.base = info.audio.bpm;
         mapDetails.beatsPerMinute.min = info.audio.bpm;
         mapDetails.beatsPerMinute.max = info.audio.bpm;
         mapDetails.environment = info.environmentName;
         mapDetails.environment360 = info.allDirectionsEnvironmentName || null;

         mapDetails.coverImage = beatsaverID + '.jpg';
         const img = await Image.decode(readFileSync(resolve(path, info.coverImageFilename)));
         img.resize(256, 256);
         writeFileSync(
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
         mapDetails.difficulties = info.difficulties.reduce((p, v) => {
            p[v.characteristic] ||= [];
            p[v.characteristic].push(v.difficulty);
            return p;
         }, {});

         const diffList = bsmap.readFromInfoSync(info, {
            directory: path,
         });

         diffList.forEach((d) => updateData(info, d.beatmap, mapDetails));
         mapData.push(mapDetails);
      }
   }
}

function updateData(
   info: bstypes.wrapper.IWrapInfo,
   diff: bstypes.wrapper.IWrapBeatmap,
   mapDetails: BeatmapDetails,
) {
   let curMinBPM = info.audio.bpm,
      curMaxBPM = info.audio.bpm;
   if (diff.difficulty.bpmEvents.length > 1) {
      diff.difficulty.bpmEvents.forEach((e) => {
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
   if (diff.lightshow.basicEvents.filter((e) => e.type === 100).length) {
      diff.lightshow.basicEvents
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
      const customData = diff.difficulty.customData;
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
writeFileSync(`${OUTPUT_PATH}/src/data/beatmap.json`, JSON.stringify(mapData));
