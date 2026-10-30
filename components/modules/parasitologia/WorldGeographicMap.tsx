"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  WORLD_COUNTRIES_GEOMETRY,
  WORLD_VIEW_PRESETS,
  WORLD_MAP_DIMENSIONS,
  WorldCountryGeometry
} from "@/lib/data/parasitology/world-countries-geometry";
import {
  WORLD_DOCUMENTED_PARASITES,
  WORLD_PARASITE_RECORDS,
  getWorldRecord,
  getWorldRecordsForCountry,
  getWorldRecordsForParasite,
  WorldEvidenceCategory
} from "@/lib/data/parasitology/world-evidence";
import {
  Globe,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  AlertTriangle,
  ExternalLink,
  Search,
  CheckCircle2,
  FileCheck2,
  Building,
  HelpCircle,
  MapPin,
  Bug,
  Compass,
  Filter
} from "lucide-react";

export const WorldGeographicMap: React.FC = () => {
  // Parásito seleccionado para visualización global
  const [selectedParasiteId, setSelectedParasiteId] = useState<string>("p13-trypanosoma-cruzi");

  // País seleccionado (por defecto Bolivia por ser foco de máxima seroprevalencia de Chagas en LatAm)
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("BOL");

  // Búsqueda de país
  const [countrySearch, setCountrySearch] = useState<string>("");

  // Preset de visualización activo (por defecto LatAm o Mundo)
  const [activePreset, setActivePreset] = useState<string>("latam");

  // Zoom y Centro interactivo (coordenadas SVG 0..1000, 0..550)
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [zoom, setZoom] = useState<number>(2.2);
  const [center, setCenter] = useState<{ x: number; y: number }>({ x: 310, y: 340 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ clientX: number; clientY: number; startCenter: { x: number; y: number } } | null>(null);

  // Hover de país
  const [hoveredCountry, setHoveredCountry] = useState<WorldCountryGeometry | null>(null);

  // Soporte para pruebas y capturas automatizadas
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const action = sessionStorage.getItem("medstudy_world_action") || sessionStorage.getItem("medstudy_test_action");
      if (!action) return;
      sessionStorage.removeItem("medstudy_world_action");

      if (action === "global_view_latam") {
        setActivePreset("latam");
        setZoom(2.2);
        setCenter({ x: 310, y: 340 });
        setSelectedCountryCode("BOL");
        setSelectedParasiteId("p13-trypanosoma-cruzi");
      } else if (action === "global_view_world") {
        setActivePreset("world");
        setZoom(1);
        setCenter({ x: 500, y: 275 });
        setSelectedCountryCode("BRA");
        setSelectedParasiteId("p01-plasmodium-spp");
      } else if (action === "global_brazil_schistosoma") {
        setActivePreset("south_america");
        setZoom(2.5);
        setCenter({ x: 330, y: 390 });
        setSelectedCountryCode("BRA");
        setSelectedParasiteId("p21-schistosoma-mansoni");
      } else if (action === "global_africa_malaria") {
        setActivePreset("africa");
        setZoom(2.0);
        setCenter({ x: 530, y: 300 });
        setSelectedCountryCode("NGA");
        setSelectedParasiteId("p01-plasmodium-spp");
      } else if (action === "global_peru_leishmania") {
        setActivePreset("south_america");
        setZoom(2.5);
        setCenter({ x: 330, y: 390 });
        setSelectedCountryCode("PER");
        setSelectedParasiteId("p07-leishmania-spp");
      }
    } catch (e) {}
  }, []);

  // Parásito actual
  const currentParasite = useMemo(
    () => WORLD_DOCUMENTED_PARASITES.find((p) => p.id === selectedParasiteId) || WORLD_DOCUMENTED_PARASITES[0],
    [selectedParasiteId]
  );

  // Mapa de evidencias para el parásito seleccionado (Código País -> Registro)
  const parasiteRecordsMap = useMemo(() => {
    const map = new Map<string, (typeof WORLD_PARASITE_RECORDS)[0]>();
    const records = getWorldRecordsForParasite(selectedParasiteId);
    records.forEach((r) => map.set(r.countryCode, r));
    return map;
  }, [selectedParasiteId]);

  // País actualmente seleccionado
  const selectedCountry = useMemo(
    () => WORLD_COUNTRIES_GEOMETRY.find((c) => c.id === selectedCountryCode) || WORLD_COUNTRIES_GEOMETRY[0],
    [selectedCountryCode]
  );

  // Registro del país seleccionado para el parásito actual
  const currentRecord = useMemo(
    () => getWorldRecord(selectedCountryCode, selectedParasiteId),
    [selectedCountryCode, selectedParasiteId]
  );

  // Todos los registros del país seleccionado (para otros parásitos)
  const countryAllRecords = useMemo(
    () => getWorldRecordsForCountry(selectedCountryCode),
    [selectedCountryCode]
  );

  // Lista de países filtrada para el buscador
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return WORLD_COUNTRIES_GEOMETRY;
    const q = countrySearch.toLowerCase();
    return WORLD_COUNTRIES_GEOMETRY.filter(
      (c) => c.nameEs.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  // Manejo de cambio de preset
  const handleSelectPreset = (presetId: string) => {
    const preset = WORLD_VIEW_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePreset(presetId);
    setZoom(preset.zoom);
    setCenter(preset.center);
  };

  // Controles de zoom
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.5, 6.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.5, 0.8));
  const handleReset = () => {
    const defaultPreset = WORLD_VIEW_PRESETS.find((p) => p.id === "latam") || WORLD_VIEW_PRESETS[0];
    setActivePreset("latam");
    setZoom(defaultPreset.zoom);
    setCenter(defaultPreset.center);
  };

  // Manejo de arrastre (Pan) con Mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setDragStart({ clientX: e.clientX, clientY: e.clientY, startCenter: { ...center } });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !dragStart) return;
    const dx = e.clientX - dragStart.clientX;
    const dy = e.clientY - dragStart.clientY;
    const svgEl = svgRef.current;
    const svgRect = svgEl?.getBoundingClientRect();
    const scaleRatio = 1000 / (svgRect?.width || 700);
    setCenter({
      x: Math.max(50, Math.min(950, dragStart.startCenter.x - (dx * scaleRatio) / zoom)),
      y: Math.max(50, Math.min(500, dragStart.startCenter.y - (dy * scaleRatio) / zoom)),
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDragStart(null);
  };

  // Manejo de touch para dispositivos móviles
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setDragStart({
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
        startCenter: { ...center }
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPanning || !dragStart || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.clientX;
    const dy = e.touches[0].clientY - dragStart.clientY;
    const svgEl = svgRef.current;
    const svgRect = svgEl?.getBoundingClientRect();
    const scaleRatio = 1000 / (svgRect?.width || 700);
    setCenter({
      x: Math.max(50, Math.min(950, dragStart.startCenter.x - (dx * scaleRatio) / zoom)),
      y: Math.max(50, Math.min(500, dragStart.startCenter.y - (dy * scaleRatio) / zoom)),
    });
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setDragStart(null);
  };

  // Helper para estilos de relleno según evidencia
  const getCountryStyles = (countryCode: string) => {
    const isSelected = countryCode === selectedCountryCode;
    const record = parasiteRecordsMap.get(countryCode);

    if (!record) {
      // Sin datos documentados para este parásito
      return {
        fill: isSelected ? "#1e293b" : "#0b1220",
        fillOpacity: isSelected ? 0.95 : 0.65,
        stroke: isSelected ? "#ffffff" : "#1e293b",
        strokeWidth: isSelected ? 2.5 : 0.65,
        cursor: "pointer"
      };
    }

    switch (record.evidenceCategory) {
      case "endemico_alta_carga":
        return {
          fill: isSelected ? "#f59e0b" : "#b45309",
          fillOpacity: isSelected ? 0.98 : 0.75,
          stroke: isSelected ? "#ffffff" : "#d97706",
          strokeWidth: isSelected ? 2.8 : 0.85,
          cursor: "pointer"
        };
      case "endemico_focos_regionales":
        return {
          fill: isSelected ? "#06b6d4" : "#0e7490",
          fillOpacity: isSelected ? 0.98 : 0.75,
          stroke: isSelected ? "#ffffff" : "#0891b2",
          strokeWidth: isSelected ? 2.8 : 0.85,
          cursor: "pointer"
        };
      case "interrupcion_eliminacion":
        return {
          fill: isSelected ? "#a855f7" : "#7e22ce",
          fillOpacity: isSelected ? 0.98 : 0.75,
          stroke: isSelected ? "#ffffff" : "#9333ea",
          strokeWidth: isSelected ? 2.8 : 0.85,
          cursor: "pointer"
        };
      case "vigilancia_casos_importados":
        return {
          fill: isSelected ? "#6366f1" : "#4338ca",
          fillOpacity: isSelected ? 0.98 : 0.75,
          stroke: isSelected ? "#ffffff" : "#4f46e5",
          strokeWidth: isSelected ? 2.8 : 0.85,
          cursor: "pointer"
        };
      case "libre_sin_transmision":
        return {
          fill: isSelected ? "#10b981" : "#047857",
          fillOpacity: isSelected ? 0.98 : 0.75,
          stroke: isSelected ? "#ffffff" : "#059669",
          strokeWidth: isSelected ? 2.8 : 0.85,
          cursor: "pointer"
        };
      default:
        return {
          fill: isSelected ? "#38bdf8" : "#1e293b",
          fillOpacity: isSelected ? 0.95 : 0.65,
          stroke: isSelected ? "#ffffff" : "#334155",
          strokeWidth: isSelected ? 2.5 : 0.75,
          cursor: "pointer"
        };
    }
  };

  return (
    <div className="space-y-4">
      
      {/* 1. Barra de Controles Superiores: Selector de Parásito & Presets Regionales */}
      <div className="p-4 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-xl space-y-4">
        
        {/* Fila 1: Selector de Parásito y Búsqueda de País */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Selector de Parásito Global */}
          <div className="flex-1 space-y-1">
            <label htmlFor="world-parasite-select" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
              <Bug className="w-3.5 h-3.5 text-purple-400" />
              <span>Parásito en Vigilancia Internacional:</span>
            </label>
            <div className="relative">
              <select
                id="world-parasite-select"
                value={selectedParasiteId}
                onChange={(e) => setSelectedParasiteId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 hover:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all cursor-pointer min-h-[44px]"
              >
                {WORLD_DOCUMENTED_PARASITES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.commonName}) · {p.whoCategory}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selector / Buscador Rápido de País */}
          <div className="w-full lg:w-80 space-y-1">
            <label htmlFor="world-country-select" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>País en Consulta ({WORLD_COUNTRIES_GEOMETRY.length} Países):</span>
            </label>
            <div className="relative">
              <select
                id="world-country-select"
                value={selectedCountryCode}
                onChange={(e) => {
                  setSelectedCountryCode(e.target.value);
                  const country = WORLD_COUNTRIES_GEOMETRY.find((c) => c.id === e.target.value);
                  if (country) {
                    setCenter({ x: country.center.x, y: country.center.y });
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 hover:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all cursor-pointer min-h-[44px]"
              >
                <optgroup label="América Latina & Caribe (Prioritarios)">
                  {WORLD_COUNTRIES_GEOMETRY.filter((c) => c.isLatAm)
                    .sort((a, b) => a.nameEs.localeCompare(b.nameEs))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameEs} ({c.id}) {parasiteRecordsMap.has(c.id) ? "• Con Evidencia" : ""}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Resto del Mundo">
                  {WORLD_COUNTRIES_GEOMETRY.filter((c) => !c.isLatAm)
                    .sort((a, b) => a.nameEs.localeCompare(b.nameEs))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameEs} ({c.id}) {parasiteRecordsMap.has(c.id) ? "• Con Evidencia" : ""}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>
          </div>

        </div>

        {/* Fila 2: Presets de Encuadre Geográfico (América Latina, África, Asia, Mundo) */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            <span>Enfoque Territorial:</span>
          </span>
          {WORLD_VIEW_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px] flex items-center gap-1.5 ${
                activePreset === preset.id
                  ? "bg-purple-600 text-white shadow-md shadow-purple-950 font-bold border border-purple-400"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white"
              }`}
            >
              <span>{preset.label}</span>
            </button>
          ))}
        </div>

      </div>

      {/* 2. Cuerpo Principal: Visor SVG Mundial & Panel de Ficha Epidemiológica */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Columna Izquierda: Visor SVG Mundial Interactivo */}
        <div className="lg:col-span-7 space-y-3">
          
          <div className="relative rounded-3xl border border-slate-800 bg-slate-950/95 overflow-hidden shadow-2xl">
            
            {/* Barra de Herramientas Flotante del Mapa */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-2xl p-1.5 shadow-lg">
              <button
                onClick={handleZoomIn}
                title="Acercar mapa (+)"
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
                aria-label="Acercar mapa"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                title="Alejar mapa (-)"
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
                aria-label="Alejar mapa"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />
              <button
                onClick={handleReset}
                title="Restablecer encuadre inicial"
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
                aria-label="Restablecer encuadre inicial"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Badge de Parásito en Vigilancia */}
            <div className="absolute top-3 right-3 z-20 hidden sm:flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-2xl px-3 py-1.5 text-xs shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="font-semibold text-slate-300 italic">{currentParasite.name}</span>
            </div>

            {/* Contenedor del Lienzo SVG */}
            <div
              className={`relative aspect-[16/10] sm:aspect-[16/9] w-full select-none ${
                isPanning ? "cursor-grabbing" : "cursor-grab"
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <svg
                ref={svgRef}
                viewBox={`0 0 ${WORLD_MAP_DIMENSIONS.width} ${WORLD_MAP_DIMENSIONS.height}`}
                className="w-full h-full"
                aria-label="Mapa mundial interactivo de distribución de parásitos"
                role="region"
              >
                <defs>
                  {/* Gradiente oceánico de fondo */}
                  <radialGradient id="world-ocean-gradient" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#070c18" />
                    <stop offset="100%" stopColor="#020617" />
                  </radialGradient>

                  {/* Resalte luminoso para el país seleccionado */}
                  <filter id="country-selected-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#a855f7" floodOpacity="0.9" />
                    <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#ffffff" floodOpacity="0.8" />
                  </filter>

                  {/* Patrón de cuadrícula de latitud y longitud sutil */}
                  <pattern id="world-grid" width="100" height="55" patternUnits="userSpaceOnUse">
                    <path d="M 100 0 L 0 0 0 55" fill="none" stroke="#1e293b" strokeWidth="0.35" strokeDasharray="2,3" />
                  </pattern>
                </defs>

                {/* Fondo oceánico */}
                <rect width="1000" height="550" fill="url(#world-ocean-gradient)" />
                <rect width="1000" height="550" fill="url(#world-grid)" />

                {/* Línea del Ecuador (0°) y Trópicos */}
                <g className="pointer-events-none opacity-25">
                  <line x1="0" y1="275" x2="1000" y2="275" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="4,4" />
                  <line x1="0" y1="205" x2="1000" y2="205" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="2,4" />
                  <line x1="0" y1="345" x2="1000" y2="345" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="2,4" />
                </g>

                {/* Grupo transformable con Zoom y Pan */}
                <g
                  id="world-countries-group"
                  transform={`translate(500, 275) scale(${zoom}) translate(${-center.x}, ${-center.y})`}
                  className="transition-transform duration-75 ease-out"
                >
                  {WORLD_COUNTRIES_GEOMETRY.map((country) => {
                    const isSelected = country.id === selectedCountryCode;
                    const styles = getCountryStyles(country.id);
                    const record = parasiteRecordsMap.get(country.id);

                    return (
                      <g
                        key={country.id}
                        id={`country-${country.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCountryCode(country.id);
                        }}
                        onMouseEnter={() => setHoveredCountry(country)}
                        onMouseLeave={() => setHoveredCountry(null)}
                        className="group cursor-pointer focus:outline-none"
                        role="button"
                        tabIndex={0}
                        aria-label={`${country.nameEs} (${country.id}). ${
                          record ? `Con evidencia: ${record.evidenceLabel}` : "Sin datos específicos para esta especie"
                        }`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedCountryCode(country.id);
                          }
                        }}
                      >
                        <path
                          d={country.path}
                          fill={styles.fill}
                          fillOpacity={styles.fillOpacity}
                          stroke={isSelected ? "#ffffff" : styles.stroke}
                          strokeWidth={isSelected ? 2.6 / zoom : styles.strokeWidth / zoom}
                          filter={isSelected ? "url(#country-selected-glow)" : undefined}
                          className="transition-all hover:brightness-125 hover:stroke-white"
                        />

                        {/* Pin animado en el centroide del país seleccionado */}
                        {isSelected && (
                          <g transform={`translate(${country.center.x}, ${country.center.y})`}>
                            <circle
                              r={6 / zoom}
                              fill="#ffffff"
                              stroke="#a855f7"
                              strokeWidth={2 / zoom}
                              className="animate-pulse"
                            />
                            <circle
                              r={2.5 / zoom}
                              fill="#9333ea"
                            />
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Tooltip flotante al hacer hover sobre un país */}
              {hoveredCountry && (
                <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white shadow-xl pointer-events-none flex items-center gap-2">
                  <span className="font-bold text-purple-300">{hoveredCountry.nameEs}</span>
                  <span className="text-slate-400 font-mono text-[11px]">({hoveredCountry.id})</span>
                  {parasiteRecordsMap.has(hoveredCountry.id) && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/40">
                      {parasiteRecordsMap.get(hoveredCountry.id)?.evidenceLabel}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Leyenda y Código de Colores Global */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Leyenda Epidemiológica Internacional (OPS / OMS):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-amber-950/20 border border-amber-800/30">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-white flex-shrink-0" />
                  <span className="text-amber-200">Endemia / Alta Carga</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-cyan-950/20 border border-cyan-800/30">
                  <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 border border-white flex-shrink-0" />
                  <span className="text-cyan-200">Endemia Focalizada</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-purple-950/20 border border-purple-800/30">
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-500 border border-white flex-shrink-0" />
                  <span className="text-purple-200">Transmisión Interrumpida</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-indigo-950/20 border border-indigo-800/30">
                  <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 border border-white flex-shrink-0" />
                  <span className="text-indigo-200">Casos Importados</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white flex-shrink-0" />
                  <span className="text-emerald-200">Sin Transmisión / Libre</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-600 flex-shrink-0" />
                  <span className="text-slate-400">Sin datos específicos</span>
                </div>
              </div>
            </div>

          </div>

          {/* Metadatos Cartográficos Internacionales */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                <Info className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>Metadatos: Proyección Miller Cilíndrica (1000×550) · 179 Países Oficiales</span>
              </span>
              <span className="font-mono text-slate-500 text-[10px]">ISO 3166-1 alpha-3</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-snug">
              Fuentes: Organización Panamericana de la Salud (OPS), Organización Mundial de la Salud (OMS), CDC y ministerios de salud locales.
            </p>
          </div>

        </div>

        {/* Columna Derecha: Ficha Epidemiológica del País Seleccionado */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            
            {/* Cabecera del País */}
            <div className="space-y-2 pb-4 border-b border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800/50 font-bold flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-purple-400" />
                  <span>{selectedCountry.region}</span>
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Cód. ISO: {selectedCountry.id}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {selectedCountry.nameEs}
              </h3>

              {/* Parásito en foco */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                <div className="text-xs text-slate-300">
                  Especie en consulta:{" "}
                  <strong className="text-purple-300 italic text-sm">{currentParasite.name}</strong>
                  <div className="text-[11px] text-slate-500">{currentParasite.commonName}</div>
                </div>

                {/* Si el país tiene otros parásitos documentados en la BD */}
                {countryAllRecords.length > 1 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400">Otros en {selectedCountry.nameEs}:</span>
                    {countryAllRecords.map((r) => (
                      <button
                        key={r.parasiteId}
                        onClick={() => setSelectedParasiteId(r.parasiteId)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                          selectedParasiteId === r.parasiteId
                            ? "bg-purple-600 text-white shadow-sm font-bold"
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

            {/* Contenido condicional: Ficha con evidencia internacional vs. Sin datos específicos */}
            {currentRecord ? (
              <div className="space-y-4">
                
                {/* Badge de Categoría de Evidencia */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-3 py-1 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-500/40 font-semibold flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentRecord.evidenceLabel}</span>
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    Ref: {currentRecord.referenceYear}
                  </span>
                </div>

                {/* Estado Epidemiológico General */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Situación Epidemiológica & Estado de Transmisión:
                  </span>
                  <p className="text-sm font-semibold text-slate-200 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 leading-snug">
                    {currentRecord.epidemiologicalStatus}
                  </p>
                </div>

                {/* Prevalencia / Casos Documentados */}
                <div className="p-3.5 rounded-2xl bg-purple-950/25 border border-purple-800/40 space-y-1">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Carga de Casos / Seroprevalencia Reportada:</span>
                  </span>
                  <p className="text-xs text-purple-100/90 leading-relaxed font-medium">
                    {currentRecord.casesOrPrevalence}
                  </p>
                </div>

                {/* Vectores o Hospederos Intermediarios */}
                {currentRecord.vectorsOrIntermediateHosts && (
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Bug className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Vectores / Hospederos Intermediarios Involucrados:</span>
                    </span>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      {currentRecord.vectorsOrIntermediateHosts}
                    </p>
                  </div>
                )}

                {/* Zonas y Focos Endémicos Clave */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>Focos Geográficos Principales en el País:</span>
                  </span>
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/70 leading-relaxed">
                    {currentRecord.keyRegionsOrEndemicAreas}
                  </p>
                </div>

                {/* Medidas de Salud Pública & Metas Internacionales */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block">
                    Metas de Salud Pública & Programas de Control:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                    {currentRecord.publicHealthMeasures}
                  </p>
                </div>

                {/* Limitación Metodológica y Subnotificación */}
                <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-800/30 text-xs space-y-1">
                  <span className="text-amber-300 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>Limitación Metodológica del Registro:</span>
                  </span>
                  <p className="text-amber-200/90 leading-relaxed text-[11px]">
                    {currentRecord.limitations}
                  </p>
                </div>

                {/* Fuente Oficial */}
                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    Fuente: <strong className="text-slate-300">{currentRecord.source}</strong>
                  </div>
                  {currentRecord.sourceUrl && (
                    <a
                      href={currentRecord.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium transition-colors"
                    >
                      <span>Portal oficial</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

              </div>
            ) : (
              /* Estado sin datos específicos para este país y especie */
              <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 text-center">
                <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-300">
                    Sin registro específico para {selectedCountry.nameEs} y {currentParasite.name}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                    Actualmente no se han incorporado registros epidemiológicos individualizados de{" "}
                    <strong className="text-purple-300 italic">{currentParasite.name}</strong> para{" "}
                    <strong>{selectedCountry.nameEs}</strong> en la base pedagógica de vigilancia.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/30 text-[11px] text-amber-200/90 text-left space-y-1">
                  <strong className="block text-amber-300 font-semibold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>Principio Epidemiológico de Rigor:</span>
                  </strong>
                  <p className="leading-relaxed">
                    La falta de datos en esta plataforma refleja los focos priorizados en los planes curriculares de Tecnología Médica, y <strong>nunca debe interpretarse como ausencia biológica del patógeno</strong> en el territorio.
                  </p>
                </div>

                {/* Si el país tiene otros parásitos documentados en la BD */}
                {countryAllRecords.length > 0 && (
                  <div className="pt-2 text-left space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Parásitos documentados en {selectedCountry.nameEs}:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {countryAllRecords.map((r) => (
                        <button
                          key={r.parasiteId}
                          onClick={() => setSelectedParasiteId(r.parasiteId)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-purple-500 text-xs text-slate-200 hover:text-purple-200 transition-all font-medium"
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

        </div>

      </div>

    </div>
  );
};
