/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./views/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          900: '#111827', // Espaço profundo
          800: '#1F2937', // Espaço médio
          700: '#374151', // Espaço claro
          600: '#4B5563',
          500: '#6B7280',
          400: '#9CA3AF',
        },
        silver: {
          500: '#6B7280',
          400: '#9CA3AF',
          300: '#D1D5DB',
          200: '#E5E7EB',
          100: '#F3F4F6', // Prata mais brilhante
        },
        mint: {
          50: '#f2fcf5',
          100: '#e1f8e8',
          200: '#c2f0d4',
          300: '#92e3b5',
          400: '#5dd08f', // Light green base
          500: '#37b56d', // Accent
          600: '#259354',
          700: '#217545',
        }
      }
    },
  },
  plugins: [],
}
