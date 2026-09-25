'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getProduct } from '@/services/marketplaceService';
import { getBCVRate } from '@/lib/bcvRate';
import KitchenNote, { cleanKitchenNote } from '@/components/KitchenNote';

interface ParticipantClaim {
  id: string;
  name: string;
  unitsCount: number;
  exclusions: string[];
  selectedVariants: Record<string, any>;
  subtotalUsd: number;
  notes?: string[];
  isHost: boolean;
  completedAt: string | null;
}

interface ComboRoomData {
  id: string;
  productId: string | number;
  productName: string;
  storeName: string;
  storeCode: string;
  totalUnits: number;
  unitPriceUsd: number;
  claimedUnits: number;
  paymentMode: 'split' | 'host_pays';
  participants: ParticipantClaim[];
  createdAt: string;
  hostName: string;
  groups?: any[]; // Re-hidrated on client
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

export default function ComboRoomPage({ params }: { params: { id: string } }) {
  const roomId = params.id;

  const [room, setRoom] = useState<ComboRoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [phase, setPhase] = useState<'pick' | 'customize' | 'done'>('pick');
  const [guestName, setGuestName] = useState('');
  const [claimedUnits, setClaimedUnits] = useState(1);
  const [myClaim, setMyClaim] = useState<ParticipantClaim | null>(null);
  const [bcvRate, setBcvRate] = useState<number | null>(null);

  const [localVariants, setLocalVariants] = useState<Record<string, any[]>>({});
  const [localExclusions, setLocalExclusions] = useState<string[]>([]);
  const [customizationType, setCustomizationType] = useState<'all' | 'custom'>('all');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Adicionales (papas, bebidas…) que el invitado suma a su porción: clave `${grupo}:${code}` → cantidad
  const [addonCounts, setAddonCounts] = useState<Record<string, number>>({});
  // Sugerencia para la cocina de las unidades del invitado (máx. 70 caracteres)
  const [guestNote, setGuestNote] = useState('');

  const [deadRoomStoreSlug, setDeadRoomStoreSlug] = useState<string | null>(null);

  // Tasa BCV oficial (misma fuente que el Home): sin ella el invitado solo vería USD y no podría hacer Pago Móvil
  useEffect(() => {
    let alive = true;
    getBCVRate().then((r) => { if (alive) setBcvRate(r); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  // La app vive en `/` (no hay rutas /store/{code}); `?store=` la lee el Home para abrir esa tienda directo
  const storeMenuHref = (slug?: string | null) => (slug ? `/?store=${encodeURIComponent(slug)}` : '/');

  useEffect(() => {
    if ((error || !loading) && !room) {
      if (typeof window !== 'undefined') {
        try {
          const stored = window.localStorage.getItem('duna_pedido_amigos_active');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.roomId === roomId) {
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
      window.location.href = storeMenuHref(deadRoomStoreSlug);
    }
  };

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

  const loadRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/combo/${roomId}`);
      if (!res.ok) { setError('Sala no encontrada o expirada.'); return; }
      const data = await res.json();
      if (data.ok) {
        const fetchedRoom = data.room;
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
    const timer = setInterval(loadRoom, 3000);
    return () => clearInterval(timer);
  }, [loadRoom]);

  const initVariants = () => {
    if (!room) return;
    const vars: Record<string, any[]> = {};
    room.groups?.forEach((g, gIdx) => {
      const opts = g.options || g.items || [];
      vars[String(gIdx)] = opts.map((o: any) => ({ ...o, count: 0 }));
    });
    setLocalVariants(vars);
    setLocalExclusions([]);
  };

  const handleSaveStandard = async () => {
    if (!guestName.trim()) { setSaveError('Escribe tu nombre antes de guardar.'); return; }
    await submitClaim({}, []);
  };

  const handleSaveCustom = async () => {
    if (!guestName.trim()) { setSaveError('Escribe tu nombre antes de guardar.'); return; }
    await submitClaim(localVariants, localExclusions);
  };

  // Adicionales elegidos por el invitado (solo opciones con precio real > 0 del producto) y su monto en USD
  const getAddonItems = () => {
    const items: any[] = [];
    (room?.groups || []).forEach((g: any, gIdx: number) => {
      (g.options || []).forEach((o: any) => {
        const count = addonCounts[`${gIdx}:${o.code}`] || 0;
        if (count > 0 && Number(o.price) > 0) items.push({ name: o.name, code: o.code, price: Number(o.price), count, groupName: g.name || g.title, groupCode: g.code, groupType: g.selectType });
      });
    });
    return items;
  };
  const getAddonsUsd = () => getAddonItems().reduce((sum, it) => sum + it.price * it.count, 0);

  const submitClaim = async (variants: Record<string, any>, exclusions: string[]) => {
    setSaving(true);
    setSaveError(null);
    try {
      const addonItems = getAddonItems();
      const res = await fetch(`/api/combo/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: guestName.trim(),
          unitsCount: claimedUnits,
          selectedVariants: addonItems.length > 0 ? { ...variants, addons: addonItems } : variants,
          exclusions,
          addonsUsd: getAddonsUsd(),
          notes: cleanKitchenNote(guestNote) ? [cleanKitchenNote(guestNote)] : [],
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setRoom(data.room);
        const addedClaim = data.room.participants.find((p: any) => p.name === guestName.trim() && p.unitsCount === claimedUnits);
        setMyClaim(addedClaim);
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

  const handleCopyPayment = () => {
    const text = `Pago por mi parte del combo:\nMonto: $${myClaim?.subtotalUsd.toFixed(2)}\nUnidades: ${myClaim?.unitsCount}`;
    navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles');
  };

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

  const availableUnits = room.totalUnits - room.claimedUnits;

  // Opciones de pago extra reales del producto (excluye el grupo "SIN", que resta ingredientes, y los grupos BASE)
  const addonOptions = (room.groups || []).flatMap((g: any, gIdx: number) =>
    /\bsin\b/i.test(String(g.name || g.title || '')) || g.pricingRole === 'BASE'
      ? []
      : (g.options || []).filter((o: any) => Number(o.price) > 0).map((o: any) => ({ ...o, key: `${gIdx}:${o.code}` }))
  );
  const myPartUsd = claimedUnits * room.unitPriceUsd + getAddonsUsd();
  const formatBs = (usd: number) => (bcvRate ? usd * bcvRate : 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (phase === 'pick') {
    const hasSinGroups = (room.groups || []).some((g: any) => /\bsin\b/i.test(String(g.name || g.title || '')));
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-8 px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-xl font-black text-slate-900 leading-tight mb-2">{room.productName}</h1>
            <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#fe6712] animate-pulse"></span>
              <span className="text-xs font-bold text-orange-800">Quedan {availableUnits} de {room.totalUnits} disponibles</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Tu nombre</label>
              <input
                type="text"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                placeholder="Ej. María, Luis..."
                maxLength={30}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#fe6712] focus:ring-2 focus:ring-[#fe6712]/20 placeholder-slate-400 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">¿Cuántos van para ti?</label>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => setClaimedUnits(Math.max(1, claimedUnits - 1))}
                  disabled={claimedUnits <= 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                </button>
                <span className="text-lg font-black text-slate-800">{claimedUnits}</span>
                <button
                  type="button"
                  onClick={() => setClaimedUnits(Math.min(availableUnits, claimedUnits + 1))}
                  disabled={claimedUnits >= availableUnits}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#fe6712] hover:bg-orange-100 disabled:opacity-30 transition cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>

            {saveError && <p className="text-xs font-bold text-red-600 text-center">{saveError}</p>}

            
              {/* Payment Mode Alert */}
              {room.paymentMode === 'host_pays' && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-start gap-2">
                  <span className="text-emerald-500 text-lg">🎁</span>
                  <p className="text-[11px] font-bold text-emerald-800 leading-tight">
                    ¡Estás invitado por el anfitrión! Solo elige tus porciones.
                  </p>
                </div>
              )}

              {saveError && <p className="text-xs font-bold text-red-600 text-center">{saveError}</p>}

              <div className="space-y-4 pt-2">
                {hasSinGroups && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">¿Cómo los prefieres?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomizationType('all')}
                        className={`py-2.5 px-2 rounded-xl text-xs transition cursor-pointer border ${customizationType === 'all' ? 'bg-[#FE6712] text-white border-[#FE6712] font-black shadow-md' : 'bg-white text-slate-800 border-slate-300 font-bold hover:bg-slate-50'}`}
                      >
                        🥬 Salen con todo
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCustomizationType('custom'); initVariants(); }}
                        className={`py-2.5 px-2 rounded-xl text-xs transition cursor-pointer border ${customizationType === 'custom' ? 'bg-[#FE6712] text-white border-[#FE6712] font-black shadow-md' : 'bg-white text-slate-800 border-slate-300 font-bold hover:bg-slate-50'}`}
                      >
                        🛠️ Quitar ingredientes
                      </button>
                    </div>
                  </div>
                )}

                {hasSinGroups && customizationType === 'custom' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Selecciona lo que NO quieres:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(room.groups || [])
                        .filter((g: any) => /\bsin\b/i.test(String(g.name || g.title || '')))
                        .flatMap((g: any) => g.options || g.items || [])
                        .map((opt: any) => {
                          const label = opt.name || opt.title || '';
                          const selected = localExclusions.includes(label);
                          // Prevent Sin SIN duplication
                          const displayLabel = label.toUpperCase().startsWith('SIN ') ? label : 'Sin ' + label;
                          return (
                            <label key={label} className={`flex items-center gap-2 p-2 rounded-xl border text-[11px] font-bold cursor-pointer transition shadow-sm ${selected ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-300 text-slate-800 hover:border-[#FE6712]/50'}`}>
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => setLocalExclusions(prev => selected ? prev.filter(e => e !== label) : [...prev, label])}
                                className="w-4 h-4 accent-[#FE6712] rounded cursor-pointer"
                              />
                              <span className={selected ? 'line-through opacity-70' : ''}>{displayLabel}</span>
                            </label>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Adicionales (upselling): carrusel horizontal, solo con opciones con precio real del producto */}
                {addonOptions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">¿Le sumas algo? (opcional)</p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                      {addonOptions.map((opt: any) => {
                        const count = addonCounts[opt.key] || 0;
                        return (
                          <div key={opt.key} className="w-60 shrink-0">
                            <OptionCapsule
                              name={opt.name}
                              image={opt.image || opt.imageUrl}
                              priceLabel={`+$${Number(opt.price).toFixed(2)}`}
                              count={count}
                              mode="counter"
                              onIncrement={() => setAddonCounts(prev => ({ ...prev, [opt.key]: (prev[opt.key] || 0) + 1 }))}
                              onDecrement={() => setAddonCounts(prev => ({ ...prev, [opt.key]: Math.max(0, (prev[opt.key] || 0) - 1) }))}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sugerencia para la cocina (acordeón compacto, punto donde se permiten notas para el invitado) */}
                <KitchenNote value={guestNote} onChange={setGuestNote} />

                {/* Tu parte, Bs. protagonista (Pago Móvil) + referencia en USD y tasa BCV */}
                <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-3.5 space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    {room.paymentMode === 'host_pays' ? 'Invita el anfitrión' : 'Tu parte a pagar'}
                  </p>
                  {room.paymentMode === 'host_pays' ? (
                    <p className="text-sm font-black text-emerald-700">No pagas nada, solo elige.</p>
                  ) : bcvRate ? (
                    <>
                      <p className="text-2xl font-black text-slate-900 leading-tight">Bs. {formatBs(myPartUsd)}</p>
                      <p className="text-[11px] font-bold text-slate-500">(${myPartUsd.toFixed(2)} USD • Tasa BCV: Bs. {bcvRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-black text-slate-900 leading-tight">${myPartUsd.toFixed(2)}</p>
                      <p className="text-[11px] font-bold text-slate-400">Tasa BCV no disponible por ahora.</p>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!guestName.trim() || saving || availableUnits < 1}
                  onClick={() => {
                     if (customizationType === 'all') {
                        handleSaveStandard();
                     } else {
                        handleSaveCustom();
                     }
                  }}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-300 disabled:border disabled:cursor-not-allowed text-white font-black py-4 rounded-xl text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-md cursor-pointer"
                >
                  {saving ? 'Guardando...' : (customizationType === 'all' ? 'Confirmar mis porciones' : 'Guardar personalización')}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }


  if (phase === 'done' && myClaim) {
    if (room.paymentMode === 'host_pays') {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-8 shadow-xl max-w-sm w-full space-y-6 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-3xl">🎉</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">¡Listo, {guestName}!</h2>
              <p className="text-sm text-slate-500 mt-2">Tu pedido quedó reservado en la sala: tus {myClaim.unitsCount} unidades ya fueron confirmadas y agregadas a la orden. ¡Buen provecho!</p>
            </div>
            <button
              type="button"
              onClick={() => { window.location.href = storeMenuHref(room.storeCode); }}
              className="w-full bg-[#FE6712] hover:bg-[#E05509] text-white font-bold py-3 px-4 rounded-xl shadow-md transition cursor-pointer"
            >
              Explorar el menú de la tienda
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-sm w-full space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">¡Listo, {guestName}!</h2>
              <p className="text-sm text-slate-500 mt-1">Tu pedido quedó reservado en la sala. El anfitrión ya lo recibió.</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-200">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Resumen de tu pedido</p>
              <p className="text-sm font-black text-slate-800">{myClaim.unitsCount}x {room.productName}</p>
              {myClaim.exclusions.length > 0 ? (
                <p className="text-xs text-red-500 font-bold mt-1.5">{myClaim.exclusions.map(e => e.toUpperCase().startsWith('SIN ') ? e : 'Sin ' + e).join(', ')}</p>
              ) : (
                <p className="text-xs text-emerald-600 font-bold mt-1.5">Con Todo</p>
              )}
              {Array.isArray(myClaim.notes) && myClaim.notes.length > 0 && (
                <p className="text-xs text-slate-600 font-bold mt-1">Nota para la cocina: {myClaim.notes.join(' / ')}</p>
              )}
              {Object.values(myClaim.selectedVariants || {}).flatMap((sel: any) => (Array.isArray(sel) ? sel : [])).filter((it: any) => (it?.count || 0) > 0).map((it: any, i: number) => (
                <p key={i} className="text-xs text-slate-600 font-bold mt-1">+ {it.count > 1 ? `${it.count}x ` : ''}{it.name}</p>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="flex flex-col gap-1 w-full">
                <span className="text-xs font-black text-slate-500 uppercase">Tu parte a pagar</span>
                {bcvRate ? (
                  <>
                    <span className="text-2xl font-black text-slate-900 leading-tight">Bs. {(myClaim.subtotalUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-[11px] font-bold text-slate-500">(${myClaim.subtotalUsd.toFixed(2)} USD • Tasa BCV: Bs. {bcvRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-black text-slate-900 leading-tight">${myClaim.subtotalUsd.toFixed(2)}</span>
                    <span className="text-[11px] font-bold text-slate-400">Tasa BCV no disponible por ahora.</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              const msg = `¡Epale! Ya armé mis ${myClaim.unitsCount} unidades. Mi parte son ${myClaim.subtotalUsd.toFixed(2)}` + (bcvRate ? ` (Bs. ${(myClaim.subtotalUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}).` : '.');
              window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(msg), '_blank');
            }}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-md cursor-pointer"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Avisar al Anfitrión por WhatsApp
          </button>

          <button
            type="button"
            onClick={() => { window.location.href = storeMenuHref(room.storeCode); }}
            className="w-full bg-[#FE6712] hover:bg-[#E05509] text-white font-bold py-3 px-4 rounded-xl shadow-md transition cursor-pointer"
          >
            Explorar el menú de la tienda
          </button>
        </div>
      </div>
    );
  }

  return null;
}
