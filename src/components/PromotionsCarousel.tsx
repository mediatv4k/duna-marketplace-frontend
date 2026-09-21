'use client';

import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

interface PromotionsCarouselProps {
  promotions: any[];
  onSelectPromotion: (promo: any) => void;
}

const AUTOPLAY_MS = 4000;

export default function PromotionsCarousel({ promotions, onSelectPromotion }: PromotionsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const count = promotions?.length ?? 0;

  // Autoplay: cada 4 s avanza una tarjeta a la derecha (scroll suave); al llegar al final vuelve suavemente al inicio (bucle).
  // Solo corre si el contenido desborda, se pausa mientras el usuario lo toca o pasa el mouse, y se omite con "reducir movimiento".
  useEffect(() => {
    if (count < 2) return;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => {
      const el = scrollRef.current;
      if (!el || pausedRef.current) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      if (el.scrollLeft >= max - 2) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const firstCard = el.firstElementChild as HTMLElement | null;
        const step = firstCard ? firstCard.offsetWidth + 12 : el.clientWidth;
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count]);

  if (!promotions || promotions.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
        <Sparkles className="w-4 h-4 text-[#fe6712]" /> Promociones Imperdibles
      </h2>
      <div
        ref={scrollRef}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
        onTouchStart={() => { pausedRef.current = true; }}
        onTouchEnd={() => { pausedRef.current = false; }}
        className="flex gap-3 overflow-x-auto no-scrollbar pb-1"
      >
        {promotions.map((promo: any, idx: number) => {
          const amount = promo?.amount != null ? Number(promo.amount) : null;
          const image =
            promo.productImage ||
            promo.imageUrl ||
            promo.storeLogo ||
            'https://images.unsplash.com/photo-1560008511-11c63416e52d';

          return (
            <button
              key={promo.id ?? idx}
              type="button"
              onClick={() => onSelectPromotion(promo)}
              className="shrink-0 w-40 md:w-44 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all overflow-hidden text-left cursor-pointer"
            >
              <div className="w-full aspect-[2/3] bg-slate-50">
                <img
                  src={image}
                  alt={promo.title || promo.productName || 'Promoción'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2.5">
                <h3 className="text-xs font-black text-slate-900 line-clamp-2 leading-tight min-h-[2.2em]">
                  {promo.title || promo.productName || 'Promoción'}
                </h3>
                {amount != null && (
                  <span className="text-sm font-black text-[#fe6712] mt-1 block">
                    {promo.amountType === 'percent' ? `-${amount}%` : `$${amount.toFixed(2)}`}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
