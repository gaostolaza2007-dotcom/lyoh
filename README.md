# MedStudy - Plataforma Web de Aprendizaje Médico Interactivo

MedStudy es una aplicación web médica responsiva de alto rendimiento desarrollada con **Next.js**, **React**, **Tailwind CSS** y **Three.js**.

---

## Características Principales

1. **Backend y Autenticación (Google OAuth & Supabase):**
   - Integración con `@supabase/supabase-js` y `@supabase/ssr`.
   - Soporte para autenticación Google OAuth.
   - Script SQL (`supabase/schema.sql`) para crear las tablas `profiles` y `unit_progress` con Row Level Security (RLS) y triggers automáticos.
   - Sistema de gamificación con niveles (*Dr. Estudiante Niv. 1*, *Dr. Estudiante Niv. 2*, *Dr. Interno Niv. 3*, *Dr. Residente Niv. 4*, *Dr. Especialista Niv. 5*), racha activa de días (🔥) y puntos de experiencia (XP).
   - **Modo Demo Interactivo:** Permite explorar y probar todas las funciones, guardar progreso local y simular inicio de sesión sin necesidad obligatoria de configurar claves inmediatas.

2. **Diseño Visual & Navegación Glassmorphism:**
   - Paleta en modo oscuro con degradados en azul profundo y morado (`#060913`, `#0c122c`, `#170d2b`).
   - Efecto Glassmorphism en tarjetas, modales y barras de navegación (`backdrop-blur-xl`, `border-white/10`).
   - Barra de navegación superior con medidor de racha y rango médico.
   - Menú lateral (Sidebar) colapsable en escritorio.
   - Menú de navegación inferior ergonómico para pantallas táctiles de teléfonos móviles.

3. **Módulos Clínicos:**
   - **Anatomía Humana:**
     - `/anatomia/flashcards`: Flashcards con diagramas anatómicos, 4 botones de selección múltiple, validación instantánea con resplandor verde/rojo, confeti y perlas de examen.
     - `/anatomia/teoria`: Vista de lectura limpia y tipografía optimizada con correlaciones clínicas (p. ej., parálisis de Erb-Duchenne vs Klumpke).
     - `/anatomia/visor-3d`: Visor tridimensional con **Three.js**. Órgano cardíaco anatómico con pulsación sistólica en tiempo real (BPM regulable), controles táctiles para rotar y hacer zoom (pinch-to-zoom), modo wireframe y selector de cámaras.
   - **Bioquímica Médica:**
     - `/bioquimica`: Lienzo interactivo de drag-and-drop con soporte para eventos táctiles y ratón. Reconstruye la cascada de la glucólisis (Hexocinasa, PFK-1, Glucosa, Piruvato) con cálculo de $\Delta G$ y panel lateral colapsable con cinéticas enzimáticas.
   - **Histología Tisular:**
     - `/histologia`: Microscopio virtual con micrografías de alta resolución (Glomérulo renal H&E). Permite hacer clic para ubicar marcadores (pines) y abre modales explicativos inmediatos con criterios tintoriales y patología diagnóstica.
   - **Microbiología Clínica:**
     - `/microbiologia`: Catálogo con filtros superiores por categoría (*Todos*, *Bacterias*, *Virus*, *Hongos*, *Parásitos*), buscador dinámico y tarjetas expandibles con factores de virulencia, cuadro clínico y pautas terapéuticas.

---

## Cómo Ejecutar el Proyecto

Desde la terminal en el directorio del proyecto:

```bash
cd "C:\Users\gaost\.gemini\antigravity\scratch\medstudy"
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

Para probarlo en tu teléfono móvil en la misma red Wi-Fi:
```bash
npm run dev -- -H 0.0.0.0
```
Y accede a `http://<IP-DE-TU-PC>:3000` desde el navegador de tu celular.

---

## Configurar Supabase en Producción (Opcional)

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Ve al SQL Editor de Supabase y ejecuta el contenido de `supabase/schema.sql`.
3. Activa el proveedor de Google en Authentication > Providers con tus credenciales de Google Cloud Console.
4. Crea un archivo `.env.local` en la raíz del proyecto basándote en `.env.local.example`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon
   ```