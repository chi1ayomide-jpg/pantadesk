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
        pd: {
          dark: '#080B11',
          card: '#0F141F',
          surface: '#151C2C',
          border: '#232D42',
          accent: '#00F0FF',
          accentHover: '#00D1DF',
          yes: '#10B981',
          no: '#EF4444',
          muted: '#8E9BAE',
          gold: '#F59E0B'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
