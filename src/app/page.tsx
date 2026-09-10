'use client';

import React, { useState, useRef, useEffect } from 'react';
import MerchantStoreView from '@/components/MerchantStoreView';
import CheckoutModal from '@/components/CheckoutModal';
import OrderTrackingModal from '@/components/OrderTrackingModal';

import { submitPurchaseOrder, getProductsByStore } from '@/services/marketplaceService';

import {
  Clock, ChevronLeft, ChevronRight, Sparkles, MapPin, X, Navigation,
  Loader2, Home, Compass, ShoppingBag, Coins, Truck, Bike
} from 'lucide-react';

const TASA_BCV_ACTUAL = 48.50; 
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dev.carjos-marketplace.cloud';
const API_KEY = process.env.NEXT_PUBLIC_SERVER_API_KEY || 'bf8f1b64-6342-48c5-af05-501e4c15a6cb';
const TIMEZONE = process.env.NEXT_PUBLIC_TIMEZONE || 'America/Caracas';

const cabimasSectores = [
  { id: 'centro', name: 'Casco Central / Centro', coords: { lat: 10.3950, lng: -71.4550 } },
  { id: 'ambrosio', name: 'Ambrosio / Miraflores', coords: { lat: 10.4020, lng: -71.4420 } },
];

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; const dLat = (lat2 - lat1) * (Math.PI / 180); const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export default function MultitiendaHub() {
  const [realStores, setRealStores] = useState<any[]>([]);
  const [realCategories, setRealCategories] = useState<any[]>([]);
  const [loadingHome, setLoadingHome] = useState(true);

  const [activeMerchantInfo, setActiveMerchantInfo] = useState<any>(null);
  const [activeMerchantProducts, setActiveMerchantProducts] = useState<any[]>([]);
  const [activeMerchantId, setActiveMerchantId] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currencyMode, setCurrencyMode] = useState<'DUAL' | 'USD' | 'VES'>('DUAL');
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string>('');
  const [hasCompletedOrder, setHasCompletedOrder] = useState<boolean>(false);
  const [forceCartOpenCount, setForceCartOpenCount] = useState<number>(0);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isFallbackModalOpen, setIsFallbackModalOpen] = useState<boolean>(false);

  const categoryRailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadRealData() {
      try {
        const headers = { 'apiKey': API_KEY, 'timeZone': TIMEZONE, 'Content-Type': 'application/json' };
        
        const catRes = await fetch(`${API_BASE}/product/categories?unused=false`, { headers });
        const catData = await catRes.json();
        if (catData.code === 1) setRealCategories(catData.data || []);

        const storeRes = await fetch(`${API_BASE}/store/find?category=&keywords=`, { headers });
        const storeData = await storeRes.json();
        if (storeData.code === 1) setRealStores(storeData.data || []);

      } catch (error) {
        console.error("Error cargando data real:", error);
      } finally {
        setLoadingHome(false);
      }
    }
    loadRealData();
  }, []);

  const formatPriceBimonetary = (amountUSD: number): string => {
    const amountVES = amountUSD * TASA_BCV_ACTUAL;
    if (currencyMode === 'USD') return `$${amountUSD.toFixed(2)}`;
    if (currencyMode === 'VES') return `Bs. ${amountVES.toFixed(2)}`;
    return `$${amountUSD.toFixed(2)} (Bs. ${amountVES.toFixed(2)})`;
  };

  // 🛡️ CONTROLADOR DE APERTURA DE TIENDA Y PURGA DE CARRITO CRUZADO
  const handleStoreClick = async (store: any) => {
    try {
      const storeIdStr = String(store.id);
      
      // Verificar si el carrito guardado pertenece a otra tienda para limpiarlo preventivamente
      if (typeof window !== 'undefined') {
        const savedCartStore = localStorage.getItem('current_cart_store_id');
        if (savedCartStore && savedCartStore !== storeIdStr) {
          localStorage.removeItem('cart_data');
        }
        localStorage.setItem('current_cart_store_id', storeIdStr);
      }

      const res = await getProductsByStore(store.id);
      if (res.code === 1 && res.data) {
        const flatProducts = res.data.products?.flatMap((cat: any) => cat.data) || [];
        
        const mappedInfo = {
          id: store.id,
          name: store.name,
          phone: store.phone || '584140000000',
          category: store.categoriesName || 'Comercio',
          rating: store.storeScoring || 5.0,
          deliveryTime: '15 - 30 min',
          deliveryFee: store.deliveryMinimumRate ? `$${store.deliveryMinimumRate.toFixed(2)}` : 'Calculable',
          baseRatePerKm: store.deliveryAmountRate || 0.75,
          isNationalShippingEnabled: false,
          coords: store.location ? JSON.parse(store.location) : { lat: 10.3950, lng: -71.4450 },
          image: store.avatar || '/images/logo-duna.png',
          badge: store.scheduleInfo || 'Abierto',
          isOpen: store.status === 'OPEN',
          weeklyHours: [{ day: 'Horario', hours: store.scheduleInfo || 'Ver disponibilidad' }]
        };

        setActiveMerchantInfo(mappedInfo);
        setActiveMerchantProducts(flatProducts);
        setActiveMerchantId(storeIdStr);
      }
    } catch (e) {
      console.error("Error al cargar productos", e);
    }
  };

  const [orderSummaryData, setOrderSummaryData] = useState({
    metodoEntrega: 'delivery' as const, direccion: 'Cabimas', costoEnvio: 2.00, subtotalUSD: 10.00, totalUSD: 12.00,
    esEnvioNacional: false, agenciaNacional: 'MRW' as any, costoEnvioNacional: 4.50, merchantId: '', merchantPhone: ''
  });

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    if (hasCompletedOrder) {
      if (typeof window !== 'undefined') { 
        localStorage.removeItem('cart_data'); 
        localStorage.removeItem('current_order'); 
        localStorage.removeItem('current_cart_store_id');
      }
      setActiveMerchantId(null);
      setHasCompletedOrder(false);
    }
  };

  const handleTriggerGpsCalculation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLocating(true);
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'GPS Actual' }); setIsLocating(false); },
        () => { setIsLocating(false); setIsFallbackModalOpen(true); },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setIsLocating(false); setIsFallbackModalOpen(true);
    }
  };

  if (activeMerchantId && activeMerchantInfo) {
    return (
      <>
        <MerchantStoreView
          key={activeMerchantId}
          merchant={activeMerchantInfo}
          products={activeMerchantProducts}
          onBack={() => {
            setActiveMerchantId(null);
            if (typeof window !== 'undefined') localStorage.removeItem('current_cart_store_id');
          }}
          onOpenCheckout={(summary) => {
            setOrderSummaryData({
              ...summary, 
              items: summary.items || [], 
              merchantName: activeMerchantInfo.name,
              merchantId: activeMerchantInfo.id,
              merchantPhone: activeMerchantInfo.phone,
              esEnvioNacional: activeMerchantInfo.isNationalShippingEnabled || false,
              agenciaNacional: 'MRW', 
              costoEnvioNacional: 4.50
            });
            setIsCheckoutOpen(true);
          }}
          forceOpenCartTrigger={forceCartOpenCount}
        />

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={handleCloseCheckout}
          orderSummary={orderSummaryData}
          tasaBcv={TASA_BCV_ACTUAL}
          merchantName={activeMerchantInfo.name}
          onFinalizeOrder={async (orderData) => {
            setHasCompletedOrder(true);
          }}
          onBackToCart={() => { setIsCheckoutOpen(false); setForceCartOpenCount(prev => prev + 1); }}
          onViewTracking={() => { setIsCheckoutOpen(false); setIsTrackingOpen(true); }}
          onViewReceipt={() => {
            const url = typeof window !== 'undefined' ? localStorage.getItem('last_receipt_url') : null;
            if (url) window.open(url, '_blank');
          }}
        />

        <OrderTrackingModal isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} orderId={activeOrderId} orderSummary={orderSummaryData} />
      </>
    );
  }

  const scrollCategories = (dir: 'left' | 'right') => {
    if (!categoryRailRef.current) return;
    const el = categoryRailRef.current;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (dir === 'right') {
      if (el.scrollLeft >= maxScroll - 15) el.scrollTo({ left: 0, behavior: 'smooth' });
      else el.scrollBy({ left: 240, behavior: 'smooth' });
    } else {
      if (el.scrollLeft <= 15) el.scrollTo({ left: maxScroll, behavior: 'smooth' });
      else el.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const filteredMerchants = realStores.filter(m => 
    (selectedCategory === 'ALL' || m.categories?.includes(selectedCategory)) &&
    (m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.categoriesName || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div suppressHydrationWarning className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans pb-16 md:pb-0">
      
      <div className="bg-[#090d16] text-white text-xs py-2 px-4 md:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2 font-bold" suppressHydrationWarning>
            <MapPin className="w-3.5 h-3.5 text-[#fe6712]" />
            <span>Entregar en: <strong className="underline text-white">{userLocation ? userLocation.label : 'Cabimas, Estado Zulia'}</strong></span>
            {userLocation && (
              <button type="button" onClick={() => setIsFallbackModalOpen(true)} className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-orange-200 cursor-pointer ml-1">Cambiar</button>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            <div className="flex items-center bg-white/10 p-0.5 rounded-full border border-white/15 text-[10px] font-bold">
              <button type="button" onClick={() => setCurrencyMode('DUAL')} className={`px-2 py-0.5 rounded-full cursor-pointer ${currencyMode === 'DUAL' ? 'bg-[#fe6712]' : ''}`}>Dual ($/Bs)</button>
              <button type="button" onClick={() => setCurrencyMode('USD')} className={`px-2 py-0.5 rounded-full cursor-pointer ${currencyMode === 'USD' ? 'bg-[#fe6712]' : ''}`}>$ USD</button>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 text-slate-300 text-[11px]">
              <Coins className="w-3 h-3 text-amber-400" />
              <span>Tasa BCV: <strong className="text-white">Bs. {TASA_BCV_ACTUAL.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div onClick={() => { setActiveMerchantId(null); setSelectedCategory('ALL'); setSearchQuery(''); if(typeof window !== 'undefined') localStorage.removeItem('current_cart_store_id'); }} className="flex items-center cursor-pointer select-none py-0.5">
              <img src="/images/logo-duna.png" alt="D'una" className="h-10 md:h-11 w-auto object-contain" />
            </div>
          </div>
          <div className="flex-1 max-w-xl w-full">
            <div className="relative flex items-center bg-slate-100 rounded-2xl border border-slate-200 focus-within:border-[#fe6712] focus-within:bg-white transition shadow-2xs">
              <span className="absolute left-4 text-slate-400">🔍</span>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Busca comercios y productos..." className="w-full bg-transparent text-xs font-semibold text-slate-800 pl-11 pr-8 py-2.5 focus:outline-none placeholder-slate-400" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-4 flex-1 space-y-6">

        <section className="space-y-2.5 pt-0.5">
          <div className="flex justify-between items-center">
            <h3 className="text-sm md:text-base font-black text-slate-900 tracking-tight">Categorías</h3>
            <div className="hidden sm:flex items-center gap-1.5">
              <button type="button" onClick={() => scrollCategories('left')} className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-orange-50 text-slate-600 flex items-center justify-center cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => scrollCategories('right')} className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-orange-50 text-slate-600 flex items-center justify-center cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          
          <div ref={categoryRailRef} className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth no-scrollbar snap-x">
            <div role="button" tabIndex={0} onClick={() => setSelectedCategory('ALL')} className={`flex-shrink-0 snap-start flex flex-col items-center justify-center w-20 sm:w-22 py-2.5 px-1 rounded-2xl border transition-all duration-200 cursor-pointer group select-none ${selectedCategory === 'ALL' ? 'bg-white border-[#fe6712] ring-2 ring-[#fe6712]/20 shadow-md -translate-y-0.5' : 'bg-white border-slate-200 hover:border-orange-300'}`}>
              <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-1.5 p-1 ${selectedCategory === 'ALL' ? 'bg-[#fe6712] text-white shadow-xs' : 'bg-orange-50/70 text-[#fe6712] group-hover:bg-orange-100'}`}>
                 <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className={`text-[10px] sm:text-[11px] font-bold text-center leading-tight truncate w-full px-0.5 ${selectedCategory === 'ALL' ? 'text-[#fe6712] font-black' : 'text-slate-700 group-hover:text-[#fe6712]'}`}>Todos</span>
            </div>

            {realCategories.map(cat => {
              const isActive = selectedCategory === cat.code;
              return (
                <div key={cat.id} role="button" tabIndex={0} onClick={() => setSelectedCategory(cat.code)} className={`flex-shrink-0 snap-start flex flex-col items-center justify-center w-20 sm:w-22 py-2.5 px-1 rounded-2xl border transition-all duration-200 cursor-pointer group select-none ${isActive ? 'bg-white border-[#fe6712] ring-2 ring-[#fe6712]/20 shadow-md -translate-y-0.5' : 'bg-white border-slate-200 hover:border-orange-300'}`}>
                  <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-1.5 p-1 overflow-hidden ${isActive ? 'bg-[#fe6712] text-white shadow-xs' : 'bg-orange-50/70 text-[#fe6712] group-hover:bg-orange-100'}`}>
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-10 h-10 object-contain" />
                    ) : (
                      <span className="text-xl">🏷️</span>
                    )}
                  </div>
                  <span className={`text-[10px] sm:text-[11px] font-bold text-center leading-tight truncate w-full px-0.5 ${isActive ? 'text-[#fe6712] font-black' : 'text-slate-700 group-hover:text-[#fe6712]'}`}>{cat.name}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-3.5 pt-1">
          <div className="flex justify-between items-center">
            <h3 className="text-sm md:text-base font-black text-slate-900 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#fe6712]"></span> Tiendas ({filteredMerchants.length})
            </h3>
          </div>

          {loadingHome ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-[#fe6712]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredMerchants.map(merchant => {
                let distanceKm: number | null = null;
                let calculatedFeeText: string | null = null;

                if (userLocation) {
                  const location = merchant.location ? JSON.parse(merchant.location) : {lat: 10.395, lng: -71.445};
                  distanceKm = getDistanceInKm(userLocation.lat, userLocation.lng, location.lat, location.lng);
                  const feeUSD = Math.max(1.00, Number((distanceKm * (merchant.deliveryAmountRate || 1.0)).toFixed(2)));
                  calculatedFeeText = formatPriceBimonetary(feeUSD);
                }

                return (
                  <div key={merchant.id} onClick={() => handleStoreClick(merchant)} className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#fe6712]/50 p-3.5 flex items-center gap-3.5 shadow-2xs hover:shadow-md transition cursor-pointer group">

                    <div className="w-[80px] h-[80px] min-w-[80px] sm:w-[96px] sm:h-[96px] sm:min-w-[96px] flex-shrink-0 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs relative">
                      <img src={merchant.avatar || '/images/logo-duna.png'} alt={merchant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1 overflow-hidden">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-sm font-black text-slate-900 group-hover:text-[#fe6712] transition-colors truncate">{merchant.name}</h4>
                        <span className="flex-shrink-0 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md text-[10px] font-black border border-amber-200 shadow-2xs">⭐ {merchant.storeScoring || 5.0}</span>
                      </div>

                      <p className="text-[11px] font-bold text-slate-400 truncate">{merchant.categoriesName || 'Comercio'}</p>

                      <div className="flex items-center gap-1.5 text-[10px] font-bold">
                        <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-bold shadow-2xs shrink-0 ${merchant.status === 'OPEN' ? 'text-emerald-700 bg-emerald-50 border-emerald-200/70' : 'text-slate-500 bg-slate-50 border-slate-200'}`}>
                          {merchant.status === 'OPEN' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                          {merchant.scheduleInfo || (merchant.status === 'OPEN' ? 'Abierto' : 'Cerrado')}
                        </span>

                        {userLocation && calculatedFeeText ? (
                          <span className="px-2 py-0.5 rounded-md bg-orange-50 text-[#fe6712] border border-orange-200 font-black text-[10px] whitespace-nowrap ml-auto">
                            🛵 {calculatedFeeText} ({distanceKm} km)
                          </span>
                        ) : (
                          <button type="button" onClick={handleTriggerGpsCalculation} disabled={isLocating} className="px-2 py-0.5 rounded-md bg-orange-50 hover:bg-orange-100 text-[#fe6712] border border-orange-200 font-black text-[10px] flex items-center gap-1 ml-auto">
                            {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>🛵 Flete</span>}
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>
      
      {isFallbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setIsFallbackModalOpen(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-[#fe6712]" /><div><h3 className="font-black text-slate-900 text-base">Selecciona tu Sector</h3></div></div>
              <button type="button" onClick={() => setIsFallbackModalOpen(false)} className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {cabimasSectores.map(sector => (
                <div key={sector.id} onClick={() => { setUserLocation({ lat: sector.coords.lat, lng: sector.coords.lng, label: sector.name }); setIsFallbackModalOpen(false); }} className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 text-slate-700 text-xs font-bold flex justify-between items-center cursor-pointer">
                  <span>📍 {sector.name}</span> <span className="text-[11px] font-black text-slate-400">Elegir →</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}