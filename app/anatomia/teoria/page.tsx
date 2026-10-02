"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/lib/auth-context";
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Bookmark, 
  Share2, 
  Clock, 
  AlertCircle,
  Stethoscope,
  ChevronRight
} from "lucide-react";

export default function AnatomiaTeoriaPage() {
  const { addXp, updateUnitProgress } = useAuth();
  const [isCompleted, setIsCompleted] = useState(false);

  const handleMarkAsRead = () => {
    if (isCompleted) return;
    setIsCompleted(true);
    addXp(50);
    updateUnitProgress("anatomia", "teoria", 100);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Navegación y Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <Link
          href="/anatomia"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Anatomía</span>
        </Link>

        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Lectura de 8 min</span>
          </div>
          <span>•</span>
          <span className="text-purple-300 font-semibold">Anatomía Topográfica</span>
        </div>
      </div>

      {/* Título del Artículo */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Guía Clínica de Alto Rendimiento</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Plexo Braquial: Arquitectura, Ramas Terminales y Correlaciones Clínicas
        </h1>
        <p className="text-sm text-slate-300">
          Revisión anatómica profunda desde las raíces C5-T1 hasta los ramos terminales motores y sensitivos del miembro superior.
        </p>
      </div>

      {/* Contenedor del Lector Limpio */}
      <GlassCard className="p-6 sm:p-10 space-y-8 text-slate-200 leading-relaxed text-sm sm:text-base border border-white/15">
        
        {/* Sección 1: Organización Estructural */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2 border-b border-white/10 pb-2">
            <ChevronRight className="w-5 h-5 text-purple-400" />
            <span>1. Organización Jerárquica: Raíces, Troncos y Fascículos</span>
          </h2>
          <p className="text-slate-300">
            El plexo braquial se forma por la unión de los ramos anteriores de los nervios espinales <strong className="text-indigo-300">C5, C6, C7, C8 y T1</strong>. Pasa a través del triángulo inter-escalénico (entre el músculo escaleno anterior y medio) junto con la arteria subclavia.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10">
              <span className="text-xs font-bold text-purple-300 block mb-1">Tronco Superior</span>
              <p className="text-xs text-slate-400">Unión de C5 y C6. Vulnerable en partos distócicos o caídas en moto (Parálisis de Erb-Duchenne).</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10">
              <span className="text-xs font-bold text-blue-300 block mb-1">Tronco Medio</span>
              <p className="text-xs text-slate-400">Continuación directa de C7 sin uniones previas.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10">
              <span className="text-xs font-bold text-cyan-300 block mb-1">Tronco Inferior</span>
              <p className="text-xs text-slate-400">Unión de C8 y T1. Afectado en tracciones violentas hacia arriba (Parálisis de Klumpke).</p>
            </div>
          </div>
        </section>

        {/* Alerta de Correlación Clínica */}
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
          <div className="flex items-center space-x-2 font-bold text-sm mb-2 text-amber-300">
            <AlertCircle className="w-5 h-5" />
            <span>Correlación Clínica USMLE / MIR: Parálisis de Erb-Duchenne</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            La tracción excesiva del cuello durante el parto lesiona el tronco superior (C5-C6). Provoca la postura clásica en <strong>"propina de camarero" (waiter's tip)</strong>: brazo en aducción y rotación medial (pérdida deltoides y supra/infraespinoso), codo en extensión (pérdida bíceps y braquial anterior) y antebrazo en pronación.
          </p>
        </div>

        {/* Sección 2: Fascículos y Ramas Terminales */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2 border-b border-white/10 pb-2">
            <ChevronRight className="w-5 h-5 text-purple-400" />
            <span>2. Fascículos y sus 5 Ramas Terminales Mayores</span>
          </h2>
          
          <ul className="space-y-3 list-none pl-0">
            <li className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 shrink-0" />
              <div>
                <strong className="text-purple-300">Nervio Músculocutáneo (C5-C7):</strong> Inerva los flexores del compartimento anterior del brazo (bíceps, coracobraquial, braquial) y da sensibilidad a la cara lateral del antebrazo.
              </div>
            </li>
            <li className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0" />
              <div>
                <strong className="text-blue-300">Nervio Axilar (C5-C6):</strong> Rodea el cuello quirúrgico del húmero, inerva el músculo deltoides y redondo menor.
              </div>
            </li>
            <li className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0" />
              <div>
                <strong className="text-indigo-300">Nervio Radial (C5-T1):</strong> Discurre por el canal de torsión humeral. Inerva todos los extensores de codo, muñeca y dedos ("mano caída" o drop hand en caso de lesión).
              </div>
            </li>
            <li className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-pink-400 mt-2 shrink-0" />
              <div>
                <strong className="text-pink-300">Nervio Mediano (C5-T1):</strong> Formado por ramas de los fascículos lateral y medial. Pasa por el túnel carpiano. Lesión produce "mano simiana" y pérdida de oposición del pulgar.
              </div>
            </li>
            <li className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0" />
              <div>
                <strong className="text-cyan-300">Nervio Cubital / Ulnar (C8-T1):</strong> Pasa posterior al epicóndilo medial ("hueso de la risa"). Lesión distal causa la clásica "mano en garra" de los dedos 4° y 5°.
              </div>
            </li>
          </ul>
        </section>

        {/* Botón de Finalización de Lectura */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Stethoscope className="w-4 h-4 text-purple-400" />
            <span>Módulo validado según la terminología anatómica internacional (TA)</span>
          </div>

          <button
            onClick={handleMarkAsRead}
            disabled={isCompleted}
            className={`
              w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl font-bold text-xs shadow-lg transition-all
              ${isCompleted 
                ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default" 
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white active:scale-95 shadow-purple-900/30"}
            `}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCompleted ? "¡Completado (+50 XP)!" : "Marcar como Leído (+50 XP)"}</span>
          </button>
        </div>

      </GlassCard>
    </div>
  );
}