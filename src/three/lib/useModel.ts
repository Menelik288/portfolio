import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { glb, type GlbKey } from './glbPaths'

/**
 * Cached GLTF access. `useGLTF` keeps one parsed copy of each file in a global
 * cache, so every call site shares the same geometry and textures.
 */
export function useModel(key: GlbKey) {
  return useGLTF(glb[key])
}

/** Preload a set of models so they are parsed before the section that needs them. */
export function preload(keys: GlbKey[]) {
  for (const k of keys) useGLTF.preload(glb[k])
}

type CloneOpts = {
  /** Clone materials too, so this copy can be tinted without affecting others. */
  materials?: boolean
}

/**
 * A fresh `Object3D` copy of a cached model. Geometry and textures stay shared
 * with the cache (never disposed here — other copies still use them). Materials
 * cloned for this instance are disposed on unmount.
 */
export function useClonedModel(key: GlbKey, opts: CloneOpts = {}) {
  const { scene } = useModel(key)

  const { object, owned } = useMemo(() => {
    const object = scene.clone(true)
    const owned: THREE.Material[] = []
    object.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = false
      mesh.receiveShadow = false
      mesh.frustumCulled = true
      if (opts.materials) {
        const next = Array.isArray(mesh.material)
          ? mesh.material.map((m) => m.clone())
          : mesh.material.clone()
        mesh.material = next
        owned.push(...(Array.isArray(next) ? next : [next]))
      }
    })
    return { object, owned }
  }, [scene, opts.materials])

  useEffect(() => () => owned.forEach((m) => m.dispose()), [owned])

  return object
}

/** Centre a model on its own bounding box and scale it to `size` units on its longest axis. */
export function fitToSize(object: THREE.Object3D, size: number) {
  const box = new THREE.Box3().setFromObject(object)
  const span = box.getSize(new THREE.Vector3())
  const longest = Math.max(span.x, span.y, span.z) || 1
  const centre = box.getCenter(new THREE.Vector3())
  object.position.sub(centre)
  const s = size / longest
  object.scale.multiplyScalar(s)
  object.position.multiplyScalar(s)
  return object
}

/** Height of a model in world units, after any scaling already applied. */
export function measureHeight(object: THREE.Object3D) {
  return new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3()).y
}

/**
 * Nudge every material toward the site palette: emissive neon, slightly metallic
 * surfaces, and no washed-out highlights against a black sky.
 */
export function tuneMaterials(
  object: THREE.Object3D,
  fn: (m: THREE.MeshStandardMaterial, meshName: string) => void,
) {
  object.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const m of list) {
      if ((m as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
        fn(m as THREE.MeshStandardMaterial, mesh.name)
      }
    }
  })
}

/** Find the first descendant whose name matches, case-insensitively. */
export function findNode(object: THREE.Object3D, pattern: RegExp): THREE.Object3D | null {
  let hit: THREE.Object3D | null = null
  object.traverse((o) => {
    if (!hit && pattern.test(o.name)) hit = o
  })
  return hit
}
