/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette inspirée du modèle HTML (or/beige + bleu marine)
        'gold': '#b7a56a',
        'gold-2': '#d7c89a',
        'navy': '#1b2a4a',
        'navy-2': '#24365c',
        'navy-light': '#24365c',
        'ink': '#111827',
        'muted': '#5b667a',
        'bg': '#f7f6f2',
        'card': '#ffffff',
        'line': '#e6e2d6',
        'line2': '#d8d1bf',
        'grid-strong': '#cbbf9c',
        'accent': '#b7a56a',
        'accent-light': '#d7c89a',
        // Couleurs des axes par défaut
        'axis-qualite': '#d9c890',
        'axis-relation': '#bcd7f2',
        'axis-rationalisation': '#c5e6d2',
        'axis-efficacite': '#f2c7c7',
      },
      boxShadow: {
        'card': '0 10px 24px rgba(27,42,74,.10)',
        'modal': '0 18px 40px rgba(27,42,74,.20)',
      },
      borderRadius: {
        'card': '14px',
      },
    },
  },
  plugins: [],
}

