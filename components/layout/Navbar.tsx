"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Flame, 
  Award, 
  Sparkles, 
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  Activity, 
  BrainCircuit, 
  ShieldCheck,
  ChevronDown,
  Building2,
  Settings
} from "lucide-react";

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, signInWithGoogle, signOut, isConfigured } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const displayName = user.nickname || user.name.split(" ")[0] || "Gabriel";

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/70 border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Lado Izquierdo: Brand y Toggle Mobile/Sidebar */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            aria-label="Alternar barra lateral"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  MedStudy
                </span>
                {user.universityShort && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    {user.universityShort}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Interactive Learning
              </span>
            </div>
          </Link>
        </div>

        {/* Centro / Stats de Gamificación: Nivel y Racha */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Contador de Racha */}
          <div 
            title="Días de racha de estudio consecutivos" 
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-amber-300 shadow-sm"
          >
            <Flame className="w-4 h-4 text-orange-400 animate-pulse fill-orange-400/30" />
            <span className="text-xs font-bold tracking-wide">{user.streakDays} Días</span>
          </div>

          {/* Medidor de Nivel & XP */}
          <Link
            href="/perfil"
            className="hidden sm:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-purple-500/30 hover:border-purple-400/60 transition-all group"
          >
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300">
              <Award className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-purple-200 group-hover:text-purple-100">
                {user.level}
              </span>
              <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                  style={{ width: `${Math.min(100, (user.xp / user.xpToNextLevel) * 100)}%` }}
                />
              </div>
            </div>
          </Link>

          {/* Botón de Autenticación / Menú de Usuario */}
          <div className="relative">
            {user.isLoggedIn ? (
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-full bg-slate-900/50 border border-white/10 hover:border-white/20 transition-colors"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-purple-400/40"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block mr-1" />
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Ingresar con Google</span>
                <span className="sm:hidden">Ingresar</span>
              </button>
            )}

            {/* Dropdown del perfil */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel p-3 shadow-2xl border border-white/15 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-white/10 mb-2">
                  <p className="text-sm font-semibold text-slate-200">{displayName}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  <p className="text-[11px] text-purple-300 mt-1 font-medium truncate flex items-center space-x-1">
                    <Building2 className="w-3 h-3" />
                    <span>{user.universityShort} • {user.career}</span>
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-purple-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{user.xp} XP totales</span>
                  </div>
                </div>
                <Link
                  href="/perfil"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="block px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Mi Perfil y Progreso
                </Link>
                <Link
                  href="/onboarding"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Configurar Universidad / Apodo</span>
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Modal de Autenticación Google */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-white/15 shadow-2xl relative">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 p-[1px] mb-3">
                <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                  <BrainCircuit className="w-7 h-7 text-purple-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-100">Acceso a MedStudy</h3>
              <p className="text-xs text-slate-400 mt-1">
                Sincroniza tus rachas, flashcards y progreso en la nube.
              </p>
            </div>

            <button
              onClick={async () => {
                await signInWithGoogle();
                setAuthModalOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 active:scale-[0.98] transition-all shadow-lg cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar con Google</span>
            </button>

            <div className="mt-4 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Conexión segura {isConfigured ? "vía Supabase OAuth" : "(Modo Demo Interactivo)"}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};