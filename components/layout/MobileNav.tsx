"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isModuleEnabled } from "@/lib/modules-config";
import { 
  Home, 
  Layers, 
  FlaskConical, 
  Microscope, 
  Bug,
  Lock
} from "lucide-react";

export const MobileNav: React.FC = () => {
  const pathname = usePathname();

  const items = [
    { moduleId: null, name: "Inicio", href: "/", icon: Home, isEnabled: true },
    { moduleId: "anatomia", name: "Anatomía", href: "/anatomia", icon: Layers, isEnabled: isModuleEnabled("anatomia") },
    { moduleId: "bioquimica", name: "Bioquímica", href: "/bioquimica", icon: FlaskConical, isEnabled: isModuleEnabled("bioquimica") },
    { moduleId: "histologia", name: "Histología", href: "/histologia", icon: Microscope, isEnabled: isModuleEnabled("histologia") },
    { moduleId: "microbiologia", name: "Agentes", href: "/agentes-infecciosos", icon: Bug, isEnabled: isModuleEnabled("microbiologia") },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-2xl bg-slate-950/85 border-t border-white/10 px-2 py-1 shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href)) ||
            (item.href === "/agentes-infecciosos" && pathname.startsWith("/microbiologia"));
          const Icon = item.icon;

          if (!item.isEnabled) {
            return (
              <div
                key={item.name}
                aria-disabled="true"
                className="flex flex-col items-center justify-center py-2 px-2 rounded-xl min-w-[54px] opacity-40 cursor-not-allowed select-none"
              >
                <div className="relative p-1 rounded-lg text-slate-500">
                  <Icon className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 p-0.5 rounded-full bg-slate-900 border border-amber-500/40 text-amber-400">
                    <Lock className="w-2 h-2" />
                  </div>
                </div>
                <span className="text-[9px] mt-0.5 tracking-tight font-medium text-slate-500 truncate max-w-[50px]">
                  Próx.
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center justify-center py-2 px-3 rounded-xl min-w-[58px] touch-target
                transition-all duration-150 active:scale-95
                ${isActive ? "text-purple-400" : "text-slate-400 hover:text-slate-200"}
              `}
            >
              <div className={`p-1 rounded-lg ${isActive ? "bg-purple-500/20 shadow-sm" : ""}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight font-medium ${isActive ? "text-purple-300 font-semibold" : "text-slate-400"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};