/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
        },
        charcoal: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          500: '#64748b',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        tealAccent: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        pharmacy: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0284c7',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e3a8a',
          900: '#0f172a',
        },
        blueGradient: {
          start: '#2563EB',
          middle: '#4F46E5',
          end: '#1D4ED8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'soft-card': '0 4px 20px -2px rgba(37, 99, 235, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
        'soft-hover': '0 12px 30px -4px rgba(37, 99, 235, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.03)',
        'hero': '0 20px 40px -10px rgba(37, 99, 235, 0.15)',
        'blue-glow': '0 8px 25px -4px rgba(37, 99, 235, 0.3)',
      }
    },
  },
  plugins: [],
}
