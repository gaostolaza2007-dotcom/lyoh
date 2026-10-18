"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, RotateCw, Sparkles, Bug } from "lucide-react";

/**
 * REDIRECCIÓN Y PRESERVACIÓN: RUTA DE MORFOLOGÍA
 * La sección «Morfología» ha sido integrada de forma especializada en «Parasitología»
 * (con modelos 3D Three.js, microscopía virtual y comparadores anatómicos) y en las fichas
 * clínicas de Microbiología para Bacterias, Hongos y Virus.
 * Esta página redirige automáticamente a /agentes-infecciosos/parasitologia para prevenir enlaces rotos.
 */
export default function MorfologiaRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirección inmediata pero suave al nuevo módulo de Parasitología
    const timer = setTimeout(() => {
      router.replace("/agentes-infecciosos/parasitologia");
    }, 800);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-5 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto">
          <RotateCw className="w-7 h-7 animate-spin text-cyan-400" />
        </div>

        <div className="space-y-2">
          <span className="text-xs px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
            Reorganización de Secciones
          </span>
          <h2 className="text-xl font-bold text-white">
            Redirigiendo a Parasitología...
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            La sección de morfología se ha reorganizado e integrado dentro del nuevo módulo principal de <strong>Parasitología Médica</strong> con modelos 3D, microscopía y comparador.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/agentes-infecciosos/parasitologia"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-cyan-950/50"
          >
            <span>Ir a Parasitología ahora</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * ARCHIVO HISTÓRICO DE REFERENCIA (CONTENIDO PRESERVADO):
 * Temas de ultraestructura bacteriana (cocos, bacilos, peptidoglicano, membrana externa LPS, BAAR),
 * hongos (levaduras, hifas septadas/cenocíticas, dimorfismo térmico) y cápsides virales
 * conservados como documentación viva para integración continua en el catálogo de Microbiología.
 */
