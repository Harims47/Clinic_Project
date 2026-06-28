/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(220, 20%, 97%)",
        surface: "hsl(0, 0%, 100%)",
        border: "hsl(214, 32%, 91%)",
        primary: {
          DEFAULT: "hsl(221, 83%, 45%)",
          hover: "hsl(221, 83%, 37%)"
        },
        secondary: "hsl(215, 16%, 47%)",
        success: "hsl(142, 76%, 36%)",
        warning: "hsl(38, 92%, 50%)",
        destructive: "hsl(354, 70%, 54%)",
        textMain: "hsl(222, 47%, 11%)",
        textSub: "hsl(215, 16%, 47%)"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
}
