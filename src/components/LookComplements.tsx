'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { getProduct } from '@/services/marketplaceService';
import { getOptimizedImageUrl } from '@/lib/imageOptimizer';
import {
  pickLookCandidates, readLookComplement, buildLookPayload,
  type LookComplement, type LookComplementPayload,
} from '@/lib/lookComplements';
import type { LetterSize } from '@/lib/sizeAdvisor';

// "Completa tu look": productos REALES del mismo comercio que combinan con la prenda abierta. Cada uno se activa con un
// interruptor y entra al pedido como una línea propia del carrito (ver src/lib/lookComplements.ts). Este componente solo
// decide qué mostrar y avisa al modal qué quedó activado (`onChange`); el total y el carrito los maneja el modal.
interface LookComplementsProps {
  current: any;                 // producto abierto en el modal (detalle)
  catalog: any[];               // listado real de la tienda
  catalogLoading?: boolean;     // aún llegan páginas del listado: se espera al catálogo completo antes de sugerir
  bcvRate: number | null;
  preferredSize: LetterSize | null; // talla del cliente (la que eligió en la prenda o la del probador): preselecciona la del complemento
  picks: Record<string, LookComplementPayload>;
  onChange: (productId: string, payload: LookComplementPayload | null) => void;
}

const MAX_CANDIDATES = 6; // detalles que se consultan como mucho por prenda
const MAX_SHOWN = 3;
const DETAIL_TIMEOUT_MS = 8000;

// Detalle ya consultado en esta sesión de navegación: `null` = ese producto no se puede agregar desde aquí
const complementCache = new Map<string, LookComplement | null>();

const shortOption = (label: string) => label.replace(/^\s*tallas?\s+/i, '').trim() || label;
const NO_CANDIDATES: any[] = [];

export default function LookComplements({ current, catalog, catalogLoading = false, bcvRate, preferredSize, picks, onChange }: LookComplementsProps) {
  const currentId = String(current?.id ?? '');

  // El listado de la tienda llega paginado (30 por página). Las sugerencias se calculan UNA vez, con el catálogo completo:
  // con solo la primera página, una ficha abierta por enlace directo sugería productos distintos según lo rápido que llegara
  // el resto. Una vez calculadas quedan fijas mientras la ficha esté abierta.
  const frozen = useRef<{ forId: string; list: any[] }>({ forId: '', list: NO_CANDIDATES });
  const candidates = useMemo(() => {
    if (frozen.current.forId === currentId && frozen.current.list.length > 0) return frozen.current.list;
    if (catalogLoading) return NO_CANDIDATES;
    const list = pickLookCandidates(current, catalog, MAX_CANDIDATES);
    frozen.current = { forId: currentId, list };
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, catalog, catalogLoading]);

  const [loaded, setLoaded] = useState<Record<string, LookComplement | null>>({});
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    const known: Record<string, LookComplement | null> = {};
    const missing: any[] = [];
    for (const c of candidates) {
      const key = String(c.id);
      if (complementCache.has(key)) known[key] = complementCache.get(key) ?? null;
      else missing.push(c);
    }
    setLoaded(known);
    missing.forEach((c) => {
      const key = String(c.id);
      getProduct(c.id, {}, DETAIL_TIMEOUT_MS)
        .then((res) => {
          // Solo se guarda en caché una respuesta válida del backend: un fallo de red se reintenta la próxima vez
          const ok = res && res.code === 1 && res.data;
          const complement = ok ? readLookComplement(res.data, c) : null;
          if (ok) complementCache.set(key, complement);
          if (!cancelled) setLoaded((prev) => ({ ...prev, [key]: complement }));
        })
        .catch(() => {
          if (!cancelled) setLoaded((prev) => ({ ...prev, [key]: null }));
        });
    });
    return () => { cancelled = true; };
  }, [candidates]);

  // La sección aparece cuando YA se conoce el detalle de todos los candidatos: así la lista sale completa y en su orden
  // definitivo (no se reordena ni esconde una tarjeta ya activada cuando llega una respuesta tardía). Sin detalle válido el
  // candidato simplemente no aparece, y sin ninguno la sección no se dibuja (ni título ni hueco).
  const settled = candidates.length > 0 && candidates.every((c) => Object.prototype.hasOwnProperty.call(loaded, String(c.id)));
  const ready = settled
    ? candidates.map((c) => loaded[String(c.id)]).filter((c): c is LookComplement => !!c).slice(0, MAX_SHOWN)
    : [];
  if (ready.length === 0) return null;

  const money = (usd: number) => `$${usd.toFixed(2)}`;
  const bolivars = (usd: number) =>
    bcvRate ? `Bs. ${(usd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null;

  const choose = (c: LookComplement, optionCode?: string) => {
    const payload = buildLookPayload(c, optionCode);
    if (payload) onChange(c.id, payload);
  };

  const toggle = (c: LookComplement) => {
    if (picks[c.id]) {
      onChange(c.id, null);
      setOpenCards((prev) => ({ ...prev, [c.id]: false }));
      return;
    }
    if (c.kind === 'direct') {
      choose(c);
      return;
    }
    // Con talla: se activa sola únicamente si existe la talla del cliente; si no, se abren las tallas y se activa al elegir una
    setOpenCards((prev) => ({ ...prev, [c.id]: true }));
    const mine = preferredSize ? c.options.filter((o) => o.size === preferredSize) : [];
    if (mine.length === 1) choose(c, mine[0].code);
  };

  return (
    <section data-testid="look-complements" aria-label="Completa tu look" className="space-y-2 border-t border-slate-100 pt-3">
      <div>
        <h4 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-900">
          <Sparkles className="w-3.5 h-3.5 text-[#fe6712]" aria-hidden="true" /> Completa tu look
        </h4>
        <p className="text-[10px] font-bold text-slate-500">Actívalos y se suman a tu pedido como productos aparte.</p>
      </div>

      <div className="flex flex-col gap-2">
        {ready.map((c) => {
          const pick = picks[c.id];
          const isOn = !!pick;
          const isOpen = c.kind === 'choice' && (isOn || !!openCards[c.id]);
          const pending = isOpen && !isOn;
          const pickedCode = isOn ? String(pick.variants?.[0]?.selected?.code ?? '') : '';
          const shownPrice = isOn ? pick.totalPrice : c.price;
          const variesByOption = c.kind === 'choice' && c.options.some((o) => o.price !== c.price);
          const bs = bolivars(shownPrice);
          return (
            <div
              key={c.id}
              data-testid="look-card"
              data-product-id={c.id}
              className={`rounded-xl border bg-white p-2.5 shadow-xs transition ${isOn ? 'border-[#fe6712] ring-1 ring-[#fe6712]/30' : pending ? 'border-amber-300' : 'border-slate-200'}`}
            >
              <div className="flex items-center gap-2.5">
                {c.image ? (
                  <img
                    src={getOptimizedImageUrl(c.image, 'PRODUCT')}
                    alt=""
                    width={44}
                    height={44}
                    loading="lazy"
                    className="h-11 w-11 shrink-0 rounded-lg border border-slate-100 bg-slate-50 object-contain"
                  />
                ) : (
                  <span className="h-11 w-11 shrink-0 rounded-lg border border-slate-100 bg-slate-50" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold leading-tight text-slate-800 line-clamp-2">{c.name}</p>
                  <p className="mt-0.5 text-[11px] font-black text-[#fe6712]">
                    {!isOn && variesByOption ? 'Desde ' : '+'}{money(shownPrice)}
                    {bs && <span className="ml-1.5 text-[9px] font-bold text-slate-400">{bs}</span>}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isOn}
                  aria-label={`Agregar ${c.name} a tu pedido`}
                  data-testid="look-switch"
                  onClick={() => toggle(c)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fe6712]/40 ${isOn ? 'bg-[#fe6712]' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isOn ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              {isOpen && (
                <div className="mt-2 border-t border-slate-100 pt-2">
                  <p data-testid="look-hint" className={`mb-1.5 text-[10px] font-bold ${pending ? 'text-amber-700' : 'text-slate-500'}`}>
                    {pending
                      ? (c.isSizeGroup ? 'Elige la talla para agregarlo:' : 'Elige una opción para agregarlo:')
                      : (c.isSizeGroup ? 'Talla:' : `${c.groupName}:`)}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.options.map((o) => {
                      const active = isOn && pickedCode === o.code;
                      return (
                        <button
                          key={o.code}
                          type="button"
                          data-testid="look-option"
                          aria-pressed={active}
                          onClick={() => choose(c, o.code)}
                          className={`h-8 rounded-full border px-3 text-[11px] font-bold transition cursor-pointer active:scale-95 ${active ? 'border-[#fe6712] bg-[#fff5ed] text-[#fe6712]' : 'border-slate-200 bg-white text-slate-700 hover:border-orange-300'}`}
                        >
                          {shortOption(o.label)}
                          {variesByOption && <span className="ml-1 font-black">{money(o.price)}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
