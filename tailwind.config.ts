import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        deep: '#0a0b0f',
        surface: 'rgba(18,20,28,0.72)',
        'farm-bg': '#071a07',
        'farm-dark': '#0d1f0f',
        accent: '#7c6cf6',
        green: '#4caf50',
        gold: '#ffd54f',
        success: '#00d68f',
        danger: '#ff4757',
        warning: '#ffa502',
        'q-do': '#e53935',
        'q-schedule': '#1e88e5',
        'q-delegate': '#fb8c00',
        'q-eliminate': '#546e7a',
      },
      fontFamily: {
        arabic: ['Tajawal', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [forms],
} satisfies Config
