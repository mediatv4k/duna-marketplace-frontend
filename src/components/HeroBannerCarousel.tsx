'use client';

import React from 'react';

// Cintillo promocional del Home (2026-09-22, reescrito): pasó de un slider a pantalla completa con dots a una
// cinta delgada en movimiento continuo (marquee) — misma idea de "carrusel sin librería" que antes, pero ahora
// con CSS puro (`animation: marquee`, definida en tailwind.config.js) en vez de JS + estado, porque el movimiento
// es perpetuo y no hay "diapositiva activa" que trackear. El track dibuja las diapositivas dos veces seguidas y
// se desliza -50% de su ancho: al llegar ahí el segundo tramo es idéntico al primero, así que el bucle no se nota.
// Se pausa al pasar el mouse (`group-hover:[animation-play-state:paused]`) para poder leer/hacer clic con calma.
export interface HeroBannerSlide {
  image: string;
  alt: string;
  href?: string; // enlace externo (se abre en pestaña nueva)
  onClick?: () => void; // acción interna (p. ej. scroll suave); nunca junto a `href`
}

interface HeroBannerCarouselProps {
  slides: HeroBannerSlide[];
  durationSec?: number; // segundos que tarda una vuelta completa del cintillo
}

export default function HeroBannerCarousel({ slides, durationSec = 26 }: HeroBannerCarouselProps) {
  if (slides.length === 0) return null;
  const track = [...slides, ...slides]; // duplicado: es lo que hace que el loop no tenga costura

  return (
    <div className="group relative w-full h-24 max-h-28 overflow-hidden rounded-2xl bg-slate-900">
      <div
        className="flex h-full items-center gap-3 w-max animate-marquee group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${durationSec}s` }}
      >
        {track.map((slide, i) => {
          const img = (
            <img src={slide.image} alt={slide.alt} className="h-full w-auto object-contain" draggable={false} />
          );
          return slide.href ? (
            <a
              key={i}
              href={slide.href}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 block h-full py-1.5"
              aria-hidden={i >= slides.length}
              tabIndex={i >= slides.length ? -1 : 0}
            >
              {img}
            </a>
          ) : (
            <button
              key={i}
              type="button"
              onClick={slide.onClick}
              className="shrink-0 block h-full py-1.5 cursor-pointer"
              aria-hidden={i >= slides.length}
              tabIndex={i >= slides.length ? -1 : 0}
            >
              {img}
            </button>
          );
        })}
      </div>
    </div>
  );
}
