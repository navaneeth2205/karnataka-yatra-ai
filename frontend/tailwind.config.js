/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        karnataka: {
          red: '#c91818',
          yellow: '#f8b102',
          gold: '#d97706',
          forest: '#14532d',
          sandstone: '#fef3c7',
          stone: '#78716c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
