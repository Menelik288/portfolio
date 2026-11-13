import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'
import { Code2, Layers, User, Users } from 'lucide-react'
import { about, site } from '../data/content'
import { useReveal } from '../lib/useReveal'
import { SectionHeading } from './ui'

const statIcons = {
  users: Users,
  layers: Layers,
  code: Code2,
}

function Stat({
  value,
  suffix,
  label,
  detail,
  category,
  icon,
}: {
  value: number
  suffix: string
  label: string
  detail?: string
  category?: string
  icon?: 'users' | 'layers' | 'code'
}) {
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

  const Icon = icon ? statIcons[icon] : null

  return (
    <div
      ref={ref}
      data-reveal
      className="card group flex flex-col justify-between p-6 transition-all duration-300 hover:border-accent/50 hover:-translate-y-1"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          {category && (
            <span className="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-accent">
              {category}
            </span>
          )}
          {Icon && (
            <span className="grid size-8 place-items-center rounded-lg border border-line/60 bg-surface-2/40 text-accent transition-colors group-hover:border-accent/40 group-hover:bg-accent/10">
              <Icon size={16} />
            </span>
          )}
        </div>
        <p className="mt-4 font-sans text-3xl font-extrabold tracking-tight text-ink tabular-nums md:text-4xl">
          {n}
          <span className="text-accent">{suffix}</span>
        </p>
        <h4 className="mt-2 text-sm font-semibold text-ink">
          {label}
        </h4>
      </div>
      {detail && <p className="mt-3 text-xs leading-relaxed text-muted">{detail}</p>}
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
