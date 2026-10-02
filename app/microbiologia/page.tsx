"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  MICROBIOLOGY_DATA, 
  MICROBIOLOGY_REFERENCES, 
  matchesMicrobeSearch,
  Microbe, 
  MicrobeTaxonomy 
} from "@/lib/medical-data";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/lib/auth-context";
import { 
  Bug, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Pill, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Dna,
  ExternalLink,
  BookOpen,
  Info
} from "lucide-react";

type CategoryFilter = "Todos" | MicrobeTaxonomy;

const STORAGE_KEY = "medstudy_studied_microbes";

export default function MicrobiologiaPage() {
  const { addXp, updateUnitProgress } = useAuth();
  
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<string[]>(["micro-1"]); // Primera expandida por defecto
  const [studiedIds, setStudiedIds] = useState<string[]>(["micro-1"]);
  const [isClient, setIsClient] = useState(false);

  const categories: CategoryFilter[] = ["Todos", "Bacterias", "Virus", "Hongos", "Parásitos"];

  // Carga inicial y persistencia del progreso sin duplicar XP
  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migración de identificadores si fuese necesario
          const normalized = Array.from(new Set(parsed.map((id: string) => {
            // Soporte para equivalencias previas si existen
            if (id === "B01") return "micro-1";
            if (id === "V01") return "micro-2";
            if (id === "H01") return "micro-3";
            if (id === "P01") return "micro-4";
            if (id === "B02") return "micro-5";
            if (id === "P02") return "micro-6";
            return id;
          })));
          setStudiedIds(normalized);
          updateUnitProgress(
            "microbiologia", 
            "patogenos", 
            Math.min(100, Math.round((normalized.length / MICROBIOLOGY_DATA.length) * 100))
          );
        }
      }
    } catch (e) {
      console.warn("Could not read studied microbes from localStorage", e);
    }
  }, [updateUnitProgress]);

  // Marcar como estudiada evitando otorgar XP repetidos
  const markAsStudied = (id: string) => {
    setStudiedIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save studied microbes to localStorage", e);
      }
      addXp(20);
      updateUnitProgress(
        "microbiologia",
        "patogenos",
        Math.min(100, Math.round((updated.length / MICROBIOLOGY_DATA.length) * 100))
      );
      return updated;
    });
  };

  // Alternar expansión de tarjetas
  const toggleExpand = (id: string) => {
    if (expandedIds.includes(id)) {
      setExpandedIds(expandedIds.filter((item) => item !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
      markAsStudied(id);
    }
  };

  // Filtrado reactivo por categoría y búsqueda insensible a mayúsculas y acentos
  const filteredMicrobes = useMemo(() => {
    return MICROBIOLOGY_DATA.filter((microbe) => {
      const matchesCategory = activeCategory === "Todos" || microbe.taxonomy === activeCategory;
      const matchesQuery = matchesMicrobeSearch(microbe, searchQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  // Conteos por categoría
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Todos: MICROBIOLOGY_DATA.length,
      Bacterias: 0,
      Virus: 0,
      Hongos: 0,
      Parásitos: 0,
    };
    for (const m of MICROBIOLOGY_DATA) {
      if (counts[m.taxonomy] !== undefined) {
        counts[m.taxonomy]++;
      }
    }
    return counts;
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Bug className="w-4 h-4" />
            <span>Módulo 04 · Guía de Estudio (140 Fichas)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Microbiología & Enfermedades Infecciosas
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
            Clasificación taxonómica, características, factores de virulencia, cuadro clínico, tratamiento orientativo y perlas de examen.
          </p>
          
          {/* Nota discreta obligatoria */}
          <div className="flex items-center space-x-1.5 text-[11px] text-cyan-300/80 mt-2 bg-cyan-950/30 border border-cyan-500/20 px-3 py-1 rounded-xl w-fit">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Material de estudio. Los tratamientos son orientativos y deben contrastarse con protocolos locales.</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-2xl glass-card text-xs text-cyan-300 border border-cyan-500/20 self-start sm:self-center shrink-0">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-bold">
            {isClient ? studiedIds.length : 1} / {MICROBIOLOGY_DATA.length} Patógenos Estudiados
          </span>
        </div>
      </div>

      {/* Barra Superior de Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Selector de Categorías (Bacterias, Virus, Hongos, Parásitos) */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const count = categoryCounts[cat] ?? 0;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap touch-manipulation flex items-center space-x-1.5
                  ${isActive 
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-900/30 scale-[1.02]" 
                    : "bg-slate-900/50 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10"}
                `}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-white/5 text-slate-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Input de Búsqueda */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por patógeno, alias, fármaco o clínica..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Cuadrícula de Tarjetas Expandibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMicrobes.length === 0 ? (
          <div className="col-span-2 p-12 text-center glass-card rounded-3xl border border-white/10 text-slate-400 text-xs space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto opacity-70" />
            <p className="font-semibold text-slate-200">
              No se encontraron microorganismos con los criterios de búsqueda actuales.
            </p>
            <p className="text-[11px] text-slate-400">
              Prueba buscando por nombre científico, alias clínico, síntoma, medicamento o ficha (ej. &ldquo;B01&rdquo;, &ldquo;malaria&rdquo;, &ldquo;ceftriaxona&rdquo;).
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs transition-colors"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          filteredMicrobes.map((microbe) => {
            const isExpanded = expandedIds.includes(microbe.id);
            const isStudied = isClient ? studiedIds.includes(microbe.id) : microbe.id === "micro-1";

            return (
              <GlassCard
                key={microbe.id}
                className={`
                  p-5 rounded-3xl border transition-all duration-300
                  ${isExpanded ? "border-cyan-500/40 bg-slate-900/60 shadow-xl shadow-cyan-950/30" : "border-white/10 hover:border-white/20"}
                `}
              >
                {/* Cabecera de la Tarjeta (Siempre Visible) */}
                <div 
                  onClick={() => toggleExpand(microbe.id)}
                  className="cursor-pointer select-none touch-manipulation"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center flex-wrap gap-1.5 mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${microbe.badgeColor}`}>
                          {microbe.taxonomy}
                        </span>
                        {microbe.typeBadge && (
                          <span className="text-[10px] font-semibold text-slate-400 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">
                            {microbe.typeBadge}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-cyan-400/90 px-1.5 py-0.5 rounded-md bg-cyan-950/40 border border-cyan-800/30">
                          {microbe.pdfId}
                        </span>
                        {microbe.initialSelection && (
                          <span className="text-[9px] uppercase tracking-wider font-semibold text-amber-300/80 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                            Selección Inicial
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white italic tracking-tight truncate">
                        {microbe.name}
                      </h3>
                      {microbe.aliases && microbe.aliases.length > 0 && (
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          Alias: {microbe.aliases.join(", ")}
                        </p>
                      )}
                    </div>

                    <button
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors shrink-0"
                      aria-label="Expandir detalles"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Resumen tintorial / genético / características */}
                  <p className="text-xs text-cyan-300 font-mono mb-2 leading-relaxed">
                    {microbe.stainOrGenetics}
                  </p>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {microbe.clinicalPresentation}
                  </p>
                </div>

                {/* Sección Expandible con Detalles Clínicos, Fármacos y Fuentes */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-in fade-in zoom-in-98 duration-200">
                    
                    {/* Vía de Transmisión */}
                    <div className="text-xs space-y-1">
                      <span className="font-bold text-slate-400 flex items-center space-x-1.5">
                        <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Mecanismo de Transmisión:</span>
                      </span>
                      <p className="text-slate-300 pl-5 leading-relaxed">{microbe.transmission}</p>
                    </div>

                    {/* Factores de Virulencia y Patogenia */}
                    <div className="text-xs space-y-1">
                      <span className="font-bold text-slate-400 flex items-center space-x-1.5">
                        <Dna className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>Factores de Virulencia y Patogenia:</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5 pl-5 mt-1">
                        {microbe.virulenceFactors.map((vf, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/25 text-[10px]"
                          >
                            {vf}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tratamiento Orientativo */}
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 text-xs space-y-1">
                      <span className="font-bold text-emerald-300 flex items-center space-x-1.5">
                        <Pill className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Tratamiento orientativo:</span>
                      </span>
                      <p className="text-slate-200 pl-5 font-medium leading-relaxed">
                        {microbe.firstLineTreatment}
                      </p>
                    </div>

                    {/* Perla Médica */}
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                      <span className="font-bold text-amber-300 flex items-center space-x-1.5 mb-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Perla de Examen (High-Yield):</span>
                      </span>
                      <p className="text-slate-300 leading-relaxed pl-5">{microbe.examPearl}</p>
                    </div>

                    {/* Fuentes de Consulta con Enlaces Reales Verificados */}
                    {microbe.sources && microbe.sources.length > 0 && (
                      <div className="pt-2 border-t border-white/10 text-xs space-y-1.5">
                        <span className="font-bold text-slate-400 flex items-center space-x-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>Fuentes de Consulta:</span>
                        </span>
                        <div className="pl-5 space-y-1.5">
                          {microbe.sources.map((sNum) => {
                            const ref = MICROBIOLOGY_REFERENCES[sNum];
                            if (!ref) return null;
                            return (
                              <div key={sNum} className="text-[11px] text-slate-300 flex flex-wrap items-center gap-1.5">
                                <span className="font-semibold text-cyan-400">[{sNum}]</span>
                                <span className="text-slate-300 font-medium">{ref.title}</span>
                                <span className="text-slate-500">·</span>
                                <div className="inline-flex items-center flex-wrap gap-2">
                                  {ref.links.map((link, lIdx) => (
                                    <a
                                      key={lIdx}
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-cyan-400 hover:text-cyan-300 underline inline-flex items-center gap-1 font-semibold"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <span>{link.label}</span>
                                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Footer de la Tarjeta con Metadatos del PDF y Marcado de Progreso */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Ficha {microbe.pdfId} · Pág. {microbe.page} del PDF
                      </span>
                      
                      {isStudied ? (
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Ficha Estudiada (+20 XP)</span>
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsStudied(microbe.id);
                          }}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Marcar como estudiada (+20 XP)</span>
                        </button>
                      )}
                    </div>

                  </div>
                )}
              </GlassCard>
            );
          })
        )}
      </div>

    </div>
  );
}