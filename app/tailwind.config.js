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
        // ═══════════════════════════════════════════════════════════
        // TR/ACE Dark Mode — built on SIS slate scale
        // ═══════════════════════════════════════════════════════════
        'trace': {
          bg: '#0F172A',           // sis-gray-900
          surface: '#1E293B',      // sis-gray-800
          'surface-2': '#334155',  // sis-gray-700
          border: '#1E293B',       // sis-gray-800
          'border-light': '#334155', // sis-gray-700
          text: '#F8FAFC',         // sis-gray-50
          'text-muted': '#64748B', // sis-gray-500
          'text-secondary': '#94A3B8', // sis-gray-400
        },

        // ═══════════════════════════════════════════════════════════
        // SIS / Standard Authority
        // TWO reds, same family, different roles:
        // --sis             #E3000F  Authority red. ISO citations, legal refs.
        // --sis-pomegranate #F32735  Accent red. Buttons, headlines, primary actions.
        // ═══════════════════════════════════════════════════════════
        'sis': {
          DEFAULT: '#E3000F',
          dim: 'rgba(227, 0, 15, 0.09)',
          border: 'rgba(227, 0, 15, 0.25)',
        },
        'sis-pomegranate': '#F32735',
        'pomegranate': {
          DEFAULT: '#F32735',
          dim: 'rgba(243, 39, 53, 0.09)',
          border: 'rgba(243, 39, 53, 0.28)',
        },

        // Verified state — institutional clarity
        'verified': {
          DEFAULT: '#F1F5F9',      // sis-gray-100
          dot: '#F32735',          // pomegranate
          dim: 'rgba(241, 245, 249, 0.07)',
          border: 'rgba(241, 245, 249, 0.18)',
        },

        // Base
        'sis-white': '#FFFFFF',
        'sis-black': '#000000',

        // Gray scale — slate-toned (blue-cool undertone)
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
        // Cormorant — serif, rubriker
        display: ['Cormorant', 'Georgia', 'serif'],
        // DM Mono — monospace, etiketter
        mono: ['DM Mono', 'monospace'],
        // Instrument Sans — sans-serif, brödtext
        sans: ['Instrument Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        'eyebrow': ['10px', { letterSpacing: '0.25em', lineHeight: '1.5' }],
        'label': ['11px', { letterSpacing: '0.2em', lineHeight: '1.5' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
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
      },
    },
  },
  plugins: [],
}
