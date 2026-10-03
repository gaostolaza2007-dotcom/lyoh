"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth, HEALTH_RANKS } from "@/lib/auth-context";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { 
  UserCircle2, 
  Flame, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  TrendingUp, 
  BookOpen, 
  Layers, 
  FlaskConical, 
  Microscope, 
  Bug,
  Building2,
  GraduationCap,
  Settings,
  Edit3,
  RotateCcw,
  Lock
} from "lucide-react";
import { 
  getTotalsConfig, 
  getEnabledUnitIds, 
  isUnitEnabled 
} from "@/lib/modules-config";

export default function PerfilPage() {
  const { user, signInWithGoogle, signOut, resetProgressToZero, isConfigured } = useAuth();

  const { enabledUnitsCount } = getTotalsConfig();
  const enabledUnitIds = getEnabledUnitIds();
  const activeAvailableCount = enabledUnitIds.filter(
    (id) => (user.unitProgress[id] || 0) > 0
  ).length;

  const units = [
    { id: "anatomia_flashcards", label: "Anatomía: Flashcards Clínicas", icon: Layers, val: user.unitProgress["anatomia_flashcards"] || 0 },
    { id: "anatomia_teoria", label: "Anatomía: Teoría & Plexo Braquial", icon: BookOpen, val: user.unitProgress["anatomia_teoria"] || 0 },
    { id: "anatomia_visor-3d", label: "Anatomía: Visor 3D Cardíaco Three.js", icon: Layers, val: user.unitProgress["anatomia_visor-3d"] || 0 },
    { id: "bioquimica_metabolismo", label: "Bioquímica: Glucólisis & Regulación", icon: FlaskConical, val: user.unitProgress["bioquimica_metabolismo"] || 0 },
    { id: "histologia_tejidos", label: "Histología: Microscopía Glomerular", icon: Microscope, val: user.unitProgress["histologia_tejidos"] || 0 },
    { id: "microbiologia_patogenos", label: "Agentes Infecciosos: Catálogo de Patógenos", icon: Bug, val: user.unitProgress["microbiologia_patogenos"] || 0 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Encabezado del Perfil */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Expediente Académico del Alumno
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Gestión de perfil, vinculación universitaria, escalafón de 10 rangos y progreso de unidades.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/onboarding"
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 text-xs font-semibold transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Editar Universidad/Apodo</span>
          </Link>

          <button
            onClick={resetProgressToZero}
            title="Reiniciar progreso a cero (0 XP, 0 Racha, 0%) para pruebas"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/10 text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar a Cero</span>
          </button>

          {user.isLoggedIn ? (
            <button
              onClick={signOut}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar con Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Tarjeta de Información Personal y Nivel */}
      <GlassCard className="p-6 sm:p-8 border border-white/15">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-3xl object-cover border-2 border-purple-500/50 shadow-xl shadow-purple-950/50"
            />
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-slate-950 border border-white/15 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center justify-center sm:justify-start space-x-2">
                  <span>{user.nickname || user.name}</span>
                </h2>
                <p className="text-xs text-slate-400">{user.email}</p>
                
                {/* Universidad y Carrera vinculadas */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{user.university} ({user.universityShort})</span>
                  </span>

                  {user.career && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
                      <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{user.career}</span>
                    </span>
                  )}
                </div>
              </div>

              <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30 self-center sm:self-start">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Nivel {user.rankLevel || 1}: {user.level}</span>
              </span>
            </div>

            {/* Barra de progreso hacia el siguiente nivel */}
            <div className="pt-2">
              <ProgressBar
                value={user.xp}
                max={user.xpToNextLevel}
                label={`Progreso de Rango (${user.xp} / ${user.xpToNextLevel} XP)`}
                color="purple"
              />
            </div>
          </div>
        </div>

        {/* Métricas clave */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-xs text-slate-400 flex items-center space-x-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Racha Activa</span>
            </span>
            <p className="text-xl font-bold text-orange-300 mt-1">{user.streakDays} Días</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-xs text-slate-400 flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>Experiencia XP</span>
            </span>
            <p className="text-xl font-bold text-purple-300 mt-1">{user.xp} XP</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-xs text-slate-400 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Estado Auth</span>
            </span>
            <p className="text-xs font-semibold text-emerald-300 mt-1 truncate">
              {isConfigured ? "Supabase OAuth" : "Perfil Listo"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-xs text-slate-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Unidades Disponibles</span>
            </span>
            <p className="text-xl font-bold text-cyan-300 mt-1">
              {activeAvailableCount} / {enabledUnitsCount}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Progreso Detallado por Unidad */}
      <GlassCard className="p-6 sm:p-8 border border-white/15 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Progreso Registrado en Base de Datos por Unidad</span>
          </h3>
          <span className="text-xs text-slate-400">
            {enabledUnitsCount} unidades activas para evaluación
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {units.map((unit) => {
            const Icon = unit.icon;
            const isEnabled = isUnitEnabled(unit.id);

            return (
              <div 
                key={unit.id} 
                className={`p-4 rounded-2xl border space-y-3 transition-colors ${
                  isEnabled 
                    ? "bg-slate-950/60 border-white/10" 
                    : "bg-slate-950/30 border-white/5 opacity-70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isEnabled ? "text-purple-400" : "text-slate-500"}`} />
                    <span className="text-xs font-bold text-white truncate">{unit.label}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 pl-2">
                    {!isEnabled && (
                      <span className="inline-flex items-center space-x-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Próx.</span>
                      </span>
                    )}
                    <span className={`text-xs font-bold ${isEnabled ? "text-purple-300" : "text-slate-400"}`}>
                      {unit.val}%
                    </span>
                  </div>
                </div>

                <ProgressBar value={unit.val} showPercent={false} color={isEnabled ? "purple" : "slate"} />
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Árbol de Jerarquía de los 10 Rangos Universales de Ciencias de la Salud */}
      <GlassCard className="p-6 sm:p-8 border border-white/15 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Escalafón Universal de Ciencias de la Salud (10 Niveles)</span>
          </h3>
          <span className="text-xs text-slate-400">Desde Ciencias Básicas hasta Maestría</span>
        </div>

        <div className="space-y-2.5">
          {HEALTH_RANKS.map((r) => {
            const isCurrent = user.level === r.name;
            const isAchieved = user.xp >= r.maxXp;

            return (
              <div
                key={r.name}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  isCurrent 
                    ? "bg-purple-950/60 border-purple-500 shadow-lg shadow-purple-950/50 ring-1 ring-purple-400/40" 
                    : isAchieved 
                    ? "bg-slate-900/40 border-emerald-500/30 text-slate-300" 
                    : "bg-slate-950/40 border-white/5 text-slate-500"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCurrent 
                      ? "bg-purple-500 text-white shadow-md shadow-purple-900/40" 
                      : isAchieved 
                      ? "bg-emerald-500/20 text-emerald-400" 
                      : "bg-white/5 text-slate-500"
                  }`}>
                    {r.level}
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-xs sm:text-sm font-bold truncate ${isCurrent ? "text-purple-200" : "text-white"}`}>
                      Nivel {r.level}: {r.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">{r.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span className="text-xs font-mono text-purple-300 font-bold block">{r.minXp} - {r.maxXp} XP</span>
                  {isCurrent && <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Rango Actual</span>}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

    </div>
  );
}