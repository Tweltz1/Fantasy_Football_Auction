/** @type {import('tailwindcss').Config} */
module.exports = {
  // IMPORTANT: Ensure this 'content' array includes all your source files.
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // This line is crucial for React apps
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Ensure 'Inter' font is extended if used
      },
    },
  },
  plugins: [],
}

