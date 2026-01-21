/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional SQL Workspace Palette
        sql: {
          950: '#0a0e27',  // Very dark blue-black
          900: '#0f1629',  // Dark blue
          850: '#141d3a',  // Slightly lighter
          800: '#1a2847',  // Dark slate-blue
          700: '#2a3a5a',  // Medium slate-blue
          600: '#3a4a7a',  // Lighter slate-blue
          accent: '#00d9ff', // Cyan accent
          accent2: '#0ea5e9', // Sky blue
          accent3: '#06b6d4', // Teal
          success: '#10b981', // Emerald
          warning: '#f59e0b', // Amber
          error: '#ef4444', // Red
        }
      }
    },
  },
  plugins: [],
}