import { dividers } from '../data/sections.js'
import { usePageTitle } from '../lib/pageTitle.js'
import Hero from '../components/Hero.jsx'
import StackMarquee from '../components/StackMarquee.jsx'
import PortfolioReel from '../components/PortfolioReel.jsx'
import Divider from '../components/Divider.jsx'
import Experience from '../components/Experience.jsx'
import About from '../components/About.jsx'
import Education from '../components/Education.jsx'
import TechStack from '../components/TechStack.jsx'
import Projects from '../components/Projects.jsx'
import GithubActivity from '../components/GithubActivity.jsx'
import Certifications from '../components/Certifications.jsx'
import Connect from '../components/Connect.jsx'

export default function HomePage({ onContact }) {
  usePageTitle()

  return (
    <>
      <Hero onContact={onContact} />
      <StackMarquee />

      <div className="container page-body">
        {/* Independent columns keep shorter panels from inheriting a neighboring panel's height. */}
        <div className="bento">
          <div className="bento__column bento__column--primary">
            <PortfolioReel />
            <Experience />
            <Education />
          </div>
          <div className="bento__column bento__column--secondary">
            <About />
            <TechStack />
          </div>
        </div>

        <Divider label={dividers.beforeProjects} />
        <Projects />
        <GithubActivity />

        <Divider label={dividers.beforeContact} />
        <div className="duo">
          <Certifications />
          <Connect onContact={onContact} />
        </div>
      </div>
    </>
  )
}
