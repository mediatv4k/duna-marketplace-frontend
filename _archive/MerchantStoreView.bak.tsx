/**
 * ==============================================================================
 * BITÁCORA DE ACTUALIZACIÓN - MOTOR MAESTRO D'UNA MARKETPLACE
 * ==============================================================================
 * Fecha: Miércoles, 09 de Septiembre de 2026
 * Arquitectura: Puente "onForceOpenCart" restaurado para retroceso fluido
 * Archivo: src/components/MerchantStoreView.tsx
 * ==============================================================================
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Search, Star, Clock,
  ShoppingBag, Plus, ArrowRight, Truck, Car, Bike, PackageOpen
} from 'lucide-react';
import { getBCVRate } from '@/lib/bcvRate';
import CartModal, { CartItem } from './CartModal';
import VariantModal, { VariantSelectionPayload } from './VariantModal';
import MasterProductModal from './MasterProductModal';

interface Product {
  code: string;
  category: string;
  name: string;
  desc: string;
  price: number;
  image: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface MerchantStoreViewProps {
  merchant: {
    id: string;
    name: string;
    category: string;
    rating: number;
    deliveryTime: string;
    deliveryFee: string;
    image: string;
    badge: string;
    rewardMode?: 'DYNAMIC' | 'FIXED';
    isNationalShippingEnabled?: boolean;
    preferredNationalCouriers?: string[];
  };
  products: Product[];
  onBack: () => void;
  onOpenCheckout: (summary: any) => void;
  // NUEVO: Propiedad para que el padre pueda decirle a la tienda que abra su carrito
  forceOpenCartTrigger?: number;
}

export default function MerchantStoreView({
  merchant,
  products,
  onBack,
  onOpenCheckout,
  forceOpenCartTrigger = 0
}: MerchantStoreViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showLeaveAlert, setShowLeaveAlert] = useState(false);

  // Modales de Productos
  const [activeProductForVariant, setActiveProductForVariant] = useState<Product | null>(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);

  // Modal de Simulación Logística (Grupo Bitmar)
  const [isFleetModalOpen, setIsFleetModalOpen] = useState(false);
  const [fleetQty, setFleetQty] = useState(1);

  const [bcvRate, setBcvRate] = useState<number>(48.50);
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup' | 'national'>('delivery');
  const [rewardMode, setRewardMode] = useState<'DYNAMIC' | 'FIXED'>(merchant.rewardMode || 'DYNAMIC');
  const [challengeTarget, setChallengeTarget] = useState<number>(15);

  useEffect(() => {
    getBCVRate().then(rate => setBcvRate(rate));
  }, []);

  // EFECTO MÁGICO: Escucha cuando el padre (page.tsx) ordena abrir el carrito
  useEffect(() => {
    if (forceOpenCartTrigger > 0) {
      setIsCartOpen(true);
    }
  }, [forceOpenCartTrigger]);

  const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.desc && p.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  filteredProducts.sort((a, b) => {
    if (a.status === 'ACTIVE' && b.status === 'INACTIVE') return -1;
    if (a.status === 'INACTIVE' && b.status === 'ACTIVE') return 1;
    return 0;
  });

  const generateConfigHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  };

  const handleProductClick = (product: Product) => {
    setActiveProductForVariant(product);

    if (
      product.code.startsWith('MF') ||
      (product as any).isCombo ||
      product.category === 'COMBOS' ||
      /combo/i.test(product.name)
    ) {
      setIsMasterModalOpen(true);
      return;
    }
    if (product.code === 'H001-004') {
      setIsVariantModalOpen(true);
      return;
    }
    if (product.code === 'BM001-016') {
      setFleetQty(1);
      setIsFleetModalOpen(true);
      return;
    }

    addToCartDirect(product, product.price, product.name, product.code, 1);
  };

  const addToCartDirect = (
    product: Product,
    customPrice?: number,
    customName?: string,
    customKey?: string,
    quantity: number = 1,
    breakdown?: string[]
  ) => {
    const priceToUse = customPrice !== undefined ? customPrice : product.price;
    const nameToUse = customName || product.name;
    const uniqueKey = customKey || product.code;

    setCart(prev => {
      const existing = prev[uniqueKey];
      if (existing) {
        return {
          ...prev,
          [uniqueKey]: {
            ...existing,
            qty: existing.qty + quantity,
            breakdown: (breakdown && breakdown.length > 0) ? breakdown : existing.breakdown
          }
        };
      }
      return {
        ...prev,
        [uniqueKey]: {
          ...product,
          code: uniqueKey,
          name: nameToUse,
          price: priceToUse,
          qty: quantity,
          breakdown: breakdown || []
        }
      };
    });
  };

  const handleAddMasterVariantToCart = (payload: any) => {
    if (!activeProductForVariant) return;

    // Normalización retrocompatible: acepta qty/quantity y totalPrice/totalUSD
    const quantity = payload?.qty ?? payload?.quantity ?? 1;
    const rawTotal = payload?.totalUSD ?? payload?.totalPrice ?? (activeProductForVariant.price * quantity);
    const unitPrice = quantity > 0 ? rawTotal / quantity : rawTotal;

    // Hash determinístico único por configuración de ranuras
    const configSignature = (payload?.breakdown && Array.isArray(payload.breakdown) && payload.breakdown.length > 0)
      ? payload.breakdown.join('__')
      : (payload?.summaryText || '');
    const configHash = configSignature ? generateConfigHash(configSignature) : 'std';
    const compositeKey = `${activeProductForVariant.code}-${configHash}`;

    addToCartDirect(
      activeProductForVariant,
      unitPrice,
      activeProductForVariant.name,
      compositeKey,
      quantity,
      payload?.breakdown
    );
    setIsMasterModalOpen(false);
  };

  const updateQty = (code: string, delta: number) => {
    setCart(prev => {
      const existing = prev[code];
      if (!existing) return prev;
      const newQty = existing.qty + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[code];
        return copy;
      }
      return { ...prev, [code]: { ...existing, qty: newQty } };
    });
  };

  const cartItems = Object.values(cart);
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const subtotalUSD = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  useEffect(() => { if (totalItems === 0 && isCartOpen) setIsCartOpen(false); }, [totalItems, isCartOpen]);
  useEffect(() => {
    if (rewardMode === 'FIXED') setChallengeTarget(15);
    else {
      if (subtotalUSD === 0 || subtotalUSD < 15) setChallengeTarget(15);
      else if (challengeTarget <= 15) setChallengeTarget(subtotalUSD + 5);
    }
  }, [rewardMode, subtotalUSD, challengeTarget]);

  const handleOpenCart = () => {
    if (rewardMode === 'FIXED') setChallengeTarget(15);
    else setChallengeTarget(subtotalUSD < 15 ? 15 : subtotalUSD + 5);
    setIsCartOpen(true);
  };

  const metaEnvioGratis = rewardMode === 'FIXED' ? 15 : challengeTarget;
  const faltaParaEnvioGratis = Math.max(0, metaEnvioGratis - subtotalUSD);
  const progresoEnvio = Math.min(100, (subtotalUSD / metaEnvioGratis) * 100);
  const esEnvioGratis = subtotalUSD > 0 && faltaParaEnvioGratis === 0;

  const discountDelivery = 2.23;
  const deliveryCost = subtotalUSD > 0 && deliveryMode === 'delivery' ? (esEnvioGratis ? 0 : discountDelivery) : 0;
  const totalUSD = subtotalUSD + deliveryCost;

  const handleNavigationBack = () => {
    if (totalItems > 0) setShowLeaveAlert(true);
    else onBack();
  };

  const getFleetDetails = (qty: number) => {
    if (qty === 1) return { type: 'Moto (Bolso Térmico)', icon: Bike, color: 'text-emerald-500', bg: 'bg-emerald-50', limit: 'Máx. 1 unidad' };
    if (qty >= 2 && qty <= 9) return { type: 'Vehículo Sedán', icon: Car, color: 'text-blue-500', bg: 'bg-blue-50', limit: '2 a 9 unidades' };
    if (qty >= 10 && qty <= 49) return { type: 'Camioneta Cargo', icon: Truck, color: 'text-amber-500', bg: 'bg-amber-50', limit: '10 a 49 unidades' };
    return { type: 'Camión 350 (Carga Pesada)', icon: Truck, color: 'text-rose-600', bg: 'bg-rose-50', limit: '50+ unidades' };
  };
  const fleetInfo = getFleetDetails(fleetQty);
  const FleetIcon = fleetInfo.icon;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-[#fe6712] selection:text-white relative">

      <div className="bg-[#090d16] text-white text-xs py-2 px-4 md:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={handleNavigationBack} className="flex items-center gap-1.5 text-slate-300 hover:text-white transition cursor-pointer font-bold">
            <ArrowLeft className="h-4 w-4 text-[#fe6712]" />
            <span>Volver al Directorio de Tiendas</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-slate-200">Tasa BCV Activa: <strong>Bs. {bcvRate.toFixed(2)}</strong></span>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-slate-200">
        <div className="h-48 md:h-64 w-full relative overflow-hidden bg-slate-900">
          <img src={merchant.image} alt={merchant.name} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          <button
            type="button"
            onClick={handleNavigationBack}
            className="absolute top-4 right-4 md:top-6 md:right-8 z-20 w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-white shadow-lg border border-white/50 flex items-center justify-center overflow-hidden transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <img src="/images/isotipo-duna.png" alt="D'una" className="w-[85%] h-[85%] object-contain" onError={(e: any) => { e.target.src = 'https://ui-avatars.com/api/?name=D&background=fe6712&color=fff&rounded=true&bold=true'; }} />
          </button>

          <div className="absolute bottom-6 left-4 md:left-8 right-4 md:right-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-white">
            <div className="space-y-1">
              <span className="bg-[#fe6712] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">{merchant.badge}</span>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight">{merchant.name}</h1>
              <p className="text-xs text-slate-300 font-medium flex items-center gap-3">
                <span>{merchant.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-300 font-bold"><Star className="h-3.5 w-3.5 fill-amber-300" /> {merchant.rating}</span>
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-xs font-bold">
              <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-orange-300" /><span>{merchant.deliveryTime}</span></div>
              <span className="opacity-40">|</span>
              <span>Envío: <strong className="text-white">{merchant.deliveryFee}</strong></span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${selectedCategory === cat ? 'bg-[#fe6712] text-white shadow-md shadow-orange-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {cat === 'ALL' ? '✨ Todo el Catálogo' : cat}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar en esta tienda..." className="w-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[#fe6712] focus:bg-white transition" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex-1 space-y-6 pb-28">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Productos Disponibles ({filteredProducts.length})</h3>
          <span className="text-xs text-slate-400 font-bold">Sincronizado Base de Datos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map(product => {
            const isSoldOut = product.status === 'INACTIVE';
            const priceBs = product.price ? (product.price * bcvRate).toFixed(2) : '9.30';

            let btnText = "Agregar";
            if (product.code.startsWith('MF') || product.code === 'H001-004') btnText = "Armar";
            if (product.code === 'BM001-016') btnText = "Evaluar Envío";

            return (
              <div key={product.code} className={`bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between transition-all duration-300 relative group ${isSoldOut ? 'opacity-60 bg-slate-50' : 'hover:shadow-lg hover:-translate-y-1'}`}>
                <span className="absolute top-3 left-3 z-10 bg-slate-100 text-slate-700 text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase">{product.category}</span>
                <div>
                  <div className="w-full h-40 bg-slate-50 rounded-xl flex items-center justify-center p-2 mb-3 overflow-hidden relative border border-slate-100">
                    <img src={product.image} alt={product.name} className={`max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 ${isSoldOut ? 'grayscale' : ''}`} onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60'; }} />
                    {isSoldOut && <span className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-xs font-black text-slate-800 text-xs uppercase tracking-widest rounded-xl">Agotado</span>}
                  </div>
                  <span className="text-[9px] font-bold text-[#fe6712] uppercase tracking-wider block">{product.code}</span>
                  <h4 className="text-xs font-black text-slate-900 leading-tight line-clamp-2 mt-0.5">{product.name}</h4>
                  <p className="text-[10px] text-slate-500 font-medium line-clamp-2 mt-1">{product.desc || 'Producto verificado de calidad.'}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-base font-black text-slate-900">${product.price.toFixed(2)}</span>
                    <span className="text-[9px] text-slate-400 font-bold block">~ Bs. {priceBs}</span>
                  </div>
                  <button
                    disabled={isSoldOut}
                    onClick={() => handleProductClick(product)}
                    className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center gap-1 shadow-sm ${
                      isSoldOut ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#0f172a] hover:bg-[#fe6712] text-white cursor-pointer active:scale-95'
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{btnText}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {totalItems > 0 && (
        <div className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto z-50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-[#0f172a] text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#fe6712] flex items-center justify-center font-black text-white shadow"><ShoppingBag className="h-5 w-5" /></div>
              <div>
                <p className="text-[10px] text-orange-200 font-bold uppercase tracking-wider">{totalItems} producto{totalItems > 1 ? 's' : ''} en bolsa</p>
                <p className="text-base font-black text-white">${totalUSD.toFixed(2)}</p>
              </div>
            </div>
            <button onClick={handleOpenCart} className="bg-[#fe6712] hover:bg-[#e0580d] text-white px-6 py-3 rounded-xl text-xs font-black transition shadow-md active:scale-95 cursor-pointer flex items-center gap-2">
              <span>Tu Pedido y Entrega</span><ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {showLeaveAlert && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-orange-100 text-[#fe6712] rounded-full flex items-center justify-center mb-4"><ShoppingBag className="w-7 h-7" /></div>
            <h3 className="text-[18px] font-black text-slate-900 mb-2">¡Completa tu pedido primero!</h3>
            <p className="text-[13px] text-slate-500 font-medium mb-6 leading-relaxed">Tienes productos listos para ser enviados en tu bolsa. Para explorar otros comercios, finaliza tu pago y te los llevaremos D'una.</p>
            <div className="flex flex-col w-full gap-2">
              <button onClick={() => { setShowLeaveAlert(false); handleOpenCart(); }} className="w-full bg-[#fe6712] hover:bg-[#e0580d] text-white font-black py-3.5 rounded-full transition shadow-md text-[13px] active:scale-95 cursor-pointer">IR A PAGAR</button>
              <button onClick={() => setShowLeaveAlert(false)} className="w-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold py-3.5 rounded-full transition text-[13px] cursor-pointer">Seguir en esta tienda</button>
            </div>
          </div>
        </div>
      )}

      {isMasterModalOpen && activeProductForVariant && (
        <MasterProductModal
          isOpen={isMasterModalOpen}
          onClose={() => { setIsMasterModalOpen(false); setActiveProductForVariant(null); }}
          product={activeProductForVariant}
          nicheEngine="FOOD_FAST"
          bcvRate={bcvRate}
          onAddToCart={handleAddMasterVariantToCart}
        />
      )}

      <VariantModal
        isOpen={isVariantModalOpen}
        onClose={() => { setIsVariantModalOpen(false); setActiveProductForVariant(null); }}
        onAddToCart={(payload) => {
          const configHash = payload.summaryText ? generateConfigHash(payload.summaryText) : 'std';
          const compositeKey = `${payload.productCode}-${configHash}`;
          addToCartDirect(
            activeProductForVariant!,
            payload.totalPrice,
            payload.productName,
            compositeKey,
            1,
            payload.summaryText ? [payload.summaryText] : []
          );
        }}
      />

      {isFleetModalOpen && activeProductForVariant && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
              <div className="bg-slate-900 text-white p-2.5 rounded-xl"><PackageOpen className="w-5 h-5" /></div>
              <div>
                <h3 className="font-black text-slate-900 text-lg leading-tight">Simulador de Flete</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cálculo Volumétrico Dinámico</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium text-center mb-4">Selecciona cuántos <strong className="text-slate-900">{activeProductForVariant.name}</strong> deseas y mira cómo cambia nuestra flota asignada.</p>

            <div className="flex items-center justify-center gap-4 mb-6">
              <button onClick={() => setFleetQty(Math.max(1, fleetQty - 1))} className="h-10 w-10 rounded-full border border-slate-200 text-slate-600 font-black text-lg hover:bg-slate-50 active:scale-95 cursor-pointer">-</button>
              <span className="text-3xl font-black text-slate-900 w-12 text-center">{fleetQty}</span>
              <button onClick={() => setFleetQty(fleetQty + 1)} className="h-10 w-10 rounded-full bg-[#fe6712] text-white font-black text-lg shadow-md hover:bg-[#e0580d] active:scale-95 cursor-pointer">+</button>
            </div>

            <div className={`p-4 rounded-2xl flex items-center gap-4 mb-6 border border-slate-200 ${fleetInfo.bg} transition-colors duration-300`}>
              <div className={`p-3 bg-white rounded-xl shadow-sm ${fleetInfo.color}`}>
                <FleetIcon className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-0.5">Vehículo Asignado</span>
                <span className={`text-sm font-black ${fleetInfo.color}`}>{fleetInfo.type}</span>
                <span className="text-[10px] text-slate-600 font-bold block mt-1">Capacidad: {fleetInfo.limit}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setIsFleetModalOpen(false)} className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-3 rounded-xl transition text-xs cursor-pointer">Cancelar</button>
              <button
                onClick={() => {
                  addToCartDirect(activeProductForVariant, activeProductForVariant.price, activeProductForVariant.name, activeProductForVariant.code, fleetQty);
                  setIsFleetModalOpen(false);
                }}
                className="w-2/3 bg-[#0f172a] hover:bg-[#fe6712] text-white font-black py-3 rounded-xl transition shadow-md text-xs active:scale-95 cursor-pointer"
              >
                Confirmar Despacho
              </button>
            </div>
          </div>
        </div>
      )}

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        totalItems={totalItems}
        subtotalUSD={subtotalUSD}
        deliveryMode={deliveryMode}
        setDeliveryMode={setDeliveryMode}
        rewardMode={rewardMode}
        setRewardMode={setRewardMode}
        faltaParaEnvioGratis={faltaParaEnvioGratis}
        progresoEnvio={progresoEnvio}
        esEnvioGratis={esEnvioGratis}
        deliveryCost={deliveryCost}
        discountDelivery={discountDelivery}
        totalUSD={totalUSD}
        onUpdateQty={updateQty}
        onOpenCheckout={onOpenCheckout}
        isNationalShippingEnabled={merchant.isNationalShippingEnabled}
      />
    </div>
  );
}