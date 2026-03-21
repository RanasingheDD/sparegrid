/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Manrope"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50: '#fff3ed',
          100: '#ffe4d5',
          200: '#ffc5a5',
          300: '#ff9b6b',
          400: '#ff7037',
          500: '#f2551f',
          600: '#db3e10',
          700: '#b72f0b',
          800: '#8f290f',
          900: '#732410',
        },
        trust: {
          50: '#f7f7fb',
          100: '#efeff5',
          200: '#dedfea',
          300: '#bfc2d1',
          400: '#9297aa',
          500: '#666d85',
          600: '#4b5268',
          700: '#34394b',
          800: '#1f2331',
          900: '#121521',
        },
        surface: {
          50: '#ffffff',
          100: '#fffaf6',
          200: '#f5efe8',
          300: '#eadfce',
          400: '#d4c0a2',
          500: '#b59671',
          600: '#8c6e4b',
          700: '#684f35',
          800: '#483826',
          900: '#2d2218',
        }
      },
    },
  },
  plugins: [],
}
