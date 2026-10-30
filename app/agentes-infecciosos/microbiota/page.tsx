"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, RotateCw, Layers } from "lucide-react";

/**
 * REDIRECCIÓN Y COMPATIBILIDAD CON ENLACES PREVIOS:
 * La sección «Microbioma del cuerpo humano» ha sido unificada en el nuevo apartado
 * «Microorganismos y cuerpo humano» (/agentes-infecciosos/cuerpo-humano), integrando
 * tanto el atlas de microbiota 3D (97 fichas) como las infecciones por sistemas.
 * Esta página redirige preservando cualquier parámetro de URL (?region=..., ?entry=...).
 */
export default function MicrobiotaRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentParams = window.location.search;
      const targetUrl = currentParams
        ? `/agentes-infecciosos/cuerpo-humano${currentParams}&vista=microbioma`
        : `/agentes-infecciosos/cuerpo-humano?vista=microbioma`;
      
      const timer = setTimeout(() => {
        router.replace(targetUrl);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-5 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
          <RotateCw className="w-7 h-7 animate-spin text-emerald-400" />
        </div>

        <div className="space-y-2">
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
            Integración de Secciones
          </span>
          <h2 className="text-xl font-bold text-white">
            Redirigiendo a Microorganismos y Cuerpo Humano...
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            El catálogo de microbiota y su visor 3D ahora forman parte del módulo unificado de <strong>Microorganismos y Cuerpo Humano</strong>, combinando ecología comensal e infecciones clínicas.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/agentes-infecciosos/cuerpo-humano?vista=microbioma"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-950/50"
          >
            <span>Ir ahora a Microorganismos y Cuerpo Humano</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
