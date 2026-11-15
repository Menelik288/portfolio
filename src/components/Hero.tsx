import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ArrowRight } from 'lucide-react'
import { site } from '../data/content'
import { hasWebGL, isCoarsePointer, prefersReducedMotion } from '../lib/env'
import { useThemeName } from '../lib/theme'

// The whole three.js bundle is split out and only fetched after first paint.
const HeroScene = lazy(() => import('../three/HeroScene'))

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const [ready, setReady] = useState(false)
  const theme = useThemeName()
  const webgl = useMemo(hasWebGL, [])
  const reduced = useMemo(prefersReducedMotion, [])
  const lowPower = useMemo(() => isCoarsePointer() || (navigator.hardwareConcurrency ?? 8) <= 4, [])

  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.from('[data-hero]', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, delay: 0.15 })
    }, root)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section ref={root} id="top" className="relative flex min-h-svh items-end overflow-hidden bg-bg md:items-center">
      {/* Static poster: shown while the 3D scene loads, and permanently if WebGL is unavailable */}
      <img
        src="/hero-poster.svg"
        alt={webgl ? '' : 'Illustration of an astronaut drifting among orbiting planets'}
        className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}
      />
      {webgl && (
        <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}>
          <Suspense fallback={null}>
            <HeroScene theme={theme} reducedMotion={reduced} lowPower={lowPower} onReady={() => setReady(true)} />
          </Suspense>
        </div>
      )}
      {/* Readability gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,var(--color-bg)_36%,transparent_64%)] md:bg-[linear-gradient(to_right,color-mix(in_srgb,var(--color-bg)_70%,transparent)_0%,transparent_50%),linear-gradient(to_top,var(--color-bg)_0%,transparent_14%)]" />

      <div className="container-x pointer-events-none relative z-10 pt-28 pb-28 md:pb-24">
        <div className="max-w-[640px] [&_a]:pointer-events-auto">
          <h1 data-hero className="name-display text-[clamp(2.6rem,1.5rem+5.2vw,5.5rem)]">
            {site.name.split(' ')[0]}
            <br />
            {site.name.split(' ').slice(1).join(' ')}
          </h1>
          <p data-hero className="mt-6 flex items-center gap-4 font-display text-[clamp(1.25rem,1.05rem+1vw,1.875rem)] font-bold text-accent italic">
            <span className="hidden h-px w-12 bg-accent sm:block" aria-hidden="true" />
            {site.role}
          </p>
          <p data-hero className="mt-4 max-w-md text-lg text-ink/80">
            {site.tagline}
          </p>
          <div data-hero className="mt-9 flex flex-wrap gap-4">
            <Link to="/#work" className="btn btn-primary">
              View work <ArrowRight size={16} />
            </Link>
            <Link to="/#contact" className="btn btn-ghost border-ink/40 bg-bg/40 backdrop-blur-sm">
              Contact
            </Link>
          </div>
        </div>
      </div>



      <Link
        to="/#about"
        aria-label="Scroll to About"
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-muted hover:text-ink"
      >
        <span className="font-sans text-[10px] font-semibold tracking-[0.3em] uppercase">Scroll</span>
        <span className="flex h-9 w-5 justify-center rounded-full border border-current pt-1.5">
          <span className="size-1 rounded-full bg-accent [animation:scroll-dot_1.8s_var(--ease-out-3)_infinite]" />
        </span>
      </Link>
    </section>
  )
}
