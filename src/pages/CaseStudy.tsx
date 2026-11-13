import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { PlaceholderTag, Thumb } from '../components/ui'
import { projects } from '../data/content'
import { useReveal } from '../lib/useReveal'
import { useSeo } from '../lib/useSeo'
import NotFound from './NotFound'

export default function CaseStudy() {
  const { slug } = useParams()
  const i = projects.findIndex((p) => p.slug === slug)
  const p = projects[i]
  const ref = useReveal<HTMLElement>()
  useSeo(p?.title, p?.summary)
  if (!p) return <NotFound />
  const prev = projects[(i - 1 + projects.length) % projects.length]
  const next = projects[(i + 1) % projects.length]
  const sections = [
    ['Challenge', p.caseStudy.challenge],
    ['Process', p.caseStudy.process],
    ['Outcome', p.caseStudy.outcome],
  ]

  return (
    <article ref={ref} className="pt-[72px]">
      <header className="container-x py-14 md:py-20">
        <Link to="/#work" className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent">
          <ArrowLeft size={14} /> All projects
        </Link>
        <p className="eyebrow mt-10 flex items-center gap-3">
          Case study <PlaceholderTag show={!!p.placeholder} />
        </p>
        <h1 className="mt-4 text-[clamp(2.5rem,1.6rem+4.5vw,5rem)] font-bold">{p.title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">{p.summary}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {p.tags.map((t, j) => (
            <li key={j} className="chip">
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-4">
          {p.liveUrl && (
            <a href={p.liveUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
              Visit live site <ArrowUpRight size={16} />
            </a>
          )}
          {p.repoUrl && (
            <a href={p.repoUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
              Source on GitHub <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      </header>
      <div className="container-x">
        <div data-reveal className="aspect-[16/8] overflow-hidden rounded-2xl border border-line">
          <Thumb src={p.thumbnail} hue={p.hue} label={`${p.title} hero image`} />
        </div>
      </div>
      {p.gallery.length > 1 && (
        <div className="container-x mt-5 grid gap-5 sm:grid-cols-2">
          {p.gallery.slice(1).map((g) => (
            <div key={g} data-reveal className="aspect-[16/9] overflow-hidden rounded-2xl border border-line">
              <Thumb src={g} hue={p.hue} label={`${p.title} screenshot`} />
            </div>
          ))}
        </div>
      )}
      <div className="container-x section grid gap-12 lg:grid-cols-[240px_1fr]">
        <aside data-reveal>
          <h2 className="eyebrow">Stack</h2>
          <ul className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:items-start">
            {p.stack.map((s, j) => (
              <li key={j} className="chip">
                {s}
              </li>
            ))}
          </ul>
        </aside>
        <div className="max-w-2xl space-y-14">
          {sections.map(([title, text], n) => (
            <section key={title} data-reveal>
              <p className="font-sans font-semibold text-xs text-muted">0{n + 1}</p>
              <h2 className="mt-2 text-3xl font-semibold">{title}</h2>
              <p className="mt-4 text-muted">{text}</p>
            </section>
          ))}
        </div>
      </div>
      <nav aria-label="More projects" className="border-t border-line">
        <div className="container-x grid sm:grid-cols-2">
          <Link to={`/work/${prev.slug}`} className="group py-10 sm:border-r sm:border-line sm:pr-8">
            <span className="flex items-center gap-2 text-sm text-muted">
              <ArrowLeft size={14} /> Previous
            </span>
            <span className="mt-2 block font-display text-2xl font-semibold group-hover:text-accent">{prev.title}</span>
          </Link>
          <Link to={`/work/${next.slug}`} className="group py-10 sm:pl-8 sm:text-right">
            <span className="flex items-center gap-2 text-sm text-muted sm:justify-end">
              Next <ArrowRight size={14} />
            </span>
            <span className="mt-2 block font-display text-2xl font-semibold group-hover:text-accent">{next.title}</span>
          </Link>
        </div>
      </nav>
    </article>
  )
}
