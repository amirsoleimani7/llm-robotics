/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,ts,js,jsx}","./public/index.html"],
  theme: {
    extend: {
      colors : {
        'main-color' : '#0d1117',
        'main-color-1' : '#1b1b1c',
        'second-color' : '#2c2c2e',
        
      }
    },
  },
  plugins: [],
}

