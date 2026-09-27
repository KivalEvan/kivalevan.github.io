/** Metadata shared by the offline beatmap generator and the website. */
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
