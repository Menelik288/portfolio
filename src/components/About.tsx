import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'
import { User } from 'lucide-react'
import { about, site } from '../data/content'
import { useReveal } from '../lib/useReveal'
import { SectionHeading } from './ui'

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    if (reduce) return setN(value)
    const c = animate(0, value, { duration: 1.4, ease: 'easeOut', onUpdate: (v) => setN(Math.round(v)) })
    return () => c.stop()
  }, [inView, value, reduce])
  return (
    <div ref={ref} data-reveal className="card p-6">
      <p className="font-name text-4xl text-ink tabular-nums">
        {n}
        <span className="text-accent">{suffix}</span>
      </p>
      <p className="mt-2 text-sm text-muted">{label}</p>
    </div>
  )
}

export default function About() {
  const ref = useReveal<HTMLElement>()
  return (
    <section ref={ref} id="about" className="section">
      <div className="container-x">
        <SectionHeading eyebrow="01 — About" title="Building across the whole stack." placeholder={!about.photo} />
        <div className="grid gap-12 lg:grid-cols-[380px_1fr] lg:gap-16">
          <div data-reveal className="card relative aspect-[4/5] max-w-[380px] overflow-hidden">
            {about.photo ? (
              <img src={about.photo} alt={`Portrait of ${site.name}`} loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <div role="img" aria-label={`${site.name} monogram`} className="flex h-full flex-col items-center justify-center gap-4 bg-surface-2 text-muted">
                {site.showPlaceholderTags ? (
                  <>
                    <User size={64} strokeWidth={1} />
                    <span className="font-sans text-[10px] font-semibold tracking-[0.3em] uppercase">Headshot placeholder</span>
                  </>
                ) : (
                  <span className="name-display text-8xl text-ink">{site.initials}</span>
                )}
              </div>
            )}
            <span className="absolute top-4 left-4 size-3 border-t border-l border-accent" />
            <span className="absolute right-4 bottom-4 size-3 border-r border-b border-accent" />
          </div>
          <div>
            {about.bio.map((p) => (
              <p key={p} data-reveal className="mb-5 max-w-2xl text-lg text-muted first:text-ink">
                {p}
              </p>
            ))}
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {about.stats.map((s) => (
                <Stat key={s.label} {...s} />
              ))}
            </div>
            <div data-reveal className="mt-10">
              <h3 className="eyebrow">Currently exploring</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {about.exploring.map((x) => (
                  <li key={x} className="chip transition-colors hover:border-accent hover:text-ink">
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
