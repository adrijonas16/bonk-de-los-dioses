---
paths:
  - "src/render/**"
  - "src/world/**"
---
# Reglas para `src/render/` y `src/world/` (3D y mundo)

- three.js **r128** (API antigua: `THREE.Geometry` no existe, usa `BufferGeometry`; `skinning: true` en materiales de modelos con esqueleto).
- Objetos 3D por entidad con `objFor(entidad, 'clave', crear)`: se crean una vez y se barren solos cuando la entidad desaparece. No hagas `scene.add` sueltos que nadie limpie.
- Reutiliza geometrías (`GEO.*`) y materiales (`MB`, `ML`, cachés de `MATC`). Al cambiar de reino, `disposeWorld()` libera lo del mundo: si creas recursos del mundo, regístralos para liberarlos.
- Nada de asignar memoria por fotograma en el render (vectores temporales compartidos, como `pv`).
- Los modelos `.glb` viven en `public/assets/` y se cargan en `render/assets/loader.js`; los retratos de dioses salen de `godShot()` y se guardan en el navegador.
- El mundo usa coordenadas `x, y` en el suelo y `z` para la altura; en three.js se pasa como `(x, z, y)`.
- `WS` escala todo el mundo y `ARENA` es el radio jugable. Si cambias el tamaño, ajusta también la densidad de decorados (`AREAK`).
- Antes de subir, mira el resultado: una captura en escritorio y otra en móvil.
