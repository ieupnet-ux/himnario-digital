import type { Config } from "tailwindcss";

/**
 * Paleta del himnario:
 *  - navy   → azul oscuro institucional (fondos, encabezados)
 *  - marfil → blanco cálido (fondo de lectura)
 *  - oro    → dorado elegante (acentos, números de himno)
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef3f9",
          100: "#d8e3f0",
          300: "#7d9cc0",
          500: "#2e4e77",
          700: "#16304f",
          800: "#0f2440",
          900: "#0a1a30",
          950: "#061224",
        },
        oro: {
          300: "#e6cf8f",
          400: "#d9bc66",
          500: "#c9a44a",
          600: "#a9853a",
        },
        marfil: "#fbfaf6",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        body: ["'Source Sans 3'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(6,18,36,.06), 0 8px 24px -12px rgba(6,18,36,.18)",
      },
    },
  },
  plugins: [],
};
export default config;
