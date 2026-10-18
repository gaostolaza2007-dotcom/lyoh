"use client";

import React, { useState, useMemo } from "react";
import { ALL_PARASITES } from "@/lib/data/parasitology/parasites-data";
import { TAENIA_SOLIUM_CARD } from "@/lib/data/parasitology/taenia-solium";
import { 
  ParasiteCard, 
  ParasiteGroup, 
  AnatomicLocalization, 
  ContentStatus 
} from "@/lib/data/parasitology/types";
import { 
  hasParasite3DModel, 
  getParasite3DConfig 
} from "@/lib/data/parasitology/models-registry";
import { Parasite3DViewer } from "@/components/modules/parasitologia/Parasite3DViewer";
import { Plasmodium3DViewer } from "@/components/modules/parasitologia/Plasmodium3DViewer";
import { PlasmodiumDifferential3DViewer } from "@/components/modules/parasitologia/PlasmodiumDifferential3DViewer";
import { Giardia3DViewer } from "@/components/modules/parasitologia/Giardia3DViewer";
import { Echinococcus3DViewer } from "@/components/modules/parasitologia/Echinococcus3DViewer";
import { Sarcoptes3DViewer } from "@/components/modules/parasitologia/Sarcoptes3DViewer";
import { Pediculus3DViewer } from "@/components/modules/parasitologia/Pediculus3DViewer";
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  ShieldCheck,
  X,
  Layers
} from "lucide-react";

export default function AtlasParasitosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedLocalization, setSelectedLocalization] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [expandedCardId, setExpandedCardId] = useState<string | null>("p25-taenia-solium");
  const [open3DViewerId, setOpen3DViewerId] = useState<string | null>(null);

  const handleToggleExpand = (id: string) => {
    if (expandedCardId === id) {
      setExpandedCardId(null);
      if (open3DViewerId === id) {
        setOpen3DViewerId(null);
      }
    } else {
      setExpandedCardId(id);
      if (open3DViewerId && open3DViewerId !== id) {
        setOpen3DViewerId(null);
      }
    }
  };

  // Opciones de filtros
  const groups: ParasiteGroup[] = [
    "Cestodos",
    "Nematodos",
    "Trematodos",
    "Protozoos apicomplejos",
    "Protozoos flagelados",
    "Protozoos ameboides",
    "Ectoparásitos",
  ];

  const localizations: AnatomicLocalization[] = [
    "Intestino delgado",
    "Intestino grueso",
    "Hígado y vías biliares",
    "Sistema nervioso central (SNC)",
    "Musculatura y tejido subcutáneo",
    "Sangre y sistema reticuloendotelial",
    "Vías respiratorias y pulmón",
    "Tracto urogenital",
    "Piel y anexos",
  ];

  // Filtrado de parásitos
  const filteredParasites = useMemo(() => {
    return ALL_PARASITES.filter((p) => {
      // Búsqueda de texto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = p.scientificName.toLowerCase().includes(query);
        const matchCommon = p.commonNames.some((c) => c.toLowerCase().includes(query));
        const matchClin = p.clinicalSummary.syndromes.some((s) => s.toLowerCase().includes(query));
        if (!matchName && !matchCommon && !matchClin) return false;
      }

      // Filtro de grupo
      if (selectedGroup !== "all" && p.group !== selectedGroup) {
        return false;
      }

      // Filtro de localización
      if (
        selectedLocalization !== "all" &&
        !p.localization.includes(selectedLocalization as AnatomicLocalization)
      ) {
        return false;
      }

      // Filtro de estado documental
      if (selectedStatus !== "all" && p.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedGroup, selectedLocalization, selectedStatus]);

  return (
    <div className="space-y-6">
      
      {/* Encabezado del catálogo */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Atlas de Parásitos de Relevancia Médica
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-4xl">
          Catálogo taxonómico sistemático de 35 especies parasitarias con filtros por grupo biológico, localización en el hospedador humano y disponibilidad documental. Incluye la monografía de referencia exhaustiva de <strong>Taenia solium</strong> basada en CDC DPDx y MINSAL.
        </p>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        
        {/* Buscador */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre científico (ej. Taenia, Giardia, Fasciola), nombre común o síndrome..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtros desplegables */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          
          {/* Grupo taxonómico */}
          <div>
            <label className="text-slate-400 block mb-1 font-semibold text-[11px] uppercase tracking-wider">
              Grupo Taxonómico:
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todos los grupos ({ALL_PARASITES.length})</option>
              {groups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Localización anatómica */}
          <div>
            <label className="text-slate-400 block mb-1 font-semibold text-[11px] uppercase tracking-wider">
              Localización en el Hospedador:
            </label>
            <select
              value={selectedLocalization}
              onChange={(e) => setSelectedLocalization(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todas las localizaciones</option>
              {localizations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Estado de documentación */}
          <div>
            <label className="text-slate-400 block mb-1 font-semibold text-[11px] uppercase tracking-wider">
              Nivel Documental:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todos los estados</option>
              <option value="disponible">Ficha completa de referencia (Taenia solium)</option>
              <option value="parcial">Ficha clínica resumida (34 especies)</option>
            </select>
          </div>

        </div>

        {/* Resumen de conteo */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
          <span>Mostrando <strong>{filteredParasites.length}</strong> de {ALL_PARASITES.length} especies</span>
          {(selectedGroup !== "all" || selectedLocalization !== "all" || selectedStatus !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedGroup("all");
                setSelectedLocalization("all");
                setSelectedStatus("all");
              }}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Restablecer filtros
            </button>
          )}
        </div>

      </div>

      {/* Lista de Fichas de Parásitos */}
      <div className="space-y-4">
        {filteredParasites.map((parasite) => {
          const isExpanded = expandedCardId === parasite.id;
          const isMaster = parasite.status === "disponible";
          const has3D = hasParasite3DModel(parasite.id);
          const is3DOpen = open3DViewerId === parasite.id;
          const config3D = getParasite3DConfig(parasite.id);

          return (
            <div
              key={parasite.id}
              className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                isMaster
                  ? "border-cyan-500/50 bg-slate-900/90 shadow-xl shadow-cyan-950/20"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              {/* Encabezado colapsable de la tarjeta */}
              <div
                onClick={() => handleToggleExpand(parasite.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleToggleExpand(parasite.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold">
                      {parasite.code}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 font-semibold">
                      {parasite.group}
                    </span>
                    {has3D && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                        <span>Modelo 3D</span>
                      </span>
                    )}
                    {isMaster ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ficha Maestra Exhaustiva</span>
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                        Ficha clínica resumida
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white italic">
                    {parasite.scientificName}
                  </h3>

                  {parasite.commonNames.length > 0 && (
                    <p className="text-xs text-slate-400">
                      Nombres comunes: {parasite.commonNames.join(", ")}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-wrap gap-1 max-w-xs justify-end">
                    {parasite.localization.slice(0, 2).map((loc, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700"
                      >
                        {loc}
                      </span>
                    ))}
                    {parasite.localization.length > 2 && (
                      <span className="text-[10px] px-1.5 py-0.5 text-slate-500 font-mono">
                        +{parasite.localization.length - 2}
                      </span>
                    )}
                  </div>

                  <div className="p-2 rounded-xl bg-slate-800/60 text-slate-300">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Cuerpo desplegado de la ficha */}
              {isExpanded && (
                <div className="px-5 pb-6 sm:px-6 space-y-5 border-t border-slate-800 pt-5 text-xs sm:text-sm">
                  
                  {/* Tarjeta de Modelo 3D: Carga condicional y desmontaje al cerrar */}
                  {has3D ? (
                    <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950/25 via-slate-900 to-slate-950 p-4 sm:p-5 shadow-lg space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                                Modelo 3D Morfológico
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                                {config3D?.badgeLabel || `Disponible · ${config3D?.stagesCount || 4} Estadios`}
                              </span>
                            </div>
                            <h4 className="text-sm sm:text-base font-bold text-white pt-0.5">
                              Reconstrucción interactiva de <em className="not-italic text-cyan-300 font-extrabold">{parasite.scientificName}</em>
                            </h4>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpen3DViewerId(is3DOpen ? null : parasite.id);
                          }}
                          aria-expanded={is3DOpen}
                          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border shadow-sm ${
                            is3DOpen
                              ? "bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-600"
                              : "bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border-purple-500/50 shadow-purple-950/50"
                          }`}
                        >
                          <Layers className="w-4 h-4 text-purple-400" />
                          <span>{is3DOpen ? "Cerrar área 3D" : "Abrir modelo 3D"}</span>
                        </button>
                      </div>

                      {/* Visor 3D: Solo montado cuando is3DOpen es true */}
                      {is3DOpen && (
                        <div className="pt-3 border-t border-slate-800 animate-in fade-in duration-300">
                          {parasite.id === "micro-4" ||
                          parasite.scientificName.toLowerCase().includes("plasmodium falciparum") ? (
                            <Plasmodium3DViewer onClose={() => setOpen3DViewerId(null)} />
                          ) : parasite.id === "p03" ||
                            parasite.scientificName.toLowerCase().includes("plasmodium vivax") ? (
                            <PlasmodiumDifferential3DViewer
                              speciesCode="p03"
                              onClose={() => setOpen3DViewerId(null)}
                            />
                          ) : parasite.id === "p04" ||
                            parasite.scientificName.toLowerCase().includes("plasmodium ovale") ? (
                            <PlasmodiumDifferential3DViewer
                              speciesCode="p04"
                              onClose={() => setOpen3DViewerId(null)}
                            />
                          ) : parasite.id === "p05" ||
                            parasite.scientificName.toLowerCase().includes("plasmodium malariae") ? (
                            <PlasmodiumDifferential3DViewer
                              speciesCode="p05"
                              onClose={() => setOpen3DViewerId(null)}
                            />
                          ) : parasite.id === "micro-6" ||
                            parasite.id === "p02" ||
                            parasite.scientificName.toLowerCase().includes("giardia") ? (
                            <Giardia3DViewer onClose={() => setOpen3DViewerId(null)} />
                          ) : parasite.id === "p27" ||
                            parasite.scientificName.toLowerCase().includes("echinococcus") ? (
                            <Echinococcus3DViewer onClose={() => setOpen3DViewerId(null)} />
                          ) : parasite.id === "p34" ||
                            parasite.scientificName.toLowerCase().includes("sarcoptes") ? (
                            <Sarcoptes3DViewer onClose={() => setOpen3DViewerId(null)} />
                          ) : parasite.id === "p35" ||
                            parasite.scientificName.toLowerCase().includes("pediculus") ? (
                            <Pediculus3DViewer onClose={() => setOpen3DViewerId(null)} />
                          ) : (
                            <Parasite3DViewer
                              speciesName={parasite.scientificName}
                              onClose={() => setOpen3DViewerId(null)}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-800/60 text-slate-500 border border-slate-700/60 shrink-0">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Modelo 3D Morfológico
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700">
                              Modelo 3D pendiente
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs mt-0.5">
                            Esta especie (<em className="italic text-slate-300">{parasite.scientificName}</em>) no cuenta con modelo tridimensional interactivo en esta versión. Su desarrollo se incorporará en las próximas tandas de modelado.
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-[11px] font-medium text-slate-500 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
                        Próxima tanda
                      </div>
                    </div>
                  )}
                  
                  {/* Hospedadores y localización anatómica */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                      <h4 className="font-bold text-slate-300 uppercase tracking-wider text-xs">
                        Hospedadores según ciclo biológico:
                      </h4>
                      <div className="space-y-1 text-xs text-slate-300">
                        <div>
                          <strong className="text-cyan-400">Definitivo: </strong>
                          {parasite.hosts.definitive.join("; ")}
                        </div>
                        <div>
                          <strong className="text-amber-400">Intermediario: </strong>
                          {parasite.hosts.intermediate.join("; ")}
                        </div>
                        {parasite.hosts.accidental && (
                          <div>
                            <strong className="text-red-400">Accidental: </strong>
                            {parasite.hosts.accidental.join("; ")}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                      <h4 className="font-bold text-slate-300 uppercase tracking-wider text-xs">
                        Localización en el hospedador:
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {parasite.localization.map((loc, i) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700"
                          >
                            {loc}
                          </span>
                        ))}
                      </div>
                      <div className="pt-1 text-xs text-slate-400">
                        <strong>Vía de transmisión: </strong>
                        {parasite.transmissionRoutes.join("; ")}
                      </div>
                    </div>

                  </div>

                  {/* Formas infectantes vs diagnósticas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/30 space-y-1">
                      <span className="text-xs font-bold text-red-300 uppercase tracking-wider">
                        Forma(s) Infectante(s):
                      </span>
                      <p className="text-xs text-red-100/90 leading-relaxed">
                        {parasite.infectiveForms.join("; ")}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-900/30 space-y-1">
                      <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                        Forma(s) Diagnóstica(s):
                      </span>
                      <p className="text-xs text-cyan-100/90 leading-relaxed">
                        {parasite.diagnosticForms.join("; ")}
                      </p>
                    </div>

                  </div>

                  {/* Manifestaciones clínicas y complicaciones */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                    <h4 className="font-bold text-slate-300 uppercase tracking-wider text-xs">
                      Manifestaciones clínicas & Complicaciones:
                    </h4>
                    <div className="space-y-1 text-xs text-slate-300">
                      <div>
                        <strong>Síndromes principales: </strong>
                        {parasite.clinicalSummary.syndromes.join("; ")}
                      </div>
                      {parasite.clinicalSummary.keySymptoms && (
                        <div>
                          <strong>Signos clave / Perla diagnóstica: </strong>
                          {parasite.clinicalSummary.keySymptoms.join("; ")}
                        </div>
                      )}
                      {parasite.clinicalSummary.severeComplications && (
                        <div className="text-red-300">
                          <strong>Complicaciones graves: </strong>
                          {parasite.clinicalSummary.severeComplications.join("; ")}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Métodos diagnósticos con sensibilidad y especificidad si es ficha maestra */}
                  {parasite.diagnosticMethods.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-300 uppercase tracking-wider text-xs">
                        Métodos diagnósticos validados:
                      </h4>
                      <div className="space-y-2">
                        {parasite.diagnosticMethods.map((dm, i) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-xs space-y-1"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <span className="font-bold text-white">{dm.name}</span>
                              <span className="text-[11px] text-cyan-300 font-mono">
                                Muestra: {dm.sampleType}
                              </span>
                            </div>
                            {dm.sensitivitySpecificity && (
                              <p className="text-slate-300">
                                <strong>Rendimiento: </strong>{dm.sensitivitySpecificity}
                              </p>
                            )}
                            <p className="text-slate-400">
                              <strong>Indicación: </strong>{dm.indication}
                            </p>
                            <p className="text-amber-300/80 text-[11px]">
                              <strong>Limitaciones: </strong>{dm.limitations}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tratamiento de primera línea y prevención */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/30 space-y-1">
                      <span className="font-bold text-emerald-300 uppercase tracking-wider text-xs">
                        Tratamiento de primera línea:
                      </span>
                      <p className="text-emerald-100/90 leading-relaxed">
                        {parasite.treatmentFirstLine}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                      <span className="font-bold text-slate-300 uppercase tracking-wider text-xs">
                        Prevención y control sanitario:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {parasite.preventionControl.join("; ")}
                      </p>
                    </div>
                  </div>

                  {/* Enlaces y fuentes primarias */}
                  {parasite.sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                      <div>
                        Fuentes primarias:{" "}
                        {parasite.sources.map((s, i) => (
                          <span key={i} className="text-cyan-400 font-medium mr-2">
                            {s.title} ({s.organization})
                          </span>
                        ))}
                      </div>
                      <span className="text-slate-500">
                        Revisión: {parasite.reviewDate} por {parasite.reviewer}
                      </span>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
