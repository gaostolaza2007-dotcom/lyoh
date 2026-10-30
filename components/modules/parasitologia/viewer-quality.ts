import type * as THREE from "three";

/** Keep the authored composition on narrow panels without changing orbit targets. */
export function configureParasiteViewport(camera: THREE.PerspectiveCamera, width: number, height: number, fitAspect = 1.15) {
  camera.aspect = width / Math.max(1, height);
  camera.zoom = Math.min(1, camera.aspect / fitAspect);
  camera.updateProjectionMatrix();
}

/** Supersample fine flagella/chaetae, bounded to avoid oversized mobile buffers. */
export function parasitePixelRatio(width: number, height: number, dpr: number) {
  const pixelBudget = 2_400_000;
  return Math.min(Math.max(1.25, dpr), 2, Math.sqrt(pixelBudget / Math.max(1, width * height)));
}

/** A fixed labelled scale must never be silently clamped to a different length. */
export function visibleScaleLength(pixels: number) {
  return Number.isFinite(pixels) && pixels >= 8 && pixels <= 180 ? Math.round(pixels) : 0;
}

/** Match triangle winding to the analytic outward normals, including joined organs.
 * Several parametric surfaces use opposite parameter orders. Correct winding is
 * essential for front/back transparency and for gl_FrontFacing in the shaders.
 */
export function orientSurfaceGeometry<T extends THREE.BufferGeometry>(geometry: T): T {
  const p = geometry.getAttribute("position"), n = geometry.getAttribute("normal"), index = geometry.index;
  if (!index || !p || !n) return geometry;
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i), b = index.getX(i + 1), c = index.getX(i + 2);
    const ux = p.getX(b)-p.getX(a), uy = p.getY(b)-p.getY(a), uz = p.getZ(b)-p.getZ(a);
    const vx = p.getX(c)-p.getX(a), vy = p.getY(c)-p.getY(a), vz = p.getZ(c)-p.getZ(a);
    const nx = n.getX(a)+n.getX(b)+n.getX(c), ny = n.getY(a)+n.getY(b)+n.getY(c), nz = n.getZ(a)+n.getZ(b)+n.getZ(c);
    if ((uy*vz-uz*vy)*nx + (uz*vx-ux*vz)*ny + (ux*vy-uy*vx)*nz < 0) {
      index.setX(i+1,c); index.setX(i+2,b);
    }
  }
  index.needsUpdate = true;
  return geometry;
}
