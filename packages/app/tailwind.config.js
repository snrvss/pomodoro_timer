module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        background: '#FFF8E7',
        surface: '#FDECC8',
        primary: '#7B3F00',
        onPrimary: '#FFFFFF',
        onSurface: '#3B2F2F',
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        xl: '1.5rem', // for rounded timer card
      },
    },
  },
  plugins: [],
}
