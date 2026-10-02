"use client";

import React from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/lib/auth-context";
import { 
  Layers, 
  Target, 
  BookOpen, 
  Box, 
  ArrowRight, 
  Sparkles, 
  HeartHandshake, 
  CheckCircle 
} from "lucide-react";

export default function AnatomiaHubPage() {
  const { user } = useAuth();

  const subroutes = [
    {
      title: "Flashcards Clínicas",
      desc: "Autoevaluación de alta retención. Imágenes anatómicas con 4 alternativas y validación clínica instantánea.",
      href: "/anatomia/flashcards",
      icon: Target,
      tag: "Interactiva",
      color: "from-blue-600 to-cyan-500",
      progress: user.unitProgress["anatomia_flashcards"] || 0,
    },
    {
      title: "Teoría Anatómica",
      desc: "Lectura clínica limpia y estructurada. Plejo braquial, pares craneales, territorio coronario y mnemotecnias.",
      href: "/anatomia/teoria",
      icon: BookOpen,
      tag: "Lectura",
      color: "from-indigo-600 to-purple-600",
      progress: user.unitProgress["anatomia_teoria"] || 0,
    },
    {
      title: "Visor 3D Interactivo",
      desc: "Modelo tridimensional de corazón (lyoh_heart.glb). Explora su morfología externa en 360°, controla la animación de latido a 75 LPM y examina sus texturas biológicas.",
      href: "/anatomia/visor-3d",
      buttonText: "Explorar Visor Interactivo",
      icon: Box,
      tag: "Three.js 3D",
      color: "from-purple-600 to-pink-600",
      progress: user.unitProgress["anatomia_visor-3d"] || 0,
    },
  ];

  const totalAnat = Math.round(
    ((user.unitProgress["anatomia_flashcards"] || 0) +
     (user.unitProgress["anatomia_teoria"] || 0) +
     (user.unitProgress["anatomia_visor-3d"] || 0)) / 3
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Módulo 01</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Anatomía Humana y Quirúrgica
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Domina las relaciones topográficas, inervación y vascularización mediante tres metodologías integradas.
          </p>
        </div>

        <div className="flex items-center space-x-3 px-4 py-2 rounded-2xl glass-card border border-white/10">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <div className="text-xs">
            <span className="text-slate-400 block">Progreso del Módulo</span>
            <span className="font-bold text-white">{totalAnat}% Completado</span>
          </div>
        </div>
      </div>

      {/* Selector de las 3 Subrutas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subroutes.map((sub) => {
          const Icon = sub.icon;
          return (
            <GlassCard
              key={sub.title}
              glow="purple"
              className="p-6 flex flex-col justify-between group hover:border-purple-500/40"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-tr ${sub.color} text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-purple-200 border border-white/10">
                    {sub.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {sub.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  {sub.desc}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <ProgressBar value={sub.progress} color="purple" label="Avance" />
                <Link
                  href={sub.href}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-purple-600/30 border border-white/10 text-xs font-semibold text-white transition-all group-hover:border-purple-500/50"
                >
                  <span>{sub.buttonText || `Explorar ${sub.title}`}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Sección Informativa: Perlas Anatómicas de Examen */}
      <div className="p-6 rounded-3xl glass-panel border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 to-slate-900/60">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-100">Perla de Residencia Médica</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              En trauma torácico cerrado, la zona del cayado aórtico más susceptible a rotura por cizallamiento e inercia es el <strong>istmo aórtico</strong>, inmediatamente distal al origen de la arteria subclavia izquierda y a nivel de la inserción del ligamento arterioso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}