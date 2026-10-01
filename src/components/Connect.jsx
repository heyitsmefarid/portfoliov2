import { profile } from '../data/profile.js'
import { useAskAssistant } from '../lib/assistantContext.js'
import Panel from './Panel.jsx'
import './Connect.css'

const ICONS = {
  github: 'M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 2.9.8.1-.6.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z',
  linkedin: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3zM9.5 9.75h3.8v1.5h.1c.5-1 1.8-1.8 3.7-1.8 4 0 4.9 2.6 4.9 6v6.1h-4v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.5h-4z',
  facebook: 'M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.3A22 22 0 0 0 14.6 2C12.2 2 10.5 3.5 10.5 6.2v2.3H8v3.3h2.5V22h3.5V11.8h2.7l.4-3.3z',
  mail: 'M3.5 5.5h17v13h-17zM3.5 6l8.5 7 8.5-7',
  message: 'M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5z',
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z',
}

function Icon({ name, filled = false }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d={ICONS[name]}
        fill={filled ? 'currentColor' : 'none'}
        stroke={filled ? 'none' : 'currentColor'}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Tile({ icon, filled, label, detail, href, onClick, external }) {
  const content = (
    <>
      <span className="tile__icon">
        <Icon name={icon} filled={filled} />
      </span>
      <span className="tile__text">
        <span className="tile__label">{label}</span>
        {detail && <span className="tile__detail">{detail}</span>}
      </span>
      <span className="tile__arrow" aria-hidden="true">
        ↗
      </span>
    </>
  )

  if (href) {
    return (
      <a className="tile" href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {content}
        {external && <span className="visually-hidden"> (opens in a new tab)</span>}
      </a>
    )
  }
  return (
    <button type="button" className="tile" onClick={onClick}>
      {content}
    </button>
  )
}

const strip = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

export default function Connect({ onContact }) {
  const ask = useAskAssistant()
  const { contact } = profile

  return (
    <Panel id="contact" title="Let's build something" className="connect">
      <p className="connect__lead">Have a project, opportunity, or just want to talk?</p>

      <div className="connect__columns">
        <div>
          <h3 className="connect__heading">Find me on</h3>
          <ul className="connect__list">
            <li className="stagger" style={{ '--i': 0 }}>
              <Tile icon="github" filled label="GitHub" detail={`@${contact.githubUsername}`} href={contact.github} external />
            </li>
            {contact.linkedin && (
              <li className="stagger" style={{ '--i': 1 }}>
                <Tile icon="linkedin" filled label="LinkedIn" detail={strip(contact.linkedin)} href={contact.linkedin} external />
              </li>
            )}
            {contact.facebook && (
              <li className="stagger" style={{ '--i': 2 }}>
                <Tile icon="facebook" filled label="Facebook" detail={strip(contact.facebook)} href={contact.facebook} external />
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="connect__heading">Get in touch</h3>
          <ul className="connect__list">
            {contact.email && (
              <li className="stagger" style={{ '--i': 3 }}>
                <Tile icon="mail" label="Email" detail={contact.email} href={`mailto:${contact.email}`} />
              </li>
            )}
            <li className="stagger" style={{ '--i': 4 }}>
              <Tile icon="message" label="Send a message" detail="Opens a short form" onClick={onContact} />
            </li>
            <li className="stagger" style={{ '--i': 5 }}>
              <Tile icon="spark" label="Ask my assistant" detail="Questions about my work" onClick={() => ask()} />
            </li>
          </ul>
        </div>
      </div>
    </Panel>
  )
}
