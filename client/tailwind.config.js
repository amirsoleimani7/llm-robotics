/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,ts,js,jsx}","./public/index.html"],
  theme: {
    extend: {
      colors : {
        'main-color' : '#0d1117',
        'main-color-1' : '#1b1b1c',
        'main-color-2'  :'#353638',
        'main-color-3' : '#454648',
        
        'second-color' : '#2c2c2e',
        'second-color-1' : '#363738',
        'second-color-2' : '#43454a',
        
        'scroll-color' : '#3c3c3d'
      }
    },
  },
  plugins: [],
}

