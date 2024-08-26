/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      animation: {
        colorFlash: "colorFlash 3s linear infinite",
      },
      keyframes: {
        colorFlash: {
          "0%": { backgroundColor: "red" },
          "25%": { backgroundColor: "blue" },
          "50%": { backgroundColor: "red" },
          "85%": { backgroundColor: "blue" },
          "100%": { backgroundColor: "red" },
        },

      }
    },
  },
  plugins: [],
}

