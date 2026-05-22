/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,ts,js,jsx}","./public/index.html"],
  theme: {
    extend: {
      colors : {
        'main-color' : '#0d1117',
        'second-color' : '#2c2c2e',
      }
    },
  },
  plugins: [],
}

