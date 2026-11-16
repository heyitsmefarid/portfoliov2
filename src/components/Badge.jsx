// A project's highlight. The data keeps badges in capitals (see projects.js);
// on the form they read as plain sentence case.
const PROPER = { ai: 'AI', typescript: 'TypeScript', ojt: 'OJT', lgu: 'LGU' }

function sentenceCase(text) {
  const lower = text.toLowerCase()
  return (lower.charAt(0).toUpperCase() + lower.slice(1)).replace(/\b[a-z]+\b/gi, (word) => PROPER[word.toLowerCase()] ?? word)
}

export default function Badge({ children }) {
  return <span className="badge">{sentenceCase(String(children))}</span>
}
