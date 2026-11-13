import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ArrowUpRight, X } from 'lucide-react'
import { projects, type Project } from '../data/content'
import { useReveal } from '../lib/useReveal'
import { PlaceholderTag, SectionHeading, Thumb } from './ui'

gsap.registerPlugin(ScrollTrigger)

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab' || !panel.current) return
      // Keep focus inside the dialog
      const f = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus())
      else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus())
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus()
    }
  }, [onClose])

  const gallery = project.gallery.length ? project.gallery : [null, null, null]

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/75 backdrop-blur-sm md:items-center md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        className="card relative max-h-[92svh] w-full max-w-4xl overflow-y-auto rounded-b-none md:rounded-2xl"
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 32, opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close project details"
          className="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full border border-line bg-bg/80 text-ink hover:border-accent hover:text-accent"
        >
          <X size={18} />
        </button>
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto p-3" tabIndex={0} aria-label="Project gallery">
          {gallery.map((g, i) => (
            <div key={i} className="aspect-video w-[85%] shrink-0 snap-center overflow-hidden rounded-xl md:w-[70%]">
              <Thumb src={g} hue={project.hue + i * 25} label={`${project.title} screenshot ${i + 1}`} />
            </div>
          ))}
        </div>
        <div className="p-6 md:p-10">
          <PlaceholderTag show={!!project.placeholder} />
          <h3 id="project-modal-title" className="mt-3 text-3xl font-semibold md:text-4xl">
            {project.title}
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.tags.map((t, i) => (
              <li key={i} className="chip">
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="eyebrow">Problem</h4>
              <p className="mt-3 text-muted">{project.problem}</p>
            </div>
            <div>
              <h4 className="eyebrow">Solution</h4>
              <p className="mt-3 text-muted">{project.solution}</p>
            </div>
            <div>
              <h4 className="eyebrow">Stack</h4>
              <ul className="mt-3 flex flex-wrap gap-2">
                {project.stack.map((s, i) => (
                  <li key={i} className="chip">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="eyebrow">Results</h4>
              <ul className="mt-3 space-y-2 text-muted">
                {project.results.map((r, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-accent" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to={`/work/${project.slug}`} className="btn btn-primary">
              Read case study <ArrowRight size={16} />
            </Link>
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
                Live site <ArrowUpRight size={16} />
              </a>
            )}
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
                Source <ArrowUpRight size={16} />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Projects() {
  const ref = useReveal<HTMLElement>()
  const pin = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLUListElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<Project | null>(null)

  // Desktop: pin the section and translate the track sideways as the page scrolls.
  // Mobile / reduced motion: the track is a native swipeable scroller instead.
  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const t = track.current!
      const distance = () => Math.max(0, t.scrollWidth - t.parentElement!.clientWidth)
      gsap.to(t, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => bar.current && gsap.set(bar.current, { scaleX: self.progress }),
        },
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={ref} id="work" className="overflow-hidden">
      <div ref={pin} className="flex min-h-svh flex-col justify-center py-20 lg:pt-[88px] lg:pb-6 [&_header]:lg:!mb-8">
        <div className="container-x">
          <SectionHeading
            eyebrow="03 — Featured work"
            title="Selected projects."
            placeholder={projects.some((p) => p.placeholder)}
          />
        </div>
        <div className="container-x max-lg:!px-0">
          <ul
            ref={track}
            className="flex gap-5 will-change-transform max-lg:snap-x max-lg:snap-mandatory max-lg:overflow-x-auto max-lg:px-5 max-lg:pb-4 md:gap-8"
          >
            {projects.map((p, i) => (
              <li key={p.slug} className="w-[82vw] max-w-[460px] shrink-0 snap-center lg:w-[460px]">
                <article className="card group relative h-full overflow-hidden transition-colors hover:border-accent/60">
                  <div className="aspect-[16/9] overflow-hidden">
                    <Thumb
                      src={p.thumbnail}
                      hue={p.hue}
                      label={p.title}
                      className="transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 md:p-7">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-semibold text-xs text-muted">
                        {String(i + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                      </span>
                      <ArrowUpRight size={18} className="text-muted transition-colors group-hover:text-accent" />
                    </div>
                    <h3 className="mt-3 text-2xl font-semibold">
                      <button
                        type="button"
                        onClick={() => setOpen(p)}
                        className="text-left after:absolute after:inset-0 after:content-['']"
                        aria-haspopup="dialog"
                      >
                        {p.title}
                      </button>
                    </h3>
                    <p className="mt-2 text-sm text-muted">{p.summary}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {p.tags.map((t, j) => (
                        <li key={j} className="chip">
                          {t}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={`/work/${p.slug}`}
                      className="link-underline relative z-10 mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent"
                    >
                      Case study <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
          <div className="mt-8 hidden h-px bg-line lg:block" aria-hidden="true">
            <div ref={bar} className="h-full origin-left scale-x-0 bg-accent" />
          </div>
        </div>
      </div>
      <AnimatePresence>{open && <ProjectModal project={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  )
}
