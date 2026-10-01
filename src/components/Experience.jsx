import { experience } from '../data/experience.js'
import Panel from './Panel.jsx'
import './Timeline.css'

const STATUS_TEXT = {
  seeking: 'Open position',
  current: 'In progress',
  done: 'Completed',
}

export default function Experience() {
  return (
    <Panel id="experience" title="Experience">
      <ol className="timeline">
        {experience.map((item, index) => (
          <li key={item.id} className={`timeline__item timeline__item--${item.status}`} style={{ '--i': index }}>
            <span className="timeline__node" aria-hidden="true" />
            <div className="timeline__body">
              <h3 className="timeline__title">{item.title}</h3>
              {item.org && <p className="timeline__org">{item.org}</p>}
              {item.projectId && (
                <a className="timeline__link" href={`#project-${item.projectId}`}>
                  See the project <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
            <p className={`timeline__period${item.status === 'seeking' ? ' timeline__period--chip' : ''}`}>
              <span className="visually-hidden">{STATUS_TEXT[item.status]}: </span>
              {item.period}
            </p>
          </li>
        ))}
      </ol>
    </Panel>
  )
}
