import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, CheckCircle2, Download, Mail, MapPin, Send } from 'lucide-react'
import { site } from '../data/content'
import { track } from '../lib/analytics'
import { useReveal } from '../lib/useReveal'
import { GithubIcon, LinkedinIcon, PlaceholderTag, SectionHeading } from './ui'

type Fields = { name: string; email: string; message: string }
const empty: Fields = { name: '', email: '', message: '' }

function validate(v: Fields) {
  const e: Partial<Fields> = {}
  if (v.name.trim().length < 2) e.name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Please enter a valid email address.'
  if (v.message.trim().length < 10) e.message = 'Please write at least 10 characters.'
  return e
}

export default function Contact() {
  const ref = useReveal<HTMLElement>()
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState<Partial<Fields>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')
  const c = site.contact

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const e = validate(values)
    setErrors(e)
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0]
      ev.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setStatus('sending')
    try {
      if (site.contactEndpoint) {
        const res = await fetch(site.contactEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(values),
        })
        if (!res.ok) throw new Error(String(res.status))
      } else {
        // No endpoint configured: hand the message to the visitor's own email app.
        const subject = encodeURIComponent(`Portfolio enquiry from ${values.name}`)
        const body = encodeURIComponent(`${values.message}\n\n— ${values.name} (${values.email})`)
        window.location.href = `mailto:${c.email}?subject=${subject}&body=${body}`
      }
      track('contact_submit')
      setStatus('sent')
      setValues(empty)
    } catch {
      setStatus('failed')
    }
  }

  const field = (name: keyof Fields, label: string, props: Record<string, unknown> = {}) => {
    const Tag = name === 'message' ? 'textarea' : 'input'
    const err = errors[name]
    return (
      <div>
        <label htmlFor={`cf-${name}`} className="mb-2 block text-sm font-medium">
          {label}
        </label>
        <Tag
          id={`cf-${name}`}
          name={name}
          value={values[name]}
          onChange={(e: { target: { value: string } }) => {
            setValues((v) => ({ ...v, [name]: e.target.value }))
            if (err) setErrors((x) => ({ ...x, [name]: undefined }))
          }}
          aria-invalid={!!err}
          aria-describedby={err ? `cf-${name}-err` : undefined}
          className={`w-full rounded-xl border bg-surface/30 backdrop-blur-md px-4 py-3 text-ink placeholder:text-muted/60 transition-all focus:border-accent focus:bg-surface/50 focus:outline-none focus:ring-1 focus:ring-accent/40 ${
            err ? 'border-danger' : 'border-line/70'
          }`}
          {...props}
        />
        <AnimatePresence>
          {err && (
            <motion.p
              id={`cf-${name}-err`}
              role="alert"
              className="mt-2 text-sm text-danger"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {err}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const links = [
    { Icon: Mail, label: c.email, href: `mailto:${c.email}` },
    { Icon: LinkedinIcon, label: 'LinkedIn', href: c.linkedin },
    { Icon: GithubIcon, label: 'GitHub', href: c.github },
    ...(c.instagram ? [{ Icon: Camera, label: 'Instagram', href: c.instagram }] : []),
  ]

  return (
    <section ref={ref} id="contact" className="section">
      <div className="container-x">
        <SectionHeading
          eyebrow="06 — Contact"
          title="Have a project in mind?"
          intro="I’m always up for talking about software, open source, AI and building useful products."
          placeholder={c.placeholder}
        />
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div data-reveal>
            <ul className="space-y-3">
              {links.map(({ Icon, label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="card flex min-h-14 items-center gap-4 px-5 transition-colors hover:border-accent hover:text-accent"
                  >
                    <Icon size={18} /> {label}
                  </a>
                </li>
              ))}
              {c.location && (
                <li className="flex min-h-14 items-center gap-4 px-5 text-muted">
                  <MapPin size={18} /> {c.location}
                </li>
              )}
            </ul>
            <div className="mt-8">
              {site.resumeUrl ? (
                <a href={site.resumeUrl} download className="btn btn-ghost">
                  <Download size={16} /> Download résumé
                </a>
              ) : !site.showPlaceholderTags ? null : (
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" disabled className="btn btn-ghost cursor-not-allowed opacity-50 hover:!translate-y-0">
                    <Download size={16} /> Download résumé
                  </button>
                  <PlaceholderTag label="Résumé PDF not added yet" />
                </div>
              )}
            </div>
          </div>

          <div data-reveal className="card p-6 md:p-10">
            <AnimatePresence mode="wait" initial={false}>
              {status === 'sent' ? (
                <motion.div
                  key="ok"
                  role="status"
                  className="flex min-h-[380px] flex-col items-center justify-center text-center"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CheckCircle2 size={56} className="text-accent" />
                  <h3 className="mt-6 text-2xl font-semibold">
                    {site.contactEndpoint ? 'Thanks — message received.' : 'Almost there.'}
                  </h3>
                  <p className="mt-2 max-w-sm text-muted">
                    {site.contactEndpoint
                      ? 'I’ll get back to you soon.'
                      : `Your email app should have opened with the message ready to send. If it didn’t, email ${c.email} directly.`}
                  </p>
                  <button type="button" className="btn btn-ghost mt-8" onClick={() => setStatus('idle')}>
                    Send another
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" noValidate onSubmit={onSubmit} className="space-y-5" exit={{ opacity: 0 }}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {field('name', 'Name', { type: 'text', autoComplete: 'name', placeholder: 'Your name' })}
                    {field('email', 'Email', { type: 'email', autoComplete: 'email', placeholder: 'you@company.com' })}
                  </div>
                  {field('message', 'Message', { rows: 6, placeholder: 'What are you working on?' })}
                  {status === 'failed' && (
                    <p role="alert" className="text-sm text-danger">
                      Something went wrong sending your message. Please try again or email me directly.
                    </p>
                  )}
                  <button type="submit" disabled={status === 'sending'} className="btn btn-danger w-full disabled:opacity-60 sm:w-auto">
                    {status === 'sending' ? 'Sending…' : 'Send message'} <Send size={16} />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
