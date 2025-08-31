/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        '3xl': '28px',
      },
      colors: {
        'primary': '#a0c9ff',
        'on-primary': '#003258',
        'primary-container': '#00497d',
        'on-primary-container': '#d2e4ff',
        'secondary': '#bac6db',
        'on-secondary': '#253140',
        'secondary-container': '#3b4858',
        'on-secondary-container': '#d6e2f7',
        'tertiary': '#d7bde2',
        'on-tertiary': '#3b2947',
        'tertiary-container': '#523f5f',
        'on-tertiary-container': '#f3d9ff',
        'error': '#ffb4ab',
        'on-error': '#690005',
        'error-container': '#93000a',
        'on-error-container': '#ffdad6',
        'background': '#1a1c1e',
        'on-background': '#e2e2e6',
        'surface': '#1a1c1e',
        'on-surface': '#e2e2e6',
        'surface-variant': '#42474e',
        'on-surface-variant': '#c2c7ce',
        'outline': '#8c9199',
        'outline-variant': '#42474e',
        'surface-dim': '#121416',
        'surface-bright': '#383a3c',
        'surface-container-lowest': '#0d0f11',
        'surface-container-low': '#1a1c1e',
        'surface-container': '#1e2022',
        'surface-container-high': '#282a2d',
        'surface-container-highest': '#333538',
      }
    }
  },
  plugins: [],
}
