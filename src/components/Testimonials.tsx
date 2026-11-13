import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { testimonials } from '../data/content'
import { useReveal } from '../lib/useReveal'
import { SectionHeading } from './ui'

export default function Testimonials() {
  const ref = useReveal<HTMLElement>()
  const [i, setI] = useState(0)
  const n = testimonials.length
  if (!n) return null
  const t = testimonials[i]
  const go = (d: number) => setI((v) => (v + d + n) % n)

  return (
    <section ref={ref} id="testimonials" className="section section-alt">
      <div className="container-x">
        <SectionHeading eyebrow="Testimonials" title="What people say." placeholder={testimonials.some((x) => x.placeholder)} />
        <div data-reveal className="card relative p-8 md:p-14" role="region" aria-roledescription="carousel" aria-label="Testimonials">
          <Quote size={40} className="text-accent/40" aria-hidden="true" />
          <div className="mt-6 min-h-[220px] md:min-h-[190px]" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={i}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <blockquote className="max-w-3xl font-display text-[clamp(1.25rem,1rem+1vw,1.875rem)] leading-snug">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  {t.logo ? (
                    <img src={t.logo} alt={`${t.company} logo`} className="h-10 w-auto" />
                  ) : (
                    <span className="grid size-11 place-items-center rounded-full bg-surface-2 font-sans font-semibold text-[9px] text-muted" aria-hidden="true">
                      LOGO
                    </span>
                  )}
                  <span>
                    <span className="block font-semibold">{t.name}</span>
                    <span className="block text-sm text-muted">
                      {t.role}, {t.company}
                    </span>
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
          <div className="mt-8 flex items-center justify-between">
            <div className="flex gap-2">
              {testimonials.map((_, d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setI(d)}
                  aria-label={`Show testimonial ${d + 1}`}
                  aria-current={d === i}
                  className="grid size-8 place-items-center"
                >
                  <span className={`h-1.5 rounded-full transition-all ${d === i ? 'w-6 bg-accent' : 'w-1.5 bg-line'}`} />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {[
                { d: -1, Icon: ChevronLeft, label: 'Previous testimonial' },
                { d: 1, Icon: ChevronRight, label: 'Next testimonial' },
              ].map(({ d, Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(d)}
                  aria-label={label}
                  className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
