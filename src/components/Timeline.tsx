import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { experience } from '../data/content'
import { prefersReducedMotion } from '../lib/env'
import { useReveal } from '../lib/useReveal'
import { SectionHeading } from './ui'

gsap.registerPlugin(ScrollTrigger)

export default function Timeline() {
  const ref = useReveal<HTMLElement>()
  const list = useRef<HTMLOListElement>(null)
  const line = useRef<HTMLDivElement>(null)

  // The accent line draws itself as the list scrolls through the viewport.
  useEffect(() => {
    if (prefersReducedMotion() || !line.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        line.current,
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: list.current, start: 'top 75%', end: 'bottom 60%', scrub: 0.5 } },
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="experience" className="section">
      <div className="container-x">
        <SectionHeading eyebrow="04 — Experience" title="What I’m building now." placeholder={experience.some((e) => e.placeholder)} />
        <ol ref={list} className="relative max-w-3xl pl-10 md:pl-14">
          <div className="absolute top-2 bottom-2 left-[7px] w-px bg-line" aria-hidden="true">
            <div ref={line} className="h-full w-full origin-top bg-accent" />
          </div>
          {experience.map((e, i) => (
            <li key={i} data-reveal className="relative pb-12 last:pb-0">
              <span className="absolute top-1.5 -left-10 size-[15px] rounded-full border-2 border-accent bg-bg md:-left-14" aria-hidden="true" />
              <p className="font-sans font-semibold text-xs tracking-[0.2em] text-muted uppercase">{e.period}</p>
              <h3 className="mt-2 text-2xl font-semibold">{e.role}</h3>
              <p className="mt-1 text-accent">{e.org}</p>
              <p className="mt-3 text-muted">{e.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
