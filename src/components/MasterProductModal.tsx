'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, ArrowRight, ShoppingCart, Plus, Minus, Info, Users, Sparkles } from 'lucide-react';

export interface VariantSelectionPayload {
  productCode: string;
  productName: string;
  totalPrice: number;
  qty: number;
  summaryText: string;
  breakdown: string[];
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

  // Estados globales de exclusiones (si van todas iguales)
  const [selectedExclusions, setSelectedExclusions] = useState<string[]>([]);
  
  // MODO FAMILIA: Personalización independiente por unidad
  const [customizePerUnit, setCustomizePerUnit] = useState<boolean>(false);
  const [activeUnitTab, setActiveUnitTab] = useState<number>(0);
  const [unitNamesMap, setUnitNamesMap] = useState<Record<number, string>>({});
  const [unitExclusionsMap, setUnitExclusionsMap] = useState<Record<number, string[]>>({});

  const [selectedVariants, setSelectedVariants] = useState<Record<string, any>>({});
  const [upsellSelections, setUpsellSelections] = useState<Record<string, any>>({});

  useEffect(() => {
    if (product && isOpen) {
      setStep(1);
      setQty(1);
      setSelectedExclusions([]);
      setCustomizePerUnit(false);
      setActiveUnitTab(0);
      setUnitNamesMap({});
      setUnitExclusionsMap({});
      setUpsellSelections({});
      
      const initialVariants: Record<string, any> = {};
      if (product.groups && Array.isArray(product.groups)) {
        product.groups.forEach((group: any, idx: number) => {
          if (group.type === 'SIZE_RADIO' && group.options?.length > 0) {
            initialVariants[idx] = group.options[0];
          }
        });
      }
      setSelectedVariants(initialVariants);
    }
  }, [product, isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Sincronizar mapas cuando cambia la cantidad (qty)
  useEffect(() => {
    const newExclMap = { ...unitExclusionsMap };
    const newNamesMap = { ...unitNamesMap };
    for (let i = 0; i < qty; i++) {
      if (!newExclMap[i]) newExclMap[i] = [...selectedExclusions];
      if (!newNamesMap[i]) newNamesMap[i] = `Persona #${i + 1}`;
    }
    setUnitExclusionsMap(newExclMap);
    setUnitNamesMap(newNamesMap);
  }, [qty]);

  const { unitPrice, totalVariantsPrice, totalUpsells } = useMemo(() => {
    let base = product?.price || 0;
    let variantsExtra = 0;
    let upsellsExtra = 0;

    Object.keys(selectedVariants).forEach(key => {
      const selection = selectedVariants[key];
      if (!selection) return;

      if (Array.isArray(selection)) {
        selection.forEach(item => {
          if (item.count > 0 && item.price > 0 && item.affects !== 'CAMBIA') {
            variantsExtra += (item.price * item.count);
          }
        });
      } else {
        if (selection.affects === 'CAMBIA' || selection.effect === 'BASE') {
          base = selection.price; 
        } else if (selection.price > 0) {
          variantsExtra += selection.price; 
        }
      }
    });

    Object.values(upsellSelections).forEach(upsell => {
      upsellsExtra += upsell.price;
    });

    return {
      unitPrice: base,
      totalVariantsPrice: variantsExtra,
      totalUpsells: upsellsExtra
    };
  }, [product, selectedVariants, upsellSelections]);

  const totalCalculated = ((unitPrice + totalVariantsPrice) * qty) + totalUpsells;

  const toggleExclusion = (exc: string) => {
    if (customizePerUnit) {
      setUnitExclusionsMap(prev => {
        const currentList = prev[activeUnitTab] || [];
        const updatedList = currentList.includes(exc) 
          ? currentList.filter(i => i !== exc) 
          : [...currentList, exc];
        return { ...prev, [activeUnitTab]: updatedList };
      });
    } else {
      setSelectedExclusions(prev => 
        prev.includes(exc) ? prev.filter(i => i !== exc) : [...prev, exc]
      );
    }
  };

  const handleUnitNameChange = (name: string) => {
    setUnitNamesMap(prev => ({ ...prev, [activeUnitTab]: name }));
  };

  const handleRadioChange = (groupIdx: number, option: any) => {
    setSelectedVariants(prev => ({ ...prev, [groupIdx]: option }));
  };

  const toggleUpsell = (upsellItem: any) => {
    setUpsellSelections(prev => {
      const copy = { ...prev };
      if (copy[upsellItem.code]) delete copy[upsellItem.code];
      else copy[upsellItem.code] = upsellItem;
      return copy;
    });
  };

  const handleNextStep = () => {
    if (['TECH_HARDWARE', 'PHARMACY'].includes(nicheEngine)) {
      handleAddToCart();
    } else {
      setStep(2);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    let breakdown: string[] = [];
    
    Object.keys(selectedVariants).forEach(key => {
      const sel = selectedVariants[key];
      if (Array.isArray(sel)) {
        sel.forEach(item => {
          if (item.count > 0) breakdown.push(`${item.name} (${item.count})`);
        });
      } else if (sel && sel.name) {
        breakdown.push(`Selección: ${sel.name}`);
      }
    });

    // Desglose Inteligente por Unidad (Modo Familia)
    if (customizePerUnit && qty > 1) {
      breakdown.push(`--- Detalle por Persona ---`);
      for (let i = 0; i < qty; i++) {
        const uName = unitNamesMap[i] || `Persona #${i + 1}`;
        const uList = unitExclusionsMap[i] || [];
        if (uList.length > 0) {
          breakdown.push(`👤 [${uName}]: Sin ${uList.join(', ')}`);
        } else {
          breakdown.push(`👤 [${uName}]: Con todo (Estándar)`);
        }
      }
    } else {
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
      qty: qty,
      summaryText: breakdown.join(' | '),
      breakdown: breakdown
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
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Precio Base</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900">${(unitPrice + totalVariantsPrice).toFixed(2)}</span>
                        <span className="text-xs font-bold text-slate-500">~ Bs. {((unitPrice + totalVariantsPrice) * bcvRate).toFixed(2)}</span>
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

              {product.groups && product.groups.map((group: any, gIdx: number) => (
                <div key={gIdx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{group.title}</h4>
                    <p className="text-[10px] text-slate-500 font-bold">{group.subtitle || 'Selecciona una opción'}</p>
                  </div>
                  
                  {group.type === 'SIZE_RADIO' && (
                    <div className="grid grid-cols-2 gap-2">
                      {group.options.map((opt: any) => (
                        <button
                          key={opt.code}
                          onClick={() => handleRadioChange(gIdx, opt)}
                          className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${selectedVariants[gIdx]?.code === opt.code ? 'border-[#fe6712] bg-[#fff5ed] shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                        >
                          <span className={`text-xs ${selectedVariants[gIdx]?.code === opt.code ? 'text-[#fe6712] font-black' : 'text-slate-700 font-bold'}`}>{opt.name}</span>
                          <span className="text-sm font-black text-slate-900 mt-1">${opt.price.toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* MODO FAMILIA: EXCLUSIONES E INTELIGENCIA POR UNIDAD */}
              {product.exclusions && product.exclusions.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50/70 to-amber-50/50 p-4 rounded-2xl border border-orange-200 space-y-3.5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#fe6712]" /> Firma D&apos;una (Exclusiones):
                    </label>

                    {qty > 1 && (
                      <button
                        type="button"
                        onClick={() => setCustomizePerUnit(prev => !prev)}
                        className={`text-[10px] font-black px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                          customizePerUnit 
                            ? 'bg-[#fe6712] text-white border-[#fe6712]' 
                            : 'bg-white text-[#fe6712] border-orange-200 hover:bg-orange-50'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{customizePerUnit ? '✓ Modo Familia Activado' : '¿Personalizar cada unidad individual?'}</span>
                      </button>
                    )}
                  </div>

                  {/* Wizard de Pestañas por Unidad cuando hay más de 1 cantidad */}
                  {customizePerUnit && qty > 1 ? (
                    <div className="space-y-3 pt-2 border-t border-orange-200/60">
                      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                        {Array.from({ length: qty }).map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveUnitTab(idx)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap shadow-2xs ${
                              activeUnitTab === idx
                                ? 'bg-slate-900 text-white'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Unidad #{idx + 1} ({unitNamesMap[idx] || `Persona #${idx + 1}`})
                          </button>
                        ))}
                      </div>

                      <div className="p-3.5 bg-white rounded-2xl border border-orange-100 shadow-2xs space-y-3">
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                            ¿Para quién es la Unidad #{activeUnitTab + 1}? (Nombre)
                          </label>
                          <input 
                            type="text"
                            value={unitNamesMap[activeUnitTab] || ''}
                            onChange={(e) => handleUnitNameChange(e.target.value)}
                            placeholder="Ej. Omar, Esposa, Hijo..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-[#fe6712] focus:outline-none transition"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] font-black text-[#fe6712] uppercase block mb-1.5">
                            Exclusiones para esta unidad:
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {product.exclusions.map((exc: string) => {
                              const currentUnitList = unitExclusionsMap[activeUnitTab] || [];
                              const isExcChecked = currentUnitList.includes(exc);
                              return (
                                <label key={exc} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer shadow-2xs hover:border-[#fe6712] transition">
                                  <input 
                                    type="checkbox" 
                                    checked={isExcChecked}
                                    onChange={() => toggleExclusion(exc)}
                                    className="w-4 h-4 accent-[#fe6712] rounded cursor-pointer"
                                  />
                                  <span className="truncate">{exc}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Comportamiento estándar (Aplicar a todas las unidades por igual)
                    <div className="grid grid-cols-2 gap-2">
                      {product.exclusions.map((exc: string) => (
                        <label key={exc} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer shadow-xs hover:border-[#fe6712] transition">
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