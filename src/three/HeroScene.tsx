import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import RobotHead from './RobotHead'
import { site } from '../data/content'

/** Procedural studio environment: metal reflections without downloading an HDRI. */
export function StudioEnv({ tint = '#ff6a00' }: { tint?: string }) {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#0a0a0a']} />
      <Lightformer form="rect" intensity={5} position={[0, 5, 2]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 4, 1]} />
      <Lightformer form="rect" intensity={5} color={tint} position={[-6, 1, -2]} rotation={[0, Math.PI / 2, 0]} scale={[8, 1.2, 1]} />
      <Lightformer form="rect" intensity={4} color="#dfe8ff" position={[6, 2, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 3, 1]} />
      <Lightformer form="rect" intensity={1.5} color="#ff6a00" position={[2, -3, 4]} scale={[4, 1, 1]} />
      <Lightformer form="rect" intensity={2.6} position={[-1, 1, 8]} scale={[10, 6, 1]} />
      <Lightformer form="rect" intensity={2} color="#ffe2c4" position={[-5, -1, 5]} rotation={[0, Math.PI / 3, 0]} scale={[5, 5, 1]} />
    </Environment>
  )
}

function Particles({ count, still, color }: { count: number; still: boolean; color: string }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 22
      a[i * 3 + 1] = (Math.random() - 0.5) * 14
      a[i * 3 + 2] = -Math.random() * 12 + 2
    }
    return a
  }, [count])
  useFrame(({ clock }) => {
    if (!ref.current) return
    if (!still) ref.current.rotation.y = clock.elapsedTime * 0.012
    ref.current.position.y = window.scrollY * 0.0022 // drifts up as the page scrolls
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color={color} transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function GridFloor({ major, minor }: { major: string; minor: string }) {
  const ref = useRef<THREE.GridHelper>(null)
  useFrame(() => {
    if (ref.current) ref.current.position.z = (window.scrollY * 0.006) % 1 // rushes toward the viewer on scroll
  })
  return (
    <gridHelper
      key={major + minor}
      ref={ref}
      args={[80, 80, major, minor]}
      position={[0, -2.35, 0]}
      material-transparent
      material-opacity={0.5}
    />
  )
}

/** Soft halo behind the robot so its silhouette separates from the background. */
function Glow({ light }: { light: boolean }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const g = c.getContext('2d')!
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
    grad.addColorStop(0, light ? 'rgba(255,225,190,0.7)' : 'rgba(255,106,0,0.42)')
    grad.addColorStop(0.45, light ? 'rgba(255,190,130,0.3)' : 'rgba(150,60,0,0.18)')
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 256, 256)
    return new THREE.CanvasTexture(c)
  }, [light])
  useEffect(() => () => tex.dispose(), [tex])
  return (
    <mesh position={[0, 0.1, -2.5]}>
      <planeGeometry args={[9, 9]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} fog={false} />
    </mesh>
  )
}

function Rig({ reducedMotion, light }: { reducedMotion: boolean; light: boolean }) {
  const group = useRef<THREE.Group>(null)
  const { viewport, camera } = useThree()
  const wide = viewport.aspect > 1.05
  // Desktop: robot on the right, text on the left. Portrait: robot above the text.
  const x = wide ? Math.min(viewport.width * 0.24, 2.4) : 0
  const y = wide ? 0.05 : 1.12
  const scale = wide ? 1 : 0.46
  const anchor: [number, number] = [(x / viewport.width) * 2, (y / viewport.height) * 2]

  useFrame(() => {
    const p = Math.min(window.scrollY / window.innerHeight, 1)
    camera.position.y = -p * 0.9
    camera.position.z = 6.5 + p * 1.2
    if (group.current) group.current.rotation.z = 0
  })

  return (
    <group ref={group} position={[x, y, 0]} scale={scale}>
      <Glow light={light} />
      <RobotHead tracking reducedMotion={reducedMotion} screenAnchor={anchor} modelUrl={site.robotModelUrl} />
    </group>
  )
}

type Props = { theme: 'dark' | 'light'; reducedMotion: boolean; lowPower: boolean; onReady: () => void }

export default function HeroScene({ theme, reducedMotion, lowPower, onReady }: Props) {
  const light = theme === 'light' // the orange theme
  const bg = light ? '#ff6a00' : '#0b0b0b'
  const wrap = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  // Stop rendering entirely once the hero is scrolled away.
  useEffect(() => {
    if (!wrap.current) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.02 })
    io.observe(wrap.current)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden="true">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, lowPower ? 1.25 : 1.75]}
        camera={{ position: [0, 0, 6.5], fov: 35, near: 0.5, far: 60 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        onCreated={() => setTimeout(onReady, 60)}
      >
        <color attach="background" args={[bg]} />
        <fog attach="fog" args={[bg, 9, 28]} />
        <ambientLight intensity={0.4} />
        {/* Cool rim light from behind, soft key from the front */}
        <directionalLight color={light ? '#ffffff' : '#ff8a3d'} intensity={4} position={[-4, 3, -5]} />
        <directionalLight color={light ? '#ffffff' : '#ff8a3d'} intensity={2} position={[5, 1, -4]} />
        <directionalLight color="#ffffff" intensity={3.2} position={[1, 2.5, 6]} />
        <directionalLight color="#fff1e0" intensity={1.6} position={[-5, 0.5, 4]} />
        <StudioEnv tint={light ? '#ffffff' : '#ff6a00'} key={theme} />
        <Rig reducedMotion={reducedMotion} light={light} />
        {!reducedMotion && <Particles count={lowPower ? 220 : 520} still={false} color={light ? '#0b0b0b' : '#ffb27a'} />}
        <GridFloor major={light ? '#0b0b0b' : '#ff6a00'} minor={light ? '#7a3300' : '#4a2408'} />
        <EffectComposer multisampling={lowPower ? 0 : 4}>
          {/* Threshold sits above lit metal, so only the emissive eye and status lights bloom */}
          <Bloom mipmapBlur luminanceThreshold={2} luminanceSmoothing={0.15} intensity={1.1} radius={0.75} />
          {/* Filmic tone mapping would wash out the flat orange backdrop, so it is used on the black theme only */}
          <ToneMapping mode={light ? ToneMappingMode.LINEAR : ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
