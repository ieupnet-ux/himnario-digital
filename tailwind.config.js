/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // Azul oscuro - color principal
        navy: {
          50: '#eef2f9',
          100: '#d6e0ef',
          200: '#adc1df',
          300: '#7e9cc9',
          400: '#5478b0',
          500: '#385c97',
          600: '#2a477c',
          700: '#1f3661',
          800: '#162548',
          900: '#0d1730',
          950: '#070d1c'
        },
        // Dorado elegante - acento
        gold: {
          50: '#fdf9ec',
          100: '#faf0cb',
          200: '#f4e093',
          300: '#eccb5b',
          400: '#e5b832',
          500: '#d4a017',
          600: '#b27c12',
          700: '#8e5b14',
          800: '#754817',
          900: '#633c18',
          950: '#391f0a'
        },
        cream: '#FAF8F3',
        ink: '#0d1730'
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #f4e093 0%, #d4a017 50%, #b27c12 100%)',
        'navy-gradient': 'linear-gradient(135deg, #162548 0%, #0d1730 60%, #070d1c 100%)'
      },
      boxShadow: {
        gold: '0 4px 14px 0 rgba(212, 160, 23, 0.25)',
        card: '0 2px 10px 0 rgba(13, 23, 48, 0.08)',
        'card-hover': '0 8px 24px 0 rgba(13, 23, 48, 0.15)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};
