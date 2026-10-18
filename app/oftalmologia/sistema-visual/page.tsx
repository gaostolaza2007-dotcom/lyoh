"use client";

import React from "react";
import { OftalmologiaNav } from "@/components/modules/oftalmologia/OftalmologiaNav";
import { EyeExplorerLazy } from "@/components/shared/eye3d/EyeExplorerLazy";
import { Eye, Layers, Sparkles, Target } from "lucide-react";

export default function SistemaVisualPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <OftalmologiaNav />

      {/* Encabezado del Apartado */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Eye className="w-6 h-6 text-sky-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight break-words">
            1. Sistema Visual
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
          Estudio de la morfología, túnicas concéntricas y medios refringentes del globo ocular humano mediante reconstrucción tridimensional interactiva con selección de estructuras, corte anatómico y consulta de funciones biológicas.
        </p>
      </div>

      {/* Tarjeta de Objetivos Pedagógicos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-sky-300">
            <Target className="w-4 h-4 text-sky-400" />
            <span>Objetivo 01: Topografía</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Identificar las relaciones espaciales entre las tres túnicas (fibrosa, vascular y sensorial) y los medios refringentes.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-300">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Objetivo 02: Dioptrio Ocular</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Comprender el poder refractivo corneal (~43 D) y la capacidad de acomodación del cristalino, cuya amplitud máxima decrece fisiológicamente con la edad hasta la presbicia.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Objetivo 03: Reutilización</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Diseñado como núcleo anatómico que enlaza con los exámenes clínicos de Oftalmología y con el futuro análisis refractivo en Optometría.
          </p>
        </div>
      </div>

      {/* Explorador 3D del Ojo Humano */}
      <EyeExplorerLazy context="oftalmologia" />

    </div>
  );
}
