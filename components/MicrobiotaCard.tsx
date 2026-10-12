"use client";

import React from "react";
import { MicrobiotaEntry } from "@/data/microbiota-catalog";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Bug, 
  Sparkles, 
  HelpCircle, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink 
} from "lucide-react";

interface MicrobiotaCardProps {
  entry: MicrobiotaEntry;
  onSelect: (entry: MicrobiotaEntry) => void;
}

export const MicrobiotaCard: React.FC<MicrobiotaCardProps> = ({ entry, onSelect }) => {
  const getTypeBadge = () => {
    switch (entry.type) {
      case "bacteria":
        return {
          label: "Bacteria",
          classes: "bg-blue-500/15 border-blue-500/30 text-blue-300",
        };
      case "hongo":
        return {
          label: "Hongo",
          classes: "bg-purple-500/15 border-purple-500/30 text-purple-300",
        };
      case "por_verificar":
        return {
          label: "Por verificar",
          classes: "bg-amber-500/15 border-amber-500/30 text-amber-300",
        };
    }
  };

  const getStatusBadge = () => {
    switch (entry.reviewStatus) {
      case "confirmado_fuente":
        return {
          icon: CheckCircle2,
          classes: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        };
      case "catalogo_inicial":
        return {
          icon: BookOpen,
          classes: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
        };
      case "por_verificar_fuente":
        return {
          icon: AlertCircle,
          classes: "bg-amber-500/10 border-amber-500/30 text-amber-300",
        };
      case "termino_por_confirmar":
        return {
          icon: HelpCircle,
          classes: "bg-rose-500/10 border-rose-500/30 text-rose-300",
        };
    }
  };

  const typeBadge = getTypeBadge();
  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(entry)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(entry);
        }
      }}
      className="microbiota-card group text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-3xl"
    >
      <GlassCard className="h-full p-5 rounded-3xl border border-white/10 bg-slate-900/60 hover:bg-slate-850/80 hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-950/20 transition-all flex flex-col justify-between space-y-4 cursor-pointer">
        {/* Encabezado de la tarjeta */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${typeBadge.classes}`}>
                {typeBadge.label}
              </span>
              {entry.catalogNumber !== undefined && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                  N.º {entry.catalogNumber}
                </span>
              )}
            </div>

            {/* Estado de revisión discreto */}
            <span
              className={`inline-flex items-center space-x-1 text-[9px] font-medium px-2 py-0.5 rounded-full border ${statusBadge.classes}`}
              title={entry.reviewStatusLabel}
            >
              <StatusIcon className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate max-w-[110px]">{entry.reviewStatusLabel}</span>
            </span>
          </div>

          <div>
            <h3 className="font-extrabold text-white text-base tracking-tight group-hover:text-purple-300 transition-colors">
              {entry.scientificName}
            </h3>
            <p className="text-xs text-slate-400 font-medium line-clamp-1">
              {entry.spanishName}
            </p>
          </div>
        </div>

        {/* Subzona y descripción breve */}
        <div className="space-y-2 text-xs">
          <div className="p-2 rounded-xl bg-slate-950/50 border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Subzona:
            </span>
            <span className="text-slate-300 text-[11px] font-medium block truncate">
              {entry.subzone}
            </span>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
            {entry.description}
          </p>
        </div>

        {/* Pie de tarjeta: Fuente y llamada a la acción */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate max-w-[180px] text-[10px] text-slate-500">
            {entry.source.title}
          </span>
          <span className="text-purple-400 group-hover:translate-x-0.5 transition-transform font-semibold text-xs flex items-center space-x-1">
            <span>Ver ficha</span>
            <span>→</span>
          </span>
        </div>
      </GlassCard>
    </div>
  );
};
