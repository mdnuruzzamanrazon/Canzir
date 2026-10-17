/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        walnut: {
          DEFAULT: '#4A2E20',
          50: '#F9F6F3',
          100: '#EFE7E2',
          200: '#DFCFC5',
          300: '#BFA493',
          400: '#8A5D44',
          500: '#5F3B29',
          600: '#4A2E20', // Deep Walnut Brown
          700: '#3D251A',
          800: '#2E1C13',
          900: '#1F130D',
        },
        sand: {
          DEFAULT: '#D8C0A0',
          50: '#FAF7F3',
          100: '#F5EEE4',
          200: '#EBDDCB',
          300: '#D8C0A0', // Warm Sand
          400: '#C4A57F',
          500: '#AA885E',
        },
        bamboo: {
          DEFAULT: '#C58B4B',
          50: '#FAF4EC',
          100: '#F4E7D6',
          200: '#E8CDAC',
          300: '#D9AF7D',
          400: '#C58B4B', // Natural Bamboo
          500: '#A97033',
          600: '#8A5622',
        },
        cream: {
          DEFAULT: '#FAF6EF', // Cream White
          50: '#FFFFFF',
          100: '#FDFBF7',
          200: '#FAF6EF',
          300: '#F4ECE0',
          400: '#EDE0CE',
        },
        charcoal: {
          DEFAULT: '#24211E', // Charcoal Black
          50: '#8A8580',
          100: '#524D48',
          200: '#3D3833',
          300: '#24211E',
          400: '#181614',
          500: '#0E0D0C',
        },
        olive: {
          DEFAULT: '#73795A', // Muted Olive Green
          50: '#F5F6F2',
          100: '#E6E8DE',
          200: '#C8CCB8',
          300: '#9EA486',
          400: '#73795A',
          500: '#565B42',
        },
        amberGlow: '#E59B3C',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        bengali: ['"Hind Siliguri"', '"Noto Sans Bengali"', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(197, 139, 75, 0.25)',
        'glow-md': '0 0 25px -5px rgba(197, 139, 75, 0.35)',
        'glow-lg': '0 0 45px -10px rgba(197, 139, 75, 0.45)',
        'soft': '0 10px 30px -10px rgba(36, 33, 30, 0.08)',
        'card': '0 4px 20px -2px rgba(74, 46, 32, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.9', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
