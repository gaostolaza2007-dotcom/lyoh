"use client";

import React from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { Lock, ArrowLeft, Home, Sparkles, ShieldAlert } from "lucide-react";
import { CLINICAL_MODULES, ModuleDefinition } from "@/lib/modules-config";

interface ComingSoonScreenProps {
  moduleId?: string;
  moduleName?: string;
}

export const ComingSoonScreen: React.FC<ComingSoonScreenProps> = ({
  moduleId,
  moduleName,
}) => {
  const mod: ModuleDefinition | undefined = moduleId ? CLINICAL_MODULES[moduleId] : undefined;
  const title = moduleName || mod?.name || "Módulo Clínico";
  const message = mod?.comingSoonMessage || "Este módulo estará disponible próximamente";

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg relative">
        {/* Glow de ambientación morado/índigo */}
        <div className="absolute -top-16 -left-16 w-52 h-52 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <GlassCard className="p-8 sm:p-10 border border-white/15 shadow-2xl rounded-3xl text-center relative z-10 bg-slate-900/80 backdrop-blur-xl">
          {/* Badge superior con candado */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-6 shadow-lg shadow-amber-950/40">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Próximamente</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            {title}
          </h1>

          <p className="text-base sm:text-lg font-medium text-purple-200 mb-3">
            {message}
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed mb-8">
            Estamos integrando casos clínicos, interactivos y evaluaciones pedagógicas
            validadas para este módulo. Podrás acceder a su contenido completo en la siguiente fase de MedStudy.
          </p>

          {/* Botón requerido: Volver al inicio */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-purple-950/50 active:scale-[0.98] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al inicio</span>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center space-x-2 text-[11px] text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            <span>El progreso histórico previamente guardado se encuentra protegido en el servidor.</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
