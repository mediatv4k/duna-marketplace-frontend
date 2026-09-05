'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface HeaderProps {
  cartCount?: number;
  cartTotal?: number;
  onOpenCart?: () => void;
}

export default function Header({
  cartCount = 0,
  cartTotal = 0,
  onOpenCart,
}: HeaderProps) {
  const totalFormateado = Number(cartTotal || 0).toFixed(2);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-100 shadow-2xs">
      <div className="mx-auto max-w-4xl px-4 py-2.5 flex items-center justify-between">
        
        {/* Identidad de Marca */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fe6712] text-white font-black text-sm shadow-md shadow-orange-500/20">
            D&apos;
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none">
              TIENDA MAESTRA
            </h1>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">
              MOTOR D&apos;UNA MARKETPLACE
            </p>
          </div>
        </div>

        {/* Botón Carrito en Header */}
        <button
          type="button"
          onClick={onOpenCart}
          className="flex items-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 shadow-xs transition active:scale-95 cursor-pointer"
        >
          <div className="relative">
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#fe6712] text-[9px] font-black text-white">
                {cartCount}
              </span>
            )}
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[8px] font-bold text-slate-400 uppercase">
              {cartCount} {cartCount === 1 ? 'art' : 'arts'}
            </span>
            <span className="text-xs font-black text-white">
              ${totalFormateado}
            </span>
          </div>
        </button>

      </div>
    </header>
  );
}