'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface PromotionsCarouselProps {
  promotions: any[];
  onSelectPromotion: (promo: any) => void;
}

export default function PromotionsCarousel({ promotions, onSelectPromotion }: PromotionsCarouselProps) {
  if (!promotions || promotions.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
        <Sparkles className="w-4 h-4 text-[#fe6712]" /> Promociones Imperdibles
      </h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
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
