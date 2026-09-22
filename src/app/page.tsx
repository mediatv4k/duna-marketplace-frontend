'use client';

import React, { useState, useRef, useEffect } from 'react';
import MerchantStoreView from '@/components/MerchantStoreView';
import CheckoutModal from '@/components/CheckoutModal';
import OrderTrackingModal from '@/components/OrderTrackingModal';
import PromotionsCarousel from '@/components/PromotionsCarousel';
import HeroBannerCarousel from '@/components/HeroBannerCarousel';
import StoreScheduleModal from '@/components/StoreScheduleModal';

import { submitPurchaseOrder, getProductsByStore, getStorePromotions, getOrderPublic } from '@/services/marketplaceService';
import { isFinalStatus } from '@/lib/orderTracking';
import { getBCVRate } from '@/lib/bcvRate';

import {
  Clock, ChevronLeft, ChevronRight, Sparkles, MapPin, X, Navigation,
  Loader2, Home, Compass, ShoppingBag, Coins, Truck, Bike, ClipboardList, Search, Tag, Star
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dev.carjos-marketplace.cloud';
const API_KEY = process.env.NEXT_PUBLIC_SERVER_API_KEY || 'bf8f1b64-6342-48c5-af05-501e4c15a6cb';
const TIMEZONE = process.env.NEXT_PUBLIC_TIMEZONE || 'America/Caracas';

const cabimasSectores = [
  { id: 'centro', name: 'Casco Central / Centro', coords: { lat: 10.3950, lng: -71.4550 } },
  { id: 'ambrosio', name: 'Ambrosio / Miraflores', coords: { lat: 10.4020, lng: -71.4420 } },
];

function parseSafeLocation(loc: any) {
  if (!loc) return { lat: 10.3950, lng: -71.4450 };
  if (typeof loc === 'object') return loc;
  try {
    return JSON.parse(loc);
  } catch {
    return { lat: 10.3950, lng: -71.4450 };
  }
}

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; const dLat = (lat2 - lat1) * (Math.PI / 180); const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export default function MultitiendaHub() {
  const [realStores, setRealStores] = useState<any[]>([]);
  const [realCategories, setRealCategories] = useState<any[]>([]);
  const [homePromotions, setHomePromotions] = useState<any[]>([]);
  const [loadingHome, setLoadingHome] = useState(true);

  const [activeMerchantInfo, setActiveMerchantInfo] = useState<any>(null);
  const [activeMerchantProducts, setActiveMerchantProducts] = useState<any[]>([]);
  const [activeMerchantId, setActiveMerchantId] = useState<string | null>(null);
  const [isLoadingMoreProducts, setIsLoadingMoreProducts] = useState(false);
  const activeStoreRef = useRef<string | null>(null);
  const storeHistoryRef = useRef(false); // hay una entrada de historial propia ('merchant-store') mientras se ve una tienda

  // Botón "Atrás" (navegador/teléfono): al entrar a una tienda se registra un punto de retorno en el historial; "Atrás" lo consume
  // y cierra la tienda (mismo cierre que `onBack`) en vez de salir del sitio. Si la tienda se cierra por la UI, la entrada se retira.
  useEffect(() => {
    const onPopState = () => {
      if (!storeHistoryRef.current) return;
      storeHistoryRef.current = false;
      setActiveMerchantId(null);
      try { localStorage.removeItem('current_cart_store_id'); } catch { /* sin storage */ }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    try {
      if (activeMerchantId) {
        if (!storeHistoryRef.current) {
          window.history.pushState({ view: 'merchant-store' }, '', window.location.href);
          storeHistoryRef.current = true;
        }
      } else if (storeHistoryRef.current) {
        storeHistoryRef.current = false;
        if (window.history.state?.view === 'merchant-store') window.history.back();
      }
    } catch { /* historial no disponible */ }
  }, [activeMerchantId]);

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
  const [scheduleStore, setScheduleStore] = useState<{ id: number | string; name: string } | null>(null);

  const categoryRailRef = useRef<HTMLDivElement>(null);

  // Pedido activo (FAB): id guardado por onFinalizeOrder; se oculta cuando el backend lo reporta en estado final
  const [savedOrderId, setSavedOrderId] = useState<string>('');
  const [savedOrderFinal, setSavedOrderFinal] = useState<boolean>(false);
  useEffect(() => {
    try {
      let id = localStorage.getItem('last_active_order_id') || '';
      if (!id) {
        const saved = localStorage.getItem('last_active_order');
        id = saved ? String(JSON.parse(saved)?.id || '') : '';
      }
      setSavedOrderId(id);
    } catch {
      setSavedOrderId('');
    }
  }, []);
  useEffect(() => {
    // Evento emitido por OrderTimelinePanel al cerrar una orden entregada: oculta el FAB sin esperar al polling
    const onOrderClosed = (e: Event) => {
      const closedId = String((e as CustomEvent).detail?.orderId ?? '');
      setSavedOrderId((prev) => (!closedId || prev === closedId ? '' : prev));
    };
    window.addEventListener('duna:order-closed', onOrderClosed);
    return () => window.removeEventListener('duna:order-closed', onOrderClosed);
  }, []);
  useEffect(() => {
    if (!savedOrderId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    setSavedOrderFinal(false);
    const checkStatus = async () => {
      const res = await getOrderPublic(savedOrderId);
      if (cancelled) return;
      if (res && res.code === 1 && res.data && isFinalStatus(res.data.status)) {
        setSavedOrderFinal(true);
        return;
      }
      timer = setTimeout(checkStatus, 30000);
    };
    checkStatus();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [savedOrderId]);

  // Tasa BCV viva (GET /api/bcv). null = no disponible → el Home no muestra Bs. inventados
  const [bcvRate, setBcvRate] = useState<number | null>(null);
  useEffect(() => {
    getBCVRate().then(setBcvRate).catch(() => setBcvRate(null));
  }, []);

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

        // Promociones de TODO el marketplace (sin filtro de tienda) — reutiliza la misma
        // función de la Fase 3, no se duplica lógica de fetch.
        const promoRes = await getStorePromotions('');
        if (promoRes.code === 1 && Array.isArray(promoRes.data)) setHomePromotions(promoRes.data);

      } catch (error) {
        console.error("Error cargando data real:", error);
      } finally {
        setLoadingHome(false);
      }
    }
    loadRealData();
  }, []);

  const formatPriceBimonetary = (amountUSD: number): string => {
    if (currencyMode === 'USD' || !bcvRate) return `$${amountUSD.toFixed(2)}`;
    const amountVES = amountUSD * bcvRate;
    if (currencyMode === 'VES') return `Bs. ${amountVES.toFixed(2)}`;
    return `$${amountUSD.toFixed(2)} (Bs. ${amountVES.toFixed(2)})`;
  };

  // 🛡️ CONTROLADOR DE APERTURA DE TIENDA Y PURGA DE CARRITO CRUZADO
  const handleStoreClick = async (store: any) => {
    try {
      const storeIdStr = String(store.id);
      
      if (typeof window !== 'undefined') {
        const savedCartStore = localStorage.getItem('current_cart_store_id');
        if (savedCartStore && savedCartStore !== storeIdStr) {
          localStorage.removeItem('cart_data');
        }
        localStorage.setItem('current_cart_store_id', storeIdStr);
      }

      const res = await getProductsByStore(store.id);
      
      let flatProducts: any[] = [];
      if (res.code === 1 && res.data) {
        if (Array.isArray(res.data)) {
          flatProducts = res.data;
        } else if (res.data.products && Array.isArray(res.data.products)) {
          flatProducts = res.data.products.flatMap((cat: any) => cat.data || cat);
        } else if (res.data.data && Array.isArray(res.data.data)) {
          flatProducts = res.data.data;
        }
      }

      const mappedInfo = {
        id: store.id,
        code: store.code,
        categoriesName: store.categoriesName,
        avatar: store.avatar,
        banner: store.banner,
        name: store.name,
        phone: store.phone || '',
        category: store.categoriesName || 'Comercio',
        rating: store.storeScoring || 5.0,
        deliveryTime: '15 - 30 min',
        deliveryFee: store.deliveryMinimumRate ? `$${store.deliveryMinimumRate.toFixed(2)}` : 'Calculable',
        baseRatePerKm: store.deliveryAmountRate || 0.75,
        isNationalShippingEnabled: false,
        coords: parseSafeLocation(store.location),
        image: store.avatar || '/images/logo-duna.png',
        badge: store.scheduleInfo || 'Abierto',
        isOpen: store.status === 'OPEN',
        weeklyHours: [{ day: 'Horario', hours: store.scheduleInfo || 'Ver disponibilidad' }]
      };

      setActiveMerchantInfo(mappedInfo);
      setActiveMerchantProducts(flatProducts);
      setActiveMerchantId(storeIdStr);
      activeStoreRef.current = storeIdStr;

      // El backend pagina de a 30 productos (data.meta.last_page / data.hasMore): sin las demás páginas el catálogo y las categorías
      // quedaban incompletos (p. ej. Proseco Bodegón: 30 de 255 productos, solo "LICORES"). Se traen el resto en segundo plano.
      const lastPage = Number(res?.data?.meta?.last_page || 1);
      if (res?.data?.hasMore && lastPage > 1) {
        const MAX_PAGES = 12; // tope de seguridad: 12 × 30 = 360 productos
        const pages = Array.from({ length: Math.min(lastPage, MAX_PAGES) - 1 }, (_, i) => i + 2);
        setIsLoadingMoreProducts(true);
        Promise.all(pages.map((pg) => getProductsByStore(store.id, pg)))
          .then((results) => {
            if (activeStoreRef.current !== storeIdStr) return;
            const more = results.flatMap((r: any) =>
              r?.code === 1 && Array.isArray(r.data?.products) ? r.data.products.flatMap((cat: any) => cat.data || cat) : []
            );
            setActiveMerchantProducts((prev) => {
              const seen = new Set(prev.map((x: any) => x.id ?? x.code));
              return [...prev, ...more.filter((x: any) => !seen.has(x.id ?? x.code))];
            });
          })
          .catch((err) => console.error('Error al cargar más productos', err))
          .finally(() => {
            if (activeStoreRef.current === storeIdStr) setIsLoadingMoreProducts(false);
          });
      } else {
        setIsLoadingMoreProducts(false);
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
          isLoadingMore={isLoadingMoreProducts}
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
              isOpen: activeMerchantInfo.isOpen,
              scheduleInfo: activeMerchantInfo.badge,
              esEnvioNacional: activeMerchantInfo.isNationalShippingEnabled || false,
              agenciaNacional: 'MRW', 
              costoEnvioNacional: 4.50
            });
            setIsCheckoutOpen(true);
          }}
          forceOpenCartTrigger={forceCartOpenCount}
          userLocation={userLocation}
        />

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={handleCloseCheckout}
          orderSummary={orderSummaryData}
          merchantName={activeMerchantInfo.name}
          onFinalizeOrder={async (orderData) => {
            if (typeof window !== 'undefined') {
              localStorage.setItem('last_active_order', JSON.stringify(orderData));
              localStorage.setItem('last_active_order_id', String(orderData.id));
            }
            setSavedOrderId(String(orderData.id));
            setHasCompletedOrder(true);
          }}
          onBackToCart={() => { setIsCheckoutOpen(false); setForceCartOpenCount(prev => prev + 1); }}
          onViewTracking={() => { setIsCheckoutOpen(false); setIsTrackingOpen(true); }}
          onViewReceipt={() => {
            const url = typeof window !== 'undefined' ? localStorage.getItem('last_receipt_url') : null;
            if (url) window.open(url, '_blank');
          }}
        />

        {/* Botón flotante persistente en la tienda: recupera el seguimiento cuando el modal está cerrado (el id de la orden vive en savedOrderId) */}
        {savedOrderId && !savedOrderFinal && !isTrackingOpen && (
          <div className="fixed bottom-24 md:bottom-6 right-4 z-50">
            <button
              type="button"
              onClick={() => setIsTrackingOpen(true)}
              className="bg-[#fe6712] hover:bg-amber-600 text-white font-black px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce border-2 border-white cursor-pointer"
            >
              <Bike className="w-4 h-4" /> Ver mi Pedido
            </button>
          </div>
        )}

        <OrderTrackingModal isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} orderId={savedOrderId || activeOrderId} orderSummary={orderSummaryData} />
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

  // Prioridad ESTRICTAMENTE por horario en tiempo real: 1° abierto ahora, 2° por abrir, 3° cerrado. Array.sort es
  // estable: dentro de cada grupo se conserva el orden del backend (salvo el grupo "por abrir", que además se
  // ordena por hora de apertura — ver `openingMinutes` debajo).
  // 2026-09-22: el rango YA NO se basa solo en `scheduleStatus` — se verificó contra el backend real que ese campo
  // viene "OPEN" incluso en tiendas cuyo `scheduleInfo` dice "Hoy cerrado" (p. ej. Proseco Bodegón Café, Lois es
  // Más que Pollo: status/scheduleStatus "OPEN" con scheduleInfo "Hoy cerrado" — inconsistencia real del backend,
  // no un caso hipotético). `scheduleInfo` es el texto que además se le muestra al cliente en la píldora de cada
  // tarjeta, así que es la fuente de verdad más confiable: se usa primero, y `scheduleStatus` solo como respaldo
  // si no hay texto.
  const storeOpenRank = (s: any): number => {
    const label = String(s.scheduleInfo || '').trim();
    if (/cerrado/i.test(label)) return 2;
    if (/abre a las/i.test(label)) return 1;
    if (/^abierto$/i.test(label)) return 0;
    // Sin texto reconocible: se cae al campo crudo del backend
    if (s.scheduleStatus === 'OPEN') return 0;
    if (s.scheduleStatus === 'OPENING') return 1;
    return 2;
  };

  // Minutos desde medianoche a partir de `scheduleInfo` ("Abre a las 12:00 PM"): el backend no manda una hora
  // cruda de apertura, solo este texto ya formateado (ver AGENTS.md §1.2), así que se parsea el patrón "HH:MM AM/PM".
  // `null` si el texto no trae una hora reconocible (esas tiendas quedan al final de su grupo, orden estable).
  const openingMinutes = (s: any): number | null => {
    const m = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(s.scheduleInfo || '');
    if (!m) return null;
    const hours = (parseInt(m[1], 10) % 12) + (/pm/i.test(m[3]) ? 12 : 0);
    return hours * 60 + parseInt(m[2], 10);
  };
  // Minutos que faltan desde AHORA (hora del dispositivo) hasta esa hora de apertura, con wrap-around a mañana
  // (p. ej. son las 11:00 PM y la tienda abre a las 12:00 AM → faltan 60 min, no "está muy lejos").
  const minutesUntilOpen = (openMin: number): number => {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return ((openMin - nowMin) % 1440 + 1440) % 1440;
  };

  const filteredMerchants = realStores.filter(m =>
    (selectedCategory === 'ALL' || m.categories?.includes(selectedCategory)) &&
    (m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.categoriesName || '').toLowerCase().includes(searchQuery.toLowerCase()))
  ).sort((a, b) => {
    const rankDiff = storeOpenRank(a) - storeOpenRank(b);
    if (rankDiff !== 0) return rankDiff;
    if (storeOpenRank(a) !== 1) return 0; // solo el grupo "por abrir" (Nivel 2) se sub-ordena por hora
    const ma = openingMinutes(a);
    const mb = openingMinutes(b);
    if (ma === null && mb === null) return 0;
    if (ma === null) return 1; // sin hora reconocible: al final del grupo
    if (mb === null) return -1;
    return minutesUntilOpen(ma) - minutesUntilOpen(mb); // apertura más cercana desde ahora, primero
  });

  // Regla de negocio: solo promos de tiendas actualmente abiertas. Cruce limpio por
  // storeCode contra realStores (que sí trae status crudo de GET /store/find).
  const openStoreCodes = new Set(
    realStores.filter((s: any) => s.status === 'OPEN').map((s: any) => s.code)
  );
  const homePromotionsOpenOnly = homePromotions.filter((p: any) => openStoreCodes.has(p.storeCode));

  const handleHomePromotionClick = (promo: any) => {
    const matchedStore = realStores.find((s: any) => s.code === promo.storeCode);
    if (matchedStore) handleStoreClick(matchedStore);
  };

  return (
    <div suppressHydrationWarning className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans pb-16 md:pb-0">
      
      {/* Cabecera única (2026-09-22): antes eran dos franjas oscuras apiladas (la barra fina de ubicación/moneda +
          un <header> aparte con logo/buscador) — se unificaron en un solo contenedor sticky, un solo fondo,
          un solo borde. Fila 1 (grid en escritorio, apilado en móvil): ubicación a la izquierda, logo naranja
          centrado geométricamente, moneda+BCV a la derecha. Fila 2: buscador compacto, mismo contenedor oscuro. */}
      <div className="sticky top-0 z-40 bg-[#090d16] text-white border-b border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-2.5 pb-1.5 flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] md:items-center gap-2 text-xs">
          <div className="flex items-center gap-2 font-bold justify-center md:justify-start" suppressHydrationWarning>
            <MapPin className="w-3.5 h-3.5 text-[#fe6712] shrink-0" />
            <span className="truncate">Entregar en: <strong className="underline text-white">{userLocation ? userLocation.label : 'Cabimas, Estado Zulia'}</strong></span>
            {userLocation && (
              <button type="button" onClick={() => setIsFallbackModalOpen(true)} className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-orange-200 cursor-pointer ml-1 shrink-0">Cambiar</button>
            )}
          </div>

          <div onClick={() => { setActiveMerchantId(null); setSelectedCategory('ALL'); setSearchQuery(''); if(typeof window !== 'undefined') localStorage.removeItem('current_cart_store_id'); }} className="flex items-center justify-center cursor-pointer select-none md:justify-self-center">
            <img src="/images/logo-naranja-transparent.png" alt="D'una Marketplace" className="h-9 md:h-10 w-auto object-contain" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center md:justify-self-end">
            <div className="flex items-center bg-white/10 p-0.5 rounded-full border border-white/15 text-[10px] font-bold flex-wrap justify-center">
              <button type="button" onClick={() => setCurrencyMode('DUAL')} className={`px-2 py-0.5 rounded-full cursor-pointer whitespace-nowrap ${currencyMode === 'DUAL' ? 'bg-[#fe6712]' : ''}`}>Dual ($/Bs)</button>
              <button type="button" onClick={() => setCurrencyMode('USD')} className={`px-2 py-0.5 rounded-full cursor-pointer whitespace-nowrap ${currencyMode === 'USD' ? 'bg-[#fe6712]' : ''}`}>$ USD</button>
              <button type="button" onClick={() => setCurrencyMode('VES')} className={`px-2 py-0.5 rounded-full cursor-pointer whitespace-nowrap ${currencyMode === 'VES' ? 'bg-[#fe6712]' : ''}`}>Bs. VES</button>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 text-slate-300 text-[11px]">
              <Coins className="w-3 h-3 text-amber-400" />
              <span>Tasa BCV: <strong className="text-white">{bcvRate ? `Bs. ${bcvRate.toFixed(2)}` : 'no disponible'}</strong></span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-2.5">
          <div className="relative flex items-center bg-white/10 rounded-2xl border border-white/10 focus-within:border-[#fe6712]/60 focus-within:bg-white/15 transition">
            <Search className="absolute left-4 w-3.5 h-3.5 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Busca comercios y productos..." className="w-full bg-transparent text-xs font-semibold text-gray-200 pl-11 pr-8 py-2.5 focus:outline-none placeholder-gray-400" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-4 flex-1 space-y-6">

        <HeroBannerCarousel
          slides={[
            { image: '/images/banner-commer.png', alt: 'Registra tu comercio y aumenta tus ventas', href: 'https://tr.ee/aJWg3IoL3q' },
            { image: '/images/banner-delivery.png', alt: 'Sé parte de nuestro equipo Delivery', href: 'https://tr.ee/O553DC8j5Q' },
            {
              image: '/images/banner-cliente.png',
              alt: 'Tus antojos con solo un click',
              onClick: () => document.getElementById('categorias-tiendas')?.scrollIntoView({ behavior: 'smooth' }),
            },
          ]}
        />

        <PromotionsCarousel
          promotions={homePromotionsOpenOnly}
          onSelectPromotion={handleHomePromotionClick}
        />

        <section id="categorias-tiendas" className="space-y-2.5 pt-0.5 scroll-mt-24">
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
                      <Tag className="w-5 h-5" />
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
                  const location = parseSafeLocation(merchant.location);
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
                        <span className="flex-shrink-0 flex items-center gap-0.5 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md text-[10px] font-black border border-amber-200 shadow-2xs"><Star className="w-2.5 h-2.5 fill-current" /> {merchant.storeScoring || 5.0}</span>
                      </div>

                      <p className="text-[11px] font-bold text-slate-400 truncate">{merchant.categoriesName || 'Comercio'}</p>

                      <div className="flex items-center gap-1.5 text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setScheduleStore({ id: merchant.id, name: merchant.name }); }}
                          title="Ver horario semanal"
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-bold shadow-2xs shrink-0 cursor-pointer hover:brightness-95 ${merchant.status === 'OPEN' ? 'text-emerald-700 bg-emerald-50 border-emerald-200/70' : 'text-slate-500 bg-slate-50 border-slate-200'}`}
                        >
                          {merchant.status === 'OPEN' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                          {merchant.scheduleInfo || (merchant.status === 'OPEN' ? 'Abierto' : 'Cerrado')}
                        </button>

                        {userLocation && calculatedFeeText ? (
                          <span className="px-2 py-0.5 rounded-md bg-orange-50 text-[#fe6712] border border-orange-200 font-black text-[10px] whitespace-nowrap ml-auto flex items-center gap-1">
                            <Bike className="w-3 h-3" /> {calculatedFeeText} ({distanceKm} km)
                          </span>
                        ) : (
                          <button type="button" onClick={handleTriggerGpsCalculation} disabled={isLocating} className="px-2 py-0.5 rounded-md bg-orange-50 hover:bg-orange-100 text-[#fe6712] border border-orange-200 font-black text-[10px] flex items-center gap-1 ml-auto">
                            {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Bike className="w-3 h-3" /> Flete</>}
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
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {sector.name}</span> <span className="text-[11px] font-black text-slate-400">Elegir →</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <StoreScheduleModal
        isOpen={scheduleStore !== null}
        onClose={() => setScheduleStore(null)}
        storeId={scheduleStore?.id ?? null}
        storeName={scheduleStore?.name}
      />

      {savedOrderId && !savedOrderFinal && (
        <button
          type="button"
          onClick={() => setIsTrackingOpen(true)}
          title="Seguir mi pedido"
          aria-label="Ver mi pedido activo"
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 h-14 w-14 rounded-full bg-[#fe6712] hover:bg-[#e0580d] text-white shadow-lg shadow-orange-500/40 flex items-center justify-center cursor-pointer active:scale-95 transition"
        >
          <ClipboardList className="w-6 h-6" />
        </button>
      )}

      <OrderTrackingModal isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} orderId={savedOrderId} />
    </div>
  );
}