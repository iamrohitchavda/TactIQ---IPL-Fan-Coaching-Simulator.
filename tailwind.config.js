/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: '#040810',
          card: '#0D1520',
          elevated: '#152030',
        },
        accent: {
          green: '#00FF87',
          orange: '#FF6B00',
          blue: '#00C2FF',
          gold: '#FFD700',
          red: '#FF3B5C',
        },
        text: {
          primary: '#FFFFFF',
          muted: '#6B8CA8',
        },
      },
    },
  },
  plugins: [],
}
