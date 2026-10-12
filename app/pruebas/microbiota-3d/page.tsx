"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import MedStudyAnatomy, {
  AnatomyHandle,
  RegionId,
  AnatomyVariant,
  RegionSelection,
} from "@/components/MedStudyAnatomy";
import { GlassCard } from "@/components/ui/GlassCard";
import { MicrobiotaCard } from "@/components/MicrobiotaCard";
import { MicrobiotaDetailModal } from "@/components/MicrobiotaDetailModal";
import {
  MICROBIOTA_CATALOG,
  REGIONS_METADATA,
  MicrobiotaEntry,
  RegionMetadata,
  ReviewStatus,
} from "@/data/microbiota-catalog";
import {
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  Layers,
  Info,
  CheckCircle2,
  Clock,
  FileText,
  ExternalLink,
  Search,
  Filter,
  Compass,
  Cpu,
  Check,
  X,
  Bug,
  HelpCircle,
  Eye,
  BookOpen,
  ChevronRight,
  Move,
  Maximize2,
  ShieldAlert,
} from "lucide-react";

type ActiveTab = "3d" | "cards";

export default function Microbiota3DPruebaPage() {
  const anatomyRef = useRef<AnatomyHandle>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("3d");
  const [selectedVariant, setSelectedVariant] = useState<AnatomyVariant>("female");
  const [selectedRegionId, setSelectedRegionId] = useState<RegionId | "all">("colon");
  const [lastSelection, setLastSelection] = useState<RegionSelection | null>(null);

  // Estados de búsqueda y filtros para la vista "Ver tarjetas"
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "bacteria" | "hongo" | "por_verificar">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ReviewStatus>("all");

  // Modales y accesibilidad de foco
  const [selectedEntryForModal, setSelectedEntryForModal] = useState<MicrobiotaEntry | null>(null);
  const [lastFocusedElement, setLastFocusedElement] = useState<HTMLElement | null>(null);
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);

  // Parámetros iniciales por URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "cards" || tabParam === "3d") {
        setActiveTab(tabParam);
      }
      if (params.has("credits")) {
        setCreditsModalOpen(true);
      }
      const regionParam = params.get("region") as RegionId | null;
      if (regionParam && REGIONS_METADATA[regionParam]) {
        setSelectedRegionId(regionParam);
      }
      const entryParam = params.get("entry");
      if (entryParam) {
        const found = MICROBIOTA_CATALOG.find((e) => e.id === entryParam);
        if (found) {
          setSelectedEntryForModal(found);
          setSelectedRegionId(found.regionId);
        }
      }
    }
  }, []);

  const handleIframeReady = () => {
    setIframeReady(true);
    if (selectedRegionId !== "all") {
      anatomyRef.current?.selectRegion(selectedRegionId, selectedVariant);
    }
  };

  // Manejo de eventos procedentes del iframe (clic en marcador del modelo 3D)
  const handleRegionChangeFromIframe = (selection: RegionSelection) => {
    setLastSelection(selection);
    setSelectedVariant(selection.variant);
    setSelectedRegionId(selection.regionId);
  };

  // Selección de región desde controles de MedStudy
  const handleSelectRegionFromHost = (regionId: RegionId | "all") => {
    setSelectedRegionId(regionId);
    if (regionId !== "all") {
      const regMeta = REGIONS_METADATA[regionId];
      if (regMeta.variants.length === 1 && regMeta.variants[0] !== selectedVariant) {
        const targetVar = regMeta.variants[0];
        setSelectedVariant(targetVar);
        anatomyRef.current?.changeVariant(targetVar);
      }
      anatomyRef.current?.selectRegion(regionId);
    } else {
      anatomyRef.current?.reset();
    }
  };

  const handleVariantChangeFromHost = (variant: AnatomyVariant) => {
    setSelectedVariant(variant);
    anatomyRef.current?.changeVariant(variant);

    if (selectedRegionId !== "all") {
      const regMeta = REGIONS_METADATA[selectedRegionId];
      if (!regMeta.variants.includes(variant)) {
        setSelectedRegionId("colon");
        anatomyRef.current?.selectRegion("colon", variant);
      }
    }
  };

  // Apertura de ficha guardando el elemento disparador para devolver foco al cerrar
  const handleOpenFicha = (entry: MicrobiotaEntry, triggerEl?: HTMLElement | null) => {
    setLastFocusedElement(triggerEl || (document.activeElement as HTMLElement) || null);
    setSelectedEntryForModal(entry);
  };

  const handleCloseFicha = () => {
    setSelectedEntryForModal(null);
  };

  // Entradas de la región activa para la vista "Explorar en 3D"
  const entriesFor3DRegion = useMemo(() => {
    if (selectedRegionId === "all") {
      return MICROBIOTA_CATALOG;
    }
    return MICROBIOTA_CATALOG.filter((e) => e.regionId === selectedRegionId);
  }, [selectedRegionId]);

  // Entradas filtradas para la vista "Ver tarjetas"
  const filteredCatalogEntries = useMemo(() => {
    return MICROBIOTA_CATALOG.filter((entry) => {
      if (selectedRegionId !== "all" && entry.regionId !== selectedRegionId) {
        return false;
      }
      if (typeFilter !== "all" && entry.type !== typeFilter) {
        return false;
      }
      if (statusFilter !== "all" && entry.reviewStatus !== statusFilter) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchScientific = entry.scientificName.toLowerCase().includes(q);
        const matchSpanish = entry.spanishName.toLowerCase().includes(q);
        const matchSubzone = entry.subzone.toLowerCase().includes(q);
        const matchSynonyms = entry.synonyms.some((s) => s.toLowerCase().includes(q));

        if (!matchScientific && !matchSpanish && !matchSubzone && !matchSynonyms) {
          return false;
        }
      }
      return true;
    });
  }, [selectedRegionId, typeFilter, statusFilter, searchQuery]);

  const activeRegionMetadata = selectedRegionId !== "all" ? REGIONS_METADATA[selectedRegionId] : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-16 px-3 sm:px-6">
      {/* Barra de navegación de retorno y contexto de prueba */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 w-fit min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
          <span>Volver al Dashboard</span>
        </Link>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-300">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-500">Pruebas internas</span>
          <span>/</span>
          <span className="text-purple-400 font-medium">Microbiota 3D</span>
        </div>
      </div>

      {/* Encabezado Principal de la Prueba */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-wide uppercase shadow-lg shadow-amber-950/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Prototipo</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-medium">
              <Cpu className="w-3 h-3 text-purple-400" />
              <span>Catálogo PDF integrado · 97 Fichas</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium">
              <BookOpen className="w-3 h-3 text-indigo-400" />
              <span>10 Regiones traducidas</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Prueba del explorador de microbiota 3D
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
            Explora las comunidades de microbiota comensal y mutualista por región corporal conectando el atlas tridimensional con las fichas educativas detalladas.
          </p>
        </div>

        {/* Botón para abrir el panel de fuentes, créditos y licencias */}
        <button
          onClick={() => setCreditsModalOpen(true)}
          className="self-start md:self-auto inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-200 text-xs font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-purple-950/30 min-h-[44px]"
        >
          <FileText className="w-4 h-4 text-purple-400" />
          <span>Fuentes y Licencias</span>
        </button>
      </div>

      {/* Panel informativo de límites anatómicos y técnicos */}
      <GlassCard className="p-4 sm:p-5 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent space-y-2.5 shadow-xl">
        <div className="flex items-center space-x-2 text-amber-300 font-extrabold text-xs sm:text-sm tracking-tight">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Límites anatómicos y alcance del prototipo</span>
        </div>

        <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
          Boca y nariz representan superficie externa. Genitales (vulva, vagina, uretra y pene completo) continúan pendientes de mallas con licencia abierta. El glande se visualiza aislado y el colon mantiene íntegras sus 16 entradas sin inferencias clínicas automáticas.
        </p>
      </GlassCard>

      {/* ========================================================================= */}
      {/* SELECTOR DE PESTAÑAS PRINCIPALES: SOLO UNA VISTA VISIBLE A LA VEZ */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Modo de visualización"
            className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl max-w-full overflow-x-auto"
          >
            <button
              role="tab"
              id="tab-3d"
              aria-selected={activeTab === "3d"}
              aria-controls="panel-3d"
              onClick={() => setActiveTab("3d")}
              className={`min-h-[44px] min-w-[140px] px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
                activeTab === "3d"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-950/50 scale-[1.02]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explorar en 3D</span>
            </button>

            <button
              role="tab"
              id="tab-cards"
              aria-selected={activeTab === "cards"}
              aria-controls="panel-cards"
              onClick={() => setActiveTab("cards")}
              className={`min-h-[44px] min-w-[140px] px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
                activeTab === "cards"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-950/50 scale-[1.02]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Ver tarjetas</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                activeTab === "cards" ? "bg-white/20 text-white" : "bg-white/10 text-slate-300"
              }`}>
                97
              </span>
            </button>
          </div>

          {/* Estado de continuidad: Región activa conservada entre pestañas */}
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Región seleccionada:</span>
            {activeRegionMetadata ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold min-h-[36px]">
                <span>{activeRegionMetadata.name}</span>
                <span className="text-[10px] text-purple-400 font-mono">({activeRegionMetadata.pdfEntryCount})</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-medium min-h-[36px]">
                Todas las regiones (97)
              </span>
            )}
          </div>
        </div>

        {/* Píldoras de selección de región compartidas */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Seleccionar región corporal:
            </span>
            <button
              onClick={() => handleSelectRegionFromHost("all")}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs transition-all flex items-center justify-center ${
                selectedRegionId === "all"
                  ? "bg-purple-600 text-white border-purple-500 font-bold shadow-md shadow-purple-950/40"
                  : "text-slate-400 hover:text-white border-white/5 hover:bg-white/5"
              }`}
            >
              Ver todas ({MICROBIOTA_CATALOG.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {(Object.keys(REGIONS_METADATA) as RegionId[]).map((rId) => {
              const rMeta = REGIONS_METADATA[rId];
              const isSelected = selectedRegionId === rId;
              return (
                <button
                  key={rId}
                  onClick={() => handleSelectRegionFromHost(rId)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center space-x-1.5 outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
                    isSelected
                      ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-950/50 scale-[1.02]"
                      : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                  }`}
                  aria-pressed={isSelected}
                >
                  <span>{rMeta.name}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      rMeta.has3D ? "bg-emerald-400" : "bg-amber-400 ring-1 ring-amber-400/50"
                    }`}
                    title={rMeta.has3D ? "3D Disponible" : "Representación 3D pendiente"}
                  />
                  <span className="text-[10px] opacity-75 font-mono">({rMeta.pdfEntryCount})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. VISTA “EXPLORAR EN 3D” */}
      {/* ========================================================================= */}
      <section
        id="panel-3d"
        role="tabpanel"
        aria-labelledby="tab-3d"
        className={activeTab === "3d" ? "block space-y-6" : "hidden"}
      >
        {/* Barra de variante anatómica para la vista 3D */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/40 border border-white/5 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-semibold">Variante del modelo:</span>
            <div className="inline-flex rounded-xl p-1 bg-black/40 border border-white/10">
              <button
                onClick={() => handleVariantChangeFromHost("female")}
                className={`min-h-[44px] min-w-[85px] px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
                  selectedVariant === "female"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-950/40"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Femenina
              </button>
              <button
                onClick={() => handleVariantChangeFromHost("male")}
                className={`min-h-[44px] min-w-[85px] px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
                  selectedVariant === "male"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-950/40"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Masculina
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>Toca o haz clic sobre los marcadores del cuerpo para enfocar una región.</span>
          </div>
        </div>

        {/* ESTRUCTURA RESPONSIVA DE LA VISTA 3D:
            - Computador (lg+): Modelo a la izquierda, ÚNICO panel a la derecha.
            - Celular (<lg): Modelo arriba con guía táctil, ÚNICA lista compacta abajo.
            - Sin listas duplicadas dentro del visor. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Contenedor del Visor 3D (Izquierda en desktop, arriba en móvil) */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-2">
            {/* Guía táctil y de salida para celular */}
            <div className="block lg:hidden px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-300 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Move className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Gira y acerca en el visor</span>
              </span>
              <span className="text-slate-400 text-[10px]">
                ↕ Desplaza la página fuera del marco
              </span>
            </div>

            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#101019] shadow-2xl">
              <MedStudyAnatomy
                ref={anatomyRef}
                onReady={handleIframeReady}
                onRegionChange={handleRegionChangeFromIframe}
                onOpenEntry={(entryId) => {
                  const found = MICROBIOTA_CATALOG.find((e) => e.id === entryId);
                  if (found) handleOpenFicha(found);
                }}
                className="w-full h-[450px] sm:h-[520px] md:h-[620px] lg:h-[680px] xl:h-[720px] border-0"
              />
            </div>
          </div>

          {/* =================================================================== */}
          {/* ÚNICO PANEL DE MICROBIOTA DE LA REGIÓN EN LA VISTA 3D */}
          {/* En computador: a la derecha del visor.
              En celular: debajo del cuerpo, lista compacta sin descripción expandida. */}
          {/* =================================================================== */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-4">
            <GlassCard className="p-4 sm:p-5 md:p-6 rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl space-y-4">
              {/* Cabecera unificada: Título de la región y cantidad de entradas */}
              <div className="border-b border-white/10 pb-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                    {activeRegionMetadata ? "Microbiota de la región" : "Catálogo general"}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold font-mono text-xs">
                    {entriesFor3DRegion.length} {entriesFor3DRegion.length === 1 ? "microorganismo" : "microorganismos"}
                  </span>
                </div>

                {/* Título en formato exacto solicitado: "Piel · 9 microorganismos" */}
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {activeRegionMetadata ? activeRegionMetadata.name : "Todas las regiones"} · {entriesFor3DRegion.length} microorganismos
                </h2>

                {activeRegionMetadata && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        activeRegionMetadata.has3D
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {activeRegionMetadata.has3D ? "3D Disponible" : "Representación 3D pendiente"}
                    </span>
                    <span className="text-slate-400 text-[11px] truncate max-w-[280px]">
                      {activeRegionMetadata.anatomicalClarification}
                    </span>
                  </div>
                )}
              </div>

              {/* LISTADO ÚNICO DE MICROORGANISMOS:
                  Formato compacto en móvil (nombre y tipo, sin descripción desplegada).
                  Permite abrir ficha completa con teclado y toque, retornando el foco. */}
              <div
                className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1"
                role="list"
                aria-label={`Microorganismos de ${activeRegionMetadata ? activeRegionMetadata.name : "todas las regiones"}`}
              >
                {entriesFor3DRegion.length > 0 ? (
                  entriesFor3DRegion.map((entry) => {
                    const isBacteria = entry.type === "bacteria";
                    const isHongo = entry.type === "hongo";
                    const isUnconfirmed = entry.reviewStatus === "termino_por_confirmar";
                    const isCheckSource = entry.reviewStatus === "por_verificar_fuente";

                    return (
                      <div
                        key={entry.id}
                        role="listitem"
                        tabIndex={0}
                        onClick={(e) => handleOpenFicha(entry, e.currentTarget as HTMLElement)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleOpenFicha(entry, e.currentTarget as HTMLElement);
                          }
                        }}
                        className="group w-full p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-purple-500/40 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-purple-400 min-h-[48px] flex flex-col justify-center space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2 min-w-0">
                            {entry.catalogNumber !== undefined && (
                              <span className="text-[10px] font-mono font-bold text-purple-400/80 bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-500/20 shrink-0">
                                {entry.catalogNumber.toString().padStart(2, "0")}
                              </span>
                            )}
                            <h3 className="font-bold text-white text-xs sm:text-sm tracking-tight truncate group-hover:text-purple-300 transition-colors">
                              <em>{entry.scientificName}</em>
                            </h3>
                          </div>

                          <div className="flex items-center space-x-1.5 shrink-0">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                                isBacteria
                                  ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
                                  : isHongo
                                  ? "bg-purple-500/15 border-purple-500/30 text-purple-300"
                                  : "bg-amber-500/15 border-amber-500/30 text-amber-300"
                              }`}
                            >
                              {entry.type === "por_verificar" ? "Por verificar" : entry.type}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>

                        {/* Línea complementaria compacta (traducción/subzona y advertencias de revisión) */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-slate-400">
                          <span className="truncate max-w-[220px] sm:max-w-[300px]">
                            {entry.spanishName}
                          </span>

                          {isUnconfirmed && (
                            <span className="text-[9px] text-rose-300 bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 rounded-full shrink-0 font-medium">
                              ⚠️ Término por confirmar
                            </span>
                          )}

                          {isCheckSource && (
                            <span className="text-[9px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-full shrink-0 font-medium">
                              ⚠️ Verificar fuente
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    No se encontraron microorganismos para la región seleccionada.
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. VISTA “VER TARJETAS” */}
      {/* ========================================================================= */}
      <section
        id="panel-cards"
        role="tabpanel"
        aria-labelledby="tab-cards"
        className={activeTab === "cards" ? "block space-y-6" : "hidden"}
      >
        {/* Encabezado del catálogo con filtros y búsqueda */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Bug className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Catálogo de Tarjetas Educativas
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Comunidades de microorganismos con rol ecológico, subzonas y referencias científicas.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400">Mostrando:</span>
              <span className="px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold font-mono">
                {filteredCatalogEntries.length} {filteredCatalogEntries.length === 1 ? "tarjeta" : "tarjetas"}
              </span>
            </div>
          </div>

          {/* Banner de la región activa */}
          {activeRegionMetadata ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/50 border border-purple-500/30 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-white text-base">
                    {activeRegionMetadata.name} — {activeRegionMetadata.anatomicalTitle}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      activeRegionMetadata.has3D
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {activeRegionMetadata.has3D ? "Modelo 3D disponible" : "Representación 3D pendiente"}
                  </span>
                </div>

                <button
                  onClick={() => handleSelectRegionFromHost("all")}
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium underline"
                >
                  Ver todas las regiones
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {activeRegionMetadata.anatomicalClarification}
              </p>

              {/* Subzonas documentadas */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Subzonas:
                </span>
                {activeRegionMetadata.subzones.map((sz, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[10px] font-medium"
                  >
                    {sz}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  Consultando el catálogo completo de diez regiones traducidas más estructuras del atlas.
                </span>
              </div>
            </div>
          )}

          {/* Buscador reactivo y filtro por tipo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, sinónimo (ej. Propionibacterium, Branhamella) o subzona..."
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-900/80 border border-white/10 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[44px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full py-3 px-3 rounded-2xl bg-slate-900/80 border border-white/10 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[44px]"
              >
                <option value="all">Todos los tipos (Bacterias y Hongos)</option>
                <option value="bacteria">Sólo Bacterias</option>
                <option value="hongo">Sólo Hongos</option>
                <option value="por_verificar">Por verificar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cuadrícula de tarjetas:
            - Multi-columna en computador (md: 2 cols, lg: 3 cols).
            - En celular: 1 columna, sin desplazamiento horizontal. */}
        {filteredCatalogEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-hidden">
            {filteredCatalogEntries.map((entry) => (
              <MicrobiotaCard
                key={entry.id}
                entry={entry}
                onSelect={(ent) => handleOpenFicha(ent)}
              />
            ))}
          </div>
        ) : (
          <GlassCard className="p-12 text-center rounded-3xl border border-white/10 bg-slate-900/40 space-y-3">
            <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No se encontraron microorganismos</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No hay coincidencias para los filtros aplicados o el término de búsqueda &quot;{searchQuery}&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
                setSelectedRegionId("all");
              }}
              className="px-5 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/30 text-purple-200 text-xs font-semibold transition-colors min-h-[44px]"
            >
              Restablecer búsqueda y filtros
            </button>
          </GlassCard>
        )}
      </section>

      {/* ========================================================================= */}
      {/* MODAL DE FICHA EDUCATIVA DETALLADA */}
      {/* Conserva posición de lectura y devuelve foco al elemento original */}
      {/* ========================================================================= */}
      <MicrobiotaDetailModal
        entry={selectedEntryForModal}
        onClose={handleCloseFicha}
        returnFocusElement={lastFocusedElement}
      />

      {/* Diálogo Modal de Fuentes, Créditos y Licencias */}
      {creditsModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
        >
          <GlassCard className="max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border border-white/15 bg-slate-950/95 space-y-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">Fuentes, Créditos y Licencias</h2>
              </div>
              <button
                onClick={() => setCreditsModalOpen(false)}
                className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-300">
              <section className="space-y-1.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-bold text-sm text-purple-300">Catálogo de Microbiota Corporal (10 Regiones)</h3>
                <p>
                  Listas traducidas completas incorporadas como contenido principal: Ojo, Boca, Intestino delgado, Intestino grueso / Colon (16 entradas numeradas), Piel, Uretra, Vagina, Estómago, Oído y Nariz.
                </p>
              </section>

              <section className="space-y-1.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-bold text-sm text-indigo-300">Superficies Corporales (Femenina y Masculina) · CC0 1.0</h3>
                <p>
                  <strong>Human Base Meshes 1.4.1</strong> por Dan Ulrich, Blender Studio y comunidad de Blender. 
                  Dominio Público (CC0 1.0). Subdivisión nivel 1, centrado anatómico y material neutro.
                </p>
              </section>

              <section className="space-y-1.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-bold text-sm text-cyan-300">Intestino Delgado · CC BY 4.0</h3>
                <p>
                  <strong>BodyParts3D</strong>, © The Database Center for Life Science (DBCLS). CC Attribution 4.0 International.
                </p>
              </section>

              <section className="space-y-1.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-bold text-sm text-emerald-300">Colon y Glande · CC BY-SA 4.0</h3>
                <p>
                  <strong>Z-Anatomy</strong>, por Gauthier Kervyn, derivado de BodyParts3D / DBCLS. Compartido bajo CC BY-SA 4.0 con aviso histórico CC BY-SA 2.1 Japón.
                </p>
              </section>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-white/10">
                <span className="text-slate-400">Documentos originales incluidos en el visor:</span>
                <div className="flex items-center space-x-3">
                  <a
                    href="/medstudy-anatomy/docs/FUENTES-Y-LICENCIAS.md"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-purple-400 hover:text-purple-300 underline"
                  >
                    <span>FUENTES-Y-LICENCIAS.md</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="/medstudy-anatomy/docs/ESTADO-Y-PRUEBAS.md"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-purple-400 hover:text-purple-300 underline"
                  >
                    <span>ESTADO-Y-PRUEBAS.md</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCreditsModalOpen(false)}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors min-h-[44px]"
              >
                Entendido
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
