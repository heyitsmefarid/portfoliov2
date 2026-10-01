import { skillGroups } from '../data/skills.js'
import TechIcon from './TechIcon.jsx'
import './TechOrbit.css'

// Fred's main technologies circling the portrait on a tilted 3D ring. Icons
// behind the photo pass behind it; icons in front pass in front. Decorative —
// the same list is in the Tech stack panel.
const ITEMS = skillGroups
  .filter((group) => group.tier !== 'tertiary')
  .flatMap((group) => group.items)
  .filter((item) => item.icon && item.icon !== 'api')
  .slice(0, 10)

export default function TechOrbit() {
  return (
    <div className="orbit" aria-hidden="true">
      <div className="orbit__plane">
        <span className="orbit__ring" />
        {ITEMS.map((item, index) => (
          <span key={item.name} className="orbit__item" style={{ '--a': `${(index * 360) / ITEMS.length}deg` }}>
            <span className="orbit__chip" title={item.name}>
              <TechIcon icon={item.icon} name={item.name} size={15} />
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
