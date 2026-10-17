// Line icons for feature cards. Names: map route ai bell users chart shield
// book calendar card camera offline game store paw wrench clock list star
// (tests/projects.test.js keeps project data to this list).
const PATHS = {
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14',
  route: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12-10a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 15V9a3 3 0 0 1 3-3h1m8 3v6a3 3 0 0 1-3 3h-1',
  ai: 'M12 3v3m0 12v3M3 12h3m12 0h3M7 7l2 2m6 6 2 2M7 17l2-2m6-6 2-2M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2Zm4 4a2 2 0 0 0 4 0',
  users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 9a6 6 0 0 1 12 0m1-9a3 3 0 1 0 0-6m2 15a6 6 0 0 0-3-5.2',
  chart: 'M4 20V10m6 10V4m6 16v-7m4 7H2',
  shield: 'M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6l-8-3Zm-3 9 2 2 4-4',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Zm0 14a2 2 0 0 1 2-2h13',
  calendar: 'M4 6h16v14H4V6Zm0 4h16M8 3v4m8-4v4',
  card: 'M3 6h18v12H3V6Zm0 4h18M7 15h4',
  camera: 'M4 8h4l2-3h4l2 3h4v11H4V8Zm8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  offline:
    'M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 4-2.6m6 .1A10 10 0 0 1 19 13M2 9.5a15 15 0 0 1 5-3m5-1a15 15 0 0 1 10 4M12 20h.01',
  game: 'M6 9h12a3 3 0 0 1 3 3v3a3 3 0 0 1-5.2 2L14 15h-4l-1.8 2A3 3 0 0 1 3 15v-3a3 3 0 0 1 3-3Zm2 2v4m-2-2h4m6-1h.01M17 14h.01',
  store: 'M4 9 5 4h14l1 5M4 9v11h16V9M4 9h16M9 20v-6h6v6',
  paw: 'M12 13c-3 0-5 3-5 5 0 1.5 1.5 2 2.5 2 1 0 1.5-.5 2.5-.5s1.5.5 2.5.5c1 0 2.5-.5 2.5-2 0-2-2-5-5-5ZM5 10.5a1.5 2 0 1 0 3 0 1.5 2 0 1 0-3 0M16 10.5a1.5 2 0 1 0 3 0 1.5 2 0 1 0-3 0M8 6.5a1.5 2 0 1 0 3 0 1.5 2 0 1 0-3 0M13 6.5a1.5 2 0 1 0 3 0 1.5 2 0 1 0-3 0',
  wrench: 'M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17v3h3l5.2-5.2a4 4 0 0 0 5.3-5.3l-2.5 2.5-2.5-.5-.5-2.5 2.5-2.5Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4l3 2',
  list: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z',
}

export default function FeatureIcon({ name, size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d={PATHS[name] ?? PATHS.star}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
