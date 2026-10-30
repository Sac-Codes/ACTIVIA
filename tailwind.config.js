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
        // Professional Clean White SaaS Palette
        app: {
          bg: '#FFFFFF',
          secondary: '#F7F9FC',
          card: '#FFFFFF',
          border: '#E5EAF1',
          'border-subtle': '#EEF2F6',
          text: '#172033',
          muted: '#64748B',
          subtle: '#94A3B8',
          brand: '#4F46E5',
          'brand-hover': '#4338CA',
          'brand-light': '#EEF2FF',
          accent: '#0EA5A4',
          'accent-light': '#F0FDFA',
          supporting: '#F59E0B',
          'supporting-light': '#FFFBEB',
          success: '#16A34A',
          'success-light': '#F0FDF4',
          warning: '#D97706',
          'warning-light': '#FFFBEB',
          error: '#DC2626',
          'error-light': '#FEF2F2',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        activia: {
          dark: '#080D1C',
          surface: '#10172B',
          elevated: '#161F36',
          border: '#233055',
          blue: '#4F46E5',
          purple: '#7C3AED',
          cyan: '#0EA5A4',
          mint: '#16A34A',
          amber: '#F59E0B',
          rose: '#DC2626',
          text: '#172033',
          muted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
