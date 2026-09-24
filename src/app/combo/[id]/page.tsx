'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getProduct } from '@/services/marketplaceService';
/* ─── Tipos espejo del backend ───────────────────────────────────────────── */
interface ComboSlotState {
  slotIndex: number;
  guestName: string;
  selectedVariants: Record<string, any>;
  exclusions: string[];
  completedAt: string | null;
}

interface ComboRoom {
  id: string;
  productId: string | number;
  productName: string;
  storeName: string;
  storeCode: string;
  totalSlots: number;
  groups: any[];
  slots: ComboSlotState[];
  createdAt: string;
  hostName: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function slotLabel(i: number) {
  return `Ítem ${i + 1}`;
}

function OptionCapsule({
  name,
  image,
  priceLabel,
  count,
  mode,
  onSelect,
  onIncrement,
  onDecrement,
}: {
  name: string;
  image?: string;
  priceLabel?: string | null;
  count: number;
  mode: 'single' | 'counter';
  onSelect?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
}) {
  const isActive = count > 0;
  return (
    <div
      className={`w-full rounded-xl border py-2 px-3 flex items-center justify-between gap-2 transition ${
        isActive ? 'border-[#fe6712] bg-orange-50/30' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {image && (
          <img src={image} alt={name} className="w-8 h-8 rounded-lg object-contain bg-slate-50 border border-slate-100 shrink-0 p-0.5" />
        )}
        <span className="text-xs font-bold text-slate-800 leading-tight line-clamp-2">{name}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {priceLabel && <span className="text-[11px] font-black text-[#fe6712]">{priceLabel}</span>}
        {mode === 'single' ? (
          <button
            type="button"
            onClick={onSelect}
            className={`h-5 w-5 rounded-full border flex items-center justify-center transition cursor-pointer ${
              isActive ? 'border-[#fe6712] bg-[#fe6712]' : 'border-slate-300'
            }`}
          >
            {isActive && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={onDecrement}
              disabled={count <= 0}
              className="h-5 w-5 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
            </button>
            <span className={`w-4 text-center text-xs font-black ${isActive ? 'text-[#fe6712]' : 'text-slate-400'}`}>{count}</span>
            <button
              type="button"
              onClick={onIncrement}
              className="h-5 w-5 rounded-full bg-[#fe6712] text-white flex items-center justify-center hover:bg-[#e0580d] transition cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Página Principal ───────────────────────────────────────────────────── */
export default function ComboRoomPage({ params }: { params: { id: string } }) {
  const roomId = params.id;

  const [room, setRoom] = useState<ComboRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Paso del flujo del invitado
  const [phase, setPhase] = useState<'pick-slot' | 'customize' | 'done'>('pick-slot');
  const [guestName, setGuestName] = useState('');
  const [chosenSlot, setChosenSlot] = useState<number | null>(null);

  // Variantes seleccionadas por este invitado
  const [localVariants, setLocalVariants] = useState<Record<string, any[]>>({});
  const [localExclusions, setLocalExclusions] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [hasDeadRoomInStorage, setHasDeadRoomInStorage] = useState(false);
  const [deadRoomStoreSlug, setDeadRoomStoreSlug] = useState<string | null>(null);

  useEffect(() => {
    if ((error || !loading) && !room) {
      if (typeof window !== 'undefined') {
        try {
          const stored = window.localStorage.getItem('duna_pedido_amigos_active');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.roomId === roomId) {
              setHasDeadRoomInStorage(true);
              setDeadRoomStoreSlug(parsed.storeSlug || null);
            }
          }
        } catch (e) {}
      }
    }
  }, [error, room, loading, roomId]);

  const handleClearDeadRoom = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('duna_pedido_amigos_active');
      window.location.href = deadRoomStoreSlug ? `/${deadRoomStoreSlug}` : '/';
    }
  };

  // Helper to normalize product groups (like MasterProductModal)
  const normalizeGroups = (product: any) => {
    if (!product) return [];
    let rawList: any[] = [];
    if (Array.isArray(product.groups) && product.groups.length > 0) rawList = product.groups;
    else if (Array.isArray(product.slotGroups) && product.slotGroups.length > 0) rawList = product.slotGroups;
    else if (Array.isArray(product.variants) && product.variants.length > 0) rawList = product.variants;
    else if (Array.isArray(product.sabores) && product.sabores.length > 0) rawList = product.sabores;
    else if (Array.isArray(product.pack_items) && product.pack_items.length > 0) rawList = product.pack_items;
    else if (Array.isArray(product.options) && product.options.length > 0) rawList = product.options;
    else if (Array.isArray(product.customizations) && product.customizations.length > 0) rawList = product.customizations;
    else if (product.metadata) {
      const meta = typeof product.metadata === 'string' ? (() => { try { return JSON.parse(product.metadata); } catch { return {}; } })() : product.metadata;
      if (Array.isArray(meta?.variants) && meta.variants.length > 0) rawList = meta.variants;
      else if (Array.isArray(meta?.groups) && meta.groups.length > 0) rawList = meta.groups;
      else if (Array.isArray(meta?.slotGroups) && meta.slotGroups.length > 0) rawList = meta.slotGroups;
    }

    if (!Array.isArray(rawList) || rawList.length === 0) return [];

    const isArrayOfGroups = rawList.some((item: any) =>
      item && typeof item === 'object' && (Array.isArray(item.options) || Array.isArray(item.items) || Array.isArray(item.values) || Array.isArray(item.variants))
    );

    if (isArrayOfGroups) {
      return rawList.map((g: any, gIdx: number) => {
        const rawOptions = g.options || g.items || g.values || g.variants || [];
        const normalizedOptions = Array.isArray(rawOptions) ? rawOptions.filter((opt: any) => opt?.status !== 'INACTIVE').map((opt: any, oIdx: number) => ({
          ...opt,
          name: opt.name || opt.title || opt.label || (typeof opt === 'string' ? opt : `Opción ${oIdx + 1}`),
          code: opt.code || opt.id || opt.value || `opt-${gIdx}-${oIdx}`,
          price: Number(opt.price || opt.unitPrice || 0),
          count: 0
        })) : [];
        const isCheckbox = g.selectType === 'CHECKIN' || Boolean(g.checkbox);
        const isMultiple = g.selectType === 'MULTIPLE' || isCheckbox || Number(g.max || g.maxItems || 0) > 1;
        return {
          ...g,
          name: g.name || g.title || g.label || 'Opciones',
          selectType: isCheckbox ? 'CHECKIN' : (isMultiple ? 'MULTIPLE' : (g.selectType || 'SINGLE')),
          pricingRole: g.pricingRole || 'ADDON',
          options: normalizedOptions
        };
      });
    }

    const normalizedOptions = rawList.filter((opt: any) => opt?.status !== 'INACTIVE').map((opt: any, oIdx: number) => ({
      ...opt,
      name: opt.name || opt.title || opt.label || (typeof opt === 'string' ? opt : `Opción ${oIdx + 1}`),
      code: opt.code || opt.id || opt.value || `opt-${oIdx}`,
      price: Number(opt.price || opt.unitPrice || 0),
      count: 0
    }));

    return [{
      name: 'Opciones Adicionales',
      title: 'Opciones Adicionales',
      selectType: 'MULTIPLE',
      pricingRole: 'ADDON',
      options: normalizedOptions
    }];
  };

  const productCacheRef = useRef<any>(null);

  /* ── Cargar sala ── */
  const loadRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/combo/${roomId}`);
      if (!res.ok) { setError('Sala no encontrada o expirada.'); return; }
      const data = await res.json();
      if (data.ok) {
        const fetchedRoom = data.room;
        // Hidratación por referencia: Buscar producto para inyectar options
        if (!productCacheRef.current && fetchedRoom.productId) {
           const pRes = await getProduct(fetchedRoom.productId);
           if (pRes.code === 1 && pRes.data) {
             productCacheRef.current = normalizeGroups(pRes.data);
           }
        }
        fetchedRoom.groups = productCacheRef.current || [];
        setRoom(fetchedRoom);
      }
      else setError(data.error || 'Error al cargar la sala.');
    } catch {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadRoom();
    // Polling 3 s para ver actualizaciones de otros participantes en la vista pick-slot
    const timer = setInterval(loadRoom, 3000);
    return () => clearInterval(timer);
  }, [loadRoom]);

  /* ── Inicializar opciones al elegir ranura ── */
  useEffect(() => {
    if (!room || chosenSlot === null) return;
    const vars: Record<string, any[]> = {};
    room.groups.forEach((g, gIdx) => {
      const opts = g.options || g.items || [];
      vars[String(gIdx)] = opts.map((o: any) => ({ ...o, count: 0 }));
    });
    setLocalVariants(vars);
    setLocalExclusions([]);
  }, [room, chosenSlot]);

  /* ── Guardar selección ── */
  const handleSave = async () => {
    if (!guestName.trim()) { setSaveError('Escribe tu nombre antes de guardar.'); return; }
    if (chosenSlot === null) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/combo/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotIndex: chosenSlot,
          guestName: guestName.trim(),
          selectedVariants: localVariants,
          exclusions: localExclusions,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setRoom(data.room);
        setPhase('done');
      } else {
        setSaveError(data.error || 'No se pudo guardar.');
      }
    } catch {
      setSaveError('Error de red. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleOptionCount = (gIdx: number, code: string, delta: number) => {
    setLocalVariants(prev => {
      const list = [...(prev[String(gIdx)] || [])];
      return {
        ...prev,
        [String(gIdx)]: list.map(item =>
          (item.code || item.id) === code
            ? { ...item, count: Math.max(0, (item.count || 0) + delta) }
            : item
        ),
      };
    });
  };

  const handleSingleSelect = (gIdx: number, code: string) => {
    setLocalVariants(prev => {
      const list = prev[String(gIdx)] || [];
      return {
        ...prev,
        [String(gIdx)]: list.map(item => ({
          ...item,
          count: (item.code || item.id) === code ? 1 : 0,
        })),
      };
    });
  };

  /* ─── Render ─────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#fe6712] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Cargando sala…</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-sm w-full text-center space-y-4">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-black text-slate-900">Sala no disponible</h2>
          <p className="text-sm text-slate-500 mb-4">{error || 'El enlace expiró o no existe.'}</p>
          <button
            onClick={handleClearDeadRoom}
            className="w-full bg-[#FE6712] hover:bg-[#E05509] text-white font-black py-3 px-4 rounded-xl text-sm transition-colors mt-4 shadow-md hover:shadow-lg"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  /* ── Fase: elección de ranura ── */
  if (phase === 'pick-slot') {
    const freeSlots = room.slots.filter(s => !s.guestName || s.slotIndex === 0);
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shadow-sm">
          <img src="/images/logo-naranja-transparent.png" alt="D'una" className="h-8 w-auto object-contain" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Combo Colaborativo</p>
            <h1 className="text-sm font-black text-slate-900 truncate">{room.productName}</h1>
          </div>
        </div>

        <div className="flex-1 px-4 py-5 space-y-5 max-w-md mx-auto w-full">
          {/* Info del anfitrión */}
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 bg-[#fe6712] rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">{room.hostName} te invitó</p>
              <p className="text-[11px] text-slate-500 font-medium">
                Tienda: <strong className="text-slate-700">{room.storeName}</strong> · {room.totalSlots} ítems en total
              </p>
            </div>
          </div>

          {/* Nombre del invitado */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Tu nombre</label>
            <input
              type="text"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              placeholder="Ej. María, Luis, El gordito…"
              maxLength={30}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#fe6712] focus:ring-2 focus:ring-[#fe6712]/20 placeholder-slate-400 transition"
            />
          </div>

          {/* Lista de ranuras */}
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Elige tu ítem libre</p>
            {room.slots.map((slot, i) => {
              const isTaken = slot.slotIndex > 0 && !!slot.guestName;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={isTaken || !guestName.trim()}
                  onClick={() => { setChosenSlot(i); setPhase('customize'); }}
                  className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 transition cursor-pointer ${
                    isTaken
                      ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
                      : guestName.trim()
                      ? 'border-[#fe6712]/50 bg-orange-50/30 hover:bg-orange-50 hover:border-[#fe6712]'
                      : 'border-slate-200 bg-white cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${isTaken ? 'bg-slate-200 text-slate-600' : 'bg-[#fe6712] text-white'}`}>
                      {slotLabel(i)}
                    </span>
                    <span className="text-sm font-bold text-slate-700 truncate">
                      {isTaken ? slot.guestName : (i === 0 ? `${room.hostName} (anfitrión)` : 'Disponible')}
                    </span>
                  </div>
                  {isTaken ? (
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">Listo</span>
                  ) : i === 0 ? (
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">Anfitrión</span>
                  ) : (
                    <svg className="w-4 h-4 text-[#fe6712] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ── Fase: personalización ── */
  if (phase === 'customize' && chosenSlot !== null) {
    const hasGroups = room.groups.length > 0 && room.groups.some(g => (g.options || g.items || []).length > 0);
    const hasSinGroups = room.groups.some((g: any) => /\bsin\b/i.test(String(g.name || g.title || '')));

    const isMinimumsMet = room.groups.every((group: any, gIdx: number) => {
      const isSinGroup = /\bsin\b/i.test(String(group.name || group.title || ''));
      if (isSinGroup) return true; // Exclusiones son opcionales
      const min = group.minItems ?? group.min ?? (group.required ? 1 : (group.selectType === 'SINGLE' && group.pricingRole === 'BASE' ? 1 : 0));
      if (min <= 0) return true;
      const selection = localVariants[String(gIdx)] || [];
      const totalCount = selection.reduce((acc: number, curr: any) => acc + (curr.count || 0), 0);
      return totalCount >= min;
    });

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shadow-sm">
          <button type="button" onClick={() => setPhase('pick-slot')} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-[#fe6712] uppercase tracking-wider">{slotLabel(chosenSlot)} · {guestName}</p>
            <h1 className="text-sm font-black text-slate-900 truncate">{room.productName}</h1>
          </div>
        </div>

        <div className="flex-1 px-4 py-5 space-y-5 overflow-y-auto max-w-md mx-auto w-full pb-32">
          {!hasGroups && (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-center">
              <p className="text-sm font-bold text-sky-700">Este combo no requiere personalización extra.</p>
              <p className="text-xs text-sky-500 mt-1">Puedes guardar tu ítem directamente.</p>
            </div>
          )}

          {hasGroups && room.groups.map((group: any, gIdx: number) => {
            const opts: any[] = group.options || group.items || [];
            if (!opts.length) return null;
            const isSinGroup = /\bsin\b/i.test(String(group.name || group.title || ''));
            if (isSinGroup) return null;

            const isCheckin = group.selectType === 'CHECKIN' || Boolean(group.checkbox);
            const isMultiple = group.selectType === 'MULTIPLE' || group.selectType === 'CHECKIN';
            const isSingle = !isMultiple;

            return (
              <div key={gIdx} className="space-y-2.5">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">{group.title || group.name}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">{group.subtitle || (isSingle ? 'Elige una opción' : 'Ajusta cantidades')}</p>
                </div>
                <div className="space-y-2">
                  {opts.map((opt: any) => {
                    const list = localVariants[String(gIdx)] || [];
                    const item = list.find((it: any) => (it.code || it.id) === (opt.code || opt.id));
                    const count = item?.count || 0;
                    const priceLabel = opt.price > 0 ? `+$${Number(opt.price).toFixed(2)}` : null;

                    return (
                      <OptionCapsule
                        key={opt.code || opt.id}
                        name={opt.name || opt.title || opt.label || 'Opción'}
                        image={opt.image || opt.img}
                        priceLabel={priceLabel}
                        count={count}
                        mode={isSingle || isCheckin ? 'single' : 'counter'}
                        onSelect={() => isSingle ? handleSingleSelect(gIdx, opt.code || opt.id) : handleOptionCount(gIdx, opt.code || opt.id, count > 0 ? -1 : 1)}
                        onIncrement={() => handleOptionCount(gIdx, opt.code || opt.id, 1)}
                        onDecrement={() => handleOptionCount(gIdx, opt.code || opt.id, -1)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Exclusiones tipo SIN */}
          {hasSinGroups && (
            <div className="space-y-2">
              <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Quitar ingredientes (opcional)</p>
              <div className="grid grid-cols-2 gap-2">
                {room.groups
                  .filter((g: any) => /\bsin\b/i.test(String(g.name || g.title || '')))
                  .flatMap((g: any) => g.options || g.items || [])
                  .map((opt: any) => {
                    const label = opt.name || opt.title || '';
                    const selected = localExclusions.includes(label);
                    return (
                      <label key={label} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${selected ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300'}`}>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => setLocalExclusions(prev => selected ? prev.filter(e => e !== label) : [...prev, label])}
                          className="w-3.5 h-3.5 accent-[#fe6712] rounded cursor-pointer"
                        />
                        <span className={selected ? 'line-through opacity-70' : ''}>{label}</span>
                      </label>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Sticky */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 py-3.5 shadow-md space-y-2 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          {saveError && <p className="text-xs font-bold text-red-600 text-center">{saveError}</p>}
          {!isMinimumsMet && <p className="text-xs font-bold text-slate-500 text-center">Completa las opciones requeridas para confirmar.</p>}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isMinimumsMet || !guestName.trim()}
            className="w-full bg-[#fe6712] hover:bg-[#e0580d] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando…</>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Confirmar mi ítem
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ── Fase: hecho ── */
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 shadow-xl max-w-sm w-full text-center space-y-5">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">¡Listo, {guestName}!</h2>
          <p className="text-sm text-slate-500 mt-1">Tu selección quedó guardada. El anfitrión verá tu ítem y completará el pedido.</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-1.5 border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tu ítem</p>
          <p className="text-sm font-black text-slate-800">{slotLabel(chosenSlot!)} — {room.productName}</p>
          {room.slots[chosenSlot!]?.completedAt && (
            <p className="text-[11px] text-slate-500">
              Confirmado: {new Date(room.slots[chosenSlot!].completedAt!).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <p className="text-xs text-slate-400">Puedes cerrar esta pantalla. El anfitrión recibirá tu pedido en tiempo real.</p>
      </div>
    </div>
  );
}
