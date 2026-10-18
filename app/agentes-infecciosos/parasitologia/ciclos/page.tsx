"use client";

import React from "react";
import { LifeCycleDiagram } from "@/components/modules/parasitologia/LifeCycleDiagram";
import { RotateCw } from "lucide-react";

export default function CiclosPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <RotateCw className="w-5 h-5 text-rose-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Ciclos Biológicos de Transmisión & Patogenia
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-4xl">
          Diagrama interactivo fase por fase del ciclo heteroxénico de <strong>Taenia solium</strong>. Comprende el rol del hospedador definitivo, el cerdo como intermediario habitual y el humano como intermediario accidental en el desarrollo de la neurocisticercosis.
        </p>
      </div>

      <LifeCycleDiagram />
    </div>
  );
}
