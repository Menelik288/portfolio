/**
 * How much scene the device gets.
 *  `high` — every body, plus postprocessing bloom.
 *  `low`  — phones and weak GPUs: fewer bodies, no shuttles, no postprocessing.
 */
export type Tier = 'high' | 'low'

export function detectTier(lowPower: boolean): Tier {
  if (typeof window === 'undefined') return 'low'
  if (lowPower) return 'low'
  if (window.innerWidth < 760) return 'low'
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') ?? c.getContext('webgl')
    if (!gl) return 'low'
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : ''
    // Software rasterisers stay on the low tier.
    if (/swiftshader|basic render|software|llvmpipe/i.test(renderer)) return 'low'
  } catch {
    return 'low'
  }
  return 'high'
}

export const tierSettings = {
  high: { dpr: [1, 1.75] as [number, number], post: true, planets: 9, shuttles: 2, stars: 1200 },
  low: { dpr: [1, 1.25] as [number, number], post: false, planets: 4, shuttles: 0, stars: 450 },
} as const
