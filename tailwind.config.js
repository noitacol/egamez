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
        epiclight: '#f5f5f5',
        epicaccent: '#bc13fe', // Epic'in mor aksan rengi
        epicgreen: '#2ecc71',
        epicorange: '#ff7700',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'epic': '0 10px 20px rgba(0, 120, 242, 0.1), 0 6px 6px rgba(0, 120, 242, 0.05)',
        'epic-hover': '0 14px 28px rgba(0, 120, 242, 0.15), 0 10px 10px rgba(0, 120, 242, 0.10)',
        'card-hover': '0 22px 40px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'epic-gradient': 'linear-gradient(145deg, #0078f2, #bc13fe)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
} 