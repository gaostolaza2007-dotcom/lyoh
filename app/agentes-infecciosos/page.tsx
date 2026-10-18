"use client";

import React from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/lib/auth-context";
import { 
  Bug, 
  Dna, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Layers, 
  BookOpen, 
  Microscope,
  Info
} from "lucide-react";

export default function AgentesInfecciososHubPage() {
  const { user } = useAuth();
  const microProgress = user.unitProgress["microbiologia_patogenos"] || 0;

  const sections = [
    {
      id: "microbiologia",
      title: "Microbiología",
      subtitle: "Explora las fichas de agentes y sus características",
      desc: "Catálogo taxonómico exhaustivo de 140 microorganismos con tinción Gram, mecanismos de virulencia, manifestaciones clínicas, antibiogramas de primera línea y referencias bibliográficas.",
      href: "/agentes-infecciosos/microbiologia",
      icon: Bug,
      badge: "Disponible · 140 Fichas",
      badgeType: "active" as const,
      color: "from-cyan-500/20 to-teal-500/10",
      borderColor: "border-cyan-500/30",
      iconColor: "text-cyan-400",
      buttonText: "Entrar al catálogo",
      features: [
        "140 fichas clínicas clasificadas",
        "Bacterias, virus, hongos y parásitos",
        "Filtros taxonómicos y buscador rápido",
        "Evaluación y seguimiento de XP",
      ],
      progress: microProgress,
      isPreparation: false,
    },
    {
      id: "parasitologia",
      title: "Parasitología",
      subtitle: "Identificación, modelos 3D, microscopía virtual, ciclos y casos clínicos",
      desc: "Módulo clínico especializado estructurado en 6 apartados: atlas taxonómico de 35 especies con modelos 3D integrados en fichas, atlas microscópico virtual, comparador de especies parecidas, mapas de vigilancia en Chile y autoevaluación formativa.",
      href: "/agentes-infecciosos/parasitologia",
      icon: Dna,
      badge: "Disponible · 6 Apartados",
      badgeType: "active" as const,
      color: "from-purple-500/15 to-indigo-500/10",
      borderColor: "border-purple-500/25",
      iconColor: "text-purple-400",
      buttonText: "Entrar a Parasitología",
      features: [
        "Atlas con 35 especies y modelos 3D en fichas",
        "Atlas microscópico virtual con calibración",
        "Comparador diferencial de especies parecidas",
        "Ciclos de vida, mapas y autoevaluación",
      ],
      progress: null,
      isPreparation: false,
    },
    {
      id: "microbiota",
      title: "Microbioma del cuerpo humano",
      subtitle: "Explora los microorganismos asociados a distintas zonas del cuerpo",
      desc: "Cartografía interactiva en 3D y catálogo completo de 97 microorganismos comensales y mutualistas por región corporal (piel, boca, colon, intestino delgado y más), con funciones biológicas de barrera y referencias científicas.",
      href: "/agentes-infecciosos/microbiota",
      icon: Sparkles,
      badge: "Disponible · Atlas 3D y 97 Fichas",
      badgeType: "active" as const,
      color: "from-emerald-500/20 to-teal-500/10",
      borderColor: "border-emerald-500/30",
      iconColor: "text-emerald-400",
      buttonText: "Explorar microbioma",
      features: [
        "Atlas 3D con variantes anatómicas",
        "97 fichas educativas documentadas",
        "Colon con 16 entradas numeradas",
        "Clarificación: colonización vs infección",
      ],
      progress: null,
      isPreparation: false,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Barra de navegación superior con retroceso al Dashboard */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
          <span>Volver al Dashboard</span>
        </Link>

        <span className="text-xs text-slate-400 hidden sm:inline-block">
          MedStudy · Área de Ciencias Biomédicas
        </span>
      </div>

      {/* Hero Banner de Agentes Infecciosos */}
      <section className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-white/15 shadow-2xl bg-gradient-to-r from-slate-950 via-slate-900/90 to-cyan-950/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Bug className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sección Principal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Agentes Infecciosos
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Módulo integral para el estudio de microorganismos de relevancia médica: taxonomía y catálogo clínico, ultraestructura morfológica y ecología de la microbiota en los distintos nichos corporales.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>140 Fichas en Microbiología</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Microbioma · Atlas 3D y 97 Fichas</span>
              </span>
            </div>
          </div>

          {/* Resumen de Progreso de la Unidad */}
          <div className="md:w-72 shrink-0 p-5 rounded-2xl bg-slate-950/70 border border-white/10 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Progreso de la Unidad</span>
              <span className="text-sm font-bold text-cyan-400">{microProgress}%</span>
            </div>
            <ProgressBar value={microProgress} color="cyan" showPercent={false} />
            <p className="text-[11px] text-slate-400 leading-tight">
              Basado en el estudio y dominio del catálogo clínico de 140 microorganismos.
            </p>
          </div>
        </div>
      </section>

      {/* Cuadrícula de las 3 opciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((sec) => {
          const Icon = sec.icon;

          return (
            <GlassCard
              key={sec.id}
              className={`flex flex-col justify-between p-6 sm:p-7 rounded-3xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl bg-gradient-to-b ${sec.color} ${sec.borderColor}`}
            >
              <div className="space-y-4">
                
                {/* Cabecera de la tarjeta: Icono y Badge */}
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl bg-slate-950/70 border border-white/10 ${sec.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {sec.badgeType === "active" ? (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{sec.badge}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{sec.badge}</span>
                    </span>
                  )}
                </div>

                {/* Título y subtítulo */}
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white tracking-tight break-words">
                    {sec.title}
                  </h2>
                  <p className="text-xs font-medium text-slate-300">
                    {sec.subtitle}
                  </p>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {sec.desc}
                </p>

                {/* Lista de características */}
                <ul className="space-y-2 pt-2 border-t border-white/10 text-xs text-slate-300">
                  {sec.features.map((feat, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-slate-500 shrink-0 select-none mt-0.5">•</span>
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botón de acción */}
              <div className="pt-6 mt-4 border-t border-white/10">
                <Link
                  href={sec.href}
                  className={`
                    w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 shadow-lg
                    ${
                      sec.badgeType === "active"
                        ? "bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-cyan-950/50"
                        : "bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 shadow-black/20"
                    }
                  `}
                >
                  <span>{sec.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </GlassCard>
          );
        })}
      </div>

    </div>
  );
}
