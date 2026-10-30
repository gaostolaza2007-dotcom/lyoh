"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { isModuleEnabled } from "@/lib/modules-config";
import { 
  Home, 
  Layers, 
  FlaskConical, 
  Microscope, 
  Bug, 
  UserCircle2, 
  Sparkles,
  Lock,
  Eye,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleNavClick = () => {
    // En celular, cerrar el drawer superpuesto al seleccionar una sección
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onClose?.();
    }
  };

  const navItems = [
    {
      moduleId: null,
      name: "Dashboard",
      href: "/",
      icon: Home,
      color: "text-blue-400",
      bgGlow: "group-hover:bg-blue-500/10",
      progress: null,
      isEnabled: true,
    },
    {
      moduleId: "microbiologia",
      name: "Agentes infecciosos",
      href: "/agentes-infecciosos",
      icon: Bug,
      color: "text-cyan-400",
      bgGlow: "group-hover:bg-cyan-500/10",
      progress: user.unitProgress["microbiologia_patogenos"] || 0,
      isEnabled: isModuleEnabled("microbiologia"),
    },
    {
      moduleId: "oftalmologia",
      name: "Oftalmología",
      href: "/oftalmologia",
      icon: Eye,
      color: "text-sky-400",
      bgGlow: "group-hover:bg-sky-500/10",
      progress: null,
      badge: "Prototipo",
      isEnabled: isModuleEnabled("oftalmologia"),
    },
    {
      moduleId: "anatomia",
      name: "Anatomía",
      href: "/anatomia",
      icon: Layers,
      color: "text-indigo-400",
      bgGlow: "group-hover:bg-indigo-500/10",
      progress: user.unitProgress["anatomia_flashcards"] || 0,
      isEnabled: isModuleEnabled("anatomia"),
    },
    {
      moduleId: "bioquimica",
      name: "Bioquímica",
      href: "/bioquimica",
      icon: FlaskConical,
      color: "text-purple-400",
      bgGlow: "group-hover:bg-purple-500/10",
      progress: user.unitProgress["bioquimica_metabolismo"] || 0,
      isEnabled: isModuleEnabled("bioquimica"),
    },
    {
      moduleId: "histologia",
      name: "Histología",
      href: "/histologia",
      icon: Microscope,
      color: "text-pink-400",
      bgGlow: "group-hover:bg-pink-500/10",
      progress: user.unitProgress["histologia_tejidos"] || 0,
      isEnabled: isModuleEnabled("histologia"),
    },
    {
      moduleId: null,
      name: "Mi Perfil",
      href: "/perfil",
      icon: UserCircle2,
      color: "text-amber-400",
      bgGlow: "group-hover:bg-amber-500/10",
      progress: null,
      isEnabled: true,
    },
  ];

  return (
    <aside
      id="main-sidebar"
      aria-label="Menú principal de navegación"
      aria-hidden={!isOpen}
      inert={!isOpen ? ("" as any) : undefined}
      className={`
        fixed left-0
        top-0 lg:top-16 bottom-0
        z-50 lg:z-30
        w-72 sm:w-64 max-w-[85vw] lg:w-64
        transition-all duration-300 ease-in-out
        glass-panel border-r border-white/10
        bg-slate-950/95 lg:bg-slate-950/80
        flex flex-col
        ${isOpen 
          ? "translate-x-0 visible opacity-100 pointer-events-auto shadow-2xl lg:shadow-none" 
          : "-translate-x-full invisible opacity-0 pointer-events-none"}
      `}
    >
      <div className="flex flex-col h-full py-5 px-3 justify-between overflow-y-auto">
        
        {/* Encabezado del Drawer para Celular (Cerrar & Marca) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 pb-3 border-b border-white/10 lg:hidden">
            <Link href="/" onClick={handleNavClick} className="flex items-center space-x-2">
              <Image
                src="/images/brand/lyoh-logo-dark.png"
                alt="LYOH"
                width={92}
                height={30}
                className="h-7 w-auto object-contain"
              />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="p-2 min-w-[44px] min-h-[44px] rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              aria-label="Cerrar menú"
              title="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Navegación */}
          <div className="space-y-1.5">
            <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Módulos Clínicos
            </div>

            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href)) ||
                (item.href === "/agentes-infecciosos" && pathname.startsWith("/microbiologia"));
              const Icon = item.icon;

              // Renderizado para módulos DESHABILITADOS ("Próximamente")
              if (!item.isEnabled) {
                return (
                  <div
                    key={item.name}
                    aria-disabled="true"
                    title={`${item.name} estará disponible próximamente`}
                    className="group flex items-center justify-between px-3.5 py-3 rounded-2xl opacity-45 cursor-not-allowed select-none border border-transparent bg-white/[0.02]"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="relative p-2 rounded-xl bg-slate-900/40 border border-white/5 text-slate-500">
                        <Icon className="w-4 h-4" />
                        <div className="absolute -top-1 -right-1 p-0.5 rounded-full bg-slate-900 border border-amber-500/40 text-amber-400">
                          <Lock className="w-2.5 h-2.5" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-xs text-slate-400 line-through decoration-slate-600/60 block truncate">
                          {item.name}
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center space-x-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Próximamente</span>
                    </span>
                  </div>
                );
              }

              // Renderizado para módulos HABILITADOS
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`
                    group flex items-center justify-between px-3.5 py-3 rounded-2xl
                    transition-all duration-200 min-h-[44px]
                    ${isActive 
                      ? "bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30 text-white shadow-lg shadow-purple-950/40 font-semibold" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"}
                  `}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`p-2 rounded-xl bg-slate-900/60 border border-white/5 ${item.color} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-xs truncate">
                      {item.name}
                    </span>
                  </div>

                  {item.badge ? (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                      {item.badge}
                    </span>
                  ) : item.progress !== null ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-slate-400 border border-white/5 font-mono">
                      {item.progress}%
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tarjeta de Nivel / Gamificación inferior */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="glass-card p-3 rounded-2xl bg-gradient-to-br from-indigo-950/30 to-purple-950/30 border border-purple-500/20">
            <div className="flex items-center space-x-2 text-xs font-semibold text-purple-300 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Rango en Salud</span>
            </div>
            <p className="text-xs font-bold text-slate-200 truncate">{user.level}</p>
            <p className="text-[10px] text-slate-400 mt-1">{user.xp} / {user.xpToNextLevel} XP para avanzar</p>
          </div>
        </div>

      </div>
    </aside>
  );
};
