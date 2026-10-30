"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  HeartPulse,
  Info,
} from "lucide-react";
import { CatedraUnitHub } from "@/components/modules/infecciones/catedras/CatedraUnitHub";
import {
  findGroupByUnitId,
  getThemeGroupsByTopic,
} from "@/components/modules/infecciones/catedras/certamenCatalog";

type CatedraTopic = "hepatobiliar" | "cardiovascular";

export default function Certamen3Page() {
  const [selectedTopic, setSelectedTopic] = useState<CatedraTopic>("hepatobiliar");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Sincronización bidireccional con parámetros de URL (?tema=...&grupo=...&unidad=...) y popstate
  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const temaParam = (params.get("tema") || params.get("sistema")) as CatedraTopic | null;
      const grupoParam = params.get("grupo");
      const unidadParam = params.get("unidad");

      let topic: CatedraTopic =
        temaParam === "cardiovascular" || temaParam === "hepatobiliar"
          ? temaParam
          : "hepatobiliar";

      // 1. Si viene una unidad directa (enlace directo o marcador existente)
      if (unidadParam) {
        const resolved = findGroupByUnitId(unidadParam);
        if (resolved) {
          setSelectedTopic(resolved.topic);
          setSelectedGroupId(resolved.group.id);
          setSelectedUnitId(resolved.unit.id);
          return;
        }
      }

      // 2. Si viene un grupo explícito
      if (grupoParam) {
        const groups = getThemeGroupsByTopic(topic);
        const foundGroup = groups.find((g) => g.id === grupoParam);
        if (foundGroup) {
          setSelectedTopic(topic);
          setSelectedGroupId(foundGroup.id);
          const firstUnit = foundGroup.availableUnits[0]?.id || null;
          setSelectedUnitId(firstUnit);
          return;
        }
      }

      // 3. Portada de temas del área seleccionada
      setSelectedTopic(topic);
      setSelectedGroupId(null);
      setSelectedUnitId(null);
    };

    if (typeof window !== "undefined") {
      syncFromUrl();
      window.addEventListener("popstate", syncFromUrl);
      return () => window.removeEventListener("popstate", syncFromUrl);
    }
  }, []);

  // Cambio de Área (Infecciones Hepáticas vs Infecciones Intravasculares)
  const handleSelectTopic = (topic: CatedraTopic) => {
    setSelectedTopic(topic);
    setSelectedGroupId(null);
    setSelectedUnitId(null);
    if (typeof window !== "undefined") {
      const nextUrl = `${window.location.pathname}?tema=${topic}`;
      window.history.pushState(null, "", nextUrl);
    }
  };

  // Apertura de un tema agrupado
  const handleSelectGroup = (groupId: string, defaultUnitId?: string) => {
    const groups = getThemeGroupsByTopic(selectedTopic);
    const group = groups.find((g) => g.id === groupId);
    const unitId = defaultUnitId || group?.availableUnits[0]?.id || null;

    setSelectedGroupId(groupId);
    setSelectedUnitId(unitId);

    if (typeof window !== "undefined") {
      const nextUrl = unitId
        ? `${window.location.pathname}?tema=${selectedTopic}&grupo=${groupId}&unidad=${unitId}`
        : `${window.location.pathname}?tema=${selectedTopic}&grupo=${groupId}`;
      window.history.pushState(null, "", nextUrl);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Retorno a la portada de temas
  const handleBackToThemes = () => {
    setSelectedGroupId(null);
    setSelectedUnitId(null);

    if (typeof window !== "undefined") {
      const nextUrl = `${window.location.pathname}?tema=${selectedTopic}`;
      window.history.pushState(null, "", nextUrl);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Cambio de actividad dentro del tema activo
  const handleSelectUnit = (unitId: string) => {
    setSelectedUnitId(unitId);

    if (typeof window !== "undefined" && selectedGroupId) {
      const nextUrl = `${window.location.pathname}?tema=${selectedTopic}&grupo=${selectedGroupId}&unidad=${unitId}`;
      window.history.replaceState(null, "", nextUrl);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      
      {/* 1. Barra de navegación superior con retorno directo a Agentes Infecciosos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <Link
          href="/agentes-infecciosos"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 w-fit min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
          <span>Volver a Agentes Infecciosos</span>
        </Link>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-300">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/agentes-infecciosos" className="hover:text-slate-300">
            Agentes Infecciosos
          </Link>
          <span>/</span>
          <span className="text-amber-400 font-medium">Preparación para el Certamen 3</span>
        </div>
      </div>

      {/* 2. Banner Principal: Preparación para el Certamen 3 (Estilo Parasitología) */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl bg-gradient-to-br from-slate-950 via-slate-900/90 to-slate-950">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Ejercitación y Estudio Dirigido · Semestre en Curso</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Preparación para el Certamen 3
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Repasa infecciones hepáticas e intravasculares con actividades guiadas y modelos disponibles organizados por temas.
            </p>

            <div className="pt-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-200/80 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  Módulo de repaso focalizado en las cátedras incorporadas (Cátedra 20 y Cátedra 21). No comprende la totalidad del temario del certamen.
                </span>
              </div>
            </div>
          </div>

          {/* Selector de Área: Infecciones Hepáticas vs Infecciones Intravasculares */}
          <div className="p-1.5 rounded-2xl bg-slate-950/80 border border-white/15 shadow-xl flex flex-col sm:flex-row gap-2 self-start lg:self-center shrink-0">
            <button
              type="button"
              onClick={() => handleSelectTopic("hepatobiliar")}
              aria-pressed={selectedTopic === "hepatobiliar"}
              className={`
                px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between sm:justify-start space-x-2.5 min-h-[44px]
                ${
                  selectedTopic === "hepatobiliar"
                    ? "bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 shadow-lg shadow-amber-950/60 font-extrabold ring-1 ring-amber-300"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <div className="flex items-center gap-2">
                <BookOpen className={`w-4 h-4 ${selectedTopic === "hepatobiliar" ? "text-slate-950" : "text-amber-400"}`} />
                <span>Infecciones hepáticas</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  selectedTopic === "hepatobiliar"
                    ? "bg-slate-950/20 text-slate-950 font-bold"
                    : "bg-white/5 text-slate-400"
                }`}
              >
                Cátedra 20
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTopic("cardiovascular")}
              aria-pressed={selectedTopic === "cardiovascular"}
              className={`
                px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between sm:justify-start space-x-2.5 min-h-[44px]
                ${
                  selectedTopic === "cardiovascular"
                    ? "bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-950/60 font-extrabold ring-1 ring-rose-300"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <div className="flex items-center gap-2">
                <HeartPulse className={`w-4 h-4 ${selectedTopic === "cardiovascular" ? "text-white" : "text-rose-400"}`} />
                <span>Infecciones intravasculares</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  selectedTopic === "cardiovascular"
                    ? "bg-white/20 text-white font-bold"
                    : "bg-white/5 text-slate-400"
                }`}
              >
                Cátedra 21
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Hub de Temas Agrupados o Tema Abierto con Selector Compacto */}
      <CatedraUnitHub
        systemId={selectedTopic}
        activeGroupId={selectedGroupId}
        activeUnitId={selectedUnitId}
        onSelectGroup={handleSelectGroup}
        onBackToThemes={handleBackToThemes}
        onSelectUnit={handleSelectUnit}
      />
    </div>
  );
}
