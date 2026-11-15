import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { glb } from './lib/glbPaths'
import { fitToSize, tuneMaterials, useClonedModel } from './lib/useModel'
import { useGlowTexture } from './scene/Backdrop'

useGLTF.preload(glb.ufo)

/** Distance in front of the camera the saucer flies at. */
const DEPTH = 12
/** Roughly how wide the saucer should look, in CSS pixels. */
const WIDTH_PX = 170

const pointer = { x: 0, y: 0, seen: false }

const damp = (cur: number, to: number, lambda: number, dt: number) =>
  cur + (to - cur) * (1 - Math.exp(-lambda * Math.min(dt, 0.05)))

function Saucer() {
  const model = useClonedModel('ufo', { materials: true })
  const { size } = useThree()
  const ref = useRef<THREE.Group>(null)
  const disc = useRef<THREE.Group>(null)
  const beam = useRef<THREE.Mesh>(null)
  const beamTex = useGlowTexture('rgba(255,106,0,0.55)')
  const prev = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    fitToSize(model, 1)
    tuneMaterials(model, (m) => {
      m.metalness = 0.7
      m.roughness = 0.28
      m.envMapIntensity = 1.2
      if (m.name === 'glow') {
        m.emissive = new THREE.Color('#ff6a00')
        m.emissiveIntensity = 4
        m.toneMapped = false
      }
    })
  }, [model])

  useFrame(({ clock }, dt) => {
    const g = ref.current
    if (!g) return
    const t = clock.elapsedTime

    // The camera sits at the origin looking down -Z, so the plane at -DEPTH
    // maps straight onto the viewport: no unprojection needed.
    const halfH = Math.tan(THREE.MathUtils.degToRad(21)) * DEPTH
    const halfW = halfH * (size.width / Math.max(size.height, 1))
    const world = halfH * 2 / Math.max(size.height, 1)
    g.scale.setScalar(WIDTH_PX * world)

    let tx: number
    let ty: number
    if (pointer.seen) {
      tx = pointer.x * halfW
      // Held a little above the cursor so it never sits under the pointer.
      ty = pointer.y * halfH + halfH * 0.16
    } else {
      // Idles across the top of the viewport until the pointer is used.
      tx = Math.sin(t * 0.25) * halfW * 0.55
      ty = halfH * 0.45 + Math.sin(t * 0.5) * halfH * 0.05
    }

    prev.copy(g.position)
    g.position.x = damp(g.position.x, tx, 2.2, dt)
    g.position.y = damp(g.position.y, ty, 2.2, dt)
    g.position.z = -DEPTH

    // Bank into the direction of travel.
    const vx = g.position.x - prev.x
    const vy = g.position.y - prev.y
    g.rotation.z = damp(g.rotation.z, THREE.MathUtils.clamp(-vx * 1.4, -0.5, 0.5), 5, dt)
    g.rotation.x = damp(g.rotation.x, THREE.MathUtils.clamp(-vy * 1.4, -0.4, 0.4), 5, dt)

    if (disc.current) disc.current.rotation.y = t * 1.1
    if (beam.current) (beam.current.material as THREE.MeshBasicMaterial).opacity = 0.14 + Math.sin(t * 1.7) * 0.04
  })

  return (
    <group ref={ref}>
      <group ref={disc}>
        <primitive object={model} />
      </group>
      <mesh ref={beam} position={[0, -1.05, 0]}>
        <coneGeometry args={[0.55, 1.7, 28, 1, true]} />
        <meshBasicMaterial
          map={beamTex}
          color="#ff8a3d"
          transparent
          opacity={0.14}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

/**
 * The saucer, on its own transparent canvas pinned over the whole page, so it
 * keeps chasing the cursor through every section instead of stopping at the
 * bottom of the hero.
 *
 * It sits above the page content but below the nav (z-50), the mobile menu and
 * the project dialog, and it never takes pointer events, so nothing it flies
 * over becomes harder to click.
 */
export default function CursorUfo() {
  const [awake, setAwake] = useState(!document.hidden)

  useEffect(() => {
    const on = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
      pointer.seen = true
    }
    const vis = () => setAwake(!document.hidden)
    window.addEventListener('pointermove', on, { passive: true })
    document.addEventListener('visibilitychange', vis)
    return () => {
      window.removeEventListener('pointermove', on)
      document.removeEventListener('visibilitychange', vis)
    }
  }, [])

  return (
    // `ufo-layer` forces pointer-events off on the canvas too: react-three-fiber
    // inlines `pointer-events: auto` on its own container, which overrides a
    // `pointer-events-none` parent and would leave the canvas swallowing every
    // click on the page.
    <div className="ufo-layer pointer-events-none fixed inset-0 z-30" aria-hidden="true">
      <Canvas
        style={{ pointerEvents: 'none' }}
        frameloop={awake ? 'always' : 'never'}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 0], fov: 42, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
        }}
      >
        <ambientLight intensity={1.1} color="#ffe0c8" />
        <directionalLight color="#fff1e0" intensity={2.4} position={[3, 4, 6]} />
        <directionalLight color="#ff6a00" intensity={1.6} position={[-4, -2, 2]} />
        <Saucer />
      </Canvas>
    </div>
  )
}
