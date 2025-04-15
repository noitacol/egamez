/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        epicblue: '#0078f2',
        epicdark: '#121212',
        epicgray: '#2a2a2a',
      },
    },
  },
  plugins: [],
} 