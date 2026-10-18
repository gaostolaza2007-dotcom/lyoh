"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, RotateCw, BookOpen } from "lucide-react";

/**
 * REDIRECCIÓN: ACCESO A MODELOS 3D DENTRO DEL ATLAS
 * El apartado independiente de modelos 3D se ha retirado para unificar la experiencia formativa:
 * Atlas de parásitos -> abrir ficha del parásito -> Modelo 3D integrado en la ficha.
 * Esta página redirige automáticamente a /agentes-infecciosos/parasitologia/atlas.
 */
export default function Morfologia3DRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/agentes-infecciosos/parasitologia/atlas");
    }, 700);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-5 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto">
          <RotateCw className="w-7 h-7 animate-spin text-cyan-400" />
        </div>

        <div className="space-y-2">
          <span className="text-xs px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
            Reorganización Integrada
          </span>
          <h2 className="text-xl font-bold text-white">
            Redirigiendo al Atlas de Parásitos...
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Los modelos 3D ahora se encuentran integrados directamente dentro de la ficha de cada parásito en el <strong>Atlas</strong>.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/agentes-infecciosos/parasitologia/atlas"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-cyan-950/50"
          >
            <BookOpen className="w-4 h-4" />
            <span>Ir al Atlas de parásitos</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
