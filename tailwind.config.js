// tailwind.config.js (全文をこれで上書き)

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundSize: {
        '300%': '300%',
      },
      animationDelay: {
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '700': '700ms',
      },
      fontFamily: {
        'impact': ['Impact', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 1s ease-out forwards',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'blob': 'blob 7s infinite',
        'gradient': 'gradient 3s ease infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)'
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)'
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)'
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)'
          },
        },
        gradient: {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        }
      }
    },
  },
  plugins: [
     function ({ addUtilities }) {
      const newUtilities = {
        '.animation-delay-100': { 'animation-delay': '100ms' },
        '.animation-delay-200': { 'animation-delay': '200ms' },
        '.animation-delay-300': { 'animation-delay': '300ms' },
        '.animation-delay-400': { 'animation-delay': '400ms' },
        '.animation-delay-500': { 'animation-delay': '500ms' },
        '.animation-delay-700': { 'animation-delay': '700ms' },
      }
      addUtilities(newUtilities)
    }
  ],
}