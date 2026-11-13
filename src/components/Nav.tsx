import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { nav, site } from '../data/content'
import type { Theme } from '../lib/theme'

export default function Nav({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const overHero = pathname === '/' && !scrolled

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', esc)
    }
  }, [open])

  const themeBtn = (
    <button
      type="button"
      onClick={onToggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors hover:border-accent hover:text-accent"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
        overHero ? 'border-b border-transparent bg-transparent' : 'border-b border-line bg-bg/90 backdrop-blur-md'
      }`}
    >
      <div className="container-x flex h-[72px] items-center justify-between">
        <Link to="/" className="flex items-center gap-3 font-sans font-semibold text-ink" aria-label={`${site.name} — home`}>
          <span className="grid size-9 place-items-center rounded-lg bg-accent font-tech text-xs text-bg">
            {site.initials}
          </span>
          <span className="hidden sm:inline">{site.name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.hash}
              to={`/#${n.hash}`}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {themeBtn}
          <Link to="/#contact" className="btn btn-primary hidden !min-h-11 lg:inline-flex">
            Let’s talk
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border border-line text-ink lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>

      {/* Rendered outside <header>: its backdrop-filter would otherwise trap position:fixed children */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              className="fixed inset-0 top-[72px] z-40 bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.nav
              key="menu"
              id="mobile-menu"
              aria-label="Mobile"
              className="fixed top-[72px] right-0 bottom-0 z-40 flex w-[min(320px,85vw)] flex-col gap-1 border-l border-line bg-surface p-6 lg:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {nav.map((n, i) => (
                <motion.div
                  key={n.hash}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.04 }}
                >
                  <Link
                    to={`/#${n.hash}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-3 font-sans text-xl font-medium text-ink hover:text-accent"
                  >
                    {n.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
