const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        text: colors.slate,
        background: colors.slate,
        primary: colors.amber,
        secondary: colors.sky,
        success: colors.emerald,
        danger: colors.red,
        warning: colors.amber,
        info: colors.sky,
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        slideOut: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-100%)" },
        },
      },
      animation: {
        slideIn: "slideIn 0.5s ease-out forwards",
        slideOut: "slideOut 0.5s ease-in forwards",
      },
    },
  },
  plugins: [],
};
