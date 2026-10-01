import './Divider.css'

// A thin amber line with a small centred label, separating parts of the page.
export default function Divider({ label }) {
  return (
    <div className="divider" role="presentation">
      <span className="divider__label">{label}</span>
    </div>
  )
}
