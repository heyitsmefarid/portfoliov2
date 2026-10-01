// Page sections in order. `nav` is the short name used in the navigation;
// sections without it are left out of the menu.

export const sections = [
  { id: 'about', label: 'About', nav: 'About' },
  { id: 'experience', label: 'Experience', nav: 'Experience' },
  { id: 'education', label: 'Education', nav: 'Education' },
  { id: 'stack', label: 'Tech stack', nav: 'Stack' },
  { id: 'projects', label: 'Projects', nav: 'Projects' },
  { id: 'github', label: 'GitHub', nav: 'GitHub' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'contact', label: 'Contact', nav: 'Contact' },
]

// Short labels on the divider lines between parts of the page.
export const dividers = {
  top: 'Fred Anthony Gallano || Portfolio 2026',
  afterHero: 'Learning by building',
  beforeProjects: 'Ideas into working apps',
  beforeContact: 'Credentials | Contact',
}

export function sectionNumber(id) {
  const index = sections.findIndex((section) => section.id === id)
  return String(index + 1).padStart(2, '0')
}
