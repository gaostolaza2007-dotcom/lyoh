import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        medblue: {
          50: "#eef2ff",
          100: "#e0e7ff",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          900: "#0b0f19",
          950: "#060913",
        },
        medpurple: {
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          900: "#1e1035",
          950: "#120724",
        },
        medcyan: {
          400: "#22d3ee",
          500: "#06b6d4",
        },
      },
      backgroundImage: {
        "mesh-gradient": "linear-gradient(135deg, #060913 0%, #0c122c 40%, #170d2b 100%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 15px rgba(168, 85, 247, 0.4)" },
          "100%": { boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        }
      }
    },
  },
  plugins: [],
};
export default config;