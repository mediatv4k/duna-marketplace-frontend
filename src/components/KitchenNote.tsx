'use client';

import React, { useState } from 'react';

export const KITCHEN_NOTE_MAX = 70;

// Los paréntesis se cambian por corchetes: el Recibo (OrderTrackingModal) detecta extras con el patrón "(+X.XX)" en
// cada línea del desglose, y una nota como "poca salsa (+2)" se leería como un cobro adicional inexistente.
export const cleanKitchenNote = (raw: string) =>
  String(raw || '').replace(/[()]/g, (c) => (c === '(' ? '[' : ']')).replace(/\s+/g, ' ').trim().slice(0, KITCHEN_NOTE_MAX);

// "SIN SALSA ROJA" / "salsa roja" -> "Sin salsa roja" (formato uniforme para monitor, comanda y `comments`)
export const formatSin = (e: string) => {
  const body = String(e || '').trim().replace(/^sin\s+/i, '');
  return body ? `Sin ${body.toLowerCase()}` : '';
};

interface KitchenNoteProps {
  value: string;
  onChange: (next: string) => void;
}

// Acordeón compacto de "nota o indicación especial", neutro y válido para cualquier comercio (restaurante, farmacia,
// bodegón, ferretería...): cerrado es un botón sutil de una línea; abierto, un campo de 2 líneas con tope de 70
// caracteres y contador (2 líneas para que el placeholder completo se lea también en móviles de 360 px). Se usa en la
// ranura del combo, en el producto simple y en la vista del invitado; el texto viaja en `comments` del ítem.
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
        📝 ¿Alguna nota o indicación especial? (Opcional)
      </button>
      {open && (
        <div className="relative">
          <textarea
            rows={2}
            value={value}
            maxLength={KITCHEN_NOTE_MAX}
            onChange={(e) => onChange(e.target.value.slice(0, KITCHEN_NOTE_MAX))}
            placeholder="Escribe aquí cualquier detalle, preferencia o indicación..."
            className="w-full resize-none text-xs leading-snug py-2 pl-3 pr-12 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#FE6712] transition"
          />
          <span className="absolute right-2 bottom-1.5 text-[10px] font-bold text-slate-400 tabular-nums pointer-events-none">
            {value.length}/{KITCHEN_NOTE_MAX}
          </span>
        </div>
      )}
    </div>
  );
}
