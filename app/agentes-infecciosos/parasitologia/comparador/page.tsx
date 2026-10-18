"use client";

import React from "react";
import { ComparisonTable } from "@/components/modules/parasitologia/ComparisonTable";
import { GitCompare } from "lucide-react";

export default function ComparadorPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Comparador de Identificación Diferencial
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-4xl">
          Herramienta interactiva para la diferenciación morfológica lado a lado entre especies de apariencia similar. Analiza las diferencias biológicas determinantes, trampas diagnósticas comunes en el laboratorio y su impacto en la conducta médica.
        </p>
      </div>

      <ComparisonTable />
    </div>
  );
}
