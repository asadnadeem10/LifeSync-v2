/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // <--- This forces manual Dark Mode control, fixing the crash!
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: { extend: {} },
  plugins: [],
}