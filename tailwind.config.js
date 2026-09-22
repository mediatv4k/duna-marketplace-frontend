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
      // Cintillo continuo del hero (HeroBannerCarousel, 2026-09-22): el track dibuja los banners duplicados una vez
      // seguidos y se desliza la mitad de su ancho (-50%); al llegar ahí el segundo tramo es idéntico al primero,
      // así que el corte es invisible y el bucle se siente continuo.
      // `marquee-reverse` (PromotionsCarousel, 2026-09-22) es la misma técnica de duplicado, con el keyframe
      // invertido (-50% → 0): el track arranca ya desplazado y "avanza" hacia su posición natural, por lo que en
      // pantalla el contenido corre hacia la derecha — sentido opuesto al cintillo superior, mismo truco de bucle.
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        marquee: 'marquee 26s linear infinite',
        'marquee-reverse': 'marquee-reverse 32s linear infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};