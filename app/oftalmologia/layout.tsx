import React from "react";

export const metadata = {
  title: "Oftalmología | MedStudy",
  description:
    "Explora el sistema visual y conoce los instrumentos, imágenes y exámenes de la especialidad. Prototipo educativo de MedStudy.",
};

export default function OftalmologiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      {children}
    </div>
  );
}
