/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8A1515', // SVIAS Academic Maroon
          50: '#fdf2f2',
          100: '#fde8e8',
          200: '#fbd5d5',
          300: '#f8b4b4',
          400: '#f05252',
          600: '#771010',
          700: '#5C0E0E',
          800: '#4A0B0B',
          900: '#2B0606',
        },
        accent: {
          DEFAULT: '#C5A059', // SVIAS Academic Gold
        },
        dark: {
          DEFAULT: '#2E2525',
          bg: '#FAF7F7',
          card: '#FFFFFF',
        }
      }
    },
  },
  plugins: [],
}
