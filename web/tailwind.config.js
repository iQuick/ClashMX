/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        'content': '700px',
      },
      colors: {
        primary: '#3b82f6',
        'primary-dark': '#2563eb',
        danger: '#ff3b30',
      }
    },
  },
  plugins: [],
}