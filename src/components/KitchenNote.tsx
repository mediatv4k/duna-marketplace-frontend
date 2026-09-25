'use client';

import React, { useState } from 'react';

export const KITCHEN_NOTE_MAX = 70;

// Los paréntesis se cambian por corchetes: el Recibo (OrderTrackingModal) detecta extras con el patrón "(+X.XX)" en
// cada línea del desglose, y una nota como "poca salsa (+2)" se leería como un cobro adicional inexistente.
export const cleanKitchenNote = (raw: string) =>
  String(raw || '').replace(/[()]/g, (c) => (c === '(' ? '[' : ']')).replace(/\s+/g, ' ').trim().slice(0, KITCHEN_NOTE_MAX);

interface KitchenNoteProps {
  value: string;
  onChange: (next: string) => void;
}

// Acordeón ultra-compacto de "sugerencia para la cocina": cerrado es un botón sutil de una línea; abierto, un input de
// una sola línea con tope de 70 caracteres y contador. Solo se usa en la ranura del combo y en el producto simple.
export default function KitchenNote({ value, onChange }: KitchenNoteProps) {
  const [open, setOpen] = useState(value.length > 0);
  return (
    <div className="mt-1 mb-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="text-xs text-slate-500 hover:text-[#FE6712] font-medium flex items-center gap-1 mt-1 mb-2 cursor-pointer"
      >
        📝 ¿Alguna sugerencia para la cocina? (Opcional)
      </button>
      {open && (
        <div className="relative">
          <input
            type="text"
            value={value}
            maxLength={KITCHEN_NOTE_MAX}
            onChange={(e) => onChange(e.target.value.slice(0, KITCHEN_NOTE_MAX))}
            placeholder="Ej: Poca salsa roja, salsas aparte..."
            className="w-full h-9 text-xs pl-3 pr-14 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#FE6712] transition"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 tabular-nums">
            {value.length}/{KITCHEN_NOTE_MAX}
          </span>
        </div>
      )}
    </div>
  );
}
