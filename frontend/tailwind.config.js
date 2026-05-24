/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#111022',
        primary: '#7C3AED',
        primaryHover: '#6D28D9',
        muted: '#B4B7C0',
        lash: {
          900: '#111022',
          800: '#1A1A28',
          700: '#222232',
          600: '#2A2A3C',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'], 
      }
    },
  },
  plugins: [],
}
