import * as bsmap from 'https://raw.githubusercontent.com/KivalEvan/BeatSaber-Deno/main/mod.ts';
import { Image } from 'https://deno.land/x/imagescript@1.2.15/mod.ts';
import { mediainfo } from './mediainfo.ts';

bsmap.logger.setLevel(5);

const INPUT_PATH =
    '/mnt/plextor/SteamLibrary/steamapps/common/Beat Saber/Beat Saber_Data/Kival Map/';
const OUTPUT_PATH = '/mnt/plextor/GitRepository/kivalevan.github.io/';

const showcase = [
    '2eafa',
    '2c663',
    '2b298',
    '2a038',
    '2848c',
    '269a7',
    '21b0b',
    '1d32b',
    '1d28c',
    '1988c',
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
    tag: ('request' | 'showcase')[];
}

const mapData: BeatmapDetails[] = [];

for await (const folder of Deno.readDir(INPUT_PATH)) {
    if (folder.isDirectory) {
        console.log(folder.name);
        if (
            bsmap.utils.existsSync(`${INPUT_PATH}/${folder.name}/Info.dat`) ||
            bsmap.utils.existsSync(`${INPUT_PATH}/${folder.name}/info.dat`)
        ) {
            let info: bsmap.types.IInfo;
            try {
                info = bsmap.load.infoSync({
                    directory: `${INPUT_PATH}/${folder.name}`,
                    filePath: '/Info.dat',
                });
            } catch {
                try {
                    info = bsmap.load.infoSync({
                        directory: `${INPUT_PATH}/${folder.name}`,
                        filePath: 'info.dat',
                    });
                } catch {
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
                tag: [],
            } as BeatmapDetails;

            const r = await mediainfo.get(`${INPUT_PATH}/${folder.name}/${info._songFilename}`);
            mapDetails.songDuration = parseFloat(r.info[0].Duration);

            const beatsaverID = folder.name.slice(0, 5).trim();
            mapDetails.id = beatsaverID;
            mapDetails.songName = info._songName;
            mapDetails.songSubName = info._songSubName;
            mapDetails.songAuthorName = info._songAuthorName;
            mapDetails.beatsPerMinute.base = info._beatsPerMinute;
            mapDetails.beatsPerMinute.min = info._beatsPerMinute;
            mapDetails.beatsPerMinute.max = info._beatsPerMinute;
            mapDetails.environment = info._environmentName;
            mapDetails.environment360 = info._allDirectionsEnvironmentName || null;

            mapDetails.coverImage = beatsaverID + '.jpg';
            const img = await Image.decode(
                Deno.readFileSync(`${INPUT_PATH}/${folder.name}/${info._coverImageFilename}`)
            );
            img.resize(256, 256);
            Deno.writeFileSync(
                `${OUTPUT_PATH}/public/assets/img/cover/${mapDetails.coverImage}`,
                await img.encodeJPEG(80)
            );

            mapDetails.link = {};
            mapDetails.link.BeatSaver = {
                name: 'BeatSaver',
                url: `https://beatsaver.com/maps/${beatsaverID}`,
            };
            mapDetails.link.BeastSaber = {
                name: 'BeastSaber',
                url: `https://bsaber.com/songs/${beatsaverID}/`,
            };
            if (showcase.includes(beatsaverID)) {
                mapDetails.tag.push('showcase');
            }
            if (request.includes(beatsaverID)) {
                mapDetails.tag.push('request');
            }

            const diffList = bsmap.load.difficultyFromInfoSync(info, {
                directory: `${INPUT_PATH}/${folder.name}/`,
            });

            diffList.forEach((d) => updateData(info, d.data, mapDetails));
            mapData.push(mapDetails);
        }
    }
}

function updateData(
    info: bsmap.types.IInfo,
    diff: bsmap.types.wrapper.IWrapDifficulty,
    mapDetails: BeatmapDetails
) {
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
            let curMinBPM = info._beatsPerMinute,
                curMaxBPM = info._beatsPerMinute;
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
