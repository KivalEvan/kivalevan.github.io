interface CvContactItem {
   label: string;
   href: string;
   icon: string;
   ariaLabel?: string;
}

interface CvContact {
   location: {
      label: string;
      icon: string;
   };
   methods: CvContactItem[];
   profiles: CvContactItem[];
}

const cvContact: CvContact = {
   location: {
      label: 'Selangor, Malaysia',
      icon: 'bi:geo-alt',
   },
   methods: [
      {
         label: 'Phone available on request',
         href: 'https://www.linkedin.com/in/kivalevan/',
         icon: 'bi:telephone',
         ariaLabel: 'Request phone contact via LinkedIn',
      },
      {
         label: 'kivalevan@gmail.com',
         href: 'mailto:kivalevan@gmail.com',
         icon: 'bi:envelope',
      },
   ],
   profiles: [
      {
         label: 'linkedin.com/in/kivalevan',
         href: 'https://www.linkedin.com/in/kivalevan/',
         icon: 'simple-icons:linkedin',
      },
      {
         label: 'KivalEvan',
         href: 'https://github.com/KivalEvan',
         icon: 'simple-icons:github',
      },
      {
         label: 'kivalevan.me',
         href: 'https://kivalevan.me/',
         icon: 'bi:globe',
      },
   ],
};

export default cvContact;
