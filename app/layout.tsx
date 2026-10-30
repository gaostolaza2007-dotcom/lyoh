import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "LYOH - Plataforma de Aprendizaje Médico Interactivo",
  description: "Estudio médico de alto rendimiento con Anatomía 3D, Bioquímica interactiva, Histología con microscopía virtual y Microbiología clínica.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/brand/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/images/brand/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/images/brand/lyoh-emblem.png", type: "image/png" },
    ],
    apple: [
      { url: "/images/brand/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased">
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}