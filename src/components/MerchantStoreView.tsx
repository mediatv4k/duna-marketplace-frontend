'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, Star, Clock, 
  ShoppingBag, Plus, ArrowRight
} from 'lucide-react';
import { getBCVRate } from '@/lib/bcvRate';
import CartModal, { CartItem } from './CartModal';
import VariantModal, { VariantSelectionPayload } from './VariantModal';

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
  };
  products: Product[];
  onBack: () => void;
  onOpenCheckout: (summary: any) => void;
}

export default function MerchantStoreView({ 
  merchant, 
  products, 
  onBack,
  onOpenCheckout
}: MerchantStoreViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showLeaveAlert, setShowLeaveAlert] = useState(false);

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [activeProductForVariant, setActiveProductForVariant] = useState<Product | null>(null);

  const [bcvRate, setBcvRate] = useState<number>(48.50);
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');

  const [rewardMode, setRewardMode] = useState<'DYNAMIC' | 'FIXED'>(
    merchant.rewardMode || 'DYNAMIC'
  );
  const [challengeTarget, setChallengeTarget] = useState<number>(15);

  useEffect(() => {
    getBCVRate().then(rate => setBcvRate(rate));
  }, []);

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

  const handleProductClick = (product: Product) => {
    if (product.code === 'H001-004') {
      setActiveProductForVariant(product);
      setIsVariantModalOpen(true);
      return;
    }
    addToCartDirect(product);
  };

  const addToCartDirect = (product: Product, customPrice?: number, customName?: string, customKey?: string) => {
    const priceToUse = customPrice !== undefined ? customPrice : product.price;
    const nameToUse = customName || product.name;
    const uniqueKey = customKey || product.code;

    setCart(prev => {
      const existing = prev[uniqueKey];
      if (existing) {
        return { ...prev, [uniqueKey]: { ...existing, qty: existing.qty + 1 } };
      }
      return { 
        ...prev, 
        [uniqueKey]: { 
          ...product, 
          code: uniqueKey,
          name: nameToUse,
          price: priceToUse,
          qty: 1 
        } 
      };
    });
  };

  const handleAddVariantToCart = (payload: VariantSelectionPayload) => {
    if (!activeProductForVariant) return;
    const compositeKey = `${payload.productCode}-${Date.now()}`;
    addToCartDirect(
      activeProductForVariant,
      payload.totalPrice,
      `${payload.productName} (${payload.summaryText})`,
      compositeKey
    );
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

  useEffect(() => {
    if (totalItems === 0 && isCartOpen) {
      setIsCartOpen(false);
    }
  }, [totalItems, isCartOpen]);

  useEffect(() => {
    if (rewardMode === 'FIXED') {
      setChallengeTarget(15);
    } else {
      if (subtotalUSD === 0) {
        setChallengeTarget(15);
      } else if (subtotalUSD < 15) {
        setChallengeTarget(15);
      } else if (challengeTarget <= 15) {
        setChallengeTarget(subtotalUSD + 5);
      }
    }
  }, [rewardMode, subtotalUSD, challengeTarget]);

  const handleOpenCart = () => {
    if (rewardMode === 'FIXED') {
      setChallengeTarget(15);
    } else {
      if (subtotalUSD < 15) {
        setChallengeTarget(15);
      } else {
        setChallengeTarget(subtotalUSD + 5);
      }
    }
    setIsCartOpen(true);
  };

  const metaEnvioGratis = rewardMode === 'FIXED' ? 15 : challengeTarget;
  const faltaParaEnvioGratis = Math.max(0, metaEnvioGratis - subtotalUSD);
  const progresoEnvio = Math.min(100, (subtotalUSD / metaEnvioGratis) * 100);
  const esEnvioGratis = subtotalUSD > 0 && faltaParaEnvioGratis === 0;

  const discountDelivery = 2.23; 
  const deliveryCost = subtotalUSD > 0 && deliveryMode === 'delivery' 
    ? (esEnvioGratis ? 0 : discountDelivery) 
    : 0;
  const totalUSD = subtotalUSD + deliveryCost;

  const handleNavigationBack = () => {
    if (totalItems > 0) {
      setShowLeaveAlert(true);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-[#fe6712] selection:text-white">
      
      {/* Topbar */}
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

      {/* Header del Comercio */}
      <div className="bg-white border-b border-slate-200">
        <div className="h-48 md:h-64 w-full relative overflow-hidden bg-slate-900">
          <img src={merchant.image} alt={merchant.name} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          
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

        {/* Filtros */}
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

      {/* Grid de Productos */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex-1 space-y-6 pb-28">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Productos Disponibles ({filteredProducts.length})</h3>
          <span className="text-xs text-slate-400 font-bold">Sincronizado Base de Datos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map(product => {
            const isSoldOut = product.status === 'INACTIVE';
            const priceBs = product.price ? (product.price * bcvRate).toFixed(2) : '9.30'; 

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
                    <span className="text-base font-black text-slate-900">
                      {product.price ? `$${product.price.toFixed(2)}` : '$9.30'}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold block">~ Bs. {priceBs}</span>
                  </div>
                  <button 
                    disabled={isSoldOut} 
                    onClick={() => handleProductClick(product)} 
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1 shadow-sm ${
                      isSoldOut 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                        : product.code === 'H001-004'
                          ? 'bg-[#fe6712] hover:bg-[#e0580d] text-white cursor-pointer active:scale-95'
                          : 'bg-[#0f172a] hover:bg-[#fe6712] text-white cursor-pointer active:scale-95'
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{product.code === 'H001-004' ? 'Armar' : 'Agregar'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Barra Inferior Flotante */}
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

      {/* ALERTA: Salida de la tienda con productos */}
      {showLeaveAlert && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-orange-100 text-[#fe6712] rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-[18px] font-black text-slate-900 mb-2">¡Completa tu pedido primero!</h3>
            <p className="text-[13px] text-slate-500 font-medium mb-6 leading-relaxed">
              Tienes productos listos para ser enviados en tu bolsa. Para explorar otros comercios, finaliza tu pago y te los llevaremos D'una.
            </p>
            <div className="flex flex-col w-full gap-2">
              <button 
                onClick={() => {
                  setShowLeaveAlert(false);
                  handleOpenCart();
                }} 
                className="w-full bg-[#fe6712] hover:bg-[#e0580d] text-white font-black py-3.5 rounded-full transition shadow-md text-[13px] active:scale-95 cursor-pointer"
              >
                IR A PAGAR
              </button>
              <button 
                onClick={() => setShowLeaveAlert(false)} 
                className="w-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold py-3.5 rounded-full transition text-[13px] cursor-pointer"
              >
                Seguir en esta tienda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPONENTE MODULAR DEL CARRITO */}
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
      />

      {/* MODAL DE VARIANTES (PAPÁ HELADO) */}
      <VariantModal
        isOpen={isVariantModalOpen}
        onClose={() => {
          setIsVariantModalOpen(false);
          setActiveProductForVariant(null);
        }}
        onAddToCart={handleAddVariantToCart}
      />

    </div>
  );
}