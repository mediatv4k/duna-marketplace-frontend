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
}

interface MasterProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
  nicheEngine: string;
  bcvRate: number;
  onAddToCart: (payload: VariantSelectionPayload) => void;
}

export default function MasterProductModal({
  isOpen,
  onClose,
  product,
  nicheEngine,
  bcvRate,
  onAddToCart
}: MasterProductModalProps) {
  const [step, setStep] = useState<number>(1);
  const [qty, setQty] = useState<number>(1);

  // Estados globales de variantes y exclusiones (modo estándar)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, any>>({});
  const [selectedExclusions, setSelectedExclusions] = useState<string[]>([]);
  const [upsellSelections, setUpsellSelections] = useState<Record<string, any>>({});

  // Detección si el producto es un Combo
  const isCombo = useMemo(() => {
    if (!product) return false;
    if (product.isCombo) return true;
    const cat = (product.category || product.cat || '').toUpperCase();
    if (cat.includes('COMBO')) return true;
    if (product.name && /combo/i.test(product.name)) return true;
    return false;
  }, [product]);

  // Grupos disponibles para variantes en ranura
  const availableGroups = useMemo(() => {
    if (product?.groups && Array.isArray(product.groups) && product.groups.length > 0) {
      return product.groups;
    }
    if (product?.slotGroups && Array.isArray(product.slotGroups) && product.slotGroups.length > 0) {
      return product.slotGroups;
    }
    if (nicheEngine === 'FOOD_FAST' || isCombo) {
      return [
        {
          title: "Sabores / Variantes",
          subtitle: "Selecciona las cantidades para cada opción",
          type: "QUANTITY_GRID",
          options: [
            { code: "VAR-STD", name: "Estándar / Clásico", price: 0 },
            { code: "VAR-BACON", name: "Tocineta Crocante", price: 1.50 },
            { code: "VAR-CHEESE", name: "Queso Amarillo Extra", price: 1.00 }
          ]
        }
      ];
    }
    return [];
  }, [product, nicheEngine, isCombo]);

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
          count: oIdx === 0 ? 1 : 0
        }));
      }
    });

    return {
      id: idx + 1,
      name: existing?.name || `Ranura #${idx + 1}`,
      selectedVariants: existing?.selectedVariants || initialVars,
      exclusions: existing?.exclusions || []
    };
  };

  useEffect(() => {
    if (product && isOpen) {
      setStep(1);
      setQty(1);
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
              count: oIdx === 0 ? 1 : 0
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
  }, [product, isOpen, isCombo, baseSlotCount, availableGroups]);

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
    let base = product?.price || 0;
    let standardVariantsExtra = 0;
    let slotVariantsExtra = 0;
    let upsellsExtra = 0;

    if (!isSlotMode) {
      Object.keys(selectedVariants).forEach(key => {
        const selection = selectedVariants[key];
        if (!selection) return;
        if (Array.isArray(selection)) {
          selection.forEach(item => {
            if ((item.count || 0) > 0 && (item.price || 0) > 0 && item.affects !== 'CAMBIA') {
              standardVariantsExtra += (item.price * item.count);
            }
          });
        } else if (selection.price > 0) {
          standardVariantsExtra += selection.price;
        }
      });
    } else {
      slots.forEach(slot => {
        Object.values(slot.selectedVariants).forEach((selection: any) => {
          if (!selection) return;
          if (Array.isArray(selection)) {
            selection.forEach(item => {
              if ((item.count || 0) > 0 && (item.price || 0) > 0 && item.affects !== 'CAMBIA') {
                slotVariantsExtra += (item.price * item.count);
              }
            });
          } else if (selection.price > 0 && selection.affects !== 'CAMBIA') {
            slotVariantsExtra += selection.price;
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
  }, [product, selectedVariants, slots, isSlotMode, upsellSelections]);

  const totalCalculated = useMemo(() => {
    if (isSlotMode) {
      return (unitPrice * qty) + totalSlotVariantsPrice + totalUpsells;
    }
    return ((unitPrice + totalVariantsPrice) * qty) + totalUpsells;
  }, [isSlotMode, unitPrice, qty, totalSlotVariantsPrice, totalVariantsPrice, totalUpsells]);

  const handleNextStep = () => {
    if (['TECH_HARDWARE', 'PHARMACY'].includes(nicheEngine)) {
      handleAddToCart();
    } else {
      setStep(2);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const breakdown: string[] = [];

    if (isSlotMode) {
      if (isCombo) {
        breakdown.push(`Combo: ${product.name} (${slots.length} ranuras)`);
      } else {
        breakdown.push(`Personalización por ranuras (${slots.length} unidades)`);
      }

      slots.forEach((slot, idx) => {
        const slotTitle = slot.name?.trim() ? slot.name.trim() : `Ranura #${idx + 1}`;
        const slotParts: string[] = [];

        Object.values(slot.selectedVariants).forEach((sel: any) => {
          if (!sel) return;
          if (Array.isArray(sel)) {
            sel.forEach(item => {
              if ((item.count || 0) > 0) {
                if (item.price && item.price > 0) {
                  slotParts.push(`${item.count}x ${item.name} (+$${(item.price * item.count).toFixed(2)})`);
                } else {
                  slotParts.push(`${item.count}x ${item.name}`);
                }
              }
            });
          } else if (sel.name) {
            slotParts.push(sel.name);
          }
        });

        if (slot.exclusions && slot.exclusions.length > 0) {
          slotParts.push(`Sin ${slot.exclusions.join(', ')}`);
        } else {
          slotParts.push('Con Todo');
        }

        breakdown.push(`🍔 [${slotTitle}]: ${slotParts.join(' + ')}`);
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

    onAddToCart({
      productCode: product.code,
      productName: product.name,
      totalPrice: totalCalculated,
      totalUSD: totalCalculated,
      qty: qty,
      quantity: qty,
      summaryText: breakdown.join(' | '),
      breakdown: breakdown,
      slots: isSlotMode ? slots : undefined
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

        <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-start bg-white shrink-0">
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
            <div className="p-5 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-full h-40 bg-white rounded-xl flex items-center justify-center p-2 border border-slate-200 relative">
                  <img src={product.image || product.img} alt={product.name} className="max-h-full max-w-full object-contain" onError={(e:any)=>{e.target.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60'}} />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{isSlotMode ? 'Precio Configurado' : 'Precio Base'}</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900">
                          ${(isSlotMode ? (unitPrice * qty + totalSlotVariantsPrice) : ((unitPrice + totalVariantsPrice) * qty)).toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          ~ Bs. {((isSlotMode ? (unitPrice * qty + totalSlotVariantsPrice) : ((unitPrice + totalVariantsPrice) * qty)) * bcvRate).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Disponible
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{product.desc || product.description || 'Configura las opciones para este artículo.'}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
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

              {/* Variantes Globales con contadores (+ / -) */}
              {!isSlotMode && availableGroups.map((group: any, gIdx: number) => (
                <div key={gIdx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{group.title}</h4>
                    <p className="text-[10px] text-slate-500 font-bold">{group.subtitle || 'Ajusta las cantidades por sabor u opción'}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.options.map((opt: any) => {
                      const currentSelectionList = selectedVariants[gIdx];
                      const matchedItem = Array.isArray(currentSelectionList)
                        ? currentSelectionList.find((i: any) => i.code === opt.code || i.id === opt.code)
                        : null;
                      const currentCount = matchedItem ? (matchedItem.count || 0) : (opt.code === group.options[0]?.code ? 1 : 0);

                      return (
                        <div key={opt.code} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block leading-tight">{opt.name}</span>
                            <span className="text-[10px] font-black text-[#fe6712]">{opt.price > 0 ? `+$${opt.price.toFixed(2)}` : 'Incluido'}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleGlobalOptionQuantityChange(gIdx, opt.code, -1)}
                              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition cursor-pointer shadow-2xs"
                            >
                              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                            <span className="font-black text-xs w-5 text-center text-slate-900">{currentCount}</span>
                            <button
                              type="button"
                              onClick={() => handleGlobalOptionQuantityChange(gIdx, opt.code, 1)}
                              className="w-6 h-6 flex items-center justify-center text-[#fe6712] hover:bg-white rounded-lg transition cursor-pointer shadow-2xs"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* SELECTOR DE COMBOS POR RANURAS / MODO RANURAS */}
              {isSlotMode ? (
                <div className="bg-gradient-to-r from-orange-50/80 via-amber-50/60 to-orange-50/80 p-4 rounded-2xl border border-orange-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#fe6712] text-white flex items-center justify-center">
                          <Layers className="w-3.5 h-3.5" />
                        </span>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          {isCombo ? 'Configuración de Combo por Ranuras' : 'Personalización Individual por Ranuras'}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5 ml-8">
                        Configura las {slots.length} ranuras con sus respectivas cantidades de sabores.
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
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pt-1 border-t border-orange-200/60">
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
                          <span className="truncate max-w-[120px]">{slot.name || `Ranura #${idx + 1}`}</span>
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
                    <div className="p-4 bg-white rounded-2xl border border-orange-100 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                        <div className="flex-1 w-full sm:w-auto">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                            Ranura #{activeSlotIndex + 1} — Nombre / Persona (Opcional)
                          </label>
                          <input
                            type="text"
                            value={slots[activeSlotIndex].name || ''}
                            onChange={(e) => handleSlotNameChange(e.target.value)}
                            placeholder={`Ej. Ranura #${activeSlotIndex + 1}, Omar, Niño...`}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-[#fe6712] focus:outline-none transition"
                          />
                        </div>

                        {slots.length > 1 && (
                          <button
                            type="button"
                            onClick={copyCurrentSlotToAll}
                            className="text-[10px] font-black text-[#fe6712] hover:bg-orange-50 px-2.5 py-1.5 rounded-xl border border-orange-200 transition cursor-pointer flex items-center gap-1.5 shrink-0 self-end sm:self-auto"
                            title="Aplica variantes y exclusiones de esta ranura a todas"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedFeedback ? '✓ ¡Copiado a todas!' : 'Copiar a todas'}</span>
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

                                return (
                                  <div key={opt.code} className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-2 shadow-2xs">
                                    <div className="min-w-0 pr-1">
                                      <span className="text-[11px] font-bold text-slate-800 block leading-tight truncate">{opt.name}</span>
                                      <span className="text-[10px] font-black text-[#fe6712]">{opt.price > 0 ? `+$${opt.price.toFixed(2)}` : 'Incluido'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleSlotOptionQuantityChange(gIdx, opt.code, -1)}
                                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition cursor-pointer shadow-2xs"
                                      >
                                        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                                      </button>
                                      <span className="font-black text-xs w-5 text-center text-slate-900">{countVal}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleSlotOptionQuantityChange(gIdx, opt.code, 1)}
                                        className="w-6 h-6 flex items-center justify-center text-[#fe6712] hover:bg-white rounded-lg transition cursor-pointer shadow-2xs"
                                      >
                                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {/* Exclusiones de la Ranura Activa */}
                      {product.exclusions && product.exclusions.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-[#fe6712] uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" /> Exclusiones para esta ranura:
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
                          Ranura {activeSlotIndex + 1} de {slots.length}
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
                  {qty > 1 && !isCombo && (
                    <div className="bg-orange-50/60 p-3.5 rounded-2xl border border-orange-200 flex justify-between items-center gap-3">
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
                        <span>Activar Ranuras</span>
                      </button>
                    </div>
                  )}

                  {product.exclusions && product.exclusions.length > 0 && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
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
                <span className="text-xs font-bold text-slate-500">/ Bs. {(totalCalculated * bcvRate).toFixed(2)}</span>
              </div>
            </div>

            {step === 1 && currentUpsells.length > 0 ? (
              <button
                onClick={handleNextStep}
                className="flex-[2] max-w-[200px] bg-[#fe6712] hover:bg-[#e0580d] text-white font-black py-3.5 px-4 rounded-2xl transition shadow-md text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
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
                  className="flex-[2] max-w-[220px] bg-[#fe6712] hover:bg-[#e0580d] text-white font-black py-3.5 px-4 rounded-2xl transition shadow-md text-[11px] sm:text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
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