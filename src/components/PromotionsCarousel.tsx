'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/imageOptimizer';

interface PromotionsCarouselProps {
  promotions: any[];
  onSelectPromotion: (promo: any) => void;
  durationSec?: number; // segundos que tarda una vuelta completa del marquee
}

// Marquee continuo en contraflujo (2026-09-22): reemplaza el autoplay anterior (setInterval + scrollBy sobre un
// contenedor con scroll nativo) por la misma técnica de `HeroBannerCarousel` — track con las tarjetas duplicadas
// una vez seguidas + animación CSS pura (`animate-marquee-reverse`, definida en tailwind.config.js) — pero con el
// keyframe invertido, así el cintillo superior corre a la izquierda y esta franja corre a la derecha (cruce
// visual). Se pausa con `paused` (estado, no solo CSS) en vez de `group-hover:[animation-play-state:paused]`
// porque también debe detenerse al tocar en móvil (sin hover real), y así un tap-y-clic siempre encuentra la
// tarjeta inmóvil en el lugar donde se tocó.
export default function PromotionsCarousel({ promotions, onSelectPromotion, durationSec = 32 }: PromotionsCarouselProps) {
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  if (!promotions || promotions.length === 0) return null;

  const animate = !reducedMotion && promotions.length > 0;
  const track = animate ? [...promotions, ...promotions] : promotions;

  const renderCard = (promo: any, idx: number, duplicate: boolean) => {
    const amount = promo?.amount != null ? Number(promo.amount) : null;
    const image =
      promo.productImage ||
      promo.imageUrl ||
      promo.storeLogo ||
      'https://images.unsplash.com/photo-1560008511-11c63416e52d';

    return (
      <button
        key={`${promo.id ?? idx}-${duplicate ? 'dup' : 'orig'}`}
        type="button"
        onClick={() => onSelectPromotion(promo)}
        aria-hidden={duplicate}
        tabIndex={duplicate ? -1 : 0}
        className="shrink-0 w-28 md:w-32 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all overflow-hidden text-left cursor-pointer"
      >
        <div className="w-full aspect-[2/3] bg-slate-50">
          <img
            src={getOptimizedImageUrl(image, 'PROMOTION')}
            alt={promo.title || promo.productName || 'Promoción'}
            className="w-full h-full object-cover"
            draggable={false}
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
  };

  return (
    <div className="mt-6">
      <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
        <Sparkles className="w-4 h-4 text-[#fe6712]" /> Promociones Imperdibles
      </h2>
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        className={animate ? 'overflow-hidden pb-1' : 'flex gap-3 overflow-x-auto no-scrollbar pb-1'}
      >
        {animate ? (
          <div
            className="flex gap-3 w-max animate-marquee-reverse"
            style={{ animationDuration: `${durationSec}s`, animationPlayState: paused ? 'paused' : 'running' }}
          >
            {track.map((promo, idx) => renderCard(promo, idx, idx >= promotions.length))}
          </div>
        ) : (
          track.map((promo, idx) => renderCard(promo, idx, false))
        )}
      </div>
    </div>
  );
}
