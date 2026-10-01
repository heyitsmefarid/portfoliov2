import { education } from '../data/education.js'
import Panel from './Panel.jsx'
import './Timeline.css'

export default function Education() {
  return (
    <Panel id="education" title="Education">
      <ol className="timeline timeline--spread">
        {education.map((item, index) => (
          <li
            key={item.id}
            className={`timeline__item timeline__item--${item.current ? 'current' : 'done'}`}
            style={{ '--i': index }}
          >
            <span className="timeline__node" aria-hidden="true" />
            <div className="timeline__body">
              <h3 className="timeline__title">
                {item.program} —{' '}
                {item.detailTitle ? <abbr title={item.detailTitle}>{item.detail}</abbr> : item.detail}
              </h3>
              <p className="timeline__org">{item.school}</p>
            </div>
            <p className="timeline__period">{item.years || (item.current ? 'Current' : '')}</p>
          </li>
        ))}
      </ol>
    </Panel>
  )
}
