/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brutal: {
          dark: '#1E1B18',
          yellow: '#FFD23F',
          pink: '#FF758F',
          blue: '#80DED9',
          mint: '#06D6A0',
          purple: '#B5A6C9',
          coral: '#FF5964',
          cream: '#FAF6EE',
          'cream-light': '#FFFDF8',
        }
      },
      fontFamily: {
        archivo: ['"Archivo Black"', 'sans-serif'],
        grotesk: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px #1E1B18',
        'brutal-sm': '2px 2px 0px #1E1B18',
        'brutal-lg': '6px 6px 0px #1E1B18',
        'brutal-active': '0px 0px 0px #1E1B18',
      }
    },
  },
  plugins: [],
}
