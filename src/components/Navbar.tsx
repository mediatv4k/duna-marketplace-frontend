'use client';

import React from 'react';

interface NavbarProps {
  activeCategory?: string;
  onSelectCategory?: (cat: string) => void;
  tasaBcv?: number | null;
}

export default function Navbar({
  activeCategory = 'TODOS',
  onSelectCategory,
  tasaBcv,
}: NavbarProps) {
  const categories = [
    { id: 'TODOS', label: '🔥 TODOS' },
    { id: 'HELADOS', label: 'HELADOS DE LITRO' },
    { id: 'PROMOS', label: 'PROMOCIONES' },
  ];

  // Sin tasa real (prop nula) no se muestra ningún valor inventado
  const tasaFormateada = Number(tasaBcv) > 0 ? Number(tasaBcv).toFixed(2) : 'no disponible';

  return (
    <nav className="w-full bg-white border-b border-slate-100 py-2.5 px-4 shadow-2xs sticky top-[57px] z-30">
      <div className="mx-auto max-w-4xl flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        
        {/* Categorías */}
        <div className="flex items-center gap-2">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory && onSelectCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'border-2 border-[#fe6712] text-[#fe6712] bg-orange-50/50'
                    : 'border border-orange-200/60 text-[#fe6712]/80 hover:bg-orange-50/30'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
          
          {/* Enlace D'una Delivery */}
          <a
            href={process.env.NEXT_PUBLIC_DELIVERY_LANDING_URL || "http://localhost:3001"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition whitespace-nowrap cursor-pointer border border-[#fe6712] text-[#fe6712] bg-[#fff5ed] hover:bg-orange-100 shrink-0 ml-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            D'una Delivery
          </a>
        </div>

        {/* Tasa BCV real (viene de /api/bcv); sin tasa muestra "no disponible" */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/80 shrink-0">
          <span>Tasa BCV:</span>
          <span className="text-slate-900 font-black">Bs. {tasaFormateada}</span>
        </div>

      </div>
    </nav>
  );
}