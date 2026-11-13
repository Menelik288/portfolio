import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import About from '../components/About'
import Contact from '../components/Contact'
import Hero from '../components/Hero'
import Projects from '../components/Projects'
import Services from '../components/Services'
import TechStack from '../components/TechStack'
import Testimonials from '../components/Testimonials'
import Timeline from '../components/Timeline'
import { prefersReducedMotion } from '../lib/env'
import { useSeo } from '../lib/useSeo'

export default function Home() {
  useSeo()
  const { hash, key } = useLocation()
  const isFirstMount = useRef(true)

  // On page refresh or first load, always guarantee scroll starts at the hero section (top).
  // Only scroll to section when the user actively navigates via nav links during their session.
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual'
      }
      window.scrollTo(0, 0)
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname)
      }
      return
    }

    if (!hash) return
    const t = setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    }, 60)
    return () => clearTimeout(t)
  }, [hash, key])

  return (
    <>
      <Hero />
      <About />
      <Services />
      <Projects />
      <Timeline />
      <Testimonials />
      <TechStack />
      <Contact />
    </>
  )
}
