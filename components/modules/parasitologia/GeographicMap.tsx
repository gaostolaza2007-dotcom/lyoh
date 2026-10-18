"use client";

import React, { useState } from "react";
import { GEOGRAPHIC_ENTRIES } from "@/lib/data/parasitology/geography-data";
import { GeographicEntry } from "@/lib/data/parasitology/types";
import { 
  MapPin, 
  Globe, 
  ShieldAlert, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  FileText
} from "lucide-react";

export const GeographicMap: React.FC = () => {
  const [viewScope, setViewScope] = useState<"chile" | "global">("chile");
  const [selectedRegionId, setSelectedRegionId] = useState<string>("geo-ts-chile-araucania");

  const chileEntries = GEOGRAPHIC_ENTRIES.filter((e: GeographicEntry) => e.territory === "Chile");
  const globalEntries = GEOGRAPHIC_ENTRIES.filter((e: GeographicEntry) => e.territory !== "Chile");

  const activeDataset: GeographicEntry[] = viewScope === "chile" ? chileEntries : globalEntries;
  const currentRegion: GeographicEntry =
    activeDataset.find((r: GeographicEntry) => r.id === selectedRegionId) || activeDataset[0];

  return (
    <div className="space-y-6">
      
      {/* Selector de escala territorial */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-2 bg-slate-900/80 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setViewScope("chile");
              setSelectedRegionId("geo-ts-chile-araucania");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              viewScope === "chile"
                ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Foco en Chile (Vigilancia Nacional)</span>
          </button>
          <button
            onClick={() => {
              setViewScope("global");
              setSelectedRegionId("geo-ts-global-latam");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              viewScope === "global"
                ? "bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe className="w-4 h-4 text-purple-400" />
            <span>Panorama Global & América Latina</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 px-3">
          Fuentes oficiales: MINSAL Chile · SAG · ISP · OMS/OPS
        </span>
      </div>

      {/* Grid: Mapa Interactivo SVG + Ficha Epidemiológica Detallada */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Mapa vectorial interactivo */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {viewScope === "chile" ? "Cartografía Epidemiológica de Chile" : "Distribución Macro-Regional"}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono">
              Interactivo (haz clic en una zona)
            </span>
          </div>

          {/* SVG Interactivo estilizado */}
          <div className="relative aspect-[3/4] max-h-[460px] w-full flex items-center justify-center bg-slate-900/40 rounded-2xl border border-slate-800/60 p-4">
            {viewScope === "chile" ? (
              <svg viewBox="0 0 300 480" className="w-full h-full max-h-[420px]">
                {/* Silueta esquemática longitudinal de Chile */}
                <path
                  d="M140,20 Q150,100 135,180 Q120,260 110,340 Q95,420 80,470"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="32"
                  strokeLinecap="round"
                />

                {/* Marcadores de Regiones de Vigilancia */}
                {/* Región Metropolitana */}
                <g
                  onClick={() => setSelectedRegionId("geo-ts-chile-metropolitana")}
                  className="cursor-pointer group"
                >
                  <circle
                    cx="135"
                    cy="180"
                    r={selectedRegionId === "geo-ts-chile-metropolitana" ? 14 : 10}
                    className={`transition-all ${
                      selectedRegionId === "geo-ts-chile-metropolitana"
                        ? "fill-cyan-400 stroke-4 stroke-cyan-200"
                        : "fill-cyan-600/80 hover:fill-cyan-400 stroke-2 stroke-slate-900"
                    }`}
                  />
                  <text x="155" y="184" className="text-[11px] fill-slate-300 font-bold">
                    Región Metropolitana
                  </text>
                </g>

                {/* Región del Maule */}
                <g
                  onClick={() => setSelectedRegionId("geo-ts-chile-maule")}
                  className="cursor-pointer group"
                >
                  <circle
                    cx="128"
                    cy="230"
                    r={selectedRegionId === "geo-ts-chile-maule" ? 14 : 10}
                    className={`transition-all ${
                      selectedRegionId === "geo-ts-chile-maule"
                        ? "fill-amber-400 stroke-4 stroke-amber-200"
                        : "fill-amber-600/80 hover:fill-amber-400 stroke-2 stroke-slate-900"
                    }`}
                  />
                  <text x="148" y="234" className="text-[11px] fill-slate-300 font-bold">
                    Maule (Zona Centro-Sur)
                  </text>
                </g>

                {/* Región de La Araucanía */}
                <g
                  onClick={() => setSelectedRegionId("geo-ts-chile-araucania")}
                  className="cursor-pointer group"
                >
                  <circle
                    cx="118"
                    cy="290"
                    r={selectedRegionId === "geo-ts-chile-araucania" ? 16 : 12}
                    className={`transition-all animate-pulse ${
                      selectedRegionId === "geo-ts-chile-araucania"
                        ? "fill-red-500 stroke-4 stroke-red-200"
                        : "fill-red-600/90 hover:fill-red-400 stroke-2 stroke-slate-900"
                    }`}
                  />
                  <text x="140" y="294" className="text-[11px] fill-red-300 font-extrabold">
                    La Araucanía (Foco Histórico)
                  </text>
                </g>

                {/* Región de Los Lagos */}
                <g
                  onClick={() => setSelectedRegionId("geo-ts-chile-los-lagos")}
                  className="cursor-pointer group"
                >
                  <circle
                    cx="108"
                    cy="355"
                    r={selectedRegionId === "geo-ts-chile-los-lagos" ? 14 : 10}
                    className={`transition-all ${
                      selectedRegionId === "geo-ts-chile-los-lagos"
                        ? "fill-emerald-400 stroke-4 stroke-emerald-200"
                        : "fill-emerald-600/80 hover:fill-emerald-400 stroke-2 stroke-slate-900"
                    }`}
                  />
                  <text x="130" y="359" className="text-[11px] fill-slate-300 font-bold">
                    Los Lagos (Vigilancia SAG)
                  </text>
                </g>
              </svg>
            ) : (
              <div className="w-full h-full flex flex-col justify-center items-center p-4 space-y-3">
                <Globe className="w-16 h-16 text-purple-400/60 animate-pulse" />
                <p className="text-xs text-center text-slate-300 max-w-sm">
                  Haz clic en las regiones de la lista lateral para explorar la situación en América Latina andina, zonas de alta endemicidad y áreas con interrupción de transmisión.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {globalEntries.map((g: GeographicEntry) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedRegionId(g.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        selectedRegionId === g.id
                          ? "bg-purple-500 text-white"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {g.territory}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Lista accesible complementaria para lectores de pantalla y celular */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Zonas en monitoreo activo:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {activeDataset.map((item: GeographicEntry) => {
                const isSelected = item.id === selectedRegionId;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedRegionId(item.id)}
                    className={`p-2 rounded-xl text-left transition-all ${
                      isSelected
                        ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 font-bold"
                        : "bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    <div className="truncate font-semibold">{item.regionChile || item.territory}</div>
                    <div className="text-[10px] text-slate-500 font-normal truncate">
                      {item.evidenceLabel}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Ficha epidemiológica detallada de la región seleccionada */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            
            <div className="space-y-1 pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-semibold">
                  {currentRegion.evidenceLabel}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {currentRegion.periodOrDate}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white pt-1">
                {currentRegion.regionChile || currentRegion.territory}
              </h3>
              <p className="text-xs text-slate-400">
                Especie en foco: <strong className="text-cyan-300 italic">{currentRegion.speciesName}</strong>
              </p>
            </div>

            {/* Prevalencia o conteo de casos */}
            {currentRegion.casesCountOrPrevalence && (
              <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-800/30 text-xs space-y-1">
                <span className="text-xs font-bold text-cyan-300 block">
                  Hallazgo epidemiológico / Prevalencia:
                </span>
                <p className="text-cyan-100/90 leading-relaxed font-medium">
                  {currentRegion.casesCountOrPrevalence}
                </p>
              </div>
            )}

            {/* Contexto epidemiológico & notas de terreno */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Contexto epidemiológico & Vías de mantención:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/30 p-3.5 rounded-2xl border border-slate-800">
                {currentRegion.notes}
              </p>
            </div>

            {/* Limitaciones metodológicas locales */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Limitación específica del dato:</span>
              </span>
              <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                {currentRegion.limitations}
              </p>
            </div>

            {/* Fuente y limitación de evidencia */}
            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>Fuente oficial: <strong className="text-slate-300">{currentRegion.source}</strong></div>
              <div>Precisión geográfica: {currentRegion.geographicPrecision}</div>
            </div>

          </div>

          {/* Advertencia metodológica obligatoria */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <strong className="text-slate-300 block font-semibold flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Limitación metodológica general:</span>
            </strong>
            <p className="leading-relaxed">
              Las zonas sin datos o no sombreadas pueden reflejar ausencia de vigilancia sistemática activa o subnotificación de casos asintomáticos, y no necesariamente ausencia biológica del parásito.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
