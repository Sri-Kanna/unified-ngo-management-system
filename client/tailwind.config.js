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
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d5e0ff',
          300: '#adc2ff',
          400: '#7599ff',
          500: '#3b66ff',
          600: '#2544eb',
          700: '#1b30d6',
          800: '#1a27ad',
          900: '#1b268a',
          950: '#111754',
        },
      },
    },
  },
  plugins: [],
}
