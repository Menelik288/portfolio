import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { DISPLAY_MODELS, type GlbKey } from '../lib/glbPaths'
import { fitToSize, tuneMaterials, useClonedModel } from '../lib/useModel'
import { useIntro } from '../lib/useIntro'

/* ──────────────────────────── shared helpers ──────────────────────────── */

/** Hides the display cradle on the Solar System pack's models. */
function stripCradle(object: THREE.Object3D, key: GlbKey) {
  if (!DISPLAY_MODELS.has(key)) return
  object.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
    if (mat && (mat.name === 'dark' || mat.name === 'steel')) mesh.visible = false
  })
}

/** Pointer in -1..1, shared by the cursor-chasing saucer. */
const pointer = { x: 0, y: 0, seen: false }

function usePointer() {
  useEffect(() => {
    const on = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
      pointer.seen = true
    }
    window.addEventListener('pointermove', on, { passive: true })
    return () => window.removeEventListener('pointermove', on)
  }, [])
}

const damp = (cur: number, to: number, lambda: number, dt: number) =>
  cur + (to - cur) * (1 - Math.exp(-lambda * Math.min(dt, 0.05)))

/* ───────────────────────────── planet ring ───────────────────────────── */

type Body = { key: GlbKey; size: number; tint: string }

/**
 * The nine bodies in solar order. They sit at equal angles on one ring that
 * turns as a whole, so the system always reads as a circle in a fixed area of
 * the frame rather than nine objects drifting on separate paths.
 */
const BODIES: Body[] = [
  { key: 'mercury', size: 0.9, tint: '#ff8a3d' },
  { key: 'venus', size: 1.2, tint: '#ffb27a' },
  { key: 'earth', size: 1.45, tint: '#ffd9b0' },
  { key: 'mars', size: 1.05, tint: '#ff6a00' },
  { key: 'jupiter', size: 2.2, tint: '#ffc48a' },
  { key: 'saturn', size: 2.3, tint: '#ffe3a8' },
  { key: 'uranus', size: 1.6, tint: '#ffcf9a' },
  { key: 'neptune', size: 1.5, tint: '#ffa15c' },
  { key: 'dwarf', size: 0.75, tint: '#ffe9d2' },
]

/** Ring radius, in world units. Sized so the whole ellipse stays in frame. */
const RING_R = 5.4
/** Seconds for one full lap of the ring. */
const RING_PERIOD = 150
/** How far the circle is flattened: 1 = a circle, 0 = a straight line. */
const RING_SQUASH = 0.44
/** Angle the flattened ring is tipped at, so it runs diagonally across frame. */
const RING_DIAG = -0.52
/** A little depth, kept small so no body ever swings towards the lens. */
const RING_DEPTH = 0.14

/**
 * One body travelling its seat on the shared ring. Every body keeps the same
 * spacing and the same path, so the system always reads as one ellipse in a
 * fixed part of the frame rather than nine objects on separate orbits.
 */
function Planet({ body, index, count, light }: { body: Body; index: number; count: number; light: boolean }) {
  const model = useClonedModel(body.key, { materials: true })
  const slot = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)

  const base = (index / count) * Math.PI * 2

  useEffect(() => {
    stripCradle(model, body.key)
    fitToSize(model, body.size)
    tuneMaterials(model, (m) => {
      m.metalness = Math.max(m.metalness, 0.12)
      if (light) {
        m.color.multiplyScalar(0.3)
        m.emissive = new THREE.Color('#000000')
      } else {
        m.emissive = new THREE.Color(body.tint).multiplyScalar(0.12)
      }
    })
  }, [model, body.size, body.tint, body.key, light])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (slot.current) {
      const a = base + (t / RING_PERIOD) * Math.PI * 2
      // A flattened circle, then tipped as a whole so the path runs diagonally.
      const ex = Math.cos(a) * RING_R
      const ey = Math.sin(a) * RING_R * RING_SQUASH
      slot.current.position.set(
        ex * Math.cos(RING_DIAG) - ey * Math.sin(RING_DIAG),
        ex * Math.sin(RING_DIAG) + ey * Math.cos(RING_DIAG) + Math.sin(t * 0.5 + index) * 0.1,
        Math.sin(a) * RING_R * RING_DEPTH,
      )
    }
    // Each body turns on its own axis, smaller ones faster.
    if (spin.current) spin.current.rotation.y = t * (0.4 / Math.sqrt(body.size))
  })

  return (
    <group ref={slot}>
      <group ref={spin}>
        <primitive object={model} />
      </group>
    </group>
  )
}

/** Holds the nine bodies. Each one walks the shared ellipse on its own. */
function PlanetRing({ bodies, light }: { bodies: Body[]; light: boolean }) {
  return (
    <group>
      {bodies.map((b, i) => (
        <Planet key={b.key} body={b} index={i} count={bodies.length} light={light} />
      ))}
    </group>
  )
}

/* ───────────────────────────── astronaut ─────────────────────────────── */

/** How far the body turns at the very edge of the screen. Deliberately small. */
const AIM_YAW = 0.46 // ~26°
const AIM_PITCH = 0.2 // ~11°
const AIM_ROLL = 0.14 // ~8°

/**
 * The astronaut floats at the centre of the ring: large, close to the camera,
 * with a GSAP entrance that swings it in and settles it into a slow tumble.
 */
function Astronaut({ light, reducedMotion }: { light: boolean; reducedMotion: boolean }) {
  const model = useClonedModel('astronaut', { materials: true })
  const ref = useRef<THREE.Group>(null)
  const intro = useIntro(reducedMotion, 2.4, 0.25)
  /** Where the body is turning to. GSAP eases these; the frame loop reads them. */
  const aim = useRef({ yaw: 0, pitch: 0, roll: 0 })

  /**
   * The body turns to follow the cursor. `gsap.quickTo` is built for exactly
   * this: each pointer move retargets a running tween instead of starting a new
   * one, so fast flicks glide rather than snap. GSAP owns a plain object rather
   * than the group's rotation directly, because the frame loop also adds the
   * entrance and the idle sway to the same axes.
   */
  useEffect(() => {
    if (reducedMotion) return
    const o = aim.current
    const ease = 'power3.out'
    const setYaw = gsap.quickTo(o, 'yaw', { duration: 0.9, ease })
    const setPitch = gsap.quickTo(o, 'pitch', { duration: 0.9, ease })
    // The roll trails the turn slightly, which reads as weight.
    const setRoll = gsap.quickTo(o, 'roll', { duration: 1.2, ease })

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      setYaw(x * AIM_YAW)
      setPitch(y * AIM_PITCH)
      setRoll(-x * AIM_ROLL)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      gsap.killTweensOf(o)
    }
  }, [reducedMotion])

  useEffect(() => {
    fitToSize(model, 5.4)
    // Per-material finish rather than one blanket setting: the suit is matte
    // fabric, the hard parts are machined metal and the visor is near-mirror.
    // With the studio environment behind them that reads far closer to a real
    // suit than a single flat roughness did.
    tuneMaterials(model, (m) => {
      m.envMapIntensity = 1.6
      switch (m.name) {
        case 'white':
        case 'light':
          m.roughness = 0.62
          m.metalness = 0.04
          break
        case 'grey':
        case 'steel':
          m.roughness = 0.24
          m.metalness = 1
          m.envMapIntensity = 2.1
          break
        case 'dark':
          m.roughness = 0.34
          m.metalness = 0.85
          break
        case 'blue':
        case 'glass':
          // Visor: dark mirror with a neon wash across it.
          m.roughness = 0.06
          m.metalness = 1
          m.envMapIntensity = 2.6
          m.emissive = new THREE.Color('#00e5ff')
          m.emissiveIntensity = light ? 0 : 0.55
          break
        case 'red':
        case 'yellow':
          m.roughness = 0.45
          m.metalness = 0.2
          m.emissive = new THREE.Color(m.color)
          m.emissiveIntensity = light ? 0 : 0.35
          break
        default:
          m.roughness = 0.5
          m.metalness = 0.3
      }
      if (light) {
        m.color.multiplyScalar(0.45)
        m.emissiveIntensity = 0
      }
    })
  }, [model, light])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const g = ref.current
    if (!g) return
    const k = intro.current.p

    // Entrance: drifts in from below right, over-rotating as it settles into
    // the middle of the ring.
    g.position.x = THREE.MathUtils.lerp(8, 0, k)
    g.position.z = THREE.MathUtils.lerp(-9, 3.2, k)
    g.position.y = THREE.MathUtils.lerp(-7, 0.8, k) + Math.sin(t * 0.33) * 0.3 * k
    g.scale.setScalar(THREE.MathUtils.lerp(0.55, 1, k))

    // Rotation is the cursor aim plus a slow idle sway, faded in with the
    // entrance. The sway is small enough that the cursor stays the thing you
    // notice; a constant spin here would bury it.
    const a = aim.current
    g.rotation.y = THREE.MathUtils.lerp(-2.4, a.yaw + Math.sin(t * 0.09) * 0.16, k)
    g.rotation.x = (a.pitch + Math.sin(t * 0.17 + 1.3) * 0.05) * k
    g.rotation.z = (a.roll + Math.sin(t * 0.21) * 0.06) * k
  })

  return (
    <group ref={ref}>
      <primitive object={model} />
      {!light && (
        <>
          {/* Cyberpunk rig: a warm key from the front, a hot magenta rim down
              one side and an electric cyan rim down the other, with a dim
              under-light so the suit never goes solid black. */}
          <pointLight color="#fff0dc" intensity={14} distance={16} position={[2.6, 2.4, 4.2]} />
          <pointLight color="#ff1f8f" intensity={26} distance={13} position={[-3.4, 1.4, -1.6]} />
          <pointLight color="#00e5ff" intensity={22} distance={13} position={[3.6, 0.4, -2.0]} />
          <pointLight color="#7a3bff" intensity={10} distance={11} position={[0, -3.0, 1.4]} />
        </>
      )}
    </group>
  )
}

/* ──────────────────────────────── scene ──────────────────────────────── */

type Props = { tier: 'high' | 'low'; light: boolean; reducedMotion: boolean }

export default function HeroSpace({ tier, light, reducedMotion }: Props) {
  const { viewport, camera } = useThree()
  const intro = useIntro(reducedMotion, 2.6)
  usePointer()

  const bodies = tier === 'low' ? BODIES.filter((_, i) => i % 2 === 0) : BODIES
  const wide = viewport.aspect > 1.02

  // Desktop puts the copy on the left, so the system sits to the right.
  const offsetX = wide ? 4.2 : 0
  const offsetY = wide ? 0.8 : 4.0
  const groupScale = wide ? 1 : 0.46

  useFrame((_, dt) => {
    const cam = camera as THREE.PerspectiveCamera
    const k = intro.current.p
    const p = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1)

    const restZ = (wide ? 17 : 14) + p * 14
    const z = THREE.MathUtils.lerp(9, restZ, k)
    const px = reducedMotion ? 0 : pointer.x * 1.2 * k
    const py = reducedMotion ? 0 : -pointer.y * 0.8 * k
    const aim = wide ? THREE.MathUtils.lerp(offsetX, offsetX - 2.4, k) : offsetX

    cam.position.x = damp(cam.position.x, offsetX * 0.2 + px, 2.4, dt)
    cam.position.y = damp(cam.position.y, offsetY * 0.3 + 1.0 - p * 5 - py, 2.4, dt)
    cam.position.z = damp(cam.position.z, z, 2.0, dt)
    cam.lookAt(aim, offsetY - p * 3, 0)
  })

  return (
    <group position={[offsetX, offsetY, 0]} scale={groupScale}>
      {light ? (
        <>
          {/* Orange theme: flat, bright key so the bodies read as silhouettes */}
          <directionalLight color="#ffffff" intensity={3.2} position={[6, 7, 9]} />
          <directionalLight color="#ffffff" intensity={1.4} position={[-9, -3, -6]} />
        </>
      ) : (
        <>
          <directionalLight color="#fff1e0" intensity={3.4} position={[6, 7, 9]} />
          <directionalLight color="#ff6a00" intensity={1.8} position={[-9, -3, -6]} />
          <directionalLight color="#ff8a3d" intensity={1.2} position={[9, -2, -8]} />
        </>
      )}

      <PlanetRing bodies={bodies} light={light} />
      <Astronaut light={light} reducedMotion={reducedMotion} />
    </group>
  )
}
