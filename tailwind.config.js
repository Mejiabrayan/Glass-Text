/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        avocado: {
          100: 'var(--color-avocado-100)',
          200: 'var(--color-avocado-200)',
          300: 'var(--color-avocado-300)',
          400: 'var(--color-avocado-400)',
          500: 'var(--color-avocado-500)',
          600: 'var(--color-avocado-600)',
        }
      },
      fontFamily: {
        display: ['var(--font-display)'],
      }
    }
  },
  plugins: [],
} 