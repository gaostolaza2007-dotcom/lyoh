"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildEyeModel, EyeMode, EyeModelBuildResult } from "./buildEyeModelRealistic";
import { EYE_STRUCTURES } from "./eyeAnatomy";
import { RotateCcw, ZoomIn, ZoomOut, Eye, EyeOff, Play, Pause, Hand, Scan } from "lucide-react";

export interface EyeViewer3DProps {
  mode: EyeMode;
  layersVisibility: Record<string, boolean>;
  selectedStructureId: string | null;
  onSelectStructure: (id: string | null) => void;
  showMarkers: boolean;
  onToggleMarkers: () => void;
  doubleThickness: boolean;
  resetToken?: number;
  className?: string;
}
type Marker = { id: string; name: string; x: number; y: number; px: number; py: number };
type Runtime = {
  model: EyeModelBuildResult;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  reset: (front?: boolean) => void;
  dirty: boolean;
};
const shortNames: Record<string, string> = { iris: "Iris y pupila", limbo: "Limbo", cuerpo_ciliar: "Cuerpo ciliar", zonula: "Zónula", disco_optico: "Disco óptico", macula: "Mácula", camara_anterior: "Cámara anterior", camara_posterior: "Cámara posterior", vitreo: "Vítreo", nervio_optico: "Nervio óptico", retina: "Retina" };

export const EyeViewer3D: React.FC<EyeViewer3DProps> = props => {
  const container = useRef<HTMLDivElement>(null);
  const runtime = useRef<Runtime | null>(null);
  const live = useRef(props); live.current = props;
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [autoRotate, setAutoRotate] = useState(false);
  const [touchActive, setTouchActive] = useState(false);
  const [touchMode, setTouchMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = container.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); }
    catch { setError("No se pudo iniciar el visor 3D. La lista de estructuras sigue disponible."); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.localClippingEnabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, .2, 300);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, .02);
    scene.environment = environment.texture;
    scene.environmentIntensity = .38;
    room.dispose(); pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xf7eee1, 0x353747, 1.15));
    const key = new THREE.DirectionalLight(0xfff5e9, 2.6); key.position.set(-22, 28, 38); scene.add(key);
    const fill = new THREE.DirectionalLight(0xe3edff, .9); fill.position.set(24, 8, 10); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xa4b6d8, 1.5); rim.position.set(-12, 10, -25); scene.add(rim);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = .075;
    controls.enablePan = false; controls.minDistance = 28; controls.maxDistance = 150;
    controls.autoRotateSpeed = .55;
    controls.target.set(0, 0, -1.5);
    const model = buildEyeModel(); scene.add(model.root);
    let width = host.clientWidth, height = host.clientHeight, disposed = false, frame = 0, renderDirty = true;
    const reset = (front = false) => {
      const current = live.current;
      const internal = current.mode === "cut" || (current.mode === "layers" && current.layersVisibility._cutActive);
      const direction = front ? new THREE.Vector3(0, 0, 1) : internal ? new THREE.Vector3(23, 40, 31) : new THREE.Vector3(16, 7, 48);
      const fit = 14.8 / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.min(1, camera.aspect));
      camera.position.copy(controls.target).add(direction.normalize().multiplyScalar(fit));
      controls.update(); if (runtime.current) runtime.current.dirty = true;
    };
    runtime.current = { model, controls, camera, reset, dirty: true };
    const media = window.matchMedia("(pointer: coarse), (max-width: 639px)");
    const updateTouch = () => { controls.enabled = !media.matches; renderer.domElement.style.touchAction = media.matches ? "pan-y" : "none"; setTouchMode(media.matches); setTouchActive(false); };
    media.addEventListener("change", updateTouch); updateTouch();
    const resize = () => {
      width = host.clientWidth; height = host.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height);
      reset();
    };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    const ray = new THREE.Raycaster();
    let pointerStart = { x: 0, y: 0 };
    const pointerDown = (event: PointerEvent) => { pointerStart = { x: event.clientX, y: event.clientY }; };
    function candidates(occluders = false) {
      const objects: THREE.Object3D[] = [];
      model.root.traverseVisible(obj => {
        if (!(obj instanceof THREE.Mesh)) return;
        const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
        if (occluders && ((mat.transparent && mat.opacity < .8) || (mat instanceof THREE.MeshPhysicalMaterial && mat.transmission > .5))) return;
        objects.push(obj);
      });
      return objects;
    }
    const pointerUp = (event: PointerEvent) => {
      if (!controls.enabled || Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / width * 2 - 1, -(event.clientY - rect.top) / height * 2 + 1), camera);
      const hit = ray.intersectObjects(candidates(), false).find(h => model.isPointVisible(h.point) && !["vitreo", "camara_anterior", "camara_posterior"].includes(h.object.userData.structureId));
      if (hit) live.current.onSelectStructure(hit.object.userData.structureId);
    };
    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    const contextLost = (event: Event) => { event.preventDefault(); setError("El navegador interrumpió el visor 3D. Recarga la página para volver a abrirlo."); };
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    const onChange = () => { renderDirty = true; if (runtime.current) runtime.current.dirty = true; };
    controls.addEventListener("change", onChange);
    let lastMarkers = 0;
    function projectMarkers() {
      const current = live.current;
      if (!current.showMarkers) { setMarkers([]); return; }
      const opaque = candidates(true), next: Marker[] = [];
      const structs = [...EYE_STRUCTURES].sort((a, b) => Number(b.id === current.selectedStructureId) - Number(a.id === current.selectedStructureId));
      for (const s of structs) {
        if (current.mode === "full" && !["cornea", "iris", "limbo", "esclera", "nervio_optico"].includes(s.id)) continue;
        if (!model.meshesById.get(s.id)?.some(o => o.visible)) continue;
        const pos = model.markerPositions.get(s.id)!;
        if (!model.isPointVisible(pos)) continue;
        const direction = pos.clone().sub(camera.position), distance = direction.length();
        ray.set(camera.position, direction.normalize());
        const blocked = ray.intersectObjects(opaque, false).some(h => h.distance < distance - .85 && h.object.userData.structureId !== s.id && model.isPointVisible(h.point));
        if (blocked) continue;
        const projected = pos.clone().project(camera);
        if (projected.z > 1 || projected.z < -1) continue;
        const px = (projected.x + 1) * width / 2, py = (1 - projected.y) * height / 2;
        if (px < 6 || px > width - 6 || py < 12 || py > height - 12) continue;
        const x = THREE.MathUtils.clamp(px + (px < width / 2 ? -66 : 66), 64, width - 64);
        let y = THREE.MathUtils.clamp(py - 18, 25, height - 30);
        let tries = 0;
        while (next.some(m => Math.abs(m.x - x) < 130 && Math.abs(m.y - y) < 36) && tries < 7) {
          y = THREE.MathUtils.clamp(py + (++tries % 2 ? 1 : -1) * Math.ceil(tries / 2) * 38, 25, height - 30);
        }
        if (next.some(m => Math.abs(m.x - x) < 130 && Math.abs(m.y - y) < 36)) continue;
        next.push({ id: s.id, name: shortNames[s.id] || s.name, x, y, px, py });
        if (next.length >= (width < 440 ? 4 : 8)) break;
      }
      setMarkers(next);
    }
    const animate = (time: number) => {
      if (disposed) return;
      controls.update();
      if (runtime.current?.dirty) renderDirty = true;
      if (runtime.current?.dirty && time - lastMarkers > 90) {
        projectMarkers(); runtime.current.dirty = false; lastMarkers = time;
      }
      if (renderDirty) { renderer.render(scene, camera); renderDirty = false; }
      frame = requestAnimationFrame(animate);
    };
    model.setMode(live.current.mode, live.current.layersVisibility);
    model.highlightStructure(live.current.selectedStructureId);
    model.setDoubleThickness(live.current.doubleThickness);
    frame = requestAnimationFrame(animate); setReady(true);
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); media.removeEventListener("change", updateTouch);
      renderer.domElement.removeEventListener("pointerdown", pointerDown); renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost); controls.removeEventListener("change", onChange);
      controls.dispose(); model.dispose(); environment.dispose(); renderer.dispose(); renderer.domElement.remove(); runtime.current = null;
    };
  }, []);

  useEffect(() => {
    const r = runtime.current; if (!r) return;
    r.model.setMode(props.mode, props.layersVisibility); r.model.highlightStructure(props.selectedStructureId);
    r.model.setDoubleThickness(props.doubleThickness && props.mode === "layers"); r.dirty = true;
  }, [props.mode, props.layersVisibility, props.selectedStructureId, props.doubleThickness]);
  useEffect(() => { runtime.current?.reset(); }, [props.mode, props.resetToken]);
  useEffect(() => { if (runtime.current) runtime.current.dirty = true; if (!props.showMarkers) setMarkers([]); }, [props.showMarkers]);
  useEffect(() => { if (runtime.current) runtime.current.controls.autoRotate = autoRotate; }, [autoRotate]);
  const zoom = (factor: number) => {
    const r = runtime.current; if (!r) return;
    const delta = r.camera.position.clone().sub(r.controls.target);
    delta.setLength(THREE.MathUtils.clamp(delta.length() * factor, r.controls.minDistance, r.controls.maxDistance));
    r.camera.position.copy(r.controls.target).add(delta); r.controls.update(); r.dirty = true;
  };
  const toggleTouch = () => {
    const active = !touchActive; setTouchActive(active);
    if (runtime.current) runtime.current.controls.enabled = active;
    if (container.current?.firstElementChild instanceof HTMLCanvasElement) container.current.firstElementChild.style.touchAction = active ? "none" : "pan-y";
  };
  const keyboard = (e: React.KeyboardEvent) => {
    const r = runtime.current; if (!r) return;
    if (["+", "=", "-", "r", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) e.preventDefault();
    if (e.key === "+" || e.key === "=") zoom(.88);
    else if (e.key === "-") zoom(1.14);
    else if (e.key === "r") r.reset();
    else if (e.key.startsWith("Arrow")) {
      const axis = e.key === "ArrowLeft" || e.key === "ArrowRight" ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0).applyQuaternion(r.camera.quaternion);
      const sign = e.key === "ArrowLeft" || e.key === "ArrowUp" ? 1 : -1;
      r.camera.position.sub(r.controls.target).applyAxisAngle(axis, sign * .1).add(r.controls.target); r.controls.update();
    }
  };
  const button = "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300";
  return (
    <div id="eye-model-frame" data-mode={props.mode} className={`min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[#0b101b] shadow-2xl ${props.className || ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 px-3 py-3 sm:px-4">
        <span className="text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">Ojo derecho · OD</span>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={props.onToggleMarkers} aria-pressed={props.showMarkers} aria-label={props.showMarkers ? "Ocultar marcadores" : "Mostrar marcadores"} className={`${button} ${props.showMarkers ? "!border-sky-500/30 !bg-sky-500/10 !text-sky-200" : ""}`}>
            {props.showMarkers ? <EyeOff size={16} /> : <Eye size={16} />}<span>Marcadores</span>
          </button>
          <button type="button" onClick={() => setAutoRotate(!autoRotate)} aria-pressed={autoRotate} aria-label={autoRotate ? "Pausar giro automático" : "Giro automático suave"} title="Giro automático" className={button}>{autoRotate ? <Pause size={15} /> : <Play size={15} />}</button>
          <button type="button" onClick={() => runtime.current?.reset()} aria-label="Restablecer encuadre y cámara" title="Restablecer vista" className={button}><RotateCcw size={15} /></button>
        </div>
      </div>
      <div className="relative bg-[radial-gradient(ellipse_at_48%_42%,#293241_0%,#121a27_46%,#0b101b_78%)]">
        <div ref={container} tabIndex={0} role="group" aria-label="Modelo 3D del ojo. Flechas para girar; más y menos para acercar; R para restablecer." onKeyDown={keyboard}
          className="h-[410px] w-full cursor-grab select-none outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400 sm:h-[500px] xl:h-[560px]" />
        {!ready && !error && <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">Preparando el ojo…</div>}
        {error && <div role="alert" className="absolute inset-0 flex items-center justify-center bg-slate-950/90 p-8 text-center text-sm text-slate-300">{error}</div>}
        {props.showMarkers && !error && <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">{markers.map(m => <g key={m.id}><line x1={m.px} y1={m.py} x2={m.x} y2={m.y} stroke="#a5c1d4" strokeWidth="1" opacity=".55" /><circle cx={m.px} cy={m.py} r="3" fill="#d2e9ee" /></g>)}</svg>
          {markers.map(m => <button type="button" key={m.id} onClick={() => props.onSelectStructure(m.id)} aria-label={`Seleccionar ${m.name}`} aria-pressed={props.selectedStructureId === m.id}
            style={{ left: m.x, top: m.y, transform: "translate(-50%, -50%)" }}
            className={`pointer-events-auto absolute min-h-8 max-w-[128px] rounded-lg border px-2.5 py-1.5 text-[10px] shadow-lg backdrop-blur-md ${props.selectedStructureId === m.id ? "border-sky-300/60 bg-sky-950/90 text-sky-100" : "border-white/15 bg-slate-950/85 text-slate-200"}`}>{m.name}</button>)}
        </div>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 px-3 py-3 sm:px-4">
        <button type="button" onClick={() => runtime.current?.reset(true)} className={button}><Scan size={15} />Vista frontal</button>
        <div className="flex items-center gap-1.5">
          {touchMode && <button type="button" onClick={toggleTouch} aria-pressed={touchActive} className={`${button} ${touchActive ? "!text-emerald-200 !border-emerald-500/40" : ""}`}><Hand size={15} /><span>{touchActive ? "Giro activo" : "Activar giro"}</span></button>}
          <button type="button" onClick={() => zoom(.85)} aria-label="Acercar" className={button}><ZoomIn size={17} /></button>
          <button type="button" onClick={() => zoom(1.18)} aria-label="Alejar" className={button}><ZoomOut size={17} /></button>
        </div>
      </div>
      <p className="border-t border-white/5 px-4 py-2.5 text-[10px] leading-relaxed text-slate-500">Modelo educativo · Arrastra para girar. Las estructuras internas usan contraste de color para facilitar su estudio.</p>
    </div>
  );
};
