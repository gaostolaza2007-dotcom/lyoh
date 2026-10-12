"use client";

import React, { useEffect } from "react";
import { MicrobiotaEntry, REGIONS_METADATA } from "@/data/microbiota-catalog";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  X,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Compass,
  Layers,
  FileText,
  Activity,
} from "lucide-react";

interface MicrobiotaDetailModalProps {
  entry: MicrobiotaEntry | null;
  onClose: () => void;
  returnFocusElement?: HTMLElement | null;
}

export const MicrobiotaDetailModal: React.FC<MicrobiotaDetailModalProps> = ({
  entry,
  onClose,
  returnFocusElement,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    if (entry) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [entry, onClose]);

  const handleClose = () => {
    onClose();
    if (returnFocusElement) {
      setTimeout(() => {
        returnFocusElement.focus();
      }, 50);
    }
  };

  if (!entry) return null;

  const regionInfo = REGIONS_METADATA[entry.regionId];

  const getStatusInfo = () => {
    switch (entry.reviewStatus) {
      case "confirmado_fuente":
        return {
          icon: CheckCircle2,
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
          desc: "Respaldado por estudios metagenómicos o publicaciones de referencia (e.g. HMP, Cell Reports, Nature, PNAS).",
        };
      case "catalogo_inicial":
        return {
          icon: BookOpen,
          color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
        };
      case "por_verificar_fuente":
        return {
          icon: AlertCircle,
          color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
          desc: "Mención conservada textualmente de la lista aportada. Pendiente de cotejo en la fuente original; no validada como residente habitual.",
        };
      case "termino_por_confirmar":
        return {
          icon: HelpCircle,
          color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
          desc: "Término sin correspondencia taxonómica en las bases bacterianas oficiales. Conservado sin atribuir significado inventado.",
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-entry-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <GlassCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border border-white/15 bg-slate-950/95 space-y-6 shadow-2xl text-slate-200">
        {/* Cabecera del modal */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
                {regionInfo.name}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 border border-white/10 text-slate-300 uppercase">
                {entry.type === "bacteria" ? "Bacteria" : entry.type === "hongo" ? "Hongo" : "Por verificar"}
              </span>
              {entry.catalogNumber && (
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  N.º {entry.catalogNumber}
                </span>
              )}
            </div>

            <h2 id="modal-entry-title" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {entry.scientificName}
            </h2>
            <p className="text-sm text-slate-400 font-medium">
              {entry.spanishName}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Cerrar ficha"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sinónimos o nombres alternativos */}
        {entry.synonyms && entry.synonyms.length > 0 && (
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              Sinónimos / Nombres previos:
            </span>
            {entry.synonyms.map((syn, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg bg-slate-900 border border-white/10 text-slate-300 font-mono text-[11px]"
              >
                {syn}
              </span>
            ))}
          </div>
        )}

        {/* Detalles principales */}
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          {/* Subzona anatómica */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider block flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-purple-400" />
              <span>Subzona documentada</span>
            </span>
            <p className="text-slate-200 text-xs font-medium">
              {entry.subzone}
            </p>
          </div>

          {/* Descripción educativa breve */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider block flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Descripción educativa</span>
            </span>
            <p className="text-slate-300 text-xs leading-relaxed p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              {entry.description}
            </p>
          </div>

          {/* Papel ecológico conocido */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider block flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Papel ecológico en la comunidad</span>
            </span>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-slate-300 text-xs leading-relaxed">
                {entry.ecologicalRole}
              </p>
            </div>
          </div>

          {/* Contexto clínico: Colonización vs Enfermedad */}
          <div className="space-y-1.5">
            <span className="font-bold text-amber-400 text-[11px] uppercase tracking-wider block flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Contexto clínico (Colonización vs Enfermedad)</span>
            </span>
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed">
              <p>
                {entry.clinicalContext}
              </p>
              <p className="text-[10px] text-amber-300/80 pt-1.5 border-t border-amber-500/20 mt-2 font-medium">
                ⓘ La detección comensal aislada no equivale a infección activa ni diagnóstico microbiológico.
              </p>
            </div>
          </div>

          {/* Estado de revisión discreto */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <StatusIcon className="w-4 h-4 shrink-0 text-slate-400" />
              <div>
                <span className="text-slate-400 text-[11px] block">Estado de revisión científica:</span>
                <span className="font-semibold text-slate-200">{entry.reviewStatusLabel}</span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
              {entry.reviewStatus}
            </span>
          </div>

          {/* Fuente bibliográfica y enlace */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-2 text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
              Fuente de referencia:
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <p className="font-semibold text-slate-200 text-xs">{entry.source.title}</p>
                <p className="text-slate-400 text-[11px]">{entry.source.citation}</p>
              </div>

              {entry.source.url && (
                <a
                  href={entry.source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-purple-400 hover:text-purple-300 text-xs font-semibold underline shrink-0 mt-1 sm:mt-0"
                >
                  <span>Abrir publicación</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Botón de cierre */}
        <div className="flex justify-end pt-2 border-t border-white/10">
          <button
            onClick={handleClose}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors min-h-[44px] flex items-center justify-center"
          >
            Volver al listado
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
