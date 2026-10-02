"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/lib/auth-context";
import { 
  ArrowLeft, 
  RotateCcw, 
  Eye, 
  Heart, 
  Layers, 
  Info, 
  Play, 
  Pause,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  Box,
  Compass,
  CheckCircle2,
  Sliders,
  Sparkles
} from "lucide-react";

export default function AnatomiaVisor3DPage() {
  const { user, addXp, updateUnitProgress } = useAuth();
  const mountRef = useRef<HTMLDivElement>(null);

  // Estados del visor
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [bpm, setBpm] = useState<number>(75);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [hasAnimation, setHasAnimation] = useState<boolean>(false);
  const [animationName, setAnimationName] = useState<string>("Heartbeat_75bpm");
  const [cameraView, setCameraView] = useState<string>("default");
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"tecnica" | "morfologia" | "orientacion">("tecnica");

  // Referencias Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionRef = useRef<THREE.AnimationAction | null>(null);
  const materialsRef = useRef<THREE.Material[]>([]);
  const modelRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const initialCameraDistanceRef = useRef<number>(0.25);

  // Carga e inicialización del modelo GLB
  const initThree = useCallback(() => {
    const container = mountRef.current;
    if (!container) return;

    setIsLoading(true);
    setLoadError(null);
    setLoadingProgress(0);

    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    // 1. Escena
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Cámara
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.001, 100);
    cameraRef.current = camera;

    // 3. Renderer con gestión de color moderna
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. OrbitControls con damping suave
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.85;
    controls.zoomSpeed = 1.0;
    controls.enablePan = true;
    controlsRef.current = controls;

    // 5. Sistema de Iluminación Equilibrado PBR
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // Luz principal cenital
    const mainDirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    mainDirLight.position.set(5, 8, 7);
    scene.add(mainDirLight);

    // Luz de relleno con suave matiz MedStudy
    const fillLight = new THREE.DirectionalLight(0xc084fc, 1.2);
    fillLight.position.set(-6, -4, -6);
    scene.add(fillLight);

    // Luz de realce trasera
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    rimLight.position.set(0, 6, -8);
    scene.add(rimLight);

    // 6. Carga con GLTFLoader desde /models/lyoh_heart.glb
    const loader = new GLTFLoader();

    loader.load(
      "/models/lyoh_heart.glb",
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        // Auto-centrado y encuadre automático por caja delimitadora
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Trasladar al origen geométrico
        model.position.x -= center.x;
        model.position.y -= center.y;
        model.position.z -= center.z;

        scene.add(model);

        // Auto-encuadre de cámara según las dimensiones reales de la malla
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        const cameraDistance = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.95;
        initialCameraDistanceRef.current = cameraDistance;

        camera.position.set(0, size.y * 0.1, cameraDistance);
        camera.lookAt(0, 0, 0);

        controls.target.set(0, 0, 0);
        // Límites de zoom seguros para no atravesar la malla ni perder el modelo
        controls.minDistance = cameraDistance * 0.35;
        controls.maxDistance = cameraDistance * 3.8;
        controls.saveState();
        controls.update();

        // Recolectar materiales para toggle de wireframe
        const mats: THREE.Material[] = [];
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (Array.isArray(mesh.material)) {
              mats.push(...mesh.material);
            } else if (mesh.material) {
              mats.push(mesh.material);
            }
          }
        });
        materialsRef.current = mats;

        // Configuración de la animación incluida en el archivo
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;

          const clip = gltf.animations[0];
          setAnimationName(clip.name);
          setHasAnimation(true);

          const action = mixer.clipAction(clip);
          action.play();
          actionRef.current = action;
          setIsPlaying(true);
        }

        setIsLoading(false);
        setLoadingProgress(100);

        // Registrar avance si el alumno aún no lo tenía acreditado (sin duplicar recompensas)
        if ((user.unitProgress["anatomia_visor-3d"] || 0) < 100) {
          addXp(15);
          updateUnitProgress("anatomia", "visor-3d", 100);
        }
      },
      (xhr) => {
        if (xhr.lengthComputable && xhr.total > 0) {
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadingProgress(pct);
        }
      },
      (error) => {
        console.error("Error al cargar /models/lyoh_heart.glb:", error);
        setIsLoading(false);
        setLoadError(
          "No fue posible cargar el modelo tridimensional. Comprueba que el archivo exista en /models/lyoh_heart.glb y reintenta."
        );
      }
    );

    // 7. Bucle de renderizado
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Redimensionamiento responsivo
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 500;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      controls.dispose();

      // Liberar recursos gráficos de forma exhaustiva
      if (sceneRef.current) {
        sceneRef.current.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const mesh = obj as THREE.Mesh;
            mesh.geometry?.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => m.dispose());
            } else if (mesh.material) {
              mesh.material.dispose();
            }
          }
        });
      }

      renderer.dispose();
    };
  }, [user.unitProgress, addXp, updateUnitProgress]);

  useEffect(() => {
    const cleanup = initThree();
    return () => {
      if (cleanup) cleanup();
    };
  }, [initThree]);

  // Modo Wireframe
  useEffect(() => {
    materialsRef.current.forEach((mat: any) => {
      if (mat) mat.wireframe = isWireframe;
    });
  }, [isWireframe]);

  // Controles de Animación: Reproducir / Pausar
  const togglePlayPause = () => {
    if (!actionRef.current) return;
    const nextState = !isPlaying;
    actionRef.current.paused = !nextState;
    setIsPlaying(nextState);
  };

  // Modulación de BPM / velocidad
  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
    if (actionRef.current) {
      // La animación base es Heartbeat_75bpm; escalar proporcionalmente
      actionRef.current.timeScale = newBpm / 75;
    }
  };

  // Restablecer vista inicial
  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    setCameraView("default");
  };

  // Perspectivas predefinidas
  const handlePerspective = (view: "anterior" | "posterior" | "apex" | "superior") => {
    setCameraView(view);
    if (!controlsRef.current || !cameraRef.current) return;

    const dist = initialCameraDistanceRef.current || 0.25;

    if (view === "anterior") {
      cameraRef.current.position.set(0, 0, dist);
    } else if (view === "posterior") {
      cameraRef.current.position.set(0, 0, -dist);
    } else if (view === "apex") {
      cameraRef.current.position.set(0, -dist * 0.9, dist * 0.4);
    } else if (view === "superior") {
      cameraRef.current.position.set(0, dist * 0.9, dist * 0.3);
    }

    cameraRef.current.lookAt(0, 0, 0);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Navegación Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/anatomia"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Anatomía</span>
        </Link>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
            WebGL 3D • Three.js 0.169
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-900 text-slate-300 text-xs font-mono border border-white/10">
            lyoh_heart.glb
          </span>
        </div>
      </div>

      {/* Grid: Visor 3D (2 cols) + Panel de Información y Ficha Técnica (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Principal: Canvas 3D */}
        <div className="lg:col-span-2 flex flex-col space-y-3">
          <GlassCard className="relative w-full h-[480px] sm:h-[560px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-gradient-to-b from-slate-950/95 via-slate-900/70 to-purple-950/50">
            
            {/* Montura Three.js */}
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing select-none" />

            {/* OVERLAY DE CARGA CON PROGRESO REAL */}
            {isLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-4 animate-pulse">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Cargando modelo anatómico</h3>
                <p className="text-xs text-slate-400 max-w-xs mb-4">
                  Descargando y compilando mallas y texturas de <code className="text-purple-300">lyoh_heart.glb</code>...
                </p>
                <div className="w-48 max-w-full">
                  <ProgressBar value={loadingProgress} color="purple" showPercent={true} />
                </div>
                <span className="text-[11px] font-mono text-slate-500 mt-2">
                  {loadingProgress > 0 ? `${loadingProgress}% transferido` : "Iniciando descarga..."}
                </span>
              </div>
            )}

            {/* OVERLAY DE ERROR CON BOTÓN DE REINTENTO */}
            {loadError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-3">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Error al cargar el modelo 3D</h3>
                <p className="text-xs text-slate-300 max-w-md mb-6 leading-relaxed">
                  {loadError}
                </p>
                <button
                  onClick={initThree}
                  className="inline-flex items-center space-x-2 py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-950/50"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reintentar carga</span>
                </button>
              </div>
            )}

            {/* CONTROLES SUPERIORES FLOTANTES SOBRE EL CANVAS */}
            {!isLoading && !loadError && (
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
                {/* Badge de animación presente */}
                <div className="pointer-events-auto flex items-center space-x-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 text-xs shadow-lg">
                  <Heart className={`w-3.5 h-3.5 text-rose-500 ${isPlaying ? "animate-pulse" : ""}`} />
                  <span className="font-bold text-white">{bpm} LPM</span>
                  <span className="text-purple-300 font-mono text-[10px] hidden sm:inline">
                    ({animationName})
                  </span>
                </div>

                {/* Acciones Rápidas */}
                <div className="pointer-events-auto flex items-center space-x-2">
                  <button
                    onClick={handleResetView}
                    title="Restablecer vista inicial de cámara"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-purple-600/30 backdrop-blur-md border border-white/10 hover:border-purple-500/40 text-xs font-semibold text-white transition-all shadow-lg active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                    <span className="hidden sm:inline">Restablecer vista</span>
                  </button>

                  <button
                    onClick={() => setShowHelp(!showHelp)}
                    title="Ayuda sobre controles de ratón y táctiles"
                    className={`p-1.5 rounded-xl backdrop-blur-md border transition-all ${
                      showHelp
                        ? "bg-purple-600 border-purple-400 text-white"
                        : "bg-slate-950/80 border-white/10 text-slate-300 hover:text-white"
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* MODAL / OVERLAY DE AYUDA DE CONTROLES */}
            {showHelp && (
              <div className="absolute top-16 right-4 z-20 w-72 p-4 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-purple-500/30 text-xs space-y-3 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-bold text-white flex items-center space-x-1.5">
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    <span>Controles de Navegación 3D</span>
                  </span>
                  <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
                </div>

                <div className="space-y-2 text-[11px] text-slate-300">
                  <div>
                    <strong className="text-purple-300 block">Ratón (Escritorio):</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-400 mt-0.5">
                      <li><strong className="text-slate-200">Clic izquierdo + arrastrar:</strong> Rotar en 360°</li>
                      <li><strong className="text-slate-200">Rueda del ratón:</strong> Acercar / Alejar (Zoom limitado)</li>
                      <li><strong className="text-slate-200">Clic derecho + arrastrar:</strong> Desplazar vista (Pan)</li>
                    </ul>
                  </div>

                  <div>
                    <strong className="text-purple-300 block">Pantalla Táctil (Móvil):</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-400 mt-0.5">
                      <li><strong className="text-slate-200">1 dedo:</strong> Rotar modelo</li>
                      <li><strong className="text-slate-200">Pellizcar con 2 dedos:</strong> Zoom</li>
                      <li><strong className="text-slate-200">Arrastrar con 2 dedos:</strong> Desplazar</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* CONTROLES INFERIORES FLOTANTES (REPRODUCCIÓN Y BPM) */}
            {!isLoading && !loadError && (
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
                {/* Control de Reproducir / Pausar y velocidad */}
                <div className="pointer-events-auto flex items-center space-x-3 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shadow-xl">
                  {hasAnimation && (
                    <button
                      onClick={togglePlayPause}
                      className="p-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer shadow-md"
                      title={isPlaying ? "Pausar animación" : "Reproducir animación"}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  )}

                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-slate-400 text-[11px] font-medium">Frecuencia:</span>
                    <input
                      type="range"
                      min="40"
                      max="150"
                      value={bpm}
                      onChange={(e) => handleBpmChange(Number(e.target.value))}
                      className="w-20 sm:w-28 accent-purple-500 cursor-pointer"
                      title={`Frecuencia de reproducción: ${bpm} LPM`}
                    />
                    <span className="font-mono text-purple-300 text-xs font-bold w-12">{bpm} LPM</span>
                  </div>
                </div>

                {/* Vistas rápidas de perspectiva */}
                <div className="pointer-events-auto flex items-center space-x-1 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-xl">
                  {(["anterior", "posterior", "apex", "superior"] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => handlePerspective(view)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold capitalize transition-all ${
                        cameraView === view
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {view}
                    </button>
                  ))}

                  <button
                    onClick={() => setIsWireframe(!isWireframe)}
                    title="Alternar modo alambre / sombreado"
                    className={`p-1.5 rounded-xl text-xs transition-colors ${
                      isWireframe ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Hint informativo discreto en escritorio */}
            <div className="absolute top-16 left-4 pointer-events-none text-[10px] text-slate-400 bg-slate-950/60 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/5 hidden sm:block">
              Auto-encuadre calibrado • Zoom limitado para evitar cortes
            </div>
          </GlassCard>

          {/* Barra inferior de pestañas descriptivas */}
          <div className="flex items-center space-x-2">
            {[
              { id: "tecnica", label: "Ficha Técnica 3D", icon: Box },
              { id: "morfologia", label: "Morfología Externa", icon: Heart },
              { id: "orientacion", label: "Orientación Clínica", icon: Compass },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-2xl border text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-purple-950/60 border-purple-500/50 text-white shadow-lg shadow-purple-950/40"
                      : "bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <TabIcon className={`w-3.5 h-3.5 ${isActive ? "text-purple-400" : "text-slate-500"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Columna Lateral: Panel de Información y Ficha Técnica */}
        <GlassCard className="p-6 flex flex-col justify-between border border-white/15 h-full">
          {activeTab === "tecnica" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
                  <Box className="w-4 h-4" />
                  <span>Especificaciones del Modelo</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                  GLB Verificado
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Estructura Geométrica</span>
                  <p className="text-white font-semibold">Malla continua única (LYOH_Heart / Object_8.001)</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    El archivo contiene una superficie anatómica orgánica integrada; no presenta división en mallas o cavidades independientes.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Materiales y Texturas</span>
                  <p className="text-white font-semibold">LYOH_Tissue & LYOH_Crystal</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Renderizados con sombreado PBR mediante MeshPhysicalMaterial (soporte nativo de capa transparente clearcoat y propiedades dieléctricas).
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Animación Integrada</span>
                  <p className="text-white font-semibold">Heartbeat_75bpm (Morph Targets)</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Animación de latido incorporada en el archivo. Se presenta como una secuencia morfológica propia del modelo; su nombre no constituye una simulación hemodinámica validada independientemente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "morfologia" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
                  <Heart className="w-4 h-4" />
                  <span>Morfología Cardíaca Externa</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  360° Rotación
                </span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-purple-300 font-semibold block">Cara Anterior (Esternocostal):</span>
                  <p className="text-slate-300 text-[11px]">
                    Formada predominantemente por el ventrículo derecho, una porción menor del ventrículo izquierdo y la orejuela derecha. Se observa la trayectoria del surco interventricular anterior.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-purple-300 font-semibold block">Cara Inferior (Diafragmática):</span>
                  <p className="text-slate-300 text-[11px]">
                    Constituida por los dos ventrículos, principalmente el izquierdo (dos tercios). Descansa sobre el centro tendinoso del diafragma.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-purple-300 font-semibold block">Base y Ápex (Vértice):</span>
                  <p className="text-slate-300 text-[11px]">
                    La base posterior corresponde principalmente a la aurícula izquierda con la entrada de las venas pulmonares. El ápex apunta hacia el quinto espacio intercostal izquierdo, línea medioclavicular.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orientacion" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                  <Compass className="w-4 h-4" />
                  <span>Orientación Espacial Clínica</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                  Anatomía Aplicada
                </span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 space-y-2">
                  <span className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Eje Anatómico Cardíaco</span>
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    El eje longitudinal del corazón se dirige de atrás hacia adelante, de derecha a izquierda y de arriba hacia abajo (aproximadamente a 45° respecto al plano horizontal).
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-indigo-300 font-semibold block">Ubicación Mediastínica:</span>
                  <p className="text-slate-300 text-[11px]">
                    Ocupa el mediastino medio, contenido dentro de la cavidad pericárdica serofibrosa y flanqueado lateralmente por las pleuras mediastínicas y los pulmones.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-indigo-300 font-semibold block">Grandes Vasos:</span>
                  <p className="text-slate-300 text-[11px]">
                    Emergencia superior del tronco de la arteria pulmonar cruzando por delante de la aorta ascendente, que describe su cayado hacia atrás y a la izquierda.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Unidad completada: Visor 3D</span>
            </span>
            <span className="font-mono text-purple-400 font-semibold">100%</span>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}