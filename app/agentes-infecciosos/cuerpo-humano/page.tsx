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
  BODY_SYSTEMS_DATA,
  BodySystemDefinition,
  SystemInfection,
  getBodySystemById,
  getBodySystemsForRegion,
} from "@/lib/data/infection-hub/body-systems-data";
import {
  findAgent,
  resolveAgentLink,
  getAgentCatalogHref,
} from "@/lib/data/infection-hub/agents-link-registry";
import { getSourcesForSection } from "@/lib/data/infection-hub/weekly-sources-registry";
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
  X,
  Bug,
  HelpCircle,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Activity,
  Stethoscope,
  Microscope,
  FileCheck2,
  HeartPulse,
  Syringe,
  AlertCircle
} from "lucide-react";

type Perspective = "microbioma" | "infecciones";
type ExplorerMode = "3d" | "list";

export default function CuerpoHumanoInfeccionesPage() {
  const anatomyRef = useRef<AnatomyHandle>(null);
  const [iframeReady, setIframeReady] = useState(false);

  // Perspectiva activa: Microbioma vs Infecciones vs Cátedra
  const [perspective, setPerspective] = useState<Perspective>("microbioma");

  // Modo de navegación: Visor 3D o Lista Accesible
  const [explorerMode, setExplorerMode] = useState<ExplorerMode>("3d");

  // Región corporal y sistema seleccionado (inicia en superficie corporal / piel para optimizar carga inicial)
  const [selectedVariant, setSelectedVariant] = useState<AnatomyVariant>("female");
  const [selectedRegionId, setSelectedRegionId] = useState<RegionId | "all">("skin");
  const [selectedSystemId, setSelectedSystemId] = useState<string>("tegumentario");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("HEP-02");

  // Búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "bacteria" | "hongo" | "por_verificar">("all");

  // Contadores dinámicos y métricas curriculares verificadas
  const uniqueTaxaCount = useMemo(
    () => new Set(MICROBIOTA_CATALOG.map((m) => m.scientificName)).size,
    []
  );
  const totalRegionsCount = Object.keys(REGIONS_METADATA).length;

  // Modal de detalle y fuentes
  const [selectedEntryForModal, setSelectedEntryForModal] = useState<MicrobiotaEntry | null>(null);
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);

  // Lectura y sincronización de parámetros de URL iniciales y eventos de navegación (Atrás / Adelante)
  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);

      // Compatibilidad con enlaces antiguos de cuerpo-humano?vista=catedra: redirige a Preparación para Certamen 3
      if (params.get("vista") === "catedra") {
        const sys = params.get("sistema") || "hepatobiliar";
        const unidad = params.get("unidad");
        const dest = `/agentes-infecciosos/certamen-3?tema=${sys}${unidad ? `&unidad=${unidad}` : ""}`;
        window.location.replace(dest);
        return;
      }

      const vistaParam = params.get("vista") as Perspective | null;
      if (vistaParam === "infecciones" || vistaParam === "microbioma") {
        setPerspective(vistaParam);
      }
      const sistemaParam = params.get("sistema");
      if (sistemaParam && getBodySystemById(sistemaParam)) {
        setSelectedSystemId(sistemaParam);
      }
      const regionParam = params.get("region") as RegionId | null;
      if (regionParam && REGIONS_METADATA[regionParam]) {
        setSelectedRegionId(regionParam);
      }
      const modoParam = params.get("modo") as ExplorerMode | null;
      if (modoParam === "list" || modoParam === "3d") {
        setExplorerMode(modoParam);
      }
      const entryParam = params.get("entry");
      if (entryParam) {
        const found = MICROBIOTA_CATALOG.find((e) => e.id === entryParam);
        if (found) {
          setSelectedEntryForModal(found);
          setSelectedRegionId(found.regionId);
        }
      }
    };

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
      syncFromUrl();
      window.addEventListener("popstate", syncFromUrl);
      return () => window.removeEventListener("popstate", syncFromUrl);
    }
  }, []);

  const handleIframeReady = () => {
    setIframeReady(true);
    if (selectedRegionId !== "all") {
      anatomyRef.current?.selectRegion(selectedRegionId, selectedVariant);
    }
  };

  // Selección procedente del visor 3D (marcador en el modelo)
  const handleRegionChangeFromIframe = (selection: RegionSelection) => {
    setSelectedVariant(selection.variant);
    setSelectedRegionId(selection.regionId);

    // Sincronizar automáticamente el sistema correspondiente
    const matchingSystems = getBodySystemsForRegion(selection.regionId);
    if (matchingSystems.length > 0) {
      setSelectedSystemId(matchingSystems[0].id);
    }
  };

  // Selección manual de una región desde la lista accesible
  const handleSelectRegionFromList = (regionId: RegionId | "all") => {
    setSelectedRegionId(regionId);
    if (regionId === "all") return;

    if (REGIONS_METADATA[regionId]) {
      const reg = REGIONS_METADATA[regionId];
      // Si la región solo tiene una variante (ej. vagina solo female, pene solo male)
      if (reg.variants.length === 1) {
        setSelectedVariant(reg.variants[0]);
        anatomyRef.current?.changeVariant(reg.variants[0]);
      }
      anatomyRef.current?.selectRegion(regionId, reg.variants.includes(selectedVariant) ? selectedVariant : reg.variants[0]);

      const matchingSystems = getBodySystemsForRegion(regionId);
      if (matchingSystems.length > 0) {
        setSelectedSystemId(matchingSystems[0].id);
      }
    }
  };

  // Selección manual de un sistema corporal
  const handleSelectSystem = (systemId: string) => {
    setSelectedSystemId(systemId);
    const system = getBodySystemById(systemId);
    if (system && system.microbiomeRegionIds.length > 0) {
      // Si la región actual no pertenece a este sistema, seleccionar la primera región del sistema
      if (selectedRegionId === "all" || !system.microbiomeRegionIds.includes(selectedRegionId)) {
        handleSelectRegionFromList(system.microbiomeRegionIds[0]);
      }
    } else {
      // Sistema sin microbiota residente (ej. Sistema Nervioso Central o Cardiovascular)
      setSelectedRegionId("all");
    }
  };

  // Metadatos de la región actual
  const currentRegionMeta = selectedRegionId !== "all" ? REGIONS_METADATA[selectedRegionId] : null;
  const currentSystem = getBodySystemById(selectedSystemId) || BODY_SYSTEMS_DATA[0];

  // Entradas de microbiota filtradas para la región
  const regionMicrobiotaEntries = useMemo(() => {
    if (selectedRegionId === "all") return MICROBIOTA_CATALOG;
    return MICROBIOTA_CATALOG.filter((entry) => entry.regionId === selectedRegionId);
  }, [selectedRegionId]);

  const filteredMicrobiota = useMemo(() => {
    return regionMicrobiotaEntries.filter((entry) => {
      const matchesSearch =
        searchQuery === "" ||
        entry.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.spanishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.subzone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.synonyms && entry.synonyms.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchesType = typeFilter === "all" || entry.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [regionMicrobiotaEntries, searchQuery, typeFilter]);

  // Infecciones asociadas al sistema seleccionado
  const currentInfections = useMemo(() => {
    return currentSystem ? currentSystem.infections : [];
  }, [currentSystem]);

  // Fuentes semanales
  const weeklySources = useMemo(() => getSourcesForSection("cuerpo_humano"), []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      
      {/* 1. Barra de navegación superior con retroceso */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <Link
          href="/agentes-infecciosos"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 w-fit"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
          <span>Volver a Agentes Infecciosos</span>
        </Link>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-300">Dashboard</Link>
          <span>/</span>
          <Link href="/agentes-infecciosos" className="hover:text-slate-300">Agentes Infecciosos</Link>
          <span>/</span>
          <span className="text-emerald-400 font-medium">Microorganismos y Cuerpo Humano</span>
        </div>
      </div>

      {/* 2. Banner de Cabecera con Conmutador Principal */}
      <section className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-7 border border-white/15 shadow-2xl bg-gradient-to-r from-slate-950 via-slate-900/90 to-emerald-950/30">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Apartado 4 · Ecología y Patología Topográfica</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Microorganismos y Cuerpo Humano
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explora la relación entre el hospedero humano y el mundo microbiano: diferencia de forma explícita la <strong>microbiota residente comensal</strong> de las <strong>infecciones clínicas por sistemas</strong>, reconociendo la esterilidad fisiológica de los tejidos profundos.
            </p>
          </div>

          {/* Selector de Perspectiva (Microbioma vs Infecciones) */}
          <div className="p-1.5 rounded-2xl bg-slate-950/80 border border-white/15 shadow-xl flex flex-col sm:flex-row gap-2 self-start lg:self-center shrink-0">
            <button
              onClick={() => setPerspective("microbioma")}
              className={`
                px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 min-h-[44px]
                ${perspective === "microbioma"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/60 font-extrabold"
                  : "text-slate-400 hover:text-white hover:bg-white/5"}
              `}
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Microbioma ({MICROBIOTA_CATALOG.length} reg.)</span>
            </button>

            <button
              onClick={() => setPerspective("infecciones")}
              className={`
                px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 min-h-[44px]
                ${perspective === "infecciones"
                  ? "bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-lg shadow-rose-950/60 font-extrabold"
                  : "text-slate-400 hover:text-white hover:bg-white/5"}
              `}
            >
              <HeartPulse className="w-4 h-4 text-rose-300" />
              <span>Síndromes ({BODY_SYSTEMS_DATA.reduce((acc, s) => acc + s.infections.length, 0)})</span>
            </button>
          </div>

        </div>
      </section>

      {/* 3. Barra de Selección Anatómica: Sistemas y Métodos de Navegación (3D vs Lista) */}
      <div className="p-4 rounded-3xl bg-slate-950/80 border border-white/10 shadow-lg space-y-3">
        
        {/* Selector de Sistemas Corporales en Cuadrícula Adaptable (sin scroll horizontal) */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Selecciona un Sistema Corporal:</span>
            </span>

            {/* Alternar entre Visor 3D y Lista Accesible */}
            <div className="flex items-center gap-1 bg-slate-900 border border-white/10 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setExplorerMode("3d")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 min-h-[36px] ${
                  explorerMode === "3d" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Visor 3D</span>
              </button>
              <button
                type="button"
                onClick={() => setExplorerMode("list")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 min-h-[36px] ${
                  explorerMode === "list" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Lista Accesible</span>
              </button>
            </div>
          </div>

          {/* Cuadrícula adaptable de Sistemas Corporales: 1 columna en móvil estrecho, 2 en pantallas medianas, 3-4 en desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-2.5">
            {BODY_SYSTEMS_DATA.map((sys) => {
              const isSelected = selectedSystemId === sys.id;
              return (
                <button
                  key={sys.id}
                  type="button"
                  onClick={() => handleSelectSystem(sys.id)}
                  aria-pressed={isSelected}
                  className={`
                    w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all
                    flex items-center justify-between gap-2 text-left
                    ${isSelected
                      ? "bg-slate-800 text-white border-2 border-cyan-400 shadow-md shadow-cyan-950/40 ring-2 ring-cyan-500/20"
                      : "bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-850 border border-white/10"}
                  `}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" 
                      style={{ backgroundColor: sys.colorScheme.accent }} 
                      aria-hidden="true"
                    />
                    <span className="leading-snug break-words">
                      {sys.name}
                    </span>
                  </div>

                  {!sys.hasResidentMicrobiome ? (
                    <span 
                      title="Tejido fisiológicamente estéril sin microbiota residente"
                      className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium shrink-0 ml-1.5"
                    >
                      Sitio estéril
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                      {sys.microbiomeRegionIds.length} reg.
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-selector de Regiones Anatómicas (cuando el sistema tiene regiones) */}
        {currentSystem.microbiomeRegionIds.length > 0 && (
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0 py-1">
              <Compass className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Regiones de este sistema:</span>
            </span>

            <div className="flex flex-wrap gap-1.5">
              {currentSystem.microbiomeRegionIds.map((regId) => {
                const regMeta = REGIONS_METADATA[regId];
                if (!regMeta) return null;
                const isSelected = selectedRegionId === regId;
                return (
                  <button
                    key={regId}
                    type="button"
                    onClick={() => handleSelectRegionFromList(regId)}
                    aria-pressed={isSelected}
                    className={`
                      px-3 py-2 rounded-xl text-xs font-semibold transition-all min-h-[44px] flex items-center gap-1.5
                      ${isSelected
                        ? "bg-purple-600 text-white shadow-md shadow-purple-950 font-bold border border-purple-400"
                        : "bg-slate-900 hover:bg-slate-850 text-slate-300 border border-white/10 hover:text-white"}
                    `}
                  >
                    <span>{regMeta.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300 font-mono">
                      {MICROBIOTA_CATALOG.filter((e) => e.regionId === regId).length}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setSelectedRegionId("all")}
                aria-pressed={selectedRegionId === "all"}
                className={`
                  px-3 py-2 rounded-xl text-xs font-semibold transition-all min-h-[44px] flex items-center gap-1.5
                  ${selectedRegionId === "all"
                    ? "bg-slate-800 text-white border-2 border-white/40 shadow-sm"
                    : "bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-white/10"}
                `}
              >
                <span>Ver todas las regiones</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 4. Cuerpo Principal: Visor 3D / Lista Accesible + Contenido de Microbioma o Infecciones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Columna Izquierda: Visor Anatómico 3D o Lista Accesible de Selección */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Contenedor del Visor Anatómico 3D: se mantiene montado con 'hidden' para no reiniciar la escena ni recargar recursos al cambiar de modo */}
          <div className={explorerMode === "3d" ? "block space-y-3" : "hidden"}>
            <GlassCard className="p-4 rounded-3xl border border-white/10 bg-slate-950/80 shadow-xl space-y-3">
              {/* Controles del Visor 3D */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Explorador Anatómico 3D</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Selector de Variante Femenina / Masculina con targets >= 44x44px */}
                  <div className="flex rounded-xl bg-slate-900 p-0.5 border border-white/10">
                    <button
                      onClick={() => {
                        setSelectedVariant("female");
                        anatomyRef.current?.changeVariant("female");
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors min-h-[44px] flex items-center justify-center ${
                        selectedVariant === "female" ? "bg-purple-600 text-white shadow-md shadow-purple-950" : "text-slate-400 hover:text-white"
                      }`}
                      aria-label="Seleccionar variante femenina"
                      aria-pressed={selectedVariant === "female"}
                    >
                      Femenino
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVariant("male");
                        anatomyRef.current?.changeVariant("male");
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors min-h-[44px] flex items-center justify-center ${
                        selectedVariant === "male" ? "bg-cyan-600 text-white shadow-md shadow-cyan-950" : "text-slate-400 hover:text-white"
                      }`}
                      aria-label="Seleccionar variante masculina"
                      aria-pressed={selectedVariant === "male"}
                    >
                      Masculino
                    </button>
                  </div>

                  <button
                    onClick={() => anatomyRef.current?.reset()}
                    title="Restablecer posición inicial de cámara"
                    aria-label="Restablecer posición inicial de cámara"
                    className="p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Iframe del Modelo 3D */}
              <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/5">
                <MedStudyAnatomy
                  ref={anatomyRef}
                  onReady={handleIframeReady}
                  onRegionChange={handleRegionChangeFromIframe}
                  onOpenEntry={(entryId) => {
                    const found = MICROBIOTA_CATALOG.find((e) => e.id === entryId);
                    if (found) setSelectedEntryForModal(found);
                  }}
                  className="w-full h-full border-none"
                />
              </div>

              <p className="text-[11px] text-slate-400 text-center leading-tight">
                Toca o haz clic sobre los marcadores del cuerpo para seleccionar la región correspondiente.
              </p>
            </GlassCard>
          </div>

          {/* Contenedor de la Lista Accesible de Selección */}
          <div className={explorerMode === "list" ? "block" : "hidden"}>
            <GlassCard className="p-5 rounded-3xl border border-white/10 bg-slate-950/80 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Índice Accesible de Regiones Corporales</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{totalRegionsCount} Regiones Oficiales</span>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                {Object.values(REGIONS_METADATA).map((reg) => {
                  const isSelected = selectedRegionId === reg.id;
                  const count = MICROBIOTA_CATALOG.filter((e) => e.regionId === reg.id).length;
                  return (
                    <button
                      key={reg.id}
                      onClick={() => handleSelectRegionFromList(reg.id)}
                      className={`
                        w-full text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 min-h-[44px]
                        ${isSelected
                          ? "bg-purple-950/50 border-purple-500/50 shadow-md"
                          : "bg-slate-900/40 hover:bg-slate-900 border-white/5"}
                      `}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{reg.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-white/5">
                            {reg.group}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{reg.anatomicalTitle}</p>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-xs font-bold text-purple-300 font-mono">{count} fichas</span>
                        <span className="text-[9px] text-slate-500">
                          {reg.has3D ? "Modelo 3D" : "Ficha 2D"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* Contexto Fisiológico del Sistema Seleccionado */}
          <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Contexto Fisiológico y Barreras</span>
              </span>
              {currentSystem.hasResidentMicrobiome ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Microbiota Residente
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Sitio Fisiológicamente Estéril
                </span>
              )}
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              {currentSystem.sterilityAndPhysiologicalContext}
            </p>

            {currentRegionMeta && (
              <div className="pt-2 border-t border-white/5 text-[11px] text-purple-300">
                <strong className="text-slate-400 font-medium">Nota sobre {currentRegionMeta.name}: </strong>
                {currentRegionMeta.anatomicalClarification}
              </div>
            )}
          </div>

        </div>

        {/* Columna Derecha: Contenido Dinámico según Perspectiva (Microbioma vs Infecciones) */}
        <div className="lg:col-span-7 space-y-4">
          
          {perspective === "microbioma" ? (
            /* ========================================================================= */
            /* PERSPECTIVA A: MICROBIOMA RESIDENTE (Catálogo comensal y de mucosas)      */
            /* ========================================================================= */
            <div className="space-y-4">
              
              {/* Encabezado de la Región y Filtros de Búsqueda */}
              <div className="p-4 rounded-3xl bg-slate-950/80 border border-white/10 shadow-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Microbiota de {currentRegionMeta ? currentRegionMeta.name : "Todas las Regiones"}</span>
                    </span>
                    <h2 className="text-lg font-bold text-white">
                      {currentRegionMeta ? currentRegionMeta.anatomicalTitle : "Catálogo Global de Microorganismos Comensales"}
                    </h2>
                  </div>

                  <span className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-slate-300 font-bold self-start sm:self-center shrink-0">
                    {filteredMicrobiota.length} {filteredMicrobiota.length === 1 ? "Entrada" : "Entradas"}
                  </span>
                </div>

                {/* Subzonas epiteliales documentadas */}
                {currentRegionMeta && currentRegionMeta.subzones && currentRegionMeta.subzones.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-500">Subzonas:</span>
                    {currentRegionMeta.subzones.map((sz, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-300">
                        {sz}
                      </span>
                    ))}
                  </div>
                )}

                {/* Buscador de Microorganismo y Filtros por Reino */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-white/5">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre científico, vulgar o subzona..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 min-h-[36px]"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    {(["all", "bacteria", "hongo"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTypeFilter(t)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold capitalize min-h-[36px] transition-colors ${
                          typeFilter === t
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-slate-900 text-slate-400 hover:text-white border border-white/5"
                        }`}
                      >
                        {t === "all" ? "Todos" : t === "bacteria" ? "Bacterias" : "Hongos"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Caso de Sitio Estéril (sin flora comensal) */}
              {!currentSystem.hasResidentMicrobiome && selectedRegionId === "all" ? (
                <div className="p-8 rounded-3xl bg-slate-950/80 border border-amber-500/30 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h3 className="text-base font-bold text-white">
                      Sitio Fisiológicamente Estéril
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      El {currentSystem.name} no posee microbiota residente normal. Cualquier presencia microbiana en este tejido o líquido corporal constituye una infección aguda invasiva.
                    </p>
                  </div>
                  <button
                    onClick={() => setPerspective("infecciones")}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-950/50"
                  >
                    <HeartPulse className="w-4 h-4" />
                    <span>Ver Infecciones de este Sistema</span>
                  </button>
                </div>
              ) : filteredMicrobiota.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-950/80 border border-white/10 text-center space-y-2 text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto text-amber-400 opacity-80" />
                  <p className="text-xs font-semibold text-slate-200">
                    No se encontraron microorganismos con los filtros actuales.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Prueba cambiando la subzona o limpiando los términos de búsqueda.
                  </p>
                </div>
              ) : (
                /* Cuadrícula de Tarjetas de Microbiota */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredMicrobiota.map((entry) => {
                    const agentRes = resolveAgentLink(entry.scientificName);
                    return (
                      <div key={entry.id} className="relative group flex flex-col justify-between">
                        <MicrobiotaCard
                          entry={entry}
                          onSelect={(e) => setSelectedEntryForModal(e)}
                        />
                        {agentRes.status === "exact_card" && agentRes.href && agentRes.agent && (
                          <div className="mt-1.5 px-3 py-1 rounded-xl bg-cyan-950/40 border border-cyan-800/30 flex items-center justify-between text-[10px]">
                            <span className="text-cyan-300 font-medium truncate">
                              Ficha clínica: {agentRes.agent.name}
                            </span>
                            <Link
                              href={agentRes.href}
                              className="text-cyan-400 hover:text-cyan-200 font-bold underline inline-flex items-center gap-0.5 shrink-0 ml-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>Ver {agentRes.agent.pdfId}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                        )}
                        {agentRes.status === "group_example" && agentRes.href && agentRes.agent && (
                          <div className="mt-1.5 px-3 py-1 rounded-xl bg-purple-950/40 border border-purple-800/30 flex items-center justify-between text-[10px]">
                            <span className="text-purple-300 font-medium truncate" title={agentRes.groupLabel}>
                              Ejemplo de grupo: {agentRes.agent.name}
                            </span>
                            <Link
                              href={agentRes.href}
                              className="text-purple-400 hover:text-purple-200 font-bold underline inline-flex items-center gap-0.5 shrink-0 ml-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>Ver {agentRes.agent.pdfId}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                        )}
                        {agentRes.status === "pending" && (
                          <div className="mt-1.5 px-3 py-1 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="text-slate-400 truncate">Comensal de microbiota</span>
                            <span className="text-slate-500 font-semibold text-[10px]">«Ficha pendiente»</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          ) : (
            /* ========================================================================= */
            /* PERSPECTIVA B: INFECCIONES CLÍNICAS POR SISTEMA                           */
            /* ========================================================================= */
            <div className="space-y-4">
              
              <div className="p-4 rounded-3xl bg-slate-950/80 border border-white/10 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentSystem.colorScheme.accent }} />
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                      Patología Infecciosa del {currentSystem.name}
                    </span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-white/10 text-slate-300 font-bold">
                    {currentInfections.length} {currentInfections.length === 1 ? "Síndrome" : "Síndromes"}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Síndromes y enfermedades infecciosas principales asociadas a este sistema anatómico, con vinculación a sus agentes etiológicos, métodos de laboratorio y prevención.
                </p>
              </div>

              {/* Banner de acceso a Preparación para el Certamen 3 si corresponde a Hepatobiliar o Cardiovascular */}
              {(selectedSystemId === "hepatobiliar" || selectedSystemId === "cardiovascular") && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2.5">
                    <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-300 block">
                        {selectedSystemId === "hepatobiliar" 
                          ? "Actividades de Cátedra 20 en Preparación para el Certamen 3" 
                          : "Actividades y Modelos de Cátedra 21 en Preparación para el Certamen 3"}
                      </span>
                      <span className="text-slate-300 text-[11px]">
                        Explora las actividades interactivas y modelos educativos disponibles para este sistema.
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {selectedSystemId === "cardiovascular" && (
                      <Link
                        href="/agentes-infecciosos/certamen-3?tema=cardiovascular&unidad=VAS-05"
                        className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-md min-h-[44px] flex items-center gap-1.5"
                      >
                        <span>Modelo 3D: Catéteres y Biofilm (VAS-05)</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                    <Link
                      href={`/agentes-infecciosos/certamen-3?tema=${selectedSystemId === "cardiovascular" ? "cardiovascular" : "hepatobiliar"}`}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md min-h-[44px] flex items-center gap-1.5"
                    >
                      <span>Abrir en Certamen 3</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Banner de referencia cruzada si es Digestivo (enlace a VAS-10 SHU en Certamen 3) */}
              {selectedSystemId === "gastrointestinal" && (
                <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2 text-purple-200">
                    <Info className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="text-[11px]">
                      <strong>Complicación sistémica por STEC:</strong> El Síndrome Hemolítico Urémico mediado por toxina Shiga se aborda en la actividad interactiva VAS-10 de Cátedra 21.
                    </span>
                  </div>
                  <Link
                    href="/agentes-infecciosos/certamen-3?tema=cardiovascular&unidad=VAS-10"
                    className="text-purple-300 hover:text-white font-bold text-xs underline shrink-0 min-h-[36px] flex items-center gap-1"
                  >
                    <span>Ver Actividad VAS-10</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {currentInfections.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-950/80 border border-white/10 text-center space-y-2 text-slate-400">
                  <FileCheck2 className="w-8 h-8 mx-auto text-cyan-400 opacity-80" />
                  <p className="text-xs font-semibold text-slate-200">
                    Contenido en preparación para este sistema.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Los síndromes de esta unidad se incorporarán en las próximas entregas curriculares.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentInfections.map((inf) => (
                    <GlassCard
                      key={inf.id}
                      className="p-5 rounded-3xl border border-white/10 bg-slate-950/80 hover:border-rose-500/40 shadow-xl space-y-4 transition-all"
                    >
                      {/* Cabecera del Síndrome */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-white/10 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 uppercase">
                              Síndrome Clínico
                            </span>
                            {inf.sourceDoc && (
                              <span className="text-[10px] font-mono text-slate-400">
                                {inf.sourceDoc.classCode} · {inf.sourceDoc.pages}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                            {inf.syndrome}
                          </h3>
                        </div>

                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900 border border-white/10 text-slate-400 font-semibold self-start shrink-0">
                          {inf.reviewStatus === "revisado_fuente" ? "Revisado con fuentes" : "En preparación"}
                        </span>
                      </div>

                      {/* Agentes etiológicos vinculados con enlaces directos a sus fichas */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                          <Bug className="w-3.5 h-3.5 text-rose-400" />
                          <span>Agentes Relacionados (Enlazados a su Ficha):</span>
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {inf.relatedAgents.map((ag, idx) => {
                            const res = resolveAgentLink(ag.stableId || ag.name);
                            if (res.status === "exact_card" && res.href && res.agent) {
                              return (
                                <Link
                                  key={idx}
                                  href={res.href}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-cyan-400/50 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm group min-h-[32px]"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                  <span className="italic">{ag.name}</span>
                                  <span className="text-[10px] font-mono text-cyan-400/80">({res.agent.pdfId})</span>
                                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-300 ml-0.5" />
                                </Link>
                              );
                            }
                            if (res.status === "group_example" && res.href && res.agent) {
                              return (
                                <Link
                                  key={idx}
                                  href={res.href}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-purple-500/30 hover:border-purple-400/60 text-xs font-semibold text-purple-200 hover:text-white transition-all shadow-sm group min-h-[32px]"
                                  title={res.groupLabel}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                  <span className="italic">{ag.name}</span>
                                  <span className="text-[10px] font-mono text-purple-300">({res.pdfId})</span>
                                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-purple-300 ml-0.5" />
                                </Link>
                              );
                            }
                            return (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-400 min-h-[32px]"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                <span className="italic">{ag.name}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-semibold">«Ficha pendiente»</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Cuadrícula de Datos Clínicos y de Laboratorio */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        
                        {/* Manifestaciones clínicas */}
                        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                          <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider flex items-center gap-1">
                            <Stethoscope className="w-3.5 h-3.5 text-amber-400" />
                            <span>Manifestaciones Clínicas:</span>
                          </span>
                          <p className="text-slate-300 leading-relaxed text-[11px]">
                            {inf.clinicalManifestations}
                          </p>
                        </div>

                        {/* Mecanismo de transmisión */}
                        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                          <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Vía de Transmisión:</span>
                          </span>
                          <p className="text-slate-300 leading-relaxed text-[11px]">
                            {inf.transmission}
                          </p>
                        </div>

                        {/* Muestras para el Laboratorio */}
                        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                          <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider flex items-center gap-1">
                            <Syringe className="w-3.5 h-3.5 text-purple-400" />
                            <span>Muestra Requerida:</span>
                          </span>
                          <p className="text-slate-300 leading-relaxed text-[11px]">
                            {inf.specimens}
                          </p>
                        </div>

                        {/* Métodos de Identificación Diagnóstica */}
                        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                          <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider flex items-center gap-1">
                            <Microscope className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Métodos de Identificación:</span>
                          </span>
                          <p className="text-slate-300 leading-relaxed text-[11px]">
                            {inf.identificationMethods}
                          </p>
                        </div>

                      </div>

                      {/* Prevención y Fuente */}
                      <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                        <div className="space-y-0.5">
                          <span className="font-bold text-emerald-400">Prevención Primaria: </span>
                          <span className="text-slate-300">{inf.prevention}</span>
                        </div>
                        {inf.sourceDoc && (
                          <span className="text-slate-400 italic shrink-0">
                            Fuente: {inf.sourceDoc.title}
                          </span>
                        )}
                      </div>

                    </GlassCard>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Modal de Detalle de Ficha de Microbiota */}
      {selectedEntryForModal && (
        <MicrobiotaDetailModal
          entry={selectedEntryForModal}
          onClose={() => setSelectedEntryForModal(null)}
        />
      )}

    </div>
  );
}
