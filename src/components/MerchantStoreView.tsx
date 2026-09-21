'use client';

import React, { useState } from 'react';
import { ShoppingBag, ChevronRight, Search, Star, Clock, MapPin, Sparkles, FileText } from 'lucide-react';
import CartModal from './CartModal';
import LocationPickerModal from './LocationPickerModal';
import MasterProductModal from './MasterProductModal';
import PromotionsCarousel from './PromotionsCarousel';
import { getProduct, getStorePromotions, getDeliveryRate, getStorePaymentInfo } from '@/services/marketplaceService';
import { getDistanceAndTime } from '@/lib/logisticsEngine';
import { detectStoreNiche, getModalEngine, getNicheConfig } from '@/lib/nicheConfig';
import { getNicheIcon, getBadgeColorClasses } from '@/lib/nicheIcons';
import MerchantTemplateEngine, { templateNicheFromStoreNiche } from './MerchantTemplateEngine';
import { toWhatsAppNumber } from '@/lib/orderTracking';
import SalesRecoveryAssistant from './SalesRecoveryAssistant';

// Regla del contrato: el backend no presta servicio de delivery a más de 12 km
const MAX_DELIVERY_KM = 12;

// manual = pin alterno elegido en el mapa: vive solo en esta vista, nunca se persiste (la ubicación GPS en vivo es la predeterminada)
type CustomerLocation = { lat: number; lng: number; label: string; manual?: boolean };
type DeliveryQuote = {
  status: 'idle' | 'loading' | 'ok' | 'blocked';
  rate?: number;
  distanceKm?: number;
  durationMin?: number;
  message?: string;
};

interface MerchantStoreViewProps {
  merchant: any;
  products: any[];
  onBack: () => void;
  onOpenCheckout: (summary: any) => void;
  forceOpenCartTrigger?: number;
  userLocation?: CustomerLocation | null;
  isLoadingMore?: boolean; // siguen llegando páginas de productos del backend
}

export default function MerchantStoreView({
  merchant,
  products,
  onBack,
  onOpenCheckout,
  forceOpenCartTrigger,
  userLocation,
  isLoadingMore = false,
}: MerchantStoreViewProps) {
  const [cartItems, setCartItems] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cart_data');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  React.useEffect(() => {
    if (forceOpenCartTrigger && forceOpenCartTrigger > 0) {
      setIsCartOpen(true);
    }
  }, [forceOpenCartTrigger]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Categorías reales de producto (CATEGORIA del Excel / product.category del API),
  // en el orden en que aparecen los productos. Sin categoría definida → agrupa en "Otros".
  const productCategories = React.useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    products.forEach((p: any) => {
      const cat = (p.category && String(p.category).trim()) || 'Otros';
      if (!seen.has(cat)) {
        seen.add(cat);
        list.push(cat);
      }
    });
    return ['ALL', ...list];
  }, [products]);

  const [selectedProductDetail, setSelectedProductDetail] = useState<any>(null);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup' | 'national'>('delivery');
  const [rewardMode, setRewardMode] = useState<'DYNAMIC' | 'FIXED'>('DYNAMIC');

  // Ubicación real del cliente (GPS / sector elegido en el Home) y cotización oficial del flete
  const [customerLocation, setCustomerLocation] = useState<CustomerLocation | null>(() => {
    if (userLocation) return userLocation;
    try {
      const saved = typeof window !== 'undefined' ? sessionStorage.getItem('duna_customer_location') : null;
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLocating, setIsLocating] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [quote, setQuote] = useState<DeliveryQuote>({ status: 'idle' });

  const handleRequestLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError('Tu navegador no permite obtener la ubicación.');
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'GPS Actual' });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setLocationError('No pudimos obtener tu ubicación. Activa el GPS y los permisos.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  React.useEffect(() => {
    if (!isCartOpen || deliveryMode !== 'delivery') return;
    if (!customerLocation) {
      setQuote({ status: 'idle' });
      return;
    }
    if (!customerLocation.manual) {
      try { sessionStorage.setItem('duna_customer_location', JSON.stringify(customerLocation)); } catch {}
    }

    const storeCoords = merchant?.coords;
    if (!merchant?.id || !storeCoords || !Number.isFinite(Number(storeCoords.lat)) || !Number.isFinite(Number(storeCoords.lng))) {
      setQuote({ status: 'blocked', message: 'No se pudo determinar la ubicación de la tienda.' });
      return;
    }

    let cancelled = false;
    setQuote({ status: 'loading' });
    (async () => {
      const matrix = await getDistanceAndTime(
        { lat: Number(storeCoords.lat), lng: Number(storeCoords.lng) },
        { lat: customerLocation.lat, lng: customerLocation.lng }
      );
      const distanceKm = Number((matrix.distance / 1000).toFixed(1));
      const durationMin = Math.max(1, Math.round(matrix.duration / 60));
      if (cancelled) return;
      if (distanceKm > MAX_DELIVERY_KM) {
        setQuote({ status: 'blocked', distanceKm, durationMin, message: 'Servicio no disponible a más de 12km' });
        return;
      }
      const result = await getDeliveryRate({
        storeId: merchant.id,
        lat: customerLocation.lat,
        lng: customerLocation.lng,
        distance: distanceKm,
        duration: durationMin,
      });
      if (cancelled) return;
      setQuote(result.ok
        ? { status: 'ok', rate: result.rate, distanceKm, durationMin }
        : { status: 'blocked', distanceKm, durationMin, message: result.message });
    })().catch(() => {
      if (!cancelled) setQuote({ status: 'blocked', message: 'No se pudo cotizar el flete. Intenta de nuevo.' });
    });

    return () => { cancelled = true; };
  }, [isCartOpen, deliveryMode, customerLocation?.lat, customerLocation?.lng, merchant?.id, merchant?.coords?.lat, merchant?.coords?.lng]);

  // Nicho real de la tienda (antes hardcodeado a "FOOD_SWEET" para todas las tiendas)
  const storeNiche = detectStoreNiche(merchant);
  const modalEngine = getModalEngine(storeNiche);
  const nicheConfig = getNicheConfig(storeNiche);

  // Promociones reales del backend (GET /promotion?store={code}).
  // page.tsx ya pobla merchant.code (fix aplicado en una tarea posterior a esta sección).
  const [promotions, setPromotions] = useState<any[]>([]);
  React.useEffect(() => {
    let cancelled = false;
    const storeIdentifier = merchant?.code || merchant?.id;
    if (!storeIdentifier) return;
    getStorePromotions(String(storeIdentifier))
      .then((res) => {
        if (cancelled) return;
        setPromotions(res && res.code === 1 && Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (!cancelled) setPromotions([]);
      });
    return () => { cancelled = true; };
  }, [merchant?.code, merchant?.id]);

  // Verificado contra el backend real de DEV (2026-09-16): 'amount' viaja como STRING, no number.
  // Solo confirmé el cálculo de precio para type === 'pricing' (amount = precio final de la promo,
  // no un descuento a restar). No tengo muestras reales de 'gift'/'discount' — para esos casos no
  // fuerzo ningún precio, según lo pedido.
  const primaryPromo = promotions.find((p: any) => p?.role === 'primary') || promotions[0] || null;
  const promoPrice = primaryPromo?.type === 'pricing' && primaryPromo?.amount != null
    ? Number(primaryPromo.amount)
    : null;

  const featuredProduct = nicheConfig.heroVariant === 'PROMO_HERO'
    ? (primaryPromo
        ? {
            name: primaryPromo.productName || primaryPromo.title || 'Promoción',
            image: primaryPromo.productImage || primaryPromo.imageUrl || primaryPromo.storeLogo || null,
            price: promoPrice ?? 0,
          }
        // Sin promociones reales para esta tienda: heurística de respaldo (Fase 1 original)
        : (products.find((p: any) => p?.metadata?.price?.promoPrice != null) || products[0] || null))
    : null;

  // Regla de negocio compartida: promociones (destacado del hero Y franja completa) solo se
  // muestran con la tienda abierta. Una sola condición para no duplicar la lógica.
  const canShowPromotions = merchant.isOpen;

  // Reabre el modal de producto reutilizando handleProductClick — el contrato de la API
  // documenta que /product/{pid}/web acepta id O hash, así que pasamos productHash como id.
  // Si la promoción no trae productHash, no hacemos nada (no inventamos un mapeo a otro producto).
  const handlePromotionClick = (promo: any) => {
    if (!promo?.productHash) return;
    handleProductClick({
      id: promo.productHash,
      name: promo.productName || promo.title,
      image: promo.productImage || promo.imageUrl,
    });
  };

  // Tasa oficial de la tienda: store.referenceRateValue de GET /store/{id}/payment/info.
  // null = no disponible → el modal de producto no muestra montos en Bs. (nunca una tasa inventada)
  const [bcvRate, setBcvRate] = useState<number | null>(null);
  React.useEffect(() => {
    if (!merchant?.id) return;
    let cancelled = false;
    getStorePaymentInfo(merchant.id)
      .then((res) => {
        const rate = Number(res?.data?.store?.referenceRateValue);
        if (!cancelled && res?.code === 1 && Number.isFinite(rate) && rate > 0) setBcvRate(rate);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [merchant?.id]);

  const updateCartStorage = (newItems: any[]) => {
    setCartItems(newItems);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart_data', JSON.stringify(newItems));
    }
  };

  // CheckoutModal emite 'duna:cart-cleared' al registrar la compra (code 1): la bolsa queda en 0 y la barra flotante se oculta
  React.useEffect(() => {
    const onCartCleared = () => updateCartStorage([]);
    window.addEventListener('duna:cart-cleared', onCartCleared);
    return () => window.removeEventListener('duna:cart-cleared', onCartCleared);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProductClick = async (product: any) => {
    setLoadingProduct(true);
    try {
      const res = await getProduct(product.id);
      if (res && res.code === 1 && res.data) {
        const raw = res.data;
        const rawVariants = raw.metadata?.variants || raw.variants || raw.groups || raw.metadata?.groups || [];
        
        const normalizedGroups = Array.isArray(rawVariants) ? rawVariants.map((g: any) => {
          const list = g.items || g.options || g.values || g.variants || g.choices || [];
          
          // Las opciones INACTIVE (p. ej. sabor sin stock en la BD) no se ofrecen: el backend rechaza la orden con ellas
          const normalizedList = list.filter((item: any) => item?.status !== 'INACTIVE').map((item: any) => ({
            ...item,
            name: item.title || item.name || item.label || 'Opción',
            title: item.title || item.name || item.label || 'Opción',
            label: item.title || item.name || item.label || 'Opción',
            id: item.code || item.id || item.value,
            value: item.code || item.value || item.id,
            price: item.price || item.unitPrice || 0
          }));

          // CHECKIN = casillas de verificación del backend (p. ej. grupo "SIN": sin cebolla, sin salsa); antes caía en SINGLE (radio)
          const isCheckbox = g.selectType === 'CHECKIN';
          const isMultiple = g.selectType === 'MULTIPLE' || isCheckbox || g.max > 1;

          return {
            ...g,
            name: g.name || g.title || g.label || 'Opciones',
            title: g.name || g.title || g.label || 'Opciones',
            label: g.name || g.title || g.label || 'Opciones',
            type: 'SIZE_RADIO', 
            selectType: isMultiple ? 'MULTIPLE' : 'SINGLE',
            checkbox: isCheckbox,
            items: normalizedList,
            options: normalizedList,
            values: normalizedList,
            variants: normalizedList,
            choices: normalizedList
          };
        }) : [];

        console.log('[AUDITORIA VARIANTES]', {
          producto: raw?.name,
          rawMetadata: raw.metadata,
          rawVariants,
          normalizedGroups
        });

        const adaptedProduct = {
          ...raw,
          id: raw.id || product.id,
          price: raw.price || raw.metadata?.price?.basePrice || product.price || 1.5,
          variants: normalizedGroups,
          groups: normalizedGroups,
          slotGroups: normalizedGroups,
          metadata: {
            ...raw.metadata,
            variants: normalizedGroups,
            groups: normalizedGroups,
            slotGroups: normalizedGroups
          }
        };
        setSelectedProductDetail(adaptedProduct);
      } else {
        setSelectedProductDetail({
          ...product,
          id: product.id,
          price: product.price || 1.5,
          variants: [],
          groups: [],
          slotGroups: [],
          metadata: { variants: [], groups: [], slotGroups: [] }
        });
      }
      setIsMasterModalOpen(true);
    } catch (err) {
      console.error('Error al cargar detalle del producto:', err);
      setSelectedProductDetail({
        ...product,
        id: product.id,
        price: product.price || 1.5,
        variants: [],
        groups: [],
        slotGroups: [],
        metadata: { variants: [], groups: [], slotGroups: [] }
      });
      setIsMasterModalOpen(true);
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleAddToCartFromModal = (configuredItem: any) => {
    const rawId = configuredItem.productId || configuredItem.id || selectedProductDetail?.id;
    const realId = Number(rawId);
    const productCode = configuredItem.productCode || selectedProductDetail?.code;
    // Nunca se inventan ids/códigos de producto: deben ser los reales del backend
    if (!Number.isFinite(realId) || realId <= 0 || !productCode) {
      alert('No se pudo identificar el producto. Recarga la tienda e inténtalo de nuevo.');
      return;
    }
    // Identidad única por producto + configuración de variantes: sabores distintos del mismo producto NO deben fusionarse
    const cartItemId = `${productCode}::${JSON.stringify(configuredItem.variants || [])}`;

    const existingIndex = cartItems.findIndex(item => item.cartItemId === cartItemId);
    let updated;
    if (existingIndex > -1) {
      updated = [...cartItems];
      const currentQty = updated[existingIndex].qty || updated[existingIndex].quantity || 1;
      const addQty = configuredItem.qty || configuredItem.quantity || 1;
      const newQty = currentQty + addQty;
      updated[existingIndex].qty = newQty;
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].totalPrice = newQty * (updated[existingIndex].price || configuredItem.totalPrice / addQty);
    } else {
      const newItem = {
        id: realId,
        cartItemId,
        code: productCode,
        name: configuredItem.productName || selectedProductDetail?.name || 'Producto',
        price: configuredItem.totalPrice / (configuredItem.qty || 1),
        qty: configuredItem.qty || configuredItem.quantity || 1,
        quantity: configuredItem.qty || configuredItem.quantity || 1,
        totalPrice: configuredItem.totalPrice,
        breakdown: configuredItem.breakdown || [],
        variants: configuredItem.variants || [],
        pricing: configuredItem.pricing || null,
        image: selectedProductDetail?.image || '',
        category: selectedProductDetail?.category || 'General'
      };
      updated = [...cartItems, newItem];
    }
    updateCartStorage(updated);
    setIsMasterModalOpen(false);
    // El carrito ya no se abre solo al agregar: el cliente sigue comprando (se abre desde la barra "Productos en bolsa")
  };

  const handleUpdateQty = (identifier: string, delta: number) => {
    const updated = cartItems.map(item => {
      // Si el ítem ya tiene cartItemId (variantes distinguibles), matchea solo por ahí;
      // si es un ítem viejo sin cartItemId, cae al match legacy por code/id
      const matches = item.cartItemId
        ? item.cartItemId === identifier
        : (item.code === identifier || String(item.id) === identifier);
      if (matches) {
        const currentQty = item.qty || item.quantity || 1;
        const newQty = currentQty + delta;
        if (newQty <= 0) return null;
        return {
          ...item,
          qty: newQty,
          quantity: newQty,
          totalPrice: newQty * item.price
        };
      }
      return item;
    }).filter(Boolean);
    updateCartStorage(updated);
  };

  const filteredProducts = products.filter(p => {
    const cat = (p.category && String(p.category).trim()) || 'Otros';
    const matchesCategory = selectedCategory === 'ALL' || cat === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalItems = cartItems.reduce((acc, item) => acc + (item.qty || item.quantity || 1), 0);
  const subtotalUSD = cartItems.reduce((acc, item) => acc + (item.totalPrice || (item.price * (item.qty || item.quantity || 1))), 0);

  const umbralEnvio = rewardMode === 'FIXED' ? 15 : 20;
  const faltaParaEnvioGratis = Math.max(0, umbralEnvio - subtotalUSD);
  const esEnvioGratis = subtotalUSD >= umbralEnvio;
  const progresoEnvio = Math.min(100, (subtotalUSD / umbralEnvio) * 100);
  // Flete: cotización oficial del backend (deliveryRate) cuando existe; la tarifa mínima de la tienda queda solo como referencia previa
  const staticDeliveryFee = Number(merchant?.deliveryFee?.replace('$', '') || 1.50);
  const deliveryCost = quote.status === 'ok' && quote.rate !== undefined
    ? quote.rate
    : (Number.isFinite(staticDeliveryFee) ? staticDeliveryFee : 1.50);
  const discountDelivery = esEnvioGratis ? deliveryCost : 0;
  const fleteActivo = deliveryMode === 'pickup' ? 0 : (deliveryMode === 'national' ? 4.50 : (esEnvioGratis ? 0 : deliveryCost));
  const totalUSD = subtotalUSD + fleteActivo;

  // Piezas de la vista: se montan dentro del motor multiplantilla (nichos con plantilla) o directo (sin plantilla)
  const templateNiche = templateNicheFromStoreNiche(storeNiche);
  const isFarma = templateNiche === 'farma';
  // Barra lateral de departamentos + productos en escritorio: TODAS las tiendas (la portada se conserva; solo farmacia la oculta)
  const sidebarLayout = true;
  const heroNode = (
        <div className={`${isFarma ? 'lg:hidden' : ''} relative w-full h-52 lg:h-44 bg-slate-900 overflow-hidden`}>
          {merchant.banner ? (
            <img src={merchant.banner} alt={merchant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#fe6712] to-amber-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver al inicio"
            className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-sm p-1.5 rounded-2xl shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer"
          >
            <img src="/images/duna-isologo.png" alt="D'una Marketplace" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end gap-3">
            <img
              src={merchant.avatar || 'https://images.unsplash.com/photo-1541658016709-82535e94bc69'}
              alt={merchant.name}
              className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-white shrink-0 bg-slate-100"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-white tracking-tight truncate">{merchant.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">⭐ {merchant.rating || '5.0'}</span>
                {merchant.deliveryFee && <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">🛵 {merchant.deliveryFee}</span>}
                {merchant.badge && <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">🕒 {merchant.badge}</span>}
              </div>
            </div>
          </div>
        </div>
  );
  // Datos reales de la tienda para el diseño con barra lateral
  const storeWa = toWhatsAppNumber(merchant?.phone);
  const waHref = (text: string) => (storeWa ? `https://wa.me/${storeWa}?text=${encodeURIComponent(text)}` : null);
  const recipeHref = waHref(`Hola ${merchant.name}, quiero enviarles mi récipe médico.`);
  const departmentCounts = productCategories
    .filter((c) => c !== 'ALL')
    .map((cat) => ({ cat, count: products.filter((p: any) => ((p.category && String(p.category).trim()) || 'Otros') === cat).length }));
  const storeBrands = Array.from(new Set(products.map((p: any) => p.brand || p.laboratory).filter(Boolean))) as string[];

  const featuredNode = (
    <>
          {/* Se retiró la tarjeta horizontal "Destacado de hoy": repetía la promoción principal; las promociones van en el carrusel vertical */}
    </>
  );
  const catalogNode = (
    <>
          {!templateNiche && nicheConfig.trustBadges.length > 0 && (
            <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {nicheConfig.trustBadges.map((badge, idx) => {
                const BadgeIcon = getNicheIcon(badge.icon);
                return (
                  <span
                    key={idx}
                    className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-xl border text-[11px] font-bold whitespace-nowrap ${getBadgeColorClasses(badge.colorToken)}`}
                  >
                    <BadgeIcon className="w-3.5 h-3.5" />
                    {badge.label}
                  </span>
                );
              })}
            </div>
          )}

          <PromotionsCarousel
            promotions={canShowPromotions ? promotions : []}
            onSelectPromotion={handlePromotionClick}
          />

          {!templateNiche && productCategories.length > 1 && (
            <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 lg:hidden">
              {productCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-[#fe6712] text-white shadow-md shadow-orange-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? '✨ Todos' : cat}
                </button>
              ))}
            </div>
          )}

          {isFarma && recipeHref && (
            <a
              href={recipeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="lg:hidden mt-4 w-full flex items-center justify-center gap-2 bg-brand-orange-light border border-orange-200 text-brand-orange font-bold text-xs py-2 rounded-full mb-3 shadow-sm"
            >
              <FileText className="h-4 w-4" />
              Subir Récipe Médico
            </a>
          )}

          <div className={`mt-6 sticky ${templateNiche ? 'top-[61px]' : 'top-0'} z-40 -mx-4 px-4 bg-white/95 backdrop-blur-md border-b border-gray-100 py-3 shadow-sm`}>
            <div className="relative">
              <Search className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar productos, sabores, combos o especialidades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-800 shadow-sm focus:outline-none focus:border-[#fe6712] focus:ring-2 focus:ring-orange-100 transition"
              />
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              {sidebarLayout ? (
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Todos los Productos</h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-black text-slate-600">{filteredProducts.length}</span>
                  {isLoadingMore && <span className="text-[10px] font-bold text-slate-400">Cargando catálogo completo…</span>}
                </div>
              ) : (
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Menú y Productos ({filteredProducts.length})
                </h2>
              )}
            </div>
            
            <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 ${sidebarLayout ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-3 md:gap-4`}>
              {filteredProducts.map((product) => {
                // Insignia solo si el backend trae el dato (hoy los productos no incluyen marca oficial / genérico)
                const badge = product.isOfficialBrand
                  ? { label: 'MARCA OFICIAL', className: 'bg-blue-100 text-blue-700' }
                  : product.isGeneric
                    ? { label: 'GENÉRICO', className: 'bg-emerald-100 text-emerald-700' }
                    : null;
                return (
                  <div
                    key={product.id || product.code}
                    onClick={() => handleProductClick(product)}
                    className="relative bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {badge && (
                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[8px] font-bold ${badge.className}`}>{badge.label}</span>
                      )}
                      <div className="w-full h-24 md:h-32 flex items-center justify-center mb-2 mt-4">
                        <img
                          src={product.image || 'https://images.unsplash.com/photo-1560008511-11c63416e52d'}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <p className="text-[8px] text-slate-400 uppercase tracking-wide mb-0.5">
                        {product.brand || product.laboratory || product.category || 'GENERAL'}
                      </p>
                      <h3 className="text-xs md:text-sm font-bold text-slate-800 line-clamp-2 leading-tight">{product.name}</h3>
                      {product.internalCategory && (
                        <p className="text-[9px] font-semibold text-brand-orange mt-0.5">{product.internalCategory}</p>
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between items-end mt-2">
                        <span className="text-base md:text-lg font-black text-slate-900">${(product.price || 1.5).toFixed(2)}</span>
                        <span className="text-[9px] text-slate-400 hover:text-brand-orange cursor-pointer">Ver Ficha</span>
                      </div>
                      <button
                        type="button"
                        className="w-full mt-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
    </>
  );
  const contentNode = sidebarLayout ? (
    <>
      {featuredNode}

      {/* Catálogo: barra lateral + productos */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className={`hidden lg:block lg:col-span-1 space-y-6 sticky ${templateNiche ? 'top-24 max-h-[calc(100vh-6rem)]' : 'top-6 max-h-[calc(100vh-3rem)]'} self-start overflow-y-auto no-scrollbar -mx-1 px-1 pt-1 pb-3`}>
          {isFarma && recipeHref && (
            <a
              href={recipeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-brand-orange bg-orange-50 p-4 shadow-soft hover:bg-orange-100 transition"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange text-white">
                <FileText className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-black text-slate-900 leading-tight">Subir Récipe Médico</span>
                <span className="block text-[10px] font-semibold text-slate-500 leading-tight mt-0.5">Cotización con Farmacéutico</span>
              </span>
            </a>
          )}

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-soft">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3">Departamentos</h3>
            <ul className="space-y-1">
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${selectedCategory === 'ALL' ? 'bg-orange-50 text-brand-orange' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span>Todos</span>
                  <span className="text-[10px] font-black text-slate-400">{products.length}</span>
                </button>
              </li>
              {departmentCounts.map(({ cat, count }) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${selectedCategory === cat ? 'bg-orange-50 text-brand-orange' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <span className="truncate pr-2">{cat}</span>
                    <span className="text-[10px] font-black text-slate-400">{count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {storeBrands.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-soft">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3">Marcas &amp; Laboratorios</h3>
              <div className="flex flex-wrap gap-2">
                {storeBrands.map((brand) => (
                  <span key={brand} className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{brand}</span>
                ))}
              </div>
            </div>
          )}

          {isFarma && nicheConfig.trustBadges.length > 0 && (
            <div className="rounded-2xl p-5 border border-orange-100 shadow-soft bg-gradient-to-br from-orange-50 to-amber-50">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3">Garantía D&apos;una</h3>
              <ul className="space-y-2">
                {nicheConfig.trustBadges.map((badge, idx) => {
                  const BadgeIcon = getNicheIcon(badge.icon);
                  return (
                    <li key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <BadgeIcon className="w-4 h-4 text-brand-orange shrink-0" />
                      {badge.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </aside>

        <section className="lg:col-span-3 space-y-6">
          {catalogNode}
        </section>
      </div>
    </>
  ) : (
    <>
      {featuredNode}
      {catalogNode}
    </>
  );
  const overlaysNode = (
    <>
        {cartItems.length > 0 && (
          <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="w-full max-w-md bg-slate-900 text-white rounded-3xl p-4 shadow-2xl flex items-center justify-between border border-slate-800 backdrop-blur-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#fe6712] flex items-center justify-center font-black text-white shadow-md">
                  {totalItems}
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Productos en bolsa</p>
                  <p className="text-base font-black text-white">${subtotalUSD.toFixed(2)} USD</p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-[#fe6712] hover:bg-[#e0580d] text-white px-5 py-3 rounded-2xl font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Ver Pedido y Entrega</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {!templateNiche && isMasterModalOpen && selectedProductDetail && (
          <MasterProductModal
            product={selectedProductDetail}
            isOpen={isMasterModalOpen}
            onClose={() => setIsMasterModalOpen(false)}
            onAddToCart={handleAddToCartFromModal}
            nicheEngine={modalEngine}
            bcvRate={bcvRate}
          />
        )}

        {isCartOpen && (
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
            onUpdateQty={handleUpdateQty}
            quoteStatus={quote.status}
            quoteMessage={quote.message}
            distanceKm={quote.distanceKm}
            durationMin={quote.durationMin}
            customerLocation={customerLocation}
            isLocating={isLocating}
            locationError={locationError}
            onRequestLocation={handleRequestLocation}
            onPickLocation={() => setIsPickerOpen(true)}
            onOpenCheckout={(summary) => {
              setIsCartOpen(false);
              const isDelivery = summary.metodoEntrega === 'delivery';
              // Delivery: ubicación y distancia reales cotizadas. Pickup/nacional: no hay ruta de reparto (distancia 0).
              const point = isDelivery ? customerLocation : (customerLocation || merchant?.coords);
              onOpenCheckout({
                ...summary,
                ...(isDelivery && customerLocation
                  ? { direccion: `${customerLocation.label}: ${customerLocation.lat.toFixed(5)}, ${customerLocation.lng.toFixed(5)}` }
                  : {}),
                location: point ? { lat: Number(point.lat), lng: Number(point.lng) } : null,
                distanceKm: isDelivery ? (quote.distanceKm ?? 0) : 0,
                durationMin: isDelivery ? (quote.durationMin ?? 0) : 0,
              });
            }}
            isNationalShippingEnabled={true}
          />
        )}

        {/* Dirección de entrega alterna (mapa): al confirmar, el efecto de cotización recalcula distancia, bloqueo de 12 km y getDeliveryRate */}
        <LocationPickerModal
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          initialCenter={customerLocation ? { lat: customerLocation.lat, lng: customerLocation.lng } : { lat: Number(merchant?.coords?.lat), lng: Number(merchant?.coords?.lng) }}
          storeCoords={merchant?.coords ? { lat: Number(merchant.coords.lat), lng: Number(merchant.coords.lng) } : null}
          onConfirm={(picked) => {
            setLocationError(null);
            setCustomerLocation({ lat: picked.lat, lng: picked.lng, label: picked.address, manual: true });
            setIsPickerOpen(false);
          }}
        />

        {/* Asistente de recuperación (aislado): vigila la inactividad de toda la tienda */}
        <SalesRecoveryAssistant />
    </>
  );

  if (templateNiche) {
    return (
      <MerchantTemplateEngine
        niche={templateNiche}
        storeNiche={storeNiche}
        merchantName={merchant.name}
        hero={heroNode}
        bcvRate={bcvRate}
        products={products}
        filters={productCategories.filter((c) => c !== 'ALL')}
        activeFilter={selectedCategory}
        onFilterChange={setSelectedCategory}
        cartItems={cartItems}
        subtotalUSD={subtotalUSD}
        onOpenCart={() => setIsCartOpen(true)}
        desktopSidebarLayout={sidebarLayout}
        hideNicheHeaderDesktop={isFarma}
        onBack={isFarma ? onBack : undefined}
        selectedProduct={selectedProductDetail}
        isProductModalOpen={isMasterModalOpen}
        onCloseProductModal={() => setIsMasterModalOpen(false)}
        onAddToCart={handleAddToCartFromModal}
      >
        {contentNode}
        {overlaysNode}
      </MerchantTemplateEngine>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {heroNode}

      <div className={`${sidebarLayout ? 'max-w-7xl' : 'max-w-4xl'} mx-auto w-full px-4 md:px-8 py-6 relative z-10`}>
        {contentNode}
      </div>

      {overlaysNode}
    </div>
  );
}
