'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getProduct } from '@/services/marketplaceService';

interface ParticipantClaim {
  id: string;
  name: string;
  unitsCount: number;
  exclusions: string[];
  selectedVariants: Record<string, any>;
  subtotalUsd: number;
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
  const [qty, setQty] = useState(1);
  const [myClaim, setMyClaim] = useState<ParticipantClaim | null>(null);

  const [localVariants, setLocalVariants] = useState<Record<string, any[]>>({});
  const [localExclusions, setLocalExclusions] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [deadRoomStoreSlug, setDeadRoomStoreSlug] = useState<string | null>(null);

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
      window.location.href = deadRoomStoreSlug ? `/${deadRoomStoreSlug}` : '/';
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

  const submitClaim = async (variants: Record<string, any>, exclusions: string[]) => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/combo/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: guestName.trim(),
          unitsCount: qty,
          selectedVariants: variants,
          exclusions,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setRoom(data.room);
        const addedClaim = data.room.participants.find((p: any) => p.name === guestName.trim() && p.unitsCount === qty);
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
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                </button>
                <span className="text-lg font-black text-slate-800">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(Math.min(availableUnits, qty + 1))}
                  disabled={qty >= availableUnits}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#fe6712] hover:bg-orange-100 disabled:opacity-30 transition cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>

            {saveError && <p className="text-xs font-bold text-red-600 text-center">{saveError}</p>}

            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled={!guestName.trim() || saving || availableUnits < 1}
                onClick={handleSaveStandard}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-md cursor-pointer"
              >
                {saving ? 'Guardando...' : '🟢 Salen con todo'}
              </button>
              
              {hasSinGroups && (
                <button
                  type="button"
                  disabled={!guestName.trim() || availableUnits < 1}
                  onClick={() => { initVariants(); setPhase('customize'); }}
                  className="w-full bg-white hover:bg-slate-50 border-2 border-slate-200 disabled:opacity-50 text-slate-700 font-black py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
                >
                  ⚙️ Quitar ingredientes
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'customize') {
    const hasSinGroups = (room.groups || []).some((g: any) => /\bsin\b/i.test(String(g.name || g.title || '')));
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shadow-sm">
          <button type="button" onClick={() => setPhase('pick')} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-[#fe6712] uppercase tracking-wider">{qty} {qty > 1 ? 'Unidades' : 'Unidad'} · {guestName}</p>
            <h1 className="text-sm font-black text-slate-900 truncate">{room.productName}</h1>
          </div>
        </div>

        <div className="flex-1 px-4 py-5 space-y-5 overflow-y-auto max-w-md mx-auto w-full pb-32">
          {hasSinGroups && (
            <div className="space-y-3">
              <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Quitar ingredientes</p>
              <div className="grid grid-cols-2 gap-2">
                {(room.groups || [])
                  .filter((g: any) => /\bsin\b/i.test(String(g.name || g.title || '')))
                  .flatMap((g: any) => g.options || g.items || [])
                  .map((opt: any) => {
                    const label = opt.name || opt.title || '';
                    const selected = localExclusions.includes(label);
                    return (
                      <label key={label} className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition shadow-sm ${selected ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300'}`}>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => setLocalExclusions(prev => selected ? prev.filter(e => e !== label) : [...prev, label])}
                          className="w-4 h-4 accent-[#fe6712] rounded cursor-pointer"
                        />
                        <span className={selected ? 'line-through opacity-70' : ''}>{label}</span>
                      </label>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 py-3.5 shadow-md space-y-2 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          {saveError && <p className="text-xs font-bold text-red-600 text-center">{saveError}</p>}
          <button
            type="button"
            onClick={handleSaveCustom}
            disabled={saving}
            className="w-full bg-[#fe6712] hover:bg-[#e0580d] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
          >
            {saving ? 'Guardando...' : 'Confirmar selección'}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'done' && myClaim) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-sm w-full space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">¡Listo, {guestName}!</h2>
              <p className="text-sm text-slate-500 mt-1">El anfitrión ha recibido tu pedido.</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-200">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Tu Ticket</p>
              <p className="text-sm font-black text-slate-800">{myClaim.unitsCount}x {room.productName}</p>
              {myClaim.exclusions.length > 0 ? (
                <p className="text-xs text-red-500 font-bold mt-1.5">Sin: {myClaim.exclusions.join(', ')}</p>
              ) : (
                <p className="text-xs text-emerald-600 font-bold mt-1.5">Con Todo</p>
              )}
            </div>
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 uppercase">Total a pagar:</span>
              <span className="text-lg font-black text-slate-900">${myClaim.subtotalUsd.toFixed(2)}</span>
            </div>
          </div>
          
          <button
            onClick={handleCopyPayment}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-md cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            Copiar datos de pago para el Anfitrión
          </button>
        </div>
      </div>
    );
  }

  return null;
}
