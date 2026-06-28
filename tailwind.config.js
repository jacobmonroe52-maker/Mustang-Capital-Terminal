/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          950: '#0E261C',
          900: '#14352A',
          800: '#1B4536',
          700: '#235541',
          600: '#2F6B52',
        },
        cream: {
          100: '#F3EEDF',
          200: '#E7DEC4',
          400: '#C9BD96',
        },
        brass: {
          500: '#B89B5E',
        },
        gain: '#4FB286',
        loss: '#C25A4A',
        ink: '#0E261C',
      },
      fontFamily: {
        cormorant: ['Cormorant Garamond', 'serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
