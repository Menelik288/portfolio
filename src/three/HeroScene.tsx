import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import Backdrop from './scene/Backdrop'
import HeroSpace from './scene/HeroSpace'
import RobotCorner from './scene/RobotCorner'
import { glb, HERO_PRELOAD } from './lib/glbPaths'
import { detectTier, tierSettings } from './lib/quality'

// Postprocessing is its own chunk, so the low tier never downloads it.
const Effects = lazy(() => import('./scene/Effects'))

for (const k of HERO_PRELOAD) useGLTF.preload(glb[k])

/** Procedural studio environment: the robot's chrome needs something to reflect. */
function StudioEnv({ tint }: { tint: string }) {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#0a0a0a']} />
      <Lightformer form="rect" intensity={5} position={[0, 5, 2]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 4, 1]} />
      <Lightformer form="rect" intensity={5} color={tint} position={[-6, 1, -2]} rotation={[0, Math.PI / 2, 0]} scale={[8, 1.2, 1]} />
      <Lightformer form="rect" intensity={4} color="#ffe2c4" position={[6, 2, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 3, 1]} />
      <Lightformer form="rect" intensity={1.5} color="#ff6a00" position={[2, -3, 4]} scale={[4, 1, 1]} />
      <Lightformer form="rect" intensity={2.6} position={[-1, 1, 8]} scale={[10, 6, 1]} />
    </Environment>
  )
}

type Props = { theme: 'dark' | 'light'; reducedMotion: boolean; lowPower: boolean; onReady: () => void }

/**
 * The hero's 3D scene, scoped to the hero section. Everything below the hero is
 * plain HTML — this canvas is decoration and stops rendering once it scrolls
 * out of view.
 */
export default function HeroScene({ theme, reducedMotion, lowPower, onReady }: Props) {
  const light = theme === 'light' // the orange theme
  const bg = light ? '#ff6a00' : '#0b0b0b'
  const tier = useMemo(() => detectTier(lowPower), [lowPower])
  const settings = tierSettings[tier]
  const [visible, setVisible] = useState(true)

  // Stop rendering entirely once the hero is scrolled away.
  useEffect(() => {
    const on = () => setVisible(window.scrollY < window.innerHeight * 1.2)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <Canvas
      frameloop={visible ? 'always' : 'never'}
      dpr={settings.dpr}
      camera={{ position: [0, 1, 9], fov: 42, near: 0.1, far: 400 }}
      gl={{ antialias: tier === 'high', powerPreference: 'high-performance', alpha: false }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        scene.background = new THREE.Color(bg)
        setTimeout(onReady, 80)
      }}
    >
      <color attach="background" args={[bg]} />
      <ambientLight intensity={light ? 0.9 : 0.22} color={light ? '#ffffff' : '#ffe0c8'} />
      <StudioEnv key={theme} tint={light ? '#ffffff' : '#ff6a00'} />
      <Backdrop stars={settings.stars} light={light} />
      <Suspense fallback={null}>
        <HeroSpace tier={tier} light={light} reducedMotion={reducedMotion} />
      </Suspense>
      <RobotCorner reducedMotion={reducedMotion} />
      {settings.post && (
        <Suspense fallback={null}>
          <Effects light={light} />
        </Suspense>
      )}
    </Canvas>
  )
}
