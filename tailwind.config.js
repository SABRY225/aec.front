/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      textDirection: {
        ltr: 'ltr',
      },
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          500: '#004C97',
          600: '#003d7a',
          700: '#002e5c',
        },
        secondary: {
          red: '#E60000',
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#E60000',
          600: '#cc0000',
          700: '#990000',
        }
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'Segoe UI', 'Tahoma', 'sans-serif'],
        sans: ['Inter', 'Cairo', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
}