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
      src: '/projects/iskonnect-logo.webp',
      alt: 'The ISKONNECT logo in green, blue, purple and orange, with circuit-line accents and a signal icon above the O.',
      width: 1254,
      height: 784,
    },
    cover: 'grid',
    liveUrl: 'https://iskonnect-scholar.web.app',
    codeUrl: '',
    note: 'Private repository',
  },
  {
    id: 'studyspace',
    name: 'StudySpace',
    subtitle: 'Shared study space for two',
    kind: 'Web app',
    description:
      'A private study app for two people: rich-text notes, spaced-repetition flashcards, quizzes, a planner, a focus timer, and Nova, an AI tutor that runs server-side on Gemini with Groq as the fallback. Every study session adds a star to a shared sky. Data is protected by Postgres row-level security.',
    tech: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'Gemini API'],
    image: {
      src: '/projects/studyspace-login.webp',
      alt: 'StudySpace login page at night: a constellation linking "you" to "your person" above the headline "A study sky for two.", beside a "Welcome back to your sky" log-in card.',
      width: 1280,
      height: 800,
    },
    cover: 'grid',
    liveUrl: 'https://studyspace-murex.vercel.app',
    codeUrl: 'https://github.com/heyitsmefarid/studyspace',
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
    image: {
      src: '/projects/tailfinder-landing.webp',
      alt: 'TailFinder home page with the headline "Find Your Perfect Companion Today. Adopt, Love, Cherish", a Get Started button, and an illustration of people with their pets.',
      width: 798,
      height: 499,
    },
    cover: 'paw',
    liveUrl: 'https://tailfinder-mu.vercel.app',
    codeUrl: 'https://github.com/heyitsmefarid/tailfinder',
    note: '',
  },
  {
    id: 'meu-gear-up',
    name: 'MEU Gear Up',
    subtitle: 'Motorcycle Service and Management System',
    kind: 'Web app',
    description:
      'A multi-branch motorcycle shop system with separate portals for customers, mechanics, suppliers, and admins: service booking, roadside assistance requests, point-of-sale, stock transfers between branches, mechanic job assignment, and sales reports.',
    tech: ['PHP', 'MySQL', 'Bootstrap', 'Chart.js', 'PHPMailer'],
    image: {
      src: '/projects/meu-gear-up-home.webp',
      alt: 'MEU GearUp home page with the headline "Ride Better, Repair Smarter", a Book Service button, the Singko, Masipit and Baco branches, and garage hours of 8AM–7PM, over a wall of tools.',
      width: 814,
      height: 509,
    },
    cover: 'gear',
    liveUrl: 'https://meugearup.vercel.app',
    codeUrl: 'https://github.com/heyitsmefarid/meu_gearup',
    note: '',
  },
  {
    id: 'checkers',
    name: 'Checkers Game',
    subtitle: 'Windows desktop game',
    kind: 'Desktop app',
    description:
      'A checkers game with player accounts, a two-player mode, and a computer opponent at three levels. On Hard, it searches five moves ahead using minimax with alpha-beta pruning. Match results, best-of series, and a leaderboard are stored in MySQL.',
    tech: ['C#', '.NET 8 WinForms', 'MySQL'],
    image: {
      src: '/projects/checkers-login.webp',
      alt: 'Checkers login screen with a gold CHECKERS title over a wooden board, username and password fields, and Log In and Sign Up buttons.',
      width: 797,
      height: 498,
    },
    cover: 'board',
    liveUrl: 'https://checkers-theta-lemon.vercel.app',
    codeUrl: 'https://github.com/heyitsmefarid/checkers',
    note: '',
  },
  {
    id: 'guhit-arts',
    name: 'Guhit Arts Center',
    subtitle: 'Arts & printing shop prototype',
    kind: 'Academic prototype',
    description:
      'A front-end prototype built for an academic business proposal: a design studio where visitors preview their own text on a mug or shirt, an online shop with order tracking, and an admin panel with role-based access and sales reports. All data is simulated in the browser.',
    tech: ['React', 'Vite', 'React Router'],
    image: {
      src: '/projects/guhit-arts-home.webp',
      alt: 'Guhit Arts Center home page with the headline "From Your Ideas to Something Real.", its printing, art, customized products and sporting goods services, and photos of the shop.',
      width: 1080,
      height: 675,
    },
    cover: 'halftone',
    liveUrl: 'https://guhit-arts.vercel.app',
    codeUrl: 'https://github.com/heyitsmefarid/guhit-arts',
    note: '',
  },
]
