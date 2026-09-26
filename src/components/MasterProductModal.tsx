'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  ArrowRight,
  ShoppingCart,
  Plus,
  Minus,
  Info,
  Users,
  Sparkles,
  Layers,
  Copy,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  Snowflake
} from 'lucide-react';
import { parseDescriptionTags } from '@/lib/productTags';
import ProductTagBadges from './ProductTagBadges';
import ShareButton from './ShareButton';
import KitchenNote, { cleanKitchenNote, formatSin } from './KitchenNote';
import { getOptimizedImageUrl } from '@/lib/imageOptimizer';

export interface ComboSlot {
  id: number;
  name: string;
  selectedVariants: Record<string | number, any>;
  exclusions: string[];
  notes?: string; // sugerencia para la cocina de esta unidad (máx. 70 caracteres)
}

export interface VariantSelectionPayload {
  productCode: string;
  productName: string;
  totalPrice: number;
  totalUSD?: number;
  qty: number;
  quantity?: number;
  summaryText: string;
  breakdown: string[];
  slots?: ComboSlot[];
  variants?: any[];
  pricing?: { unitBasePrice: number; addonsTotal: number; unitFinalPrice: number };
  proceedToCheckout?: boolean; // solo la sala colaborativa completa: la tienda abre el carrito al recibirlo
  notes?: string; // sugerencia para la cocina del producto simple (las de combo/ranura viajan dentro de breakdown)
  // Solo local (Recibo del seguimiento): quién pidió cada adicional con costo. NO viaja a Adonis (CheckoutModal mapea campos explícitos).
  extrasByPerson?: { name: string; participant: string; price: number }[];
}

// Etiquetas de precio extra para una cápsula. Solo presentación: no participa en ningún cálculo.
// `isReplacement` = el precio de la opción reemplaza el precio base (pricingRole BASE), así que
// se muestra sin el prefijo "+".
// Grupo de casillas independientes (0/1): tipo CHECKIN del backend o marcado `checkbox` por la normalización. Único criterio en todo el modal,
// sin depender de la pantalla ni del comercio. El contador (- 0 +) queda solo para los grupos MULTIPLE.
const isCheckinGroup = (g: any): boolean => !!g?.checkbox || g?.selectType === 'CHECKIN';

function getOptionPriceLabels(price: number, isReplacement: boolean, bcvRate: number | null) {
  if (!(price > 0)) return { priceLabel: null as string | null, bsLabel: null as string | null };
  return {
    priceLabel: `${isReplacement ? '' : '+'}$${price.toFixed(2)}`,
    bsLabel: bcvRate ? `Bs ${(price * bcvRate).toFixed(2)}` : null,
  };
}

interface OptionCapsuleProps {
  name: string;
  image?: string;
  priceLabel: string | null;
  bsLabel: string | null;
  count: number;
  mode: 'single' | 'counter';
  onSelect?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onIncrement?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDecrement?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function OptionCapsule({ name, image, priceLabel, bsLabel, count, mode, onSelect, onIncrement, onDecrement }: OptionCapsuleProps) {
  const isActive = count > 0;
  const shell = `w-full rounded-xl border py-2 px-3 transition-all duration-150 ${
    isActive
      ? 'border-[#fe6712] bg-orange-50/20 ring-1 ring-[#fe6712]/30 shadow-xs'
      : 'border-slate-200 bg-white hover:border-slate-300'
  }`;

  const leftInfo = (
    <div className="flex items-center gap-2.5 min-w-0 flex-1">
      {image && (
        <img src={image} alt={name} className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-contain bg-slate-50 border border-slate-100 shrink-0 p-0.5" />
      )}
      <div className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-slate-800 leading-tight line-clamp-2">{name}</span>
      </div>
    </div>
  );

  const priceInfo = priceLabel ? (
    <div className="text-right shrink-0">
      <span className="block text-xs font-black text-[#fe6712]">{priceLabel}</span>
      {bsLabel && <span className="block text-[9px] font-bold text-slate-400">{bsLabel}</span>}
    </div>
  ) : (
    <span className="text-[9px] font-black text-emerald-600 shrink-0">Incluido</span>
  );

  if (mode === 'single') {
    return (
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect?.(e); }}
        aria-pressed={isActive}
        className={`${shell} flex items-center justify-between gap-2.5 text-left cursor-pointer active:scale-[0.99]`}
      >
        {leftInfo}
        <div className="flex items-center gap-2.5 shrink-0">
          {priceInfo}
          <span
            className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition ${
              isActive ? 'border-[#fe6712] bg-[#fe6712] text-white' : 'border-slate-300 bg-white text-transparent'
            }`}
          >
            <Check className="h-2.5 w-2.5 stroke-[3]" />
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className={`${shell} flex items-center justify-between gap-2.5`}>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onIncrement?.(e); }}
        className="flex min-w-0 flex-1 items-center text-left cursor-pointer active:scale-[0.99]"
      >
        {leftInfo}
      </button>
      <div className="flex items-center gap-2.5 shrink-0">
        {priceInfo}
        <div className="flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-0.5">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDecrement?.(e); }}
            disabled={count <= 0}
            aria-label={`Quitar ${name}`}
            className="flex h-5 w-5 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Minus className="h-3 w-3 stroke-[2.5]" />
          </button>
          <span className={`w-4 text-center text-xs font-black ${isActive ? 'text-[#fe6712]' : 'text-slate-400'}`}>{count}</span>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onIncrement?.(e); }}
            aria-label={`Agregar ${name}`}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fe6712] text-white transition hover:bg-[#e0580d] cursor-pointer"
          >
            <Plus className="h-3 w-3 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}


interface MasterProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
  nicheEngine: string;
  bcvRate: number | null;
  onAddToCart: (payload: VariantSelectionPayload) => void;
  initialQty?: number;
  storeCatalog?: any[]; // unidades con las que arranca el contador al abrir (p. ej. el pedido del asistente); por defecto 1
  store?: { name: string; code: string; id?: string | number } | null; // botón "Compartir" (nombre y slug reales) e id real para la sala
  resumeRoomId?: string | null; // rescate de sesión del anfitrión: reabre el Monitor en Vivo de esa sala al abrir el modal
}

export default function MasterProductModal({
  isOpen,
  onClose,
  product,
  nicheEngine,
  bcvRate,
  onAddToCart,
  initialQty = 1,
  storeCatalog = [],
  store,
  resumeRoomId = null
}: MasterProductModalProps) {
  // Cantidad válida: entero entre 1 y 99
  const startQty = Math.min(Math.max(Math.floor(Number(initialQty)) || 1, 1), 99);
  const [step, setStep] = useState<number>(1);
  const [qty, setQty] = useState<number>(startQty);

  // Estados globales de variantes y exclusiones (modo estándar)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, any>>({});
  const [selectedExclusions, setSelectedExclusions] = useState<string[]>([]);
  const [upsellSelections, setUpsellSelections] = useState<Record<string, any>>({});
  // Sugerencia para la cocina del producto simple individual (la de cada unidad de un combo vive en `slot.notes`)
  const [productNote, setProductNote] = useState('');

  // ── Pedido Colaborativo ("Armar Combo con Amigos en Vivo") ─────────────────
  const [comboRoomId, setComboRoomId] = useState<string | null>(null);
  const [comboRoomData, setComboRoomData] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'options' | 'customize' | 'slots' | 'host_setup' | 'comboRoom'>('options');
  // A dónde vuelve la vista de personalización (ranuras): 'options' = compra individual; 'host_setup' / 'comboRoom' =
  // personalización del anfitrión dentro del flujo colaborativo, que SIEMPRE regresa a la sala (nunca a la compra individual)
  const [slotReturnView, setSlotReturnView] = useState<'options' | 'host_setup' | 'comboRoom'>('options');
  const [hostSaving, setHostSaving] = useState(false);
  const [hostSaveError, setHostSaveError] = useState<string | null>(null);
    const [hostPaymentMode, setHostPaymentMode] = useState<'split' | 'host_pays'>('split');
    const [hostSetupUnits, setHostSetupUnits] = useState(1);
    const [hostSetupExclusions, setHostSetupExclusions] = useState<string[]>([]);
  const [showComboPanel, setShowComboPanel] = useState(false);
  const [comboCreating, setComboCreating] = useState(false);
  const comboPollingRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Detección si el producto es un Combo
  // Metadatos ocultos en la descripción (ver src/lib/productTags.ts): sin etiquetas `[CLAVE: Valor]`, `tags` queda
  // vacío y `cleanDescription` es la descripción real, sin tocar (los productos sin corchetes no se ven afectados)
  const { cleanDescription, tags: descriptionTags } = useMemo(
    () => parseDescriptionTags(product?.desc || product?.description),
    [product]
  );




  const isCombo = useMemo(() => {
    if (!product) return false;
    if (product.isCombo) return true;
    const cat = (product.category || product.cat || '').toUpperCase();
    if (cat.includes('COMBO')) return true;
    if (product.name && /combo/i.test(product.name)) return true;
    return false;
  }, [product]);

  // Grupos disponibles para variantes en ranura. Normalización universal de datos reales del backend
  // Soporta product.groups, product.slotGroups, product.variants, product.pack_items, product.sabores, product.options, product.customizations y sus equivalentes en metadata.
  const availableGroups = useMemo(() => {
    if (!product) return [];

    let rawList: any[] = [];
    if (Array.isArray(product.groups) && product.groups.length > 0) {
      rawList = product.groups;
    } else if (Array.isArray(product.slotGroups) && product.slotGroups.length > 0) {
      rawList = product.slotGroups;
    } else if (Array.isArray(product.variants) && product.variants.length > 0) {
      rawList = product.variants;
    } else if (Array.isArray(product.sabores) && product.sabores.length > 0) {
      rawList = product.sabores;
    } else if (Array.isArray(product.pack_items) && product.pack_items.length > 0) {
      rawList = product.pack_items;
    } else if (Array.isArray(product.options) && product.options.length > 0) {
      rawList = product.options;
    } else if (Array.isArray(product.customizations) && product.customizations.length > 0) {
      rawList = product.customizations;
    } else if (product.metadata) {
      const meta = typeof product.metadata === 'string' ? (() => { try { return JSON.parse(product.metadata); } catch { return {}; } })() : product.metadata;
      if (Array.isArray(meta?.variants) && meta.variants.length > 0) rawList = meta.variants;
      else if (Array.isArray(meta?.groups) && meta.groups.length > 0) rawList = meta.groups;
      else if (Array.isArray(meta?.slotGroups) && meta.slotGroups.length > 0) rawList = meta.slotGroups;
      else if (Array.isArray(meta?.sabores) && meta.sabores.length > 0) rawList = meta.sabores;
      else if (Array.isArray(meta?.pack_items) && meta.pack_items.length > 0) rawList = meta.pack_items;
      else if (Array.isArray(meta?.options) && meta.options.length > 0) rawList = meta.options;
      else if (Array.isArray(meta?.customizations) && meta.customizations.length > 0) rawList = meta.customizations;
    }

    if (!Array.isArray(rawList) || rawList.length === 0) return [];

    const isArrayOfGroups = rawList.some((item: any) =>
      item && typeof item === 'object' && (Array.isArray(item.options) || Array.isArray(item.items) || Array.isArray(item.values) || Array.isArray(item.variants) || Array.isArray(item.choices))
    );

    if (isArrayOfGroups) {
      return rawList.map((g: any, gIdx: number) => {
        const rawOptions = g.options || g.items || g.values || g.variants || g.choices || [];
        const normalizedOptions = Array.isArray(rawOptions) ? rawOptions.filter((opt: any) => opt?.status !== 'INACTIVE').map((opt: any, oIdx: number) => ({
          ...opt,
          name: opt.name || opt.title || opt.label || (typeof opt === 'string' ? opt : `Opción ${oIdx + 1}`),
          title: opt.title || opt.name || opt.label || (typeof opt === 'string' ? opt : `Opción ${oIdx + 1}`),
          code: opt.code || opt.id || opt.value || `opt-${gIdx}-${oIdx}`,
          id: opt.id || opt.code || opt.value || `opt-${gIdx}-${oIdx}`,
          price: Number(opt.price || opt.unitPrice || 0),
          image: opt.image || opt.img || opt.imageUrl || undefined,
          count: 0
        })) : [];

        const isCheckbox = g.selectType === 'CHECKIN' || Boolean(g.checkbox);
        const isMultiple = g.selectType === 'MULTIPLE' || isCheckbox || Number(g.max || g.maxItems || 0) > 1;

        return {
          ...g,
          name: g.name || g.title || g.label || 'Opciones',
          title: g.title || g.name || g.label || 'Opciones',
          selectType: isCheckbox ? 'CHECKIN' : (isMultiple ? 'MULTIPLE' : (g.selectType || 'SINGLE')),
          pricingRole: g.pricingRole || 'ADDON',
          options: normalizedOptions,
          items: normalizedOptions
        };
      });
    }

    // Array plano de opciones / sabores
    const normalizedOptions = rawList.filter((opt: any) => opt?.status !== 'INACTIVE').map((opt: any, oIdx: number) => ({
      ...opt,
      name: opt.name || opt.title || opt.label || (typeof opt === 'string' ? opt : `Sabor ${oIdx + 1}`),
      title: opt.title || opt.name || opt.label || (typeof opt === 'string' ? opt : `Sabor ${oIdx + 1}`),
      code: opt.code || opt.id || opt.value || `flavor-${oIdx}`,
      id: opt.id || opt.code || opt.value || `flavor-${oIdx}`,
      price: Number(opt.price || opt.unitPrice || 0),
      image: opt.image || opt.img || opt.imageUrl || undefined,
      count: 0
    }));

    return [{
      name: 'Sabores Disponibles',
      title: 'Sabores Disponibles',
      subtitle: 'Elige las cantidades para cada sabor u opción',
      selectType: 'MULTIPLE',
      pricingRole: 'ADDON',
      options: normalizedOptions,
      items: normalizedOptions
    }];
  }, [product]);

  const hasVariants = useMemo(() => {
    return Boolean(
      availableGroups &&
      availableGroups.length > 0 &&
      availableGroups.some((g: any) => Array.isArray(g.options) && g.options.length > 0)
    );
  }, [availableGroups]);

  // Cantidad base de ranuras si es combo
  const baseSlotCount = useMemo(() => {
    if (!product) return 1;
    if (typeof product.slotsCount === 'number') return product.slotsCount;
    if (typeof product.comboCount === 'number') return product.comboCount;
    if (Array.isArray(product.slots) && product.slots.length > 0) return product.slots.length;

    const nameMatch = product.name?.match(/combo\s*(\d+)/i);
    if (nameMatch && nameMatch[1]) {
      const n = parseInt(nameMatch[1], 10);
      if (!isNaN(n) && n > 0 && n <= 50) return n;
    }
    const descMatch = (product.desc || product.description)?.match(/(\d+)\s*(perros|hamburguesas|piezas|unidades|items|und|personas|helados)/i);
    if (descMatch && descMatch[1]) {
      const n = parseInt(descMatch[1], 10);
      if (!isNaN(n) && n > 0 && n <= 50) return n;
    }
    return isCombo ? 5 : 1;
  }, [product, isCombo]);

  // Ranuras/personalización por unidad (2026-09-22, corregido): el criterio ya NO es el nicho de la tienda
  // (`isFoodNiche`, revertido) sino si el producto en sí trae un grupo de exclusiones tipo "SIN" (backend real:
  // { name: "SIN", items: [{ title: "SIN TOCINETA" }, ...] }, ver product/{id}/web). Sin ese grupo —cualquier
  // nicho, incluidas heladerías o combos sin exclusiones— las ranuras quedan completamente ocultas.
  const hasSinVariant = useMemo(
    () => availableGroups.some((g: any) => /\bsin\b/i.test(String(g?.name || g?.title || g?.label || ''))),
    [availableGroups]
  );

  const [isSlotCustomizationActive, setIsSlotCustomizationActive] = useState<boolean>(false);
  const isSlotMode = isSlotCustomizationActive && (isCombo || qty > 1);
  // Nombre visible de cada unidad: el del producto ("Perro Sencillo #1"), nunca la palabra genérica "Ranura"
  const unitLabel = product?.name || 'Unidad';

  const targetSlotCount = useMemo(() => {
    if (isCombo) return baseSlotCount * qty;
    return qty;
  }, [isCombo, baseSlotCount, qty]);

  const [slots, setSlots] = useState<ComboSlot[]>([]);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);

  const createInitialSlot = (idx: number, existing?: Partial<ComboSlot>): ComboSlot => {
    const initialVars: Record<string | number, any> = {};
    availableGroups.forEach((g: any, gIndex: number) => {
      if (g.options && g.options.length > 0) {
        initialVars[gIndex] = g.options.map((opt: any) => ({
          ...opt,
          count: 0
        }));
      }
    });

    return {
      id: idx + 1,
      name: existing?.name || '',
      selectedVariants: existing?.selectedVariants || initialVars,
      exclusions: existing?.exclusions || []
    };
  };

  useEffect(() => {
    if (product && isOpen) {
      setStep(1);
      setQty(startQty);
      setSelectedExclusions([]);
      setIsSlotCustomizationActive(false);
      setActiveSlotIndex(0);
      setUpsellSelections({});
      setProductNote('');

      const initialVars: Record<string, any> = {};
      if (availableGroups.length > 0) {
        availableGroups.forEach((group: any, idx: number) => {
          if (group.options?.length > 0) {
            initialVars[idx] = group.options.map((opt: any) => ({
              ...opt,
              count: 0
            }));
          }
        });
      }
      setSelectedVariants(initialVars);

      const count = isCombo ? baseSlotCount : 1;
      const initialSlots: ComboSlot[] = [];
      for (let i = 0; i < count; i++) {
        initialSlots.push(createInitialSlot(i));
      }
      setSlots(initialSlots);
    }
  }, [product?.id, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else {
      document.body.style.overflow = 'unset';
      // Limpiar sala colaborativa al cerrar el modal
      if (comboPollingRef.current) clearInterval(comboPollingRef.current);
      setComboRoomId(null);
      setComboRoomData(null);
        setViewMode('options');
      setShowComboPanel(false);
      setComboCreating(false);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setSlots(prev => {
      if (prev.length === targetSlotCount) return prev;
      if (prev.length < targetSlotCount) {
        const expanded = [...prev];
        for (let i = prev.length; i < targetSlotCount; i++) {
          expanded.push(createInitialSlot(i));
        }
        return expanded;
      }
      return prev.slice(0, targetSlotCount);
    });

    if (activeSlotIndex >= targetSlotCount) {
      setActiveSlotIndex(Math.max(0, targetSlotCount - 1));
    }
  }, [targetSlotCount, isOpen]);

  // Modificador de cantidad para opciones con contadores (+ / -) en ranura activa
  // Casillas dentro de una ranura (grupos CHECKIN): alterna 0/1 por opción respetando maxItems del grupo
  const handleSlotCheckboxToggle = (slotIndex: number, groupIdx: number, optionCode: string) => {
    setSlots(prev => {
      const copy = [...prev];
      const slot = copy[slotIndex];
      if (!slot) return prev;
      const grp = availableGroups[groupIdx];
      const options = grp?.options || [];
      const currentSel = slot.selectedVariants[groupIdx];
      const current: any[] = Array.isArray(currentSel) && currentSel.length > 0 ? currentSel : options.map((o: any) => ({ ...o, count: 0 }));
      const max = Number(grp?.maxItems || grp?.max || 0);
      const isTarget = (i: any) => i.code === optionCode || i.id === optionCode;
      const turningOn = !current.some((i: any) => isTarget(i) && (i.count || 0) > 0);
      const selectedCount = current.filter((i: any) => (i.count || 0) > 0).length;
      if (turningOn && max > 0 && selectedCount >= max) return prev;
      copy[slotIndex] = {
        ...slot,
        selectedVariants: {
          ...slot.selectedVariants,
          [groupIdx]: current.map((i: any) => (isTarget(i) ? { ...i, count: turningOn ? 1 : 0 } : i))
        }
      };
      return copy;
    });
  };

  const handleSlotOptionQuantityChange = (groupIdx: number | string, optionCode: string, delta: number, syntheticOpt?: any) => {
    setSlots(prev => {
      const copy = [...prev];
      if (!copy[activeSlotIndex]) return prev;

      const currentGroupSelection = copy[activeSlotIndex].selectedVariants[groupIdx];
      let updatedList = Array.isArray(currentGroupSelection) ? [...currentGroupSelection] : [];

      // Si la lista está vacía, la poblamos desde availableGroups
      if (updatedList.length === 0) {
          const grp = typeof groupIdx === 'number' ? availableGroups[groupIdx] : null;
          if (grp && grp.options) {
            updatedList = grp.options.map((o: any) => ({ ...o, count: o.code === optionCode || o.id === optionCode ? Math.max(0, delta) : 0 }));
          } else if (syntheticOpt) {
            updatedList = [{ ...syntheticOpt, count: Math.max(0, delta) }];
          }
        } else {
        updatedList = updatedList.map(item => {
          if (item.code === optionCode || item.id === optionCode) {
            const newCount = Math.max(0, (item.count || 0) + delta);
            return { ...item, count: newCount };
          }
          return item;
        });
      }

      copy[activeSlotIndex] = {
        ...copy[activeSlotIndex],
        selectedVariants: {
          ...copy[activeSlotIndex].selectedVariants,
          [groupIdx]: updatedList
        }
      };
      return copy;
    });
  };

  const toggleSlotExclusion = (exc: string) => {
    setSlots(prev => {
      const copy = [...prev];
      if (!copy[activeSlotIndex]) return prev;
      const current = copy[activeSlotIndex].exclusions || [];
      const updated = current.includes(exc)
        ? current.filter(i => i !== exc)
        : [...current, exc];
      copy[activeSlotIndex] = {
        ...copy[activeSlotIndex],
        exclusions: updated
      };
      return copy;
    });
  };

  const handleSlotNameChange = (name: string) => {
    setSlots(prev => {
      const copy = [...prev];
      if (!copy[activeSlotIndex]) return prev;
      copy[activeSlotIndex] = {
        ...copy[activeSlotIndex],
        name: name
      };
      return copy;
    });
  };

  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const copyCurrentSlotToAll = () => {
    const current = slots[activeSlotIndex];
    if (!current) return;
    setSlots(prev => prev.map(s => ({
      ...s,
      selectedVariants: { ...current.selectedVariants },
      exclusions: [...current.exclusions]
    })));
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 1800);
  };

  const resetCurrentSlotToConTodo = () => {
    setSlots(prev => {
      const copy = [...prev];
      if (!copy[activeSlotIndex]) return prev;
      copy[activeSlotIndex] = {
        ...copy[activeSlotIndex],
        exclusions: []
      };
      return copy;
    });
  };

  const toggleExclusion = (exc: string) => {
    setSelectedExclusions(prev =>
      prev.includes(exc) ? prev.filter(i => i !== exc) : [...prev, exc]
    );
  };

  // Manejador de cantidad para el modo estándar global
  const handleGlobalOptionQuantityChange = (groupIdx: number, optionCode: string, delta: number) => {
    setSelectedVariants(prev => {
      const currentGroup = prev[groupIdx];
      let updatedList = Array.isArray(currentGroup) ? [...currentGroup] : [];

      if (updatedList.length === 0) {
        const grp = availableGroups[groupIdx];
        if (grp && grp.options) {
          updatedList = grp.options.map((o: any) => ({ ...o, count: o.code === optionCode ? Math.max(0, delta) : 0 }));
        }
      } else {
        updatedList = updatedList.map(item => {
          if (item.code === optionCode || item.id === optionCode) {
            const newCount = Math.max(0, (item.count || 0) + delta);
            return { ...item, count: newCount };
          }
          return item;
        });
      }

      return { ...prev, [groupIdx]: updatedList };
    });
  };

  // Casillas (grupos CHECKIN, ej. "SIN"): alterna 0/1 por opción respetando maxItems del grupo (el mínimo lo valida isMinimumsMet)
  const handleGlobalCheckboxToggle = (groupIdx: number, optionCode: string) => {
    setSelectedVariants(prev => {
      const grp = availableGroups[groupIdx];
      const options = grp?.options || [];
      const current: any[] = Array.isArray(prev[groupIdx]) ? prev[groupIdx] : options.map((o: any) => ({ ...o, count: 0 }));
      const max = Number(grp?.maxItems || grp?.max || 0);
      const isTarget = (i: any) => i.code === optionCode || i.id === optionCode;
      const turningOn = !current.some((i: any) => isTarget(i) && (i.count || 0) > 0);
      const selectedCount = current.filter((i: any) => (i.count || 0) > 0).length;
      if (turningOn && max > 0 && selectedCount >= max) return prev;
      return { ...prev, [groupIdx]: current.map((i: any) => (isTarget(i) ? { ...i, count: turningOn ? 1 : 0 } : i)) };
    });
  };

  // Selección única para grupos SINGLE (ej. Tamaño): marca la opción elegida y desmarca el resto
  const handleGlobalSingleSelect = (groupIdx: number, optionCode: string) => {
    setSelectedVariants(prev => {
      const grp = availableGroups[groupIdx];
      const options = grp?.options || [];
      const updatedList = options.map((o: any) => ({
        ...o,
        count: (o.code === optionCode || o.id === optionCode) ? 1 : 0
      }));
      return { ...prev, [groupIdx]: updatedList };
    });
  };

  const toggleUpsell = (upsellItem: any) => {
    setUpsellSelections(prev => {
      const copy = { ...prev };
      if (copy[upsellItem.code]) delete copy[upsellItem.code];
      else copy[upsellItem.code] = upsellItem;
      return copy;
    });
  };

  // Cálculo de Precios reactivo con soporte para conteos
  const { unitPrice, totalVariantsPrice, totalSlotVariantsPrice, totalUpsells } = useMemo(() => {
    // Precio BASE (metadata.price.basePrice) es transaccional y se suma de entrada.
    // Precio INFO (metadata.price.infoPrice) es solo referencial: el acumulador arranca en $0.
    const priceMeta = product?.metadata?.price;
    let base: number;
    if (priceMeta?.basePrice !== undefined && priceMeta?.basePrice !== null) {
      base = Number(priceMeta.basePrice);
    } else if (priceMeta?.infoPrice !== undefined && priceMeta?.infoPrice !== null) {
      base = 0;
    } else {
      base = product?.price || 0;
    }
    let standardVariantsExtra = 0;
    let slotVariantsExtra = 0;
    let upsellsExtra = 0;

    if (!isSlotMode) {
      Object.keys(selectedVariants).forEach(key => {
        const selection = selectedVariants[key];
        if (!selection) return;
        const isBaseGroup = availableGroups[Number(key)]?.pricingRole === 'BASE';
        if (Array.isArray(selection)) {
          selection.forEach(item => {
            if ((item.count || 0) > 0 && (item.price || 0) > 0 && item.affects !== 'CAMBIA') {
              standardVariantsExtra += isBaseGroup ? (item.price - base) : (item.price * item.count);
            }
          });
        } else if (selection.price > 0) {
          standardVariantsExtra += isBaseGroup ? (selection.price - base) : selection.price;
        }
      });
    } else {
      const targetSlots = slots; targetSlots.forEach((slot: any) => {
        Object.entries(slot.selectedVariants).forEach(([groupIdx, selection]: [string, any]) => {
          if (!selection) return;
          const isBaseGroup = availableGroups[Number(groupIdx)]?.pricingRole === 'BASE';
          if (Array.isArray(selection)) {
            selection.forEach(item => {
              if ((item.count || 0) > 0 && (item.price || 0) > 0 && item.affects !== 'CAMBIA') {
                slotVariantsExtra += isBaseGroup ? (item.price - base) : (item.price * item.count);
              }
            });
          } else if (selection.price > 0 && selection.affects !== 'CAMBIA') {
            slotVariantsExtra += isBaseGroup ? (selection.price - base) : selection.price;
          }
        });
      });
    }

    Object.values(upsellSelections).forEach(upsell => {
      upsellsExtra += (upsell.price || 0);
    });

    return {
      unitPrice: base,
      totalVariantsPrice: standardVariantsExtra,
      totalSlotVariantsPrice: slotVariantsExtra,
      totalUpsells: upsellsExtra
    };
  }, [product, selectedVariants, slots, isSlotMode, upsellSelections, availableGroups, showComboPanel, comboRoomData]);

  const totalCalculated = useMemo(() => {
    if (isSlotMode) {
      return (unitPrice * qty) + totalSlotVariantsPrice + totalUpsells;
    }
    return ((unitPrice + totalVariantsPrice) * qty) + totalUpsells;
  }, [isSlotMode, unitPrice, qty, totalSlotVariantsPrice, totalVariantsPrice, totalUpsells]);

  // Valida que cada grupo con 'min' (ej. SABORES-6 → min:6) o requerido tenga esa cantidad de unidades seleccionadas
  const isMinimumsMet = useMemo(() => {
    if (isSlotMode) return true;
    if (!availableGroups || availableGroups.length === 0) return true;
    return availableGroups.every((group: any, gIdx: number) => {
      const min = group.minItems ?? group.min ?? (group.required ? 1 : (group.selectType === 'SINGLE' && group.pricingRole === 'BASE' ? 1 : 0));
      if (min <= 0) return true;
      const selection = selectedVariants[gIdx];
      const totalCount = Array.isArray(selection)
        ? selection.reduce((sum: number, item: any) => sum + (item.count || 0), 0)
        : 0;
      return totalCount >= min;
    });
  }, [availableGroups, selectedVariants, isSlotMode]);

  const handleNextStep = () => {
    if (!isMinimumsMet) return;
    // TEMPORAL: se apaga el paso de Upsells (step 2) para priorizar el flujo de selección de sabores/tamaños
    handleAddToCart();
  };

  // `proceedToCheckout === true` (solo el CTA "Proceder al Pago y Despacho" de la sala colaborativa) le pide a la
  // tienda abrir el carrito de inmediato tras agregar el combo; los demás disparadores (onClick) pasan un evento y
  // no cuentan, así el resto del flujo sigue agregando sin abrir el carrito.
  const handleAddToCart = (proceedToCheckout: boolean | React.MouseEvent = false) => {
    if (!product) return;
    const breakdown: string[] = [];

    if (viewMode === 'comboRoom' && comboRoomData) {
        let totalCartPrice = 0;
        breakdown.push(`------- PEDIDO ENTRE PANAS: ${comboRoomData.productName.toUpperCase()} -------`);
        
        comboRoomData.participants.forEach((p: any) => {
          totalCartPrice += p.subtotalUsd;
          breakdown.push(`• ${String(p.name || 'INVITADO').toUpperCase()} (${p.unitsCount} Unidades)`);
          
          // Invitado con varias unidades: una entrada por unidad para la cocina (alias, exclusiones, extras y nota propios)
          const hasUnits = Array.isArray(p.units) && p.units.length > 1;
          if (hasUnits) {
            p.units.forEach((u: any, i: number) => {
              breakdown.push(`  - #${i + 1}${u.unitName ? ` (${u.unitName})` : ''}: ${u.exclusions?.length > 0 ? u.exclusions.map(formatSin).join(', ') : 'Sale con todo'}`);
              (u.addons || []).forEach((a: any) => breakdown.push(`    + ${a.count > 1 ? a.count + 'x ' : ''}${a.name}`));
              const unitNote = cleanKitchenNote(u.note || '');
              if (unitNote) breakdown.push(`    >> NOTA: ${unitNote}`);
            });
          } else if (p.exclusions && p.exclusions.length > 0) {
            p.exclusions.forEach((e: string) => {
              breakdown.push(`  - ${e.toUpperCase().startsWith('SIN ') ? e : `Sin ${e}`}`);
            });
          }
          
          let hasExtras = hasUnits;
          if (!hasUnits) Object.values(p.selectedVariants || {}).forEach((sel: any) => {
             if (Array.isArray(sel)) {
               sel.forEach((item: any) => {
                 if ((item.count || 0) > 0) {
                    breakdown.push(`  - ${item.count > 1 ? item.count + 'x ' : ''}${item.name}`);
                    hasExtras = true;
                 }
               });
             } else if (sel.name) {
               breakdown.push(`  - ${sel.name}`);
               hasExtras = true;
             }
          });
          
          if ((!p.exclusions || p.exclusions.length === 0) && !hasExtras) {
            breakdown.push(`  - Sale con todo`);
          }

          // Sugerencias para la cocina de este participante (una por unidad, ya saneadas en la sala)
          (Array.isArray(p.notes) ? p.notes : []).forEach((n: string) => {
            const clean = cleanKitchenNote(n);
            if (clean) breakdown.push(`  >> NOTA: ${clean}`);
          });
        });
      // Estructura contractual (DOCUMENTO_TECNICO §2): los adicionales con precio viajan como `variants` + `pricing` y las
      // sugerencias de cocina en `comments`. Las variantes son por unidad, así que solo se pueden representar con qty === 1;
      // con más de un combo el ítem sigue viajando sin estructurar (mismo comportamiento de antes; ver AGENTS.md).
      const roomGroups = new Map<string, any>();
      let roomAddonsAll = 0;
      comboRoomData.participants.forEach((p: any) => {
        const list: any[] = Array.isArray(p.selectedVariants?.addons) ? p.selectedVariants.addons : [];
        list.forEach((it: any) => {
          const unitP = Number(it.price || 0);
          const cnt = Number(it.count || 0);
          if (!(unitP > 0) || !(cnt > 0)) return;
          roomAddonsAll += unitP * cnt;
          const gCode = String(it.groupCode ?? 'ADDONS');
          const g = roomGroups.get(gCode) || { name: it.groupName || 'Adicionales', code: gCode, type: it.groupType || 'MULTIPLE', items: [] as any[] };
          const ex = g.items.find((x: any) => x.code === it.code);
          if (ex) { ex.quantity += cnt; ex.totalPrice += unitP * cnt; }
          else g.items.push({ code: it.code, title: it.name, quantity: cnt, unitPrice: unitP, totalPrice: unitP * cnt });
          roomGroups.set(gCode, g);
        });
      });
      const roomComments = comboRoomData.participants
        .map((p: any) => {
          const ns = (Array.isArray(p.notes) ? p.notes : []).map((n: string) => cleanKitchenNote(n)).filter(Boolean);
          // Invitado con varias unidades: "Nena: #1 (Nena): Con todo | #2 (Carlitos): Sin salsa roja, Sin papita"
          const unitsStr = Array.isArray(p.units) && p.units.length > 1
            ? p.units.map((u: any, i: number) => `#${i + 1}${u.unitName ? ` (${u.unitName})` : ''}: ${u.exclusions?.length > 0 ? u.exclusions.map(formatSin).join(', ') : 'Con todo'}${cleanKitchenNote(u.note || '') ? ` • Nota: ${cleanKitchenNote(u.note)}` : ''}`).join(' | ')
            : '';
          const joined = unitsStr || ns.join(' / ');
          return joined ? `${String(p.name || 'INVITADO')}: ${joined}` : '';
        })
        .filter(Boolean)
        .join(' | ');
      // Beneficiario de cada adicional con costo, para el Recibo: unidad con alias > nombre del invitado > "Anfitrión".
      // Un invitado con varias unidades aporta sus adicionales por unidad; los demás, su lista consolidada (mismos
      // adicionales que ya suman en `roomAddonsAll`, así que el desglose cuadra con `pricing.addonsTotal`).
      const roomExtras: { name: string; participant: string; price: number }[] = [];
      const pushExtra = (a: any, who: string) => {
        const unit = Number(a?.price || 0);
        const cnt = Number(a?.count || 0);
        if (!(unit > 0) || !(cnt > 0)) return;
        roomExtras.push({ name: `${cnt > 1 ? cnt + 'x ' : ''}${String(a.name || 'Adicional')}`, participant: who, price: Math.round(unit * cnt * 100) / 100 });
      };
      comboRoomData.participants.forEach((p: any) => {
        const owner = p.isHost ? 'Anfitrión' : String(p.name || 'Invitado');
        if (Array.isArray(p.units) && p.units.length > 1) {
          p.units.forEach((u: any) => (u.addons || []).forEach((a: any) => pushExtra(a, String(u.unitName || '').trim() || owner)));
        } else {
          (Array.isArray(p.selectedVariants?.addons) ? p.selectedVariants.addons : []).forEach((a: any) => pushExtra(a, owner));
        }
      });
      const roomStructured = qty === 1 && roomGroups.size > 0;
      const round2 = (n: number) => Math.round(n * 100) / 100;

      onAddToCart({
        // Código real del backend (igual que el flujo normal); el id solo como último recurso
        productCode: String(product.code || product.id),
        productName: product.name,
        qty: qty,
        quantity: qty,
        totalPrice: totalCartPrice,
        totalUSD: totalCartPrice,
        summaryText: breakdown.join(' | '),
        breakdown: breakdown,
        variants: roomStructured ? Array.from(roomGroups.values()) : undefined,
        pricing: roomStructured ? { unitBasePrice: round2(totalCartPrice - roomAddonsAll), addonsTotal: round2(roomAddonsAll), unitFinalPrice: round2(totalCartPrice) } : undefined,
        notes: roomComments || undefined,
        extrasByPerson: roomExtras.length > 0 ? roomExtras : undefined,
        proceedToCheckout: proceedToCheckout === true
      });
      if (typeof window !== 'undefined') window.localStorage.removeItem('duna_pedido_amigos_active');
      window.localStorage.removeItem('active_combo_host');
      onClose();
      return;
    }

    const activeSlots = slots;

    if (isSlotMode) {
      if (isCombo) {
        breakdown.push(`Combo: ${product.name} (${activeSlots.length} unidades)`);
      } else {
        breakdown.push(`Personalización por unidad (${activeSlots.length} unidades)`);
      }

      const comboSku = product.sku || product.code ? ` (${product.sku || product.code})` : '';
        breakdown.push(`------- ${(product.name || 'PEDIDO').toUpperCase()}${comboSku} -------`);
        activeSlots.forEach((slot, idx) => {
            const slotTitle = slot.name?.trim() || '';
            const slotHeader = `• #${idx + 1}${slotTitle ? ` (${slotTitle})` : ''}`;
            const exclusionsParts: string[] = [];
            const extrasParts: string[] = [];
  
            if (slot.exclusions && slot.exclusions.length > 0) {
              slot.exclusions.forEach((ex: string) => {
                exclusionsParts.push(ex.toUpperCase().startsWith('SIN ') ? ex : `Sin ${ex}`);
              });
            }
  
            Object.values(slot.selectedVariants).forEach((sel: any) => {
              if (!sel) return;
              if (Array.isArray(sel)) {
                sel.forEach(item => {
                  if ((item.count || 0) > 0) {
                    if (/^sin\b/i.test(String(item.name || '').trim())) {
                      exclusionsParts.push(String(item.name).trim());
                    } else {
                      const qtyPrefix = item.count > 1 ? `${item.count}x ` : '';
                      const skuPart = item.sku || item.code ? `[${item.sku || item.code}] ` : '';
                      const pricePart = item.price > 0 ? ` (+${item.price.toFixed(2)})` : '';
                      extrasParts.push(`>> EXTRA: ${skuPart}${qtyPrefix}${item.name}${pricePart}`);
                    }
                  }
                });
              } else if (sel.name) {
                 const skuPart = sel.sku || sel.code ? `[${sel.sku || sel.code}] ` : '';
                 const pricePart = sel.price > 0 ? ` (+${sel.price.toFixed(2)})` : '';
                 extrasParts.push(`>> EXTRA: ${skuPart}${sel.name}${pricePart}`);
              }
            });
  
            let line = slotHeader + ': ';
            if (exclusionsParts.length === 0) {
              line += 'Con todo';
            } else {
              line += exclusionsParts.join(', ');
            }
            breakdown.push(line);
            
            if (extrasParts.length > 0) {
               extrasParts.forEach(extraLine => breakdown.push(`  ${extraLine}`));
            }

            // Sugerencia para la cocina de esta unidad (sin paréntesis: ver cleanKitchenNote)
            const slotNote = cleanKitchenNote(slot.notes || '');
            if (slotNote) breakdown.push(`  >> NOTA: ${slotNote}`);
        });
      } else {
        Object.keys(selectedVariants).forEach(key => {
        const sel = selectedVariants[key];
        if (Array.isArray(sel)) {
          sel.forEach(item => {
            if ((item.count || 0) > 0) {
              breakdown.push(`${item.count}x ${item.name}`);
            }
          });
        } else if (sel && sel.name) {
          breakdown.push(`Selección: ${sel.name}`);
        }
      });

      if (selectedExclusions.length > 0) {
        breakdown.push(`Firma D'una: ${selectedExclusions.map(e => e.toUpperCase().startsWith('SIN ') ? e : 'Sin ' + e).join(', ')}`);
      }
    }

    Object.values(upsellSelections).forEach(up => {
      breakdown.push(`+ ${up.name} ($${up.price.toFixed(2)})`);
    });

    // Producto simple individual: la sugerencia viaja en el desglose (Comanda POS) y como `notes` del ítem
    const simpleNote = !isSlotMode ? cleanKitchenNote(productNote) : '';
    if (simpleNote) breakdown.push(`Nota: ${simpleNote}`);
    // Personalización por unidad (sin sala): las notas de cada ranura se resumen en `comments`
    const slotComments = isSlotMode
      ? activeSlots.map((s, i) => {
          const n = cleanKitchenNote(s.notes || '');
          if (!n) return '';
          const t = s.name?.trim();
          return `#${i + 1}${t ? ` (${t})` : ''}: ${n}`;
        }).filter(Boolean).join(' | ')
      : '';

    // Estructura de variantes para el backend (pricingRole BASE reemplaza el precio, ADDON se suma)
    let unitBasePrice = product.price || 0;
    let addonsTotal = 0;
    const variantsPayload: any[] = [];

    if (!isSlotMode) {
      availableGroups.forEach((group: any, gIdx: number) => {
        const selection = selectedVariants[gIdx];
        const chosenItems = Array.isArray(selection) ? selection.filter((i: any) => (i.count || 0) > 0) : [];
        if (chosenItems.length === 0) return;

        if (group.pricingRole === 'BASE') {
          const chosen = chosenItems[0];
          unitBasePrice = chosen.price;
          variantsPayload.push({
            name: group.name || group.title,
            code: group.code,
            type: group.selectType || 'SINGLE',
            selected: { code: chosen.code || chosen.id, title: chosen.name || chosen.title, unitPrice: chosen.price }
          });
        } else {
          const items = chosenItems.map((i: any) => ({
            title: i.name || i.title,
            code: i.code || i.id,
            quantity: i.count,
            unitPrice: i.price,
            totalPrice: (i.price || 0) * i.count
          }));
          addonsTotal += items.reduce((sum: number, it: any) => sum + it.totalPrice, 0);
          variantsPayload.push({
            name: group.name || group.title,
            code: group.code,
            type: isCheckinGroup(group) ? 'CHECKIN' : (group.selectType || 'MULTIPLE'),
            items
          });
        }
      });
    }

    const unitFinalPrice = unitBasePrice + addonsTotal;

    onAddToCart({
      productCode: product.code,
      productName: product.name,
      totalPrice: totalCalculated,
      totalUSD: totalCalculated,
      qty: qty,
      quantity: qty,
      summaryText: breakdown.join(' | '),
      breakdown: breakdown,
      slots: isSlotMode ? slots : undefined,
      variants: isSlotMode ? undefined : variantsPayload,
      pricing: isSlotMode ? undefined : { unitBasePrice, addonsTotal, unitFinalPrice },
      notes: simpleNote || slotComments || undefined
    });
    // Marcar sala colaborativa como completada y limpiar barra flotante
    if (comboRoomId && typeof window !== 'undefined') {
      window.localStorage.removeItem('duna_pedido_amigos_active');
      window.localStorage.removeItem('active_combo_host');
    }
    onClose();
  };

  // Barrido anti-demo (2026-09-22): antes esta función devolvía upsells 100% inventados por nicho ("Ración de
  // Papas Fritas" código UP-FRIES, etc.) — productos que no existen en el catálogo real del backend, con códigos
  // que el backend rechazaría si llegaran a un pedido real. Se elimina esa data ficticia por completo: la
  // plataforma solo debe ofrecer venta cruzada si viene de datos reales (p. ej. `product.upsells`/
  // `product.metadata.upsells` del backend, el día que exista ese campo). Hasta entonces, sin upsells reales,
  // `currentUpsells` queda vacío y las dos secciones que lo consumen abajo (`currentUpsells.length > 0`) ya no
  // renderizan nada — sin espacios en blanco ni pasos rotos.
  const currentUpsells: { code: string; name: string; price: number; icon?: string }[] = [];

  // ── Helpers del Pedido Colaborativo ────────────────────────────────────────
  const hostBaseTotal = ((totalCalculated - totalUpsells) / ((baseSlotCount > 1 ? baseSlotCount : 1) * qty)) * hostSetupUnits;
  const hostAddonsTotal = slots.slice(0, hostSetupUnits).reduce((sum, slot) => {
    let slotExtra = 0;
    Object.values(slot.selectedVariants).forEach((selection: any) => {
      if (!selection) return;
      if (Array.isArray(selection)) {
        selection.forEach(item => { if ((item.count || 0) > 0 && (item.price || 0) > 0) slotExtra += item.price * item.count; });
      } else if (selection.price > 0) {
        slotExtra += selection.price;
      }
    });
    return sum + slotExtra;
  }, 0);
  const hostTotalUSD = hostBaseTotal + hostAddonsTotal;
  const hostTotalBS = hostTotalUSD * (bcvRate || 0);

  // Nombre corto de la unidad para los botones ("Personalizar mi perro"): primera palabra del producto, en minúscula
  const unitNoun = (String(product?.name || '').trim().split(/\s+/)[0] || 'pedido').toLowerCase();
  // Unidades del anfitrión ya reclamadas en la sala (si aún no hay sala, las del setup)
  const hostRoomUnits: number = comboRoomData?.participants?.find((p: any) => p.isHost)?.unitsCount || hostSetupUnits;
  // Cuántas unidades recorre la vista de personalización según de dónde se abrió
  const slotViewUnits = slotReturnView === 'host_setup' ? hostSetupUnits : slotReturnView === 'comboRoom' ? hostRoomUnits : slots.length;

  // Resume lo elegido por el anfitrión en sus primeras `units` ranuras al formato que guarda la sala (mismo que el
  // invitado): exclusiones sueltas + lista de opciones con cantidad y el monto extra en USD (solo opciones con precio).
  const buildHostClaim = (units: number) => {
    const exclusions: string[] = [];
    const merged = new Map<string, any>();
    const notes: string[] = [];
    let addonsUsd = 0;
    slots.slice(0, units).forEach((slot, i) => {
      const note = cleanKitchenNote(slot.notes || '');
      if (note) notes.push(units > 1 ? `U${i + 1}: ${note}` : note);
      (slot.exclusions || []).forEach((e: string) => { if (!exclusions.includes(e)) exclusions.push(e); });
      Object.entries(slot.selectedVariants || {}).forEach(([gKey, sel]: [string, any]) => {
        const grp: any = availableGroups[Number(gKey)];
        const list: any[] = Array.isArray(sel) ? sel : (sel && sel.name ? [{ ...sel, count: 1 }] : []);
        list.forEach((it: any) => {
          const count = it.count || 0;
          if (count <= 0) return;
          const price = Number(it.price || 0);
          const key = String(it.code ?? it.id ?? it.name);
          const prev = merged.get(key);
          // Se conserva el grupo real del backend (nombre/código/tipo) para poder estructurar `variants` al pasar a caja
          merged.set(key, {
            name: it.name, code: it.code ?? it.id, price, count: (prev?.count || 0) + count,
            groupName: grp?.name || grp?.title, groupCode: grp?.code, groupType: grp ? (isCheckinGroup(grp) ? "CHECKIN" : (grp.selectType || "MULTIPLE")) : undefined,
          });
          addonsUsd += price * count;
        });
      });
    });
    const addons = Array.from(merged.values());
    return { exclusions, selectedVariants: addons.length > 0 ? { addons } : {}, addonsUsd: Math.round(addonsUsd * 100) / 100, notes };
  };

  // Desde el Monitor en Vivo: el anfitrión personaliza SUS unidades sin salir de la sala
  const openHostCustomization = () => {
    setHostSaveError(null);
    setActiveSlotIndex(0);
    setSlotReturnView('comboRoom');
    setViewMode('slots');
  };

  // Botón final de la personalización del anfitrión: guarda y vuelve al hub (setup o monitor), nunca a la compra individual
  const saveAndReturnToRoom = async () => {
    setHostSaveError(null);
    if (slotReturnView === 'comboRoom' && comboRoomId) {
      setHostSaving(true);
      try {
        const claim = buildHostClaim(hostRoomUnits);
        const res = await fetch(`/api/combo/${comboRoomId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantId: 'host', exclusions: claim.exclusions, selectedVariants: claim.selectedVariants, addonsUsd: claim.addonsUsd, notes: claim.notes }),
        });
        const data = await res.json();
        if (!data.ok) { setHostSaveError(data.error || 'No se pudo guardar. Intenta de nuevo.'); return; }
        setComboRoomData(data.room);
      } catch {
        setHostSaveError('Error de red. Intenta de nuevo.');
        return;
      } finally {
        setHostSaving(false);
      }
      setViewMode('comboRoom');
      return;
    }
    setViewMode(slotReturnView === 'options' ? 'options' : 'host_setup');
  };

  const createComboRoom = async () => {
    if (!product) return;
    setComboCreating(true);
    try {
      const hostClaim = buildHostClaim(hostSetupUnits);
      const tempId = "new";
      const totalUnits = (baseSlotCount > 1 ? baseSlotCount : 1) * qty;
      const unitPriceUsd = totalCalculated / totalUnits;
      
      const res = await fetch(`/api/combo/${tempId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id || product.code || tempId,
          productName: product.name || 'Producto',
          storeName: store?.name || '',
          storeCode: store?.code || '',
          storeId: store?.id,
          totalUnits,
          unitPriceUsd,
          hostName: 'Anfitrión',
          hostUnitsCount: hostSetupUnits,
          hostSelectedVariants: hostClaim.selectedVariants,
          hostExclusions: hostClaim.exclusions,
          hostAddonsUsd: hostClaim.addonsUsd,
          hostNotes: hostClaim.notes,
          paymentMode: hostPaymentMode,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        const finalRoomId = data.room.id;
        setComboRoomId(finalRoomId);
        setComboRoomData(data.room);
        setShowComboPanel(true);
        setViewMode('comboRoom');
        
        // OPEN WHATSAPP
        const hostUrl = window.location.origin + '/combo/' + finalRoomId;
        const msg = "¡Pilas panas! Entren a este link para armar el combo en D'una: " + hostUrl;
        if (typeof window !== 'undefined') window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(msg), '_blank');
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('duna_pedido_amigos_active', JSON.stringify({
            roomId: finalRoomId,
            storeSlug: store?.code || '',
            storeName: store?.name || '',
            productName: product?.name || '',
            productId: product?.id ?? product?.code ?? '',
            isHost: true,
            createdAt: Date.now(),
            status: 'ACTIVE',
          }));
          // Sesión del anfitrión (rescate tras salir al catálogo o refrescar): la barra flotante lo identifica como Anfitrión
          window.localStorage.setItem('active_combo_host', JSON.stringify({ roomId: finalRoomId, comboId: product?.id ?? product?.code ?? '', storeId: store?.id ?? '' }));
        }
        if (comboPollingRef.current) clearInterval(comboPollingRef.current);
        comboPollingRef.current = setInterval(async () => {
          try {
            const pr = await fetch(`/api/combo/${finalRoomId}`);
            const pd = await pr.json();
            if (pd.ok) setComboRoomData(pd.room);
          } catch { /* silent */ }
        }, 2000);
      }
    } catch { /* silent */ } finally {
      setComboCreating(false);
    }
  };

  const comboLink = comboRoomId
    ? (typeof window !== 'undefined' ? `${window.location.origin}/combo/${comboRoomId}` : `/combo/${comboRoomId}`)
    : '';

  const comboAllDone = comboRoomData && comboRoomData.claimedUnits >= comboRoomData.totalUnits;

  // En la sala colaborativa el total real es la suma de lo reclamado por cada participante (incluye adicionales de los
  // invitados), que es exactamente lo que `handleAddToCart` envía al carrito; fuera de la sala, el total de siempre.
  const footerTotalUSD = viewMode === 'comboRoom' && comboRoomData
    ? comboRoomData.participants.reduce((sum: number, p: any) => sum + Number(p.subtotalUsd || 0), 0)
    : totalCalculated;

  // ── Faro guiado reactivo (Visual Beacon Flow) ─────────────────────────────────────────────────────────────────────
  // Resalta con un pulso breve (máx. 2.5 s, se apaga solo) el siguiente paso natural del flujo colaborativo y hace
  // scroll suave hacia él. React nativo + Tailwind: sin librerías. IMPORTANTE: estos hooks van ANTES del return null.
  const [activeBeacon, setActiveBeacon] = useState<"options" | "hostCustomize" | "shareWhatsApp" | "proceed" | null>(null);
  const beaconTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevViewModeRef = React.useRef(viewMode);
  const modeOptionsRef = React.useRef<HTMLDivElement>(null);
  const hostCardRef = React.useRef<HTMLDivElement>(null);
  const launchBtnRef = React.useRef<HTMLButtonElement>(null);
  const proceedBtnRef = React.useRef<HTMLButtonElement>(null);

  const fireBeacon = (beacon: "options" | "hostCustomize" | "shareWhatsApp" | "proceed", ms = 2500) => {
    if (beaconTimerRef.current) clearTimeout(beaconTimerRef.current);
    setActiveBeacon(beacon);
    beaconTimerRef.current = setTimeout(() => setActiveBeacon(null), ms);
  };
  // Con "reducir movimiento" el scroll es instantáneo (sin animación) y el pulso no anima (motion-safe: en las clases)
  const beaconScrollTo = (el: HTMLElement | null, block: ScrollLogicalPosition = "center") => {
    if (!el) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block });
  };
  const BEACON_ORANGE = "ring-2 ring-[#FE6712] ring-offset-2 shadow-md shadow-[#FE6712]/20 motion-safe:animate-pulse";
  const BEACON_GREEN = "ring-2 ring-emerald-500 ring-offset-2 motion-safe:animate-pulse";

  // ¿El anfitrión ya personalizó alguna de sus unidades? (exclusión, nota o cualquier opción con cantidad)
  const hostHasCustomized = slots.slice(0, hostSetupUnits).some((s) =>
    (s.exclusions && s.exclusions.length > 0) || !!s.notes ||
    Object.values(s.selectedVariants || {}).some((sel: any) => (Array.isArray(sel) ? sel.some((i: any) => (i.count || 0) > 0) : !!sel?.name))
  );

  // Hitos 1-3: al cambiar de vista (una espera corta deja que la vista nueva se pinte antes de medir/scrollear)
  useEffect(() => {
    const prev = prevViewModeRef.current;
    prevViewModeRef.current = viewMode;
    if (!isOpen || prev === viewMode) return;
    const t = setTimeout(() => {
      if (viewMode === "customize") {
        // Hito 1: "Personalizar combo" -> las dos opciones
        beaconScrollTo(modeOptionsRef.current);
        fireBeacon("options", 2000);
      } else if (viewMode === "host_setup") {
        // Hito 2 (aún sin personalizar: pulso en "Personalizar mi …") / Hito 3 (ya personalizó o regresa de personalizar: pulso verde en lanzar)
        beaconScrollTo(hostCardRef.current);
        if (hostHasCustomized) {
          beaconScrollTo(launchBtnRef.current, "nearest");
          fireBeacon("shareWhatsApp");
        } else {
          fireBeacon("hostCustomize");
        }
      }
    }, 80);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // Hito 4: la sala se llenó (los panas ocuparon todas las ranuras) -> foco y pulso en "Proceder al Pago y Despacho"
  const roomFull = viewMode === "comboRoom" && !!comboAllDone;
  useEffect(() => {
    if (!roomFull) return;
    const t = setTimeout(() => {
      beaconScrollTo(proceedBtnRef.current, "nearest");
      proceedBtnRef.current?.focus({ preventScroll: true });
      fireBeacon("proceed");
    }, 80);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomFull]);

  useEffect(() => () => { if (beaconTimerRef.current) clearTimeout(beaconTimerRef.current); }, []);

  // Rescate de sesión del anfitrión: si la tienda abre el modal con `resumeRoomId`, se recupera la sala y se vuelve directo
  // al Monitor en Vivo (nunca a la vista de invitado). Sala inexistente/vencida -> se limpia la sesión y queda el modal normal.
  const resumedRoomRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (!isOpen || !product || !resumeRoomId || resumedRoomRef.current === resumeRoomId) return;
    resumedRoomRef.current = resumeRoomId;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/combo/${resumeRoomId}`);
        const data = await res.json();
        if (cancelled) return;
        if (!data.ok) {
          window.localStorage.removeItem('duna_pedido_amigos_active');
          window.localStorage.removeItem('active_combo_host');
          return;
        }
        const hostUnits: number = data.room.participants?.find((p: any) => p.isHost)?.unitsCount || 1;
        setSlots((prev) => {
          if (prev.length >= hostUnits) return prev;
          const expanded = [...prev];
          for (let i = prev.length; i < hostUnits; i++) expanded.push(createInitialSlot(i));
          return expanded;
        });
        setHostSetupUnits(hostUnits);
        setComboRoomId(data.room.id);
        setComboRoomData(data.room);
        setShowComboPanel(true);
        setViewMode('comboRoom');
        if (comboPollingRef.current) clearInterval(comboPollingRef.current);
        comboPollingRef.current = setInterval(async () => {
          try {
            const pr = await fetch(`/api/combo/${data.room.id}`);
            const pd = await pr.json();
            if (pd.ok) setComboRoomData(pd.room);
          } catch { /* silent */ }
        }, 2000);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, product?.id, resumeRoomId]);

  if (!isOpen || !product) return null;


  const renderVariantsAndSlots = () => (
    <>
      {/* Banner de personalización por unidad: arriba (debajo de la cantidad), visible sin scroll.
          Solo si el producto trae un grupo "SIN" (hasSinVariant); en el resto ni se ofrece la opción. */}
      {hasSinVariant && qty > 1 && !isCombo && !isSlotMode && (
        <div className="py-2 border-b border-gray-100 flex justify-between items-center gap-3">
          <div>
            <span className="text-xs font-black text-slate-900 block">¿Personalizar cada unidad por separado?</span>
            <span className="text-[10px] text-slate-500 font-medium">Configura ingredientes individuales para las {qty} unidades</span>
          </div>
          <button
            type="button"
            onClick={() => setIsSlotCustomizationActive(true)}
            className="bg-[#fe6712] hover:bg-[#e0580d] text-white text-[11px] font-black px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Personalizar unidades</span>
          </button>
        </div>
      )}

      {/* Variantes Globales: selección única (SINGLE, ej. Tamaño) o contadores (MULTIPLE, ej. Sabores) */}
            {viewMode === 'options' && (isCombo || qty > 1) && (
          <div className="pb-3 border-b border-gray-100 flex justify-center mt-3">
            <button
              onClick={() => { setIsSlotCustomizationActive(true); setSlotReturnView('options'); setViewMode('customize'); }}
              className="border border-[#fe6712] text-[#fe6712] font-black py-2.5 px-6 rounded-full text-xs hover:bg-orange-50 transition cursor-pointer flex items-center gap-2 shadow-xs active:scale-95"
            >
              {isSlotCustomizationActive ? `✏️ Editar personalización (${slots.filter(s => Object.keys(s.selectedVariants).length > 0 || s.exclusions?.length > 0).length}/${qty} listas)` : (isCombo ? 'Personalizar combo' : 'Personalizar tu pedido')}
            </button>
          </div>
        )}
        {viewMode === 'customize' && (
          <div className="space-y-4 pb-4 border-b border-gray-100 mt-2">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setViewMode(slotReturnView)} className="p-1.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Volver al producto</h4>
            </div>
            
            <div ref={modeOptionsRef} className="space-y-4">
            <button
              onClick={() => { setSlotReturnView('options'); setViewMode('slots'); }}
              className={`w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-black py-4 px-4 rounded-xl text-sm transition text-left flex items-center justify-between group cursor-pointer ${activeBeacon === 'options' ? BEACON_ORANGE : ''}`}
            >
              <div>
                <span className="block text-sm">🎨 Personalizar aquí mismo</span>
                <span className="text-[11px] text-slate-500 font-medium mt-1 block">Ajusta ingredientes unidad por unidad.</span>
              </div>
              <svg className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>

            <button
              onClick={() => { setHostSetupUnits(1); setHostSetupExclusions([]); setViewMode('host_setup'); }}
              className={`w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-4 px-4 rounded-xl text-sm transition text-left flex items-center justify-between shadow-md cursor-pointer ${activeBeacon === 'options' ? BEACON_ORANGE : ''}`}
            >
              <div>
                <span className="block text-sm">👥 Compartir entre panas por WhatsApp</span>
                <span className="text-[11px] text-green-100 font-medium mt-1 block">Arma el pedido con tus amigos.</span>
              </div>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            </div>
          </div>
        )}


      {viewMode === 'host_setup' && (
        <div className="space-y-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => setViewMode('options')} className="p-1.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Configurar Sala</h4>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <p className="text-xs font-black text-slate-800 uppercase mb-2">1. Tus propias unidades</p>
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-600">¿Cuántos son para ti?</span>
                <div className="flex items-center gap-3 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200">
                  <button onClick={() => setHostSetupUnits(Math.max(1, hostSetupUnits - 1))} className="w-5 h-5 flex items-center justify-center text-[#fe6712] hover:bg-orange-50 rounded transition cursor-pointer">
                    <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                  </button>
                  <span className="font-black text-xs w-4 text-center text-slate-900">{hostSetupUnits}</span>
                  <button onClick={() => setHostSetupUnits(Math.min((baseSlotCount > 1 ? baseSlotCount : 1) * qty, hostSetupUnits + 1))} className="w-5 h-5 flex items-center justify-center text-[#fe6712] hover:bg-orange-50 rounded transition cursor-pointer">
                    <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
              </div>
              
                              <div ref={hostCardRef} className="mt-3 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Tus unidades</span>
                  {slots.slice(0, hostSetupUnits).map((slot, i) => {
                    const hasExclusions = slot.exclusions && slot.exclusions.length > 0;
                    const hasFinancialExtras = Object.values(slot.selectedVariants).some((selection: any) => {
                      if (Array.isArray(selection)) return selection.some(item => (item.count || 0) > 0 && (item.price || 0) > 0);
                      return selection?.price > 0;
                    });
                    // Cualquier opción con cantidad (incluye las "SIN…" de precio 0) o una nota también cuenta como personalizado
                    const hasAnyPick = Object.values(slot.selectedVariants).some((selection: any) => (Array.isArray(selection) ? selection.some((item: any) => (item.count || 0) > 0) : !!selection?.name));
                    const hasModifications = hasExclusions || hasFinancialExtras || hasAnyPick || !!slot.notes;
                    return (
                      <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                        <div>
                          <div className="text-xs font-bold text-slate-800">Tu {product?.name?.split(' ')[0] || 'Unidad'} {i + 1}</div>
                          <div className="text-[10px] text-slate-500">{hasModifications ? 'Personalizado' : 'Sale con todo (Estándar)'}</div>
                        </div>
                        <button onClick={() => { setActiveSlotIndex(i); setSlotReturnView('host_setup'); setViewMode('slots'); }} className={`text-[#fe6712] font-black text-[10px] bg-orange-50 px-2.5 py-1.5 rounded-lg border border-orange-100 hover:bg-orange-100 cursor-pointer ${i === 0 && activeBeacon === 'hostCustomize' ? BEACON_ORANGE : ''}`}>
                          ⚙️ Personalizar mi {unitNoun}{hostSetupUnits > 1 ? ` ${i + 1}` : ''}
                        </button>
                      </div>
                    );
                  })}
                </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs font-black text-slate-800 uppercase mb-2">2. Modalidad de Pago</p>
              <div className="flex flex-row overflow-x-auto gap-2.5 pb-1 pt-0.5 no-scrollbar snap-x">
                <button
                  onClick={() => setHostPaymentMode('split')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex gap-2 ${hostPaymentMode === 'split' ? 'bg-orange-50 border-[#fe6712] ring-1 ring-[#fe6712]' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="text-base">💵</span>
                  <div>
                    <span className={`block text-xs font-black ${hostPaymentMode === 'split' ? 'text-slate-900' : 'text-slate-700'}`}>Dividir cuenta</span>
                    <span className="text-[9px] font-medium text-slate-500">Muestra el monto exacto (Tipo Gringo).</span>
                  </div>
                </button>
                <button
                  onClick={() => setHostPaymentMode('host_pays')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex gap-2 ${hostPaymentMode === 'host_pays' ? 'bg-orange-50 border-[#fe6712] ring-1 ring-[#fe6712]' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="text-base">🎁</span>
                  <div>
                    <span className={`block text-xs font-black ${hostPaymentMode === 'host_pays' ? 'text-slate-900' : 'text-slate-700'}`}>Yo invito (Brindis)</span>
                    <span className="text-[9px] font-medium text-slate-500">Oculta precios a los invitados.</span>
                  </div>
                </button>
              </div>
            </div>

            
          </div>
        </div>
      )}

      {viewMode === 'comboRoom' && comboRoomData && (
        <div className="pb-4 border-b border-gray-100 space-y-4">
          <div className="bg-orange-50/50 border border-orange-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Monitor en Vivo</h4>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FE6712] animate-pulse"></span>
                <span className="text-[10px] font-bold text-orange-700">En curso</span>
              </div>
            </div>
            
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-[11px] font-bold text-slate-700">
                <span>Ranuras ocupadas: {comboRoomData.claimedUnits} de {comboRoomData.totalUnits}</span>
                <span className={comboAllDone ? 'text-emerald-600' : 'text-amber-600'}>{comboAllDone ? 'Combo completo' : `Faltan ${Math.max(0, comboRoomData.totalUnits - comboRoomData.claimedUnits)}`}</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#FE6712] transition-all" style={{ width: `${Math.min(100, (comboRoomData.claimedUnits / comboRoomData.totalUnits) * 100)}%` }}></div>
              </div>
              {/* Una pastilla por ranura: llena = ya reclamada por alguien, vacía = libre */}
              <div className="flex flex-wrap gap-1 pt-0.5">
                {Array.from({ length: comboRoomData.totalUnits }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-5 min-w-[1.25rem] px-1 rounded-md text-[10px] font-black flex items-center justify-center border ${i < comboRoomData.claimedUnits ? 'bg-[#FE6712] border-[#FE6712] text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase">Participantes</p>
              {comboRoomData.participants.map((p: any) => {
                const detailParts: string[] = [];
                const sinLabel = (e: string) => (e.toUpperCase().startsWith('SIN ') ? e : 'Sin ' + e);
                const hasUnits = Array.isArray(p.units) && p.units.length > 1;
                if (hasUnits) {
                  // Invitado con varias unidades: "#1 (Nena) Con todo · #2 (Carlitos) Sin salsa roja + 1x Papas • Nota: …"
                  detailParts.push(p.units.map((u: any, i: number) => {
                    const bits = [u.exclusions?.length > 0 ? u.exclusions.map(formatSin).join(', ') : 'Con todo', ...(u.addons || []).map((a: any) => `${a.count > 1 ? a.count + 'x ' : ''}${a.name}`)];
                    return `#${i + 1}${u.unitName ? ` (${u.unitName})` : ''} ${bits.join(' + ')}${u.note ? ` • Nota: ${u.note}` : ''}`;
                  }).join(' · '));
                } else {
                  (p.exclusions || []).forEach((e: string) => detailParts.push(sinLabel(e)));
                }
                if (!hasUnits) Object.values(p.selectedVariants || {}).forEach((sel: any) => {
                  if (Array.isArray(sel)) sel.forEach((it: any) => { if ((it?.count || 0) > 0) detailParts.push(`${it.count > 1 ? it.count + 'x ' : ''}${it.name}`); });
                });
                const isReady = !!p.completedAt;
                return (
                  <div key={p.id} className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-800 truncate">{p.name}{p.isHost && !/anfitri/i.test(String(p.name)) ? ' (Anfitrión)' : ''}</p>
                        <span className={`shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-full border ${isReady ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{isReady ? 'Listo' : 'Eligiendo'}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">{p.unitsCount} {p.unitsCount === 1 ? 'unidad' : 'unidades'} · {detailParts.length > 0 ? detailParts.join(' + ') : 'Con todo'}{Array.isArray(p.notes) && p.notes.length > 0 ? ` • Nota: ${p.notes.join(' / ')}` : ''}</p>
                      {p.isHost && (
                        <button
                          type="button"
                          onClick={openHostCustomization}
                          className="mt-2 text-xs font-bold text-[#FE6712] bg-orange-50 border border-orange-200 hover:bg-orange-100 py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                        >
                          ⚙️ Personalizar mi {unitNoun}
                        </button>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-slate-900">${Number(p.subtotalUsd || 0).toFixed(2)}</p>
                      {bcvRate ? <p className="text-[10px] font-bold text-slate-500">Bs. {(Number(p.subtotalUsd || 0) * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {(!isCombo && viewMode === 'options' && qty === 1) && availableGroups.map((group: any, gIdx: number) => (
        <div key={gIdx} className="pb-3 border-b border-gray-100 space-y-2">
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{group.title}</h4>
            <p className="text-[10px] text-slate-500 font-bold">{group.subtitle || (group.selectType === 'SINGLE' ? 'Elige una opción' : 'Ajusta las cantidades por sabor u opción')}</p>
          </div>

          <div className="flex flex-col gap-2.5 w-full">
            {group.options.map((opt: any) => {
              const currentSelectionList = selectedVariants[gIdx];
              const matchedItem = Array.isArray(currentSelectionList)
                ? currentSelectionList.find((i: any) => i.code === opt.code || i.id === opt.code)
                : null;
              const currentCount = matchedItem ? (matchedItem.count || 0) : 0;

              if (isCheckinGroup(group)) {
                const { priceLabel, bsLabel } = getOptionPriceLabels(opt.price, false, bcvRate);
                return (
                  <OptionCapsule
                    key={opt.code}
                    mode="single"
                    name={opt.name}
                    image={opt.image}
                    priceLabel={priceLabel}
                    bsLabel={bsLabel}
                    count={matchedItem ? (matchedItem.count || 0) : 0}
                    onSelect={() => handleGlobalCheckboxToggle(gIdx, opt.code)}
                  />
                );
              }

              if (group.selectType === 'SINGLE') {
                const { priceLabel, bsLabel } = getOptionPriceLabels(opt.price, group.pricingRole === 'BASE', bcvRate);
                return (
                  <OptionCapsule
                    key={opt.code}
                    mode="single"
                    name={opt.name}
                    image={opt.image}
                    priceLabel={priceLabel}
                    bsLabel={bsLabel}
                    count={currentCount}
                    onSelect={() => handleGlobalSingleSelect(gIdx, opt.code)}
                  />
                );
              }

              const { priceLabel, bsLabel } = getOptionPriceLabels(opt.price, false, bcvRate);
              return (
                <OptionCapsule
                  key={opt.code}
                  mode="counter"
                  name={opt.name}
                  image={opt.image}
                  priceLabel={priceLabel}
                  bsLabel={bsLabel}
                  count={currentCount}
                  onIncrement={() => handleGlobalOptionQuantityChange(gIdx, opt.code, 1)}
                  onDecrement={() => handleGlobalOptionQuantityChange(gIdx, opt.code, -1)}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* SELECTOR DE COMBOS POR RANURAS / MODO RANURAS */}
      {viewMode === 'slots' ? (
          <div className="space-y-4">
            {/* 1. CABECERA 2 RENGLONES: NAVEGACIÓN + INPUT ANCHO COMPLETO */}
            <div className="sticky top-0 bg-white z-20 border-b border-slate-100 shadow-xs">
              {/* Renglón 1: Atrás | Unidad X de Y */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2 gap-2">
                <button
                  type="button"
                  disabled={activeSlotIndex === 0}
                  onClick={() => setActiveSlotIndex(Math.max(0, activeSlotIndex - 1))}
                  className="flex items-center gap-1.5 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 shrink-0 transition cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  <span className="text-xs font-bold hidden sm:inline">Atrás</span>
                </button>

                <span className="font-bold text-slate-800 text-sm text-center leading-tight">
                  Unidad {activeSlotIndex + 1} de {slotViewUnits}
                </span>

                {/* Personalización del anfitrión: salida explícita al hub (sin guardar); si no, spacer para centrar el texto */}
                {slotReturnView !== 'options' ? (
                  <button
                    type="button"
                    onClick={() => setViewMode(slotReturnView)}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 shrink-0 cursor-pointer"
                  >
                    Volver
                  </button>
                ) : (
                  <div className="w-8 shrink-0" />
                )}
              </div>


              {/* Renglón 2: Input de nombre compacto */}
              <div className="px-3 sm:px-4 pb-2">
                <input
                  type="text"
                  value={slots[activeSlotIndex].name || ''}
                  onChange={(e) => {
                    const newSlots = [...slots];
                    newSlots[activeSlotIndex].name = e.target.value;
                    setSlots(newSlots);
                  }}
                  placeholder="¿Para quién es este? (Ej. Carlos, Mamá)"
                  maxLength={30}
                  className="w-full h-9 text-xs px-3 py-1 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#FE6712] transition"
                />
              </div>
            </div>


            {/* Active Slot Content */}
            <div className="p-3 sm:p-4 bg-white border border-slate-100 rounded-2xl space-y-4 shadow-sm">
              {/* 2. CUADRÍCULA COMPACTA DE EXCLUSIONES (2 COLUMNAS) */}
              {product.exclusions && product.exclusions.length > 0 && (
                <div className="space-y-1.5 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Ingredientes a excluir:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.exclusions.map((exc: string) => {
                      const isChecked = slots[activeSlotIndex].exclusions?.includes(exc);
                      const displayLabel = exc.toUpperCase().startsWith('SIN ') ? exc : 'Sin ' + exc;
                      return (
                        <label
                          key={exc}
                          className={`flex items-center gap-2 px-2.5 h-9 rounded-xl border text-[11px] font-bold cursor-pointer transition shadow-xs ${
                            isChecked
                              ? 'bg-red-50 border-red-200 text-red-700'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-[#FE6712]/40 hover:bg-orange-50/30'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const newSlots = [...slots];
                              if (isChecked) {
                                newSlots[activeSlotIndex].exclusions = newSlots[activeSlotIndex].exclusions.filter(e => e !== exc);
                              } else {
                                newSlots[activeSlotIndex].exclusions = [...(newSlots[activeSlotIndex].exclusions || []), exc];
                              }
                              setSlots(newSlots);
                            }}
                            className="w-3.5 h-3.5 accent-[#FE6712] rounded cursor-pointer shrink-0"
                          />
                          <span className={`truncate ${isChecked ? 'line-through opacity-70' : ''}`}>{displayLabel}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* 3. EXTRAS / VENTA CRUZADA INTEGRADA EN LÍNEA (OPCIÓN B) */}
              {(() => {
                let hasExtrasGroup = false;
                const groupsRendered = availableGroups.map((group, gIdx) => {
                  const currentSlotVars = slots[activeSlotIndex].selectedVariants[gIdx] || [];
                  const groupTitle = group.title || '';
                  const isExtra = groupTitle.toLowerCase().includes('extra') || groupTitle.toLowerCase().includes('acompaña') || groupTitle.toLowerCase().includes('adicional');
                  if (isExtra) hasExtrasGroup = true;
                  
                  return (
                    <div key={gIdx} className="space-y-2.5 pt-4 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        {isExtra ? '¿Acompañamos esta unidad?' : groupTitle}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((opt: any) => {
                          const matched = Array.isArray(currentSlotVars)
                            ? currentSlotVars.find((i: any) => (i.code === opt.code || i.id === opt.id))
                            : (currentSlotVars?.id === opt.id || currentSlotVars?.code === opt.code ? currentSlotVars : null);
                          
                          const isSelected = !!matched && (matched.count === undefined || matched.count > 0);
                          
                          return (
                            <button
                              key={opt.code || opt.id}
                              type="button"
                              onClick={() => {
                                 const delta = isSelected ? -1 : 1;
                                 handleSlotOptionQuantityChange(gIdx, opt.code || opt.id, delta);
                              }}
                              className={`h-9 px-3.5 rounded-full border text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95 ${
                                isSelected 
                                  ? 'bg-[#fff5ed] border-[#FE6712] text-[#FE6712]' 
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300'
                              }`}
                            >
                              <span className={isSelected ? 'text-[#FE6712]' : 'text-slate-400 font-black'}>{isSelected ? '✓' : '+'}</span>
                              <span className="truncate max-w-[150px]">{opt.name || opt.title}</span>
                              {opt.price > 0 && <span className={isSelected ? 'text-orange-700 font-black' : 'text-slate-500'}>(+${opt.price.toFixed(2)})</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
                
                // Si no hay un grupo nativo de extras, inyectamos productos reales del catálogo
                if (!hasExtrasGroup && storeCatalog && storeCatalog.length > 0) {
                   const keywords = ['papa', 'tequeño', 'tequeno', 'bebida', 'refresco', 'extra', 'adicional', 'acompañante'];
                   const realExtras = storeCatalog.filter((p: any) => {
                     if (p.id === product.id) return false; // anti-canibalismo
                     if (p.stock === 0 || p.outOfStock) return false;
                     const n = String(p.name || '').toLowerCase();
                     const c = String(p.category || '').toLowerCase();
                     const sub = String(p.internalCategory || p.subCategory || '').toLowerCase();
                     return keywords.some(k => n.includes(k) || c.includes(k) || sub.includes(k));
                   }).slice(0, 4); // Max 4
                   
                   if (realExtras.length > 0) {
                     const fallbackGIdx = 'fallback_extras';
                     const currentSlotVars = slots[activeSlotIndex]?.selectedVariants[fallbackGIdx] || [];
                     
                     groupsRendered.push(
                       <div key="fallback_extras" className="space-y-3 pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                          ¿Acompañamos esta unidad?
                        </p>
                        <div className="flex flex-row overflow-x-auto gap-2.5 pb-1 pt-0.5 no-scrollbar snap-x">
                          {realExtras.map((opt: any) => {
                            const matched = Array.isArray(currentSlotVars)
                              ? currentSlotVars.find((i: any) => (i.code === opt.id || i.id === opt.id))
                              : null;
                            const isSelected = !!matched && (matched.count > 0);
                            
                            return (
                              <div key={opt.id} className={`w-36 shrink-0 snap-start p-2 rounded-xl border border-slate-100 bg-white shadow-xs border flex flex-col justify-between transition cursor-pointer ${isSelected ? 'border-[#FE6712]/50 bg-[#fff5ed]' : 'border-slate-200 bg-white hover:border-[#FE6712]/30'}`} onClick={() => {
                                   const delta = isSelected ? -1 : 1;
                                   handleSlotOptionQuantityChange(fallbackGIdx, opt.id, delta, { id: opt.id, name: opt.name, price: Number(opt.price) || 0, sku: opt.sku || opt.code || '' });
                                }}>
                                <img src={opt.image || opt.imageUrl || 'https://placehold.co/100x100?text=Extra'} alt={opt.name} className="w-full h-14 object-cover rounded-lg mb-1.5 bg-white" />
                                <div>
                                  <p className="text-[11px] font-bold text-slate-900 truncate">{opt.name}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    {opt.sku || opt.code ? <span className="text-[9px] font-bold text-slate-400">{(opt.sku || opt.code || '').substring(0, 8)}</span> : null}
                                    <span className="text-[10px] font-black text-orange-700">+${(Number(opt.price) || 0).toFixed(2)}</span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className={`w-full mt-1.5 py-1 text-[11px] font-bold rounded-lg flex items-center justify-center transition ${isSelected ? 'bg-[#FE6712]/10 text-[#FE6712] border border-[#FE6712]/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                  {isSelected ? '✓ Agregado' : '+ Agregar'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                     );
                   }
                }
                
                return groupsRendered;
              })()}

              {/* Sugerencia para la cocina de ESTA unidad (acordeón compacto, máx. 70 caracteres) */}
              <KitchenNote
                key={activeSlotIndex}
                value={slots[activeSlotIndex]?.notes || ''}
                onChange={(v) => setSlots((prev) => prev.map((s, i) => (i === activeSlotIndex ? { ...s, notes: v } : s)))}
              />
            </div>
                        {/* BOTÓN PRINCIPAL ANCHO — PIE DE LA PERSONALIZACIÓN */}
            <div className="pt-4 pb-6 px-1">
              {activeSlotIndex < slotViewUnits - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveSlotIndex(Math.min(slotViewUnits - 1, activeSlotIndex + 1))}
                  className="w-full bg-[#FE6712] hover:bg-[#E05509] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                >
                  <span>Continuar a la unidad {activeSlotIndex + 2} de {slotViewUnits}</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              ) : slotReturnView !== 'options' ? (
                <>
                  <button
                    type="button"
                    onClick={saveAndReturnToRoom}
                    disabled={hostSaving}
                    className="w-full bg-[#FE6712] hover:bg-[#E05509] disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                  >
                    <span>{hostSaving ? 'Guardando...' : 'Guardar personalización y volver a la sala ✓'}</span>
                  </button>
                  {hostSaveError && <p className="mt-2 text-xs font-bold text-red-600 text-center">{hostSaveError}</p>}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setViewMode('options')}
                  className="w-full bg-[#FE6712] hover:bg-[#E05509] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <span>Listo, confirmar combo</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Modo Estándar */
        <div className="space-y-4">
          {product.exclusions && product.exclusions.length > 0 && (
            <div className="pb-3 border-b border-gray-100 space-y-2">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#fe6712]" /> Firma D&apos;una (Exclusiones):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.exclusions.map((exc: string) => (
                  <label key={exc} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer shadow-xs hover:border-[#fe6712] transition">
                    <input
                      type="checkbox"
                      checked={selectedExclusions.includes(exc)}
                      onChange={() => toggleExclusion(exc)}
                      className="w-4 h-4 accent-[#fe6712] rounded cursor-pointer"
                    />
                    <span className="truncate">{exc}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Sugerencia para la cocina del producto simple individual (punto 2 de 2 donde se permiten notas) */}
          {viewMode === 'options' && !isCombo && !isSlotMode && (
            <KitchenNote value={productNote} onChange={setProductNote} />
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch md:items-center justify-center p-0 md:p-4 transition-all duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className={`bg-white w-full ${hasVariants ? 'md:max-w-3xl' : 'md:max-w-2xl'} rounded-none md:rounded-3xl h-full md:h-auto max-h-full md:max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative z-10 animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:zoom-in-95 duration-200`}>

        {/* Controles flotantes */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-40">
          {store?.code && (
            <ShareButton
              title={product.name}
              text={`¡Mira esto en ${store.name}!`}
              url={`${typeof window !== 'undefined' ? window.location.origin : ''}/store/${store.code}/product/${product.id}`}
              ariaLabel="Compartir producto"
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition cursor-pointer shadow-sm"
            />
          )}
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition cursor-pointer shadow-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto md:overflow-hidden min-h-0">
          {step === 1 && (
            hasVariants ? (
              /* LAYOUT SIMÉTRICO 50/50 BILATERAL PARA PRODUCTOS CON VARIANTES */
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className={`grid grid-cols-1 ${viewMode === 'slots' ? '' : 'md:grid-cols-2'} gap-4 md:gap-6 p-4 md:p-6 items-start`}>
                  {/* Columna Izquierda (Mitad 50% - Anclada / Sin Scroll) */}
                  <div className={`w-full flex flex-col justify-between overflow-hidden bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 gap-3 md:sticky md:top-6 ${viewMode === 'slots' ? 'hidden md:hidden' : ''}`}>
                    {/* Imagen del producto */}
                    <div className="relative flex items-center justify-center w-full aspect-square max-h-72 rounded-2xl border border-slate-200/80 bg-white overflow-hidden p-3 shrink-0 shadow-xs">
                      <img
                        src={getOptimizedImageUrl(product.image || product.img, 'PRODUCT')}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        onError={(e:any)=>{e.target.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60'}}
                      />
                    </div>

                    {/* Cinta de entrega estimada */}
                    <div className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-50/80 border border-sky-200/60 px-2.5 py-1.5 text-sky-800 shrink-0">
                      <svg className="w-3.5 h-3.5 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[10px] font-semibold tracking-tight">Entrega estimada: 30 a 45 min en tu dirección</span>
                    </div>

                    {/* Bloque de Precio Base + Selector de cantidad */}
                    <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-xs flex flex-col gap-2.5 shrink-0">
                      <div className="flex justify-between items-center pb-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Despacho Inmediato
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-700">Cantidad:</span>
                        <div className="flex items-center gap-3 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                          <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-6 h-6 flex items-center justify-center text-[#fe6712] hover:bg-orange-50 rounded-md transition cursor-pointer">
                            <Minus className="w-4 h-4 stroke-[3]" />
                          </button>
                          <span className="font-black text-sm w-4 text-center text-slate-900">{qty}</span>
                          <button onClick={() => setQty(qty + 1)} className="w-6 h-6 flex items-center justify-center text-[#fe6712] hover:bg-orange-50 rounded-md transition cursor-pointer">
                            <Plus className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Tarjeta de Atributos del Producto / Sello de calidad */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-slate-800">
                          Atributos del Producto
                        </span>
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-600 border border-slate-200">
                          Original
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-left mb-2">
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Marca</span>
                          <p className="text-xs font-bold text-slate-800 truncate">{product.brand || product.marca || 'Verificada'}</p>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Presentación</span>
                          <p className="text-xs font-bold text-slate-800 truncate">{product.presentation || product.presentacion || 'Unidad Estandarizada'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 border-t border-slate-100 pt-1.5 text-emerald-700 text-[9px] font-bold uppercase tracking-wider">
                        <svg className="w-3 h-3 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Garantía de Sellado de Origen</span>
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha (Mitad 50% - Vitrina de Opciones con Scroll) */}
                  <div className="w-full flex flex-col flex-1 bg-white">
                    {/* Cabecera */}
                    <div className={`pb-3 border-b border-slate-100 shrink-0 ${viewMode === 'slots' ? 'hidden' : ''}`}>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5 pr-14 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{product.code}</span>
                        <span>|</span>
                        <span className="text-[#fe6712] bg-[#fff5ed] px-2 py-0.5 rounded">{(product.category || product.cat || 'PRODUCTO').toUpperCase()}</span>
                      </div>
                      <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight pr-14 mb-1">{product.name}</h3>
                      {cleanDescription && <p className="text-xs text-slate-600 leading-relaxed mb-2">{cleanDescription}</p>}
                      {descriptionTags && Object.keys(descriptionTags).length > 0 && <ProductTagBadges tags={descriptionTags} className="mb-2" />}
                    </div>

                    {/* Vitrina de Sabores / Modificadores con Scroll Completo e Independiente */}
                    <div className="w-full flex-1 pb-32 pr-2 pt-3 space-y-3.5">
                      {renderVariantsAndSlots()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* LAYOUT ESTÁNDAR PARA PRODUCTOS SIMPLES / MEDICAMENTOS */
              <div className="flex flex-col h-full overflow-y-auto">
                {/* Cabecera Fija */}
                <div className="shrink-0 p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 items-start bg-white z-20 shadow-sm border-b border-slate-100">
                  {/* Columna Izquierda: Imagen, Precio y Cantidad */}
                  <div className="flex flex-col gap-2.5">
                    <div className="relative flex items-center justify-center w-full aspect-square max-h-72 rounded-xl border border-slate-200/80 bg-white overflow-hidden p-3">
                      <img src={getOptimizedImageUrl(product.image || product.img, 'PRODUCT')} alt={product.name} className="w-full h-full object-contain" onError={(e:any)=>{e.target.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60'}} />
                    </div>
                    <div className="flex items-center justify-center gap-1.5 rounded-lg bg-sky-50/70 border border-sky-200/60 px-2.5 py-1 text-sky-800">
                      <svg className="w-3.5 h-3.5 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[10px] font-semibold tracking-tight">Entrega estimada: 30 a 45 min en tu dirección</span>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl border border-slate-100 flex flex-col p-3 gap-3">
                      <div className="flex justify-between items-center pb-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Despacho Inmediato
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60">
                        <span className="text-xs font-bold text-slate-700">Cantidad:</span>
                        <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                          <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-6 h-6 flex items-center justify-center text-[#fe6712] hover:bg-orange-50 rounded-md transition cursor-pointer">
                            <Minus className="w-4 h-4 stroke-[3]" />
                          </button>
                          <span className="font-black text-sm w-4 text-center text-slate-900">{qty}</span>
                          <button onClick={() => setQty(qty + 1)} className="w-6 h-6 flex items-center justify-center text-[#fe6712] hover:bg-orange-50 rounded-md transition cursor-pointer">
                            <Plus className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      </div>
                      {(() => {
                        const isPharmaLocal = Boolean(
                          String(nicheEngine || '').toUpperCase().includes('PHARMA') ||
                          (typeof product?.metadata === 'object' && product?.metadata?.farmacia?.principioActivo) ||
                          (typeof product?.metadata === 'string' && product?.metadata?.includes('farmacia')) ||
                          String(product?.category || product?.cat || '').toLowerCase().includes('farmacia') ||
                          String(product?.internalCategory || '').toLowerCase().includes('farmacia')
                        );
                        return (
                          <div className="mt-0.5 flex items-center justify-center gap-1 text-[9px] font-medium text-slate-600">
                            <svg className="w-3 h-3 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>{isPharmaLocal ? 'Medicamento 100% Original • Trazabilidad Garantizada' : 'Producto 100% Original • Calidad Garantizada'}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Columna Derecha: Título, Descripción y Ficha Clínica */}
                  <div className="flex flex-col">
                    {(() => {
                      let parsedFarmacia = null;
                      if (typeof product?.metadata === 'object') {
                        parsedFarmacia = product?.metadata?.farmacia;
                      } else if (typeof product?.metadata === 'string') {
                        try { parsedFarmacia = JSON.parse(product.metadata)?.farmacia; } catch(e){}
                      }
                      const subCategoryName = 
                        parsedFarmacia?.subCategory ||
                        product?.internalCategory || 
                        product?.internal_category || 
                        product?.subCategory || 
                        product?.category?.subCategoryName ||
                        null;
                      const catName = String(product?.category || product?.cat || '').toUpperCase();
                      const finalCat = (catName === 'GENERAL' || catName === '') ? 'PRODUCTO' : catName;
                      const subCatStr = String(subCategoryName || '').toUpperCase();
                      const finalSubCat = (subCatStr && subCatStr !== 'GENERAL') ? subCatStr : null;
                      return (
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5 pr-12 text-[10px] font-black uppercase tracking-wider text-slate-500">
                          <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{product.code}</span>
                          <span>|</span>
                          <span className="text-[#fe6712] bg-[#fff5ed] px-2 py-0.5 rounded">{finalCat}</span>
                          {finalSubCat && (
                            <>
                              <span>|</span>
                              <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{finalSubCat}</span>
                            </>
                          )}
                        </div>
                      );
                    })()}
                    <h3 className="text-lg font-black text-slate-900 leading-tight pr-8 mb-2">{product.name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed text-justify mb-2">{cleanDescription || 'Configura las opciones para este artículo.'}</p>
                    {descriptionTags && Object.keys(descriptionTags).length > 0 && <ProductTagBadges tags={descriptionTags} className="mb-2" />}

                    {/* Bloque Clínico Farmacia / Atributos */}
                    {(() => {
                      let farmaciaData = null;
                      try {
                        const rawMeta = product?.metadata;
                        const parsedMeta = typeof rawMeta === 'string' ? JSON.parse(rawMeta) : rawMeta;
                        farmaciaData = parsedMeta?.farmacia || null;
                      } catch (e) {
                        farmaciaData = null;
                      }

                      const categoryStr = String(product?.categoria || product?.category || product?.cat || '').toUpperCase();
                      const isPharmacyCategory = categoryStr.includes('FARMACIA') || categoryStr.includes('MEDICAMENTO') || categoryStr.includes('SALUD') || categoryStr.includes('ANTIALERGICO');

                      let clinicalData = farmaciaData;
                      if (!clinicalData && isPharmacyCategory) {
                         const parsedMeta = (typeof product?.metadata === 'string' ? JSON.parse(product?.metadata || '{}') : product?.metadata) || {};
                         clinicalData = {
                           principioActivo: parsedMeta.principioActivo || product?.principioActivo,
                           concentracion: parsedMeta.concentracion || product?.concentracion,
                           presentacion: parsedMeta.presentacion || product?.presentacion,
                           laboratorio: parsedMeta.laboratorio || product?.laboratorio,
                           registroSanitario: parsedMeta.registroSanitario || product?.registroSanitario,
                           condicionVenta: parsedMeta.condicionVenta || product?.condicionVenta,
                           cadenaFrio: parsedMeta.cadenaFrio || product?.cadenaFrio || parsedMeta.requiereFrio || product?.requiereFrio
                         };
                      }

                      if (clinicalData && typeof clinicalData === 'object') {
                        const hasAnyValue = Object.values(clinicalData).some(v => v !== undefined && v !== null && v !== '');
                        if (!hasAnyValue) clinicalData = null;
                      }

                      if (!clinicalData && !isPharmacyCategory) {
                        return (
                          <div className="mt-2.5 rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 shadow-xs">
                            <div className="flex items-center justify-between border-b border-slate-200/70 pb-1.5 mb-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <svg className="w-3.5 h-3.5 text-slate-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-800 whitespace-nowrap">
                                  Atributos del Producto
                                </span>
                              </div>
                              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-600 border border-slate-200 whitespace-nowrap shrink-0">
                                Original
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-2.5">
                              <div>
                                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                  Marca
                                </span>
                                <p className="text-xs font-bold text-slate-800 mt-0.5">
                                  {product.brand || product.marca || 'Verificada'}
                                </p>
                              </div>
                              <div>
                                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                  Presentación
                                </span>
                                <p className="text-xs font-bold text-slate-800 mt-0.5">
                                  {product.presentation || product.presentacion || 'Unidad Estandarizada'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1.5 border-t border-slate-200/60 pt-2">
                              <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                                Garantía de Sellado de Origen
                              </span>
                            </div>
                          </div>
                        );
                      }
                      
                      const displayData = clinicalData || {};

                      return (
                        <div className="mt-2.5 rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 shadow-xs">
                          {/* FICHA TÉCNICA CLÍNICA - VADEMÉCUM EJECUTIVO */}
                          <div className="flex items-center justify-between border-b border-slate-200/70 pb-1.5 mb-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <svg className="w-3.5 h-3.5 text-slate-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-800 whitespace-nowrap">
                                Especificación Farmacológica
                              </span>
                            </div>
                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700 border border-emerald-200/80 whitespace-nowrap shrink-0">
                              {displayData?.condicionVenta || 'Venta Libre'}
                            </span>
                          </div>

                          <div className="mb-2.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-0.5">
                              Principio Activo & Concentración
                            </span>
                            <p className="text-sm font-bold text-slate-900">
                              {displayData?.principioActivo || product.name} {displayData?.concentracion && <span className="font-semibold text-slate-700">{displayData.concentracion}</span>}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 border-t border-slate-200/60 pt-2 mb-2.5">
                            <div>
                              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                Laboratorio
                              </span>
                              <p className="text-xs font-bold text-slate-800 mt-0.5">
                                {displayData?.laboratorio || 'Siegfried'}
                              </p>
                            </div>
                            <div>
                              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                Presentación
                              </span>
                              <p className="text-xs font-bold text-slate-800 mt-0.5">
                                {displayData?.presentacion || 'Caja x 10 Tabletas'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                              Registro Sanitario Oficial
                            </span>
                            <span className="font-mono text-[11px] font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                              {displayData?.registroSanitario || 'RS0214-10215'}
                            </span>
                          </div>

                          <p className="mt-2 text-[9px] text-slate-400 leading-tight">
                            Consulte siempre a su médico o farmacéutico antes de administrar este producto.
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                
                {/* Opciones: sin scroll propio (scrollea el contenedor padre). Con `overflow-y-auto` + `flex-1` este bloque se
                    colapsaba a ~24 px en móvil y la nota quedaba atrapada en un mini-scroll pegado al pie. Colchón inferior
                    generoso en móvil (pb-32) para que el pie fijo jamás tape el último campo; en md+ solo respiro normal. */}
                <div className="flex-1 shrink-0 p-3 sm:p-4 pb-32 sm:pb-32 md:pb-6 space-y-4">
                  {renderVariantsAndSlots()}
                </div>
              </div>
            )
          )}

          {step === 2 && currentUpsells.length > 0 && (
            <div className="p-5 sm:p-6 space-y-6 bg-slate-50 min-h-full">
              <div className="text-center space-y-2 pt-4">
                <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center shadow-inner mb-4">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-xl font-black text-slate-900">¡Excelente elección!</h3>
                <p className="text-sm font-medium text-slate-500">¿Deseas agregar estos complementos en 1-Tap para mejorar tu experiencia?</p>
              </div>

              <div className="space-y-3 max-w-md mx-auto">
                {currentUpsells.map((up) => {
                  const isChecked = !!upsellSelections[up.code];
                  return (
                    <label key={up.code} className={`flex items-center justify-between bg-white p-4 rounded-2xl border transition shadow-sm cursor-pointer ${isChecked ? 'border-[#fe6712] ring-1 ring-[#fe6712]/20' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl">
                          {up.icon}
                        </div>
                        <div>
                          <span className="font-black text-slate-900 block text-sm">{up.name}</span>
                          <span className="text-[#fe6712] font-bold text-xs">+${up.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleUpsell(up)}
                        className="w-5 h-5 accent-[#fe6712] rounded cursor-pointer"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className={`sticky bottom-0 bg-white border-t border-slate-100 z-30 shrink-0 shadow-md pb-[max(0.75rem,env(safe-area-inset-bottom))] ${viewMode === 'slots' ? 'hidden' : ''}`}>

          {/* ── Barra de precio + botones de acción ─────────────────────── */}
          {viewMode === 'host_setup' && (
            <div className="p-4 sm:p-5 md:px-6 md:py-4 bg-white md:flex md:justify-end">
              <button
                onClick={() => {
                  createComboRoom().then(() => {
                    const hostUrl = window.location.origin + `/combo/${comboRoomId || 'new'}`; // The real ID gets set after createComboRoom, but we can't await state. 
                    // Better to just let createComboRoom open whatsapp.
                  });
                }}
                ref={launchBtnRef}
                disabled={comboCreating}
                className={`w-full md:w-auto md:px-8 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-3.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 ${activeBeacon === 'shareWhatsApp' ? BEACON_GREEN : ''}`}
              >
                {comboCreating ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creando...</>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Crear Sala y Enviar a WhatsApp
                  </>
                )}
              </button>
            </div>
          )}
          {/* Escritorio (md+) en la sala: una sola fila con el Total a la izquierda y el botón principal acotado a la derecha
              (flex-row-reverse: el botón va primero en el DOM para que en móvil siga arriba del Total, a todo el ancho). */}
          <div className={`p-4 sm:p-5 md:px-6 md:py-4 ${viewMode === 'host_setup' ? 'hidden' : ''} ${viewMode === 'comboRoom' ? 'md:flex md:flex-row-reverse md:items-center md:gap-6' : ''}`}>
            {/* Sala colaborativa activa: mientras falten ranuras el anfitrión puede seguir compartiendo; al llenarse, el
                CTA lo lleva a caja (agrega el combo maestro al carrito y abre el carrito → checkout). */}
            {viewMode === 'comboRoom' && comboRoomData && (
              <div className="mb-3 md:mb-0 md:flex md:justify-end md:shrink-0">
                {comboAllDone ? (
                  <button
                    type="button"
                    ref={proceedBtnRef}
                    onClick={() => handleAddToCart(true)}
                    className={`w-full md:w-auto md:px-8 bg-[#FE6712] hover:bg-[#E05509] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${activeBeacon === 'proceed' ? BEACON_ORANGE : ''}`}
                  >
                    Proceder al Pago y Despacho ({comboRoomData.totalUnits}/{comboRoomData.totalUnits}) <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent("¡Pilas panas! Entren a este link para armar el combo en D'una: " + comboLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto md:px-8 md:py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-3.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    Compartir de nuevo por WhatsApp ({comboRoomData.claimedUnits}/{comboRoomData.totalUnits})
                  </a>
                )}
              </div>
            )}
            <div className={`flex items-center justify-between gap-3 ${viewMode === 'comboRoom' ? 'md:flex-1' : ''}`}>
              <div className="shrink-0">
                <span className="text-[10px] font-black text-slate-400 uppercase block mb-0.5">Total a Pagar</span>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5">
                  <span className="text-xl font-black text-slate-900 leading-none">${footerTotalUSD.toFixed(2)}</span>
                  {bcvRate ? <span className="text-xs font-bold text-slate-500">/ Bs. {(footerTotalUSD * bcvRate).toFixed(2)}</span> : null}
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-1 items-end">
                {/* Botón "Armar con Amigos" — solo en productos con variantes, paso 1, sin upsells */}
                {(false) && (
                  <button
                    type="button"
                    onClick={createComboRoom}
                    disabled={comboCreating}
                    className="w-full max-w-[240px] flex items-center justify-center gap-1.5 rounded-xl py-2 px-4 text-[11px] font-black border border-[#fe6712]/50 text-[#fe6712] bg-orange-50 hover:bg-orange-100 transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {comboCreating ? (
                      <><div className="w-3 h-3 border-2 border-[#fe6712] border-t-transparent rounded-full animate-spin" /> Creando sala…</>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Armar con Amigos en Vivo
                      </>
                    )}
                  </button>
                )}

                {step === 1 && currentUpsells.length > 0 ? (
                  <button
                    onClick={handleNextStep}
                    disabled={!isMinimumsMet}
                    className={`flex-[2] max-w-[200px] font-black py-3.5 px-4 rounded-2xl transition shadow-md text-xs flex items-center justify-center gap-2 active:scale-95 ${
                      isMinimumsMet
                        ? 'bg-[#fe6712] hover:bg-[#e0580d] text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <span>{isMinimumsMet ? 'Continuar' : 'Selecciona tus opciones'}</span> <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className={`flex gap-2 justify-end w-full max-w-[240px] ${viewMode === 'comboRoom' ? 'hidden' : ''}`}>
                    {step === 2 && (
                      <button
                        onClick={handleAddToCart}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-3.5 px-4 rounded-2xl text-[11px] transition cursor-pointer active:scale-95"
                      >
                        Omitir
                      </button>
                    )}
                    <button
                      onClick={handleAddToCart}
                      disabled={!isMinimumsMet || (viewMode === 'comboRoom' && !comboAllDone)}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.98] ${
                        isMinimumsMet && !(viewMode === 'comboRoom' && !comboAllDone)
                          ? 'bg-[#fe6712] hover:bg-[#e05509] text-white cursor-pointer'
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      }`}
                    >
                      <svg className={`w-4 h-4 ${isMinimumsMet && !(viewMode === 'comboRoom' && !comboAllDone) ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>
                        {viewMode === 'comboRoom' && !comboAllDone
                          ? 'Esperando amigos…'
                          : (viewMode === 'comboRoom' && comboAllDone)
                          ? 'Agregar combo al carrito'
                          : isMinimumsMet
                          ? 'Agregar al carrito'
                          : 'Selecciona opciones'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
