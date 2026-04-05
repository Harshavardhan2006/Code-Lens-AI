/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        accent: 'var(--accent-color)',
        surface: 'var(--panel-surface)',
      },
      boxShadow: {
        glow: '0 0 20px var(--accent-glow)',
        'glow-sm': '0 0 10px var(--accent-glow)',
      },
      borderColor: {
        DEFAULT: 'var(--border-color)',
        active: 'var(--border-active)',
      },
    },
  },
  plugins: [],
}