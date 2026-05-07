/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        school: {
          primary: '#1e40af', // Royal Blue
          secondary: '#fbbf24', // Amber/Gold
          accent: '#3b82f6',
          bg: '#f8fafc',
          dark: '#0f172a',
        }
      }
    },
  },
  plugins: [],
}
