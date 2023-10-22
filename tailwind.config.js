/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './docs/**/*.md'],
  theme: {
    extend: {
      colors: {
        'brand-dark': 'rgb(var(--color-brand-dark) / <alpha-value>)',
        'brand-light': 'rgb(var(--color-brand-light) / <alpha-value>)'
      },
      gridTemplateColumns: {
        'start-page': 'minmax(auto, 10vw) auto minmax(auto, 10vw)',
        start: '1fr 1fr 350px'
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%'
          }
        }
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
