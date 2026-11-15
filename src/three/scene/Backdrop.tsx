import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/** Soft radial sprite used for nebula clouds and star points. */
export function useGlowTexture(inner: string, outer = 'rgba(0,0,0,0)') {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const g = c.getContext('2d')!
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
    grad.addColorStop(0, inner)
    grad.addColorStop(0.45, inner.replace(/[\d.]+\)$/, '0.06)'))
    grad.addColorStop(1, outer)
    g.fillStyle = grad
    g.fillRect(0, 0, 256, 256)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [inner, outer])
  useEffect(() => () => tex.dispose(), [tex])
  return tex
}

function Nebula({ colour, position, size }: { colour: string; position: [number, number, number]; size: number }) {
  const tex = useGlowTexture(colour)
  return (
    <mesh position={position} renderOrder={-1}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={tex}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  )
}

/** Starfield that follows the camera, so it reads as a sky, not as scene objects. */
function Stars({ count, light }: { count: number; light: boolean }) {
  const ref = useRef<THREE.Points>(null)

  const { positions, colours } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colours = new Float32Array(count * 3)
    // Warm sparks on black; dark specks on the orange theme.
    const palette = light
      ? [new THREE.Color('#2a1200'), new THREE.Color('#4a2408'), new THREE.Color('#0b0b0b')]
      : [new THREE.Color('#ffffff'), new THREE.Color('#ffd9b0'), new THREE.Color('#ffb27a'), new THREE.Color('#ff8a3d')]
    for (let i = 0; i < count; i++) {
      const r = 120 + Math.random() * 90
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.cos(phi)
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      const c = palette[(Math.random() * palette.length) | 0]
      // On black, push the colour past 1.0 so the bloom pass picks the star up
      // and it reads as a glow rather than a flat dot. Varied per star so the
      // field has bright and faint ones.
      const gain = light ? 1 : 1.6 + Math.random() * 1.6
      colours[i * 3] = c.r * gain
      colours[i * 3 + 1] = c.g * gain
      colours[i * 3 + 2] = c.b * gain
    }
    return { positions, colours }
  }, [count, light])

  const tex = useGlowTexture('rgba(255,255,255,1)')

  useFrame(({ camera }, dt) => {
    const p = ref.current
    if (!p) return
    p.position.copy(camera.position)
    p.rotation.y += dt * 0.004
  })

  return (
    <points ref={ref} frustumCulled={false} renderOrder={-2}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colours, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={tex}
        size={light ? 1.1 : 1.7}
        sizeAttenuation
        vertexColors
        transparent
        opacity={light ? 0.5 : 1}
        depthWrite={false}
        toneMapped={false}
        blending={light ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </points>
  )
}

/** Sky and haze behind the hero. */
export default function Backdrop({ stars, light }: { stars: number; light: boolean }) {
  return (
    <>
      <Stars count={stars} light={light} />
      {!light && (
        <group position={[0, 0, -130]}>
          <Nebula colour="rgba(255,106,0,0.030)" position={[-86, 34, 0]} size={150} />
          <Nebula colour="rgba(255,138,61,0.018)" position={[96, -40, -25]} size={160} />
        </group>
      )}
    </>
  )
}
