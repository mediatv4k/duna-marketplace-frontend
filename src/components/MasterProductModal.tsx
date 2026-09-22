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
  UtensilsCrossed
} from 'lucide-react';
import { parseDescriptionTags } from '@/lib/productTags';
import ProductTagBadges from './ProductTagBadges';

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
  onSelect?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

// Cápsula táctil de opción. Solo renderiza; la lógica de selección vive en los handlers que recibe.
function OptionCapsule({ name, image, priceLabel, bsLabel, count, mode, onSelect, onIncrement, onDecrement }: OptionCapsuleProps) {
  const isActive = count > 0;
  const shell = `w-full rounded-2xl border p-2.5 transition-all duration-150 ${
    isActive
      ? 'border-[#fe6712] bg-white ring-1 ring-[#fe6712]/30 shadow-sm'
      : 'border-slate-200 bg-white hover:border-slate-300'
  }`;

  const label = (
    <>
      {image && (
        <img src={image} alt={name} className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-slate-800 leading-tight line-clamp-2">{name}</span>
        {priceLabel ? (
          <span className="mt-1 inline-flex items-baseline gap-1.5 text-sm font-black text-[#fe6712]">
            {priceLabel}
            {bsLabel && <span className="text-xs font-bold text-slate-500">· {bsLabel}</span>}
          </span>
        ) : (
          <span className="mt-1 block text-[10px] font-black text-emerald-600">Incluido</span>
        )}
      </div>
    </>
  );

  if (mode === 'single') {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isActive}
        className={`${shell} flex items-center gap-2.5 text-left cursor-pointer active:scale-[0.98]`}
      >
        {label}
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
            isActive ? 'border-[#fe6712] bg-[#fe6712] text-white' : 'border-slate-300 bg-white text-transparent'
          }`}
        >
          <Check className="h-3 w-3 stroke-[3]" />
        </span>
      </button>
    );
  }

  return (
    <div className={`${shell} flex items-center gap-2`}>
      <button
        type="button"
        onClick={onIncrement}
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left cursor-pointer active:scale-[0.98]"
      >
        {label}
      </button>
      <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={onDecrement}
          disabled={count <= 0}
          aria-label={`Quitar ${name}`}
          className="flex h-6 w-6 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>
        <span className={`w-5 text-center text-xs font-black ${isActive ? 'text-[#fe6712]' : 'text-slate-400'}`}>{count}</span>
        <button
          type="button"
          onClick={onIncrement}
          aria-label={`Agregar ${name}`}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fe6712] text-white transition hover:bg-[#e0580d] cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>
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
}

export default function MasterProductModal({
  isOpen,
  onClose,
  product,
  nicheEngine,
  bcvRate,
  onAddToCart,
  initialQty = 1
}: MasterProductModalProps) {
  // Cantidad válida: entero entre 1 y 99
  const startQty = Math.min(Math.max(Math.floor(Number(initialQty)) || 1, 1), 99);
  const [step, setStep] = useState<number>(1);
  const [qty, setQty] = useState<number>(startQty);

  // Estados globales de variantes y exclusiones (modo estándar)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, any>>({});
  const [selectedExclusions, setSelectedExclusions] = useState<string[]>([]);
  const [upsellSelections, setUpsellSelections] = useState<Record<string, any>>({});

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

  // Grupos disponibles para variantes en ranura. Estricta y únicamente datos reales del backend (`product.groups`/
  // `product.slotGroups`, normalizados en MerchantStoreView desde `metadata.variants` real): antes, sin esos datos,
  // se inventaba un grupo demo ("Tocineta Crocante", "Queso Amarillo Extra") para cualquier combo o tienda FOOD_FAST/
  // FOOD_SWEET — datos ficticios llegando a clientes reales, contra la regla de oro "Datos 100% reales" de AGENTS.md.
  // Un producto sin variantes reales simplemente no muestra esta sección (los `.length > 0` que la consumen ya lo cubren).
  const availableGroups = useMemo(() => {
    if (product?.groups && Array.isArray(product.groups) && product.groups.length > 0) {
      return product.groups;
    }
    if (product?.slotGroups && Array.isArray(product.slotGroups) && product.slotGroups.length > 0) {
      return product.slotGroups;
    }
    return [];
  }, [product]);

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

  const [isSlotCustomizationActive, setIsSlotCustomizationActive] = useState<boolean>(false);
  const isSlotMode = isCombo || (qty > 1 && isSlotCustomizationActive);
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
        // Inicializamos con soporte de cantidades o selección por defecto
        initialVars[gIndex] = g.options.map((opt: any, oIdx: number) => ({
          ...opt,
          count: oIdx === 0 && !isCheckinGroup(g) ? 1 : 0
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
            initialVars[idx] = group.options.map((opt: any, oIdx: number) => ({
              ...opt,
              count: oIdx === 0 && !isCheckinGroup(group) ? 1 : 0
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
  }, [product, isOpen, isCombo, baseSlotCount, availableGroups, startQty]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
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
      slots.forEach(slot => {
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
  }, [product, selectedVariants, slots, isSlotMode, upsellSelections, availableGroups]);

  const totalCalculated = useMemo(() => {
    if (isSlotMode) {
      return (unitPrice * qty) + totalSlotVariantsPrice + totalUpsells;
    }
    return ((unitPrice + totalVariantsPrice) * qty) + totalUpsells;
  }, [isSlotMode, unitPrice, qty, totalSlotVariantsPrice, totalVariantsPrice, totalUpsells]);

  // Valida que cada grupo con 'min' (ej. SABORES-6 → min:6) tenga esa cantidad de unidades seleccionadas
  const isMinimumsMet = useMemo(() => {
    if (isSlotMode) return true;
    return availableGroups.every((group: any, gIdx: number) => {
      const min = group.minItems || group.min || 0;
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

    if (isSlotMode) {
      if (isCombo) {
        breakdown.push(`Combo: ${product.name} (${slots.length} unidades)`);
      } else {
        breakdown.push(`Personalización por unidad (${slots.length} unidades)`);
      }

      slots.forEach((slot, idx) => {
        const slotTitle = slot.name?.trim() || '';
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
        breakdown.push([`👤 ${slotHeader}:`, ...slotParts.map((part) => `• ${part}`)].join('\n'));
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
    onClose();
  };

  const getUpsellsByNiche = () => {
    if (nicheEngine === 'FOOD_FAST') {
      return [
        { code: 'UP-FRIES', name: 'Ración de Papas Fritas', price: 4.50, icon: '🍟' },
        { code: 'UP-DRINK', name: 'Refresco Frío (Lata)', price: 2.50, icon: '🥤' }
      ];
    }
    if (nicheEngine === 'FOOD_SWEET') {
      return [
        { code: 'UP-CHOC', name: 'Topping de Chocolate Extra', price: 1.50, icon: '🍫' },
        { code: 'UP-CONES', name: 'Paquete de Conos (6 Und)', price: 2.00, icon: '🍦' }
      ];
    }
    if (nicheEngine === 'BODEGON_MARKET') {
      return [
        { code: 'UP-ICE', name: 'Bolsa de Hielo Gourmet', price: 3.00, icon: '🧊' },
        { code: 'UP-GIFT', name: 'Empaque de Regalo VIP', price: 5.00, icon: '🎁' }
      ];
    }
    return [];
  };
  const currentUpsells = getUpsellsByNiche();

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="bg-white w-full max-w-2xl rounded-t-[2.5rem] sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative z-10 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">

        <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-start bg-white shrink-0">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider">{product.code}</span>
              <span className="text-[10px] font-extrabold text-[#fe6712] bg-[#fff5ed] px-2.5 py-0.5 rounded-md uppercase">{product.category || product.cat || 'PRODUCTO'}</span>
            </div>
            <h3 className="text-lg md:text-2xl font-black text-slate-900 leading-tight">{product.name}</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition shrink-0 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-[6rem_1fr] sm:grid-cols-3 gap-3 sm:gap-4 items-start pb-3 border-b border-gray-100">
                <div className="w-full h-24 sm:h-40 flex items-center justify-center relative">
                  <img src={product.image || product.img} alt={product.name} className="max-h-full max-w-full object-contain" onError={(e:any)=>{e.target.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60'}} />
                </div>
                <div className="sm:col-span-2 space-y-1.5 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{isSlotMode ? 'Precio Configurado' : 'Precio Base'}</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900">
                          ${(isSlotMode ? (unitPrice * qty + totalSlotVariantsPrice) : ((unitPrice + totalVariantsPrice) * qty)).toFixed(2)}
                        </span>
                        {bcvRate ? <span className="text-xs font-bold text-slate-500">
                          ~ Bs. {((isSlotMode ? (unitPrice * qty + totalSlotVariantsPrice) : ((unitPrice + totalVariantsPrice) * qty)) * bcvRate).toFixed(2)}
                        </span> : null}
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Disponible
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs font-bold text-slate-700">Cantidad (Unidades):</span>
                    <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-sm">
                      <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-6 h-6 flex items-center justify-center text-[#fe6712] hover:bg-orange-50 rounded-lg transition cursor-pointer">
                        <Minus className="w-4 h-4 stroke-[3]" />
                      </button>
                      <span className="font-black text-sm w-4 text-center text-slate-900">{qty}</span>
                      <button onClick={() => setQty(qty + 1)} className="w-6 h-6 flex items-center justify-center text-[#fe6712] hover:bg-orange-50 rounded-lg transition cursor-pointer">
                        <Plus className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descripción expandida (2026-09-22): antes vivía angosta, junto al precio/cantidad; ahora a todo lo ancho,
                  debajo del bloque de imagen+precio+cantidad, sin truncar (el cliente la lee completa). */}
              <div className="w-full">
                <p className="w-full text-sm text-gray-600 mt-4 mb-4 leading-relaxed whitespace-pre-line">{cleanDescription || 'Configura las opciones para este artículo.'}</p>
                <ProductTagBadges tags={descriptionTags} className="mb-4" />
              </div>

              {/* Banner de personalización por unidad: arriba (debajo de la cantidad), visible sin scroll */}
                {qty > 1 && !isCombo && !isSlotMode && (
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
                <div key={gIdx} className="pb-4 border-b border-gray-100 space-y-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{group.title}</h4>
                    <p className="text-[10px] text-slate-500 font-bold">{group.subtitle || (group.selectType === 'SINGLE' ? 'Elige una opción' : 'Ajusta las cantidades por sabor u opción')}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.options.map((opt: any) => {
                      const currentSelectionList = selectedVariants[gIdx];
                      const matchedItem = Array.isArray(currentSelectionList)
                        ? currentSelectionList.find((i: any) => i.code === opt.code || i.id === opt.code)
                        : null;
                      const currentCount = matchedItem ? (matchedItem.count || 0) : (opt.code === group.options[0]?.code ? 1 : 0);

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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                      {/* Firma D'una (exclusiones): solo comida rápida (nicheEngine FOOD_FAST) — no aplica a heladerías, bodegones, etc. */}
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

                  {/* Firma D'una (exclusiones): solo comida rápida (nicheEngine FOOD_FAST) — no aplica a heladerías, bodegones, etc. */}
                  {nicheEngine === 'FOOD_FAST' && product.exclusions && product.exclusions.length > 0 && (
                    <div className="pb-4 border-b border-gray-100 space-y-3">
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
            </div>
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

        <div className="p-5 sm:p-6 border-t border-slate-100 bg-white shrink-0 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-4">
            <div className="shrink-0">
              <span className="text-[10px] font-black text-slate-400 uppercase block mb-0.5">Total a Pagar</span>
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5">
                <span className="text-xl font-black text-slate-900 leading-none">${totalCalculated.toFixed(2)}</span>
                {bcvRate ? <span className="text-xs font-bold text-slate-500">/ Bs. {(totalCalculated * bcvRate).toFixed(2)}</span> : null}
              </div>
            </div>

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
                <span>Continuar</span> <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2 flex-1 justify-end">
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
                  disabled={!isMinimumsMet}
                  className={`flex-[2] max-w-[220px] font-black py-3.5 px-4 rounded-2xl transition shadow-md text-[11px] sm:text-xs flex items-center justify-center gap-2 active:scale-95 ${
                    isMinimumsMet
                      ? 'bg-[#fe6712] hover:bg-[#e0580d] text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 hidden sm:block" />
                  <span>Agregar al Pedido</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}