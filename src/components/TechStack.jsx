import { skillGroups } from '../data/skills.js'
import Panel from './Panel.jsx'
import TechIcon from './TechIcon.jsx'

export default function TechStack() {
  return (
    <Panel id="stack" title="Tech stack" flush>
      <dl className="stack">
        {skillGroups.map((group) => (
          <div key={group.id} className={`stack__group stack__group--${group.tier}`}>
            <dt className="blank__label">{group.title}</dt>
            <dd>
              <ul className="stack__list">
                {group.items.map((item) => (
                  <li key={item.name} className="stack__item">
                    {group.tier === 'primary' && <TechIcon icon={item.icon} name={item.name} size={15} />}
                    <span className="stack__name">{item.name}</span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}
