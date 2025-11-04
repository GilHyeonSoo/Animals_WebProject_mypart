/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#007BFF',
        'primary-dark': '#007BFF',
      },
      maxWidth: {
        '8xl': '90rem', // 1440px
        '9xl': '100rem', // 1600px
      }
    },
  },
  plugins: [],
};