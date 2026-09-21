/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange': '#fe6712',
        'brand-orange-light': '#fff5ed',
        'brand-navy': '#0b1f3a',
        'brand-navy-light': '#17386b',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};