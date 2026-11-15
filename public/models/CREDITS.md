# 3D model credits

All GLB models in this directory come from [3dassets.dev](https://3dassets.dev) and are
released under **CC0 1.0 Universal** (public domain dedication). No attribution is
legally required; the metadata below is kept for historical record.

> CC0 1.0 Universal — https://creativecommons.org/publicdomain/zero/1.0/
> Free for personal and commercial use, no attribution required.

## Hero scene

| File | Asset slug | Source |
|---|---|---|
| `astronaut.glb` | `solar-system-and-astronauts-astronaut-floating-9c4ac261` | https://cdn.3dassets.dev/assets/39246/v1/model.glb |
| `mercury.glb` | `solar-system-and-astronauts-mercury-model-ca0f1346` | https://cdn.3dassets.dev/assets/39235/v1/model.glb |
| `venus.glb` | `solar-system-and-astronauts-venus-model-b457c143` | https://cdn.3dassets.dev/assets/39233/v1/model.glb |
| `earth.glb` | `solar-system-and-astronauts-earth-model-718249b7` | https://cdn.3dassets.dev/assets/39230/v1/model.glb |
| `mars.glb` | `solar-system-and-astronauts-mars-model-9644f406` | https://cdn.3dassets.dev/assets/39232/v1/model.glb |
| `jupiter.glb` | `solar-system-and-astronauts-jupiter-model-1c5aca75` | https://cdn.3dassets.dev/assets/39231/v1/model.glb |
| `saturn.glb` | `solar-system-and-astronauts-saturn-model-49602f0d` | https://cdn.3dassets.dev/assets/39234/v1/model.glb |
| `uranus.glb` | `solar-system-and-astronauts-uranus-model-99f732c5` | https://cdn.3dassets.dev/assets/39236/v1/model.glb |
| `neptune.glb` | `solar-system-and-astronauts-neptune-model-ca6e8745` | https://cdn.3dassets.dev/assets/39241/v1/model.glb |
| `dwarf.glb` | `solar-system-and-astronauts-dwarf-planet-model-1157313e` | https://cdn.3dassets.dev/assets/39238/v1/model.glb |
| `ufo.glb` | `ufo-crash-site-and-recovery-facility-saucer-craft-gear-218bfa96` | https://cdn.3dassets.dev/assets/17325/v1/model.glb |

## Notes

- Models arrive from the 3dassets CDN already web-optimised. Total weight of this
  directory is ~2.7 MB, so no extra `gltf-transform` pass was needed. If models are
  ever added or replaced, compress with:
  `npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt --texture-compress webp`
- The previously used `GLB/Astronaut by Poly by Google` model is **CC-BY 3.0** and is no
  longer used; it was replaced with the CC0 astronaut above so the site carries no
  attribution obligation.
- The robot head in the hero's bottom-right corner is not a model file: it is built
  from `three` primitives in `src/three/RobotHead.tsx`.
- Models from the Solar System pack are display pieces on a cradle. The cradle is
  hidden at runtime by `DISPLAY_MODELS` in `src/three/lib/glbPaths.ts`; craft from the
  other packs reuse the same material names for real hull parts and are left alone.
