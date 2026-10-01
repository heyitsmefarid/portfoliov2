// Brand icons used by the tech stack. Named imports keep the bundle small —
// only these icons are included. Keys match the `icon` field in src/data/skills.js.
import {
  siAndroidstudio,
  siBootstrap,
  siCplusplus,
  siCss,
  siFigma,
  siFirebase,
  siFlutter,
  siGit,
  siGithub,
  siHtml5,
  siJavascript,
  siMysql,
  siNestjs,
  siNodedotjs,
  siOpenjdk,
  siPhp,
  siPostgresql,
  siPython,
  siReact,
  siSupabase,
  siTypescript,
} from 'simple-icons'

export const icons = {
  androidstudio: siAndroidstudio,
  bootstrap: siBootstrap,
  cplusplus: siCplusplus,
  css: siCss,
  figma: siFigma,
  firebase: siFirebase,
  flutter: siFlutter,
  git: siGit,
  github: siGithub,
  html: siHtml5,
  java: siOpenjdk,
  javascript: siJavascript,
  mysql: siMysql,
  nest: siNestjs,
  node: siNodedotjs,
  php: siPhp,
  postgresql: siPostgresql,
  python: siPython,
  react: siReact,
  supabase: siSupabase,
  typescript: siTypescript,
}

// Brand colour for hover states, lifted toward white when the brand colour is
// too dark to read on the near-black background.
export function brandColor(icon) {
  if (!icon?.hex) return null
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(icon.hex.slice(i, i + 2), 16) / 255)
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance < 0.18 ? null : `#${icon.hex}`
}
