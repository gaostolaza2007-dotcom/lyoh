"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { 
  CLINICAL_MODULES, 
  getTotalsConfig 
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
  Lock,
  Eye,
  Activity,
  Wrench,
  Scan,
  Compass,
  AlertTriangle,
  ChevronDown
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [showProgressDetails, setShowProgressDetails] = useState(false);

  const displayName = user.nickname || user.name.split(" ")[0] || "Gabriel";
  const displayUni = user.universityShort || "UDD";

  const modules = [
    {
      id: "microbiologia",
      title: "Agentes Infecciosos",
      desc: "Microbiología clínica de 140 fichas, parasitología médica estructurada y explorador 3D del cuerpo humano e infecciones.",
      href: "/agentes-infecciosos",
      icon: Bug,
      color: CLINICAL_MODULES.microbiologia.color,
      glow: CLINICAL_MODULES.microbiologia.glow,
      enabled: CLINICAL_MODULES.microbiologia.enabled,
      progress: user.unitProgress["microbiologia_patogenos"] || 0,
      subsections: [
        { label: "Microbiología (140 fichas)", href: "/agentes-infecciosos/microbiologia", icon: Bug },
        { label: "Parasitología (6 apartados)", href: "/agentes-infecciosos/parasitologia", icon: Target },
        { label: "Cuerpo humano e infecciones", href: "/agentes-infecciosos/cuerpo-humano", icon: BookOpen },
      ],
    },
    {
      id: "oftalmologia",
      title: CLINICAL_MODULES.oftalmologia.name,
      desc: CLINICAL_MODULES.oftalmologia.description,
      href: CLINICAL_MODULES.oftalmologia.href,
      icon: Eye,
      color: CLINICAL_MODULES.oftalmologia.color,
      glow: CLINICAL_MODULES.oftalmologia.glow,
      enabled: CLINICAL_MODULES.oftalmologia.enabled,
      badge: "Prototipo educativo",
      progress: null, // Prototipo sin avances numéricos falsos
      subsections: [
        { label: "Sistema visual", href: "/oftalmologia/sistema-visual", icon: Eye },
        { label: "Exploración", href: "/oftalmologia/exploracion", icon: Activity },
        { label: "Instrumentos", href: "/oftalmologia/instrumentos", icon: Wrench },
        { label: "Imagenología", href: "/oftalmologia/imagenologia", icon: Scan },
        { label: "Campo visual", href: "/oftalmologia/campo-visual", icon: Compass },
        { label: "Alteraciones", href: "/oftalmologia/alteraciones", icon: AlertTriangle },
      ],
    },
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
  ];

  // 1. Módulos clínicos disponibles: filtra exclusivamente los módulos habilitados para estudio
  const availableModules = modules.filter((m) => m.enabled);
  const availableModulesCount = availableModules.length;
  const totalModulesCount = modules.length;

  // 2. Módulos iniciados: módulos disponibles donde el estudiante registra actividad o progreso > 0
  const isModuleStarted = (mod: typeof modules[0]): boolean => {
    // Si mod.progress existe y es numérico > 0
    if (typeof mod.progress === "number" && mod.progress > 0) return true;
    // Si registra progreso directo en user.unitProgress
    if ((user.unitProgress[mod.id] || 0) > 0) return true;
    // Si alguna de las unidades asignadas al módulo tiene progreso > 0
    const modConfig = CLINICAL_MODULES[mod.id];
    if (modConfig && modConfig.units.length > 0) {
      return modConfig.units.some((u) => (user.unitProgress[u.id] || 0) > 0);
    }
    return false;
  };

  const startedModulesCount = availableModules.filter(isModuleStarted).length;

  // 3. Progreso hacia el siguiente rango de salud
  const levelProgressPercent = user.xpToNextLevel > 0 
    ? Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100))
    : 100;
  const xpNeeded = Math.max(0, user.xpToNextLevel - user.xp);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Banner de Bienvenida Compacto y Optimizado */}
      <section className="relative overflow-hidden rounded-2xl glass-panel p-4 sm:p-5 border border-white/10 shadow-lg bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90">
        
        {/* Fila principal: Saludo, datos de perfil y progreso compacto */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          
          <div className="space-y-1.5 min-w-0">
            {/* Badges de Nivel y Universidad / Carrera */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold flex items-center space-x-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{user.level} · Rango {user.rankLevel || 1}</span>
              </span>

              {user.universityShort && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/20 text-[11px] font-medium flex items-center space-x-1">
                  <Building2 className="w-3 h-3 text-blue-400 shrink-0" />
                  <span>{displayUni}</span>
                </span>
              )}

              {user.career && (
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 text-[11px] font-medium items-center space-x-1">
                  <GraduationCap className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate max-w-[150px]">{user.career}</span>
                </span>
              )}

              <Link
                href="/onboarding"
                className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-slate-200 border border-white/10 text-[11px] transition-colors"
                title="Editar datos de participante"
              >
                <span>Editar</span>
              </Link>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Bienvenido de vuelta, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">{displayName}</span>
            </h1>
          </div>

          {/* Bloque de Nivel y Progreso Compacto (evita duplicar porcentajes e indicadores) */}
          <div className="flex flex-col sm:items-end justify-center gap-1.5 shrink-0 w-full md:w-80">
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full text-xs">
              <span className="text-slate-400 text-[11px]">Siguiente rango:</span>
              <span className="font-semibold text-purple-300 text-xs font-mono">
                {user.xp} / {user.xpToNextLevel} XP
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                ({levelProgressPercent}%)
              </span>
            </div>

            <ProgressBar 
              value={levelProgressPercent} 
              color="purple" 
              className="h-1.5 w-full"
            />

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full mt-0.5">
              <button
                type="button"
                onClick={() => setShowProgressDetails((prev) => !prev)}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors py-0.5 focus:outline-none"
                aria-expanded={showProgressDetails}
                aria-controls="progress-details"
              >
                <span>{showProgressDetails ? "Ocultar progreso" : "Ver mi progreso"}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showProgressDetails ? "rotate-180" : ""}`} />
              </button>

              <Link
                href="/perfil"
                className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-0.5"
              >
                <span>Mi perfil</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>

        {/* Desplegable «Ver mi progreso» (Estadísticas secundarias organizadas sin saturar el inicio) */}
        {showProgressDetails && (
          <div 
            id="progress-details"
            className="relative z-10 mt-4 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Racha activa</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white mt-1">
                {user.streakDays} {user.streakDays === 1 ? "día" : "días"}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                Récord: {user.longestStreak || user.streakDays} días
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>XP para avanzar</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-purple-300 mt-1 font-mono">
                {xpNeeded} XP
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                Total: {user.xp} XP
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Módulos iniciados</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-emerald-300 mt-1 font-mono">
                {startedModulesCount} / {availableModulesCount}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                Con avance registrado
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Módulos disponibles</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-cyan-300 mt-1 font-mono">
                {availableModulesCount} activos
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                {totalModulesCount - availableModulesCount} en preparación
              </p>
            </div>
          </div>
        )}

      </section>

      {/* 2. Cuadrícula de Módulos Clínicos (Inmediata y Prioritaria) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
              <span>Módulos de Estudio</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {availableModulesCount} {availableModulesCount === 1 ? "módulo clínico disponible" : "módulos clínicos disponibles"} · {startedModulesCount} con estudio iniciado
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span 
              title="Módulos accesibles donde registras actividad o progreso de estudio"
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900/80 border border-white/10 text-slate-300 font-medium"
            >
              Módulos iniciados: <strong className="text-emerald-400 font-bold">{startedModulesCount} / {availableModulesCount}</strong>
            </span>
            <span 
              title="Módulos actualmente habilitados para estudio clínico"
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900/80 border border-white/10 text-slate-300 font-medium"
            >
              Disponibles: <strong className="text-cyan-400 font-bold">{availableModulesCount}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon;

            // TARJETA DE MÓDULO DESHABILITADO ("Próximamente")
            if (!mod.enabled) {
              return (
                <GlassCard
                  key={mod.id}
                  className="p-5 sm:p-6 flex flex-col justify-between opacity-55 grayscale-[20%] select-none border border-white/10 bg-slate-950/30 cursor-not-allowed relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-slate-500 shadow-md shrink-0">
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base sm:text-lg font-bold text-slate-400 truncate">
                            {mod.title}
                          </h3>
                          <span className="inline-flex items-center space-x-1 text-[11px] text-amber-400 font-semibold mt-0.5">
                            <Lock className="w-3 h-3" />
                            <span>Próximamente disponible</span>
                          </span>
                        </div>
                      </div>

                      <div 
                        title="Este módulo estará disponible próximamente"
                        className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0"
                      >
                        <Lock className="w-4 h-4" />
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-400 mb-5 leading-relaxed">
                      {mod.desc}
                    </p>

                    <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5 text-center text-xs text-slate-400 mb-4 font-medium flex items-center justify-center space-x-2">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Contenido e interactivos en preparación</span>
                    </div>
                  </div>

                  {/* Subsecciones no interactivas */}
                  <div className="pt-3.5 border-t border-white/10 flex flex-wrap gap-2 relative z-10">
                    {mod.subsections.map((sub) => {
                      const SubIcon = sub.icon;
                      return (
                        <span
                          key={sub.label}
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/40 border border-white/5 text-xs font-medium text-slate-500 cursor-not-allowed max-w-full"
                        >
                          <SubIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="break-words leading-tight">{sub.label}</span>
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
                className="p-5 sm:p-6 flex flex-col justify-between group hover:border-purple-500/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${mod.color} text-white shadow-lg shrink-0`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-white transition-colors truncate">
                          {mod.title}
                        </h3>
                        {mod.progress !== null ? (
                          <span className="text-xs text-purple-300 font-medium">
                            Nivel de Avance: {mod.progress}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 text-xs text-sky-300 font-medium">
                            <Sparkles className="w-3 h-3 text-sky-400" />
                            <span>{mod.badge || "Prototipo educativo"}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href={mod.href}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all group-hover:translate-x-1 shrink-0"
                      aria-label={`Acceder al módulo ${mod.title}`}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 mb-5 leading-relaxed">
                    {mod.desc}
                  </p>

                  {mod.progress !== null ? (
                    <ProgressBar value={mod.progress} color="purple" className="mb-4" />
                  ) : (
                    <div className="mb-4 p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/20 text-sky-300 text-xs flex items-center space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>Estructura modular activa · 6 Apartados de estudio</span>
                    </div>
                  )}
                </div>

                {/* Subsecciones con accesos directos ergonómicos */}
                <div className="pt-3.5 border-t border-white/10 flex flex-wrap gap-2">
                  {mod.subsections.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950/60 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all max-w-full"
                      >
                        <SubIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="break-words leading-tight">{sub.label}</span>
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
