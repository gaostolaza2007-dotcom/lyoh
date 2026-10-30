"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  SIMULATOR_CATALOG,
  SIMULATOR_CATEGORIES,
  SIMULATOR_LIMITS,
  SIMULATOR_AMBIENT_DETRITUS,
  SimulatorCatalogElement,
  getCatalogElementById,
} from "@/lib/data/parasitology/sample-simulator-catalog";
import {
  PlacedSpecimenInstance,
  AmbientDetritusInstance,
  SimulatorStudentObservation,
  createSingleSpecimenInstance,
  generatePreparationFromCounts,
  generateAmbientDetritusLayer,
  getDefaultInitialCounts,
  countInstancesByElement,
} from "@/lib/data/parasitology/sample-simulator-engine";
import { MICROSCOPIC_COMPARISONS } from "@/lib/data/parasitology/microscopic-comparisons-data";
import {
  Plus,
  Minus,
  Trash2,
  Shuffle,
  Microscope,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Lightbulb,
  MapPin,
  Move,
  Compass,
  Info,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sun,
  CircleDot,
  Square,
  CheckCircle2,
  HelpCircle,
  X,
  Undo2,
} from "lucide-react";

interface SampleSimulatorProps {
  onOpenComparisonTab?: (comparisonId: string) => void;
}

const MIN_ZOOM = 1.0;
const MAX_ZOOM = SIMULATOR_LIMITS.MAX_USEFUL_DIGITAL_ZOOM; // 2.5x
const ZOOM_STEP = 0.25;
const STAGE_W = SIMULATOR_LIMITS.STAGE_WIDTH_PX; // 1800
const STAGE_H = SIMULATOR_LIMITS.STAGE_HEIGHT_PX; // 1350

export function SampleSimulator({ onOpenComparisonTab }: SampleSimulatorProps) {
  // Modo principal: "prepare" (A. Preparar muestra) vs "explore" (B. Explorar muestra)
  const [simulatorMode, setSimulatorMode] = useState<"prepare" | "explore">("prepare");

  // Plegado del panel de preparación en celular
  const [isMobilePrepPanelCollapsed, setIsMobilePrepPanelCollapsed] = useState<boolean>(false);

  // Semilla y contador incremental para mantener estabilidad de ejemplares
  const [distributionSeed, setDistributionSeed] = useState<number>(20261024);
  const serialRef = useRef<number>(50);

  // Estado inicial determinista
  const initialData = useMemo(() => {
    const defaultCounts = getDefaultInitialCounts();
    return generatePreparationFromCounts(defaultCounts, 20261024);
  }, []);

  const [placedInstances, setPlacedInstances] = useState<PlacedSpecimenInstance[]>(
    initialData.instances
  );
  const [ambientDetritus, setAmbientDetritus] = useState<AmbientDetritusInstance[]>(() =>
    generateAmbientDetritusLayer(20261024)
  );

  // Estado del visor microscópico (compartido entre vista normal, modo preparar, modo explorar y vista ampliada)
  const [zoom, setZoom] = useState<number>(1.0);
  // Centro observado de la preparación en coordenadas porcentuales (0-100% en X e Y)
  // Fuente de verdad única e invariante frente a cambios de modo, tamaño de visor o apertura de vista ampliada
  const [centerPct, setCenterPct] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [ocularMask, setOcularMask] = useState<boolean>(true);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [showAdjustments, setShowAdjustments] = useState<boolean>(false);
  const [isExpandedView, setIsExpandedView] = useState<boolean>(false);

  // Modo de puntero dentro del visor: "pan" (Mover preparación) vs "observe" (Marcar observación)
  const [interactionTool, setInteractionTool] = useState<"pan" | "observe">("pan");

  // Ayudas y descubrimiento progresivo en modo exploración
  const [showHints, setShowHints] = useState<boolean>(false);
  const [revealElements, setRevealElements] = useState<boolean>(false);

  // Ejemplar seleccionado para consultar descripción o comparación pertinente sin perder el encuadre
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);

  // Observaciones personales del estudiante en memoria de sesión
  const [observations, setObservations] = useState<SimulatorStudentObservation[]>([]);
  const [activeObservationId, setActiveObservationId] = useState<string | null>(null);
  const obsCounterRef = useRef<number>(1);

  // Respaldo explícito cuando una redistribución o vaciado invalida observaciones anteriores
  const [invalidatedStateBackup, setInvalidatedStateBackup] = useState<{
    reason: "redistribute" | "clear";
    previousInstances: PlacedSpecimenInstance[];
    previousObservations: SimulatorStudentObservation[];
    previousSeed: number;
  } | null>(null);

  // Referencia al contenedor activo del visor (normal o ampliado)
  const stageViewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState<{ w: number; h: number }>({
    w: 720,
    h: 520,
  });

  // Medir tamaño real del contenedor del visor para calcular escala base y límites de desplazamiento
  useEffect(() => {
    const el = stageViewportRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setViewportSize({ w: rect.width, h: rect.height });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [simulatorMode, isExpandedView, isMobilePrepPanelCollapsed]);

  // Escala base de la lámina de 1800×1350 para que el área total de la preparación sea
  // significativamente mayor que el campo visible (~2.15x el ancho del visor a zoom 1.00x)
  const baseStageScale = useMemo(() => {
    const minViewportDim = Math.max(280, Math.min(viewportSize.w, viewportSize.h));
    return (minViewportDim * 2.15) / STAGE_H;
  }, [viewportSize.w, viewportSize.h]);

  const effectiveScale = baseStageScale * zoom;

  // Transformación visual en píxeles derivada limpiamente de centerPct
  // Al cambiar el tamaño del visor o de la pantalla, el mismo punto permanece en el centro visual
  const visualPan = useMemo(() => {
    const totalScale = baseStageScale * zoom;
    const px = ((50 - centerPct.x) / 100) * STAGE_W * totalScale;
    const py = ((50 - centerPct.y) / 100) * STAGE_H * totalScale;
    return { x: px, y: py };
  }, [centerPct.x, centerPct.y, baseStageScale, zoom]);

  // Límites que garantizan recorrer el 100% de la lámina sin saltos bruscos
  const clampCenterPct = useCallback(
    (
      targetX: number,
      targetY: number,
      targetZoom: number,
      vW: number,
      vH: number
    ) => {
      const minViewportDim = Math.max(280, Math.min(vW, vH));
      const currentBaseScale = (minViewportDim * 2.15) / STAGE_H;
      const totalScale = currentBaseScale * targetZoom;
      const renderedW = STAGE_W * totalScale;
      const renderedH = STAGE_H * totalScale;
      const ocularCornerAllowanceX = vW * 0.24;
      const ocularCornerAllowanceY = vH * 0.24;
      const maxPanX = Math.max(
        80,
        (renderedW - vW) / 2 + ocularCornerAllowanceX
      );
      const maxPanY = Math.max(
        80,
        (renderedH - vH) / 2 + ocularCornerAllowanceY
      );

      const maxOffsetPctX = (maxPanX / (STAGE_W * totalScale)) * 100;
      const maxOffsetPctY = (maxPanY / (STAGE_H * totalScale)) * 100;

      const minX = Math.max(0, 50 - maxOffsetPctX);
      const maxX = Math.min(100, 50 + maxOffsetPctX);
      const minY = Math.max(0, 50 - maxOffsetPctY);
      const maxY = Math.min(100, 50 + maxOffsetPctY);

      return {
        x: Math.min(maxX, Math.max(minX, targetX)),
        y: Math.min(maxY, Math.max(minY, targetY)),
      };
    },
    []
  );

  // Mantener centerPct dentro de los límites válidos al redimensionar la ventana sin cambiar el punto observado
  useEffect(() => {
    setCenterPct((prev) =>
      clampCenterPct(prev.x, prev.y, zoom, viewportSize.w, viewportSize.h)
    );
  }, [clampCenterPct, zoom, viewportSize.w, viewportSize.h]);

  // Bloquear scroll del documento cuando la vista ampliada está abierta y permitir salir con Escape
  useEffect(() => {
    if (!isExpandedView) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpandedView(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isExpandedView]);

  // Cantidades actuales por elemento
  const countsByElement = useMemo(
    () => countInstancesByElement(placedInstances),
    [placedInstances]
  );
  const totalPlacedCount = placedInstances.length;

  // ==========================================
  // ACCIONES DE PREPARACIÓN DE LA MUESTRA
  // ==========================================

  const handleAddOne = useCallback(
    (elementId: string) => {
      const element = getCatalogElementById(elementId);
      if (!element) return;
      setPlacedInstances((prev) => {
        if (prev.length >= SIMULATOR_LIMITS.MAX_TOTAL_ELEMENTS) return prev;
        const currentOfType = prev.filter((i) => i.elementId === elementId).length;
        if (currentOfType >= element.maxCountPerElement) return prev;
        serialRef.current += 1;
        const newInst = createSingleSpecimenInstance(
          element,
          prev,
          distributionSeed,
          serialRef.current
        );
        return [...prev, newInst];
      });
    },
    [distributionSeed]
  );

  const handleDecreaseOne = useCallback((elementId: string) => {
    setPlacedInstances((prev) => {
      // Retirar únicamente el último ejemplar colocado de este tipo; conservar los demás intactos
      let lastIdx = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].elementId === elementId) {
          lastIdx = i;
          break;
        }
      }
      if (lastIdx === -1) return prev;
      const removed = prev[lastIdx];
      if (selectedInstanceId === removed.instanceId) {
        setSelectedInstanceId(null);
      }
      const next = [...prev.slice(0, lastIdx), ...prev.slice(lastIdx + 1)];
      return next;
    });
  }, [selectedInstanceId]);

  const handleRemoveType = useCallback(
    (elementId: string) => {
      setPlacedInstances((prev) => {
        const next = prev.filter((i) => i.elementId !== elementId);
        if (
          selectedInstanceId &&
          !next.some((i) => i.instanceId === selectedInstanceId)
        ) {
          setSelectedInstanceId(null);
        }
        return next;
      });
    },
    [selectedInstanceId]
  );

  const handleRedistribute = useCallback(() => {
    const nextSeed = distributionSeed + 101;
    const currentCounts = countInstancesByElement(placedInstances);
    const { instances: newInstances, nextSerial } = generatePreparationFromCounts(
      currentCounts,
      nextSeed
    );
    serialRef.current += nextSerial + 10;

    // Si existían observaciones del estudiante, gestionar explícitamente su invalidación
    if (observations.length > 0) {
      setInvalidatedStateBackup({
        reason: "redistribute",
        previousInstances: placedInstances,
        previousObservations: observations,
        previousSeed: distributionSeed,
      });
      setObservations([]);
      setActiveObservationId(null);
    } else {
      setInvalidatedStateBackup(null);
    }

    setDistributionSeed(nextSeed);
    setPlacedInstances(newInstances);
    setAmbientDetritus(generateAmbientDetritusLayer(nextSeed));
    setSelectedInstanceId(null);
  }, [distributionSeed, placedInstances, observations]);

  const handleClearSample = useCallback(() => {
    if (placedInstances.length === 0 && observations.length === 0) return;
    if (observations.length > 0) {
      setInvalidatedStateBackup({
        reason: "clear",
        previousInstances: placedInstances,
        previousObservations: observations,
        previousSeed: distributionSeed,
      });
      setObservations([]);
      setActiveObservationId(null);
    }
    setPlacedInstances([]);
    setSelectedInstanceId(null);
  }, [placedInstances, observations, distributionSeed]);

  const handleRestoreInvalidatedState = useCallback(() => {
    if (!invalidatedStateBackup) return;
    setPlacedInstances(invalidatedStateBackup.previousInstances);
    setObservations(invalidatedStateBackup.previousObservations);
    setDistributionSeed(invalidatedStateBackup.previousSeed);
    setAmbientDetritus(generateAmbientDetritusLayer(invalidatedStateBackup.previousSeed));
    setInvalidatedStateBackup(null);
  }, [invalidatedStateBackup]);

  // ==========================================
  // ZOOM, DESPLAZAMIENTO Y GESTOS DEL VISOR
  // ==========================================

  const applyZoomAroundPoint = useCallback(
    (targetZoomRaw: number, focalOffsetX = 0, focalOffsetY = 0) => {
      const nextZoom = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, Math.round(targetZoomRaw * 100) / 100)
      );
      setZoom((prevZoom) => {
        if (Math.abs(nextZoom - prevZoom) < 0.001) return prevZoom;

        setCenterPct((prevCenter) => {
          const totalScalePrev = baseStageScale * prevZoom;
          const totalScaleNext = baseStageScale * nextZoom;

          // Punto de la preparación bajo el foco antes del cambio de zoom
          const focalStagePctX =
            prevCenter.x + (focalOffsetX / (STAGE_W * totalScalePrev)) * 100;
          const focalStagePctY =
            prevCenter.y + (focalOffsetY / (STAGE_H * totalScalePrev)) * 100;

          // Nuevo centro para que el punto bajo el foco permanezca invariante
          const nextCenterX =
            focalStagePctX - (focalOffsetX / (STAGE_W * totalScaleNext)) * 100;
          const nextCenterY =
            focalStagePctY - (focalOffsetY / (STAGE_H * totalScaleNext)) * 100;

          return clampCenterPct(
            nextCenterX,
            nextCenterY,
            nextZoom,
            viewportSize.w,
            viewportSize.h
          );
        });

        return nextZoom;
      });
    },
    [baseStageScale, clampCenterPct, viewportSize.w, viewportSize.h]
  );

  const handleResetView = useCallback(() => {
    setZoom(1.0);
    setCenterPct({ x: 50, y: 50 });
    setBrightness(100);
    setContrast(100);
  }, []);

  // Centrar suavemente el visor en unas coordenadas porcentuales de la lámina (0-100)
  const centerViewOnStagePct = useCallback(
    (xPct: number, yPct: number, targetZoom?: number) => {
      const z = targetZoom ?? zoom;
      if (targetZoom !== undefined) {
        setZoom(targetZoom);
      }
      setCenterPct(
        clampCenterPct(xPct, yPct, z, viewportSize.w, viewportSize.h)
      );
    },
    [zoom, clampCenterPct, viewportSize.w, viewportSize.h]
  );

  // Colocar observación personal del estudiante en coordenadas porcentuales (0-100) de la lámina
  const addObservationAtStagePct = useCallback(
    (xPctRaw: number, yPctRaw: number) => {
      const clampedX = Math.min(98, Math.max(2, Math.round(xPctRaw * 10) / 10));
      const clampedY = Math.min(98, Math.max(2, Math.round(yPctRaw * 10) / 10));

      // Comprobar si la marca cae cerca de algún ejemplar colocado para permitir consultar ayuda si lo desea
      let closestInst: PlacedSpecimenInstance | null = null;
      let minDistPct = 6.5;
      for (const inst of placedInstances) {
        const d = Math.hypot(inst.xPct - clampedX, inst.yPct - clampedY);
        if (d < minDistPct) {
          minDistPct = d;
          closestInst = inst;
        }
      }

      const num = obsCounterRef.current++;
      const newObs: SimulatorStudentObservation = {
        id: `sim-obs-${num}-${Date.now()}`,
        label: `O${num}`,
        xPct: clampedX,
        yPct: clampedY,
        note: "",
        linkedInstanceId: closestInst ? closestInst.instanceId : null,
      };
      setObservations((prev) => [...prev, newObs]);
      setActiveObservationId(newObs.id);
      if (closestInst) {
        setSelectedInstanceId(closestInst.instanceId);
      }
    },
    [placedInstances]
  );

  // Marcar el punto actualmente situado en el centro del visor (accesible con teclado)
  const handleMarkCurrentCenter = useCallback(() => {
    addObservationAtStagePct(centerPct.x, centerPct.y);
  }, [centerPct.x, centerPct.y, addObservationAtStagePct]);

  // Seguimiento de punteros para arrastre y pinch-to-zoom con dos dedos
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const dragStartRef = useRef<{
    x: number;
    y: number;
    centerPctX: number;
    centerPctY: number;
    moved: boolean;
  } | null>(null);
  const pinchDistanceRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.currentTarget.focus();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 1) {
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        centerPctX: centerPct.x,
        centerPctY: centerPct.y,
        moved: false,
      };
      if (interactionTool === "pan") {
        setIsDragging(true);
      }
    } else if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      pinchDistanceRef.current = Math.hypot(
        pts[1].x - pts[0].x,
        pts[1].y - pts[0].y
      );
      setIsDragging(false);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2 && pinchDistanceRef.current !== null) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      if (pinchDistanceRef.current > 12) {
        const deltaScale = dist / pinchDistanceRef.current;
        if (Math.abs(deltaScale - 1) > 0.03) {
          const rect = e.currentTarget.getBoundingClientRect();
          const midX = (pts[0].x + pts[1].x) / 2 - (rect.left + rect.width / 2);
          const midY = (pts[0].y + pts[1].y) / 2 - (rect.top + rect.height / 2);
          applyZoomAroundPoint(zoom * deltaScale, midX, midY);
          pinchDistanceRef.current = dist;
        }
      }
      return;
    }

    if (pointersRef.current.size === 1 && dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      if (Math.hypot(dx, dy) > 4) {
        dragStartRef.current.moved = true;
      }
      if (interactionTool === "pan" || dragStartRef.current.moved) {
        setIsDragging(true);
        const totalScale = baseStageScale * zoom;
        const deltaPctX = -(dx / (STAGE_W * totalScale)) * 100;
        const deltaPctY = -(dy / (STAGE_H * totalScale)) * 100;
        setCenterPct(
          clampCenterPct(
            dragStartRef.current.centerPctX + deltaPctX,
            dragStartRef.current.centerPctY + deltaPctY,
            zoom,
            viewportSize.w,
            viewportSize.h
          )
        );
      }
    }
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const wasSingleTap =
      pointersRef.current.size === 1 &&
      dragStartRef.current &&
      !dragStartRef.current.moved;

    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) {
      pinchDistanceRef.current = null;
    }
    if (pointersRef.current.size === 0) {
      setIsDragging(false);
    }

    if (
      wasSingleTap &&
      interactionTool === "observe" &&
      !(e.target as HTMLElement).closest("button")
    ) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickOffsetX = e.clientX - (rect.left + rect.width / 2);
      const clickOffsetY = e.clientY - (rect.top + rect.height / 2);
      const totalScale = baseStageScale * zoom;
      const stagePctX =
        centerPct.x + (clickOffsetX / (STAGE_W * totalScale)) * 100;
      const stagePctY =
        centerPct.y + (clickOffsetY / (STAGE_H * totalScale)) * 100;
      addObservationAtStagePct(stagePctX, stagePctY);
    }

    dragStartRef.current = null;
  };

  // Rueda del mouse para hacer zoom solo cuando el visor tiene el foco activo
  useEffect(() => {
    const el = stageViewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (
        document.activeElement !== el &&
        !el.contains(document.activeElement)
      ) {
        return;
      }
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const offsetX = e.clientX - (rect.left + rect.width / 2);
      const offsetY = e.clientY - (rect.top + rect.height / 2);
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      applyZoomAroundPoint(zoom + delta, offsetX, offsetY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoom, applyZoomAroundPoint, simulatorMode, isExpandedView]);

  // Navegación por teclado dentro del visor
  const handleStageKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    const stepPx = 42;
    const totalScale = baseStageScale * zoom;
    const stepPctX = (stepPx / (STAGE_W * totalScale)) * 100;
    const stepPctY = (stepPx / (STAGE_H * totalScale)) * 100;

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setCenterPct((prev) =>
        clampCenterPct(
          prev.x - stepPctX,
          prev.y,
          zoom,
          viewportSize.w,
          viewportSize.h
        )
      );
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setCenterPct((prev) =>
        clampCenterPct(
          prev.x + stepPctX,
          prev.y,
          zoom,
          viewportSize.w,
          viewportSize.h
        )
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCenterPct((prev) =>
        clampCenterPct(
          prev.x,
          prev.y - stepPctY,
          zoom,
          viewportSize.w,
          viewportSize.h
        )
      );
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCenterPct((prev) =>
        clampCenterPct(
          prev.x,
          prev.y + stepPctY,
          zoom,
          viewportSize.w,
          viewportSize.h
        )
      );
    } else if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      applyZoomAroundPoint(zoom + ZOOM_STEP, 0, 0);
    } else if (e.key === "-" || e.key === "_") {
      e.preventDefault();
      applyZoomAroundPoint(zoom - ZOOM_STEP, 0, 0);
    } else if (e.key === "0") {
      e.preventDefault();
      handleResetView();
    }
  };

  // Cálculo del rectángulo de vista actual para el minimapa discreto (en % de la lámina 0-100)
  const minimapViewportBox = useMemo(() => {
    const totalScale = baseStageScale * zoom;
    const renderedW = Math.max(1, STAGE_W * totalScale);
    const renderedH = Math.max(1, STAGE_H * totalScale);
    const boxW = Math.min(100, Math.max(10, (viewportSize.w / renderedW) * 100));
    const boxH = Math.min(100, Math.max(10, (viewportSize.h / renderedH) * 100));
    const leftPct = Math.min(100 - boxW, Math.max(0, centerPct.x - boxW / 2));
    const topPct = Math.min(100 - boxH, Math.max(0, centerPct.y - boxH / 2));
    return {
      leftPct: Math.round(leftPct * 10) / 10,
      topPct: Math.round(topPct * 10) / 10,
      widthPct: Math.round(boxW * 10) / 10,
      heightPct: Math.round(boxH * 10) / 10,
      centerPctX: Math.min(100, Math.max(0, Math.round(centerPct.x))),
      centerPctY: Math.min(100, Math.max(0, Math.round(centerPct.y))),
    };
  }, [
    baseStageScale,
    zoom,
    viewportSize.w,
    viewportSize.h,
    centerPct.x,
    centerPct.y,
  ]);

  // Ejemplar seleccionado y su información del catálogo / comparación
  const selectedInstance = useMemo(
    () =>
      placedInstances.find((i) => i.instanceId === selectedInstanceId) || null,
    [placedInstances, selectedInstanceId]
  );
  const selectedCatalogElement = useMemo(
    () =>
      selectedInstance
        ? getCatalogElementById(selectedInstance.elementId) || null
        : null,
    [selectedInstance]
  );
  const selectedVariant = useMemo(
    () =>
      selectedInstance && selectedCatalogElement
        ? selectedCatalogElement.variants[selectedInstance.variantIndex] ||
          selectedCatalogElement.variants[0]
        : null,
    [selectedInstance, selectedCatalogElement]
  );
  const relatedComparison = useMemo(
    () =>
      selectedCatalogElement?.relatedComparisonId
        ? MICROSCOPIC_COMPARISONS.find(
            (c) => c.id === selectedCatalogElement.relatedComparisonId
          ) || null
        : null,
    [selectedCatalogElement]
  );

  // ==========================================
  // COMPONENTES DE INFORMACIÓN Y LISTA DE EJEMPLARES (REUTILIZABLES EN VISTA NORMAL Y MODAL)
  // ==========================================

  const renderIdentifiedElementsList = () => {
    if (placedInstances.length === 0) return null;
    return (
      <section
        aria-label="Elementos presentes en la preparación"
        className="bg-slate-900/90 border border-amber-500/35 rounded-2xl p-3.5 sm:p-4 space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Elementos identificados en esta preparación ({placedInstances.length})
            </h3>
          </div>
          <p className="text-[11px] text-slate-400">
            Toca un elemento para consultar su ficha. Conserva el zoom y el encuadre salvo que pulses «Centrar en visor».
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {placedInstances.map((inst, instIdx) => {
            const el = getCatalogElementById(inst.elementId);
            if (!el) return null;
            const active = selectedInstanceId === inst.instanceId;
            const instSeqNum = instIdx + 1;
            const badgeColorClass =
              el.category === "parasite-forms"
                ? "bg-emerald-600 text-white border-emerald-200"
                : el.category === "lookalikes-artifacts"
                ? "bg-amber-500 text-slate-950 border-amber-100"
                : "bg-cyan-600 text-white border-cyan-200";

            return (
              <button
                key={inst.instanceId}
                type="button"
                onClick={() => {
                  setSelectedInstanceId(inst.instanceId);
                }}
                aria-pressed={active}
                className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
                  active
                    ? "bg-amber-500/25 border-amber-400 text-amber-100 shadow-sm ring-2 ring-amber-400/60"
                    : "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 border ${badgeColorClass}`}
                >
                  #{instSeqNum}
                </span>
                <span className="font-semibold text-white">{el.name}</span>
                <span className="text-[10px] font-mono text-slate-400">
                  ({Math.round(inst.xPct)}%, {Math.round(inst.yPct)}%)
                </span>
              </button>
            );
          })}
        </div>
      </section>
    );
  };

  const renderSelectedSpecimenPanel = () => {
    if (!selectedInstance || !selectedCatalogElement || !selectedVariant) return null;
    const selectedInstIndex = placedInstances.findIndex(
      (i) => i.instanceId === selectedInstance.instanceId
    );
    const selectedSeqNum = selectedInstIndex >= 0 ? selectedInstIndex + 1 : 1;
    const badgeColorClass =
      selectedCatalogElement.category === "parasite-forms"
        ? "bg-emerald-600 text-white border-emerald-200"
        : selectedCatalogElement.category === "lookalikes-artifacts"
        ? "bg-amber-500 text-slate-950 border-amber-100"
        : "bg-cyan-600 text-white border-cyan-200";

    return (
      <section
        aria-label={`Ayuda y descripción de ${selectedCatalogElement.name}`}
        className="bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-3.5 sm:p-4 space-y-4 shadow-xl"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
              Consulta de ejemplar en la preparación (conserva tu encuadre)
            </span>
            <h3 className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 border ${badgeColorClass}`}
              >
                #{selectedSeqNum}
              </span>
              <span>{selectedCatalogElement.name}</span>
            </h3>
            <p className="text-xs text-slate-300">
              {selectedCatalogElement.stageFormLabel} ·{" "}
              <span className="text-cyan-300">{selectedVariant.label}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                centerViewOnStagePct(
                  selectedInstance.xPct,
                  selectedInstance.yPct
                )
              }
              className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Centrar en visor</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedInstanceId(null)}
              aria-label="Cerrar panel de ayuda del ejemplar"
              className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* Microfotografía original conservada intacta vs recorte no generativo */}
          <div className="md:col-span-4 bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-2">
            <p className="text-[11px] font-bold text-slate-300">
              Microfotografía original de referencia ({selectedVariant.originalWidthPx}×
              {selectedVariant.originalHeightPx} px)
            </p>
            <div className="w-full aspect-square rounded-lg overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
              <img
                src={selectedVariant.originalSrc}
                alt={`Fotografía original de ${selectedCatalogElement.name}`}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {selectedVariant.extractionNote}
            </p>
            <div className="text-[10px] text-slate-300 space-y-0.5 pt-1 border-t border-slate-800">
              <p>
                <strong className="text-slate-400">Preparación:</strong>{" "}
                {selectedVariant.preparation}
              </p>
              <p>
                <strong className="text-slate-400">Tinción:</strong>{" "}
                {selectedVariant.stain}
              </p>
              <p>
                <strong className="text-slate-400">Fuente:</strong>{" "}
                {selectedVariant.sourceInstitution} ({selectedVariant.sourceFigure})
              </p>
            </div>
          </div>

          {/* Criterios diagnósticos, límites y comparación diferencial integrada */}
          <div className="md:col-span-8 space-y-3">
            {selectedCatalogElement.stageWarning && (
              <div className="bg-amber-950/30 border border-amber-500/35 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{selectedCatalogElement.stageWarning}</span>
              </div>
            )}

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1.5">
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Qué observar para identificarlo
              </h4>
              <ul className="space-y-1 text-xs text-slate-200 list-disc list-inside">
                {selectedCatalogElement.observableCriteria.map((crit, idx) => (
                  <li key={idx}>{crit}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <strong className="text-amber-300 block mb-1">
                  Confusiones frecuentes:
                </strong>
                <p className="text-slate-300 leading-relaxed">
                  {selectedCatalogElement.commonConfusions}
                </p>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <strong className="text-cyan-300 block mb-1">
                  Límites y proporción en el simulador:
                </strong>
                <p className="text-slate-300 leading-relaxed">
                  {selectedCatalogElement.interpretationLimits}{" "}
                  {selectedCatalogElement.proportionNote}
                </p>
              </div>
            </div>

            {/* Resumen comparativo pertinente integrado sin perder el encuadre */}
            {relatedComparison && (
              <div className="bg-slate-950/90 border border-cyan-500/30 rounded-xl p-3.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                      Comparación diferencial vinculada
                    </span>
                    <h5 className="text-xs font-bold text-white">
                      {relatedComparison.title}
                    </h5>
                  </div>
                  {onOpenComparisonTab && (
                    <button
                      type="button"
                      onClick={() => onOpenComparisonTab(relatedComparison.id)}
                      className="min-h-[44px] px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Microscope className="w-3.5 h-3.5" />
                      <span>Abrir en Comparador de 2 campos</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 space-y-1">
                    <p className="font-bold text-rose-300">Por qué pueden confundirse:</p>
                    <ul className="space-y-1 text-slate-300">
                      {relatedComparison.confusionReason.slice(0, 2).map((reason, idx) => (
                        <li key={idx}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 space-y-1">
                    <p className="font-bold text-emerald-300">Claves para diferenciarlos:</p>
                    <ul className="space-y-1 text-slate-300">
                      {relatedComparison.differentiationKeys.slice(0, 2).map((keyText, idx) => (
                        <li key={idx}>• {keyText}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {selectedCatalogElement.relatedParasiteSlug && (
              <div className="flex items-center justify-end">
                <Link
                  href={`/agentes-infecciosos/parasitologia/atlas#${selectedCatalogElement.relatedParasiteSlug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-emerald-200"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Ver ficha biológica en el Atlas de Parásitos</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  // ==========================================
  // RENDERIZADO DEL VISOR INTERACTIVO REUTILIZABLE
  // ==========================================
  const renderInteractiveMicroscopeStage = (inExpandedModal: boolean) => {
    // Altura responsiva optimizada: en celular ampliado ocupa un porcentaje balanceado
    // para mantener los controles esenciales (acercar, alejar, restablecer, salir) siempre a la vista
    const heightClass = inExpandedModal
      ? "h-[42vh] min-h-[250px] max-h-[380px] sm:h-[calc(100vh-260px)] sm:min-h-[460px] sm:max-h-none"
      : simulatorMode === "explore"
      ? "min-h-[340px] sm:min-h-[480px] lg:min-h-[540px]"
      : "min-h-[300px] sm:min-h-[390px] lg:min-h-[430px]";

    return (
      <div className="flex flex-col gap-3">
        {/* Barra superior de estado e interacción de la platina */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/95 border border-slate-800 rounded-xl px-3 py-2">
          {/* Selector de herramienta: Mover preparación vs Marcar observación */}
          <div
            className="inline-flex rounded-xl bg-slate-950/90 p-1 border border-slate-800"
            role="group"
            aria-label="Herramienta de interacción en el campo microscópico"
          >
            <button
              type="button"
              onClick={() => setInteractionTool("pan")}
              aria-pressed={interactionTool === "pan"}
              className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                interactionTool === "pan"
                  ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Move className="w-3.5 h-3.5" />
              <span>Mover preparación</span>
            </button>
            <button
              type="button"
              onClick={() => setInteractionTool("observe")}
              aria-pressed={interactionTool === "observe"}
              className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                interactionTool === "observe"
                  ? "bg-fuchsia-500/25 text-fuchsia-200 border border-fuchsia-500/50"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Marcar observación ({observations.length})</span>
            </button>
          </div>

          {interactionTool === "observe" && (
            <button
              type="button"
              onClick={handleMarkCurrentCenter}
              className="min-h-[44px] px-3 py-1.5 rounded-xl bg-fuchsia-500/15 hover:bg-fuchsia-500/25 border border-fuchsia-500/40 text-fuchsia-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Marcar centro actual</span>
            </button>
          )}

          {/* Indicadores de zoom digital y máscara ocular */}
          <div className="flex flex-wrap items-center gap-1.5 ml-auto">
            <span className="text-[11px] font-mono text-slate-300 bg-slate-950/90 px-2.5 py-1.5 rounded-lg border border-slate-800">
              Zoom digital: <strong className="text-white">{zoom.toFixed(2)}×</strong> /{" "}
              {MAX_ZOOM.toFixed(1)}×
            </span>

            <button
              type="button"
              onClick={() => setOcularMask((prev) => !prev)}
              aria-pressed={ocularMask}
              aria-label={
                ocularMask
                  ? "Cambiar a marco rectangular completo"
                  : "Activar ventana circular de campo ocular"
              }
              className="min-h-[44px] px-2.5 py-1.5 rounded-xl bg-slate-950/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              {ocularMask ? (
                <>
                  <CircleDot className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Campo ocular</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Marco completo</span>
                </>
              )}
            </button>

            {/* En el modal ya existe el botón de salida en el encabezado compacto; aquí solo se muestra el botón de apertura cuando no está ampliado */}
            {!inExpandedModal && (
              <button
                type="button"
                onClick={() => setIsExpandedView(true)}
                aria-label="Abrir vista ampliada interactiva de la preparación"
                className="min-h-[44px] px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Vista ampliada</span>
              </button>
            )}
          </div>
        </div>

        {/* Lienzo interactivo del campo microscópico */}
        <div
          ref={stageViewportRef}
          role="application"
          tabIndex={0}
          aria-label={`Campo microscópico interactivo de preparación simulada con ${placedInstances.length} elementos configurados. Usa las flechas del teclado o arrastra para recorrer la lámina; pulsa más o menos para cambiar el zoom digital.`}
          onKeyDown={handleStageKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUpOrCancel}
          onPointerCancel={handlePointerUpOrCancel}
          className={`relative w-full ${heightClass} bg-[#181b1a] rounded-2xl overflow-hidden border border-slate-800 select-none touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            interactionTool === "observe"
              ? "cursor-crosshair"
              : isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
          }`}
        >
          {/* Estado de preparación vacía */}
          {placedInstances.length === 0 && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-slate-950/90 border border-amber-500/40 text-amber-200 text-xs font-medium px-3.5 py-2 rounded-xl shadow-lg pointer-events-none text-center">
              La muestra está vacía. Añade huevos, gotas de grasa o fibras desde «Preparar muestra».
            </div>
          )}

          {/* Contenedor central de la lámina de 1800 × 1350 px */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
            <div
              className="relative shrink-0 origin-center will-change-transform pointer-events-auto"
              style={{
                width: `${STAGE_W}px`,
                height: `${STAGE_H}px`,
                transform: `translate3d(${visualPan.x}px, ${visualPan.y}px, 0px) scale(${effectiveScale})`,
                transition: isDragging ? "none" : "transform 90ms ease-out",
                filter:
                  brightness !== 100 || contrast !== 100
                    ? `brightness(${brightness}%) contrast(${contrast}%)`
                    : undefined,
                background:
                  "radial-gradient(circle at 50% 48%, #e4e7df 0%, #dcded6 48%, #cfd3c9 82%, #bec3b8 100%)",
                boxShadow: "0 0 90px rgba(0, 0, 0, 0.85)",
              }}
            >
              {/* Textura óptica sutil de montaje húmedo (variaciones de refracción acuosa no diagnósticas) */}
              <div
                className="absolute inset-0 pointer-events-none opacity-45"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 18% 24%, rgba(255,255,255,0.45) 0%, transparent 26%), radial-gradient(circle at 76% 32%, rgba(165,168,150,0.22) 0%, transparent 28%), radial-gradient(circle at 34% 78%, rgba(255,255,255,0.35) 0%, transparent 25%), radial-gradient(circle at 82% 74%, rgba(155,160,142,0.2) 0%, transparent 30%)",
                }}
                aria-hidden="true"
              />

              {/* Borde discreto del cubreobjetos simulado */}
              <div
                className="absolute inset-6 border border-slate-500/25 rounded-lg pointer-events-none"
                aria-hidden="true"
              />

              {/* Capa 1: Detritus y sedimento ambiental real de montaje húmedo (contexto alrededor de los huevos) */}
              {ambientDetritus.map((det) => (
                <div
                  key={det.id}
                  style={{
                    left: `${det.xPct}%`,
                    top: `${det.yPct}%`,
                    width: `${det.widthPx}px`,
                    height: `${det.heightPx}px`,
                    transform: `translate(-50%, -50%) rotate(${det.rotationDeg}deg)`,
                    opacity: det.opacity,
                  }}
                  className="absolute pointer-events-none select-none"
                  aria-hidden="true"
                >
                  <img
                    src={det.cutoutSrc}
                    alt=""
                    draggable={false}
                    className="w-full h-full object-contain pointer-events-none select-none"
                  />
                </div>
              ))}

              {/* Capa 2: Ejemplares configurados por el usuario con marcadores compactos numerados */}
              {placedInstances.map((inst, instIdx) => {
                const element = getCatalogElementById(inst.elementId);
                if (!element) return null;
                const variant =
                  element.variants[inst.variantIndex] || element.variants[0];
                const isSelected = selectedInstanceId === inst.instanceId;
                const instSeqNum = instIdx + 1;

                const badgeColorClass =
                  element.category === "parasite-forms"
                    ? "bg-emerald-600 text-white border-emerald-200"
                    : element.category === "lookalikes-artifacts"
                    ? "bg-amber-500 text-slate-950 border-amber-100"
                    : "bg-cyan-600 text-white border-cyan-200";

                const ringColorClass =
                  element.category === "parasite-forms"
                    ? "ring-emerald-400"
                    : element.category === "lookalikes-artifacts"
                    ? "ring-amber-400"
                    : "ring-cyan-400";

                return (
                  <div
                    key={inst.instanceId}
                    style={{
                      left: `${inst.xPct}%`,
                      top: `${inst.yPct}%`,
                      width: `${inst.widthPx}px`,
                      height: `${inst.heightPx}px`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                  >
                    {/* Botón interactivo sobre el ejemplar para seleccionar sin desplazar la cámara */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (interactionTool === "observe") {
                          addObservationAtStagePct(inst.xPct, inst.yPct);
                        } else {
                          setSelectedInstanceId((prev) =>
                            prev === inst.instanceId ? null : inst.instanceId
                          );
                        }
                      }}
                      aria-label={
                        revealElements || simulatorMode === "prepare"
                          ? `Ejemplar #${instSeqNum}: ${element.name}. Seleccionar para consultar detalles.`
                          : `Elemento microscópico en (${Math.round(
                              inst.xPct
                            )}%, ${Math.round(
                              inst.yPct
                            )}%). Seleccionar para ayuda.`
                      }
                      className={`group relative w-full h-full flex items-center justify-center rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400 transition-all ${
                        isSelected
                          ? `ring-4 ${ringColorClass} ring-offset-2 ring-offset-slate-900 bg-white/10 shadow-2xl scale-105 z-20`
                          : revealElements
                          ? `ring-2 ${ringColorClass}/70`
                          : "hover:ring-2 hover:ring-slate-600/40"
                      }`}
                    >
                      <img
                        src={variant.cutoutSrc}
                        alt={
                          revealElements
                            ? `${element.name} ejemplar #${instSeqNum}`
                            : "Elemento de la preparación microscópica"
                        }
                        draggable={false}
                        className="w-full h-full object-contain pointer-events-none select-none"
                        style={{
                          transform: `rotate(${inst.rotationDeg}deg)`,
                        }}
                      />
                    </button>

                    {/* Marcador compacto circular numerado (#1, #2...): no invade la estructura observada */}
                    {(revealElements || isSelected) && (
                      <div
                        style={{
                          transform: `scale(${1 / effectiveScale})`,
                          transformOrigin: "top right",
                        }}
                        className="absolute -top-2.5 -right-2.5 z-20 pointer-events-auto"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInstanceId(inst.instanceId);
                          }}
                          aria-label={`Ejemplar #${instSeqNum}: ${element.name}`}
                          className={`min-w-[26px] min-h-[26px] px-1 rounded-full flex items-center justify-center font-black text-[11px] shadow-lg border-2 cursor-pointer transition-transform ${badgeColorClass} ${
                            isSelected
                              ? "ring-4 ring-white shadow-2xl scale-125 z-30"
                              : "hover:scale-110"
                          }`}
                        >
                          <span>#{instSeqNum}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Capa 3: Marcas de observación personales del estudiante (O1, O2...) */}
              {observations.map((obs) => {
                const isSelectedObs = activeObservationId === obs.id;
                return (
                  <button
                    key={obs.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveObservationId(obs.id);
                      if (obs.linkedInstanceId) {
                        setSelectedInstanceId(obs.linkedInstanceId);
                      }
                    }}
                    style={{
                      left: `${obs.xPct}%`,
                      top: `${obs.yPct}%`,
                      transform: `translate(-50%, -50%) scale(${
                        1 / effectiveScale
                      })`,
                    }}
                    aria-label={`Tu observación ${obs.label}${
                      obs.note ? `: ${obs.note}` : ""
                    }`}
                    className={`
                      absolute z-30 min-w-[34px] min-h-[34px] px-1.5 rounded-lg flex items-center justify-center
                      font-extrabold text-[11px] transition-shadow cursor-pointer shadow-lg border-2 border-dashed
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
                      bg-fuchsia-600/95 text-white border-fuchsia-200
                      ${
                        isSelectedObs
                          ? "ring-4 ring-fuchsia-400/70 scale-110"
                          : "hover:brightness-110"
                      }
                    `}
                  >
                    {obs.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Máscara circular de campo ocular microscópico */}
          {ocularMask && (
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background:
                  "radial-gradient(circle at center, transparent 58%, rgba(8, 13, 24, 0.56) 69%, rgba(4, 8, 16, 0.94) 80%)",
              }}
              aria-hidden="true"
            />
          )}

          {/* Minimapa / Indicador discreto de posición en la lámina (NO revela la ubicación de los huevos) */}
          <div
            className="absolute top-2.5 right-2.5 z-20 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 sm:p-2 shadow-xl w-[88px] sm:w-[140px]"
            aria-label={`Indicador de posición en la lámina: X ${minimapViewportBox.centerPctX}%, Y ${minimapViewportBox.centerPctY}%`}
          >
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-300 font-semibold mb-1">
              <span className="flex items-center gap-1">
                <Compass className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400" />
                <span className="hidden sm:inline">Posición</span>
              </span>
              <span className="font-mono text-cyan-300">
                {minimapViewportBox.centerPctX}%, {minimapViewportBox.centerPctY}%
              </span>
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const clickPctX = ((e.clientX - rect.left) / rect.width) * 100;
                const clickPctY = ((e.clientY - rect.top) / rect.height) * 100;
                centerViewOnStagePct(clickPctX, clickPctY);
              }}
              title="Haz clic en un cuadrante de la lámina para desplazarte a esa zona"
              className="relative w-full aspect-[4/3] bg-slate-900 border border-slate-700 rounded-md overflow-hidden cursor-pointer"
            >
              {/* Cuadrícula de orientación discreta sin mostrar la posición de los huevos */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-25">
                {Array.from({ length: 9 }).map((_, idx) => (
                  <div key={idx} className="border border-slate-600" />
                ))}
              </div>

              {/* Marcas personales del estudiante en el minimapa */}
              {observations.map((obs) => (
                <span
                  key={obs.id}
                  style={{ left: `${obs.xPct}%`, top: `${obs.yPct}%` }}
                  className="absolute w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-400 pointer-events-none"
                />
              ))}

              {/* Rectángulo del campo observado actualmente */}
              <div
                style={{
                  left: `${minimapViewportBox.leftPct}%`,
                  top: `${minimapViewportBox.topPct}%`,
                  width: `${minimapViewportBox.widthPct}%`,
                  height: `${minimapViewportBox.heightPct}%`,
                }}
                className="absolute border-2 border-cyan-400 bg-cyan-400/20 rounded-[2px] pointer-events-none transition-all duration-75"
              />
            </div>
            <p className="hidden sm:block text-[9px] text-slate-400 mt-1 leading-tight">
              Toca el mapa para ir a otra zona
            </p>
          </div>

          {/* Leyenda discreta inferior sobre la interacción */}
          <div className="absolute bottom-2 left-2 right-2 z-20 pointer-events-none flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] sm:text-[11px] text-slate-200 bg-slate-950/85 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-700/80">
              {interactionTool === "observe"
                ? "Toca un punto para colocar una marca personal"
                : "Arrastra para mover la lámina · Toca un elemento para ayuda"}
            </span>
          </div>
        </div>

        {/* Barra de controles inferiores del visor: Acercar, Alejar, Restablecer, Brillo/Contraste y Modo */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-2 sm:p-2.5">
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => applyZoomAroundPoint(zoom + ZOOM_STEP, 0, 0)}
              disabled={zoom >= MAX_ZOOM}
              aria-label="Acercar preparación microscópica"
              className="min-h-[44px] min-w-[44px] px-2.5 sm:px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 disabled:opacity-40 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700/80 cursor-pointer disabled:cursor-not-allowed"
            >
              <ZoomIn className="w-4 h-4 text-cyan-400" />
              <span>Acercar</span>
            </button>

            <button
              type="button"
              onClick={() => applyZoomAroundPoint(zoom - ZOOM_STEP, 0, 0)}
              disabled={zoom <= MIN_ZOOM}
              aria-label="Alejar preparación microscópica"
              className="min-h-[44px] min-w-[44px] px-2.5 sm:px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 disabled:opacity-40 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700/80 cursor-pointer disabled:cursor-not-allowed"
            >
              <ZoomOut className="w-4 h-4 text-cyan-400" />
              <span>Alejar</span>
            </button>

            <button
              type="button"
              onClick={handleResetView}
              aria-label="Restablecer vista inicial de la preparación"
              className="min-h-[44px] min-w-[44px] px-2.5 sm:px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700/80 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden xs:inline sm:inline">Restablecer</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAdjustments((prev) => !prev)}
              aria-expanded={showAdjustments}
              aria-label="Ajustes de brillo y contraste"
              className={`min-h-[44px] min-w-[44px] px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                showAdjustments || brightness !== 100 || contrast !== 100
                  ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-200"
                  : "bg-slate-800/90 border-slate-700/80 text-slate-300 hover:text-white"
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Brillo / Contraste</span>
            </button>
          </div>

          {!inExpandedModal && (
            <div className="flex flex-wrap items-center gap-1.5">
              {simulatorMode === "explore" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSimulatorMode("prepare");
                  }}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Volver a preparar</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSimulatorMode("explore")}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Microscope className="w-4 h-4" />
                  <span>Explorar muestra</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Panel desplegable de ajustes digitales de Brillo y Contraste */}
        {showAdjustments && (
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Ajustes digitales de visualización (en pantalla)
              </p>
              <button
                type="button"
                onClick={() => {
                  setBrightness(100);
                  setContrast(100);
                }}
                disabled={brightness === 100 && contrast === 100}
                className="min-h-[36px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-[11px] font-semibold text-slate-200 cursor-pointer"
              >
                Restablecer (100%)
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1 text-xs text-slate-300">
                <span className="flex items-center justify-between">
                  <span>Brillo digital</span>
                  <span className="font-mono text-white">{brightness}%</span>
                </span>
                <input
                  type="range"
                  min={75}
                  max={135}
                  step={5}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  aria-label="Brillo digital de la preparación"
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </label>
              <label className="space-y-1 text-xs text-slate-300">
                <span className="flex items-center justify-between">
                  <span>Contraste digital</span>
                  <span className="font-mono text-white">{contrast}%</span>
                </span>
                <input
                  type="range"
                  min={75}
                  max={145}
                  step={5}
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  aria-label="Contraste digital de la preparación"
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Identificación educativa discreta y barra de cambio entre A. Preparar muestra y B. Explorar muestra */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              <Microscope className="w-3.5 h-3.5" />
              Preparación simulada con recursos de referencia
            </span>
            <span className="text-xs font-mono text-slate-400">
              Ejemplares en lámina:{" "}
              <strong className="text-white">{totalPlacedCount}</strong> /{" "}
              {SIMULATOR_LIMITS.MAX_TOTAL_ELEMENTS} máx.
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Configura una muestra añadiendo huevos de parásitos, quistes, gotas de
            grasa y restos vegetales; después recórrela como al microscopio para
            encontrarlos y comparar sus rasgos. Las cantidades, posiciones y
            proporciones relativas son configuraciones didácticas; no representan
            frecuencias clínicas ni una muestra real de paciente.
          </p>
        </div>

        {/* Selector de modo principal del simulador */}
        <div
          className="flex flex-col sm:flex-row gap-2 shrink-0 bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800"
          role="group"
          aria-label="Etapa del simulador de preparación microscópica"
        >
          <button
            type="button"
            onClick={() => setSimulatorMode("prepare")}
            aria-pressed={simulatorMode === "prepare"}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              simulatorMode === "prepare"
                ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-sm"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span>1. Preparar muestra ({totalPlacedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSimulatorMode("explore")}
            aria-pressed={simulatorMode === "explore"}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              simulatorMode === "explore"
                ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/50 shadow-sm"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <Microscope className="w-4 h-4 text-emerald-400" />
            <span>2. Explorar muestra</span>
          </button>
        </div>
      </div>

      {/* Aviso explícito cuando una redistribución o vaciado limpió observaciones del encuadre anterior */}
      {invalidatedStateBackup && (
        <div
          role="status"
          className="bg-amber-950/35 border border-amber-500/40 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-200"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Al{" "}
              {invalidatedStateBackup.reason === "redistribute"
                ? "redistribuir la muestra cambiaron las posiciones de los objetos"
                : "vaciar la muestra se retiraron los elementos"}
              , por lo que se limpiaron{" "}
              <strong>
                {invalidatedStateBackup.previousObservations.length} marca(s) de
                observación
              </strong>{" "}
              anteriores para evitar que queden flotando sobre objetos distintos.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRestoreInvalidatedState}
              className="min-h-[44px] px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-100 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Restaurar distribución y marcas</span>
            </button>
            <button
              type="button"
              onClick={() => setInvalidatedStateBackup(null)}
              aria-label="Cerrar aviso de redistribución"
              className="min-h-[44px] min-w-[44px] rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Barra de ayudas de descubrimiento progresivo (visible especialmente en Explorar muestra) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5">
          <Compass className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <p className="text-xs sm:text-sm font-bold text-white">
              {simulatorMode === "explore"
                ? "Recorre toda la preparación: desplaza la lámina, acércate y marca tus hallazgos antes de revelar las etiquetas."
                : "Configura las cantidades de cada elemento y pulsa «Explorar muestra» para recorrer el campo microscópico."}
            </p>
            <p className="text-[11px] text-slate-400">
              Las posiciones de los objetos permanecen estables al mover, ampliar,
              activar ayudas o cambiar entre preparación y exploración.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowHints((prev) => !prev)}
            aria-pressed={showHints}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
              showHints
                ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md"
                : "bg-slate-800/90 text-cyan-200 border-cyan-500/40 hover:bg-slate-800"
            }`}
          >
            <Lightbulb className="w-4 h-4 shrink-0" />
            <span>{showHints ? "Ocultar pistas" : "Mostrar pistas"}</span>
          </button>

          <button
            type="button"
            onClick={() => setRevealElements((prev) => !prev)}
            aria-pressed={revealElements}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
              revealElements
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                : "bg-slate-800/90 text-amber-200 border-amber-500/40 hover:bg-slate-800"
            }`}
          >
            {revealElements ? (
              <>
                <EyeOff className="w-4 h-4 shrink-0" />
                <span>Ocultar identificaciones</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 shrink-0" />
                <span>Revelar elementos</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Panel de pistas de exploración general (sin revelar la ubicación exacta) */}
      {showHints && (
        <section
          aria-label="Pistas de observación para recorrer la muestra"
          className="bg-cyan-950/25 border border-cyan-500/40 rounded-2xl p-4 space-y-2.5"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Pistas de observación para recorrer la preparación
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs text-slate-200">
            <div className="bg-slate-950/75 border border-slate-800/90 rounded-xl p-3">
              <strong className="text-cyan-300 block mb-1">
                1. Cubierta y contorno:
              </strong>
              Al encontrar un objeto redondeado u ovalado, acércate con el zoom
              digital: distingue si posee un anillo grueso con estriaciones radiales
              continuas (<em>Taenia</em> spp.), mamelones redondeados con cámara
              interna lisa (<em>Ascaris</em>), proyecciones espinosas (polen) o un
              borde refringente liso de tamaño variable (gota de grasa).
            </div>
            <div className="bg-slate-950/75 border border-slate-800/90 rounded-xl p-3">
              <strong className="text-cyan-300 block mb-1">
                2. Estructuras internas:
              </strong>
              En objetos ovalados pequeños teñidos con yodo, busca si existen
              núcleos polares y trazos longitudinales internos (quiste de{" "}
              <em>Giardia duodenalis</em>) frente a un interior homogéneo sin
              axostilo (levaduras y esporas fúngicas).
            </div>
            <div className="bg-slate-950/75 border border-slate-800/90 rounded-xl p-3">
              <strong className="text-cyan-300 block mb-1">
                3. Elementos alargados y contexto:
              </strong>
              Las estructuras tubulares largas con pared rígida refringente, canal
              central vacío y extremos quebrados corresponden a pelos o fibras
              vegetales, no a larvas de nematodos.
            </div>
          </div>
        </section>
      )}

      {/* ========================================== */}
      {/* DISPOSICIÓN SEGÚN EL MODO (PREPARAR vs EXPLORAR) */}
      {/* ========================================== */}
      <div
        className={
          simulatorMode === "prepare"
            ? "grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"
            : "space-y-4"
        }
      >
        {/* A. PANEL DE PREPARACIÓN DE MUESTRA (visible en modo "prepare") */}
        {simulatorMode === "prepare" && (
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                  <span>Elementos para la preparación</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Añade o retira elementos; la preparación conserva los anteriores.
                </p>
              </div>

              {/* Botón en móvil para plegar/desplegar la lista de elementos */}
              <button
                type="button"
                onClick={() => setIsMobilePrepPanelCollapsed((prev) => !prev)}
                aria-expanded={!isMobilePrepPanelCollapsed}
                className="lg:hidden min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                {isMobilePrepPanelCollapsed ? (
                  <>
                    <span>Mostrar catálogo</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Plegar catálogo</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Acciones globales de la muestra: Redistribuir, Vaciar, Explorar */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleRedistribute}
                disabled={placedInstances.length === 0}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 text-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Redistribuir muestra</span>
              </button>

              <button
                type="button"
                onClick={handleClearSample}
                disabled={placedInstances.length === 0}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 disabled:opacity-40 border border-rose-500/30 text-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Vaciar muestra</span>
              </button>

              <button
                type="button"
                onClick={() => setSimulatorMode("explore")}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 ml-auto shadow-md cursor-pointer"
              >
                <Microscope className="w-4 h-4" />
                <span>Explorar muestra</span>
              </button>
            </div>

            {/* Barra de capacidad de la preparación */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-semibold">
                  Capacidad de la lámina (rendimiento fluido)
                </span>
                <span className="font-mono text-cyan-300 font-bold">
                  {totalPlacedCount} / {SIMULATOR_LIMITS.MAX_TOTAL_ELEMENTS} objetos
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-200"
                  style={{
                    width: `${Math.min(
                      100,
                      (totalPlacedCount / SIMULATOR_LIMITS.MAX_TOTAL_ELEMENTS) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Categorías y tarjetas de cada elemento del catálogo */}
            <div
              className={`space-y-4 ${
                isMobilePrepPanelCollapsed ? "hidden lg:block" : "block"
              }`}
            >
              {SIMULATOR_CATEGORIES.map((cat) => {
                const elements = SIMULATOR_CATALOG.filter(
                  (el) => el.category === cat.id
                );
                return (
                  <div key={cat.id} className="space-y-2.5">
                    <div className="border-b border-slate-800 pb-1.5">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                        {cat.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">{cat.subtitle}</p>
                    </div>

                    <div className="space-y-2.5">
                      {elements.map((el) => {
                        const count = countsByElement[el.id] || 0;
                        const atMaxForElement = count >= el.maxCountPerElement;
                        const atMaxTotal =
                          totalPlacedCount >= SIMULATOR_LIMITS.MAX_TOTAL_ELEMENTS;
                        const canAdd = !atMaxForElement && !atMaxTotal;

                        return (
                          <div
                            key={el.id}
                            className={`rounded-xl border p-3 transition-colors ${
                              count > 0
                                ? "bg-slate-950/90 border-slate-700"
                                : "bg-slate-950/50 border-slate-800/80"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Miniatura real sobre fondo de montaje húmedo */}
                              <div className="w-14 h-14 rounded-xl bg-[#dce0d6] border border-slate-700 p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                                <img
                                  src={el.thumbnailSrc}
                                  alt={el.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>

                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs font-bold text-white leading-snug">
                                    {el.name}
                                  </p>
                                  <span
                                    aria-label={`Cantidad actual de ${el.name}: ${count}`}
                                    className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 ${
                                      count > 0
                                        ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40"
                                        : "bg-slate-800 text-slate-400"
                                    }`}
                                  >
                                    {count} / {el.maxCountPerElement}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-tight">
                                  {el.stageFormLabel} · {el.variants.length}{" "}
                                  variantes fotográficas reales
                                </p>
                              </div>
                            </div>

                            {/* Controles: Añadir, disminuir (-), aumentar (+), retirar tipo */}
                            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleAddOne(el.id)}
                                  disabled={!canAdd}
                                  aria-label={`Añadir ${el.name}`}
                                  className="min-h-[44px] px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 disabled:opacity-40 border border-cyan-500/40 text-cyan-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Añadir</span>
                                </button>

                                <div
                                  className="inline-flex items-center rounded-xl bg-slate-900 border border-slate-800"
                                  role="group"
                                  aria-label={`Ajustar cantidad de ${el.name}`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleDecreaseOne(el.id)}
                                    disabled={count <= 0}
                                    aria-label={`Disminuir cantidad de ${el.name}`}
                                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-200 hover:bg-slate-800 disabled:opacity-35 rounded-l-xl cursor-pointer disabled:cursor-not-allowed"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="px-2.5 text-xs font-mono font-bold text-white">
                                    {count}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleAddOne(el.id)}
                                    disabled={!canAdd}
                                    aria-label={`Aumentar cantidad de ${el.name}`}
                                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-200 hover:bg-slate-800 disabled:opacity-35 rounded-r-xl cursor-pointer disabled:cursor-not-allowed"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveType(el.id)}
                                disabled={count === 0}
                                aria-label={`Retirar todos los ejemplares de ${el.name}`}
                                className="min-h-[44px] px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/50 disabled:opacity-35 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Retirar</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* B. CAMPO MICROSCÓPICO INTERACTIVO Y PANELES DE OBSERVACIÓN / AYUDA */}
        <div
          className={
            simulatorMode === "prepare" ? "lg:col-span-7 space-y-4" : "space-y-4"
          }
        >
          {/* Si no está abierto el modal ampliado, renderizar el visor aquí */}
          {!isExpandedView && renderInteractiveMicroscopeStage(false)}

          {/* Lista rápida de ejemplares cuando "Revelar elementos" está activo */}
          {revealElements && renderIdentifiedElementsList()}

          {/* Panel de consulta de ayuda / descripción / comparación del ejemplar seleccionado (sin perder el encuadre) */}
          {renderSelectedSpecimenPanel()}

          {/* Lista de observaciones personales del estudiante (O1, O2...) */}
          <section
            aria-label="Observaciones personales del estudiante en esta preparación"
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-fuchsia-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-fuchsia-300">
                  Tus marcas de observación en la preparación ({observations.length})
                </h3>
              </div>
              {observations.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setObservations([]);
                    setActiveObservationId(null);
                  }}
                  className="min-h-[44px] px-3 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold text-slate-300 hover:text-rose-200 cursor-pointer"
                >
                  Borrar todas las marcas
                </button>
              )}
            </div>

            {observations.length === 0 ? (
              <p className="text-xs text-slate-400">
                Aún no has colocado marcas personales. Activa el botón{" "}
                <strong className="text-fuchsia-300">«Marcar observación»</strong>{" "}
                sobre el visor y toca un punto de la muestra (o usa «Marcar centro
                actual») para registrar tus hallazgos y notas durante la sesión.
              </p>
            ) : (
              <div className="space-y-2">
                {observations.map((obs) => {
                  const linkedInst = obs.linkedInstanceId
                    ? placedInstances.find(
                        (i) => i.instanceId === obs.linkedInstanceId
                      )
                    : null;
                  const linkedEl = linkedInst
                    ? getCatalogElementById(linkedInst.elementId)
                    : null;

                  return (
                    <div
                      key={obs.id}
                      className={`p-3 rounded-xl border transition-colors ${
                        activeObservationId === obs.id
                          ? "bg-fuchsia-950/35 border-fuchsia-500/60"
                          : "bg-slate-950/75 border-slate-800"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveObservationId(obs.id);
                            centerViewOnStagePct(obs.xPct, obs.yPct);
                          }}
                          className="min-h-[44px] px-2.5 py-1 rounded-lg bg-fuchsia-600 text-white text-xs font-extrabold cursor-pointer"
                        >
                          {obs.label} · Centrar ({Math.round(obs.xPct)}%,{" "}
                          {Math.round(obs.yPct)}%)
                        </button>

                        <input
                          type="text"
                          value={obs.note}
                          onChange={(e) => {
                            const val = e.target.value;
                            setObservations((prev) =>
                              prev.map((item) =>
                                item.id === obs.id ? { ...item, note: val } : item
                              )
                            );
                          }}
                          placeholder="Escribe tu observación (ej. cubierta mamelonada, posible polen, gota refringente...)"
                          aria-label={`Nota para tu observación ${obs.label}`}
                          className="flex-1 min-w-[200px] min-h-[44px] bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-400"
                        />

                        {linkedInst && linkedEl && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedInstanceId(linkedInst.instanceId)
                            }
                            className="min-h-[44px] px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Consultar este ejemplar</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setObservations((prev) =>
                              prev.filter((item) => item.id !== obs.id)
                            )
                          }
                          aria-label={`Eliminar observación ${obs.label}`}
                          className="min-h-[44px] min-w-[44px] rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Créditos, procedencia y condiciones de reutilización de todos los recursos del simulador */}
      <details className="bg-slate-900/75 border border-slate-800 rounded-2xl p-4 group">
        <summary className="text-xs font-bold uppercase tracking-wider text-slate-300 cursor-pointer flex items-center justify-between gap-2 list-none">
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>
              Fuentes verificadas, créditos, resoluciones originales y condiciones de
              reutilización del simulador
            </span>
          </span>
          <span className="text-[11px] text-cyan-400 font-semibold">
            Ver detalle ({SIMULATOR_CATALOG.length} tipos · 21 ejemplares reales)
          </span>
        </summary>

        <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 text-xs text-slate-300">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Todos los ejemplares del simulador provienen de microfotografías reales
            documentadas en{" "}
            <strong className="text-slate-200">
              CDC DPDx (Division of Parasitic Diseases and Malaria)
            </strong>{" "}
            y en{" "}
            <strong className="text-slate-200">
              Memórias do Instituto Oswaldo Cruz (PMC12051917, CC BY 4.0)
            </strong>
            . Cada ejemplar fue separado mediante recorte de contorno no generativo
            conservando intacto el archivo original en{" "}
            <code>/images/parasitology/simulador/originales/</code>. La reunión de
            ejemplares de distintas preparaciones (montaje húmedo salino, solución
            de Lugol y tinción tricrómica en <code>pollen_HB2</code>) conforma un{" "}
            <strong className="text-slate-200">montaje educativo</strong> y no
            reproduce una técnica de laboratorio única.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {SIMULATOR_CATALOG.map((el) => (
              <div
                key={el.id}
                className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-white">{el.name}</strong>
                  <span className="text-[10px] font-mono text-cyan-300">
                    {el.variants.length} ejemplares
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{el.proportionNote}</p>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {el.variants.map((v) => (
                    <li
                      key={v.variantId}
                      className="flex flex-wrap items-center justify-between gap-1 border-t border-slate-900 pt-1"
                    >
                      <span>
                        <strong>{v.sourceFigure}</strong> · {v.preparation} (
                        {v.originalWidthPx}×{v.originalHeightPx} px) ·{" "}
                        <span className="text-slate-400">{v.licenseLabel}</span>
                      </span>
                      <a
                        href={v.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        <span>Fuente</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </details>

      {/* ========================================== */}
      {/* MODAL DE VISTA AMPLIADA (REUTILIZA EL MISMO VISOR INTERACTIVO EN PORTAL) */}
      {/* ========================================== */}
      {isExpandedView &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Vista ampliada interactiva de la preparación microscópica"
            className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-md p-2.5 sm:p-5 overflow-y-auto flex flex-col gap-3 pb-8"
          >
            {/* Encabezado compacto: reduce espacio en celular y mantiene el botón de salida siempre accesible */}
            <div className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 sm:px-4 py-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Microscope className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-xs sm:text-sm font-bold text-white truncate">
                    Vista ampliada <span className="hidden sm:inline">· Preparación simulada</span>
                  </h2>
                  <p className="hidden sm:block text-[11px] text-slate-400">
                    Conserva posición, zoom digital y marcas. Pulsa Escape o «Salir» para volver.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setRevealElements((prev) => !prev)}
                  aria-pressed={revealElements}
                  aria-label={revealElements ? "Ocultar identificaciones" : "Revelar elementos"}
                  className={`min-h-[44px] min-w-[44px] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border cursor-pointer ${
                    revealElements
                      ? "bg-amber-500 text-slate-950 border-amber-400"
                      : "bg-slate-800 text-amber-200 border-amber-500/40"
                  }`}
                >
                  {revealElements ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline sm:inline">Ocultar</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline sm:inline">Revelar</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsExpandedView(false)}
                  aria-label="Salir de vista ampliada"
                  className="min-h-[44px] min-w-[44px] px-3 sm:px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span className="hidden xs:inline sm:inline">Salir</span>
                </button>
              </div>
            </div>

            <div className="shrink-0">
              {renderInteractiveMicroscopeStage(true)}
            </div>

            {/* En la vista ampliada, si el estudiante selecciona un ejemplar, mostrar aquí su ficha para que no tenga que salir */}
            {selectedInstance && selectedCatalogElement && selectedVariant && (
              <div className="mt-1">
                {renderSelectedSpecimenPanel()}
              </div>
            )}

            {/* Y si reveló los elementos, permitir la correspondencia directa también dentro de la vista ampliada */}
            {revealElements && placedInstances.length > 0 && (
              <div className="mt-1">
                {renderIdentifiedElementsList()}
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
