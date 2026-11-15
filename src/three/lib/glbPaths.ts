/**
 * Single source of truth for the hero's GLB paths. All files are CC0 1.0 —
 * see `public/models/CREDITS.md`.
 */
const M = '/models'

export const glb = {
  // Figures
  astronaut: `${M}/astronaut.glb`,
  // Bodies
  mercury: `${M}/mercury.glb`,
  venus: `${M}/venus.glb`,
  earth: `${M}/earth.glb`,
  mars: `${M}/mars.glb`,
  jupiter: `${M}/jupiter.glb`,
  saturn: `${M}/saturn.glb`,
  uranus: `${M}/uranus.glb`,
  neptune: `${M}/neptune.glb`,
  dwarf: `${M}/dwarf.glb`,
  // Craft
  ufo: `${M}/ufo.glb`,
} as const

export type GlbKey = keyof typeof glb

/**
 * Models from the "Solar System and Astronauts" pack are museum display pieces
 * mounted on a cradle — a flat base disc ("dark") and a support ring ("steel").
 * Those two materials are hidden so only the body itself flies. Craft from the
 * other packs use the same material names for real hull parts, so they must
 * never be stripped.
 */
export const DISPLAY_MODELS: ReadonlySet<GlbKey> = new Set([
  'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'dwarf',
])

/** Fetched as soon as the hero chunk loads — the bodies nearest the camera. */
export const HERO_PRELOAD: GlbKey[] = ['astronaut', 'earth', 'mars', 'jupiter', 'saturn', 'ufo']
