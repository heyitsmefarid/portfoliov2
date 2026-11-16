import { profile } from '../data/profile.js'
import { usePageTitle } from '../lib/pageTitle.js'
import Hero from '../components/Hero.jsx'
import StackMarquee from '../components/StackMarquee.jsx'
import Projects from '../components/Projects.jsx'
import About from '../components/About.jsx'
import Experience from '../components/Experience.jsx'
import Education from '../components/Education.jsx'
import TechStack from '../components/TechStack.jsx'
import GithubActivity from '../components/GithubActivity.jsx'
import PortfolioReel from '../components/PortfolioReel.jsx'
import Certifications from '../components/Certifications.jsx'
import Connect from '../components/Connect.jsx'
import SignPad from '../components/SignPad.jsx'

const printed = new Intl.DateTimeFormat('en-PH', { dateStyle: 'long' }).format(new Date())

// The whole portfolio on one form. Each component is a cell; styles/layout.css
// places the cells on the 12-column grid.
export default function HomePage({ onContact }) {
  usePageTitle()

  return (
    <div className="form form--home">
      <Hero onContact={onContact} />
      <StackMarquee />
      <Projects />
      <About />
      <TechStack />
      <Experience />
      <Education />
      <Certifications />
      <Connect onContact={onContact} />
      <GithubActivity />
      <PortfolioReel />
      <div className="cell cell--sign sign">
        <p className="blank">
          <span className="blank__value sign__name">{profile.name}</span>
          <span className="blank__label">Signature over printed name</span>
        </p>
        <SignPad />
        <p className="blank">
          <span className="blank__value">{printed}</span>
          <span className="blank__label">Date printed</span>
        </p>
      </div>
    </div>
  )
}
