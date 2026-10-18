"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
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
  FileText,
  ExternalLink,
  Search,
  Filter,
  Compass,
  Cpu,
  X,
  Bug,
  HelpCircle,
  BookOpen,
  ChevronRight,
  Move,
  ShieldCheck,
} from "lucide-react";

type ActiveTab = "3d" | "cards";

export default function MicrobiotaDelCuerpoPublicPage() {
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
  const [scopeModalOpen, setScopeModalOpen] = useState(false);

  // Parámetros iniciales por URL si se navega con enlace directo
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "cards" || tabParam === "3d") {
        setActiveTab(tabParam);
      }
      if (params.has("alcance") || params.has("fuentes")) {
        setScopeModalOpen(true);
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
      {/* Navegación de retorno clara */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <Link
          href="/agentes-infecciosos"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 w-fit min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
          <span>Volver a Agentes Infecciosos</span>
        </Link>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-300">Dashboard</Link>
          <span>/</span>
          <Link href="/agentes-infecciosos" className="hover:text-slate-300">Agentes Infecciosos</Link>
          <span>/</span>
          <span className="text-emerald-400 font-medium">Microbioma del cuerpo humano</span>
        </div>
      </div>

      {/* Encabezado Principal del Módulo de Microbioma */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Atlas Anatómico</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-medium">
              <Cpu className="w-3 h-3 text-purple-400" />
              <span>Catálogo Taxonómico · 97 Fichas</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium">
              <BookOpen className="w-3 h-3 text-indigo-400" />
              <span>10 Regiones Corporales</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight break-words">
            Microbioma del cuerpo humano
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
            Exploración de las comunidades comensales y mutualistas que colonizan los distintos nichos anatómicos corporales, sus funciones biológicas de barrera y su rol en la homeostasis médica.
          </p>
        </div>

        {/* Botón para abrir Fuentes y Alcance */}
        <button
          onClick={() => setScopeModalOpen(true)}
          className="self-start md:self-auto inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-200 text-xs font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-purple-950/30 min-h-[44px]"
        >
          <FileText className="w-4 h-4 text-purple-400" />
          <span>Fuentes y Alcance</span>
        </button>
      </div>

      {/* Aclaración Clínica Fundamental (Conservada íntegramente) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 text-amber-200 shadow-xl space-y-2">
        <div className="flex items-center space-x-2 font-extrabold text-amber-300 text-xs sm:text-sm tracking-tight">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Aclaración Clínica Fundamental</span>
        </div>

        <p className="text-xs sm:text-sm font-bold text-white bg-slate-950/60 px-3.5 py-1.5 rounded-xl border border-amber-500/30 w-fit">
          &ldquo;La presencia de microorganismos no implica necesariamente infección.&rdquo;
        </p>

        <p className="text-slate-300 text-xs leading-relaxed max-w-3xl">
          La colonización comensal y mutualista en piel, mucosas y tracto digestivo forma parte inseparable de la biología humana sana. Cumple funciones vitales de exclusión competitiva frente a patógenos invasores, maduración inmunológica y metabolismo de nutrientes. El estado de infección sobreviene únicamente cuando se quiebra la homeostasis ecológica (disbiosis) o se vulneran las barreras epiteliales mecánicas.
        </p>
      </div>

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

          {/* Región activa conservada entre pestañas */}
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
          {/* Contenedor del Visor 3D */}
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
              <div className="border-b border-white/10 pb-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                    {activeRegionMetadata ? "Microbiota de la región" : "Catálogo general"}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold font-mono text-xs">
                    {entriesFor3DRegion.length} {entriesFor3DRegion.length === 1 ? "microorganismo" : "microorganismos"}
                  </span>
                </div>

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

              {/* LISTADO ÚNICO DE MICROORGANISMOS */}
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

        {/* Cuadrícula de tarjetas */}
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
      {/* ========================================================================= */}
      <MicrobiotaDetailModal
        entry={selectedEntryForModal}
        onClose={handleCloseFicha}
        returnFocusElement={lastFocusedElement}
      />

      {/* ========================================================================= */}
      {/* DIÁLOGO MODAL DE FUENTES, CRÉDITOS Y ALCANCE */}
      {/* ========================================================================= */}
      {scopeModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
        >
          <GlassCard className="max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border border-white/15 bg-slate-950/95 space-y-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">Fuentes, Créditos y Alcance</h2>
              </div>
              <button
                onClick={() => setScopeModalOpen(false)}
                className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-300">
              {/* Sección de Límites Anatómicos */}
              <section className="space-y-2 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                <h3 className="font-bold text-sm text-amber-300 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Límites anatómicos del explorador</span>
                </h3>
                <ul className="space-y-1.5 list-disc pl-4 text-[11px] text-slate-300">
                  <li><strong>Boca y nariz:</strong> representan exclusivamente su superficie externa (labios, piel nasal y abertura anterior). No integran cavidades internas profundas disecadas.</li>
                  <li><strong>Región genital:</strong> vulva, vagina, uretra y cuerpo peneano completo continúan pendientes de mallas anatómicas con licencia abierta verificable.</li>
                  <li><strong>Glande:</strong> se visualiza como un detalle anatómico aislado y centrado.</li>
                  <li><strong>Encaje orientativo:</strong> la disposición espacial de intestino delgado y colon es una referencia compartida entre variantes corporales.</li>
                  <li><strong>Cotejo científico:</strong> las menciones pendientes de verificación oficial (como <em>straphillus</em> y <em>Mycobacterium</em>) se señalan discretamente sin simular taxones.</li>
                </ul>
              </section>

              {/* Fuentes de microbiota */}
              <section className="space-y-1.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-bold text-sm text-purple-300">Catálogo de Microbiota Corporal (10 Regiones)</h3>
                <p>
                  Listado taxonómico exhaustivo de comunidades bacterianas y fúngicas: Ojo, Boca, Intestino delgado, Intestino grueso / Colon (16 entradas numeradas), Piel, Uretra, Vagina, Estómago, Oído y Nariz.
                </p>
              </section>

              {/* Licencias 3D */}
              <section className="space-y-1.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-bold text-sm text-indigo-300">Superficies Corporales (Femenina y Masculina) · CC0 1.0</h3>
                <p>
                  <strong>Human Base Meshes 1.4.1</strong> por Dan Ulrich, Blender Studio y comunidad de Blender. Dominio Público (CC0 1.0).
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
                  <strong>Z-Anatomy</strong>, por Gauthier Kervyn, derivado de BodyParts3D / DBCLS. Licencia CC BY-SA 4.0.
                </p>
              </section>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setScopeModalOpen(false)}
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
