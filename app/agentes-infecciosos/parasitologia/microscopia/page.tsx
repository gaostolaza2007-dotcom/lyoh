"use client";

import React from "react";
import { MicroscopyViewer } from "@/components/modules/parasitologia/MicroscopyViewer";
import { Microscope } from "lucide-react";

export default function MicroscopiaPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Microscope className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Atlas Microscópico Virtual
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-4xl">
          Visualizador de preparaciones parasitológicas organizadas por especie y estadio diagnóstico. Incluye técnicas de montaje y tinción, retícula micrométrica ocular de calibración, estructuras clave identificables y licencias oficiales del CDC DPDx y MINSAL.
        </p>
      </div>

      <MicroscopyViewer />
    </div>
  );
}
