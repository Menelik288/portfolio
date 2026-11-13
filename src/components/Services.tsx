import { Box, LayoutDashboard, Server, Sparkles } from 'lucide-react'
import { services, type ServiceIcon } from '../data/content'
import { useReveal } from '../lib/useReveal'
import { SectionHeading, TiltCard } from './ui'

const icons: Record<ServiceIcon, typeof Box> = { layout: LayoutDashboard, server: Server, box: Box, sparkles: Sparkles }

export default function Services() {
  const ref = useReveal<HTMLElement>()
  return (
    <section ref={ref} id="services" className="section section-alt">
      <div className="container-x">
        <SectionHeading
          eyebrow="02 — Services"
          title="What I can do for you."
          intro="One developer who can take a product from idea to production, or slot into your team wherever the gap is."
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => {
            const Icon = icons[s.icon]
            return (
              <li key={s.title} data-reveal>
                <TiltCard className="card group h-full p-7 transition-colors hover:border-accent/60">
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-xl bg-surface-2 text-accent">
                      <Icon size={22} />
                    </span>
                    <span className="font-sans font-semibold text-xs text-muted">0{i + 1}</span>
                  </div>
                  <h3 className="mt-8 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-3 text-sm text-muted">{s.text}</p>
                </TiltCard>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
