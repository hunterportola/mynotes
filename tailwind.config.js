// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'portola-gold': '#CEAD64',
        'portola-green': '#1E361E',
        'portola-dark-green': '#1B1B1B',
        'portola-cream': '#F0EDE9',
        'portola-bronze': '#7C5C1D',
        'portola-cotton': '#F9F8F6',
        'portola-grey': '#4B4B4B'
      },
      fontFamily: {
        'garamond': ['"adobe-garamond-pro"', 'serif'],
      }
    },
  },
  plugins: [],
}