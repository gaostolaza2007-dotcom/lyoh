"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { 
  CLINICAL_MODULES, 
  getTotalsConfig, 
  getEnabledUnitIds, 
  isModuleEnabled 
} from "@/lib/modules-config";
import { 
  Layers, 
  FlaskConical, 
  Microscope, 
  Bug, 
  Flame, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  BookOpen, 
  Box, 
  Target,
  GraduationCap,
  Building2,
  Edit3,
  Lock
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const displayName = user.nickname || user.name.split(" ")[0] || "Gabriel";
  const displayUni = user.universityShort || "UDD";

  // Totales y unidades calculadas DINÁMICAMENTE desde la configuración
  const { enabledModulesCount, enabledUnitsCount } = getTotalsConfig();
  const enabledUnitIds = getEnabledUnitIds();

  // Contar unidades activas solo entre los módulos actualmente disponibles
  const activeAvailableUnits = enabledUnitIds.filter(
    (unitId) => (user.unitProgress[unitId] || 0) > 0
  ).length;

  const modules = [
    {
      id: "anatomia",
      title: CLINICAL_MODULES.anatomia.name,
      desc: CLINICAL_MODULES.anatomia.description,
      href: CLINICAL_MODULES.anatomia.href,
      icon: Layers,
      color: CLINICAL_MODULES.anatomia.color,
      glow: CLINICAL_MODULES.anatomia.glow,
      enabled: CLINICAL_MODULES.anatomia.enabled,
      progress: user.unitProgress["anatomia_flashcards"] || 0,
      subsections: [
        { label: "Flashcards", href: "/anatomia/flashcards", icon: Target },
        { label: "Teoría", href: "/anatomia/teoria", icon: BookOpen },
        { label: "Visor 3D", href: "/anatomia/visor-3d", icon: Box },
      ],
    },
    {
      id: "bioquimica",
      title: CLINICAL_MODULES.bioquimica.name,
      desc: CLINICAL_MODULES.bioquimica.description,
      href: CLINICAL_MODULES.bioquimica.href,
      icon: FlaskConical,
      color: CLINICAL_MODULES.bioquimica.color,
      glow: CLINICAL_MODULES.bioquimica.glow,
      enabled: CLINICAL_MODULES.bioquimica.enabled,
      progress: user.unitProgress["bioquimica_metabolismo"] || 0,
      subsections: [
        { label: "Glucólisis Drag-Drop", href: "/bioquimica", icon: Play },
        { label: "Regulación Enzimática", href: "/bioquimica", icon: BookOpen },
      ],
    },
    {
      id: "histologia",
      title: CLINICAL_MODULES.histologia.name,
      desc: CLINICAL_MODULES.histologia.description,
      href: CLINICAL_MODULES.histologia.href,
      icon: Microscope,
      color: CLINICAL_MODULES.histologia.color,
      glow: CLINICAL_MODULES.histologia.glow,
      enabled: CLINICAL_MODULES.histologia.enabled,
      progress: user.unitProgress["histologia_tejidos"] || 0,
      subsections: [
        { label: "Glomérulo Renal (H&E)", href: "/histologia", icon: Target },
      ],
    },
    {
      id: "microbiologia",
      title: "Agentes Infecciosos",
      desc: "Microbiología clínica de 140 fichas, morfología estructural y microbiota de los nichos corporales.",
      href: "/agentes-infecciosos",
      icon: Bug,
      color: CLINICAL_MODULES.microbiologia.color,
      glow: CLINICAL_MODULES.microbiologia.glow,
      enabled: CLINICAL_MODULES.microbiologia.enabled,
      progress: user.unitProgress["microbiologia_patogenos"] || 0,
      subsections: [
        { label: "Microbiología", href: "/agentes-infecciosos/microbiologia", icon: Bug },
        { label: "Morfología (En prep.)", href: "/agentes-infecciosos/morfologia", icon: Target },
        { label: "Microbiota (En prep.)", href: "/agentes-infecciosos/microbiota", icon: BookOpen },
      ],
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Banner de Bienvenida Personalizado con Onboarding */}
      <section className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-white/15 shadow-2xl bg-gradient-to-r from-slate-900/80 via-indigo-950/50 to-purple-950/70">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            
            {/* Badges de Nivel, Universidad y Carrera */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center space-x-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{user.level} (Nivel {user.rankLevel || 1})</span>
              </span>

              {user.university && (
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>{displayUni}</span>
                </span>
              )}

              {user.career && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{user.career}</span>
                </span>
              )}

              <Link
                href="/onboarding"
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/10 text-xs font-medium flex items-center space-x-1 transition-colors"
                title="Editar datos de participante"
              >
                <Edit3 className="w-3 h-3" />
                <span>Modificar</span>
              </Link>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Bienvenido de vuelta, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300">{displayName}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Plataforma de entrenamiento clínico y retención médica activa. Explora los módulos de anatomía y microbiología disponibles.
            </p>
          </div>

          {/* Tarjeta de Racha y XP */}
          <div className="flex sm:flex-col gap-3 shrink-0">
            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 shadow-inner">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Racha Activa</p>
                <p className="text-lg font-extrabold text-white">{user.streakDays} días</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 shadow-inner">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Puntos de XP</p>
                <p className="text-lg font-extrabold text-white">{user.xp} XP</p>
              </div>
            </div>
          </div>

        </div>

        {/* Barra de progreso hacia el siguiente nivel */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
              <span>Progreso de Nivel</span>
              <span className="text-purple-400 font-bold">({user.xp} / {user.xpToNextLevel} XP)</span>
            </span>
            <span className="font-bold text-purple-300">
              {Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100))}%
            </span>
          </div>
          <ProgressBar 
            value={Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100))} 
            color="purple" 
          />
        </div>

        {/* Métricas Rápidas Dinámicas */}
        <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-slate-950/40 border border-white/5">
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Mayor Racha</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">
              {user.longestStreak || user.streakDays} d
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/40 border border-white/5">
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <Award className="w-4 h-4 text-purple-400" />
              <span>Rango Actual</span>
            </div>
            <p className="text-xs font-semibold text-purple-200 mt-1 truncate">
              {user.level}
            </p>
          </div>

          {/* Módulos/Unidades activas calculadas dinámicamente de módulos habilitados */}
          <div className="p-3 rounded-2xl bg-slate-950/40 border border-white/5">
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Unidades Activas</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-emerald-300 mt-1">
              {activeAvailableUnits} / {enabledUnitsCount}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/40 border border-white/5">
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Próximo Rango</span>
            </div>
            <p className="text-xs font-semibold text-cyan-200 mt-1 truncate">
              {Math.max(0, user.xpToNextLevel - user.xp)} XP restantes
            </p>
          </div>
        </div>
      </section>

      {/* Cuadrícula de Módulos Clínicos */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Módulos de Estudio</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            {enabledModulesCount} {enabledModulesCount === 1 ? "Módulo disponible" : "Módulos disponibles"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon;

            // TARJETA DE MÓDULO DESHABILITADO ("Próximamente")
            if (!mod.enabled) {
              return (
                <GlassCard
                  key={mod.id}
                  className="p-6 flex flex-col justify-between opacity-55 grayscale-[20%] select-none border border-white/10 bg-slate-950/30 cursor-not-allowed relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10 text-slate-500 shadow-md">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-bold text-slate-400">
                              {mod.title}
                            </h3>
                          </div>
                          <span className="inline-flex items-center space-x-1 text-[11px] text-amber-400 font-semibold mt-0.5">
                            <Lock className="w-3 h-3" />
                            <span>Próximamente disponible</span>
                          </span>
                        </div>
                      </div>

                      {/* Icono de candado en lugar de flecha */}
                      <div 
                        title="Este módulo estará disponible próximamente"
                        className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400"
                      >
                        <Lock className="w-4 h-4" />
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
                      {mod.desc}
                    </p>

                    <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5 text-center text-xs text-slate-400 mb-4 font-medium flex items-center justify-center space-x-2">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Contenido e interactivos en preparación</span>
                    </div>
                  </div>

                  {/* Subsecciones no interactivas / deshabilitadas */}
                  <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2 relative z-10">
                    {mod.subsections.map((sub) => {
                      const SubIcon = sub.icon;
                      return (
                        <span
                          key={sub.label}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/40 border border-white/5 text-xs font-medium text-slate-500 cursor-not-allowed"
                        >
                          <SubIcon className="w-3.5 h-3.5 text-slate-500" />
                          <span>{sub.label}</span>
                        </span>
                      );
                    })}
                  </div>
                </GlassCard>
              );
            }

            // TARJETA DE MÓDULO HABILITADO
            return (
              <GlassCard
                key={mod.id}
                glow={mod.glow}
                className="p-6 flex flex-col justify-between group hover:border-purple-500/40"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-2xl bg-gradient-to-tr ${mod.color} text-white shadow-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">
                          {mod.title}
                        </h3>
                        <span className="text-xs text-purple-300 font-medium">
                          Nivel de Maestría: {mod.progress}%
                        </span>
                      </div>
                    </div>

                    <Link
                      href={mod.href}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all group-hover:translate-x-1"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                    {mod.desc}
                  </p>

                  <ProgressBar value={mod.progress} color="purple" className="mb-4" />
                </div>

                {/* Subsecciones con accesos directos */}
                <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2">
                  {mod.subsections.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950/60 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all"
                      >
                        <SubIcon className="w-3.5 h-3.5 text-purple-400" />
                        <span>{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>

    </div>
  );
}