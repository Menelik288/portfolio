import { Braces, Database, LayoutDashboard, Server, Wrench } from 'lucide-react'
import { techStack } from '../data/content'
import { useReveal } from '../lib/useReveal'
import { SectionHeading } from './ui'

const icons = [Braces, LayoutDashboard, Server, Database, Wrench]

export default function TechStack() {
  const ref = useReveal<HTMLElement>()
  return (
    <section ref={ref} id="stack" className="section section-alt">
      <div className="container-x">
        <SectionHeading
          eyebrow="05 — Tech stack"
          title="Tools I build with."
          intro="The languages, frameworks and platforms behind the projects above."
        />
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          {techStack.map((g, i) => {
            const Icon = icons[i % icons.length]
            return (
              <li key={g.group} data-reveal className={i < 2 ? 'lg:col-span-3' : 'lg:col-span-2'}>
                <article className="card h-full p-7 transition-colors hover:border-accent/60">
                  <div className="flex items-center gap-4">
                    <span className="grid size-12 place-items-center rounded-xl bg-surface-2 text-accent">
                      <Icon size={22} />
                    </span>
                    <h3 className="text-xl font-semibold">{g.group}</h3>
                    <span className="ml-auto font-display text-xs font-medium text-muted">{String(g.items.length).padStart(2, '0')}</span>
                  </div>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {g.items.map((t) => (
                      <li
                        key={t}
                        className="rounded-full border border-line bg-bg px-3.5 py-1.5 text-sm text-ink transition-colors hover:border-accent hover:text-accent"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
