import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const deg = THREE.MathUtils.degToRad
const MAX_YAW = deg(35)
const MAX_PITCH = deg(20)
const IDLE_AFTER = 3 // seconds without pointer movement before the scan starts

type Props = {
  /** Follow the pointer / run the idle scan. Off = static pose (used by the viewer). */
  tracking?: boolean
  /** Disable the idle scan (prefers-reduced-motion). */
  reducedMotion?: boolean
  /** Where the head sits on screen in NDC, so "look at cursor" is relative to it. */
  screenAnchor?: [number, number]
  /** Optional .glb with nodes named "Head" and "Eye". */
  modelUrl?: string | null
}

// Pointer state lives outside React so useFrame never triggers re-renders.
const pointer = { x: 0, y: 0, last: -Infinity, seen: false }

function usePointerTracking(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const now = () => performance.now() / 1000
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
      pointer.last = now()
      pointer.seen = true
    }
    // Mobile: tilt the device to steer the head (when the browser provides it without a prompt).
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      pointer.x = THREE.MathUtils.clamp(e.gamma / 30, -1, 1)
      pointer.y = THREE.MathUtils.clamp((e.beta - 45) / -30, -1, 1)
      pointer.last = now()
      pointer.seen = true
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('deviceorientation', onTilt)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('deviceorientation', onTilt)
    }
  }, [enabled])
}

/** Drives head + eye rotation each frame. Shared by the primitive head and a loaded .glb. */
function useHeadMotion(
  head: React.RefObject<THREE.Object3D | null>,
  eye: React.RefObject<THREE.Object3D | null>,
  { tracking = true, reducedMotion = false, screenAnchor = [0, 0] }: Props,
) {
  usePointerTracking(tracking)
  useFrame((state, delta) => {
    const h = head.current
    if (!h || !tracking) return
    const t = state.clock.elapsedTime
    const idle = performance.now() / 1000 - pointer.last > IDLE_AFTER
    let yaw = 0
    let pitch = 0
    let ex = 0
    let ey = 0
    if (!idle && pointer.seen) {
      const dx = THREE.MathUtils.clamp(pointer.x - screenAnchor[0], -1, 1)
      const dy = THREE.MathUtils.clamp(pointer.y - screenAnchor[1], -1, 1)
      yaw = dx * MAX_YAW
      pitch = -dy * MAX_PITCH
      ex = dx * 0.35
      ey = -dy * 0.3
    } else if (!reducedMotion) {
      // Slow scan: left, right, back to centre, with a pause in the middle.
      const s = Math.sin(t * 0.55)
      yaw = Math.sign(s) * Math.pow(Math.abs(s), 0.6) * deg(28)
      pitch = Math.sin(t * 0.31) * deg(4)
      ex = Math.sin(t * 0.55 + 0.6) * 0.25
    }
    // Low lambda = heavy, mechanical damping. The eye is lighter and leads the head.
    h.rotation.y = THREE.MathUtils.damp(h.rotation.y, yaw, 3.2, delta)
    h.rotation.x = THREE.MathUtils.damp(h.rotation.x, pitch, 3.2, delta)
    if (eye.current) {
      eye.current.rotation.y = THREE.MathUtils.damp(eye.current.rotation.y, ex, 9, delta)
      eye.current.rotation.x = THREE.MathUtils.damp(eye.current.rotation.x, ey, 9, delta)
    }
  })
}

function Piston({ from, to, mats }: { from: [number, number, number]; to: [number, number, number]; mats: Mats }) {
  const { pos, quat, len } = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const dir = b.clone().sub(a)
    return {
      pos: a.clone().add(b).multiplyScalar(0.5),
      quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()),
      len: dir.length(),
    }
  }, [from, to])
  return (
    <group position={pos} quaternion={quat}>
      <mesh material={mats.chrome}>
        <cylinderGeometry args={[0.028, 0.028, len, 12]} />
      </mesh>
      <mesh material={mats.dark} position={[0, len * 0.22, 0]}>
        <cylinderGeometry args={[0.05, 0.05, len * 0.5, 14]} />
      </mesh>
      <mesh material={mats.chrome} position={[0, len / 2, 0]}>
        <sphereGeometry args={[0.055, 12, 10]} />
      </mesh>
      <mesh material={mats.chrome} position={[0, -len / 2, 0]}>
        <sphereGeometry args={[0.055, 12, 10]} />
      </mesh>
    </group>
  )
}

type Mats = ReturnType<typeof useMats>
function useMats() {
  return useMemo(
    () => ({
      gun: new THREE.MeshStandardMaterial({ color: '#3b3b3d', metalness: 1, roughness: 0.28, envMapIntensity: 1.7, side: THREE.DoubleSide }),
      plate: new THREE.MeshStandardMaterial({ color: '#5a5a5d', metalness: 1, roughness: 0.2, envMapIntensity: 1.8 }),
      chrome: new THREE.MeshStandardMaterial({ color: '#d8d8d8', metalness: 1, roughness: 0.1, envMapIntensity: 1.6 }),
      dark: new THREE.MeshStandardMaterial({ color: '#161616', metalness: 0.9, roughness: 0.42, envMapIntensity: 1.3 }),
      rubber: new THREE.MeshStandardMaterial({ color: '#16181d', metalness: 0.2, roughness: 0.7 }),
      glass: new THREE.MeshStandardMaterial({ color: '#050506', metalness: 1, roughness: 0.05 }),
      // Emissive colours above 1.0 + toneMapped:false are what the bloom pass picks up.
      red: new THREE.MeshBasicMaterial({ color: new THREE.Color(7, 1.9, 0.1), toneMapped: false }),
      redDim: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.8, 0.8, 0.05), toneMapped: false }),
      cyan: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 0.75, 0.05), toneMapped: false }),
    }),
    [],
  )
}

/**
 * PLACEHOLDER robot head built from primitives. Original design: one large red
 * optic, an offset sensor cluster, exposed jaw pistons and panel seams.
 * Faces +Z. The "Head" group is the rotating node; "Eye" is the optic.
 */
function PrimitiveHead(props: Props) {
  const head = useRef<THREE.Group>(null)
  const eye = useRef<THREE.Group>(null)
  const eyeLight = useRef<THREE.PointLight>(null)
  const m = useMats()
  useHeadMotion(head, eye, props)

  // Exposed neck cables (in neck-group space)
  const cables = useMemo(
    () =>
      [-1, 1].flatMap((s) =>
        [0, 1].map((k) => {
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(s * (0.2 + k * 0.08), 0.6, -0.22 + k * 0.3),
            new THREE.Vector3(s * (0.5 + k * 0.1), 0.25, -0.38 + k * 0.5),
            new THREE.Vector3(s * (0.58 + k * 0.12), -0.25, -0.3 + k * 0.45),
            new THREE.Vector3(s * (0.5 + k * 0.2), -0.62, -0.2 + k * 0.35),
          ])
          return new THREE.TubeGeometry(curve, 24, 0.03, 8)
        }),
      ),
    [],
  )

  useEffect(
    () => () => {
      Object.values(m).forEach((mat) => mat.dispose())
      cables.forEach((g) => g.dispose())
    },
    [m, cables],
  )

  useFrame(({ clock }) => {
    if (eyeLight.current) eyeLight.current.intensity = 5 + Math.sin(clock.elapsedTime * 2.2) * 0.8
  })

  return (
    <group>
      {/* Neck + collar: static, the head pivots on top of it */}
      <group position={[0, -1.25, -0.1]}>
        <mesh material={m.dark}>
          <cylinderGeometry args={[0.28, 0.36, 1.1, 24]} />
        </mesh>
        {[0.34, 0.12, -0.1, -0.32].map((y) => (
          <mesh key={y} material={m.chrome} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.35 - y * 0.06, 0.035, 10, 40]} />
          </mesh>
        ))}
        <Piston mats={m} from={[-0.42, 0.5, 0.12]} to={[-0.62, -0.62, 0.2]} />
        <Piston mats={m} from={[0.42, 0.5, 0.12]} to={[0.62, -0.62, 0.2]} />
        <mesh material={m.gun} position={[0, -0.78, 0]}>
          <cylinderGeometry args={[0.95, 1.5, 0.4, 40]} />
        </mesh>
        {cables.map((g, i) => (
          <mesh key={i} geometry={g} material={m.rubber} />
        ))}
        <mesh material={m.chrome} position={[0, -0.58, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.95, 0.03, 10, 64]} />
        </mesh>
      </group>

      {/* Head: pivot sits at the base of the skull */}
      <group ref={head} name="Head" position={[0, -0.6, 0]}>
        <group position={[0, 0.6, 0]}>
          {/* Cranium */}
          <mesh material={m.gun} position={[0, 0.15, -0.05]} scale={[0.9, 1.02, 1]}>
            <sphereGeometry args={[1, 56, 40, 0, Math.PI * 2, 0, 1.95]} />
          </mesh>
          {/* Exposed inner core below the dome */}
          <mesh material={m.dark} position={[0, -0.08, -0.08]} scale={[0.86, 1, 0.92]}>
            <sphereGeometry args={[0.84, 40, 28]} />
          </mesh>
          <mesh material={m.chrome} position={[0, -0.228, -0.05]} rotation={[Math.PI / 2, 0, 0]} scale={[0.836, 0.929, 1]}>
            <torusGeometry args={[1, 0.02, 8, 96]} />
          </mesh>
          {/* Panel seams */}
          <mesh material={m.dark} position={[0, 0.15, -0.05]} rotation={[0, Math.PI / 2, 0]} scale={[1, 1.02, 1]}>
            <torusGeometry args={[1.003, 0.012, 8, 96]} />
          </mesh>
          <mesh material={m.dark} position={[0, 0.5, -0.05]} rotation={[Math.PI / 2, 0, 0]} scale={[0.848, 0.942, 1]}>
            <torusGeometry args={[1.003, 0.012, 8, 96]} />
          </mesh>
          {/* Face plate */}
          <mesh material={m.plate} position={[0, 0.15, -0.05]} scale={[0.9, 1.02, 1]}>
            <sphereGeometry args={[1.03, 40, 24, Math.PI / 2 - 0.78, 1.56, 1.14, 1.12]} />
          </mesh>
          {/* Brow */}
          <mesh material={m.dark} position={[0, 0.5, 0.83]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[1.3, 0.13, 0.34]} />
          </mesh>
          {/* Brow status strip + forehead rivets */}
          <mesh material={m.cyan} position={[-0.3, 0.47, 1.0]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.34, 0.014, 0.01]} />
          </mesh>
          {[-0.45, -0.15, 0.15, 0.45].map((x) => (
            <mesh key={x} material={m.chrome} position={[x, 0.78, Math.sqrt(1 - 0.63 * 0.63 - (x / 0.9) ** 2) - 0.05]}>
              <sphereGeometry args={[0.022, 10, 8]} />
            </mesh>
          ))}
          {/* Cheek vents */}
          {[-1, 1].map((s) =>
            [0, 1, 2].map((i) => (
              <mesh key={`${s}${i}`} material={m.dark} position={[s * 0.52, -0.2 - i * 0.075, 0.84]} rotation={[0, s * 0.55, 0]}>
                <boxGeometry args={[0.2, 0.028, 0.03]} />
              </mesh>
            )),
          )}
          {/* Nose bridge */}
          <mesh material={m.gun} position={[0, -0.02, 0.99]} rotation={[-0.08, 0, 0]}>
            <boxGeometry args={[0.1, 0.56, 0.16]} />
          </mesh>

          {/* Main optic */}
          <group position={[0.37, 0.17, 0.84]} rotation={[0, 0.16, 0]}>
            <mesh material={m.dark} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.25, 0.28, 0.26, 36]} />
            </mesh>
            <mesh material={m.chrome} position={[0, 0, 0.13]}>
              <torusGeometry args={[0.245, 0.03, 12, 48]} />
            </mesh>
            <group ref={eye} name="Eye" position={[0, 0, 0.04]}>
              <mesh material={m.glass}>
                <sphereGeometry args={[0.2, 32, 24]} />
              </mesh>
              <mesh material={m.redDim} position={[0, 0, 0.165]}>
                <torusGeometry args={[0.1, 0.008, 8, 40]} />
              </mesh>
              <mesh material={m.red} position={[0, 0, 0.16]}>
                <sphereGeometry args={[0.062, 20, 16]} />
              </mesh>
            </group>
            <pointLight ref={eyeLight} color="#ff6a00" position={[0, 0, 0.55]} intensity={5} distance={5} decay={2} />
          </group>

          {/* Secondary sensor cluster */}
          <group position={[-0.37, 0.17, 0.88]} rotation={[0, -0.16, 0]}>
            <mesh material={m.dark}>
              <boxGeometry args={[0.44, 0.32, 0.2]} />
            </mesh>
            {(
              [
                [-0.11, 0.05, 0.062],
                [0.09, 0.06, 0.05],
                [0, -0.07, 0.04],
              ] as const
            ).map(([x, y, r]) => (
              <group key={x} position={[x, y, 0.1]}>
                <mesh material={m.chrome} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[r, r, 0.06, 20]} />
                </mesh>
                <mesh material={m.glass} position={[0, 0, 0.032]}>
                  <circleGeometry args={[r * 0.75, 20]} />
                </mesh>
              </group>
            ))}
            <mesh material={m.cyan} position={[0.15, -0.09, 0.102]}>
              <circleGeometry args={[0.014, 12]} />
            </mesh>
          </group>

          {/* Cheek plates */}
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.74, -0.42, 0.12]} rotation={[0, 0, Math.PI / 2]}>
              <mesh material={m.dark}>
                <cylinderGeometry args={[0.17, 0.17, 0.12, 24]} />
              </mesh>
              <mesh material={m.chrome}>
                <cylinderGeometry args={[0.07, 0.07, 0.16, 16]} />
              </mesh>
            </group>
          ))}

          {/* Jaw */}
          <group position={[0, -0.74, 0.44]} rotation={[0.1, 0, 0]}>
            <mesh material={m.gun} rotation={[0, Math.PI / 6, 0]} scale={[1, 1, 0.9]}>
              <cylinderGeometry args={[0.62, 0.46, 0.36, 6]} />
            </mesh>
            {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
              <mesh key={i} material={m.dark} position={[i * 0.075, 0.02, 0.475]}>
                <boxGeometry args={[0.035, 0.2, 0.05]} />
              </mesh>
            ))}
            <mesh material={m.chrome} position={[0, 0.19, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.9, 1]}>
              <torusGeometry args={[0.6, 0.018, 8, 6]} />
            </mesh>
          </group>
          <Piston mats={m} from={[-0.8, 0.0, 0.2]} to={[-0.5, -0.72, 0.6]} />
          <Piston mats={m} from={[0.8, 0.0, 0.2]} to={[0.5, -0.72, 0.6]} />

          {/* Ear hubs */}
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.9, 0.12, -0.05]} rotation={[0, 0, Math.PI / 2]}>
              <mesh material={m.dark}>
                <cylinderGeometry args={[0.24, 0.24, 0.14, 28]} />
              </mesh>
              <mesh material={m.chrome}>
                <cylinderGeometry args={[0.12, 0.12, 0.2, 20]} />
              </mesh>
              <mesh material={m.cyan} position={[0, s * -0.072, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.18, 0.008, 6, 40]} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  )
}

/** Real model path: any .glb whose scene contains nodes named "Head" and "Eye". */
function GltfHead({ modelUrl, ...props }: Props & { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl)
  const head = useRef<THREE.Object3D | null>(null)
  const eye = useRef<THREE.Object3D | null>(null)
  useEffect(() => {
    head.current = scene.getObjectByName('Head') ?? scene
    eye.current = scene.getObjectByName('Eye') ?? null
  }, [scene])
  useHeadMotion(head, eye, props)
  return <primitive object={scene} />
}

export default function RobotHead(props: Props) {
  if (!props.modelUrl) return <PrimitiveHead {...props} />
  return (
    <Suspense fallback={null}>
      <GltfHead {...props} modelUrl={props.modelUrl} />
    </Suspense>
  )
}
