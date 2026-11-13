import { useEffect, useRef, useState } from 'react'

/** Desktop-only bespoke cursor: glowing precision dot + trailing fluid liquid ring */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [enabled] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (!enabled || !dotRef.current || !ringRef.current) return

    document.documentElement.classList.add('custom-cursor-enabled')

    const dot = dotRef.current
    const ring = ringRef.current

    let mouseX = -100
    let mouseY = -100
    let ringX = -100
    let ringY = -100
    let scale = 1
    let targetScale = 1
    let isClicking = false
    let isHovering = false
    let isInput = false
    let raf = 0

    const updateVisibility = (visible: boolean) => {
      const op = visible && !isInput ? '1' : '0'
      dot.style.opacity = op
      ring.style.opacity = op
    }

    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      const target = e.target as Element | null
      isInput = !!target?.closest('input, textarea, [contenteditable="true"]')
      isHovering = !!target?.closest('a, button, [role="button"], [role="dialog"], canvas, .card')

      targetScale = isClicking ? 0.75 : isHovering ? 2 : 1
      updateVisibility(true)
    }

    const onPointerDown = () => {
      isClicking = true
      targetScale = 0.75
    }

    const onPointerUp = () => {
      isClicking = false
      targetScale = isHovering ? 2 : 1
    }

    const onPointerLeave = () => {
      updateVisibility(false)
    }

    const tick = () => {
      // Dot follows cursor with immediate precision
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`

      // Ring trails with smooth fluid inertia (lerp)
      ringX += (mouseX - ringX) * 0.18
      ringY += (mouseY - ringY) * 0.18
      scale += (targetScale - scale) * 0.2

      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${scale})`

      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    document.documentElement.addEventListener('pointerleave', onPointerLeave)

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('custom-cursor-enabled')
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      {/* Precision pinpoint dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[101] size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-0 shadow-[0_0_10px_var(--color-accent)] transition-opacity duration-200"
      />
      {/* Fluid trailing halo */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[100] size-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/70 bg-accent/[0.08] backdrop-blur-[1px] opacity-0 shadow-[0_0_20px_rgba(255,106,0,0.25)] transition-[border-color,background-color] duration-200"
      />
    </>
  )
}
