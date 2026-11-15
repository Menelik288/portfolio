import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * A 0..1 intro value driven by GSAP, read from `useFrame` through a ref.
 *
 * GSAP advances on its own ticker, which all but stops when the page is in a
 * background tab or the frame loop is throttled. Without a backstop an intro
 * that starts an element off screen can leave the hero looking empty long after
 * load, so a timer forces the value to its end state if the tween has not got
 * there in time.
 */
export function useIntro(reducedMotion: boolean, duration = 2.4, delay = 0) {
  const value = useRef({ p: reducedMotion ? 1 : 0 })

  useEffect(() => {
    if (reducedMotion) {
      value.current.p = 1
      return
    }
    const tw = gsap.to(value.current, { p: 1, duration, delay, ease: 'power3.out' })
    const safety = window.setTimeout(
      () => {
        if (value.current.p < 1) {
          tw.kill()
          value.current.p = 1
        }
      },
      (duration + delay) * 1000 + 2500,
    )
    return () => {
      clearTimeout(safety)
      tw.kill()
    }
  }, [reducedMotion, duration, delay])

  return value
}
