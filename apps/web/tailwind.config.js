/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // <--- ¡ESTA ES LA CLAVE! (Antes faltaba 'src')
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}