import { experience } from '../data/experience.js'
import Link from './Link.jsx'
import Panel from './Panel.jsx'

const STATUS_TEXT = {
  seeking: 'Looking for',
  current: 'In progress',
  done: 'Completed',
}

export default function Experience() {
  return (
    <Panel id="experience" title="Experience" flush>
      <ol className="record">
        {experience.map((item) => (
          <li key={item.id} className={`record__item record__item--${item.status}`}>
            <p className="record__when">
              <span className="visually-hidden">{STATUS_TEXT[item.status]}: </span>
              {item.period}
            </p>
            <h3 className="record__title">{item.title}</h3>
            {item.org && <p className="record__org">{item.org}</p>}
            {item.description && <p className="record__desc">{item.description}</p>}
            {item.projectId && (
              <Link className="link" href={`/projects/${item.projectId}`}>
                See the project
              </Link>
            )}
          </li>
        ))}
      </ol>
    </Panel>
  )
}
