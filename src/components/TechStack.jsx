import { skillGroups } from '../data/skills.js'
import { brandColor, icons } from '../lib/icons.js'
import Panel from './Panel.jsx'
import TechIcon from './TechIcon.jsx'
import './TechStack.css'

export default function TechStack() {
  let chipIndex = 0
  return (
    <Panel id="stack" title="Tech stack">
      <div className="stacks">
        {skillGroups.map((group) => (
          <div key={group.id} className={`stack stack--${group.tier}`}>
            <h3 className="stack__title">{group.title}</h3>
            <ul className="stack__list">
              {group.items.map((item) => (
                <li
                  key={item.name}
                  className="chip stack__chip stagger"
                  style={{ '--brand': brandColor(icons[item.icon]) ?? 'var(--text)', '--i': chipIndex++ }}
                >
                  {group.tier === 'primary' && <TechIcon icon={item.icon} name={item.name} size={15} />}
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  )
}
