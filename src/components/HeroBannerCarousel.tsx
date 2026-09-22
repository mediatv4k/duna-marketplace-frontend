'use client';

import React, { useEffect, useRef, useState } from 'react';

// Carrusel promocional del Home (2026-09-22): slider nativo sin librería externa (mismo criterio que el autoplay
// de PromotionsCarousel — setInterval + transform, sin swiper/embla, para no sumar dependencia nueva). Rota sola
// cada `intervalMs` (4.5 s por defecto), con dots abajo y pausa al pasar el mouse/tocar. Cada diapositiva es un
// enlace externo (`href`, se abre en pestaña nueva) o una acción interna (`onClick`, p. ej. scroll suave); nunca
// ambos a la vez. Panorámico fijo `aspect-[3.2/1]` (relación real de los banners: 1280×400) con `object-cover`,
// así nunca se deforma ni desborda, en móvil o en escritorio.
export interface HeroBannerSlide {
  image: string;
  alt: string;
  href?: string;
  onClick?: () => void;
}

interface HeroBannerCarouselProps {
  slides: HeroBannerSlide[];
  intervalMs?: number;
}

export default function HeroBannerCarousel({ slides, intervalMs = 4500 }: HeroBannerCarouselProps) {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);
  const count = slides.length;

  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [count, intervalMs]);

  if (count === 0) return null;

  return (
    <div
      className="relative w-full aspect-[3.2/1] rounded-2xl overflow-hidden shadow-sm bg-slate-100"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      onTouchStart={() => { pausedRef.current = true; }}
      onTouchEnd={() => { pausedRef.current = false; }}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => {
          const img = <img src={slide.image} alt={slide.alt} className="w-full h-full object-cover" draggable={false} />;
          return (
            <div key={i} className="w-full h-full shrink-0">
              {slide.href ? (
                <a href={slide.href} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                  {img}
                </a>
              ) : (
                <button type="button" onClick={slide.onClick} className="block w-full h-full text-left cursor-pointer">
                  {img}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ir a la promoción ${i + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/80'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
