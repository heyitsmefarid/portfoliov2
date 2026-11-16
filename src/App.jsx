import { useCallback, useRef, useState } from 'react'
import { AssistantContext } from './lib/assistantContext.js'
import { usePathname, useRoute } from './lib/router.js'
import Intro from './components/Intro.jsx'
import Binding from './components/Binding.jsx'
import CursorCompanion from './components/CursorCompanion.jsx'
import EasterEgg from './components/EasterEgg.jsx'
import CommandPalette from './components/CommandPalette.jsx'
import ContactDialog from './components/ContactDialog.jsx'
import Footer from './components/Footer.jsx'
import Chatbot from './components/Chatbot.jsx'
import HomePage from './pages/HomePage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import ProjectPage from './pages/ProjectPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import './styles/layout.css'

export default function App() {
  const chatRef = useRef(null)
  const contactRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const askAssistant = useCallback((question) => chatRef.current?.ask(question), [])
  const openContact = useCallback(() => contactRef.current?.open(), [])

  const route = useRoute()
  const pathname = usePathname()

  return (
    <AssistantContext.Provider value={askAssistant}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Intro />
      <Binding onOpenMenu={() => setMenuOpen(true)} />

      <div className="page">
        <main id="main" key={pathname}>
          {route.name === 'home' && <HomePage onContact={openContact} />}
          {route.name === 'projects' && <ProjectsPage />}
          {route.name === 'project' && <ProjectPage id={route.id} />}
          {route.name === 'notFound' && <NotFoundPage />}
        </main>
      </div>
      <Footer />

      <Chatbot ref={chatRef} />
      <CommandPalette open={menuOpen} onOpenChange={setMenuOpen} />
      <ContactDialog ref={contactRef} />
      <EasterEgg onContact={openContact} />
      <CursorCompanion />
    </AssistantContext.Provider>
  )
}
