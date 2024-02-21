const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  darkMode: 'class',
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
    },
  },
  plugins: [],
};
