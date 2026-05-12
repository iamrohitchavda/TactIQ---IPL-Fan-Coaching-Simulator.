/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#050816',
          card: '#0B1120',
          elevated: '#111827',
          surface: '#0F1729',
        },
        accent: {
          green: '#00FF9D',
          cyan: '#00D9FF',
          orange: '#FF6B35',
          blue: '#0066FF',
          gold: '#FFD700',
          red: '#FF3B5C',
          purple: '#8B5CF6',
        },
        text: {
          primary: '#FFFFFF',
          muted: '#8899AA',
          dim: '#556677',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          light: 'rgba(255,255,255,0.1)',
          glow: 'rgba(0,255,157,0.3)',
        },
      },
      animation: {
        'spin-slow': 'spin 4s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'countdown-pulse': 'countdownPulse 1s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'breathing': 'breathing 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        countdownPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255,59,92,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(255,59,92,0.6)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        breathing: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      boxShadow: {
        'neon-green': '0 0 20px rgba(0,255,157,0.3), 0 0 40px rgba(0,255,157,0.1)',
        'neon-cyan': '0 0 20px rgba(0,217,255,0.3), 0 0 40px rgba(0,217,255,0.1)',
        'neon-red': '0 0 20px rgba(255,59,92,0.3), 0 0 40px rgba(255,59,92,0.1)',
        'glass': '0 8px 32px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}
