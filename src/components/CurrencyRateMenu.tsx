'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

// Indicador compacto de moneda y tasa de la cabecera del Home (2026-10-02). Agrupa en UN control discreto lo que antes eran dos piezas
// con peso visual propio: el selector de tres botones ($/Bs · USD · Bs, con el activo en naranja) y la píldora de la tasa BCV.
// El botón muestra la moneda elegida (y, donde hay espacio, la tasa en gris); al tocarlo se despliegan las tres opciones y la tasa.
// Solo presentación: el estado (`mode`) y la tasa REAL (`bcvRate`, de /api/bcv; null = no disponible) viven en quien lo monta.

export type CurrencyMode = 'DUAL' | 'USD' | 'VES';

const OPTIONS: { mode: CurrencyMode; short: string; label: string }[] = [
  { mode: 'DUAL', short: '$/Bs', label: 'Dólares y bolívares' },
  { mode: 'USD', short: 'USD', label: 'Solo dólares' },
  { mode: 'VES', short: 'Bs', label: 'Solo bolívares' },
];

interface CurrencyRateMenuProps {
  mode: CurrencyMode;
  onChange: (mode: CurrencyMode) => void;
  /** Tasa BCV viva; null = no disponible (no se inventa ninguna). */
  bcvRate: number | null;
  /** Hacia qué lado se abre el desplegable respecto del botón. */
  align?: 'left' | 'right';
  /** Clases (Tailwind) que deciden cuándo se ve la tasa dentro del botón; por defecto nunca (solo en el desplegable). */
  rateClassName?: string;
  className?: string;
}

export default function CurrencyRateMenu({ mode, onChange, bcvRate, align = 'right', rateClassName = 'hidden', className = '' }: CurrencyRateMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  // Cierra con clic/toque fuera y con Escape (mismo comportamiento que el menú de la cuenta)
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(true);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  const current = OPTIONS.find((o) => o.mode === mode) ?? OPTIONS[0];
  const rateText = bcvRate ? `Bs. ${bcvRate.toFixed(2)}` : null;

  return (
    <div ref={rootRef} className={`relative shrink-0 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        data-testid="currency-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Moneda de los precios: ${current.label}${rateText ? `. Tasa BCV ${rateText}` : ''}`}
        title="Moneda y tasa BCV"
        className={`flex h-8 items-center gap-1.5 rounded-full border bg-white px-2.5 text-[11px] font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 cursor-pointer ${open ? 'border-slate-300 text-slate-900' : 'border-slate-200'}`}
      >
        <span className={`${rateClassName} items-center gap-1.5 font-semibold text-slate-400`} data-testid="currency-trigger-rate">
          <span>BCV <span className="text-slate-600">{bcvRate ? bcvRate.toFixed(2) : '—'}</span></span>
          <span className="h-3 w-px bg-slate-200" aria-hidden="true" />
        </span>
        <span>{current.short}</span>
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Moneda de los precios"
          className={`absolute top-full z-50 mt-2 w-60 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150 ${align === 'left' ? 'left-0' : 'right-0'}`}
        >
          <p className="px-3 pb-1 pt-1.5 text-[10px] font-black uppercase tracking-wide text-slate-400">Mostrar precios en</p>
          {OPTIONS.map((o) => {
            const active = o.mode === mode;
            return (
              <button
                key={o.mode}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                data-mode={o.mode}
                onClick={() => { onChange(o.mode); close(true); }}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-bold transition hover:bg-slate-50 cursor-pointer ${active ? 'text-slate-900' : 'text-slate-600'}`}
              >
                <span className="w-9 shrink-0 text-[11px] font-black text-slate-400">{o.short}</span>
                <span className="flex-1">{o.label}</span>
                {active && <Check className="h-4 w-4 shrink-0 text-[#fe6712]" aria-hidden="true" />}
              </button>
            );
          })}
          <div data-testid="currency-rate" className="mt-1 flex items-center justify-between border-t border-slate-100 px-3 pb-1.5 pt-2 text-[11px] font-medium text-slate-500">
            <span>Tasa BCV</span>
            <strong className="font-black text-slate-800">{rateText ?? 'No disponible'}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
