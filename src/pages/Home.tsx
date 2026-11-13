import { useEffect } from 'react'
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

  // Nav links are /#section — scroll to the section whenever the hash changes.
  useEffect(() => {
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
