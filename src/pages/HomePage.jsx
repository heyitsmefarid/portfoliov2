import { usePageTitle } from '../lib/pageTitle.js'
import Hero from '../components/Hero.jsx'
import StackMarquee from '../components/StackMarquee.jsx'
import Projects from '../components/Projects.jsx'
import About from '../components/About.jsx'
import Experience from '../components/Experience.jsx'
import Education from '../components/Education.jsx'
import TechStack from '../components/TechStack.jsx'
import GithubActivity from '../components/GithubActivity.jsx'
import Certifications from '../components/Certifications.jsx'
import Connect from '../components/Connect.jsx'

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
      <GithubActivity />
      {/* The form ends on the one place to reach Fred */}
      <Connect onContact={onContact} />
    </div>
  )
}
