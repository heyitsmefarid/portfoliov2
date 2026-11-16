import { profile } from '../data/profile.js'
import Panel from './Panel.jsx'

export default function About() {
  return (
    <Panel id="about" title="About me">
      <div className="about__text">
        {profile.about.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <dl className="about__facts">
        {profile.facts.map((fact) => (
          <div key={fact.title} className="blank">
            <dt className="blank__value">{fact.title}</dt>
            <dd className="blank__label">{fact.detail}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}
