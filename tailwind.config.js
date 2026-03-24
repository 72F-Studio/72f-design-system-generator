/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#006FEE",
        success: "#17c964",
        warning: "#f5a524",
        danger: "#f31260",
        background: "#000000",
        surface: "#09090b",
        "surface-muted": "#18181b",
        "surface-elevated": "#27272a",
        border: "#27272a",
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '18px',
        '3xl': '24px',
      }
    },
  },
  darkMode: "class",
  plugins: [],
};
