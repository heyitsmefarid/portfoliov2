// Projects shown in the Projects section, in display order. The first project
// is featured (shown larger).
//
// To add a project, copy one object and edit it:
//   image    – a screenshot in /public/projects (use .webp, ~1400px wide), or null
//              to show a generated cover. Always write a real `alt`.
//   cover    – cover art used when there is no image: 'board' | 'gear' | 'paw' |
//              'halftone' | 'grid'
//   liveUrl  – a public demo link, or '' to hide "View project"
//   codeUrl  – a repository link, or '' to hide "View code"
//   note     – short text shown instead of missing links (optional)

export const projects = [
  {
    id: 'iskonnect',
    name: 'ISKONNECT',
    subtitle: 'Mobile-Based Scholarship Management System',
    kind: 'Capstone project',
    description:
      'A scholarship management platform designed to help manage applicants, scholars, requirements, academic records, attendance, announcements, and scholarship monitoring.',
    tech: ['Flutter', 'React.js', 'NestJS', 'PostgreSQL', 'Prisma'],
    image: {
      src: '/projects/iskonnect-reports.webp',
      alt: 'ISKONNECT admin panel showing the Reports & Analytics page, with filters for report type, academic year, semester, school and scholar status.',
      width: 1366,
      height: 633,
    },
    cover: 'grid',
    // The admin panel is live, but it is an admin login — keep it private until
    // there is a public demo account.
    liveUrl: '',
    codeUrl: 'https://github.com/heyitsmefarid/capfinal',
    note: '',
  },
  {
    id: 'tailfinder',
    name: 'TailFinder',
    subtitle: 'Pet Adoption Management System',
    kind: 'Web app',
    description:
      'A web-based pet adoption system connecting adopters with available pets while providing management features for administrators.',
    tech: ['PHP', 'CodeIgniter', 'MySQL'],
    image: null,
    cover: 'paw',
    liveUrl: '',
    codeUrl: 'https://github.com/heyitsmefarid/tailfinder',
    note: '',
  },
  {
    id: 'meu-gear-up',
    name: 'MEU Gear Up',
    subtitle: 'Motorcycle Service and Management System',
    kind: 'Web app',
    description:
      'A management system for motorcycle-related services, parts, scheduling, point-of-sale operations, and roadside assistance requests.',
    tech: ['PHP', 'MySQL', 'Web technologies'],
    image: null,
    cover: 'gear',
    liveUrl: '',
    codeUrl: 'https://github.com/heyitsmefarid/meu_gearup',
    note: '',
  },
  {
    id: 'checkers',
    name: 'Checkers Game',
    subtitle: 'Windows desktop game',
    kind: 'Desktop app',
    description:
      'A digital checkers game project demonstrating programming logic, game mechanics, and interface development.',
    tech: ['C#', '.NET WinForms', 'MySQL'],
    image: null,
    cover: 'board',
    liveUrl: '',
    codeUrl: '',
    note: 'Desktop app — no public repo yet',
  },
  {
    id: 'guhit-arts',
    name: 'Guhit Arts Center',
    subtitle: 'Arts & printing shop prototype',
    kind: 'Academic prototype',
    description:
      'A front-end prototype built for an academic business proposal: an online shop, custom design requests, and an admin panel with sales reports.',
    tech: ['React', 'Vite', 'React Router'],
    image: null,
    cover: 'halftone',
    liveUrl: 'https://guhit-arts.vercel.app',
    codeUrl: 'https://github.com/heyitsmefarid/guhit-arts',
    note: '',
  },
]
