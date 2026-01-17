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
        // Dark theme colors (Aether-inspired)
        dark: {
          bg: '#0a0a0f',
          surface: '#151520',
          surfaceHover: '#1a1a2e',
          border: '#252538',
          text: '#e4e4e7',
          textMuted: '#a1a1aa',
          primary: '#6366f1',
          primaryHover: '#818cf8',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}


