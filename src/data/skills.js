// Skill groups, in order of importance. `tier` controls how prominent a group
// looks: 'primary' → large tiles, 'secondary' → icon pills, 'tertiary' → text chips.
// `icon` is a key from src/lib/icons.js; leave it out to show a monogram.

export const skillGroups = [
  {
    id: 'main',
    title: 'Main development',
    tier: 'primary',
    items: [
      { name: 'Flutter', icon: 'flutter' },
      { name: 'React', icon: 'react' },
      { name: 'Node.js', icon: 'node' },
      { name: 'NestJS', icon: 'nest' },
      { name: 'PHP', icon: 'php' },
      { name: 'TypeScript', icon: 'typescript' },
      { name: 'JavaScript', icon: 'javascript' },
      { name: 'HTML', icon: 'html' },
      { name: 'CSS', icon: 'css' },
      { name: 'Bootstrap', icon: 'bootstrap' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend / database',
    tier: 'secondary',
    items: [
      { name: 'PostgreSQL', icon: 'postgresql' },
      { name: 'MySQL', icon: 'mysql' },
      { name: 'Firebase', icon: 'firebase' },
      { name: 'Supabase', icon: 'supabase' },
      { name: 'REST APIs', icon: 'api' },
    ],
  },
  {
    id: 'programming',
    title: 'Programming',
    tier: 'tertiary',
    items: [
      { name: 'Python', icon: 'python' },
      { name: 'Java', icon: 'java' },
      { name: 'C++', icon: 'cplusplus' },
    ],
  },
  {
    id: 'tools',
    title: 'Tools',
    tier: 'tertiary',
    items: [
      { name: 'Git', icon: 'git' },
      { name: 'GitHub', icon: 'github' },
      { name: 'VS Code' },
      { name: 'Android Studio', icon: 'androidstudio' },
      { name: 'Visual Studio' },
      { name: 'Figma', icon: 'figma' },
      { name: 'Canva' },
    ],
  },
]
