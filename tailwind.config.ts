import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:    '#1B1B2F',
        cream:   '#F5F0E8',
        parchment: '#EDE8DC',
        forest:  '#2E7D32',
        gold:    '#B8952A',
        coral:   '#E07A5F',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans:  ['var(--font-inter)',    'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'fade-up':   'fadeUp 0.6s ease-out forwards',
        'drip':      'drip 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drip: {
          '0%, 100%': { transform: 'translateY(0) scaleY(1)' },
          '50%':      { transform: 'translateY(8px) scaleY(1.1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
