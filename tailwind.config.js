/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'industrial': {
          900: '#0A1628',
          800: '#0F1F38',
          700: '#162A4A',
          600: '#1E3A5F',
          500: '#2A4A73',
        },
        'neon': {
          green: '#00C48C',
          orange: '#FF6B35',
          yellow: '#FFB020',
          red: '#FF4757',
          blue: '#00B3FF',
        }
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'mono': ['Roboto Mono', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 196, 140, 0.5)',
        'glow-orange': '0 0 20px rgba(255, 107, 53, 0.5)',
        'glow-red': '0 0 20px rgba(255, 71, 87, 0.5)',
        'glow-blue': '0 0 20px rgba(0, 179, 255, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
