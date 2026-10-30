"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  CHILE_REGIONS_GEOMETRY,
  INSULAR_TERRITORIES,
  ANTARCTIC_TERRITORY_INFO,
  MAP_DIMENSIONS,
  ChileRegionGeometry
} from "@/lib/data/parasitology/chile-regions-geometry";
import {
  REGIONAL_PARASITE_RECORDS,
  DOCUMENTED_PARASITES,
  RegionalParasiteRecord,
  getRecordsForParasite,
  getRecordsForRegion,
  getRecordForRegionAndParasite,
  EvidenceCategory
} from "@/lib/data/parasitology/regional-evidence";
import { WorldGeographicMap } from "./WorldGeographicMap";
import {
  MapPin,
  Globe,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  AlertTriangle,
  ExternalLink,
  Layers,
  Search,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  Building,
  HelpCircle
} from "lucide-react";

export const GeographicMap: React.FC = () => {
  // Escala macro: Foco en Chile vs. Panorama Global
  const [viewScope, setViewScope] = useState<"chile" | "global">("chile");

  // Modo de consulta: "by_parasite" (seleccionar parásito) vs. "by_region" (seleccionar región)
  const [consultationMode, setConsultationMode] = useState<"by_parasite" | "by_region">("by_parasite");

  // Selección actual
  const [selectedParasiteId, setSelectedParasiteId] = useState<string>("p27"); // Echinococcus por defecto (alta relevancia ENO)
  const [selectedRegionCode, setSelectedRegionCode] = useState<number>(11); // Aysén por defecto (máxima incidencia hidatidosis)

  // Estado del visor SVG: Zoom y Paneo
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Región actualmente seleccionada
  const selectedRegion = CHILE_REGIONS_GEOMETRY.find((r) => r.code === selectedRegionCode) || CHILE_REGIONS_GEOMETRY[0];

  // Parásito actualmente seleccionado
  const selectedParasite = DOCUMENTED_PARASITES.find((p) => p.id === selectedParasiteId) || DOCUMENTED_PARASITES[0];

  // Acciones automatizadas de prueba para captura de evidencias
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const action = sessionStorage.getItem("medstudy_test_action");
      if (!action) return;
      sessionStorage.removeItem("medstudy_test_action");

      if (action === "select_valparaiso") {
        setSelectedRegionCode(5);
      } else if (action === "mode_region_biobio") {
        setConsultationMode("by_region");
        setSelectedRegionCode(8);
        setSelectedParasiteId("p32");
      } else if (action === "sin_datos_arica") {
        setConsultationMode("by_parasite");
        setSelectedParasiteId("p29");
        setSelectedRegionCode(15);
      } else if (action === "chagas_coquimbo") {
        setConsultationMode("by_parasite");
        setSelectedParasiteId("p13");
        setSelectedRegionCode(4);
      } else if (action === "global_card_mobile") {
        setViewScope("global");
        sessionStorage.setItem("medstudy_world_action", "global_view_latam");
        setTimeout(() => {
          window.scrollTo({ top: 850, behavior: "instant" });
        }, 500);
      } else if (action?.startsWith("global_")) {
        setViewScope("global");
        sessionStorage.setItem("medstudy_world_action", action);
      } else if (action === "scroll_map") {
        setTimeout(() => {
          window.scrollTo({ top: 320, behavior: "instant" });
        }, 400);
      } else if (action === "scroll_detail") {
        setTimeout(() => {
          window.scrollTo({ top: 960, behavior: "instant" });
        }, 400);
      }
    } catch (e) {}
  }, []);

  // Registros según el modo
  const currentRecord = getRecordForRegionAndParasite(selectedRegionCode, selectedParasiteId);
  const regionRecords = getRecordsForRegion(selectedRegionCode);
  const parasiteRecords = getRecordsForParasite(selectedParasiteId);

  // Mapa de evidencias para el parásito seleccionado (código de región -> registro)
  const parasiteEvidenceMap = React.useMemo(() => {
    const map = new Map<number, RegionalParasiteRecord>();
    parasiteRecords.forEach((rec) => {
      map.set(rec.regionCode, rec);
    });
    return map;
  }, [parasiteRecords]);

  // Controles de zoom
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.35, 3.2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.35, 0.75));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Manejo de arrastre (Pan)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setStartPoint({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPoint.x,
      y: e.clientY - startPoint.y
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  // Manejo de touch para celular
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setStartPoint({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPanning || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - startPoint.x,
      y: e.touches[0].clientY - startPoint.y
    });
  };

  const handleTouchEnd = () => setIsPanning(false);

  // Selección de región
  const handleSelectRegion = (code: number) => {
    setSelectedRegionCode(code);
    // Si estamos en modo región y la región tiene parásitos, seleccionamos el primero si el actual no está en la región
    if (consultationMode === "by_region") {
      const records = getRecordsForRegion(code);
      if (records.length > 0 && !records.some((r) => r.parasiteId === selectedParasiteId)) {
        setSelectedParasiteId(records[0].parasiteId);
      }
    }
  };

  // Helper para estilos de relleno según evidencia
  const getEvidenceStyles = (regionCode: number) => {
    const isSelected = regionCode === selectedRegionCode;
    const record = parasiteEvidenceMap.get(regionCode);

    if (!record) {
      // Sin datos documentados
      return {
        fill: isSelected ? "#1e293b" : "#0f172a",
        fillOpacity: isSelected ? 0.95 : 0.65,
        stroke: isSelected ? "#38bdf8" : "#334155",
        strokeWidth: isSelected ? 3 : 0.85,
        cursor: "pointer"
      };
    }

    switch (record.evidenceCategory) {
      case "vigilancia_eno":
        return {
          fill: isSelected ? "#f59e0b" : "#b45309",
          fillOpacity: isSelected ? 0.95 : 0.65,
          stroke: isSelected ? "#ffffff" : "#f59e0b",
          strokeWidth: isSelected ? 3.2 : 1.2,
          cursor: "pointer"
        };
      case "interrupcion_vectorial_historica":
        return {
          fill: isSelected ? "#a855f7" : "#7e22ce",
          fillOpacity: isSelected ? 0.95 : 0.65,
          stroke: isSelected ? "#ffffff" : "#c084fc",
          strokeWidth: isSelected ? 3.2 : 1.2,
          cursor: "pointer"
        };
      case "registro_animal_sag":
        return {
          fill: isSelected ? "#10b981" : "#047857",
          fillOpacity: isSelected ? 0.95 : 0.65,
          stroke: isSelected ? "#ffffff" : "#34d399",
          strokeWidth: isSelected ? 3.2 : 1.2,
          cursor: "pointer"
        };
      case "estudio_prevalencia_humana":
      case "casos_clinicos_diagnosticados":
        return {
          fill: isSelected ? "#06b6d4" : "#0e7490",
          fillOpacity: isSelected ? 0.95 : 0.65,
          stroke: isSelected ? "#ffffff" : "#22d3ee",
          strokeWidth: isSelected ? 3.2 : 1.2,
          cursor: "pointer"
        };
      case "casos_importados":
        return {
          fill: isSelected ? "#6366f1" : "#4338ca",
          fillOpacity: isSelected ? 0.95 : 0.65,
          stroke: isSelected ? "#ffffff" : "#818cf8",
          strokeWidth: isSelected ? 3.2 : 1.2,
          cursor: "pointer"
        };
      default:
        return {
          fill: isSelected ? "#38bdf8" : "#1e293b",
          fillOpacity: isSelected ? 0.95 : 0.65,
          stroke: isSelected ? "#ffffff" : "#475569",
          strokeWidth: isSelected ? 3 : 1,
          cursor: "pointer"
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Selector de Escala Territorial (Foco en Chile vs. Global) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewScope("chile")}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px] ${
              viewScope === "chile"
                ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>Chile por Regiones (16 Regiones Oficiales)</span>
          </button>
          <button
            onClick={() => setViewScope("global")}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px] ${
              viewScope === "global"
                ? "bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Globe className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>Panorama Global & América Latina (179 Países)</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 px-2 py-1 flex items-center gap-1.5 border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
          <FileCheck2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span>Cartografía oficial BCN e internacional · Vigilancia MINSAL / OPS / OMS</span>
        </div>
      </div>

      {viewScope === "chile" ? (
        <div className="space-y-4">
          {/* 2. Barra de Modos de Consulta y Selectores Rápidos */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              {/* Selector de modo: Por Parásito vs. Por Región */}
              <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button
                  onClick={() => setConsultationMode("by_parasite")}
                  className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[44px] flex-1 md:flex-initial ${
                    consultationMode === "by_parasite"
                      ? "bg-cyan-500 text-slate-950 shadow-md font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                  aria-pressed={consultationMode === "by_parasite"}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>1. Explorar por Parásito</span>
                </button>
                <button
                  onClick={() => setConsultationMode("by_region")}
                  className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[44px] flex-1 md:flex-initial ${
                    consultationMode === "by_region"
                      ? "bg-cyan-500 text-slate-950 shadow-md font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                  aria-pressed={consultationMode === "by_region"}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>2. Explorar por Región</span>
                </button>
              </div>

              {/* Selector dinámico contextual */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-xl">
                {consultationMode === "by_parasite" ? (
                  <div className="flex-1 space-y-1">
                    <label htmlFor="parasite-select" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Seleccionar Parásito en foco:
                    </label>
                    <select
                      id="parasite-select"
                      value={selectedParasiteId}
                      onChange={(e) => setSelectedParasiteId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-cyan-200 font-medium focus:outline-none focus:border-cyan-500 min-h-[44px]"
                    >
                      {DOCUMENTED_PARASITES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.group} — {p.recordCount} regiones con datos)
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex-1 space-y-1">
                    <label htmlFor="region-select" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Seleccionar Región oficial (16 Regiones):
                    </label>
                    <select
                      id="region-select"
                      value={selectedRegionCode}
                      onChange={(e) => handleSelectRegion(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-cyan-200 font-medium focus:outline-none focus:border-cyan-500 min-h-[44px]"
                    >
                      {CHILE_REGIONS_GEOMETRY.map((r) => {
                        const count = getRecordsForRegion(r.code).length;
                        return (
                          <option key={r.code} value={r.code}>
                            {r.romanNumeral}. {r.name} ({count > 0 ? `${count} parásitos con datos` : "Sin datos documentados"})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>

            </div>

            {/* Subtítulo orientador */}
            <div className="text-xs text-slate-400 flex items-center gap-2 pt-1">
              <Compass className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>
                {consultationMode === "by_parasite" ? (
                  <>
                    Mostrando distribución documentada de <strong className="text-cyan-300 italic">{selectedParasite.name}</strong> en las 16 regiones de Chile. Haz clic en una región o en su selector para ver el detalle.
                  </>
                ) : (
                  <>
                    Región seleccionada: <strong className="text-cyan-300">{selectedRegion.name}</strong> ({selectedRegion.romanNumeral}). {regionRecords.length > 0 ? `Cuenta con ${regionRecords.length} parásitos documentados.` : "No cuenta con evidencia documentada en el catálogo actual."}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* 3. Grid Principal: Mapa SVG a la izquierda + Panel de Información a la derecha */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Columna Izquierda: Mapa Interactivo SVG Real */}
            <div className="lg:col-span-6 rounded-3xl border border-slate-800 bg-slate-950 p-4 sm:p-6 shadow-2xl space-y-4">
              
              {/* Barra de cabecera del mapa y controles de zoom */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
                    Cartografía de Chile
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    BCN SIIT · Ley N° 21.033
                  </span>
                </div>

                {/* Toolbar de controles táctiles (Mínimo 44x44px) */}
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={handleZoomIn}
                    aria-label="Acercar mapa"
                    title="Acercar mapa"
                    className="w-11 h-11 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    aria-label="Alejar mapa"
                    title="Alejar mapa"
                    className="w-11 h-11 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleReset}
                    aria-label="Ver Chile completo (restablecer encuadre)"
                    title="Ver Chile completo"
                    className="h-11 px-3 flex items-center gap-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <RotateCcw className="w-4 h-4 text-cyan-400" />
                    <span className="hidden sm:inline">Chile completo</span>
                  </button>
                </div>
              </div>

              {/* Contenedor del Mapa SVG Interactivo con soporte táctil y arrastre */}
              <div
                className="relative aspect-[3/4] sm:aspect-[4/5] max-h-[640px] w-full bg-slate-900/50 rounded-2xl border border-slate-800/80 overflow-hidden select-none cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* SVG Vectorial Proyectado */}
                <svg
                  viewBox={MAP_DIMENSIONS.viewBox}
                  className="w-full h-full pointer-events-none"
                  preserveAspectRatio="xMidYMid meet"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: "center center",
                    transition: isPanning ? "none" : "transform 0.15s ease-out"
                  }}
                >
                  <defs>
                    {/* Filtro para resalte de la región seleccionada */}
                    <filter id="selected-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.8" />
                    </filter>
                  </defs>

                  {/* 1. Recuadros Insulares (Rapa Nui y Juan Fernández) */}
                  {INSULAR_TERRITORIES.map((ins) => {
                    const isValparaisoSelected = selectedRegionCode === 5;
                    const valpoStyles = getEvidenceStyles(5);

                    return (
                      <g key={ins.id} className="pointer-events-auto">
                        {/* Marco del recuadro */}
                        <rect
                          x={ins.box.x}
                          y={ins.box.y}
                          width={ins.box.width}
                          height={ins.box.height}
                          rx={10}
                          fill="#0b1329"
                          stroke={isValparaisoSelected ? "#38bdf8" : "#334155"}
                          strokeWidth={isValparaisoSelected ? 2 : 1}
                          className="transition-all"
                        />
                        {/* Título del recuadro */}
                        <text
                          x={ins.box.x + 8}
                          y={ins.box.y + 16}
                          fill="#e2e8f0"
                          fontSize="9.5"
                          fontWeight="bold"
                          fontFamily="system-ui, -apple-system, sans-serif"
                        >
                          {ins.name}
                        </text>
                        <text
                          x={ins.box.x + 8}
                          y={ins.box.y + 27}
                          fill="#94a3b8"
                          fontSize="7.5"
                          fontFamily="system-ui, -apple-system, sans-serif"
                        >
                          Región de Valparaíso (V)
                        </text>

                        {/* Polígono de la isla */}
                        <path
                          d={ins.path}
                          fill={valpoStyles.fill}
                          fillOpacity={valpoStyles.fillOpacity}
                          stroke={isValparaisoSelected ? "#ffffff" : valpoStyles.stroke}
                          strokeWidth={isValparaisoSelected ? 2.5 : 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectRegion(5);
                          }}
                          className="cursor-pointer hover:brightness-125 transition-all"
                          role="button"
                          tabIndex={0}
                          aria-label={`Seleccionar ${ins.name}, parte de la Región de Valparaíso`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleSelectRegion(5);
                            }
                          }}
                        />
                      </g>
                    );
                  })}

                  {/* 2. Regiones de Chile Continental (16 regiones oficiales) */}
                  <g id="chile-continental" className="pointer-events-auto">
                    {CHILE_REGIONS_GEOMETRY.map((region) => {
                      const isSelected = region.code === selectedRegionCode;
                      const styles = getEvidenceStyles(region.code);

                      return (
                        <g
                          key={region.code}
                          id={region.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectRegion(region.code);
                          }}
                          className="group cursor-pointer focus:outline-none"
                          role="button"
                          tabIndex={0}
                          aria-label={`Región ${region.name} (${region.romanNumeral}). ${
                            parasiteEvidenceMap.has(region.code)
                              ? `Con evidencia: ${parasiteEvidenceMap.get(region.code)?.evidenceLabel}`
                              : "Sin datos específicos documentados"
                          }`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleSelectRegion(region.code);
                            }
                          }}
                        >
                          {/* Polígono de la región */}
                          <path
                            d={region.path}
                            fill={styles.fill}
                            fillOpacity={styles.fillOpacity}
                            stroke={isSelected ? "#ffffff" : styles.stroke}
                            strokeWidth={isSelected ? 3.2 : styles.strokeWidth}
                            filter={isSelected ? "url(#selected-glow)" : undefined}
                            className="transition-all hover:brightness-125"
                          />

                          {/* Pin / marcador central para la región seleccionada */}
                          {isSelected && (
                            <circle
                              cx={region.center.x}
                              cy={region.center.y}
                              r={5}
                              fill="#ffffff"
                              stroke="#0284c7"
                              strokeWidth={2}
                              className="animate-pulse"
                            />
                          )}
                        </g>
                      );
                    })}
                  </g>

                  {/* 3. Indicador de escala gráfica y Norte */}
                  <g id="map-compass" transform="translate(24, 870)" className="pointer-events-none">
                    <circle cx="16" cy="16" r="14" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                    <path d="M16 6 L20 22 L16 18 L12 22 Z" fill="#38bdf8" />
                    <text x="16" y="5" fill="#e2e8f0" fontSize="8" fontWeight="bold" textAnchor="middle">
                      N
                    </text>
                  </g>
                </svg>

                {/* Recuadro de Acceso a Territorio Antártico */}
                <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 max-w-[210px] text-[10px] space-y-1 shadow-md pointer-events-auto">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-300 font-bold block">{ANTARCTIC_TERRITORY_INFO.name}</strong>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">XII Región</span>
                  </div>
                  <p className="text-slate-400 leading-snug">
                    Territorio especial antártico. Sin transmisión comunitaria activa de parásitos humanos autóctonos.
                  </p>
                </div>
              </div>

              {/* Leyenda comprensible con señales visuales adicionales al color */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Leyenda de Evidencia Territorial:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-amber-950/20 border border-amber-800/30">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-white flex-shrink-0" />
                    <span className="text-amber-200">Vigilancia ENO (MINSAL)</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-cyan-950/20 border border-cyan-800/30">
                    <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 border border-white flex-shrink-0" />
                    <span className="text-cyan-200">Prevalencia / Casos Clínicos</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white flex-shrink-0" />
                    <span className="text-emerald-200">Registro Animal (SAG)</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-purple-950/20 border border-purple-800/30">
                    <span className="w-3.5 h-3.5 rounded-full bg-purple-500 border border-white flex-shrink-0" />
                    <span className="text-purple-200">Interrupción Vectorial</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-indigo-950/20 border border-indigo-800/30">
                    <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 border border-white flex-shrink-0" />
                    <span className="text-indigo-200">Casos Importados</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-600 flex-shrink-0" />
                    <span className="text-slate-400">Sin datos documentados</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300">
                  <div className="w-4 h-4 rounded-full border-2 border-white bg-cyan-500 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <span>
                    <strong>Región seleccionada:</strong> Borde blanco grueso con resalte luminoso, independiente del color de evidencia.
                  </span>
                </div>
              </div>

            </div>

            {/* Columna Derecha: Panel de Información Epidemiológica Detallada */}
            <div className="lg:col-span-6 space-y-4">
              
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
                
                {/* Cabecera de la ficha regional */}
                <div className="space-y-2 pb-4 border-b border-slate-800">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50 font-bold">
                      {selectedRegion.romanNumeral} · {selectedRegion.capital}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Cód. Oficial: {selectedRegion.code}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {selectedRegion.name}
                  </h3>

                  {/* Parásito en foco */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                    <div className="text-xs text-slate-300">
                      Parásito en consulta:{" "}
                      <strong className="text-cyan-300 italic text-sm">{selectedParasite.name}</strong>{" "}
                      <span className="text-slate-500">({selectedParasite.group})</span>
                    </div>

                    {/* En modo por región: selector de parásitos documentados en la región */}
                    {consultationMode === "by_region" && regionRecords.length > 1 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400">Otros en la región:</span>
                        {regionRecords.map((r) => (
                          <button
                            key={r.parasiteId}
                            onClick={() => setSelectedParasiteId(r.parasiteId)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                              selectedParasiteId === r.parasiteId
                                ? "bg-cyan-500 text-slate-950"
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                            }`}
                          >
                            {r.speciesName.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contenido condicional: Ficha con evidencia vs. Sin datos disponibles */}
                {currentRecord ? (
                  <div className="space-y-4">
                    
                    {/* Badges de clasificación de la evidencia */}
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/40 font-semibold flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>{currentRecord.evidenceLabel}</span>
                      </span>

                      <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                        {currentRecord.transmissionLabel}
                      </span>

                      {currentRecord.verificationStatus === "verificado" ? (
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Fuente verificada</span>
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Cifra en revisión</span>
                        </span>
                      )}
                    </div>

                    {/* Período o fecha del registro */}
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Período documentado: <strong className="text-slate-200">{currentRecord.periodOrDate}</strong></span>
                    </div>

                    {/* Hallazgo documentado */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                        Hallazgo epidemiológico documentado:
                      </span>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                        {currentRecord.findingSummary}
                      </p>
                    </div>

                    {/* Cifra cuantitativa con unidad y población (o indicación de cifra en revisión) */}
                    {currentRecord.quantitativeMetric && (
                      <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 text-xs space-y-1.5">
                        <span className="text-xs font-bold text-cyan-300 block flex items-center gap-1.5">
                          <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Dato cuantitativo / Tasa reportada:</span>
                        </span>
                        <p className="text-cyan-100 font-medium text-xs sm:text-sm leading-relaxed">
                          {currentRecord.quantitativeMetric.metricDisplay}
                        </p>
                        {currentRecord.quantitativeMetric.unitAndPopulation && (
                          <div className="text-[11px] text-cyan-300/80 pt-1 border-t border-cyan-800/30">
                            <strong>Unidad y base poblacional:</strong> {currentRecord.quantitativeMetric.unitAndPopulation}
                          </div>
                        )}
                        {currentRecord.quantitativeMetric.pendingNote && (
                          <div className="text-[11px] text-amber-300/90 pt-1 border-t border-amber-800/30 flex items-start gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>{currentRecord.quantitativeMetric.pendingNote}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notas epidemiológicas de mantención del ciclo */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                        Vías de mantención & contexto sanitario:
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/30 p-3.5 rounded-xl border border-slate-800/80">
                        {currentRecord.epidemiologicalNotes}
                      </p>
                    </div>

                    {/* Limitaciones metodológicas específicas */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Limitaciones metodológicas del dato:</span>
                      </span>
                      <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                        {currentRecord.limitations}
                      </p>
                    </div>

                    {/* Fuente institucional con hipervínculo directo */}
                    <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span>Fuente oficial: <strong className="text-slate-200">{currentRecord.source.organization}</strong></span>
                        <span className="text-[11px] text-slate-500">Publicado: {currentRecord.source.publicationYear}</span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Documento: <em>{currentRecord.source.title}</em>
                      </div>
                      <div>
                        <a
                          href={currentRecord.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-xs font-semibold underline underline-offset-4"
                        >
                          <span>Consultar informe o portal oficial</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Estado Vacío: Sin datos disponibles */
                  <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 text-center">
                    <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-300">
                        Sin datos disponibles para esta región y especie
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                        No se han incorporado registros epidemiológicos específicos de{" "}
                        <strong className="text-cyan-300 italic">{selectedParasite.name}</strong> para la{" "}
                        <strong>{selectedRegion.name}</strong>.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/30 text-[11px] text-amber-200/90 text-left space-y-1">
                      <strong className="block text-amber-300 font-semibold flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span>Principio de Rigor Epidemiológico:</span>
                      </strong>
                      <p className="leading-relaxed">
                        La ausencia de datos en el sistema refleja falta de publicaciones científicas locales o de vigilancia sistemática activa incorporada, y <strong>nunca debe interpretarse como ausencia biológica del parásito</strong> en el territorio.
                      </p>
                    </div>

                    {/* Si la región tiene otros parásitos, ofrecerlos */}
                    {regionRecords.length > 0 && (
                      <div className="pt-2 text-left space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Parásitos con registros documentados en {selectedRegion.shortName}:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {regionRecords.map((r) => (
                            <button
                              key={r.parasiteId}
                              onClick={() => setSelectedParasiteId(r.parasiteId)}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs text-slate-200 hover:text-cyan-200 transition-all font-medium"
                            >
                              <span className="italic">{r.speciesName}</span> ({r.evidenceCategory.replace(/_/g, " ")})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* 4. Nota Metodológica General y Metadatos Cartográficos */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                  <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Metadatos Cartográficos & Epidemiológicos:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
                  <div>
                    <strong className="text-slate-300">Fuente Cartográfica:</strong> {MAP_DIMENSIONS.cartographySource} ({MAP_DIMENSIONS.cartographyDate})
                  </div>
                  <div>
                    <strong className="text-slate-300">Marco Legal Cartográfico:</strong> Ley N° 21.033 (16 regiones) · Ley N° 20.285
                  </div>
                  <div>
                    <strong className="text-slate-300">Fuentes Epidemiológicas:</strong> MINSAL (EPI/ENO) · ISP · SAG · SOCHINF
                  </div>
                  <div>
                    <strong className="text-slate-300">Fecha de Consulta y Homologación:</strong> 20 de octubre de 2026
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : (
        <WorldGeographicMap />
      )}
    </div>
  );
};
