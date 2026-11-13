import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

ScrollTrigger.clearScrollMemory('manual')

import CustomCursor from './components/CustomCursor'
import Footer from './components/Footer'
import Nav from './components/Nav'
import { track } from './lib/analytics'
import { useTheme } from './lib/theme'
import CaseStudy from './pages/CaseStudy'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

export default function App() {
  const location = useLocation()
  const { theme, toggle } = useTheme()

  useEffect(() => {
    track('pageview', { path: location.pathname })
  }, [location.pathname])

  return (
    <>
      <a
        href="#main"
        className="fixed top-3 left-3 z-[90] -translate-y-20 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-bg focus:translate-y-0"
      >
        Skip to content
      </a>
      <CustomCursor />
      {/* Liquid background ambient lights for frosted glass refraction */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[10%] left-[5%] h-[500px] w-[500px] rounded-full bg-accent/10 blur-[130px]" />
        <div className="absolute top-[35%] -right-[10%] h-[550px] w-[550px] rounded-full bg-accent/8 blur-[140px]" />
        <div className="absolute top-[70%] left-[8%] h-[500px] w-[500px] rounded-full bg-accent/10 blur-[130px]" />
      </div>
      <Nav theme={theme} onToggleTheme={toggle} />
      {/* Route transition: opacity only, so pinned ScrollTrigger sections are not affected by a transformed parent */}
      <AnimatePresence
        mode="wait"
        onExitComplete={() => {
          if (!window.location.hash) window.scrollTo(0, 0)
          ScrollTrigger.refresh()
        }}
      >
        <motion.main
          id="main"
          tabIndex={-1}
          key={location.pathname}
          className="outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/work/:slug" element={<CaseStudy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  )
}
