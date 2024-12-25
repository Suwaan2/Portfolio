/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          700: '#1F2937',
          800: '#1A202C',
          900: '#1A1B26',
        },
      },
    },
  },
  plugins: [],
};