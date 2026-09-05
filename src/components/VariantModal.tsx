'use client';

import React, { useState } from 'react';
import { X, ShoppingCart, Plus, Minus, CheckCircle2, AlertCircle } from 'lucide-react';

export interface VariantSelectionPayload {
  productCode: string;
  productName: string;
  cant: number;
  comments: string;
  pricing: {
    unitBasePrice: number;
    addonsTotal: number;
    unitFinalPrice: number;
  };
  totalPrice: number;
  variants: Array<{
    name: string;
    code: string;
    type: 'SINGLE' | 'MULTIPLE';
    items: Array<{
      title: string;
      code: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  }>;
  summaryText: string;
}

interface VariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (payload: VariantSelectionPayload) => void;
}

const SABORES_PAPA_CONO = [
  { code: 'SB1201', name: 'Fresa Tradicional', unitPrice: 0.775, icon: '🍓' },
  { code: 'SB1202', name: 'Chocolate Tradicional', unitPrice: 0.775, icon: '🍫' },
  { code: 'SB1203', name: 'Mantecado Tradicional', unitPrice: 0.775, icon: '🍦' },
];

const MINIMO_EXIGIDO = 12;
const MAXIMO_PERMITIDO = 500;
const PRECIO_UNITARIO = 0.775;

export default function VariantModal({
  isOpen,
  onClose,
  onAddToCart,
}: VariantModalProps) {
  const [cantidades, setCantidades] = useState<Record<string, number>>({
    SB1201: 4,
    SB1202: 4,
    SB1203: 4,
  });
  const [nota, setNota] = useState('');

  if (!isOpen) return null;

  const totalUnidades = Object.values(cantidades).reduce((acc, curr) => acc + curr, 0);
  const totalCalculado = totalUnidades * PRECIO_UNITARIO;
  const esValido = totalUnidades >= MINIMO_EXIGIDO;
  const faltanParaMinimo = Math.max(0, MINIMO_EXIGIDO - totalUnidades);

  const handleIncrement = (code: string) => {
    if (totalUnidades >= MAXIMO_PERMITIDO) return;
    setCantidades(prev => ({ ...prev, [code]: (prev[code] || 0) + 1 }));
  };

  const handleDecrement = (code: string) => {
    setCantidades(prev => ({
      ...prev,
      [code]: Math.max(0, (prev[code] || 0) - 1),
    }));
  };

  const handleAdd = () => {
    if (!esValido) {
      alert(`Debes seleccionar al menos ${MINIMO_EXIGIDO} unidades para armar este pedido.`);
      return;
    }

    const itemsSeleccionados = SABORES_PAPA_CONO
      .filter(s => cantidades[s.code] > 0)
      .map(s => ({
        title: s.name,
        code: s.code,
        quantity: cantidades[s.code],
        unitPrice: s.unitPrice,
        totalPrice: cantidades[s.code] * s.unitPrice,
      }));

    const specsTexto = itemsSeleccionados
      .map(i => `${i.title}: ${i.quantity}`)
      .join(', ');

    const payload: VariantSelectionPayload = {
      productCode: 'H001-004',
      productName: 'Papa Cono 12 Und Mínimo',
      cant: 1,
      comments: nota.trim(),
      pricing: {
        unitBasePrice: 0,
        addonsTotal: totalCalculado,
        unitFinalPrice: totalCalculado,
      },
      totalPrice: totalCalculado,
      variants: [
        {
          name: 'Selecciona tus Sabores',
          code: 'SB1200',
          type: 'MULTIPLE',
          items: itemsSeleccionados,
        },
      ],
      summaryText: `${specsTexto}${nota ? ` | Nota: ${nota}` : ''}`,
    };

    onAddToCart(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-[420px] h-[590px] overflow-hidden rounded-[28px] bg-white shadow-2xl border border-slate-100 flex flex-col justify-between">
        
        {/* Cabecera */}
        <div className="bg-[#fe6712] px-5 py-3 text-white flex items-center justify-between shrink-0">
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-orange-100 block">
              Arma tu pedido (Mínimo {MINIMO_EXIGIDO} und)
            </span>
            <h2 className="text-sm font-black tracking-tight leading-none mt-0.5">Papa Cono 12 Und Mínimo</h2>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="h-3.5 w-3.5 text-white" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="px-5 py-3 space-y-3 flex-1 overflow-y-auto">
          
          {/* Barra de Validación de Mínimo */}
          <div className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${
            esValido 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-orange-50/70 border-orange-200 text-orange-900'
          }`}>
            <span className="text-[10px] font-black flex items-center gap-1.5">
              {esValido ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-[#fe6712]" />
              )}
              {esValido ? '¡Mínimo alcanzado! Puedes sumar más unidades' : `Faltan ${faltanParaMinimo} conos para el mínimo:`}
            </span>
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
              esValido ? 'bg-emerald-200 text-emerald-900' : 'bg-orange-200 text-orange-950'
            }`}>
              {totalUnidades} / mín. {MINIMO_EXIGIDO}
            </span>
          </div>

          {/* Lista de Sabores */}
          <div className="space-y-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
              Selecciona tus sabores ($0.775 c/u)
            </span>

            {SABORES_PAPA_CONO.map((sabor) => {
              const val = cantidades[sabor.code] || 0;
              return (
                <div key={sabor.code} className="flex items-center justify-between p-2.5 rounded-2xl border border-slate-100 bg-slate-50/70">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 shrink-0 text-base shadow-2xs">
                      {sabor.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">{sabor.name}</h4>
                      <p className="text-[9px] font-bold text-slate-400">${sabor.unitPrice.toFixed(3)} c/u</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecrement(sabor.code)}
                      disabled={val === 0}
                      className="flex h-7 w-7 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-black text-slate-800">{val}</span>
                    <button
                      type="button"
                      onClick={() => handleIncrement(sabor.code)}
                      className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#fe6712] text-white hover:bg-[#e0580d] transition cursor-pointer shadow-2xs active:scale-95"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Instrucción o Nota Especial */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
              Instrucciones o nota especial
            </label>
            <input
              type="text"
              placeholder="Ej: Empacar separados por sabor..."
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#fe6712] focus:outline-none transition shadow-2xs"
            />
          </div>
        </div>

        {/* Footer Dinámico */}
        <div className="px-5 py-2.5 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 block leading-none">Total ({totalUnidades} conos)</span>
            <span className="text-base font-black text-slate-900">${totalCalculado.toFixed(2)} USD</span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!esValido}
            className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black text-white shadow-md transition active:scale-[0.98] ${
              esValido 
                ? 'bg-[#fe6712] hover:bg-[#e0580d] cursor-pointer shadow-orange-500/25' 
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>AGREGAR AL PEDIDO ({totalUnidades})</span>
          </button>
        </div>

      </div>
    </div>
  );
}