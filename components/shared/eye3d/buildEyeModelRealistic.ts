import * as THREE from "three";
import { EYE_STRUCTURES } from "./eyeAnatomy";
import { createIrisTexture, createScleraTexture } from "./eyeSurfaceTextures";

export type EyeMode = "full" | "cut" | "layers";
export interface EyeModelBuildResult {
  root: THREE.Group;
  meshesById: Map<string, THREE.Object3D[]>;
  capsById: Map<string, THREE.Mesh[]>;
  markerPositions: Map<string, THREE.Vector3>;
  clippingPlane: THREE.Plane;
  highlightStructure: (id: string | null) => void;
  setMode: (mode: EyeMode, visibility: Record<string, boolean>) => void;
  setDoubleThickness: (enabled: boolean) => void;
  isPointVisible: (point: THREE.Vector3) => boolean;
  dispose: () => void;
}
type Profile = THREE.Vector2[];
const TAU = Math.PI * 2;
const v = (r: number, z: number) => new THREE.Vector2(r, z);
const RX = 11.7, CORNEA_R = 5.75;
const CORNEA_EDGE_Z = 12 - (7.77 - Math.sqrt(7.77 ** 2 - CORNEA_R ** 2));
const RZ = (CORNEA_EDGE_Z + 11.95) / (1 + Math.sqrt(1 - (CORNEA_R / RX) ** 2));
const CZ = RZ - 11.95;
const LIMBUS_THETA = Math.asin(CORNEA_R / RX);
const ORA_THETA = Math.acos((2.4 - CZ) / RZ);
const scleralThickness = (t: number) => .50 + .40 * Math.pow(t / Math.PI, 2);
const retinalThickness = (t: number) => .09 + .19 * (t - ORA_THETA) / (Math.PI - ORA_THETA);

/** Reference right eye: +Z anterior, +X nasal, +Y superior; units approximately mm.
 * Educational reconstruction, not a patient scan or optical solver. Closed profiles
 * are shared by surfaces and section faces so their boundaries cannot drift apart.
 */
export function buildEyeModel(): EyeModelBuildResult {
  const root = new THREE.Group(); root.name = "ReferenceRightEye";
  const meshesById = new Map<string, THREE.Object3D[]>();
  const capsById = new Map<string, THREE.Mesh[]>();
  const markerPositions = new Map<string, THREE.Vector3>();
  const materials = new Set<THREE.Material>();
  const capMaterials = new Set<THREE.Material>();
  const textures = [createIrisTexture(), createScleraTexture()];
  const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  let mode: EyeMode = "full", visibility: Record<string, boolean> = {};
  let highlighted: string | null = null, thicknessFactor = 1, cutting = false;
  const material = (color: string, roughness = .6) => new THREE.MeshPhysicalMaterial({
    color, roughness, metalness: 0, side: THREE.DoubleSide, clearcoat: .14, clearcoatRoughness: .35,
  });
  function register(id: string, obj: THREE.Object3D, cap = false) {
    obj.userData.structureId = id; obj.userData.isCap = cap; root.add(obj);
    if (cap) { if (!capsById.has(id)) capsById.set(id, []); capsById.get(id)!.push(obj as THREE.Mesh); }
    else { if (!meshesById.has(id)) meshesById.set(id, []); meshesById.get(id)!.push(obj); }
    obj.traverse(child => {
      if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
        child.userData.structureId = id;
        const ms = Array.isArray(child.material) ? child.material : [child.material];
        ms.forEach(m => { materials.add(m); if (cap) capMaterials.add(m); });
      }
    });
    return obj;
  }
  function lathe(profile: Profile, planar = false) {
    const ordered = THREE.ShapeUtils.isClockWise(profile) ? [...profile].reverse() : profile;
    const geo = new THREE.LatheGeometry([...ordered, ordered[0]], 128);
    geo.rotateX(Math.PI / 2);
    const p = geo.getAttribute("position"), uv = geo.getAttribute("uv");
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (planar) uv.setXY(i, .5 + x / 11.2, .5 + y / 11.2);
      else uv.setY(i, Math.atan2(Math.hypot(x, y), z - CZ) / Math.PI);
    }
    uv.needsUpdate = true; return geo;
  }
  function capGeometry(profile: Profile) {
    const geo = new THREE.ShapeGeometry(new THREE.Shape(profile));
    geo.rotateX(Math.PI / 2); return geo;
  }
  function body(id: string, profile: Profile, mat: THREE.Material, capColor: string, planar = false) {
    const mesh = new THREE.Mesh(lathe(profile, planar), mat); mesh.name = id; register(id, mesh);
    const cap = new THREE.Mesh(capGeometry(profile), material(capColor, .62));
    const mirror = cap.clone(); mirror.scale.x = -1;
    register(id, cap, true); register(id, mirror, true); return mesh;
  }
  function shellProfile(start: number, outerDepth: (t: number) => number, thick: (t: number) => number) {
    const out: Profile = [], inside: Profile = [];
    for (let i = 0; i <= 96; i++) {
      const t = start + (Math.PI - start) * i / 96, depth = outerDepth(t);
      out.push(v(Math.max(.00001, (RX - depth) * Math.sin(t)), CZ + (RZ - depth) * Math.cos(t)));
      inside.unshift(v(Math.max(.00001, (RX - depth - thick(t)) * Math.sin(t)), CZ + (RZ - depth - thick(t)) * Math.cos(t)));
    }
    return [...out, ...inside];
  }
  const scleraMat = material("#ffffff", .38);
  scleraMat.map = textures[1]; scleraMat.clearcoat = .32; scleraMat.clearcoatRoughness = .22;
  body("esclera", shellProfile(LIMBUS_THETA, () => 0, scleralThickness), scleraMat, "#e8d8c4");

  const corneaProfile: Profile = [];
  for (let i = 0; i <= 40; i++) {
    const r = CORNEA_R * (1 - i / 40);
    corneaProfile.push(v(Math.max(.00001, r), 12 - (7.77 - Math.sqrt(7.77 ** 2 - r ** 2))));
  }
  for (let i = 0; i <= 40; i++) {
    const r = 5.4 * i / 40;
    corneaProfile.push(v(Math.max(.00001, r), 11.48 - (6.4 - Math.sqrt(6.4 ** 2 - r ** 2))));
  }
  const corneaMat = new THREE.MeshPhysicalMaterial({
    color: "#ffffff", roughness: .035, metalness: 0, transmission: 1, thickness: .52, ior: 1.376,
    clearcoat: 1, clearcoatRoughness: .035, envMapIntensity: .55, side: THREE.FrontSide,
  });
  const cornea = body("cornea", corneaProfile, corneaMat, "#b5d3d6"); cornea.renderOrder = 4;
  const limbusProfile = [v(5.67, CORNEA_EDGE_Z + .08), v(5.77, CORNEA_EDGE_Z - .01), v(5.82, CORNEA_EDGE_Z - .08), v(5.72, CORNEA_EDGE_Z - .12)];
  body("limbo", limbusProfile, material("#787368", .5), "#b8ac98");

  const irisProfile: Profile = [];
  for (let i = 0; i <= 40; i++) {
    const r = 1.75 + (5.6 - 1.75) * i / 40;
    irisProfile.push(v(r, 8.25 - .75 * i / 40 + .06 * Math.exp(-Math.pow((r - 2.7) / .3, 2))));
  }
  for (let i = 40; i >= 0; i--) irisProfile.push(v(1.75 + (5.6 - 1.75) * i / 40, 8.07 - .75 * i / 40));
  const irisMat = material("#ffffff", .72);
  irisMat.map = textures[0]; irisMat.bumpMap = textures[0]; irisMat.bumpScale = .055; irisMat.clearcoat = .1;
  body("iris", irisProfile, irisMat, "#58391f", true);

  // The pupil is the real hole in the iris mesh; no black disc fills it.
  const lensProfile: Profile = [];
  for (let i = 0; i <= 80; i++) {
    const t = Math.PI * i / 80, c = Math.cos(t);
    lensProfile.push(v(Math.max(.00001, 4.6 * Math.sin(t)), 6.72 + (c >= 0 ? 1.6 : 2.4) * c));
  }
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: "#f7eacb", roughness: .12, metalness: 0, transparent: true, opacity: .12,
    depthWrite: false, side: THREE.FrontSide, clearcoat: 1,
  });
  body("cristalino", lensProfile, lensMat, "#e4cfa4");

  const ciliaryProfile: Profile = [];
  for (let i = 0; i <= 36; i++) {
    const t = .72 + (ORA_THETA - .72) * i / 36, inset = scleralThickness(t) + .02;
    ciliaryProfile.push(v((RX - inset) * Math.sin(t), CZ + (RZ - inset) * Math.cos(t)));
  }
  ciliaryProfile.push(v(10.42, 2.4), v(9.6, 3.8), v(7.8, 5.6), v(5.9, 6.6), v(5.6, 7.35));
  const ciliaryMat = material("#48251d", .56);
  body("cuerpo_ciliar", ciliaryProfile, ciliaryMat, "#6b3829");
  for (let i = 0; i < 72; i++) {
    const a = TAU * i / 72;
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(7.5 * Math.cos(a), 7.5 * Math.sin(a), 5.5),
      new THREE.Vector3(6.1 * Math.cos(a), 6.1 * Math.sin(a), 6.55),
      new THREE.Vector3(5.75 * Math.cos(a), 5.75 * Math.sin(a), 6.8),
    ]);
    register("cuerpo_ciliar", new THREE.Mesh(new THREE.TubeGeometry(path, 8, .10, 4, false), ciliaryMat));
  }
  const fiberPositions: number[] = [];
  for (let i = 0; i < 120; i++) {
    const a = i * TAU / 120;
    for (const dz of [-.36, .36]) fiberPositions.push(6.1 * Math.cos(a), 6.1 * Math.sin(a), 6.55,
      4.58 * Math.cos(a + .015), 4.58 * Math.sin(a + .015), 6.72 + dz);
  }
  const fibers = new THREE.BufferGeometry(); fibers.setAttribute("position", new THREE.Float32BufferAttribute(fiberPositions, 3));
  register("zonula", new THREE.LineSegments(fibers, new THREE.LineBasicMaterial({ color: "#ddd3b6", transparent: true, opacity: .52 })));

  const choroidMat = material("#4d211a", .63), retinaMat = material("#bb7151", .64);
  const makeChoroid = () => shellProfile(ORA_THETA, scleralThickness, () => .25 * thicknessFactor);
  const makeRetina = () => shellProfile(ORA_THETA, t => scleralThickness(t) + .25 * thicknessFactor, t => retinalThickness(t) * thicknessFactor);
  const choroid = body("coroides", makeChoroid(), choroidMat, "#6a3227");
  const retina = body("retina", makeRetina(), retinaMat, "#d5a172");
  function fundus(x: number, y: number) {
    const depth = 1.48;
    return new THREE.Vector3(x, y, CZ - (RZ - depth) * Math.sqrt(Math.max(.01, 1 - (x * x + y * y) / (RX - depth) ** 2)) + .025);
  }
  function patch(id: string, x: number, y: number, radius: number, color: string, lift = 0) {
    const pos = fundus(x, y); pos.z += lift;
    const m = new THREE.Mesh(new THREE.CircleGeometry(radius, 48), material(color, .68));
    m.position.copy(pos);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(-pos.x, -pos.y, CZ - pos.z).normalize());
    register(id, m);
  }
  patch("disco_optico", 3.4, .8, .88, "#dca57e");
  patch("disco_optico", 3.4, .8, .27, "#ead2ab", .012);
  patch("macula", -1.1, -.35, 1.25, "#a9693e");
  patch("macula", -1.1, -.35, .23, "#5e3428", .012);
  for (let k = 0; k < 12; k++) {
    const upper = k % 2 === 0 ? 1 : -1, nasal = k < 4;
    const endX = nasal ? 6.8 : -5.0 - (k % 3) * .9, endY = upper * (3.3 + (k % 3) * 1.3);
    const pts = [fundus(3.4, .8), fundus(2.5, .8 + upper * 1.3), fundus(nasal ? 5.5 : -.5, upper * 3.6), fundus(endX, endY)];
    const curve = new THREE.CatmullRomCurve3(pts);
    const vascularMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 60, k < 6 ? .055 : .035, 6, false), material(k % 3 === 0 ? "#923c35" : "#ad4a37", .7));
    vascularMesh.userData.fundusDetail = true;
    register("retina", vascularMesh);
  }
  const nervePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(3.4, .8, -10.9), new THREE.Vector3(3.65, .85, -13.1),
    new THREE.Vector3(4.3, 1.2, -16.1), new THREE.Vector3(4.15, 1.55, -19.2),
  ]);
  register("nervio_optico", new THREE.Mesh(new THREE.TubeGeometry(nervePath, 36, 1.65, 32, false), material("#d8bda0", .62)));
  const nerveEnd = new THREE.Mesh(new THREE.CircleGeometry(1.65, 40), material("#9e7d60", .8));
  nerveEnd.position.copy(nervePath.getPoint(1));
  nerveEnd.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), nervePath.getTangent(1)); register("nervio_optico", nerveEnd);

  // Clear fluid spaces receive only a subtle educational tint in internal views.
  const aqueousMat = new THREE.MeshBasicMaterial({ color: "#9bdad9", transparent: true, opacity: .05, depthWrite: false, side: THREE.DoubleSide });
  const aqueousProfile: Profile = [];
  for (let i = 0; i <= 32; i++) {
    const r = 5.3 * (1 - i / 32);
    aqueousProfile.push(v(Math.max(.001, r), 11.46 - (6.4 - Math.sqrt(6.4 ** 2 - r ** 2))));
  }
  aqueousProfile.push(v(.001, 8.35), v(1.75, 8.31), v(5.3, 7.7));
  register("camara_anterior", new THREE.Mesh(lathe(aqueousProfile), aqueousMat));
  register("camara_posterior", new THREE.Mesh(lathe([v(1.8, 8.08), v(5.5, 7.31), v(5.65, 6.8), v(4.62, 6.8), v(3.2, 7.7)]), aqueousMat.clone()));
  const vitreousProfile = shellProfile(ORA_THETA, t => scleralThickness(t) + .25 + retinalThickness(t) + .04, () => .01);
  register("vitreo", new THREE.Mesh(lathe(vitreousProfile), new THREE.MeshBasicMaterial({ color: "#9bcacb", transparent: true, opacity: .045, depthWrite: false, side: THREE.DoubleSide })));
  const markerData: Record<string, [number, number, number]> = {
    cornea: [1.5, 1.2, 11.7], esclera: [-8.9, 2.5, 6.6], limbo: [5.65, .4, CORNEA_EDGE_Z],
    iris: [2.8, -.8, 8.04], cristalino: [0, -.6, 8.15], cuerpo_ciliar: [6.2, -.65, 6.6],
    zonula: [5.15, -.35, 6.8], coroides: [-9.2, -.35, -6], retina: [-8.7, -.4, -5.8],
    disco_optico: [3.4, .15, -9.9], macula: [-1.1, -.35, -10.4], nervio_optico: [4.1, .6, -16],
    camara_anterior: [-2.2, -.5, 9.8], camara_posterior: [-4.2, -.3, 7.3], vitreo: [-1, -2, -1],
  };
  Object.entries(markerData).forEach(([id, pos]) => markerPositions.set(id, new THREE.Vector3(...pos)));
  function applyState() {
    cutting = mode === "cut" || (mode === "layers" && !!visibility._cutActive);
    materials.forEach(mat => {
      const nextPlanes = cutting && !capMaterials.has(mat) ? [clippingPlane] : [];
      if ((mat.clippingPlanes?.length || 0) !== nextPlanes.length) { mat.clippingPlanes = nextPlanes; mat.needsUpdate = true; }
      if (mat instanceof THREE.MeshStandardMaterial) { mat.emissive.set("#000000"); mat.emissiveIntensity = 0; }
    });
    const full = mode === "full";
    // Raster ambient lighting does not model cavity occlusion. Darken its EXISTING lining
    // in exterior mode, preserving a genuine pupil opening rather than adding a black disc.
    retinaMat.color.set(full ? "#100a06" : "#bb7151"); retinaMat.envMapIntensity = full ? 0 : .65;
    lensMat.opacity = full ? .065 : .48; corneaMat.envMapIntensity = full ? .55 : .25;
    EYE_STRUCTURES.forEach(s => {
      let visible = mode !== "layers" || visibility[s.layerToggleKey] !== false;
      if (["camara_anterior", "camara_posterior", "vitreo"].includes(s.id)) {
        visible = !full && visible && (s.id === highlighted || (mode === "layers" && visibility[s.layerToggleKey] === true));
        if (s.id === "vitreo" && mode === "cut") visible = s.id === highlighted;
      }
      if (full && ["macula", "disco_optico"].includes(s.id)) visible = false;
      (meshesById.get(s.id) || []).forEach(m => { m.visible = visible && !(full && m.userData.fundusDetail); });
      (capsById.get(s.id) || []).forEach(m => { m.visible = visible && cutting; });
    });
    if (highlighted) [...(meshesById.get(highlighted) || []), ...(capsById.get(highlighted) || [])].forEach(obj => obj.traverse(child => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.emissive.set("#a18b58"); child.material.emissiveIntensity = .12;
      }
    }));
  }
  function setMode(next: EyeMode, layers: Record<string, boolean>) { mode = next; visibility = layers; applyState(); }
  function highlightStructure(id: string | null) { highlighted = id; applyState(); }
  function replaceShell(id: string, mesh: THREE.Mesh, profile: Profile) {
    mesh.geometry.dispose(); mesh.geometry = lathe(profile);
    const caps = capsById.get(id)!, old = caps[0].geometry, geo = capGeometry(profile);
    caps.forEach(c => { c.geometry = geo; }); old.dispose();
  }
  const detailBaselines = new Map<THREE.Mesh, { positions: Float32Array; origin: THREE.Vector3 }>();
  ["retina", "disco_optico", "macula"].forEach(id => (meshesById.get(id) || []).forEach(obj => {
    if (obj instanceof THREE.Mesh && obj !== retina) detailBaselines.set(obj, {
      positions: new Float32Array(obj.geometry.getAttribute("position").array), origin: obj.position.clone(),
    });
  }));
  function setDoubleThickness(enabled: boolean) {
    const factor = enabled ? 2 : 1; if (factor === thicknessFactor) return;
    thicknessFactor = factor;
    replaceShell("coroides", choroid, makeChoroid()); replaceShell("retina", retina, makeRetina());
    detailBaselines.forEach((base, mesh) => {
      const p = mesh.geometry.getAttribute("position");
      if (mesh.userData.fundusDetail) {
        for (let i = 0; i < p.count; i++) {
          const point = new THREE.Vector3(base.positions[i * 3], base.positions[i * 3 + 1], base.positions[i * 3 + 2] - CZ);
          if (enabled) point.setLength(Math.max(.01, point.length() - .5));
          p.setXYZ(i, point.x, point.y, point.z + CZ);
        }
        p.needsUpdate = true; mesh.geometry.computeBoundingSphere();
      } else {
        mesh.position.copy(base.origin);
        if (enabled) mesh.position.z += .5;
      }
    });
  }
  function dispose() {
    const geometries = new Set<THREE.BufferGeometry>();
    root.traverse(obj => { if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) geometries.add(obj.geometry); });
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
    meshesById.clear(); capsById.clear(); markerPositions.clear(); root.clear();
  }
  applyState();
  return { root, meshesById, capsById, markerPositions, clippingPlane, highlightStructure, setMode, setDoubleThickness,
    isPointVisible: point => !cutting || clippingPlane.distanceToPoint(point) >= -.025, dispose };
}
