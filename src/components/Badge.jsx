import './Badge.css'

// A small pill for a project's highlights, e.g. ❮ CAPSTONE ❯.
export default function Badge({ children }) {
  return <span className="badge">{children}</span>
}
