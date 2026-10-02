"use client";

import React from "react";

interface ProgressBarProps {
  value: number; // 0 a 100
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: "purple" | "blue" | "emerald" | "amber" | "slate";
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercent = true,
  color = "purple",
  className = "",
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const gradientColors: Record<NonNullable<ProgressBarProps["color"]>, string> = {
    purple: "from-purple-600 via-indigo-500 to-pink-500",
    blue: "from-blue-600 via-cyan-500 to-teal-400",
    emerald: "from-emerald-600 via-teal-500 to-green-400",
    amber: "from-amber-500 via-orange-500 to-red-500",
    slate: "from-slate-600 via-slate-500 to-slate-400",
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs font-medium mb-1.5 text-slate-300">
          <span>{label}</span>
          {showPercent && <span className="text-slate-400">{percentage}%</span>}
        </div>
      )}
      <div className="h-2 w-full bg-slate-950/60 rounded-full overflow-hidden border border-white/5 p-[1px]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradientColors[color]} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};