"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MICROSCOPIC_COMPARISONS,
  MicroscopicComparison,
  MicroscopicImageSpec,
  MicroscopicMarker,
} from "@/lib/data/parasitology/microscopic-comparisons-data";
import { resolveAgentLink } from "@/lib/data/infection-hub/agents-link-registry";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  BookOpen,
  ShieldAlert,
  ChevronRight,
  Scale,
  Move,
  MapPin,
  Trash2,
  SunMedium,
  Contrast,
  CircleDot,
  Square,
  RefreshCw,
  Lightbulb,
  Compass,
  Keyboard,
} from "lucide-react";

export interface StudentObservation {
  id: string;
  index: number;
  x: number; // Porcentaje horizontal (0 - 100) respecto a la imagen original
  y: number; // Porcentaje vertical (0 - 100) respecto a la imagen original
  note: string;
}

interface ViewerTransform {
  zoom: number;
  pan: { x: number; y: number };
}

interface DigitalAdjustments {
  brightness: number; // 75 a 135 (%)
  contrast: number; // 75 a 145 (%)
}

interface SampleStageViewerProps {
  imageSpec: MicroscopicImageSpec;
  accentColor: "emerald" | "amber";
  showDifferences: boolean;
  activeVerifiedMarkerId: string | null;
  onSelectVerifiedMarker: (id: string | null) => void;
  observations: StudentObservation[];
  onAddObservation: (x: number, y: number) => void;
  onUpdateObservationNote: (id: string, note: string) => void;
  onRemoveObservation: (id: string) => void;
  onClearObservations: () => void;
}

/**
 * Calcula los límites de desplazamiento para que:
 * 1) Toda la fotografía (incluidas las esquinas bajo ventana circular) sea accesible.
 * 2) La muestra nunca pueda perderse fuera del visor.
 */
function clampPanBounds(
  panX: number,
  panY: number,
  zoom: number,
  viewportW: number,
  viewportH: number
): { x: number; y: number } {
  const safeW = viewportW > 0 ? viewportW : 320;
  const safeH = viewportH > 0 ? viewportH : 320;
  // Permite desplazar las esquinas hacia el centro incluso a 1.0x (32% del ancho),
  // más el excedente de ampliación ((zoom - 1) * 50% del ancho).
  const maxX = (zoom - 1) * (safeW / 2) + safeW * 0.32;
  const maxY = (zoom - 1) * (safeH / 2) + safeH * 0.32;
  return {
    x: Math.min(Math.max(panX, -maxX), maxX),
    y: Math.min(Math.max(panY, -maxY), maxY),
  };
}

const SampleStageViewer: React.FC<SampleStageViewerProps> = ({
  imageSpec,
  accentColor,
  showDifferences,
  activeVerifiedMarkerId,
  onSelectVerifiedMarker,
  observations,
  onAddObservation,
  onUpdateObservationNote,
  onRemoveObservation,
  onClearObservations,
}) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Estado de exploración independiente por muestra
  const [transform, setTransform] = useState<ViewerTransform>({
    zoom: 1,
    pan: { x: 0, y: 0 },
  });
  const [adjustments, setAdjustments] = useState<DigitalAdjustments>({
    brightness: 100,
    contrast: 100,
  });
  const [interactionMode, setInteractionMode] = useState<"pan" | "observe">("pan");
  const [circularField, setCircularField] = useState<boolean>(true);
  const [showAdjustmentsPanel, setShowAdjustmentsPanel] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeObsId, setActiveObsId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Cerrar vista ampliada interactiva con Escape
  useEffect(() => {
    if (!isExpanded) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isExpanded]);

  // Estado de carga y error de la imagen real
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading");
  const [retryCount, setRetryCount] = useState<number>(0);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Referencias para gestos táctiles y arrastre sin cierres obsoletos
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    moved: boolean;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    moved: false,
  });

  const pinchRef = useRef<{
    active: boolean;
    initialDistance: number;
    initialZoom: number;
    lastMidX: number;
    lastMidY: number;
  }>({
    active: false,
    initialDistance: 0,
    initialZoom: 1,
    lastMidX: 0,
    lastMidY: 0,
  });

  // Al cambiar de comparación (imageSpec.id), restablecer encuadre y ajustes digitales
  useEffect(() => {
    setTransform({ zoom: 1, pan: { x: 0, y: 0 } });
    setAdjustments({ brightness: 100, contrast: 100 });
    setInteractionMode("pan");
    setActiveObsId(null);
    setLoadState("loading");
  }, [imageSpec.id]);

  // Comprobar si la imagen ya estaba en caché del navegador al montar/cambiar
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setLoadState("loaded");
    }
  }, [imageSpec.id, retryCount]);

  /**
   * Amplía o aleja manteniendo como referencia el punto observado
   * (focalOffsetX, focalOffsetY medidos desde el centro del visor).
   */
  const applyZoomAroundPoint = useCallback(
    (targetZoomRaw: number, focalOffsetX = 0, focalOffsetY = 0) => {
      const viewport = viewportRef.current;
      const vw = viewport?.clientWidth || 320;
      const vh = viewport?.clientHeight || 320;
      const maxZoom = imageSpec.maxUsefulZoom || 2.5;

      setTransform((prev) => {
        const clampedZoom = Math.min(
          Math.max(Math.round(targetZoomRaw * 100) / 100, 1),
          maxZoom
        );
        if (clampedZoom === prev.zoom) return prev;

        const ratio = clampedZoom / prev.zoom;
        const rawPanX = focalOffsetX - (focalOffsetX - prev.pan.x) * ratio;
        const rawPanY = focalOffsetY - (focalOffsetY - prev.pan.y) * ratio;
        const clampedPan = clampPanBounds(rawPanX, rawPanY, clampedZoom, vw, vh);

        return {
          zoom: clampedZoom,
          pan: clampedPan,
        };
      });
    },
    [imageSpec.maxUsefulZoom]
  );

  const handlePanBy = useCallback((dx: number, dy: number) => {
    const viewport = viewportRef.current;
    const vw = viewport?.clientWidth || 320;
    const vh = viewport?.clientHeight || 320;
    setTransform((prev) => ({
      ...prev,
      pan: clampPanBounds(prev.pan.x + dx, prev.pan.y + dy, prev.zoom, vw, vh),
    }));
  }, []);

  const handleResetView = useCallback(() => {
    setTransform({ zoom: 1, pan: { x: 0, y: 0 } });
    setAdjustments({ brightness: 100, contrast: 100 });
  }, []);

  const handleResetAdjustments = useCallback(() => {
    setAdjustments({ brightness: 100, contrast: 100 });
  }, []);

  // Registrar observación a partir de coordenadas de pantalla (clic o toque)
  const placeObservationAtClientPoint = useCallback(
    (clientX: number, clientY: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const xPct = Math.min(
        Math.max(((clientX - rect.left) / rect.width) * 100, 2),
        98
      );
      const yPct = Math.min(
        Math.max(((clientY - rect.top) / rect.height) * 100, 2),
        98
      );
      onAddObservation(Math.round(xPct * 10) / 10, Math.round(yPct * 10) / 10);
    },
    [onAddObservation]
  );

  // Registrar observación en el punto central actualmente enfocado (accesible por teclado)
  const placeObservationAtCurrentCenter = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    placeObservationAtClientPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );
  }, [placeObservationAtClientPoint]);

  // Zoom con rueda del mouse SOLO cuando el visor tiene el foco, sin bloquear el scroll general
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const hasFocus =
        document.activeElement === el || el.contains(document.activeElement);
      if (!hasFocus) return;

      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const focalX = e.clientX - (rect.left + rect.width / 2);
      const focalY = e.clientY - (rect.top + rect.height / 2);
      const delta = e.deltaY < 0 ? 0.25 : -0.25;

      setTransform((prev) => {
        const maxZoom = imageSpec.maxUsefulZoom || 2.5;
        const clampedZoom = Math.min(
          Math.max(Math.round((prev.zoom + delta) * 100) / 100, 1),
          maxZoom
        );
        if (clampedZoom === prev.zoom) return prev;
        const ratio = clampedZoom / prev.zoom;
        const rawPanX = focalX - (focalX - prev.pan.x) * ratio;
        const rawPanY = focalY - (focalY - prev.pan.y) * ratio;
        return {
          zoom: clampedZoom,
          pan: clampPanBounds(rawPanX, rawPanY, clampedZoom, rect.width, rect.height),
        };
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [imageSpec.maxUsefulZoom]);

  // Eventos de mouse en el visor
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    viewportRef.current?.focus({ preventScroll: true });

    if (interactionMode === "observe") {
      placeObservationAtClientPoint(e.clientX, e.clientY);
      return;
    }

    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      moved: false,
    };
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || interactionMode !== "pan") return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    if (
      Math.abs(e.clientX - dragRef.current.startX) > 3 ||
      Math.abs(e.clientY - dragRef.current.startY) > 3
    ) {
      dragRef.current.moved = true;
    }
    handlePanBy(dx, dy);
  };

  const stopMouseDrag = () => {
    if (dragRef.current.active) {
      dragRef.current.active = false;
      setIsDragging(false);
    }
  };

  // Eventos táctiles (1 dedo para desplazar o marcar; 2 dedos para pellizcar/ampliar)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    viewportRef.current?.focus({ preventScroll: true });

    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;
      pinchRef.current = {
        active: true,
        initialDistance: Math.max(dist, 10),
        initialZoom: transform.zoom,
        lastMidX: midX,
        lastMidY: midY,
      };
      dragRef.current.active = false;
      setIsDragging(false);
      return;
    }

    if (e.touches.length === 1) {
      const t = e.touches[0];
      dragRef.current = {
        active: true,
        startX: t.clientX,
        startY: t.clientY,
        lastX: t.clientX,
        lastY: t.clientY,
        moved: false,
      };
      if (interactionMode === "pan") {
        setIsDragging(true);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();

    if (e.touches.length === 2 && pinchRef.current.active) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;

      const scaleFactor = dist / pinchRef.current.initialDistance;
      const targetZoom = pinchRef.current.initialZoom * scaleFactor;
      const focalX = midX - (rect.left + rect.width / 2);
      const focalY = midY - (rect.top + rect.height / 2);

      const moveDx = midX - pinchRef.current.lastMidX;
      const moveDy = midY - pinchRef.current.lastMidY;
      pinchRef.current.lastMidX = midX;
      pinchRef.current.lastMidY = midY;

      applyZoomAroundPoint(targetZoom, focalX, focalY);
      if (Math.abs(moveDx) > 0.5 || Math.abs(moveDy) > 0.5) {
        handlePanBy(moveDx, moveDy);
      }
      return;
    }

    if (e.touches.length === 1 && dragRef.current.active) {
      const t = e.touches[0];
      const dx = t.clientX - dragRef.current.lastX;
      const dy = t.clientY - dragRef.current.lastY;
      dragRef.current.lastX = t.clientX;
      dragRef.current.lastY = t.clientY;

      if (
        Math.abs(t.clientX - dragRef.current.startX) > 6 ||
        Math.abs(t.clientY - dragRef.current.startY) > 6
      ) {
        dragRef.current.moved = true;
      }

      if (interactionMode === "pan") {
        handlePanBy(dx, dy);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (pinchRef.current.active && e.touches.length < 2) {
      pinchRef.current.active = false;
    }
    if (dragRef.current.active && e.touches.length === 0) {
      const wasTap = !dragRef.current.moved;
      const tapX = dragRef.current.startX;
      const tapY = dragRef.current.startY;
      dragRef.current.active = false;
      setIsDragging(false);

      if (wasTap && interactionMode === "observe") {
        placeObservationAtClientPoint(tapX, tapY);
      }
    }
  };

  // Manejo de teclado accesible dentro del campo de observación
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = 28;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePanBy(step, 0);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handlePanBy(-step, 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      handlePanBy(0, step);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handlePanBy(0, -step);
    } else if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      applyZoomAroundPoint(transform.zoom + 0.25, 0, 0);
    } else if (e.key === "-" || e.key === "_") {
      e.preventDefault();
      applyZoomAroundPoint(transform.zoom - 0.25, 0, 0);
    } else if (e.key === "0") {
      e.preventDefault();
      handleResetView();
    }
  };

  const isEmerald = accentColor === "emerald";
  const maxZoom = imageSpec.maxUsefulZoom || 2.5;
  const isAtDefaultState =
    transform.zoom === 1 &&
    transform.pan.x === 0 &&
    transform.pan.y === 0 &&
    adjustments.brightness === 100 &&
    adjustments.contrast === 100;

  return (
    <div
      className={
        isExpanded
          ? "fixed inset-0 z-[100] bg-black/95 backdrop-blur-md p-3 sm:p-6 overflow-y-auto flex flex-col justify-center"
          : "space-y-3"
      }
      role={isExpanded ? "dialog" : undefined}
      aria-modal={isExpanded ? "true" : undefined}
      aria-label={isExpanded ? `Vista ampliada interactiva de ${imageSpec.organismName}` : undefined}
    >
      <div className={isExpanded ? "max-w-3xl w-full mx-auto space-y-3" : "space-y-3"}>
        {/* Encabezado compacto de identificación de muestra */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isEmerald ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              isEmerald ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {imageSpec.roleLabel}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
          <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
            Zoom digital: <strong>{transform.zoom.toFixed(2)}×</strong> / {maxZoom.toFixed(1)}×
          </span>
          {(adjustments.brightness !== 100 || adjustments.contrast !== 100) && (
            <span className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
              Brillo {adjustments.brightness}% · Contraste {adjustments.contrast}%
            </span>
          )}
        </div>
      </div>

      {/* Marco principal del visor microscópico */}
      <div
        className={`rounded-3xl overflow-hidden border bg-slate-950 shadow-2xl flex flex-col ${
          isEmerald ? "border-emerald-500/35" : "border-amber-500/35"
        }`}
      >
        {/* Cabecera de la platina */}
        <div
          className={`px-3.5 py-2.5 border-b flex items-center justify-between gap-2 text-xs ${
            isEmerald
              ? "bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/20"
              : "bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/20"
          }`}
        >
          <div className="min-w-0">
            <h4 className="font-bold text-white truncate">
              <span className={imageSpec.role === "parasite" ? "italic" : ""}>
                {imageSpec.organismName}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 truncate">
              {imageSpec.stageOrNature} · {imageSpec.stain}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setCircularField((prev) => !prev)}
              className="min-h-[44px] min-w-[44px] px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title={
                circularField
                  ? "Cambiar a cuadro completo sin máscara ocular"
                  : "Activar ventana circular de campo microscópico"
              }
              aria-pressed={circularField}
            >
              {circularField ? (
                <>
                  <CircleDot className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Campo ocular</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Cuadro completo</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="min-h-[44px] min-w-[44px] px-2.5 py-1.5 text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-[11px] font-medium cursor-pointer"
              title={
                isExpanded
                  ? "Cerrar vista ampliada conservando posición y observaciones"
                  : "Abrir vista ampliada interactiva conservando posición, zoom y observaciones"
              }
              aria-label={
                isExpanded
                  ? `Cerrar vista ampliada de ${imageSpec.organismName}`
                  : `Vista ampliada interactiva de ${imageSpec.organismName}`
              }
              aria-pressed={isExpanded}
            >
              {isExpanded ? (
                <>
                  <X className="w-4 h-4 text-rose-400" />
                  <span>Cerrar vista ampliada</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">Vista ampliada</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Selector de modo de interacción: Mover muestra vs Marcar observación */}
        <div className="px-3 py-2 bg-slate-900/95 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div
            className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800"
            role="group"
            aria-label={`Modo de interacción en ${imageSpec.organismName}`}
          >
            <button
              type="button"
              onClick={() => setInteractionMode("pan")}
              className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                interactionMode === "pan"
                  ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
              aria-pressed={interactionMode === "pan"}
            >
              <Move className="w-3.5 h-3.5" />
              <span>Mover muestra</span>
            </button>

            <button
              type="button"
              onClick={() => setInteractionMode("observe")}
              className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                interactionMode === "observe"
                  ? "bg-violet-500/25 text-violet-200 border border-violet-400/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
              aria-pressed={interactionMode === "observe"}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Marcar observación ({observations.length})</span>
            </button>
          </div>

          {interactionMode === "observe" && (
            <button
              type="button"
              onClick={placeObservationAtCurrentCenter}
              className="min-h-[44px] px-3 py-1.5 rounded-xl bg-violet-950/60 hover:bg-violet-900/60 border border-violet-500/40 text-violet-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Colocar una marca de observación en el centro actual del visor"
            >
              <MapPin className="w-3.5 h-3.5 text-violet-300" />
              <span>Marcar centro actual</span>
            </button>
          )}
        </div>

        {/* CAMPO DE OBSERVACIÓN INTERACTIVO (PLATINA MICROSCÓPICA) */}
        <div className="p-2 sm:p-3 bg-gradient-to-b from-slate-950 via-black to-slate-950">
          <div
            ref={viewportRef}
            tabIndex={0}
            role="application"
            aria-label={`Campo microscópico interactivo de ${imageSpec.organismName}. Usa las flechas del teclado o arrastra para desplazar la muestra; usa más y menos para cambiar el zoom digital.`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopMouseDrag}
            onMouseLeave={stopMouseDrag}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`relative w-full aspect-square min-h-[290px] sm:min-h-[340px] ${
              isExpanded ? "max-w-[600px]" : "max-w-[460px]"
            } mx-auto bg-black rounded-2xl overflow-hidden select-none touch-none transition-shadow outline-none ${
              interactionMode === "observe"
                ? "cursor-crosshair"
                : isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
            } ${
              isFocused
                ? "ring-2 ring-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.2)]"
                : "ring-1 ring-slate-800"
            }`}
          >
            {/* Estado de carga o error sin sustituir la fotografía por otra */}
            {loadState === "loading" && (
              <div className="absolute inset-0 z-30 bg-slate-950/85 flex flex-col items-center justify-center gap-2 text-xs text-slate-300 p-4 text-center">
                <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                <span>Cargando microfotografía de referencia...</span>
              </div>
            )}

            {loadState === "error" && (
              <div className="absolute inset-0 z-30 bg-slate-950/95 flex flex-col items-center justify-center gap-3 text-xs text-slate-300 p-6 text-center">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
                <p className="font-semibold text-white">
                  No se pudo cargar la microfotografía ({imageSpec.sourceFigure}).
                </p>
                <p className="text-slate-400 text-[11px]">
                  No se muestra ninguna imagen sustituta para preservar el rigor diagnóstico.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLoadState("loading");
                    setRetryCount((c) => c + 1);
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-200 font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reintentar carga</span>
                </button>
              </div>
            )}

            {/* Platina transformable: imagen + marcadores verificados + observaciones del estudiante comparten exactamente la misma matriz */}
            <div
              ref={stageRef}
              className="relative w-full h-full will-change-transform"
              style={{
                transform: `translate3d(${transform.pan.x}px, ${transform.pan.y}px, 0) scale(${transform.zoom})`,
                transformOrigin: "center center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                key={`${imageSpec.id}-${retryCount}`}
                src={imageSpec.localSrc}
                alt={imageSpec.alt}
                draggable={false}
                onLoad={() => setLoadState("loaded")}
                onError={() => setLoadState("error")}
                className="w-full h-full object-contain pointer-events-none select-none"
                style={{
                  filter: `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%)`,
                }}
              />

              {/* Capa de marcadores verificados (solo cuando Mostrar diferencias está activo) */}
              {showDifferences &&
                imageSpec.markers.map((marker) => {
                  const isActive = activeVerifiedMarkerId === marker.id;
                  return (
                    <button
                      key={marker.id}
                      type="button"
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVerifiedMarker(isActive ? null : marker.id);
                      }}
                      style={{
                        left: `${marker.x}%`,
                        top: `${marker.y}%`,
                        transform: `translate(-50%, -50%) scale(${1 / transform.zoom})`,
                      }}
                      className={`absolute min-w-[44px] min-h-[44px] w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white ${
                        isActive ? "z-30" : "z-20"
                      }`}
                      title={`Marcador verificado ${marker.number}: ${marker.title}`}
                      aria-label={`Marcador verificado ${marker.number}: ${marker.title}`}
                      aria-pressed={isActive}
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shadow-lg border-2 ${
                          isActive
                            ? "bg-white text-slate-950 border-amber-400 ring-4 ring-amber-400/60 scale-110"
                            : isEmerald
                            ? "bg-emerald-500 text-slate-950 border-white/90 hover:bg-emerald-400"
                            : "bg-amber-400 text-slate-950 border-slate-950 hover:bg-amber-300"
                        }`}
                      >
                        {marker.number}
                      </span>
                    </button>
                  );
                })}

              {/* Capa de observaciones propias del estudiante */}
              {observations.map((obs) => {
                const isSelected = activeObsId === obs.id;
                return (
                  <button
                    key={obs.id}
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveObsId(isSelected ? null : obs.id);
                    }}
                    style={{
                      left: `${obs.x}%`,
                      top: `${obs.y}%`,
                      transform: `translate(-50%, -50%) scale(${1 / transform.zoom})`,
                    }}
                    className="absolute min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center z-25 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-300"
                    title={`Tu observación O${obs.index}${obs.note ? `: ${obs.note}` : ""}`}
                    aria-label={`Tu observación O${obs.index}${
                      obs.note ? `: ${obs.note}` : " (sin nota escrita)"
                    }`}
                  >
                    <span
                      className={`px-1.5 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shadow-lg border-2 border-dashed ${
                        isSelected
                          ? "bg-violet-300 text-slate-950 border-white ring-4 ring-violet-400/50 scale-110"
                          : "bg-violet-600/95 text-white border-violet-200 hover:bg-violet-500"
                      }`}
                    >
                      O{obs.index}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Ventana circular de ocular microscópico (máscara visual no bloqueante; la muestra se desplaza por debajo para alcanzar cualquier esquina) */}
            {circularField && (
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  background:
                    "radial-gradient(circle at center, transparent 62%, rgba(2, 6, 23, 0.72) 66%, rgba(2, 6, 23, 0.94) 74%)",
                }}
              >
                <div className="absolute inset-[4%] rounded-full border border-slate-700/60 shadow-inner" />
              </div>
            )}

            {/* Indicador sutil de modo o foco en la esquina del campo */}
            <div className="absolute bottom-2 left-2 right-2 z-20 pointer-events-none flex items-center justify-between gap-2 text-[10px]">
              <span className="px-2 py-0.5 rounded bg-slate-950/85 text-slate-300 border border-slate-800/90">
                {interactionMode === "observe"
                  ? "Toca un punto para marcar tu observación"
                  : "Arrastra para mover la muestra"}
              </span>
              {isFocused && (
                <span className="px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-200 border border-cyan-500/40 hidden sm:inline-flex items-center gap-1">
                  <Keyboard className="w-3 h-3" />
                  <span>Flechas / Rueda activas</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Barra de controles de zoom digital, desplazamiento y ajustes */}
        <div className="p-3 bg-slate-900/95 border-t border-slate-800 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => applyZoomAroundPoint(transform.zoom + 0.25, 0, 0)}
                disabled={transform.zoom >= maxZoom}
                className="min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-100 transition-colors flex items-center justify-center gap-1 text-xs font-medium cursor-pointer"
                title="Acercar muestra (zoom digital)"
                aria-label={`Acercar muestra de ${imageSpec.organismName}`}
              >
                <ZoomIn className="w-4 h-4 text-cyan-400" />
                <span>Acercar</span>
              </button>

              <button
                type="button"
                onClick={() => applyZoomAroundPoint(transform.zoom - 0.25, 0, 0)}
                disabled={transform.zoom <= 1}
                className="min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-100 transition-colors flex items-center justify-center gap-1 text-xs font-medium cursor-pointer"
                title="Alejar muestra (zoom digital)"
                aria-label={`Alejar muestra de ${imageSpec.organismName}`}
              >
                <ZoomOut className="w-4 h-4 text-cyan-400" />
                <span>Alejar</span>
              </button>

              <button
                type="button"
                onClick={handleResetView}
                disabled={isAtDefaultState}
                className="min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-colors flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer"
                title="Restablecer encuadre, zoom y ajustes iniciales"
                aria-label={`Restablecer vista de ${imageSpec.organismName}`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer vista</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowAdjustmentsPanel((prev) => !prev)}
              className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                showAdjustmentsPanel ||
                adjustments.brightness !== 100 ||
                adjustments.contrast !== 100
                  ? "bg-cyan-500/15 text-cyan-200 border-cyan-500/40"
                  : "bg-slate-800/70 hover:bg-slate-800 text-slate-300 border-slate-700/70"
              }`}
              aria-expanded={showAdjustmentsPanel}
            >
              <SunMedium className="w-4 h-4 text-cyan-400" />
              <span>Brillo / Contraste</span>
            </button>
          </div>

          {transform.zoom >= maxZoom && (
            <p className="text-[11px] text-amber-300/90 bg-amber-950/30 border border-amber-500/30 rounded-xl px-3 py-1.5">
              Límite de zoom digital útil alcanzado ({maxZoom.toFixed(1)}× sobre archivo original de{" "}
              {imageSpec.originalWidthPx} × {imageSpec.originalHeightPx} px) para evitar pixelación sin información adicional.
            </p>
          )}

          {/* Panel desplegable de ajustes digitales de visualización (Brillo y Contraste) */}
          {showAdjustmentsPanel && (
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-200 text-[11px] uppercase tracking-wider">
                  Ajustes digitales de visualización
                </span>
                <button
                  type="button"
                  onClick={handleResetAdjustments}
                  disabled={
                    adjustments.brightness === 100 && adjustments.contrast === 100
                  }
                  className="min-h-[44px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-300 text-[11px] font-medium cursor-pointer"
                >
                  Restablecer ajustes (100%)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="space-y-1 block">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span className="flex items-center gap-1">
                      <SunMedium className="w-3.5 h-3.5 text-amber-400" />
                      Brillo digital
                    </span>
                    <span className="font-mono">{adjustments.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={75}
                    max={135}
                    step={5}
                    value={adjustments.brightness}
                    onChange={(e) =>
                      setAdjustments((prev) => ({
                        ...prev,
                        brightness: Number(e.target.value),
                      }))
                    }
                    className="w-full h-6 accent-cyan-400 cursor-pointer"
                    aria-label={`Brillo digital de ${imageSpec.organismName}`}
                  />
                </label>

                <label className="space-y-1 block">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span className="flex items-center gap-1">
                      <Contrast className="w-3.5 h-3.5 text-cyan-400" />
                      Contraste digital
                    </span>
                    <span className="font-mono">{adjustments.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min={75}
                    max={145}
                    step={5}
                    value={adjustments.contrast}
                    onChange={(e) =>
                      setAdjustments((prev) => ({
                        ...prev,
                        contrast: Number(e.target.value),
                      }))
                    }
                    className="w-full h-6 accent-cyan-400 cursor-pointer"
                    aria-label={`Contraste digital de ${imageSpec.organismName}`}
                  />
                </label>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Ajuste visual en pantalla sobre la fotografía original intacta. No altera los colores diagnósticos ni simula otros planos de enfoque.
              </p>
            </div>
          )}
        </div>

        {/* Lista accesible de observaciones registradas por el estudiante en esta muestra */}
        {observations.length > 0 && (
          <div className="p-3.5 bg-violet-950/20 border-t border-violet-500/30 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Tus observaciones en esta muestra ({observations.length})
              </span>
              <button
                type="button"
                onClick={onClearObservations}
                className="min-h-[44px] px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-rose-950/50 border border-slate-700 hover:border-rose-500/40 text-[11px] text-slate-300 hover:text-rose-200 transition-colors cursor-pointer"
              >
                Borrar todas
              </button>
            </div>

            <div className="space-y-2">
              {observations.map((obs) => (
                <div
                  key={obs.id}
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-violet-500/30 flex items-start gap-2 text-xs"
                >
                  <span className="px-1.5 py-0.5 rounded bg-violet-600 text-white font-bold text-[11px] shrink-0 mt-1">
                    O{obs.index}
                  </span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <input
                      type="text"
                      value={obs.note}
                      onChange={(e) =>
                        onUpdateObservationNote(obs.id, e.target.value)
                      }
                      placeholder="Escribe una nota breve sobre lo que observas en este punto..."
                      aria-label={`Nota para tu observación O${obs.index} en ${imageSpec.organismName}`}
                      className="w-full min-h-[40px] px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-violet-400"
                    />
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Posición en la fotografía: X {obs.x}% · Y {obs.y}% (marca personal de sesión)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveObservation(obs.id)}
                    className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 flex items-center justify-center shrink-0 cursor-pointer"
                    title={`Eliminar observación O${obs.index}`}
                    aria-label={`Eliminar observación O${obs.index}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ficha técnica compacta de la preparación y escala */}
        <div className="p-3.5 bg-slate-950/85 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <div className="flex justify-between gap-2">
            <span>Preparación y tinción:</span>
            <span className="text-slate-200 font-medium text-right">
              {imageSpec.preparationTechnique} · {imageSpec.stain}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Aumento óptico documentado:</span>
            <span className="text-slate-300 font-medium text-right">
              {imageSpec.magnification}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Escala calibrada:</span>
            <span className="text-amber-300/90 font-mono text-right">
              {imageSpec.scaleText}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Referencia dimensional:</span>
            <span className="text-slate-300 font-medium text-right">
              {imageSpec.documentedSize}
            </span>
          </div>
          <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-900 text-[10px] text-slate-400">
            <span>
              Fuente: {imageSpec.authorship} ({imageSpec.sourceFigure})
            </span>
            <a
              href={imageSpec.sourcePageUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-cyan-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Ver fuente CDC</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

interface MicroscopicComparatorProps {
  externalComparisonId?: string | null;
}

export const MicroscopicComparator: React.FC<MicroscopicComparatorProps> = ({
  externalComparisonId,
}) => {
  const [selectedCompId, setSelectedCompId] = useState<string>(
    MICROSCOPIC_COMPARISONS[0].id
  );
  // Descubrimiento progresivo: pistas y diferencias desactivadas al entrar
  const [showHints, setShowHints] = useState<boolean>(false);
  const [showDifferences, setShowDifferences] = useState<boolean>(false);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  // Sincronizar comparación cuando se solicita desde el Simulador de muestras
  useEffect(() => {
    if (
      externalComparisonId &&
      MICROSCOPIC_COMPARISONS.some((c) => c.id === externalComparisonId)
    ) {
      setSelectedCompId(externalComparisonId);
      setShowHints(false);
      setShowDifferences(false);
      setActiveMarkerId(null);
    }
  }, [externalComparisonId]);

  // Observaciones del estudiante conservadas durante la sesión por ID de imagen
  const [observationsByImage, setObservationsByImage] = useState<
    Record<string, StudentObservation[]>
  >({});

  const comparison =
    MICROSCOPIC_COMPARISONS.find((c) => c.id === selectedCompId) ||
    MICROSCOPIC_COMPARISONS[0];

  // Al cambiar de comparación: apagar pistas y diferencias para permitir exploración previa
  const handleSelectComparison = (id: string) => {
    setSelectedCompId(id);
    setShowHints(false);
    setShowDifferences(false);
    setActiveMarkerId(null);
  };

  // Gestión de observaciones del estudiante por imagen
  const addObservation = useCallback((imageId: string, x: number, y: number) => {
    setObservationsByImage((prev) => {
      const list = prev[imageId] || [];
      const nextIndex =
        list.length > 0 ? Math.max(...list.map((o) => o.index)) + 1 : 1;
      const newObs: StudentObservation = {
        id: `${imageId}-obs-${Date.now()}-${nextIndex}`,
        index: nextIndex,
        x,
        y,
        note: "",
      };
      return {
        ...prev,
        [imageId]: [...list, newObs],
      };
    });
  }, []);

  const updateObservationNote = useCallback(
    (imageId: string, obsId: string, note: string) => {
      setObservationsByImage((prev) => ({
        ...prev,
        [imageId]: (prev[imageId] || []).map((o) =>
          o.id === obsId ? { ...o, note } : o
        ),
      }));
    },
    []
  );

  const removeObservation = useCallback((imageId: string, obsId: string) => {
    setObservationsByImage((prev) => ({
      ...prev,
      [imageId]: (prev[imageId] || []).filter((o) => o.id !== obsId),
    }));
  }, []);

  const clearObservations = useCallback((imageId: string) => {
    setObservationsByImage((prev) => ({
      ...prev,
      [imageId]: [],
    }));
  }, []);

  const parasiteObs = observationsByImage[comparison.parasiteImage.id] || [];
  const artifactObs = observationsByImage[comparison.artifactImage.id] || [];

  return (
    <div className="space-y-6">
      {/* 1. Tarjetas compactas de selección de las tres comparaciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {MICROSCOPIC_COMPARISONS.map((comp) => {
          const isSelected = comp.id === selectedCompId;
          return (
            <button
              key={comp.id}
              onClick={() => handleSelectComparison(comp.id)}
              type="button"
              className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all min-h-[88px] justify-between cursor-pointer ${
                isSelected
                  ? "bg-cyan-950/35 border-cyan-500/60 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30"
                  : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700 text-slate-300"
              }`}
              aria-pressed={isSelected}
            >
              <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                <span className={isSelected ? "text-cyan-300 font-bold" : "text-slate-400"}>
                  {comp.shortTitle}
                </span>
                {isSelected && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-200 font-semibold">
                    En platina
                  </span>
                )}
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white leading-snug mt-1">
                {comp.title}
              </h3>
            </button>
          );
        })}
      </div>

      {/* 2. Instrucción breve visible y controles de descubrimiento progresivo */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/85 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5">
          <Compass className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5 sm:mt-0" />
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-bold text-white">
              Mueve y amplía las muestras. Busca diferencias antes de activar las pistas.
            </p>
            <p className="text-[11px] text-slate-400">
              Cada visor es independiente: desplaza, acerca o marca tus propias observaciones sin perder el encuadre.
            </p>
          </div>
        </div>

        {/* Botones separados de Descubrimiento Progresivo: Mostrar pistas y Mostrar diferencias */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowHints((prev) => !prev)}
            className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              showHints
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400"
                : "bg-slate-800 text-cyan-200 border border-cyan-500/40 hover:bg-slate-700"
            }`}
            aria-pressed={showHints}
          >
            <Lightbulb className="w-4 h-4 shrink-0" />
            <span>{showHints ? "Ocultar pistas" : "Mostrar pistas"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowDifferences((prev) => !prev);
              if (showDifferences) setActiveMarkerId(null);
            }}
            className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              showDifferences
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400"
                : "bg-slate-800 text-amber-200 border border-amber-500/40 hover:bg-slate-700"
            }`}
            aria-pressed={showDifferences}
          >
            {showDifferences ? (
              <>
                <EyeOff className="w-4 h-4 shrink-0" />
                <span>Ocultar diferencias</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 shrink-0" />
                <span>Mostrar diferencias</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Panel de Pistas de Observación (orienta sin revelar todas las respuestas ni colocar marcadores) */}
      {showHints && (
        <div className="p-4 rounded-2xl bg-cyan-950/25 border border-cyan-500/40 space-y-2.5">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Pistas de exploración guiada (observa antes de activar los marcadores)</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs text-slate-200">
            {comparison.explorationHints.map((hint, idx) => (
              <li
                key={idx}
                className="p-3 rounded-xl bg-slate-950/70 border border-cyan-500/20 leading-relaxed"
              >
                <strong className="text-cyan-400 block mb-0.5">
                  Pista {idx + 1}:
                </strong>
                {hint}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 3. DOS VISORES INTERACTIVOS INDEPENDIENTES (En paralelo en computador, apilados en celular) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <SampleStageViewer
          imageSpec={comparison.parasiteImage}
          accentColor="emerald"
          showDifferences={showDifferences}
          activeVerifiedMarkerId={activeMarkerId}
          onSelectVerifiedMarker={setActiveMarkerId}
          observations={parasiteObs}
          onAddObservation={(x, y) => addObservation(comparison.parasiteImage.id, x, y)}
          onUpdateObservationNote={(obsId, note) =>
            updateObservationNote(comparison.parasiteImage.id, obsId, note)
          }
          onRemoveObservation={(obsId) =>
            removeObservation(comparison.parasiteImage.id, obsId)
          }
          onClearObservations={() => clearObservations(comparison.parasiteImage.id)}
        />

        <SampleStageViewer
          imageSpec={comparison.artifactImage}
          accentColor="amber"
          showDifferences={showDifferences}
          activeVerifiedMarkerId={activeMarkerId}
          onSelectVerifiedMarker={setActiveMarkerId}
          observations={artifactObs}
          onAddObservation={(x, y) => addObservation(comparison.artifactImage.id, x, y)}
          onUpdateObservationNote={(obsId, note) =>
            updateObservationNote(comparison.artifactImage.id, obsId, note)
          }
          onRemoveObservation={(obsId) =>
            removeObservation(comparison.artifactImage.id, obsId)
          }
          onClearObservations={() => clearObservations(comparison.artifactImage.id)}
        />
      </div>

      {/* Aviso compacto de escala y preparación */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
        <Scale className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white font-semibold">
            Nota sobre escala y preparación:
          </strong>{" "}
          Las fotografías ajustadas al mismo tamaño de visor{" "}
          <span className="text-amber-300 font-medium">
            no representan necesariamente el mismo tamaño físico real
          </span>
          . El acercamiento del visor corresponde a <em>zoom digital</em> sobre el archivo original.
        </div>
      </div>

      {/* 4. Panel de Marcadores Verificados (solo visible cuando «Mostrar diferencias» está activo) */}
      {showDifferences && (
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Marcadores verificados y explicación de diferencias
              </h4>
            </div>
            <span className="text-xs text-slate-400">
              Distinción entre lo visible en cada fotografía (círculos 1–3) y tus marcas personales (O1, O2...)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Marcadores de la forma parasitaria */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Marcadores verificados en {comparison.parasiteImage.organismName}:
              </span>
              <div className="space-y-2">
                {comparison.parasiteImage.markers.map((m) => {
                  const isActive = activeMarkerId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setActiveMarkerId(isActive ? null : m.id)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? "bg-emerald-950/40 border-emerald-400 text-white shadow-md ring-1 ring-emerald-400/40"
                          : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {m.number}
                        </span>
                        <div className="space-y-1 text-xs">
                          <strong className="text-emerald-200 block font-semibold">
                            {m.title}
                          </strong>
                          <p className="text-slate-200 leading-relaxed">
                            <span className="text-emerald-300 font-semibold">
                              Visible en esta fotografía:
                            </span>{" "}
                            {m.descriptionPhoto}
                          </p>
                          <p className="text-slate-400 text-[11px] leading-relaxed pt-1 border-t border-slate-800/60">
                            <span className="text-slate-300 font-medium">
                              Descripción general en fuentes:
                            </span>{" "}
                            {m.descriptionGeneral}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Marcadores del elemento semejante */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Marcadores verificados en {comparison.artifactImage.organismName}:
              </span>
              <div className="space-y-2">
                {comparison.artifactImage.markers.map((m) => {
                  const isActive = activeMarkerId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setActiveMarkerId(isActive ? null : m.id)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? "bg-amber-950/40 border-amber-400 text-white shadow-md ring-1 ring-amber-400/40"
                          : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {m.number}
                        </span>
                        <div className="space-y-1 text-xs">
                          <strong className="text-amber-200 block font-semibold">
                            {m.title}
                          </strong>
                          <p className="text-slate-200 leading-relaxed">
                            <span className="text-amber-300 font-semibold">
                              Visible en esta fotografía:
                            </span>{" "}
                            {m.descriptionPhoto}
                          </p>
                          <p className="text-slate-400 text-[11px] leading-relaxed pt-1 border-t border-slate-800/60">
                            <span className="text-slate-300 font-medium">
                              Descripción general en fuentes:
                            </span>{" "}
                            {m.descriptionGeneral}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Límite del plano focal único:</strong> La ausencia de una estructura interna en un único plano de enfoque fotográfico no constituye por sí sola prueba definitiva para descartar un parásito en una muestra clínica real.
            </span>
          </div>
        </div>
      )}

      {/* 5. Secciones formativas debajo de los visores (progresivas cuando se activan diferencias o disponibles para consulta) */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Por qué pueden confundirse */}
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-bold text-white">
                1. Por qué pueden confundirse
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {comparison.confusionReason.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. En qué fijarse para diferenciarlos */}
          <div className="p-5 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-bold text-white">
                2. En qué fijarse para diferenciarlos
              </h4>
            </div>
            {showDifferences ? (
              <ul className="space-y-2 text-xs text-slate-200">
                {comparison.differentiationKeys.map((key, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{key}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/20 text-xs text-slate-300 space-y-2.5">
                <p className="leading-relaxed">
                  Los criterios diferenciales detallados están ocultos inicialmente para que explores primero las dos muestras.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDifferences(true)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Revelar criterios y marcadores</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Qué no puede concluirse con estas imágenes */}
          <div className="p-5 rounded-3xl bg-amber-950/20 border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-bold text-white">
                3. Qué no puede concluirse con estas imágenes
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-amber-100/90 leading-relaxed">
              {comparison.diagnosticLimitations.map((lim, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Fichas relacionadas en el catálogo real de LYOH */}
        {comparison.parasiteImage.catalogReferences.length > 0 && (
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <BookOpen className="w-4 h-4 shrink-0" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Fichas relacionadas en el catálogo de Microbiología LYOH:
              </h4>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {comparison.parasiteImage.catalogReferences.map((ref) => {
                const resolution = resolveAgentLink(ref.pdfId);
                const href =
                  resolution.status !== "pending" && resolution.agent
                    ? `/agentes-infecciosos/microbiologia?id=${resolution.agent.id}`
                    : `/agentes-infecciosos/microbiologia?pdfId=${ref.pdfId}`;
                const displayName = resolution.name || ref.label;

                return (
                  <Link
                    key={ref.pdfId}
                    href={href}
                    className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-cyan-950/50 border border-slate-700/80 hover:border-cyan-500/40 text-xs text-slate-200 hover:text-cyan-300 transition-colors group"
                  >
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                      {resolution.pdfId || ref.pdfId}
                    </span>
                    <span className="font-semibold italic group-hover:underline">
                      {displayName}
                    </span>
                    {ref.note && (
                      <span className="text-[11px] text-slate-400">
                        ({ref.note})
                      </span>
                    )}
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Fuentes, autoría y condiciones de reutilización (siempre disponibles) */}
        <div className="p-5 rounded-3xl bg-slate-950/85 border border-slate-800/80 text-xs text-slate-400 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800/80 pb-2">
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              4. Fuentes, créditos y condiciones de reutilización
            </span>
            <span className="text-[11px] bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800 text-slate-300">
              {comparison.reviewStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
            <div className="space-y-1">
              <strong className="text-slate-200 block">
                Forma parasitaria ({comparison.parasiteImage.sourceFigure}):
              </strong>
              <p>
                <strong>Autoría / procedencia:</strong>{" "}
                {comparison.parasiteImage.authorship}
                {comparison.parasiteImage.contributor
                  ? ` · ${comparison.parasiteImage.contributor}`
                  : ""}
              </p>
              <p>
                <strong>Condiciones:</strong>{" "}
                {comparison.parasiteImage.reuseConditions} (Comprobado:{" "}
                {comparison.parasiteImage.checkedOn}).
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href={comparison.parasiteImage.sourcePageUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
                >
                  <span>Página oficial CDC DPDx</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={comparison.parasiteImage.sourceFileUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
                >
                  <span>Archivo original</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="space-y-1">
              <strong className="text-slate-200 block">
                Elemento semejante ({comparison.artifactImage.sourceFigure}):
              </strong>
              <p>
                <strong>Autoría / procedencia:</strong>{" "}
                {comparison.artifactImage.authorship}
                {comparison.artifactImage.contributor
                  ? ` · ${comparison.artifactImage.contributor}`
                  : ""}
              </p>
              <p>
                <strong>Condiciones:</strong>{" "}
                {comparison.artifactImage.reuseConditions} (Comprobado:{" "}
                {comparison.artifactImage.checkedOn}).
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href={comparison.artifactImage.sourcePageUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
                >
                  <span>Galería de artefactos CDC DPDx</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={comparison.artifactImage.sourceFileUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
                >
                  <span>Archivo original</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                {comparison.caseReferenceUrl && (
                  <a
                    href={comparison.caseReferenceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-amber-300 hover:underline"
                  >
                    <span>Caso 169 CDC DPDx</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 leading-relaxed">
            {comparison.pedagogicalDisclaimer} El uso de materiales de CDC DPDx (disponibles sin cargo en{" "}
            <a
              href="https://www.cdc.gov/dpdx/"
              target="_blank"
              rel="noreferrer noopener"
              className="text-cyan-400 hover:underline"
            >
              cdc.gov/dpdx
            </a>
            ) no implica respaldo ni recomendación por parte de CDC, ATSDR, HHS ni del Gobierno de los Estados Unidos.
          </div>
        </div>
      </div>
    </div>
  );
};
