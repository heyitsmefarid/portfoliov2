// Personal details shown across the site and given to the portfolio assistant.
// Leave a field as an empty string when you don't want it shown — the UI and the
// assistant both skip empty values instead of guessing.

export const profile = {
  name: 'Fred Anthony Gallano',
  firstName: 'Fred',
  role: 'Aspiring Full-Stack Developer',
  focus: ['Full-Stack Developer', 'Web Developer', 'Mobile App Developer'],
  status: '4th Year BS Information Systems Student',
  // From the location on your public GitHub profile. Set to '' to hide it.
  location: 'Calapan City, Oriental Mindoro, Philippines',
  // Used for the live local-time line in the hero. Set to '' to hide it.
  timeZone: '',

  // Portrait in the hero (currently your GitHub avatar). Replace the file in
  // /public/profile or set photo to null to hide it.
  photo: {
    src: '/profile/fred.webp',
    alt: 'Portrait of Fred Anthony Gallano',
    width: 368,
    height: 460,
    // Plays behind the photo when it's hovered (the "curtain"). Set to null
    // to turn the effect off. Keep it short, muted-friendly and small (< 2 MB).
    video: null,
  },

  availability: {
    open: true,
    label: 'Open to opportunities',
    detail: 'Internship / OJT',
  },

  headline: 'Building digital experiences that actually solve problems.',
  intro:
    '4th Year BS Information Systems student focused on full-stack web and mobile development.',
  tagline: 'I build useful digital experiences through code.',

  about: [
    "I'm an Information Systems student who enjoys turning ideas into working applications. I work across web, mobile, and backend development, and I learn best by building real projects.",
    "I'm interested in creating software that isn't just functional, but actually useful to the people who use it.",
  ],

  facts: [
    { title: '4th Year', detail: 'BS Information Systems' },
    { title: 'Full-Stack', detail: 'Web + Mobile' },
    { title: 'Project-Based', detail: 'Learning' },
  ],

  contact: {
    // TODO: add the email you want visitors to use, e.g. 'name@example.com'.
    email: '',
    githubUsername: 'heyitsmefarid',
    github: 'https://github.com/heyitsmefarid',
    // TODO: paste full profile URLs to show these links.
    linkedin: '',
    facebook: '',
  },

  // TODO: link a PDF résumé (e.g. '/resume.pdf' placed in /public) to show a download link.
  resumeUrl: '',
}
