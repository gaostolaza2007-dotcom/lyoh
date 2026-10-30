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
  const isPrueba = pathname.startsWith("/pruebas");

  // En pantallas grandes (>= 1024px) el menú comienza visible por defecto; en móviles comienza cerrado
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSidebarOpen(window.innerWidth >= 1024);
    }
  }, []);

  // Bloquear desplazamiento del body en móvil cuando el drawer esté abierto y restaurarlo al cerrar
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (sidebarOpen && window.innerWidth < 1024) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [sidebarOpen]);

  // Cerrar el drawer móvil al navegar o cambiar de ruta
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  // Cerrar menú con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  // Manejar cambio de tamaño de ventana para restaurar scroll si pasa a desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        document.body.style.overflow = "";
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Redirigir al onboarding SOLO si el perfil ya cargó, no está en /onboarding, /admin o /pruebas y el perfil está incompleto
  useEffect(() => {
    if (!isLoading && !isOnboarding && !isAdmin && !isPrueba && !user.onboardingCompleted) {
      router.push("/onboarding");
    }
  }, [isLoading, isOnboarding, isAdmin, isPrueba, user.onboardingCompleted, router]);

  // Si es una ruta administrativa, renderizar directamente su propio diseño sin shell de estudiante
  if (isAdmin) {
    return <>{children}</>;
  }

  // Si el perfil ya cargó y el onboarding no está completado, mostrar estado de transición mientras redirige (salvo en pruebas)
  if (!isLoading && !isOnboarding && !isPrueba && !user.onboardingCompleted) {
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

      {/* Barra de navegación superior con botón accesible para mostrar/ocultar menú */}
      <Navbar 
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)} 
        isSidebarOpen={sidebarOpen} 
      />

      {/* Menú lateral (Sidebar fijo en desktop y Drawer superpuesto en celular) */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Fondo oscurecido para celular: tocarlo cierra el menú */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Contenedor del contenido principal:
          - En desktop (lg): si la barra está abierta, reserva lg:pl-64 sin superponer el menú; si está cerrada,
            elimina todo margen (lg:pl-0) para que el contenido se centre en todo el ancho disponible respetando max-w-7xl.
          - En celular: no desplaza el contenido fuera de la pantalla (pl-0).
      */}
      <div
        className={`relative z-10 flex-1 flex flex-col items-center w-full min-w-0 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "lg:pl-64" : "lg:pl-0"
        }`}
      >
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12 min-w-0">
          {children}
        </main>
      </div>

      {/* Navegación inferior ergonómica para celulares */}
      <MobileNav />
    </div>
  );
};
