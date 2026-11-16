import { useCallback, useRef, useState } from 'react'
import { usePathname, useRoute } from './lib/router.js'
import Intro from './components/Intro.jsx'
import Binding from './components/Binding.jsx'
import CursorCompanion from './components/CursorCompanion.jsx'
import EasterEgg from './components/EasterEgg.jsx'
import CommandPalette from './components/CommandPalette.jsx'
import ContactDialog from './components/ContactDialog.jsx'
import Footer from './components/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import ProjectPage from './pages/ProjectPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import './styles/layout.css'

export default function App() {
  const contactRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const openContact = useCallback(() => contactRef.current?.open(), [])

  const route = useRoute()
  const pathname = usePathname()

  return (
    <>
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

      <CommandPalette open={menuOpen} onOpenChange={setMenuOpen} />
      <ContactDialog ref={contactRef} />
      <EasterEgg onContact={openContact} />
      <CursorCompanion />
    </>
  )
}
