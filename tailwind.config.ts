import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Legacy (kept for any untouched pages)
        navy:      '#0F0F1F',
        forest:    '#2E7D32',

        // Atelier Carnival palette
        ac: {
          parchment: '#F1E1BC',
          cream:     '#FBF3D9',
          ink:       '#2A1810',
          rasp:      '#C83A4E',
          pist:      '#6B8E3D',
          marigold:  '#E8A628',
          cherry:    '#8A1F2B',
          sky:       '#7FA8C9',
          grape:     '#6B3A78',
          tangerine: '#E26B2E',
        },
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        hand:  ['var(--font-caveat)',   'cursive'],
        mono:  ['var(--font-geist-mono)', 'Geist Mono', 'monospace'],
        sans:  ['var(--font-inter)',    'system-ui', 'sans-serif'],
      },
      animation: {
        'marquee':    'marquee 28s linear infinite',
        'spin-slow':  'spin 3s linear infinite',
        'fade-up':    'fadeUp 0.6s ease-out forwards',
        'float':      'float 2.8s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-2deg)' },
          '50%':      { transform: 'translateY(-14px) rotate(2deg)' },
        },
      },
      boxShadow: {
        'stamp':  '6px 6px 0 #2A1810',
        'stamp-gold': '6px 6px 0 #E8A628',
        'stamp-rasp': '5px 5px 0 #C83A4E',
      },
    },
  },
  plugins: [],
}

export default config
