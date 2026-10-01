import { useCallback, useRef, useState } from 'react'
import { AssistantContext } from './lib/assistantContext.js'
import { useRevealOnScroll } from './hooks/useRevealOnScroll.js'
import { usePointerEffects } from './hooks/usePointerEffects.js'
import { useMotionFx } from './hooks/useMotionFx.js'
import { dividers } from './data/sections.js'
import Backdrop from './components/Backdrop.jsx'
import Intro from './components/Intro.jsx'
import CursorCompanion from './components/CursorCompanion.jsx'
import EasterEgg from './components/EasterEgg.jsx'
import SideIndex from './components/SideIndex.jsx'
import CommandPalette from './components/CommandPalette.jsx'
import Hero from './components/Hero.jsx'
import StackMarquee from './components/StackMarquee.jsx'
import Divider from './components/Divider.jsx'
import Experience from './components/Experience.jsx'
import About from './components/About.jsx'
import Education from './components/Education.jsx'
import TechStack from './components/TechStack.jsx'
import Projects from './components/Projects.jsx'
import GithubActivity from './components/GithubActivity.jsx'
import Certifications from './components/Certifications.jsx'
import Connect from './components/Connect.jsx'
import ContactDialog from './components/ContactDialog.jsx'
import Footer from './components/Footer.jsx'
import Chatbot from './components/Chatbot.jsx'
import './styles/layout.css'

export default function App() {
  const chatRef = useRef(null)
  const contactRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const askAssistant = useCallback((question) => chatRef.current?.ask(question), [])
  const openContact = useCallback(() => contactRef.current?.open(), [])

  useRevealOnScroll()
  usePointerEffects()
  useMotionFx()

  return (
    <AssistantContext.Provider value={askAssistant}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Intro />
      <Backdrop />
      <SideIndex onOpenMenu={() => setMenuOpen(true)} />

      <div className="page">
        <main id="main">
          <Hero onContact={openContact} />
          <StackMarquee />

          <div className="container page-body">
            {/* Experience | About on top, Education | Tech stack below */}
            <div className="bento">
              <Experience />
              <About />
              <Education />
              <TechStack />
            </div>

            <Divider label={dividers.beforeProjects} />
            <Projects />
            <GithubActivity />

            <Divider label={dividers.beforeContact} />
            <div className="duo">
              <Certifications />
              <Connect onContact={openContact} />
            </div>
          </div>
        </main>
        <Footer />
      </div>

      <Chatbot ref={chatRef} />
      <CommandPalette open={menuOpen} onOpenChange={setMenuOpen} />
      <ContactDialog ref={contactRef} />
      <EasterEgg onContact={openContact} />
      <CursorCompanion />
    </AssistantContext.Provider>
  )
}
