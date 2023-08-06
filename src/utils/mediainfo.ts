// Copyright 2021-Eternity Channelping. All rights reserved. MIT License.

// This is a wrapper for the CLI utility mediainfo.

const MEDIA_INFO_CMD = 'mediainfo';

// HTML and XML are other available formats. Although mediainfo documentation
// does not include JSON as one of the available output formats, it's available.
const DEFAULT_OUTPUT_FORMAT = '--Output=JSON';
const OUTPUT_FORMAT_RX = /^--Output=\w+$/;

interface Info {
   [key: string]: any;
}

interface ResultObject {
   exitCode: number;
   info: Info;
}

class MediaInfo {
   // Unlike mediainfo behavior, our wrapper has JSON output as the default.
   static setOutputFormat(params: Array<string>) {
      let outputOptionFound = false;
      for (const item of params) {
         if (OUTPUT_FORMAT_RX.test(item)) {
            outputOptionFound = true;
            break;
         }
      }

      if (!outputOptionFound) {
         params.push(DEFAULT_OUTPUT_FORMAT);
      }

      return params;
   }

   // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   // params represents a list of strings.
   //
   // Order is not important.
   //
   // get() returns the following JSON message shape, passed through from
   // getRaw(). The raw nested data structure is simplified to look like:
   //
   //   {
   //     "exitCode": number,
   //     "info": Array<object> | string
   //   }
   //
   // If binary command mediainfo is successful, exitCode = 0 and info is an
   // array of objects or a string.
   //
   // If binary command mediainfo is not successful, exitCode = 1 and info is a
   // string.
   // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   static async get(...params: Array<string>): Promise<ResultObject> {
      const resultTrack: ResultObject = { exitCode: 0, info: [] };
      const resultRaw: ResultObject = await MediaInfo.getRaw(...params);

      resultTrack.exitCode = resultRaw.exitCode;

      if (typeof resultRaw.info === 'object' && 'media' in resultRaw.info) {
         resultTrack.info = resultRaw.info.media.track;
      } else if (typeof resultRaw.info === 'string') {
         resultTrack.info = resultRaw.info;
      } else {
         console.error('unknown data structure returned from getRaw()');
         Deno.exit(1);
      }

      return resultTrack;
   }

   // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   // params represents a list of strings.
   //
   // Order is not important.
   //
   // getRaw() returns the following data structure, derived from mediainfo
   // binary return value:
   //
   //   {
   //     "exitCode": number,
   //     "info": object {
   //       "media": object {
   //         "@ref": string,
   //         "track": Array<object>
   //       }
   //     }
   //   }
   // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   static async getRaw(...params: Array<string>): Promise<ResultObject> {
      const result = { exitCode: 0, info: {} };

      const options = MediaInfo.setOutputFormat(params);

      const cmd = Deno.run({
         cmd: [MEDIA_INFO_CMD, ...options],
         stdin: 'piped',
         stdout: 'piped',
      });

      const rawOutput = await cmd.output();
      const outputString = new TextDecoder().decode(rawOutput);

      // JSON output may have been a specified option, but if there were other
      // options included as well, e.g., --Version, then the mediainfo command
      // returns non-JSON version information instead of getting specified media
      // file's info in JSON format. That's an expected case and is not an error.
      // It is handled as such in the catch block.
      try {
         result.info = JSON.parse(outputString);
      } catch (requiredArgButNotNecessary) {
         result.info = outputString.replace(/\n$/, '');
      }

      const { code } = await cmd.status();
      result.exitCode = code;

      cmd.stdin.close();
      cmd.close();

      return result;
   }

   static async isMediaInfoCommandExist() {
      const cmd = Deno.run({
         cmd: ['bash', 'which', MEDIA_INFO_CMD],
         stdout: 'piped',
      });
      try {
         const { code } = await cmd.status();
         cmd.stdout.close();
         cmd.close();
         return code === 0;
      } catch (e) {
         console.info('cmd.status() error:', e);
         Deno.exit(1);
      }
   }
} // end class

export { MediaInfo as mediainfo };

// sorry buddy, ur mediainfo check is screwing me up
