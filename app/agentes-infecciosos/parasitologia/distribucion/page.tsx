"use client";

import React from "react";
import { GeographicMap } from "@/components/modules/parasitologia/GeographicMap";
import { MapPin } from "lucide-react";

export default function DistribucionPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Distribución Geográfica & Vigilancia Epidemiológica
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-4xl">
          Monitoreo territorial interactivo centrado en Chile y América Latina. Explora el tipo de evidencia (vigilancia oficial, seroprevalencia en terreno, notificación obligatoria), determinantes sanitarios locales y limitaciones metodológicas de los datos epidemiológicos.
        </p>
      </div>

      <GeographicMap />
    </div>
  );
}
