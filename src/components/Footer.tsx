import { Link } from 'react-router-dom'
import { ArrowUp, Mail } from 'lucide-react'
import { nav, site } from '../data/content'
import { GithubIcon, LinkedinIcon } from './ui'

export default function Footer() {
  const c = site.contact
  const social = [
    { Icon: GithubIcon, label: 'GitHub', href: c.github },
    { Icon: LinkedinIcon, label: 'LinkedIn', href: c.linkedin },
    { Icon: Mail, label: 'Email', href: `mailto:${c.email}` },
  ]
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-x flex flex-col gap-10 py-14 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="name-display text-3xl">{site.name}</p>
          <p className="mt-1 text-muted">{site.role}</p>
          <ul className="mt-6 flex gap-2">
            {social.map(({ Icon, label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="grid size-11 place-items-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  <Icon size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
            {nav.map((n) => (
              <li key={n.hash}>
                <Link to={`/#${n.hash}`} className="text-muted transition-colors hover:text-accent">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="btn btn-ghost self-start"
        >
          Back to top <ArrowUp size={16} />
        </button>
      </div>
      <div className="border-t border-line">
        <p className="container-x py-6 text-sm text-muted">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
