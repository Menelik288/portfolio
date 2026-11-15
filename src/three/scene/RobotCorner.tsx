import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import RobotHead from '../RobotHead'
import { useIntro } from '../lib/useIntro'

/** How far in front of the camera the robot is pinned. */
const DEPTH = 8
/**
 * Where it sits, as a fraction of the half-viewport: bottom-right on desktop.
 * On a phone the hero's copy and its gradient own the lower half, so the robot
 * moves up into the clear band on the right instead of hiding behind them.
 */
const ANCHOR = {
  wide: { x: 0.72, y: -0.54 },
  narrow: { x: 0.58, y: 0.28 },
}
/** Height of the primitive head in world units, used to size it to the viewport. */
const NATIVE_H = 2.2

/**
 * The robot head from the previous hero, kept and pinned to the bottom-right
 * corner of the viewport. It rides the camera rather than the scene, so it
 * stays put while the solar system drifts behind it, and it still tracks the
 * cursor exactly as it used to.
 */
export default function RobotCorner({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera, size } = useThree()
  const a = size.width < 760 ? ANCHOR.narrow : ANCHOR.wide
  const anchorNdc: [number, number] = [a.x, a.y]
  const rig = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  // Lands last, after the astronaut has settled: a small hop into frame.
  const intro = useIntro(reducedMotion, 1.1, 1.5)

  useFrame(({ clock }) => {
    const g = rig.current
    const b = inner.current
    if (!g || !b) return
    const cam = camera as THREE.PerspectiveCamera

    // Pin to the camera's bottom-right corner, whatever the camera is doing.
    const narrow = size.width < 760
    const anchor = narrow ? ANCHOR.narrow : ANCHOR.wide
    const halfH = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * DEPTH
    const halfW = halfH * (size.width / Math.max(size.height, 1))
    g.position.copy(cam.position)
    g.quaternion.copy(cam.quaternion)
    g.translateX(halfW * anchor.x)
    g.translateY(halfH * anchor.y)
    g.translateZ(-DEPTH)

    const k = intro.current.p
    // Keep it a constant share of the viewport height at any aspect ratio.
    const fit = ((halfH * 2) * (narrow ? 0.15 : 0.26)) / NATIVE_H
    b.scale.setScalar(fit * k)
    // Hops up into place, then breathes.
    b.position.y = (1 - k) * -halfH * 0.5 + (reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.8) * 0.04)
    b.visible = k > 0.01
  })

  return (
    <group ref={rig}>
      <group ref={inner}>
        <RobotHead tracking reducedMotion={reducedMotion} screenAnchor={anchorNdc} modelUrl={null} />
      </group>
    </group>
  )
}
