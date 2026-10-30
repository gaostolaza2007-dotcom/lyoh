"use client";

import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Sparkles,
  BookOpen,
  Info,
  Box
} from "lucide-react";
import {
  CatedraThemeGroup,
  CatedraUnitItem,
  getThemeGroupsByTopic,
  HEPATOBILIAR_THEMES,
  CARDIOVASCULAR_THEMES
} from "./certamenCatalog";

import { HepAcutePhases } from "./HepAcutePhases";
import { HepChronicFibrosis } from "./HepChronicFibrosis";
import { HepJaundiceLab } from "./HepJaundiceLab";
import { HepAEComparison } from "./HepAEComparison";
import { HepBMakers } from "./HepBMakers";
import { HepDDependence } from "./HepDDependence";
import { HepCRnaAntibody } from "./HepCRnaAntibody";
import { HepEbvCmv } from "./HepEbvCmv";
import { HepAbscessBiliary } from "./HepAbscessBiliary";
import { VasBloodTermsSepsis } from "./VasBloodTermsSepsis";
import { VasSepsisShock } from "./VasSepsisShock";
import { VasCatheterBiofilm } from "./VasCatheterBiofilm";
import { VasAgentsMatrix } from "./VasAgentsMatrix";
import { VasChagasPhases } from "./VasChagasPhases";
import { VasMalariaBlood } from "./VasMalariaBlood";
import { VasToxicShockSuperantigen } from "./VasToxicShockSuperantigen";
import { VasHUSShigaToxin } from "./VasHUSShigaToxin";
import { VasBloodCultureWorkflow } from "./VasBloodCultureWorkflow";
import { VasDiagnosticMethodsBoard } from "./VasDiagnosticMethodsBoard";

export interface CatedraUnitHubProps {
  systemId: "hepatobiliar" | "cardiovascular";
  activeGroupId: string | null;
  activeUnitId: string | null;
  onSelectGroup: (groupId: string, defaultUnitId?: string) => void;
  onBackToThemes: () => void;
  onSelectUnit: (unitId: string) => void;
  renderExtraUnit?: (unitId: string) => React.ReactNode;
}

export const CatedraUnitHub: React.FC<CatedraUnitHubProps> = ({
  systemId,
  activeGroupId,
  activeUnitId,
  onSelectGroup,
  onBackToThemes,
  onSelectUnit,
  renderExtraUnit,
}) => {
  const groups = getThemeGroupsByTopic(systemId);
  const currentGroup = groups.find((g) => g.id === activeGroupId) || null;

  // Si hay un grupo activo pero no hay unidad seleccionada, tomar la primera disponible
  const currentUnit: CatedraUnitItem | null =
    currentGroup?.availableUnits.find((u) => u.id === activeUnitId) ||
    currentGroup?.availableUnits[0] ||
    null;

  // ---------------------------------------------------------------------------
  // VISTA 1: PORTADA DE TEMAS AGRUPADOS (cuando activeGroupId === null)
  // ---------------------------------------------------------------------------
  if (!currentGroup) {
    const totalAvailable = groups.reduce((acc, g) => acc + g.availableUnits.length, 0);
    const totalPending = groups.reduce((acc, g) => acc + (g.pendingUnits?.length || 0), 0);
    const isHep = systemId === "hepatobiliar";

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Cabecera del Área de Temas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isHep ? "bg-amber-400" : "bg-rose-400"}`} />
              <span>
                {isHep
                  ? "Temas de Infecciones Hepáticas"
                  : "Temas de Infecciones Intravasculares"}
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Selecciona un tema para explorar sus actividades interactivas y modelos didácticos.
            </p>
          </div>

          <div className="text-[11px] text-slate-400 font-mono bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/5 shrink-0 self-start sm:self-center">
            <span>{groups.length} grupos conceptuales</span>
            <span className="mx-1.5 text-slate-600">·</span>
            <span className={isHep ? "text-amber-300" : "text-rose-300"}>
              {totalAvailable} actividades disponibles
            </span>
          </div>
        </div>

        {/* Cuadrícula de Tarjetas de Tema (Inspirada en Portada de Parasitología) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => {
            const Icon = group.icon;
            const primaryUnitId = group.availableUnits[0]?.id;

            return (
              <div
                key={group.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectGroup(group.id, primaryUnitId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectGroup(group.id, primaryUnitId);
                  }
                }}
                className={`
                  group relative rounded-3xl p-6 border transition-all duration-300
                  bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90
                  shadow-xl hover:-translate-y-1 hover:shadow-2xl cursor-pointer flex flex-col justify-between min-h-[220px]
                  ${
                    isHep
                      ? "border-amber-500/20 hover:border-amber-400/60 focus-visible:ring-2 focus-visible:ring-amber-400"
                      : "border-rose-500/20 hover:border-rose-400/60 focus-visible:ring-2 focus-visible:ring-rose-400"
                  }
                `}
                aria-label={`Abrir tema ${group.numberPrefix}: ${group.title}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-3 rounded-2xl bg-slate-950/90 border border-white/10 ${
                        isHep ? "text-amber-400 group-hover:scale-105" : "text-rose-400 group-hover:scale-105"
                      } transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-950 text-slate-300 border border-white/10">
                      {group.badge}
                    </span>
                  </div>

                  <h3
                    className={`text-base sm:text-lg font-bold text-white transition-colors ${
                      isHep ? "group-hover:text-amber-300" : "group-hover:text-rose-300"
                    }`}
                  >
                    {group.numberPrefix}. {group.title}
                  </h3>

                  <p className="text-xs text-slate-300/90 leading-relaxed">
                    {group.description}
                  </p>
                </div>

                <div
                  className={`pt-5 mt-3 flex items-center justify-between text-xs font-semibold border-t border-white/5 transition-colors ${
                    isHep ? "text-amber-400 group-hover:text-amber-300" : "text-rose-400 group-hover:text-rose-300"
                  }`}
                >
                  <span>Explorar tema</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen pedagógico discreto */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex items-start gap-2.5 text-xs text-slate-400">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            Cada grupo reúne las actividades y modelos correspondientes a los núcleos temáticos del certamen. Al entrar en un tema podrás cambiar rápidamente entre sus actividades mediante el selector compacto.
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VISTA 2: DENTRO DE UN TEMA ABIERTO (cuando activeGroupId !== null)
  // ---------------------------------------------------------------------------
  const isHep = systemId === "hepatobiliar";

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Barra Superior del Tema: Volver a los Temas + Encabezado Breve */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-white/10 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToThemes}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors group min-h-[44px]"
              aria-label="Volver a los temas"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Volver a los temas</span>
            </button>

            <div className="hidden sm:block h-4 w-px bg-white/10" />

            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Tema {currentGroup.numberPrefix} de {groups.length}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-xl border border-white/5 self-start sm:self-auto">
            {currentGroup.availableUnits.length}{" "}
            {currentGroup.availableUnits.length === 1 ? "actividad" : "actividades"}
          </div>
        </div>

        {/* Encabezado del Tema */}
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>
              {currentGroup.numberPrefix}. {currentGroup.title}
            </span>
          </h2>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            {currentGroup.description}
          </p>
        </div>

        {/* SELECTOR COMPACTO DE ACTIVIDADES */}
        <div className="pt-2 border-t border-white/5">
          
          {/* Selector para Pantallas Móviles (< 640px) */}
          <div className="sm:hidden space-y-1.5">
            <label
              htmlFor="mobile-unit-select"
              className="text-[11px] font-semibold text-slate-400 block"
            >
              Seleccionar actividad:
            </label>
            <div className="relative">
              <select
                id="mobile-unit-select"
                value={currentUnit?.id || ""}
                onChange={(e) => onSelectUnit(e.target.value)}
                className="w-full appearance-none bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[44px] pr-9"
              >
                {currentGroup.availableUnits.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-950 text-white">
                    {u.shortTitle} {u.is3DModel ? "· Modelo 3D" : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Selector Compacto para Pantallas de Escritorio y Tablet (>= 640px) */}
          <div className="hidden sm:flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">
              Actividad:
            </span>
            {currentGroup.availableUnits.map((u) => {
              const isSelected = currentUnit?.id === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onSelectUnit(u.id)}
                  aria-pressed={isSelected}
                  className={`
                    px-3.5 py-2 rounded-xl text-xs font-semibold transition-all min-h-[44px] flex items-center gap-1.5
                    ${
                      isSelected
                        ? isHep
                          ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/40 ring-1 ring-amber-300"
                          : "bg-rose-500 text-white font-bold shadow-md shadow-rose-950/40 ring-1 ring-rose-300"
                        : "bg-slate-950/80 hover:bg-slate-900 text-slate-300 border border-white/10 hover:text-white"
                    }
                  `}
                >
                  <span>{u.shortTitle}</span>
                  {u.is3DModel && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        isSelected
                          ? "bg-slate-950/20 text-slate-950"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      }`}
                    >
                      Modelo 3D
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* METADATA DISCRETA: Fuentes y Referencia de la Clase (Conservada fielmente) */}
      {currentUnit && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-950/60 border border-white/5 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Fuentes y referencia de la clase:</span>
            <span className="font-mono text-slate-400">
              Unidad {currentUnit.code} · {currentUnit.classReference}
            </span>
          </div>

          {currentUnit.is3DModel && (
            <span className="font-mono text-[10px] text-cyan-400 font-semibold bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded-full">
              Visor 3D interactivo
            </span>
          )}
        </div>
      )}

      {/* RENDERIZADO PROTAGÓNICO DE LA ACTIVIDAD SELECCIONADA */}
      <div className="space-y-4">
        {currentUnit?.id === "HEP-02" && <HepAcutePhases />}
        {currentUnit?.id === "HEP-03" && <HepChronicFibrosis />}
        {currentUnit?.id === "HEP-04" && <HepJaundiceLab />}
        {currentUnit?.id === "HEP-05" && <HepAEComparison />}
        {currentUnit?.id === "HEP-06" && <HepBMakers />}
        {currentUnit?.id === "HEP-07" && <HepDDependence />}
        {currentUnit?.id === "HEP-08" && <HepCRnaAntibody />}
        {currentUnit?.id === "HEP-09" && <HepEbvCmv />}
        {currentUnit?.id === "HEP-13" && <HepAbscessBiliary />}
        {currentUnit?.id === "VAS-01" && <VasBloodTermsSepsis />}
        {currentUnit?.id === "VAS-03" && <VasSepsisShock />}
        {currentUnit?.id === "VAS-05" && <VasCatheterBiofilm />}
        {currentUnit?.id === "VAS-06" && <VasAgentsMatrix />}
        {currentUnit?.id === "VAS-07" && <VasChagasPhases />}
        {currentUnit?.id === "VAS-08" && <VasMalariaBlood />}
        {currentUnit?.id === "VAS-09" && <VasToxicShockSuperantigen />}
        {currentUnit?.id === "VAS-10" && <VasHUSShigaToxin />}
        {currentUnit?.id === "VAS-11" && <VasBloodCultureWorkflow />}
        {currentUnit?.id === "VAS-12" && <VasDiagnosticMethodsBoard />}

        {renderExtraUnit && currentUnit && renderExtraUnit(currentUnit.id)}
      </div>

      {/* RECURSOS EN PREPARACIÓN DE ESTE TEMA (Completamente honesto, sin controles interactivos falsos) */}
      {currentGroup.pendingUnits && currentGroup.pendingUnits.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <Box className="w-3.5 h-3.5 text-cyan-400" />
              <span>Recursos en preparación de este tema:</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {currentGroup.pendingUnits.length} en desarrollo
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Los siguientes recursos y modelos anatómicos complementarios se incorporarán una vez concluida su revisión didáctica:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {currentGroup.pendingUnits.map((p) => (
              <div
                key={p.id}
                className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 flex items-start justify-between gap-2"
              >
                <div className="space-y-0.5 min-w-0">
                  <span className="font-semibold text-slate-200 block text-[11px] truncate">
                    {p.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {p.classReference} · {p.note}
                  </span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold shrink-0">
                  En preparación
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
