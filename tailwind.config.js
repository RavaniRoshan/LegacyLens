/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./api/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx"
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000', // Pure Black
        surface: '#09090b', // Very dark zinc
        primary: '#22c55e', // Green 500
        'primary-hover': '#16a34a', // Green 600
        secondary: '#52525b', // Zinc 600
        accent: '#4ade80', // Green 400 (Neon)
      },
      fontFamily: {
        sans: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #22c55e',
        'brutal-white': '4px 4px 0px 0px #ffffff',
        'brutal-red': '4px 4px 0px 0px #ef4444',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 1s linear infinite',
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #18181b 1px, transparent 1px), linear-gradient(to bottom, #18181b 1px, transparent 1px)",
      }
    }
  },
  plugins: [],
}
