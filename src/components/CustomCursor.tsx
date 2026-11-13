import { useEffect, useRef, useState } from 'react'

/** Desktop-only trailing ring. The native cursor stays visible for accessibility. */
export default function CustomCursor() {
  const ring = useRef<HTMLDivElement>(null)
  const [enabled] = useState(
    () =>
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (!enabled || !ring.current) return
    const el = ring.current
    let x = -100, y = -100, tx = -100, ty = -100, s = 1, ts = 1, raf = 0
    const move = (e: PointerEvent) => {
      tx = e.clientX
      ty = e.clientY
      el.style.opacity = '1'
      ts = (e.target as Element | null)?.closest?.('a, button, [role="button"], input, textarea, canvas') ? 1.9 : 1
    }
    const leave = () => (el.style.opacity = '0')
    const tick = () => {
      x += (tx - x) * 0.18
      y += (ty - y) * 0.18
      s += (ts - s) * 0.15
      el.style.transform = `translate3d(${x - 16}px, ${y - 16}px, 0) scale(${s})`
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div
      ref={ring}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[100] size-8 rounded-full border border-accent opacity-0 mix-blend-difference transition-opacity duration-300"
    />
  )
}
