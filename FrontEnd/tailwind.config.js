/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(220, 20%, 98%)",
        surface: "hsl(0, 0%, 100%)",
        border: "hsl(220, 15%, 90%)",
        primary: {
          DEFAULT: "hsl(217, 91%, 50%)",
          hover: "hsl(217, 91%, 42%)"
        },
        secondary: "hsl(215, 16%, 47%)",
        success: "hsl(142, 72%, 29%)",
        warning: "hsl(38, 92%, 50%)",
        destructive: "hsl(0, 84%, 60%)",
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
