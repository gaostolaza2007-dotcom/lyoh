"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const isOnboarding = pathname === "/onboarding";
  const isAdmin = pathname.startsWith("/admin");

  // Redirigir al onboarding SOLO si el perfil ya cargó, no está en /onboarding o /admin y el perfil está incompleto
  useEffect(() => {
    if (!isLoading && !isOnboarding && !isAdmin && !user.onboardingCompleted) {
      router.push("/onboarding");
    }
  }, [isLoading, isOnboarding, isAdmin, user.onboardingCompleted, router]);

  // Si es una ruta administrativa, renderizar directamente su propio diseño sin shell de estudiante
  if (isAdmin) {
    return <>{children}</>;
  }

  // Si el perfil ya cargó y el onboarding no está completado, mostrar estado de transición mientras redirige
  if (!isLoading && !isOnboarding && !user.onboardingCompleted) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden text-slate-100">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px]" />
          <div className="absolute -bottom-40 left-1/3 w-[550px] h-[550px] bg-indigo-600/15 rounded-full blur-[130px]" />
        </div>
        <div className="relative z-10 flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Redirigiendo a configuración de perfil...</p>
        </div>
      </div>
    );
  }

  if (isOnboarding) {
    return (
      <div className="relative min-h-screen flex flex-col overflow-x-hidden text-slate-100 selection:bg-purple-500 selection:text-white">
        {/* Luces de ambiente de fondo con degradados azul profundo y morado */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px]" />
          <div className="absolute -bottom-40 left-1/3 w-[550px] h-[550px] bg-indigo-600/15 rounded-full blur-[130px]" />
        </div>

        <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 py-8 flex items-center justify-center">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* Luces de ambiente de fondo con degradados azul profundo y morado */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-[550px] h-[550px] bg-indigo-600/15 rounded-full blur-[130px]" />
      </div>

      {/* Barra de navegación superior */}
      <Navbar 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        isSidebarOpen={sidebarOpen} 
      />

      <div className="relative z-10 flex flex-1 w-full max-w-7xl mx-auto">
        {/* Sidebar para pantallas grandes y drawer móvil */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Backdrop para cerrar sidebar en móvil cuando esté abierta */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Contenedor principal de la vista activa */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 lg:ml-20 xl:ml-64 pb-24 lg:pb-12 transition-all duration-300">
          {children}
        </main>
      </div>

      {/* Navegación inferior ergonómica para celulares */}
      <MobileNav />
    </div>
  );
};