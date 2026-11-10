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
        surfaceContainer: 'var(--color-surface-container)',
        outline: 'var(--color-outline)',
      },
      fontFamily: {
        sans: ['"Nunito"', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
