import { profile } from '../data/profile.js'
import { education } from '../data/education.js'
import LocalTime from './LocalTime.jsx'
import Portrait from './Portrait.jsx'
import './Hero.css'

function Blank({ label, wide = false, children }) {
  return (
    <div className={`blank${wide ? ' blank--wide' : ''}`}>
      <dt className="blank__label">{label}</dt>
      <dd className="blank__value">{children}</dd>
    </div>
  )
}

// The top of the form: masthead with the control number, the ID photo box,
// the applicant's details typed into blanks, and the status box that gets
// the rubber stamp.
export default function Hero({ onContact }) {
  const { photo, availability, contact } = profile
  const school = education.find((item) => item.current) ?? education[0]

  return (
    <>
      <header id="top" className="cell cell--mast">
        <div className="mast">
          <p className="mast__title">Portfolio registration form</p>
          <p className="mast__sub">Full-stack web and mobile developer from Calapan City, Philippines.</p>
        </div>
      </header>

      {photo && (
        <div className="cell cell--photo">
          <Portrait photo={photo} />
        </div>
      )}

      <section className="cell cell--info" aria-labelledby="hero-title">
        <dl className="info">
          <div className="blank blank--name">
            <dt className="blank__label">Name</dt>
            <dd>
              <h1 id="hero-title" className="info__name" aria-label={profile.name}>
                {/* Typed in, one key at a time */}
                {[...profile.name].map((char, index) => (
                  <span key={index} aria-hidden="true" style={{ '--i': index }}>
                    {char}
                  </span>
                ))}
                <span className="info__caret" aria-hidden="true" style={{ '--i': profile.name.length }} />
              </h1>
            </dd>
          </div>
          <Blank label="Role">{profile.role}</Blank>
          <Blank label="Course">{profile.status}</Blank>
          {school && <Blank label="School">{school.school}</Blank>}
          <Blank label="Address">{profile.location}</Blank>
          {profile.timeZone && (
            <Blank label="Local time">
              <LocalTime timeZone={profile.timeZone} place={profile.location.split(',')[0]} />
            </Blank>
          )}
          <Blank label="GitHub">
            <a className="link" href={contact.github} target="_blank" rel="noopener noreferrer">
              @{contact.githubUsername}
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </Blank>
          {contact.email && (
            <Blank label="Email">
              <a className="link" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </Blank>
          )}
          <Blank label="Summary" wide>
            <span className="info__lede">{profile.lede}</span>
          </Blank>
        </dl>
      </section>

      <section className="cell cell--status" aria-labelledby="status-title">
        <div className="cell__title">
          <h2 id="status-title">Status</h2>
        </div>
        <div className="status">
          {availability.open && (
            <p className="stamp">
              <span className="stamp__small">Available for</span>
              <span className="stamp__big">Work</span>
              <span className="stamp__small">{availability.detail}</span>
            </p>
          )}
          {!availability.open && <p className="status__note">Not currently looking</p>}
          <div className="status__actions">
            <a className="btn btn--ink" href="#projects">
              See my projects
            </a>
            {profile.resumeUrl && (
              <a className="btn" href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                Résumé (PDF)
              </a>
            )}
            <button type="button" className="btn" onClick={onContact}>
              Send a message
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
