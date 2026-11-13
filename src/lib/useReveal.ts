import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './env'

gsap.registerPlugin(ScrollTrigger)

export const EASE = 'power3.out'
export const DUR = 0.8

/**
 * Animates every [data-reveal] element inside the returned ref once, as it
 * scrolls into view. Elements entering together are staggered.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', root)
      if (!items.length) return
      gsap.set(items, { opacity: 0, y: 32 })
      ScrollTrigger.batch(items, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: DUR, ease: EASE, stagger: 0.09, overwrite: true }),
      })
    }, root)
    return () => ctx.revert()
  }, [])
  return ref
}

// Dev-only handle for debugging animations from the console.
if (import.meta.env.DEV) (window as unknown as { gsap: typeof gsap }).gsap = gsap
