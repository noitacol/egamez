/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
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
        'fade-in-up': 'fade-in-up 0.8s ease-out',
        'fade-in-right': 'fade-in-right 0.8s ease-out',
        'fade-in': 'fade-in 1s ease-out',
        'zoom-in': 'zoom-in 7s ease',
        'slide-in-right': 'slide-in-right 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-right': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'zoom-in': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.1)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'epic-gradient': 'linear-gradient(145deg, #0078f2, #bc13fe)',
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [
    // @tailwindcss/line-clamp eklentisi Tailwind CSS v3.3'ten itibaren varsayılan olarak dahil edildiği için kaldırıldı
    // require('@tailwindcss/line-clamp'), // Bu satır kaldırıldı
  ],
} 