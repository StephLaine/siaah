/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#3b5998', // Exact blue from the image buttons
          700: '#2d4373',
          800: '#1d2a4a',
          900: '#0d162a',
        },
        siaahRed: '#C1272D', // Correct logo red
      },
    },
  },
  plugins: [],
}
