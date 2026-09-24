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

export interface ComboSlot {
  id: number;
  name: string;
  selectedVariants: Record<string | number, any>;
  exclusions: string[];
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
  initialQty?: number; // unidades con las que arranca el contador al abrir (p. ej. el pedido del asistente); por defecto 1
  store?: { name: string; code: string } | null; // para el botón "Compartir" (nombre y slug reales de la tienda)
}

export default function MasterProductModal({
  isOpen,
  onClose,
  product,
  nicheEngine,
  bcvRate,
  onAddToCart,
  initialQty = 1,
  store
}: MasterProductModalProps) {
  // Cantidad válida: entero entre 1 y 99
  const startQty = Math.min(Math.max(Math.floor(Number(initialQty)) || 1, 1), 99);
  const [step, setStep] = useState<number>(1);
  const [qty, setQty] = useState<number>(startQty);

  // Estados globales de variantes y exclusiones (modo estándar)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, any>>({});
  const [selectedExclusions, setSelectedExclusions] = useState<string[]>([]);
  const [upsellSelections, setUpsellSelections] = useState<Record<string, any>>({});

  // ── Pedido Colaborativo ("Armar Combo con Amigos en Vivo") ─────────────────
  const [comboRoomId, setComboRoomId] = useState<string | null>(null);
  const [comboRoomSlots, setComboRoomSlots] = useState<any[]>([]);
  const [showComboPanel, setShowComboPanel] = useState(false);
  const [comboCreating, setComboCreating] = useState(false);
  const [comboCopied, setComboCopied] = useState(false);
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
  const isSlotMode = hasSinVariant && (isCombo || (qty > 1 && isSlotCustomizationActive));
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
      setComboRoomSlots([]);
      setShowComboPanel(false);
      setComboCreating(false);
      setComboCopied(false);
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

  const handleSlotOptionQuantityChange = (groupIdx: number | string, optionCode: string, delta: number) => {
    setSlots(prev => {
      const copy = [...prev];
      if (!copy[activeSlotIndex]) return prev;

      const currentGroupSelection = copy[activeSlotIndex].selectedVariants[groupIdx];
      let updatedList = Array.isArray(currentGroupSelection) ? [...currentGroupSelection] : [];

      // Si la lista está vacía, la poblamos desde availableGroups
      if (updatedList.length === 0) {
        const grp = availableGroups[Number(groupIdx)];
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
      const targetSlots = (showComboPanel && comboRoomSlots.length > 0 && comboRoomSlots.every(s => !!s.completedAt)) ? comboRoomSlots : slots; targetSlots.forEach((slot: any) => {
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
  }, [product, selectedVariants, slots, isSlotMode, upsellSelections, availableGroups, showComboPanel, comboRoomSlots]);

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

  const handleAddToCart = () => {
    if (!product) return;
    const breakdown: string[] = [];

    const activeSlots = (showComboPanel && comboAllDone) ? comboRoomSlots : slots;

    if (isSlotMode) {
      if (isCombo) {
        breakdown.push(`Combo: ${product.name} (${activeSlots.length} unidades)`);
      } else {
        breakdown.push(`Personalización por unidad (${activeSlots.length} unidades)`);
      }

      activeSlots.forEach((slot, idx) => {
        const slotTitle = slot.guestName?.trim() || slot.name?.trim() || '';
        // Encabezado legible: "Perro Sencillo #1 (omar)" (nombre del producto + número de unidad + nombre opcional)
        const slotHeader = `${product.name || 'Unidad'} #${idx + 1}${slotTitle ? ` (${slotTitle})` : ''}`;
        const slotParts: string[] = [];

        Object.values(slot.selectedVariants).forEach((sel: any) => {
          if (!sel) return;
          if (Array.isArray(sel)) {
            sel.forEach(item => {
              if ((item.count || 0) > 0) {
                // Los modificadores "SIN ..." van sin prefijo de cantidad ("SIN PAPITA", no "1x SIN PAPITA")
                const modLabel = /^sin\b/i.test(String(item.name || '').trim()) ? String(item.name).trim() : `${item.count}x ${item.name}`;
                if (item.price && item.price > 0) {
                  slotParts.push(`${modLabel} (+$${(item.price * item.count).toFixed(2)})`);
                } else {
                  slotParts.push(modLabel);
                }
              }
            });
          } else if (sel.name) {
            slotParts.push(sel.name);
          }
        });

        if (slot.exclusions && slot.exclusions.length > 0) {
          slot.exclusions.forEach((ex: string) => slotParts.push(`Sin ${ex}`));
        } else {
          slotParts.push('Con Todo');
        }

        // Una sola entrada por ranura: encabezado y cada modificador en su propia línea (viñeta)
        breakdown.push([`${slotHeader}:`, ...slotParts.map((part) => `• ${part}`)].join('\n'));
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
        breakdown.push(`Firma D'una: Sin ${selectedExclusions.join(', ')}`);
      }
    }

    Object.values(upsellSelections).forEach(up => {
      breakdown.push(`+ ${up.name} ($${up.price.toFixed(2)})`);
    });

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
      pricing: isSlotMode ? undefined : { unitBasePrice, addonsTotal, unitFinalPrice }
    });
    // Marcar sala colaborativa como completada y limpiar barra flotante
    if (comboRoomId && typeof window !== 'undefined') {
      window.localStorage.removeItem('duna_pedido_amigos_active');
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
  const createComboRoom = async () => {
    if (!product) return;
    setComboCreating(true);
    try {
      const tempId = "new";
      const res = await fetch(`/api/combo/${tempId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id || product.code || tempId,
          productName: product.name || 'Producto',
          storeName: store?.name || '',
          storeCode: store?.code || '',
          totalSlots: qty > 1 ? qty : (baseSlotCount > 1 ? baseSlotCount : qty),
          hostName: 'Anfitrión',
          hostSelectedVariants: selectedVariants,
          hostExclusions: selectedExclusions,
        }),
      });
      const data = await res.json();
          if (data.ok) {
          const finalRoomId = data.room.id;
          setComboRoomId(finalRoomId);
          setComboRoomSlots(data.room.slots || []);
          setShowComboPanel(true);
          // Persistir sala activa para la barra flotante global
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('duna_pedido_amigos_active', JSON.stringify({
              roomId: finalRoomId,
              storeSlug: store?.code || '',
              storeName: store?.name || '',
              productName: product?.name || '',
              isHost: true,
              createdAt: Date.now(),
              status: 'ACTIVE',
            }));
          }
          // Polling cada 2 s
          if (comboPollingRef.current) clearInterval(comboPollingRef.current);
          comboPollingRef.current = setInterval(async () => {
            try {
              const pr = await fetch(`/api/combo/${finalRoomId}`);
              const pd = await pr.json();
              if (pd.ok) setComboRoomSlots(pd.room.slots || []);
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

  const comboAllDone = comboRoomSlots.length > 0 && comboRoomSlots.every(s => !!s.completedAt);

  const handleCopyComboLink = () => {
    if (!comboLink) return;
    navigator.clipboard.writeText(comboLink).then(() => {
      setComboCopied(true);
      setTimeout(() => setComboCopied(false), 2000);
    });
  };

  const whatsappComboUrl = comboLink
    ? `https://wa.me/?text=${encodeURIComponent(`¡Arma tu pedido conmigo! Elige tu opción aquí: ${comboLink}`)}`
    : '';

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
      {!isSlotMode && availableGroups.map((group: any, gIdx: number) => (
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
      {isSlotMode ? (
        <div className="pb-3 border-b border-gray-100 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#fe6712] text-white flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5" />
                </span>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {isCombo ? 'Configuración del Combo por Unidades' : 'Personalización Individual por Unidad'}
                </h4>
              </div>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5 ml-8">
                Configura las {slots.length} unidades con sus respectivas cantidades de sabores.
              </p>
            </div>

            {!isCombo && (
              <button
                type="button"
                onClick={() => setIsSlotCustomizationActive(false)}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline transition cursor-pointer"
              >
                Aplicar lo mismo a todas
              </button>
            )}
          </div>

          {/* Pestañas de Ranura */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pt-1 border-t border-gray-100">
            {slots.map((slot, idx) => {
              const isActive = activeSlotIndex === idx;
              const hasExcl = slot.exclusions && slot.exclusions.length > 0;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setActiveSlotIndex(idx)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap shadow-xs ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                    isActive ? 'bg-[#fe6712] text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="truncate max-w-[120px]">{slot.name || `${unitLabel} #${idx + 1}`}</span>
                  {hasExcl && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-orange-500 text-white' : 'bg-orange-100 text-[#fe6712]'
                    }`}>
                      -{slot.exclusions.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tarjeta de Configuración de la Ranura Activa con Contadores de Cantidad */}
          {slots[activeSlotIndex] && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                <div className="flex-1 w-full sm:w-auto">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    {unitLabel} #{activeSlotIndex + 1} — Nombre / Persona (Opcional)
                  </label>
                  <input
                    type="text"
                    value={slots[activeSlotIndex].name || ''}
                    onChange={(e) => handleSlotNameChange(e.target.value)}
                    placeholder="Ej. Juan, María... (Opcional)"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-[#fe6712] focus:outline-none transition"
                  />
                </div>

                {slots.length > 1 && (
                  <button
                    type="button"
                    onClick={copyCurrentSlotToAll}
                    className="text-[10px] font-black text-[#fe6712] hover:bg-orange-50 px-2.5 py-1.5 rounded-xl border border-orange-200 transition cursor-pointer flex items-center gap-1.5 shrink-0 self-end sm:self-auto"
                    title="Aplica variantes y exclusiones de esta unidad a todas"
                  >
                    {copiedFeedback ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFeedback ? '¡Copiado a todas!' : 'Copiar a todas'}</span>
                  </button>
                )}
              </div>

              {/* Grupos y Opciones con Contadores de Cantidad en la Ranura */}
              {availableGroups.length > 0 && availableGroups.map((group: any, gIdx: number) => {
                const currentSlotVars = slots[activeSlotIndex].selectedVariants[gIdx];
                return (
                  <div key={gIdx} className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{group.title}</span>
                      <span className="text-[9px] font-bold text-slate-400">{group.subtitle || 'Ajusta las cantidades'}</span>
                    </div>
                    <div className="flex flex-col gap-2.5 w-full">
                      {group.options.map((opt: any) => {
                        const matched = Array.isArray(currentSlotVars)
                          ? currentSlotVars.find((i: any) => i.code === opt.code || i.id === opt.code)
                          : null;
                        const countVal = matched ? (matched.count || 0) : 0;

                        const { priceLabel, bsLabel } = getOptionPriceLabels(opt.price, false, bcvRate);
                        if (isCheckinGroup(group)) {
                          return (
                            <OptionCapsule
                              key={opt.code}
                              mode="single"
                              name={opt.name}
                              image={opt.image}
                              priceLabel={priceLabel}
                              bsLabel={bsLabel}
                              count={countVal}
                              onSelect={() => handleSlotCheckboxToggle(activeSlotIndex, gIdx, opt.code)}
                            />
                          );
                        }
                        return (
                          <OptionCapsule
                            key={opt.code}
                            mode="counter"
                            name={opt.name}
                            image={opt.image}
                            priceLabel={priceLabel}
                            bsLabel={bsLabel}
                            count={countVal}
                            onIncrement={() => handleSlotOptionQuantityChange(gIdx, opt.code, 1)}
                            onDecrement={() => handleSlotOptionQuantityChange(gIdx, opt.code, -1)}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Exclusiones de la Ranura Activa */}
              {nicheEngine === 'FOOD_FAST' && product.exclusions && product.exclusions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-[#fe6712] uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Exclusiones para esta unidad:
                    </span>
                    {slots[activeSlotIndex].exclusions?.length > 0 && (
                      <button
                        type="button"
                        onClick={resetCurrentSlotToConTodo}
                        className="text-[9px] font-black text-slate-500 hover:text-slate-800 underline cursor-pointer"
                      >
                        Con Todo
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {product.exclusions.map((exc: string) => {
                      const isChecked = slots[activeSlotIndex].exclusions?.includes(exc);
                      return (
                        <label
                          key={exc}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-[11px] font-bold cursor-pointer transition shadow-2xs ${
                            isChecked
                              ? 'bg-red-50/50 border-red-200 text-red-700'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-orange-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSlotExclusion(exc)}
                            className="w-3.5 h-3.5 accent-[#fe6712] rounded cursor-pointer"
                          />
                          <span className={`truncate ${isChecked ? 'line-through opacity-80' : ''}`}>{exc}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navegación entre ranuras */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveSlotIndex(prev => Math.max(0, prev - 1))}
                  disabled={activeSlotIndex === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>

                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {unitLabel} #{activeSlotIndex + 1} de {slots.length}
                </span>

                {activeSlotIndex < slots.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveSlotIndex(prev => Math.min(slots.length - 1, prev + 1))}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition cursor-pointer"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Listas para pedir
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Modo Estándar */
        <div className="space-y-4">
          {nicheEngine === 'FOOD_FAST' && product.exclusions && product.exclusions.length > 0 && (
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
              <div className="flex-1 overflow-y-auto md:overflow-hidden min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6 items-start md:h-full">
                  {/* Columna Izquierda (Mitad 50% - Anclada / Sin Scroll) */}
                  <div className="w-full flex flex-col justify-between md:h-full overflow-hidden bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 gap-3">
                    {/* Imagen del producto */}
                    <div className="relative flex items-center justify-center w-full rounded-2xl border border-slate-200/80 bg-white overflow-hidden p-4 h-36 sm:h-40 md:h-44 shrink-0 shadow-xs">
                      <img
                        src={product.image || product.img}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain"
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
                      <div className="flex justify-between items-baseline">
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{isSlotMode ? 'Precio Configurado' : 'Precio Base'}</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-slate-900">
                              ${(isSlotMode ? (unitPrice * qty + totalSlotVariantsPrice) : ((unitPrice + totalVariantsPrice) * qty)).toFixed(2)}
                            </span>
                            {bcvRate && (
                              <span className="text-xs font-bold text-slate-500">
                                ~ Bs. {((isSlotMode ? (unitPrice * qty + totalSlotVariantsPrice) : ((unitPrice + totalVariantsPrice) * qty)) * bcvRate).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
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
                  <div className="w-full flex flex-col flex-1 overflow-hidden min-h-0 bg-white md:h-full">
                    {/* Cabecera */}
                    <div className="pb-3 border-b border-slate-100 shrink-0">
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
                    <div className="w-full flex-1 max-h-[460px] md:max-h-[500px] overflow-y-auto pr-2 pt-3 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400">
                      {renderVariantsAndSlots()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* LAYOUT ESTÁNDAR PARA PRODUCTOS SIMPLES / MEDICAMENTOS */
              <div className="flex flex-col h-full overflow-y-auto md:overflow-hidden">
                {/* Cabecera Fija */}
                <div className="shrink-0 p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 items-start bg-white z-20 shadow-sm border-b border-slate-100">
                  {/* Columna Izquierda: Imagen, Precio y Cantidad */}
                  <div className="flex flex-col gap-2.5">
                    <div className="relative flex items-center justify-center w-full rounded-xl border border-slate-200/80 bg-white overflow-hidden p-4 h-36 sm:h-48">
                      <img src={product.image || product.img} alt={product.name} className="max-w-full max-h-full object-contain" onError={(e:any)=>{e.target.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60'}} />
                    </div>
                    <div className="flex items-center justify-center gap-1.5 rounded-lg bg-sky-50/70 border border-sky-200/60 px-2.5 py-1 text-sky-800">
                      <svg className="w-3.5 h-3.5 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[10px] font-semibold tracking-tight">Entrega estimada: 30 a 45 min en tu dirección</span>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl border border-slate-100 flex flex-col p-3 gap-3">
                      <div className="flex justify-between items-baseline">
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Precio Base</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-slate-900">
                              ${(unitPrice * qty).toFixed(2)}
                            </span>
                            {bcvRate ? <span className="text-xs font-bold text-slate-500">
                              ~ Bs. {((unitPrice * qty) * bcvRate).toFixed(2)}
                            </span> : null}
                          </div>
                        </div>
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
                
                {/* Opciones con Scroll */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
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

        <div className="sticky bottom-0 bg-white border-t border-slate-100 z-30 shrink-0 shadow-md pb-[max(0.75rem,env(safe-area-inset-bottom))]">

          {/* ── Panel Colaborativo (visible cuando la sala está activa) ───── */}
          {hasVariants && showComboPanel && comboRoomId && (
            <div className="border-b border-slate-100 px-4 py-3 space-y-3 bg-orange-50/40">
              {/* Cabecera del panel */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#fe6712] flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 leading-none">Combo en Vivo</p>
                    <p className="text-[10px] text-slate-500 font-medium">Sala #{comboRoomId}</p>
                  </div>
                </div>
                {/* Indicador de estado */}
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${comboAllDone ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  {comboRoomSlots.filter(s => !!s.completedAt).length}/{comboRoomSlots.length} listos
                </span>
              </div>

              {/* Lista de ranuras */}
              <div className="grid grid-cols-2 gap-1.5">
                {comboRoomSlots.map((slot: any, i: number) => (
                  <div key={i} className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 ${slot.completedAt ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                    <span className={`text-[10px] font-black px-1 py-0.5 rounded ${slot.completedAt ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{i + 1}</span>
                    <span className={`text-[11px] font-bold truncate ${slot.completedAt ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {slot.guestName || 'Libre'}
                    </span>
                    {slot.completedAt && (
                      <svg className="w-3 h-3 text-emerald-500 shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>

              {/* Botones de compartir */}
              <div className="flex gap-2">
                {/* WhatsApp */}
                <a
                  href={whatsappComboUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20BD5C] text-white font-black text-[11px] rounded-xl py-2 transition active:scale-95 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Compartir por WhatsApp
                </a>

                {/* Copiar enlace */}
                <button
                  type="button"
                  onClick={handleCopyComboLink}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 font-black text-[11px] border transition active:scale-95 cursor-pointer ${comboCopied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                  {comboCopied ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3" />
                    </svg>
                  )}
                  {comboCopied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          )}

          {/* ── Barra de precio + botones de acción ─────────────────────── */}
          <div className="p-4 sm:p-5 md:px-6 md:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="shrink-0">
                <span className="text-[10px] font-black text-slate-400 uppercase block mb-0.5">Total a Pagar</span>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5">
                  <span className="text-xl font-black text-slate-900 leading-none">${totalCalculated.toFixed(2)}</span>
                  {bcvRate ? <span className="text-xs font-bold text-slate-500">/ Bs. {(totalCalculated * bcvRate).toFixed(2)}</span> : null}
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-1 items-end">
                {/* Botón "Armar con Amigos" — solo en productos con variantes, paso 1, sin upsells */}
                {hasVariants && step === 1 && !showComboPanel && (
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
                  <div className="flex gap-2 justify-end w-full max-w-[240px]">
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
                      disabled={!isMinimumsMet || (showComboPanel && !comboAllDone)}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.98] ${
                        isMinimumsMet && !(showComboPanel && !comboAllDone)
                          ? 'bg-[#fe6712] hover:bg-[#e05509] text-white cursor-pointer'
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      }`}
                    >
                      <svg className={`w-4 h-4 ${isMinimumsMet && !(showComboPanel && !comboAllDone) ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>
                        {showComboPanel && !comboAllDone
                          ? 'Esperando amigos…'
                          : (showComboPanel && comboAllDone)
                          ? `Agregar combo al carrito ($${totalCalculated.toFixed(2)})`
                          : isMinimumsMet
                          ? `Comprar • $${totalCalculated.toFixed(2)}`
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
