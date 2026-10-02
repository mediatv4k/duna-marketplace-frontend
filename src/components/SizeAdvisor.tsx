'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Ruler, Check, AlertTriangle } from 'lucide-react';
import {
  suggestLetterSize, adviseSize, loadFitProfile, saveFitProfile,
  type LetterSize, type SizeOption,
} from '@/lib/sizeAdvisor';

// Modo Espejo (probador virtual). El cliente elige su estatura y peso aproximados y el bloque le sugiere una talla y le
// dice si esa talla tiene stock EN ESTA PRENDA (tallas reales del backend). Solo presentación: no calcula precios ni toca
// el carrito; "Elegir talla" llama al mismo handler que la cápsula de la talla en el modal.
interface SizeAdvisorProps {
  options: SizeOption[];          // tallas reales del producto (`readSizeOptions`)
  selectedCodes: string[];        // códigos de las tallas marcadas ahora en el modal
  productSoldOut?: boolean;       // el producto entero está agotado
  onPick: (optionCode: string) => void;
  onIdealChange?: (ideal: LetterSize | null) => void; // la talla sugerida también sirve para "Completa tu look"
}

// Valores aproximados en pasos de 5 (el script original ofrecía 4 rangos; la regla de corte es la misma)
const HEIGHTS: number[] = Array.from({ length: 11 }, (_, i) => 145 + i * 5); // 145 … 195 cm
const WEIGHTS: number[] = Array.from({ length: 15 }, (_, i) => 40 + i * 5);  // 40 … 110 kg

const heightLabel = (cm: number) => {
  const text = `${(cm / 100).toFixed(2).replace('.', ',')} m`;
  if (cm === HEIGHTS[0]) return `${text} o menos`;
  if (cm === HEIGHTS[HEIGHTS.length - 1]) return `${text} o más`;
  return text;
};
const weightLabel = (kg: number) => {
  if (kg === WEIGHTS[0]) return `${kg} kg o menos`;
  if (kg === WEIGHTS[WEIGHTS.length - 1]) return `${kg} kg o más`;
  return `${kg} kg`;
};

const shortSize = (label: string) => label.replace(/^\s*tallas?\s+/i, '').trim() || label;

export default function SizeAdvisor({ options, selectedCodes, productSoldOut = false, onPick, onIdealChange }: SizeAdvisorProps) {
  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [weightKg, setWeightKg] = useState<number | null>(null);

  // Datos que el cliente ya eligió en otra prenda o en otra visita (solo este dispositivo): no se le vuelven a pedir
  useEffect(() => {
    const saved = loadFitProfile();
    if (saved && HEIGHTS.includes(saved.heightCm) && WEIGHTS.includes(saved.weightKg)) {
      setHeightCm(saved.heightCm);
      setWeightKg(saved.weightKg);
    }
  }, []);

  const ideal = useMemo(() => (heightCm && weightKg ? suggestLetterSize(heightCm, weightKg) : null), [heightCm, weightKg]);
  const advice = useMemo(() => (ideal ? adviseSize(ideal, options, productSoldOut) : null), [ideal, options, productSoldOut]);

  useEffect(() => {
    onIdealChange?.(ideal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideal]);

  const update = (next: { heightCm: number | null; weightKg: number | null }) => {
    setHeightCm(next.heightCm);
    setWeightKg(next.weightKg);
    if (next.heightCm && next.weightKg) saveFitProfile({ heightCm: next.heightCm, weightKg: next.weightKg });
  };

  const selectClass = 'w-full h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#fe6712] focus:ring-2 focus:ring-[#fe6712]/15 cursor-pointer';
  const suggested = advice && advice.kind !== 'none' ? advice.option : null;
  const alreadyPicked = !!suggested && selectedCodes.length === 1 && selectedCodes[0] === suggested.code;

  return (
    <section data-testid="size-advisor" aria-label="Probador virtual de talla" className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50/80 to-amber-50/50 p-3 space-y-2.5">
      <h4 className="flex items-center gap-1.5 text-xs font-black text-slate-900 whitespace-nowrap">
        <Ruler className="w-3.5 h-3.5 text-[#fe6712] shrink-0" aria-hidden="true" />
        Modo Espejo
        <span className="font-bold text-slate-500">· Probador virtual</span>
      </h4>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-[10px] font-bold text-slate-600">Estatura aproximada</span>
          <select
            data-testid="fit-height"
            value={heightCm ?? ''}
            onChange={(e) => update({ heightCm: e.target.value ? Number(e.target.value) : null, weightKg })}
            className={selectClass}
          >
            <option value="">Elige…</option>
            {HEIGHTS.map((cm) => <option key={cm} value={cm}>{heightLabel(cm)}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] font-bold text-slate-600">Peso aproximado</span>
          <select
            data-testid="fit-weight"
            value={weightKg ?? ''}
            onChange={(e) => update({ heightCm, weightKg: e.target.value ? Number(e.target.value) : null })}
            className={selectClass}
          >
            <option value="">Elige…</option>
            {WEIGHTS.map((kg) => <option key={kg} value={kg}>{weightLabel(kg)}</option>)}
          </select>
        </label>
      </div>

      <div data-testid="fit-result" aria-live="polite" className="rounded-xl border border-orange-100 bg-white px-3 py-2">
        {!advice && (
          <p className="text-[11px] font-semibold text-slate-500">Elige tu estatura y tu peso para sugerirte una talla.</p>
        )}

        {advice?.kind === 'exact' && (
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 text-[11px] font-semibold text-slate-700">
              Tu talla sugerida es <strong className="font-black text-slate-900">{advice.ideal}</strong>
              <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-black text-emerald-700 border border-emerald-200 align-middle">
                <Check className="w-2.5 h-2.5 stroke-[3]" aria-hidden="true" /> Disponible
              </span>
            </p>
            <PickButton option={advice.option} picked={alreadyPicked} onPick={onPick} />
          </div>
        )}

        {advice?.kind === 'nearby' && (
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 text-[11px] font-semibold text-slate-700">
              Tu talla sugerida es <strong className="font-black text-slate-900">{advice.ideal}</strong>, pero{' '}
              {advice.why === 'soldOut' ? 'está agotada en esta prenda' : 'esta prenda no viene en esa talla'}. La más cercana con stock es{' '}
              <strong className="font-black text-slate-900">{shortSize(advice.option.label)}</strong>{' '}
              <span className="text-slate-500">({advice.fit === 'looser' ? 'te quedará más holgada' : 'te quedará más ajustada'}).</span>
            </p>
            <PickButton option={advice.option} picked={alreadyPicked} onPick={onPick} />
          </div>
        )}

        {advice?.kind === 'none' && (
          <p className="flex items-start gap-1.5 text-[11px] font-semibold text-slate-700">
            <AlertTriangle className="mt-0.5 w-3.5 h-3.5 shrink-0 text-amber-500" aria-hidden="true" />
            <span>
              Tu talla sugerida es <strong className="font-black text-slate-900">{advice.ideal}</strong>
              {advice.allSoldOut
                ? ', pero esta prenda no tiene tallas disponibles en este momento.'
                : advice.why === 'soldOut'
                  ? ', pero está agotada y no hay una talla cercana con stock.'
                  : ', pero esta prenda no viene en esa talla ni en una cercana.'}
            </span>
          </p>
        )}
      </div>

      <p className="text-[9px] font-medium leading-snug text-slate-400">
        Es una orientación según tu complexión; el corte de cada prenda puede variar.
      </p>
    </section>
  );
}

function PickButton({ option, picked, onPick }: { option: SizeOption; picked: boolean; onPick: (code: string) => void }) {
  if (picked) {
    return (
      <span className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-black text-emerald-700">
        <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" /> Elegida
      </span>
    );
  }
  return (
    <button
      type="button"
      data-testid="fit-pick"
      onClick={() => onPick(option.code)}
      className="shrink-0 rounded-lg bg-[#fe6712] px-2.5 py-1.5 text-[10px] font-black text-white shadow-sm transition hover:bg-[#e0580d] active:scale-95 cursor-pointer whitespace-nowrap"
    >
      Elegir talla {shortSize(option.label)}
    </button>
  );
}
