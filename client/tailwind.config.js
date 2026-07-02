/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,ts,js,jsx}", "./public/index.html"],
  darkMode : "class", 
  theme: {
    extend: {
      colors: {
        "main-color": "#0d1117",
        "main-color-1": "#1b1b1c",
        "main-color-2": "#353638",
        "main-color-3": "#454648",

        "second-color": "#2c2c2e",
        
        "second-color-1": "#363738",
        "second-color-2": "#43454a",
        "seocnd-color-3":"#abb0b6",
        "second-light-mode" : "#f9fafb",
        
        "scroll-color": "#3c3c3d",
        "select-color" : "#404247",

        "select-light-mode" : "#e6e8ea",
        "select-side-light-mode" : "#e4edfd",
        "select-side-light-mode-2" : "#3964fe",
        "black-rgba" : "rgba(13, 17, 23, .95)"
      },
      
      // TODO : fix the animation
      keyframes: {
        typing: {
          "0%": { height: "0px"},
          "100%": { height: "100%"},
        },
      },

      animation: {
        typing: "typing 2s ease-out forwards",
      },
    },
  },
  plugins: [],
};
