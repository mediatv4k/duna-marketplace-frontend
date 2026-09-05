'use client';

import React from 'react';

interface NavbarProps {
  activeCategory?: string;
  onSelectCategory?: (cat: string) => void;
  tasaBcv?: number;
}

export default function Navbar({
  activeCategory = 'TODOS',
  onSelectCategory,
  tasaBcv = 48.50,
}: NavbarProps) {
  const categories = [
    { id: 'TODOS', label: '🔥 TODOS' },
    { id: 'HELADOS', label: 'HELADOS DE LITRO' },
    { id: 'PROMOS', label: 'PROMOCIONES' },
  ];

  const tasaFormateada = Number(tasaBcv || 48.50).toFixed(2);

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
        </div>

        {/* Tasa BCV segura con valor de respaldo */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/80 shrink-0">
          <span>Tasa BCV:</span>
          <span className="text-slate-900 font-black">Bs. {tasaFormateada}</span>
        </div>

      </div>
    </nav>
  );
}