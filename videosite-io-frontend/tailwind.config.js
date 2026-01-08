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
        gold: {
          100: '#F9F1D8',
          300: '#E5C985',
          400: '#D4AF37',
          500: '#C5A028',
          600: '#AA8C2C',
          900: '#5C4B13',
        },
        beige: {
          50: '#FAF9F6',
          100: '#F5F5DC',
          200: '#E8E4D9',
          900: '#1A1915',
        },
        void: '#050505',
        charcoal: '#0F0F0F',
      },
      fontFamily: {
        serif: ['Cinzel', 'serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      letterSpacing: {
        cinema: '0.2em',
        'widest-plus': '0.3em',
      },
      backgroundImage: {
        vignette: 'radial-gradient(circle, transparent 40%, #050505 140%)',
        glass: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        'gold-gradient': 'linear-gradient(135deg, #F9F1D8 0%, #D4AF37 100%)',
      },
    },
  },
  plugins: [],
}




