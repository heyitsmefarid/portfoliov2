import { profile } from '../data/profile.js'
import Panel from './Panel.jsx'
import './About.css'

export default function About() {
  return (
    <Panel id="about" title="About" className="about">
      <div className="about__text">
        {profile.about.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <dl className="about__facts">
        {profile.facts.map((fact) => (
          <div key={fact.title} className="about__fact">
            <dt>{fact.title}</dt>
            <dd>{fact.detail}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}
