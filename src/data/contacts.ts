export interface Contact {
   place: string;
   name: string;
   url: string | null;
   icon: `simple-icons:${string}`;
}

const contacts: Contact[] = [
   {
      place: 'GitHub',
      name: 'KivalEvan',
      url: 'https://github.com/KivalEvan/',
      icon: 'simple-icons:github',
   },
   {
      place: 'Steam',
      name: 'Kival Evan',
      url: 'https://steamcommunity.com/id/KivalEvan/',
      icon: 'simple-icons:steam',
   },
   {
      place: 'YouTube',
      name: 'Kival Evan',
      url: 'https://www.youtube.com/channel/UC5pOhteTPou4iA8bNaEx3IA',
      icon: 'simple-icons:youtube',
   },
   {
      place: 'Twitch',
      name: 'KivalEvan',
      url: 'https://www.twitch.tv/kivalevan',
      icon: 'simple-icons:twitch',
   },
   {
      place: 'X (Twitter)',
      name: '@Kival_Evan',
      url: 'https://twitter.com/Kival_Evan',
      icon: 'simple-icons:x',
   },
   {
      place: 'Discord',
      name: '@kivalevan',
      url: null,
      icon: 'simple-icons:discord',
   },
];

export default contacts;
