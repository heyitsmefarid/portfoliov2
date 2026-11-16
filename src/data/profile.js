// Personal details shown across the site.
// Leave a field as an empty string when you don't want it shown; the UI skips
// empty values instead of guessing.

export const profile = {
  name: 'Fred Anthony Gallano',
  firstName: 'Fred',
  role: 'Full-Stack Developer',
  focus: ['Full-Stack Developer', 'Web Developer', 'Mobile App Developer'],
  status: 'BS Information Systems, 4th year',
  // From the location on your public GitHub profile. Set to '' to hide it.
  location: 'Calapan City, Oriental Mindoro, Philippines',
  // Used for the live local-time line in the hero. Set to '' to hide it.
  timeZone: '',

  // The ID photo stapled to the hero (currently your GitHub avatar). Replace
  // the file in /public/profile or set photo to null to hide it.
  photo: {
    src: '/profile/fred.webp',
    alt: 'Portrait of Fred Anthony Gallano',
    width: 368,
    height: 460,
  },

  availability: {
    open: true,
    // The status box: `label` under the stamp, `detail` printed along the stamp.
    label: 'Open to OJT, freelance clients and remote jobs',
    detail: 'OJT / Freelance / Remote',
  },

  headline: 'Building digital experiences that actually solve problems.',
  // The opening paragraph on the home page, under the name.
  lede:
    "I'm a fourth-year Information Systems student in Calapan City. I build web and mobile systems for real work: scholarship records, flood maps, shop inventory and library lending.",
  intro:
    '4th Year BS Information Systems student focused on full-stack web and mobile development.',
  tagline: 'I build useful digital experiences through code.',

  about: [
    "I turn ideas into working apps across web, mobile and backend, and I learn fastest by shipping real projects.",
    'What I care about most is whether the people using an app can get their work done with it.',
  ],


  contact: {
    email: 'gallanofredanthony15@gmail.com',
    // Shown as written; the call link uses the international form.
    phone: '0997 503 5153',
    phoneIntl: '+639975035153',
    githubUsername: 'heyitsmefarid',
    github: 'https://github.com/heyitsmefarid',
    // TODO: paste your full LinkedIn profile URL to show it.
    linkedin: '',
    facebook: 'https://www.facebook.com/gallanofredanthony.27/',
  },

  // TODO: link a PDF résumé (e.g. '/resume.pdf' placed in /public) to show a download link.
  resumeUrl: '',
}
