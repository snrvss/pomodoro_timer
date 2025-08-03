module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        onPrimary: 'var(--color-on-primary)',
        surface: 'var(--color-surface)',
        onSurface: 'var(--color-on-surface)',
        background: 'var(--color-background)',
        onBackground: 'var(--color-on-background)',
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        xl: '1.5rem', // for rounded timer card
      },
    },
  },
  plugins: [require('daisyui')],
}
