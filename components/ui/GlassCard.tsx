"use client";

import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: "purple" | "blue" | "cyan" | "none";
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  glow = "none",
  interactive = false,
  ...props
}) => {
  const glowStyles = {
    purple: "hover:border-purple-500/40 hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]",
    blue: "hover:border-blue-500/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]",
    cyan: "hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]",
    none: "",
  };

  return (
    <div
      className={`
        backdrop-blur-xl bg-slate-900/40 border border-white/10 rounded-2xl
        shadow-[0_8px_30px_rgb(0,0,0,0.25)]
        transition-all duration-300
        ${interactive ? "cursor-pointer hover:bg-slate-850/60 active:scale-[0.99] touch-manipulation" : ""}
        ${glowStyles[glow]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};