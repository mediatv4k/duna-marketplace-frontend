'use client';

import React, { useState, useRef, useEffect } from 'react';
import MerchantStoreView from '@/components/MerchantStoreView';
import CheckoutModal from '@/components/CheckoutModal';
import OrderTrackingModal from '@/components/OrderTrackingModal';
import PromotionsCarousel from '@/components/PromotionsCarousel';
import StoreScheduleModal from '@/components/StoreScheduleModal';

import { submitPurchaseOrder, getProductsByStore, getStorePromotions, getOrderPublic } from '@/services/marketplaceService';
import { isFinalStatus } from '@/lib/orderTracking';
import { getBCVRate } from '@/lib/bcvRate';

import {
  Clock, ChevronLeft, ChevronRight, Sparkles, MapPin, X, Navigation,
  Loader2, Home, Compass, ShoppingBag, Coins, Truck, Bike, ClipboardList, Search, Tag, Star,
  Pizza, UtensilsCrossed, Coffee, Cake, IceCream, Sandwich, Pill, Wine, Beef, Store
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dev.carjos-marketplace.cloud';
const API_KEY = process.env.NEXT_PUBLIC_SERVER_API_KEY || 'bf8f1b64-6342-48c5-af05-501e4c15a6cb';
const TIMEZONE = process.env.NEXT_PUBLIC_TIMEZONE || 'America/Caracas';

// Coordenadas de referencia de Cabimas (centro geométrico de la ciudad).
// Usadas únicamente como fallback de distancia cuando el usuario aún no ha compartido su GPS.
// El cálculo real de delivery usa siempre las coordenadas exactas del dispositivo.
const CABIMAS_CENTER = { lat: 10.3950, lng: -71.4450 };

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

function getCategoryIcon(codeOrName: any): React.ComponentType<any> {
  const norm = String(codeOrName || '').toLowerCase();
  if (norm.includes('hamburg') || norm.includes('fast') || norm.includes('burger') || norm.includes('perro') || norm.includes('pollo') || norm.includes('combo')) return Sandwich;
  if (norm.includes('pizza')) return Pizza;
  if (norm.includes('dulce') || norm.includes('postre') || norm.includes('repost') || norm.includes('torta') || norm.includes('cake') || norm.includes('bakery')) return Cake;
  if (norm.includes('bode') || norm.includes('super') || norm.includes('market') || norm.includes('viveres') || norm.includes('abarrote') || norm.includes('mini')) return ShoppingBag;
  if (norm.includes('licor') || norm.includes('bebida') || norm.includes('cerveza') || norm.includes('bar') || norm.includes('vino') || norm.includes('bodegon') || norm.includes('bodegón')) return Wine;
  if (norm.includes('farma') || norm.includes('salud') || norm.includes('medic')) return Pill;
  if (norm.includes('carne') || norm.includes('parrilla') || norm.includes('carnic') || norm.includes('grill') || norm.includes('asado')) return Beef;
  if (norm.includes('arabe') || norm.includes('árabe') || norm.includes('shawarma') || norm.includes('falafel') || norm.includes('kibbeh')) return UtensilsCrossed;
  if (norm.includes('helad') || norm.includes('ice') || norm.includes('paleta')) return IceCream;
  if (norm.includes('cafe') || norm.includes('café') || norm.includes('desayun') || norm.includes('coffee')) return Coffee;
  if (norm.includes('bici') || norm.includes('ciclismo') || norm.includes('bike')) return Bike;
  if (norm.includes('moda') || norm.includes('ropa') || norm.includes('calzado') || norm.includes('textil')) return Tag;
  return Store;
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
  // isFallbackModalOpen eliminado (2026-09-23): el modal de microsectores (Casco Central / Ambrosio) fue reemplazado
  // por GPS directo del dispositivo. La plataforma opera a nivel de ciudad; el selector de CIUDAD (futura expansión
  // nacional) se implementará como reemplazo cuando aplique.
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
        (pos) => {
          // Coordenadas exactas del dispositivo — fuente de verdad para cálculo de flete
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'Cabimas, Zulia' });
          setIsLocating(false);
        },
        () => {
          // GPS denegado o no disponible: fallback silencioso al centro geométrico de Cabimas.
          // No se abre ningún modal de microsectores; la plataforma opera a nivel ciudad.
          setUserLocation({ lat: CABIMAS_CENTER.lat, lng: CABIMAS_CENTER.lng, label: 'Cabimas, Zulia' });
          setIsLocating(false);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      // Geolocalización no soportada → fallback ciudad
      setUserLocation({ lat: CABIMAS_CENTER.lat, lng: CABIMAS_CENTER.lng, label: 'Cabimas, Zulia' });
      setIsLocating(false);
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
      
      {/* ── Navbar Principal — Glass Blanca ───────────────────────────────────────────────────────
           Desktop (md:): 3 columnas en una sola fila (Logo, Buscador+Cercanos, Utilidades).
           Móvil (< md): Fila 1 (Logo Centrado Institucional) / Fila 2 (Buscador + Selector Divisa).
           Paleta corporativa #FE6712. Logo naranja sobre blanco. */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        {/* Cabecera Móvil (< md) */}
        <div className="md:hidden flex flex-col w-full pb-2">
          {/* Fila 1: Logo Centrado Institucional */}
          <div className="w-full flex justify-center py-2">
            <div
              onClick={() => { setActiveMerchantId(null); setSelectedCategory('ALL'); setSearchQuery(''); if(typeof window !== 'undefined') localStorage.removeItem('current_cart_store_id'); }}
              className="flex items-center cursor-pointer select-none"
            >
              <img
                src="/images/logo-naranja-transparent.png"
                alt="D'una Marketplace"
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>

          {/* Fila 2: Buscador Integrado con Selector de Moneda */}
          <div className="flex items-center gap-2 px-4 py-1.5 w-full">
            <div className="flex-1 flex items-center bg-slate-50 border border-slate-200/90 rounded-full px-3.5 py-1.5 shadow-inner focus-within:border-[#FE6712] focus-within:bg-white transition-all gap-2 min-w-0">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca comercios o productos..."
                className="flex-1 bg-transparent text-xs font-semibold text-slate-800 focus:outline-none placeholder-slate-400 min-w-0"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-[10px] font-bold shrink-0">
              <button type="button" onClick={() => setCurrencyMode('DUAL')} className={`px-2.5 py-1 rounded-full cursor-pointer whitespace-nowrap transition ${currencyMode === 'DUAL' ? 'bg-[#fe6712] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>$/Bs</button>
              <button type="button" onClick={() => setCurrencyMode('USD')} className={`px-2.5 py-1 rounded-full cursor-pointer whitespace-nowrap transition ${currencyMode === 'USD' ? 'bg-[#fe6712] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>USD</button>
              <button type="button" onClick={() => setCurrencyMode('VES')} className={`px-2.5 py-1 rounded-full cursor-pointer whitespace-nowrap transition ${currencyMode === 'VES' ? 'bg-[#fe6712] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Bs</button>
            </div>
          </div>
        </div>

        {/* Cabecera Desktop (>= md) */}
        <div className="hidden md:flex max-w-7xl mx-auto px-4 md:px-8 items-center justify-between gap-4 py-2.5 w-full">

          {/* COL IZQUIERDA — Logo institucional */}
          <div
            onClick={() => { setActiveMerchantId(null); setSelectedCategory('ALL'); setSearchQuery(''); if(typeof window !== 'undefined') localStorage.removeItem('current_cart_store_id'); }}
            className="flex items-center cursor-pointer select-none shrink-0"
          >
            <img
              src="/images/logo-naranja-transparent.png"
              alt="D'una Marketplace"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>

          {/* COL CENTRAL — Buscador pill + botón Cercanos */}
          <div className="flex-1 max-w-xl mx-auto flex">
            <div className="w-full flex items-center bg-slate-50 border border-slate-200/90 rounded-full px-3.5 py-1.5 shadow-inner focus-within:border-[#FE6712] focus-within:bg-white transition-all gap-2">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca comercios o productos..."
                className="flex-1 bg-transparent text-xs font-semibold text-slate-800 focus:outline-none placeholder-slate-400 min-w-0"
              />
              <button
                type="button"
                onClick={handleTriggerGpsCalculation}
                className="bg-[#FE6712] text-white text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm hover:bg-[#e0580d] transition shrink-0 cursor-pointer"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
                  <circle cx="12" cy="9" r="2.5" fill="currentColor" stroke="none" />
                </svg>
                {isLocating ? 'Buscando…' : 'Cercanos'}
              </button>
            </div>
          </div>

          {/* COL DERECHA — Utilidades: ubicación + BCV + selector moneda */}
          <div className="flex items-center gap-2 shrink-0 text-xs">
            <div className="hidden lg:flex items-center gap-1.5 font-bold text-slate-600" suppressHydrationWarning>
              <MapPin className="w-3.5 h-3.5 text-[#fe6712] shrink-0" />
              <span className="truncate max-w-[130px]">
                <strong className="text-slate-900">{userLocation ? userLocation.label : 'Cabimas, Zulia'}</strong>
              </span>
            </div>
            <div className="hidden xl:flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 text-slate-500 text-[11px]">
              <Coins className="w-3 h-3 text-amber-500" />
              <span>BCV: <strong className="text-slate-800">{bcvRate ? `Bs. ${bcvRate.toFixed(2)}` : '---'}</strong></span>
            </div>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-[10px] font-bold">
              <button type="button" onClick={() => setCurrencyMode('DUAL')} className={`px-2.5 py-1 rounded-full cursor-pointer whitespace-nowrap transition ${currencyMode === 'DUAL' ? 'bg-[#fe6712] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>$/Bs</button>
              <button type="button" onClick={() => setCurrencyMode('USD')} className={`px-2.5 py-1 rounded-full cursor-pointer whitespace-nowrap transition ${currencyMode === 'USD' ? 'bg-[#fe6712] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>USD</button>
              <button type="button" onClick={() => setCurrencyMode('VES')} className={`px-2.5 py-1 rounded-full cursor-pointer whitespace-nowrap transition ${currencyMode === 'VES' ? 'bg-[#fe6712] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Bs</button>
            </div>
          </div>

        </div>
      </div>

      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-4 flex-1 space-y-6">

        {/* Promociones en primera línea */}
        <PromotionsCarousel
          promotions={homePromotionsOpenOnly}
          onSelectPromotion={handleHomePromotionClick}
        />

        {/* Categorías */}
        <section id="categorias-tiendas" className="space-y-2.5 pt-0.5 scroll-mt-24">
          <div className="flex justify-between items-center">
            <h3 className="text-sm md:text-base font-black text-slate-900 tracking-tight">Categorías</h3>
            <div className="hidden sm:flex items-center gap-1.5">
              <button type="button" onClick={() => scrollCategories('left')} className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-orange-50 text-slate-600 flex items-center justify-center cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => scrollCategories('right')} className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-orange-50 text-slate-600 flex items-center justify-center cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          
          <div ref={categoryRailRef} className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[76px] sm:min-w-[88px] p-2 rounded-2xl transition-all cursor-pointer select-none group ${
                selectedCategory === 'ALL'
                  ? 'bg-[#fe6712] text-white shadow-md shadow-[#fe6712]/30 border border-[#fe6712]'
                  : 'bg-white border border-slate-100 hover:border-orange-200 text-slate-700 shadow-2xs hover:shadow-xs'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 ${
                  selectedCategory === 'ALL'
                    ? 'bg-white/20 text-white shadow-xs'
                    : 'bg-orange-50 text-[#fe6712] group-hover:bg-orange-100'
                }`}
              >
                <Sparkles className="w-6 h-6 shrink-0" strokeWidth={1.8} />
              </div>
              <span className={`text-xs tracking-tight text-center truncate max-w-[80px] ${selectedCategory === 'ALL' ? 'font-bold text-white' : 'font-semibold text-slate-700 group-hover:text-[#fe6712]'}`}>
                Todos
              </span>
            </button>

            {Array.isArray(realCategories) && realCategories.map((cat, idx) => {
              const catCode = typeof cat === 'object' && cat ? String(cat.code || cat.id || idx) : String(idx);
              const catName = typeof cat === 'object' && cat ? String(cat.name || cat.categoriesName || cat.code || 'Categoría') : 'Categoría';
              const catImage = typeof cat === 'object' && cat && typeof cat.image === 'string' && cat.image.trim() !== '' ? cat.image : null;
              const isActive = selectedCategory === catCode;
              const CategoryIcon = getCategoryIcon(catName);
              
              return (
                <button
                  key={cat?.id ?? cat?.code ?? idx}
                  type="button"
                  onClick={() => setSelectedCategory(catCode)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[76px] sm:min-w-[88px] p-2 rounded-2xl transition-all cursor-pointer select-none group ${
                    isActive
                      ? 'bg-[#fe6712] text-white shadow-md shadow-[#fe6712]/30 border border-[#fe6712]'
                      : 'bg-white border border-slate-100 hover:border-orange-200 text-slate-700 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 ${
                      isActive
                        ? 'bg-white/20 text-white shadow-xs'
                        : 'bg-slate-100/80 text-slate-600 group-hover:bg-orange-50 group-hover:text-[#fe6712]'
                    }`}
                  >
                    {catImage ? (
                      <img src={catImage} alt={catName} className="w-6 h-6 object-contain shrink-0" />
                    ) : (
                      <CategoryIcon className="w-6 h-6 shrink-0" strokeWidth={1.8} />
                    )}
                  </div>
                  <span className={`text-xs tracking-tight text-center truncate max-w-[80px] ${isActive ? 'font-bold text-white' : 'font-semibold text-slate-700 group-hover:text-[#fe6712]'}`}>
                    {catName}
                  </span>
                </button>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredMerchants.map(merchant => {
                let distanceKm: number | null = null;
                let calculatedFeeText: string | null = null;

                if (userLocation) {
                  const location = parseSafeLocation(merchant.location);
                  distanceKm = getDistanceInKm(userLocation.lat, userLocation.lng, location.lat, location.lng);
                  const feeUSD = Math.max(1.00, Number((distanceKm * (merchant.deliveryAmountRate || 1.0)).toFixed(2)));
                  calculatedFeeText = formatPriceBimonetary(feeUSD);
                }

                // Limpieza y desduplicación estricta de taxonomías
                const cleanCategories = (() => {
                  const raw = merchant.categoriesName || merchant.category || 'Comercio';
                  const list = String(raw)
                    .split(/[,/|;]+/)
                    .map(s => s.trim())
                    .filter(Boolean);
                  const unique = Array.from(new Set(list));
                  return unique.length > 0 ? unique.join(' • ') : 'Comercio';
                })();

                return (
                  <div
                    key={merchant.id}
                    onClick={() => handleStoreClick(merchant)}
                    className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-lg transition-shadow duration-300 overflow-hidden group cursor-pointer relative"
                  >
                    {/* Banner Superior Smart Fit (Doble Capa Sin Recortes) */}
                    <div className="h-28 sm:h-32 w-full relative bg-slate-100 flex items-center justify-center">
                      {/* Capa 1: Fondo difuminado de relleno */}
                      {(merchant.banner || merchant.image) ? (
                        <img
                          src={merchant.banner || merchant.image}
                          alt="bg"
                          className="absolute inset-0 w-full h-full object-cover blur-md opacity-40 scale-110 z-0"
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-200 via-orange-50/30 to-slate-100 z-0" />
                      )}

                      {/* Capa 2: Imagen principal SIN CORTES (object-contain estricto) */}
                      {(merchant.banner || merchant.image) ? (
                        <img
                          src={merchant.banner || merchant.image}
                          alt={merchant.name}
                          className="relative w-full h-full object-contain z-10 p-1 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="relative z-10 flex items-center justify-center w-full h-full">
                          <Store className="w-8 h-8 text-slate-300/80" />
                        </div>
                      )}

                      {/* Rating en la esquina superior derecha */}
                      <div className="absolute top-2 right-2 z-30 bg-white/95 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm border border-slate-100">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> {merchant.storeScoring || '5.0'}
                      </div>

                      {/* Logo Avatar Reposicionado a la Izquierda (Sin Recortes) */}
                      <div className="absolute -bottom-6 left-3 sm:left-4 w-14 h-14 bg-white rounded-xl shadow-md border-2 border-white p-1 z-20 flex items-center justify-center overflow-hidden">
                        <img
                          src={merchant.avatar || merchant.logo || '/images/logo-duna.png'}
                          alt={merchant.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Información Inferior (Alineación a la Izquierda) */}
                    <div className="pt-8 pb-4 px-3 sm:px-4 flex flex-col items-start text-left flex-1 justify-between">
                      <div className="w-full space-y-0.5 text-left">
                        <h4 className="font-extrabold text-slate-800 text-base line-clamp-1 w-full text-left group-hover:text-[#fe6712] transition-colors">
                          {merchant.name}
                        </h4>

                        <p className="text-[11px] text-slate-500 truncate w-full mt-0.5 font-medium text-left">
                          {cleanCategories}
                        </p>
                      </div>

                      {/* Badges (Píldoras) Alineadas a la Izquierda */}
                      <div className="flex items-center justify-start gap-2 mt-3 w-full flex-wrap pt-2 border-t border-slate-100/80">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setScheduleStore({ id: merchant.id, name: merchant.name }); }}
                          title="Ver horario semanal"
                          className={
                            merchant.status === 'OPEN'
                              ? 'bg-green-50 text-green-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:bg-green-100 transition'
                              : 'bg-slate-50 text-slate-500 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:bg-slate-100 transition'
                          }
                        >
                          {merchant.status === 'OPEN' && (
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          )}
                          <span>{merchant.scheduleInfo || (merchant.status === 'OPEN' ? 'Abierto' : 'Cerrado')}</span>
                        </button>

                        {userLocation && calculatedFeeText ? (
                          <span className="bg-orange-50 text-[#FE6712] px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 border border-orange-100">
                            <Bike className="w-3 h-3" /> {calculatedFeeText} ({distanceKm} km)
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleTriggerGpsCalculation}
                            disabled={isLocating}
                            className="bg-orange-50 hover:bg-orange-100 text-[#FE6712] px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 border border-orange-100 cursor-pointer transition"
                          >
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
      
      {/* Modal de microsectores eliminado (2026-09-23): la plataforma opera por GPS exacto del dispositivo.
          Fallback: centro geométrico de Cabimas. Selector de CIUDAD para expansión nacional, pendiente. */}

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