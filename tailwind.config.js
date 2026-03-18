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
          900: '#000000', // Pure black
          800: '#0A0A0A', // Almost black
          700: '#141414', // Very dark gray
          600: '#1F1F1F',
          500: '#2A2A2A',
          400: '#3D3D3D',
        },
        silver: {
          500: '#6B7280',
          400: '#9CA3AF',
          300: '#C0C0C0', // True silver
          200: '#E5E7EB',
          100: '#F3F4F6',
        },
        gold: {
          300: '#FCE68A',
          400: '#FDE047',
          500: '#D4AF37', // Pure gold
          600: '#B8860B', // Dark goldenrod
          700: '#996515', // Golden brown
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
