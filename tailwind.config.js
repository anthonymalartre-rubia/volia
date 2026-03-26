/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'src/app/**/*.{js,ts,jsx,tsx,mdx}',
    'src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#09090b',
        'bg-card': '#111114',
        'bg-card-hover': '#16161a',
        'bg-input': '#0c0c0e',
        'border': '#1e1e24',
        'border-hover': '#2a2a35',
        'text-primary': '#fafafa',
        'text-secondary': '#a1a1aa',
        'text-muted': '#52525b',
        'accent': '#818cf8',
        'accent-dim': '#6366f1',
        'green': '#34d399',
        'green-dim': '#059669',
        'red': '#f87171',
        'amber': '#fbbf24',
        'purple': '#c084fc',
        'blue': '#60a5fa',
      },
    },
  },
  plugins: [],
};
