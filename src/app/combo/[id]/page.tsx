'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getProduct, getProductsByStore } from '@/services/marketplaceService';
import { getBCVRate } from '@/lib/bcvRate';
import KitchenNote, { cleanKitchenNote, formatSin } from '@/components/KitchenNote';

// Unidad ya guardada en la sala (todo mapas: Firestore no admite arreglos anidados)
interface GuestUnit {
  unitIndex: number;
  unitName: string;
  exclusions: string[];
  addons: { name: string; code: string; price: number; count: number }[];
  note: string;
}

// Borrador de una unidad mientras el invitado la personaliza
interface UnitDraft {
  name: string;
  exclusions: string[];
  addons: Record<string, number>;
  note: string;
}

interface ParticipantClaim {
  id: string;
  name: string;
  unitsCount: number;
  exclusions: string[];
  selectedVariants: Record<string, any>;
  subtotalUsd: number;
  notes?: string[];
  units?: GuestUnit[];
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
  storeId?: string | number;
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

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Personalización por unidad (mismo modelo que "Personalizar aquí" de la tienda): cada unidad tiene su alias opcional,
  // sus exclusiones ("SIN…"), sus adicionales (clave → 0/1) y su sugerencia para la cocina. `activeUnit` = pestaña activa.
  const [unitsData, setUnitsData] = useState<UnitDraft[]>([]);
  const [activeUnit, setActiveUnit] = useState(0);
  // Catálogo real de la tienda (complementos: papas, bebidas, tequeños…) cuando el producto no trae adicionales con precio
  const [catalogExtras, setCatalogExtras] = useState<any[]>([]);
  const roomStoreId = room?.storeId;
  useEffect(() => {
    if (!roomStoreId) return;
    let alive = true;
    getProductsByStore(roomStoreId)
      .then((res) => {
        if (!alive || res.code !== 1 || !res.data) return;
        const d = res.data;
        const list: any[] = Array.isArray(d) ? d : Array.isArray(d.data) ? d.data : Array.isArray(d.products) ? d.products.flatMap((c: any) => c.data || c) : [];
        setCatalogExtras(list);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [roomStoreId]);

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

  // ── Borradores por unidad ──────────────────────────────────────────────────────────────────────────────────────────
  const emptyUnit = (): UnitDraft => ({ name: '', exclusions: [], addons: {}, note: '' });
  const getUnit = (i: number): UnitDraft => unitsData[i] || emptyUnit();
  const updateUnit = (i: number, patch: Partial<UnitDraft>) =>
    setUnitsData((prev) => {
      const next = Array.from({ length: Math.max(prev.length, i + 1) }, (_, k) => prev[k] || emptyUnit());
      next[i] = { ...next[i], ...patch };
      return next;
    });
  const toggleExclusion = (i: number, label: string) => {
    const cur = getUnit(i).exclusions;
    updateUnit(i, { exclusions: cur.includes(label) ? cur.filter((e) => e !== label) : [...cur, label] });
  };
  const toggleAddon = (i: number, key: string) => {
    const cur = getUnit(i).addons;
    updateUnit(i, { addons: { ...cur, [key]: cur[key] ? 0 : 1 } });
  };
  // "Repetir en todos": copia exclusiones y adicionales (no el alias ni la nota) de la unidad `from` a las demás
  const repeatInAll = (from: number) => {
    const src = getUnit(from);
    setUnitsData((prev) =>
      Array.from({ length: Math.max(prev.length, claimedUnits) }, (_, k) =>
        k === from ? (prev[k] || emptyUnit()) : { ...(prev[k] || emptyUnit()), exclusions: [...src.exclusions], addons: { ...src.addons } }
      )
    );
  };

  // Opciones extra que se ofrecen al invitado: (a) las del propio producto con precio real (grupos que no son "SIN" ni BASE);
  // si el producto no trae ninguna, (b) complementos reales del catálogo de la tienda (primera página), con el mismo criterio
  // que el modal del anfitrión (papas/tequeños/bebidas…, sin stock 0, sin el propio producto, máx. 4).
  const buildAddonOptions = (): any[] => {
    const native = (room?.groups || []).flatMap((g: any, gIdx: number) =>
      /\bsin\b/i.test(String(g.name || g.title || '')) || g.pricingRole === 'BASE'
        ? []
        : (g.options || []).filter((o: any) => Number(o.price) > 0).map((o: any) => ({ ...o, key: `${gIdx}:${o.code}`, group: g }))
    );
    if (native.length > 0) return native;
    const keywords = ['papa', 'tequeño', 'tequeno', 'bebida', 'refresco', 'extra', 'adicional', 'acompañante'];
    return catalogExtras
      .filter((p: any) => {
        if (String(p.id) === String(room?.productId)) return false;
        if (p.stock === 0 || p.outOfStock) return false;
        if (!(Number(p.price) > 0)) return false;
        const n = String(p.name || '').toLowerCase();
        const c = String(p.category || '').toLowerCase();
        const sub = String(p.internalCategory || p.subCategory || '').toLowerCase();
        return keywords.some((k) => n.includes(k) || c.includes(k) || sub.includes(k));
      })
      .slice(0, 4)
      .map((p: any) => ({ name: p.name, code: String(p.code || p.sku || p.id), price: Number(p.price), image: p.image || p.imageUrl, key: `cat:${p.id}`, group: null }));
  };

  // Adicionales de una unidad (cada uno cuenta 1) y adicionales consolidados de todas las unidades
  const unitAddonItems = (i: number) =>
    buildAddonOptions()
      .filter((o: any) => (getUnit(i).addons[o.key] || 0) > 0)
      .map((o: any) => ({
        name: o.name, code: o.code, price: Number(o.price), count: 1,
        ...(o.group ? { groupName: o.group.name || o.group.title, groupCode: o.group.code, groupType: o.group.selectType } : {}),
      }));
  const allAddonItems = () => {
    const merged = new Map<string, any>();
    for (let i = 0; i < claimedUnits; i++) {
      unitAddonItems(i).forEach((it) => {
        const prev = merged.get(it.code);
        merged.set(it.code, prev ? { ...prev, count: prev.count + it.count } : it);
      });
    }
    return Array.from(merged.values());
  };
  const getAddonsUsd = () => allAddonItems().reduce((sum, it) => sum + it.price * it.count, 0);

  // Confirma la selección: una entrada por unidad { unitIndex, unitName, exclusions, addons, note } (todo mapas: Firestore no
  // admite arreglos anidados). Además viajan los agregados que ya consumen el monitor y el carrito (exclusions = unión,
  // selectedVariants.addons consolidado, addonsUsd) para no alterar la estructura de precios/variants hacia Adonis.
  const handleConfirm = async () => {
    if (!guestName.trim()) { setSaveError('Escribe tu nombre antes de guardar.'); return; }
    setSaving(true);
    setSaveError(null);
    try {
      const units = Array.from({ length: claimedUnits }, (_, i) => {
        const u = getUnit(i);
        return { unitIndex: i + 1, unitName: (u.name || '').trim().slice(0, 30), exclusions: u.exclusions, addons: unitAddonItems(i), note: cleanKitchenNote(u.note) };
      });
      const addons = allAddonItems();
      const res = await fetch(`/api/combo/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: guestName.trim(),
          unitsCount: claimedUnits,
          units,
          exclusions: Array.from(new Set(units.flatMap((u) => u.exclusions))),
          selectedVariants: addons.length > 0 ? { addons } : {},
          addonsUsd: getAddonsUsd(),
          // Con 1 unidad la nota viaja como siempre; con varias, cada nota vive en su unidad
          notes: claimedUnits === 1 && units[0].note ? [units[0].note] : [],
        }),
      });
      // Un 500 puede no traer JSON válido: nunca se muestra el error técnico crudo
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setRoom(data.room);
        const mine = [...data.room.participants].reverse().find((p: any) => p.name === guestName.trim() && p.unitsCount === claimedUnits);
        setMyClaim(mine || null);
        setPhase('done');
      } else if (res.status >= 500 || !data) {
        setSaveError('No pudimos guardar tu selección. Intenta de nuevo en unos segundos.');
      } else {
        setSaveError(data.error || 'No se pudo guardar. Intenta de nuevo.');
      }
    } catch {
      setSaveError('No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.');
    } finally {
      setSaving(false);
    }
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
  const addonOptions = buildAddonOptions();
  const sinOptions = (room.groups || [])
    .filter((g: any) => /\bsin\b/i.test(String(g.name || g.title || '')))
    .flatMap((g: any) => g.options || g.items || []);
  const safeUnit = Math.min(activeUnit, Math.max(0, claimedUnits - 1));
  const unit = getUnit(safeUnit);
  const myPartUsd = claimedUnits * room.unitPriceUsd + getAddonsUsd();
  const formatBs = (usd: number) => (bcvRate ? usd * bcvRate : 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (phase === 'pick') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-8 pb-10 px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-xl font-black text-slate-900 leading-tight mb-2">{room.productName}</h1>
            <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#fe6712] animate-pulse"></span>
              <span className="text-xs font-bold text-orange-800">Quedan {availableUnits} de {room.totalUnits} disponibles</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-5">
            {/* Datos iniciales */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Tu nombre</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Ej: Carlos, Nena..."
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
                  aria-label="Menos unidades"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                </button>
                <span className="text-lg font-black text-slate-800">{claimedUnits}</span>
                <button
                  type="button"
                  onClick={() => setClaimedUnits(Math.min(availableUnits, claimedUnits + 1))}
                  disabled={claimedUnits >= availableUnits}
                  aria-label="Más unidades"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#fe6712] hover:bg-orange-100 disabled:opacity-30 transition cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>

            {room.paymentMode === 'host_pays' && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-start gap-2">
                <span className="text-emerald-500 text-lg">🎁</span>
                <p className="text-[11px] font-bold text-emerald-800 leading-tight">
                  ¡Estás invitado por el anfitrión! Solo elige tus porciones.
                </p>
              </div>
            )}

            {/* Selector por unidades (2 o más): pestañas #1…#n */}
            {claimedUnits > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {Array.from({ length: claimedUnits }).map((_, i) => {
                  const u = getUnit(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveUnit(i)}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-black border transition cursor-pointer ${i === safeUnit ? 'bg-[#FE6712] text-white border-[#FE6712]' : 'bg-white text-slate-700 border-slate-300 hover:border-[#FE6712]/50'}`}
                    >
                      #{i + 1}{u.name.trim() ? ` ${u.name.trim().slice(0, 8)}` : ''}
                    </button>
                  );
                })}
                {(sinOptions.length > 0 || addonOptions.length > 0) && (
                  <button
                    type="button"
                    onClick={() => repeatInAll(safeUnit)}
                    className="shrink-0 ml-auto px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#FE6712] bg-orange-50 border border-orange-200 hover:bg-orange-100 transition cursor-pointer"
                  >
                    Repetir en todos
                  </button>
                )}
              </div>
            )}

            {/* Personalización de la unidad activa (misma estructura que "Personalizar aquí") */}
            <div className="p-3 sm:p-4 bg-white border border-slate-100 rounded-2xl space-y-4 shadow-sm">
              {claimedUnits > 1 && (
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">¿Para quién es? (Opcional)</label>
                  <input
                    type="text"
                    value={unit.name}
                    maxLength={30}
                    onChange={(e) => updateUnit(safeUnit, { name: e.target.value.slice(0, 30) })}
                    placeholder="Ej: Carlitos, Mamá"
                    className="w-full h-9 text-xs px-3 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#FE6712] transition"
                  />
                </div>
              )}

              {sinOptions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Sin</p>
                  <div className="flex flex-wrap gap-2">
                    {sinOptions.map((opt: any) => {
                      const label = opt.name || opt.title || '';
                      const selected = unit.exclusions.includes(label);
                      const displayLabel = label.toUpperCase().startsWith('SIN ') ? label : 'Sin ' + label;
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => toggleExclusion(safeUnit, label)}
                          className={`px-4 py-2 rounded-full border text-xs font-bold transition cursor-pointer ${selected ? 'border-[#FE6712] bg-orange-50 text-[#FE6712]' : 'border-slate-200 bg-white text-slate-700 hover:border-[#FE6712]/40'}`}
                        >
                          {selected ? '✓ ' : '+ '}{displayLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {addonOptions.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">¿Acompañamos esta unidad?</p>
                  <div className="flex flex-row overflow-x-auto gap-2.5 pb-1 pt-0.5 no-scrollbar snap-x">
                    {addonOptions.map((opt: any) => {
                      const selected = (unit.addons[opt.key] || 0) > 0;
                      return (
                        <div
                          key={opt.key}
                          onClick={() => toggleAddon(safeUnit, opt.key)}
                          className={`w-36 shrink-0 snap-start p-2 rounded-xl border flex flex-col justify-between transition cursor-pointer ${selected ? 'border-[#FE6712]/50 bg-[#fff5ed]' : 'border-slate-200 bg-white hover:border-[#FE6712]/30'}`}
                        >
                          {(opt.image || opt.imageUrl) && (
                            <img src={opt.image || opt.imageUrl} alt={opt.name} className="w-full h-14 object-cover rounded-lg mb-1.5 bg-white" />
                          )}
                          <div>
                            <p className="text-[11px] font-bold text-slate-900 truncate">{opt.name}</p>
                            <span className="text-[10px] font-black text-orange-700">+${Number(opt.price).toFixed(2)}</span>
                          </div>
                          <button
                            type="button"
                            className={`w-full mt-1.5 py-1 text-[11px] font-bold rounded-lg flex items-center justify-center transition ${selected ? 'bg-[#FE6712]/10 text-[#FE6712] border border-[#FE6712]/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          >
                            {selected ? '✓ Agregado' : '+ Agregar'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sugerencia para la cocina de esta unidad (mismo componente que la tienda) */}
              <KitchenNote key={safeUnit} value={unit.note} onChange={(v) => updateUnit(safeUnit, { note: v })} />
            </div>

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

            {saveError && <p role="alert" className="text-xs font-bold text-red-600 text-center">{saveError}</p>}

            <button
              type="button"
              disabled={!guestName.trim() || saving || availableUnits < 1}
              onClick={handleConfirm}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-300 disabled:border disabled:cursor-not-allowed text-white font-black py-4 rounded-xl text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-md cursor-pointer"
            >
              {saving ? 'Guardando...' : 'Confirmar mi selección'}
            </button>
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
              {Array.isArray(myClaim.units) && myClaim.units.length > 1 ? (
                <div className="mt-1.5 space-y-1">
                  {myClaim.units.map((u, i) => (
                    <div key={i}>
                      <p className={`text-xs font-bold ${u.exclusions.length > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                        #{i + 1}{u.unitName ? ` (${u.unitName})` : ''}: {u.exclusions.length > 0 ? u.exclusions.map(formatSin).join(', ') : 'Con todo'}
                      </p>
                      {u.addons.map((a, k) => (
                        <p key={k} className="text-[11px] text-slate-600 font-bold pl-3">+ {a.count > 1 ? `${a.count}x ` : ''}{a.name}</p>
                      ))}
                      {u.note && <p className="text-[11px] text-slate-500 font-medium pl-3">Nota: {u.note}</p>}
                    </div>
                  ))}
                </div>
              ) : myClaim.exclusions.length > 0 ? (
                <p className="text-xs text-red-500 font-bold mt-1.5">{myClaim.exclusions.map(formatSin).join(', ')}</p>
              ) : (
                <p className="text-xs text-emerald-600 font-bold mt-1.5">Con todo</p>
              )}
              {(!Array.isArray(myClaim.units) || myClaim.units.length <= 1) && Array.isArray(myClaim.notes) && myClaim.notes.length > 0 && (
                <p className="text-xs text-slate-600 font-bold mt-1">Nota para la cocina: {myClaim.notes.join(' / ')}</p>
              )}
              {(!Array.isArray(myClaim.units) || myClaim.units.length <= 1) && Object.values(myClaim.selectedVariants || {}).flatMap((sel: any) => (Array.isArray(sel) ? sel : [])).filter((it: any) => (it?.count || 0) > 0).map((it: any, i: number) => (
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
