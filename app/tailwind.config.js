/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // TR/ACE Brand Identity - Direction A (Dark Technical)
        'trace': {
          void: '#080808',
          surface: '#111111',
          'surface-2': '#1A1A1A',
          border: '#272727',
          parchment: '#EFEFEA',
          muted: '#666666',
          gold: '#E8D48B',
          'gold-dim': 'rgba(232, 212, 139, 0.12)',
          verified: '#7EE8A2',
          error: '#E85050',
          warning: '#E8A450',
        },
        // SIS Standard Authority - red thread marking ISO/standard derivation
        // Gold = TR/ACE speaks. Red = SIS grants authority. Green = verified.
        'sis': {
          DEFAULT: '#E3000F',
          dim: 'rgba(227, 0, 15, 0.10)',
          border: 'rgba(227, 0, 15, 0.28)',
          thread: 'rgba(227, 0, 15, 0.6)',
        },
        // Legacy colors for backwards compatibility
        'sis-red': '#F32735',
        'sis-pomegranate': '#F32735',
        'sis-white': '#FFFFFF',
        'sis-black': '#000000',
        'sis-gray': {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        display: ['Cormorant', 'Georgia', 'serif'],
        mono: ['DM Mono', 'monospace'],
        sans: ['Instrument Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px var(--trace-verified)' },
          '50%': { boxShadow: '0 0 16px var(--trace-verified)' },
        },
      },
    },
  },
  plugins: [],
}


