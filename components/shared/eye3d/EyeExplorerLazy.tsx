"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Eye, Loader2 } from "lucide-react";

export interface EyeExplorerLazyProps {
  context?: "oftalmologia" | "optometria";
  className?: string;
}

// Carga diferida en el cliente para Three.js y WebGL
const EyeExplorerComponent = dynamic(
  () =>
    import("./EyeExplorer").then((mod) => ({
      default: mod.EyeExplorer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full min-h-[460px] rounded-3xl border border-sky-500/20 bg-slate-950/80 p-8 flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
          <Eye className="w-8 h-8 opacity-75" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-center space-x-2 text-sm font-bold text-white">
            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
            <span>Cargando Explorador 3D del Ojo Humano...</span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            Inicializando geometrías anatómicas y sombreadores WebGL para el dioptrio ocular.
          </p>
        </div>
      </div>
    ),
  }
);

export const EyeExplorerLazy: React.FC<EyeExplorerLazyProps> = (props) => {
  return <EyeExplorerComponent {...props} />;
};
