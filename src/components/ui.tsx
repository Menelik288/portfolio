import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { site } from '../data/content'

export function PlaceholderTag({ show = true, label = 'Placeholder content' }: { show?: boolean; label?: string }) {
  if (!site.showPlaceholderTags || !show) return null
  return <span className="placeholder-tag">{label}</span>
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  placeholder,
}: {
  eyebrow: string
  title: string
  intro?: string
  placeholder?: boolean
}) {
  return (
    <header className="mb-12 max-w-2xl md:mb-16">
      <p data-reveal className="eyebrow flex flex-wrap items-center gap-3">
        {eyebrow} <PlaceholderTag show={!!placeholder} />
      </p>
      <h2 data-reveal className="h-section">
        {title}
      </h2>
      {intro && (
        <p data-reveal className="mt-5 text-muted">
          {intro}
        </p>
      )}
    </header>
  )
}

/** Card that tilts a few degrees toward the pointer. */
export function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const rx = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 })
  const ry = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 })
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      whileHover={{ y: -6 }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== 'mouse' || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 12)
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 12)
      }}
      onPointerLeave={() => {
        rx.set(0)
        ry.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

/** Generated tile used until a real thumbnail is supplied. */
export function Thumb({ src, hue, label, className = '' }: { src: string | null; hue: number; label: string; className?: string }) {
  if (src) return <img src={src} alt={label} loading="lazy" className={`h-full w-full object-cover ${className}`} />
  return (
    <div
      role="img"
      aria-label={`${label} — placeholder image`}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 20% 10%, hsl(${(hue % 30) + 15} 95% 50% / .6), transparent 60%), linear-gradient(135deg, #1a1a1a, #0b0b0b)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(#ffffff14 1px, transparent 1px), linear-gradient(90deg, #ffffff14 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <span className="relative font-sans font-semibold text-xs tracking-[0.3em] text-white/70 uppercase">Image placeholder</span>
    </div>
  )
}

export const GithubIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.3-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.06.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
)

export const LinkedinIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
)
