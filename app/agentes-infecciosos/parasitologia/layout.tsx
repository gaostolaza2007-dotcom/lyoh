import React from "react";
import { ParasitologyNav } from "@/components/modules/parasitologia/ParasitologyNav";

export const metadata = {
  title: "Parasitología Médica | MedStudy",
  description: "Estudio integral de parásitos de relevancia médica: atlas taxonómico, morfología 3D, microscopía virtual, comparador diferencial, ciclos biológicos, mapas epidemiológicos y autoevaluación clínica.",
};

export default function ParasitologyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <ParasitologyNav />
      {children}
    </div>
  );
}
