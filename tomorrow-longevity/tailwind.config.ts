/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          cream:   '#f0ebe3',
          dark:    '#1a1512',
          surface: '#e8e2d9',
          white:   '#faf7f3',
          accent:  '#8b4a2f',
          soft:    '#6b6055',
          border:  '#d4cdc4',
          gold:    '#c9a84c',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        body:  ['Heebo', 'sans-serif'],
      }
    }
  },
  plugins: []
}
