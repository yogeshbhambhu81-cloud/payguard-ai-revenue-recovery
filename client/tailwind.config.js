/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          bg: '#0F172A',
          card: '#1E293B',
          border: '#334155',
          brand: '#3B82F6',
          brandDark: '#1D4ED8',
          accent: '#6366F1',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          subtext: '#94A3B8'
        }
      }
    },
  },
  plugins: [],
}
