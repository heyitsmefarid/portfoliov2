import { education } from '../data/education.js'
import Panel from './Panel.jsx'

export default function Education() {
  return (
    <Panel id="education" title="Education" flush>
      <ol className="record">
        {education.map((item) => (
          <li key={item.id} className={`record__item record__item--${item.current ? 'current' : 'done'}`}>
            {(item.years || item.current) && <p className="record__when">{item.years || 'Current'}</p>}
            <h3 className="record__title">
              {item.program}, {item.detailTitle ? <abbr title={item.detailTitle}>{item.detail}</abbr> : item.detail}
            </h3>
            <p className="record__org">{item.school}</p>
          </li>
        ))}
      </ol>
    </Panel>
  )
}
