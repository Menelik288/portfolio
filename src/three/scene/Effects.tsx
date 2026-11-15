import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

/**
 * Postprocessing, in its own chunk so the `low` tier never downloads it.
 * Filmic tone mapping would wash out the flat orange backdrop, so the orange
 * theme stays linear — the same rule the original hero used.
 */
export default function Effects({ light }: { light: boolean }) {
  return (
    <EffectComposer multisampling={0}>
      {/* Threshold sits above lit surfaces, so only emissive trim blooms */}
      <Bloom mipmapBlur luminanceThreshold={1.35} luminanceSmoothing={0.25} intensity={0.75} radius={0.65} />
      <Vignette offset={0.32} darkness={light ? 0.2 : 0.42} eskil={false} />
      <ToneMapping mode={light ? ToneMappingMode.LINEAR : ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}
