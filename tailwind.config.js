/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
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
        gold: {
         100: "#f5ead0",
         400: "#d9bc66",
         600: "#a9853a",
         700: "#8a6c2e",
         900: "#4d3b17",
       },
        cream: "#fbfaf6",
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
  plugins: [require("@tailwindcss/typography")],
};