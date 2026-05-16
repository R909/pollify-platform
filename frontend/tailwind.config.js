/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: '#0f0c08', card: '#1e160a', cardLight: '#2a1e0e', border: '#3d2d14',
      },
      fontFamily: { serif: ['Georgia','Cambria','serif'] },
    },
  },
  plugins: [],
}
