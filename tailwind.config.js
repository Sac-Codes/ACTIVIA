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
        // ACTIVIA Specific Design Tokens
        activia: {
          dark: '#080D1C',        // Primary background
          surface: '#10172B',     // Secondary background
          elevated: '#161F36',    // Elevated surface
          border: '#233055',      // Card & panel borders
          blue: '#6C83FF',        // Primary accent
          purple: '#A78BFA',      // Secondary accent
          cyan: '#46D8F5',        // Cyan accent
          mint: '#43C99A',        // Success accent
          amber: '#F5B95B',       // Warning accent
          rose: '#FF7185',        // Error accent
          text: '#F4F6FF',        // Main text (dark mode)
          muted: '#A3AEC7',       // Secondary text (dark mode)
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
        navy: {
          800: '#111827',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(108, 131, 255, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(70, 216, 245, 0.4)',
        'glow-purple': '0 0 25px -5px rgba(167, 139, 250, 0.4)',
        'glow-mint': '0 0 25px -5px rgba(67, 201, 154, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
