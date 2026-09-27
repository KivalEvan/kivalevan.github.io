export const cvSummary =
   'Software engineer with professional experience in C#/.NET applications, web development, and data engineering. Core maintainer of ChroMapper, a Unity-based Beat Saber map editor. Applies codebase analysis and domain knowledge to improve performance, reliability, and editing workflows.';

export interface CvEducation {
   qualification: string;
   institution: string;
   start: Date;
   end: Date;
   result: string;
}

export const cvEducation: CvEducation[] = [
   {
      qualification: 'Bachelor of Computer Science (Software Engineering)',
      institution: 'Multimedia University, Cyberjaya',
      start: new Date('2018-07-01'),
      end: new Date('2024-07-01'),
      result: 'CGPA: 3.39/4.00',
   },
   {
      qualification: 'Foundation in Information Technology',
      institution: 'Multimedia University, Cyberjaya',
      start: new Date('2017-07-01'),
      end: new Date('2018-06-01'),
      result: 'CGPA: 3.16/4.00',
   },
];

export const cvAward = {
   title: 'Runner-up, Best Project Award (2022/2023)',
   start: new Date('2023-04-01'),
   end: new Date('2023-08-01'),
   type: 'Final Year Project',
   points: [
      'Built a desktop ETL prototype with a graphical interface for data transfer between multiple sources and targets.',
      'Implemented the prototype with Tauri, a TypeScript backend, and a Svelte frontend. Supported JSON, CSV, and MySQL data.',
   ],
};
