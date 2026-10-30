"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HubSection, HubTopic } from "@/lib/data/infection-hub/course-topics-data";
import { getSourcesForSection, searchSources, WeeklyDocumentSource } from "@/lib/data/infection-hub/weekly-sources-registry";
import { resolveAgentLink } from "@/lib/data/infection-hub/agents-link-registry";
import { GlassCard } from "@/components/ui/GlassCard";
import { ColonizacionInfeccionExperience } from "./ColonizacionInfeccionExperience";
import {
  ArrowLeft,
  BookOpen,
  Bug,
  CheckCircle2,
  ExternalLink,
  FileText,
  HelpCircle,
  Info,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  GraduationCap,
  Search,
  Lock
} from "lucide-react";

interface SectionTopicsViewerProps {
  section: HubSection;
  backHref?: string;
}

export const SectionTopicsViewer: React.FC<SectionTopicsViewerProps> = ({
  section,
  backHref = "/agentes-infecciosos",
}) => {
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(section.topics[0]?.id || null);
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);
  const [sourceSearch, setSourceSearch] = useState("");

  const sectionSources = getSourcesForSection(section.id as any);
  const displayedSources: WeeklyDocumentSource[] = sourceSearch.trim()
    ? searchSources(sourceSearch)
    : sectionSources;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      
      {/* 1. Barra de Navegación de Regreso */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <Link
          href={backHref}
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
          <span className="text-white font-medium">{section.shortTitle}</span>
        </div>
      </div>

      {/* 2. Banner de Cabecera del Apartado */}
      <section className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-7 border border-white/15 shadow-2xl bg-gradient-to-r from-slate-950 via-slate-900/90 to-cyan-950/30">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold" style={{ color: section.colorScheme.accent }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{section.badge}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {section.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {section.overview}
            </p>
          </div>

          {/* Botón para ver fuentes y clases asociadas */}
          <button
            onClick={() => {
              setSourceSearch("");
              setSourcesModalOpen(true);
            }}
            className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center space-x-2 self-start sm:self-center shrink-0 min-h-[44px]"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <div className="text-left">
              <span className="block font-bold">Documentos y Clases ({sectionSources.length})</span>
              <span className="text-[10px] text-slate-400">19 PDFs de cátedra verificados</span>
            </div>
          </button>
        </div>
      </section>

      {/* 3. Lista de Temas Estructurados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Temas Formativos Disponibles ({section.topics.length})</span>
          </span>
          <span className="text-[11px] text-slate-500">
            Haz clic en un tema para expandir su desglose académico
          </span>
        </div>

        <div className="space-y-3">
          {section.topics.map((topic) => {
            const isExpanded = expandedTopicId === topic.id;

            return (
              <GlassCard
                key={topic.id}
                className={`p-5 rounded-3xl border transition-all duration-200 bg-slate-950/80 ${
                  isExpanded
                    ? "border-cyan-500/40 shadow-xl shadow-cyan-950/20"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Cabecera del Tema (Clickable para expandir/colapsar) */}
                <div
                  className="flex items-start justify-between gap-4 cursor-pointer select-none"
                  onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-bold uppercase">
                        {topic.source.classNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {topic.source.pages || "Fuente pendiente de cotejo"}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {topic.subtitle}
                    </p>
                  </div>

                  <button
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
                    aria-label={isExpanded ? "Colapsar tema" : "Expandir tema"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>

                {/* Resumen siempre visible */}
                <p className="text-xs text-slate-300 leading-relaxed mt-3 pt-3 border-t border-white/5">
                  {topic.summary}
                </p>

                {/* Desarrollo expandido */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-in fade-in duration-200">
                    
                    {/* Caso Especial: Experiencia Didáctica Interactiva para "Colonización, Infección y Enfermedad" */}
                    {topic.id === "fund-patogenia-vs-colonizacion" ? (
                      <ColonizacionInfeccionExperience />
                    ) : (
                      <>
                        {/* Puntos clave / Contenido académico */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Contenidos y Conceptos Clave:
                          </span>
                          <ul className="space-y-2 pl-2">
                            {topic.bulletPoints.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Relevancia Clínica */}
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1 text-xs">
                          <span className="font-bold text-amber-300 flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                            <span>Relevancia Clínica y Diagnóstica:</span>
                          </span>
                          <p className="text-slate-300 pl-5 text-[11px] leading-relaxed">
                            {topic.clinicalSignificance}
                          </p>
                        </div>

                        {/* Microorganismos representativos vinculados al catálogo */}
                        {topic.relatedAgentKeys && topic.relatedAgentKeys.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-white/5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                              <Bug className="w-3.5 h-3.5 text-purple-400" />
                              <span>Agentes Ilustrativos (Enlazados a su Ficha en Catálogo):</span>
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                              {topic.relatedAgentKeys.map((key) => {
                                const res = resolveAgentLink(key);
                                if (res.status === "exact_card" && res.href && res.agent) {
                                  return (
                                    <Link
                                      key={key}
                                      href={res.href}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400/50 text-xs text-slate-200 hover:text-white transition-all shadow-sm group min-h-[36px]"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                      <span className="font-semibold italic">{res.agent.name}</span>
                                      <span className="text-[10px] font-mono text-cyan-400">({res.agent.pdfId})</span>
                                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-300 ml-0.5" />
                                    </Link>
                                  );
                                }
                                if (res.status === "group_example" && res.href && res.agent) {
                                  return (
                                    <Link
                                      key={key}
                                      href={res.href}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-purple-500/30 hover:border-purple-400/60 text-xs text-purple-200 hover:text-white transition-all shadow-sm group min-h-[36px]"
                                      title={res.groupLabel}
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                      <span className="font-semibold italic">{res.name || key}</span>
                                      <span className="text-[10px] text-purple-300 font-mono">({res.pdfId})</span>
                                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-purple-300 ml-0.5" />
                                    </Link>
                                  );
                                }
                                return (
                                  <span
                                    key={key}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-400 min-h-[36px]"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                    <span className="italic">{key}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-semibold">«Ficha pendiente»</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Referencia documental del tema */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400 flex-wrap gap-2">
                      <span>Fuente: <strong className="text-slate-300">{topic.source.documentTitle}</strong></span>
                      <span className="font-mono text-slate-500">{topic.source.classNumber} ({topic.source.pages || topic.source.classDate})</span>
                    </div>

                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>

        {/* Enlace Canónico a Actividades Didácticas de Cátedra (Cátedras 20 y 21) */}
        {section.id === "fundamentos" && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-950/60 to-slate-900 border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-lg mt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold border border-sky-500/30">
                  VAS-01 · Cátedra 21
                </span>
                <span className="font-bold text-white text-sm">Diseminación Hemática y Sepsis</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Continúa los fundamentos de la infección explorando la distinción conceptual entre bacteriemia, fungemia, viremia, parasitemia y la respuesta desregulada del huésped (Sepsis-3).
              </p>
            </div>
            <Link
              href="/agentes-infecciosos/certamen-3?tema=cardiovascular&unidad=VAS-01"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-all shadow-md shrink-0 w-fit"
            >
              <span>Explorar VAS-01</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {section.id === "metabolismo_cultivo" && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-lg mt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold border border-blue-500/30">
                  VAS-11 · Cátedra 21
                </span>
                <span className="font-bold text-white text-sm">Hemocultivo y Fases de Detección</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Conoce el flujo técnico completo del cultivo en medios líquidos automatizados, tinción de Gram directa y antibiograma (CIM) para el estudio de bacteriemias.
              </p>
            </div>
            <Link
              href="/agentes-infecciosos/certamen-3?tema=cardiovascular&unidad=VAS-11"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold transition-all shadow-md shrink-0 w-fit"
            >
              <span>Explorar VAS-11</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Modal de Índice de Fuentes y Documentos Reales (19 PDFs) */}
      {sourcesModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSourcesModalOpen(false);
          }}
        >
          <GlassCard className="max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-7 rounded-3xl border border-white/15 bg-slate-950/95 space-y-5 shadow-2xl text-slate-200">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Índice Documental de Cátedra (19 PDFs Reales)</span>
                </span>
                <h3 className="text-xl font-bold text-white">
                  Documentos asignados a {section.shortTitle}
                </h3>
              </div>

              <button
                onClick={() => setSourcesModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                aria-label="Cerrar índice de fuentes"
              >
                ✕
              </button>
            </div>

            {/* Barra de búsqueda por texto o palabras clave en el índice */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar entre los 19 documentos de cátedra por tema, autor o título..."
                value={sourceSearch}
                onChange={(e) => setSourceSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 min-h-[38px]"
              />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Cotejo con los 19 archivos PDF oficiales del curso «Agentes Infecciosos» (Facultad de Medicina CAS-UDD). Muestra la extensión real en páginas y los temas respaldados:
            </p>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {displayedSources.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 text-center text-slate-400 text-xs">
                  No se encontraron documentos con el criterio ingresado.
                </div>
              ) : (
                displayedSources.map((src) => (
                  <div
                    key={src.id}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-400 text-xs">{src.code}</span>
                        {src.author && (
                          <span className="text-[11px] text-slate-400 font-medium">· {src.author}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-cyan-300 font-mono px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-800/40">
                        {src.totalPages} páginas
                      </span>
                    </div>

                    <h4 className="font-semibold text-white text-xs">{src.title}</h4>
                    <p className="text-[11px] font-mono text-slate-400 break-all">{src.fileName}</p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{src.primarySubject}</p>
                    
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px] text-slate-400">
                      <span className="font-bold text-slate-500">Tópicos:</span>
                      {src.referencedTopics.map((top, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                          {top}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-slate-500">
                      <span>Fecha de cátedra: {src.deliveryDate}</span>
                      <span className="flex items-center gap-1 text-slate-500 italic">
                        <Lock className="w-3 h-3 text-slate-600" />
                        <span>Acceso interno CAS-UDD</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10 text-[11px] text-slate-400">
              <span className="italic text-slate-500 text-[10px]">
                ⓘ Los archivos no se publican para descarga libre por propiedad intelectual de cátedra.
              </span>
              <button
                onClick={() => setSourcesModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors shrink-0"
              >
                Cerrar
              </button>
            </div>
          </GlassCard>
        </div>
      )}

    </div>
  );
};
