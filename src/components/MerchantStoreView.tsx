'use client';

import React, { useState } from 'react';
import { ShoppingBag, ChevronRight, Search, Star, Clock, MapPin, Sparkles, FileText, X, ZoomIn, Bike } from 'lucide-react';
import { parseDescriptionTags } from '@/lib/productTags';
import ProductTagBadges from './ProductTagBadges';
import ShareButton from './ShareButton';
import CartModal from './CartModal';
import LocationPickerModal from './LocationPickerModal';
import MasterProductModal from './MasterProductModal';
import VoiceSearchButton from './VoiceSearchButton';
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
  // Lightbox de la grilla de productos: clic en la foto (no en el resto de la tarjeta) la amplía; no toca el carrito ni abre el modal del producto
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null);

  // Reset de scroll al entrar a una tienda (2026-09-22): `page.tsx` monta este componente con `key={activeMerchantId}`,
  // así que cambia de tienda = remonte completo = este efecto corre de nuevo. Sin esto, si el cliente venía con
  // scroll bajado en el Home (o cambiando de una tienda a otra), la vista nueva podía abrir a mitad de página.
  React.useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    if (forceOpenCartTrigger && forceOpenCartTrigger > 0) {
      setIsCartOpen(true);
    }
  }, [forceOpenCartTrigger]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  // Solo scrollea al grid cuando el usuario elige un departamento específico (no en el montaje inicial con 'ALL')
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (typeof document !== 'undefined') {
      const el = document.getElementById('catalog-grid');
      if (el) {
        const offset = window.innerWidth < 1024 ? 80 : 120;
        const y = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }
  }, [selectedCategory, selectedSubcategory]);

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
  const [modalInitialQty, setModalInitialQty] = useState(1); // unidades con las que abre el modal (1 salvo pedido del asistente)
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

  const handleProductClick = async (product: any, initialQty: number = 1) => {
    setModalInitialQty(initialQty);
    setLoadingProduct(true);
    try {
      const res = await getProduct(product.id);
      if (res && res.code === 1 && res.data) {
        const raw = res.data;
        const rawVariants =
          raw.metadata?.variants ||
          raw.variants ||
          raw.groups ||
          raw.metadata?.groups ||
          raw.sabores ||
          raw.metadata?.sabores ||
          raw.pack_items ||
          raw.metadata?.pack_items ||
          raw.options ||
          raw.metadata?.options ||
          raw.customizations ||
          raw.metadata?.customizations ||
          [];
        
        let normalizedGroups: any[] = [];
        if (Array.isArray(rawVariants) && rawVariants.length > 0) {
          const isGroupList = rawVariants.some((g: any) =>
            g && typeof g === 'object' && (Array.isArray(g.items) || Array.isArray(g.options) || Array.isArray(g.values) || Array.isArray(g.variants) || Array.isArray(g.choices))
          );

          if (isGroupList) {
            normalizedGroups = rawVariants.map((g: any) => {
              const list = g.items || g.options || g.values || g.variants || g.choices || [];
              const normalizedList = Array.isArray(list) ? list.filter((item: any) => item?.status !== 'INACTIVE').map((item: any, idx: number) => ({
                ...item,
                name: item.title || item.name || item.label || (typeof item === 'string' ? item : `Opción ${idx + 1}`),
                title: item.title || item.name || item.label || (typeof item === 'string' ? item : `Opción ${idx + 1}`),
                label: item.title || item.name || item.label || (typeof item === 'string' ? item : `Opción ${idx + 1}`),
                id: item.code || item.id || item.value || `opt-${idx}`,
                code: item.code || item.id || item.value || `opt-${idx}`,
                value: item.code || item.value || item.id || `opt-${idx}`,
                price: Number(item.price || item.unitPrice || 0)
              })) : [];

              const isCheckbox = g.selectType === 'CHECKIN' || Boolean(g.checkbox);
              const isMultiple = g.selectType === 'MULTIPLE' || isCheckbox || Number(g.max || g.maxItems || 0) > 1;

              return {
                ...g,
                name: g.name || g.title || g.label || 'Opciones',
                title: g.title || g.name || g.label || 'Opciones',
                label: g.title || g.name || g.label || 'Opciones',
                type: 'SIZE_RADIO', 
                selectType: isCheckbox ? 'CHECKIN' : (isMultiple ? 'MULTIPLE' : (g.selectType || 'SINGLE')),
                checkbox: isCheckbox,
                items: normalizedList,
                options: normalizedList,
                values: normalizedList,
                variants: normalizedList,
                choices: normalizedList
              };
            });
          } else {
            // Lista plana de sabores u opciones
            const normalizedList = rawVariants.filter((item: any) => item?.status !== 'INACTIVE').map((item: any, idx: number) => ({
              ...item,
              name: item.title || item.name || item.label || (typeof item === 'string' ? item : `Sabor ${idx + 1}`),
              title: item.title || item.name || item.label || (typeof item === 'string' ? item : `Sabor ${idx + 1}`),
              label: item.title || item.name || item.label || (typeof item === 'string' ? item : `Sabor ${idx + 1}`),
              id: item.code || item.id || item.value || `flavor-${idx}`,
              code: item.code || item.id || item.value || `flavor-${idx}`,
              value: item.code || item.value || item.id || `flavor-${idx}`,
              price: Number(item.price || item.unitPrice || 0)
            }));

            normalizedGroups = [{
              name: 'Sabores / Opciones',
              title: 'Sabores / Opciones',
              label: 'Sabores / Opciones',
              type: 'SIZE_RADIO',
              selectType: 'MULTIPLE',
              checkbox: false,
              items: normalizedList,
              options: normalizedList,
              values: normalizedList,
              variants: normalizedList,
              choices: normalizedList
            }];
          }
        }

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
    // La sugerencia para la cocina también distingue el ítem: mismo producto con notas distintas no se fusiona.
    const cartItemId = `${productCode}::${JSON.stringify(configuredItem.variants || [])}${configuredItem.notes ? `::${configuredItem.notes}` : ''}`;

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
        notes: configuredItem.notes || undefined,
        image: selectedProductDetail?.image || '',
        category: selectedProductDetail?.category || 'General'
      };
      updated = [...cartItems, newItem];
    }
    updateCartStorage(updated);
    setIsMasterModalOpen(false);
    // El carrito ya no se abre solo al agregar: el cliente sigue comprando (se abre desde la barra "Productos en bolsa").
    // Única excepción: el CTA "Proceder al Pago y Despacho" de la sala colaborativa (combo ya completo) lleva a caja.
    if (configuredItem.proceedToCheckout === true) setIsCartOpen(true);
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
    const subcat = p.internalCategory || p.internal_category || p.subCategory || null;
    const matchesCategory = selectedCategory === 'ALL' || cat === selectedCategory;
    const matchesSubcategory = !selectedSubcategory || selectedSubcategory === subcat;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSubcategory && matchesSearch;
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
  // Buscador reubicado (2026-09-21): antes vivía dentro del catálogo, debajo de promociones/tabs; ahora va pegado
  // al banner principal, antes de cualquier otro contenido. Ya no es sticky (perdía sentido sin la franja superior
  // fija que le daba un "top" de referencia; ver nota de MerchantTemplateEngine) y usa su propio padding horizontal
  // (antes usaba el truco `-mx-4 px-4`, que asumía vivir dentro de un contenedor ya paddeado en 16px).
  const searchNode = (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/60 py-2.5 px-4 transition-all duration-200">
      <div className={`${sidebarLayout ? 'max-w-7xl md:px-8' : 'max-w-4xl'} mx-auto relative`}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar productos, sabores, combos o especialidades..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-14 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-800 shadow-sm focus:outline-none focus:border-[#fe6712] focus:ring-2 focus:ring-orange-100 transition"
        />
        <VoiceSearchButton onResult={setSearchQuery} className="absolute right-2 top-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
  const heroNode = (
    <div className="w-full px-4 lg:max-w-7xl lg:mx-auto lg:px-8 lg:pt-4">
      <div className="h-52 md:h-56 w-full relative overflow-hidden rounded-2xl mb-6 shadow-sm border border-slate-200/80 bg-slate-100">
        {merchant.banner ? (
          <img src={merchant.banner} alt={merchant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#fe6712] to-amber-600" />
        )}
      </div>
      {searchNode}
    </div>
  );
  {/* Isologo D'una (2026-09-21): fixed en vez de absolute dentro del banner — flota sobre toda la vista, visible
      aunque se haga scroll, y ya no depende de que el banner esté presente (útil en escritorio de farmacia, donde
      el banner se oculta). Sigue ejecutando el mismo onBack.
      Círculo perfecto (2026-09-22): sin fondo blanco propio; el borde de marca y la sombra dan el contraste,
      y la imagen en `object-cover` llena el círculo sin dejar bordes cuadrados. */}
  const isologoNode = (
    <button
      type="button"
      onClick={onBack}
      aria-label="Volver al inicio"
      className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-[#FE6712] flex items-center justify-center hover:scale-105 transition-transform duration-200 cursor-pointer"
    >
      <img src="/images/duna-isologo.png" alt="D'una Marketplace" className="w-full h-full object-cover" />
    </button>
  );
  // Datos reales de la tienda para el diseño con barra lateral
  const storeWa = toWhatsAppNumber(merchant?.phone);
  const waHref = (text: string) => (storeWa ? `https://wa.me/${storeWa}?text=${encodeURIComponent(text)}` : null);
  const recipeHref = waHref(`Hola ${merchant.name}, quiero enviarles mi récipe médico.`);
  const departmentCounts = productCategories
    .filter((c) => c !== 'ALL')
    .map((cat) => {
      const catProducts = products.filter((p: any) => ((p.category && String(p.category).trim()) || 'Otros') === cat);
      const subcatsMap = new Map<string, number>();
      catProducts.forEach((p: any) => {
        const sub = p.internalCategory || p.internal_category || p.subCategory;
        if (sub) {
          subcatsMap.set(sub, (subcatsMap.get(sub) || 0) + 1);
        }
      });
      const subcategories = Array.from(subcatsMap.entries()).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);
      return { cat, count: catProducts.length, subcategories };
    });
  const storeBrands = Array.from(new Set(products.map((p: any) => p.brand || p.laboratory).filter(Boolean))) as string[];

  const featuredNode = (
    <>
          {/* Se retiró la tarjeta horizontal "Destacado de hoy": repetía la promoción principal; las promociones van en el carrusel vertical */}
    </>
  );
  const catalogNode = (
    <>
          {selectedCategory === 'ALL' && (
            <PromotionsCarousel
              promotions={canShowPromotions ? promotions : []}
              onSelectPromotion={handlePromotionClick}
            />
          )}

          {!templateNiche && productCategories.length > 1 && (
            <div className="mt-4 sticky top-0 z-40 -mx-4 px-4 py-2 bg-white/95 backdrop-blur-md shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar lg:hidden">
              {productCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setSelectedCategory(cat); setSelectedSubcategory(null); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-[#fe6712] text-white shadow-md shadow-orange-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'Todos' : cat}
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

          {/* El buscador ahora vive pegado al banner (ver `searchNode`, justo debajo de `heroNode`); ya no se repite aquí. */}

          <div className={selectedCategory === 'ALL' ? 'mt-8' : 'mt-4'} id="catalog-grid">
            <div className="flex items-center justify-between mb-4">
              {sidebarLayout ? (
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    {selectedCategory === 'ALL' ? 'Todos los Productos' : (selectedSubcategory || selectedCategory)}
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-black text-slate-600">{filteredProducts.length}</span>
                  {isLoadingMore && <span className="text-[10px] font-bold text-slate-400">Cargando catálogo completo…</span>}
                </div>
              ) : (
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  {selectedCategory === 'ALL' ? 'Menú y Productos' : (selectedSubcategory || selectedCategory)} ({filteredProducts.length})
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
                // Metadatos ocultos en la descripción (ver src/lib/productTags.ts): sin etiquetas `[CLAVE: Valor]`
                // (todos los productos reales verificados hoy, incl. farmacia), `tags` queda vacío y no se dibuja nada extra
                const { cleanDescription, tags: descriptionTags } = parseDescriptionTags(product.desc || product.description);
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
                      <div className="relative w-full aspect-square mb-2 mt-4 p-2 bg-white rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center">
                        <img
                          src={product.image || 'https://images.unsplash.com/photo-1560008511-11c63416e52d'}
                          alt={product.name}
                          className="max-w-full max-h-full object-contain rounded-lg"
                        />
                        {/* Lightbox: solo la lupa lo abre (stopPropagation); tocar el resto de la foto abre la ficha del producto como el resto de la tarjeta */}
                        <button
                          type="button"
                          aria-label={`Ampliar foto de ${product.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxImage({
                              url: product.image || 'https://images.unsplash.com/photo-1560008511-11c63416e52d',
                              name: product.name || 'Producto',
                            });
                          }}
                          className="absolute bottom-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition cursor-zoom-in"
                        >
                          <ZoomIn className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-[8px] text-slate-400 uppercase tracking-wide mb-0.5">
                        {product.brand || product.laboratory || product.category || 'GENERAL'}
                      </p>
                      <h3 className="text-xs md:text-sm font-bold text-slate-800 line-clamp-2 leading-tight">{product.name}</h3>
                      {product.internalCategory && (
                        <p className="text-[9px] font-semibold text-brand-orange mt-0.5">{product.internalCategory}</p>
                      )}
                      {cleanDescription && (
                        <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{cleanDescription}</p>
                      )}
                      <ProductTagBadges tags={descriptionTags} className="mt-1.5" />
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
        {/* Offset uniforme (2026-09-21): sin la franja superior del motor (eliminada), ya no hace falta el `top-24` extra para plantillas */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6 sticky top-20 max-h-[calc(100vh-6rem)] self-start overflow-y-auto no-scrollbar -mx-1 px-1 pt-1 pb-3">
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
                  onClick={() => { setSelectedCategory('ALL'); setSelectedSubcategory(null); }}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${selectedCategory === 'ALL' ? 'bg-orange-50 text-brand-orange' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span>Todos</span>
                  <span className="text-[10px] font-black text-slate-400">{products.length}</span>
                </button>
              </li>
              {departmentCounts.map(({ cat, count, subcategories }) => {
                const isExpanded = selectedCategory === cat;
                return (
                  <li key={cat} className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => { setSelectedCategory(cat); setSelectedSubcategory(null); }}
                      className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${isExpanded ? 'bg-orange-50 text-brand-orange' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden pr-2">
                        <span className="truncate">{cat}</span>
                        {subcategories && subcategories.length > 0 && (
                          <svg className={`w-3 h-3 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        )}
                      </div>
                      <span className="text-[10px] font-black text-slate-400">{count}</span>
                    </button>
                    {isExpanded && subcategories && subcategories.length > 0 && (
                      <ul className="mt-1 mb-1 ml-3 space-y-0.5 border-l-2 border-slate-100 pl-2">
                        {subcategories.map(sub => (
                           <li key={sub.name}>
                             <button
                               type="button"
                               onClick={() => setSelectedSubcategory(sub.name)}
                               className={`w-full flex items-center justify-between rounded-md px-2 py-1 transition cursor-pointer ${selectedSubcategory === sub.name ? 'text-brand-orange bg-orange-50/50 font-bold' : 'text-slate-500 font-semibold hover:text-slate-800 hover:bg-slate-50'}`}
                             >
                               <span className="text-[11px] truncate pr-2 text-left">{sub.name}</span>
                               <span className="text-[9px] font-bold text-slate-300">{sub.count}</span>
                             </button>
                           </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
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
  // Contexto para el asistente (solo lectura, texto corto): catálogo (ver abajo) y carrito "2x Nombre ($total), ... Total: $X".
  // Menú para el asistente: "Nombre (detalle) ($precio)", solo productos con stock, sin recortes a la mitad: se agregan entradas completas
  // hasta llenar ~1500 caracteres (el tope del backend). El detalle sale de las variantes/opciones si el producto las trae y, si no, de `description`
  // (p. ej. "1 Litro"); los sabores de cada producto solo vienen en su detalle (`getProduct`), que no se consulta aquí para no hacer decenas de peticiones.
  const assistantMenuContext = (() => {
    const MAX_CHARS = 1500;
    const parts: string[] = [];
    let total = 0;
    for (const p of products as any[]) {
      if (!p?.name || p?.id == null || !(Number(p?.price) > 0) || p?.outOfStock === true) continue;
      const name = String(p.name).trim(); // sin corte por nombre: el tope es el total del texto
      // `metadata.variants` (grupos con `items[].title`); se omiten las opciones INACTIVE (sin stock)
      const groups = Array.isArray(p.metadata?.variants) ? p.metadata.variants : Array.isArray(p.variants) ? p.variants : [];
      const flavors = groups
        .flatMap((g: any) => g?.items || g?.options || g?.values || [])
        .filter((it: any) => it?.status !== 'INACTIVE')
        .map((it: any) => String(it?.title || it?.name || it?.label || '').trim())
        .filter(Boolean)
        .slice(0, 8);
      const desc = String(p.description || '').replace(/\s+/g, ' ').trim().slice(0, 60);
      const detail = flavors.length > 0 ? `Opciones: ${flavors.join(', ')}` : desc && desc.toLowerCase() !== name.toLowerCase() ? desc : '';
      const entry = `${name}${detail ? ` (${detail})` : ''} ($${Number(p.price).toFixed(2)}) [ID ${p.id}]`;
      if (total + entry.length + 2 > MAX_CHARS) break;
      parts.push(entry);
      total += entry.length + 2;
    }
    return parts.join(', ');
  })();

  const assistantCartContext = cartItems.length === 0
    ? ''
    : cartItems
        .map((item: any) => {
          const qty = item.qty || item.quantity || 1;
          const line = item.totalPrice || (item.price || 0) * qty;
          return `${qty}x ${String(item.name || 'Producto').trim().slice(0, 40)} ($${Number(line).toFixed(2)})`;
        })
        .join(', ') + `. Total: $${subtotalUSD.toFixed(2)}`;

  // Comando del asistente [VER_PRODUCTO:id]: abre el modal del producto (el mismo del clic en la tarjeta). Solo ids que existen en el catálogo
  // cargado, así un id inventado por el modelo no hace nada.
  const handleAssistantOpenProduct = (productId: string, qty: number = 1) => {
    const product = (products as any[]).find((p: any) => String(p?.id) === String(productId));
    if (product) handleProductClick(product, qty);
  };

  // Comando del asistente [AGREGAR_CARRITO:id:cantidad]. Por seguridad, en esta versión NO inyecta al carrito: muchos productos tienen variantes
  // obligatorias (sabores, tamaño, extras) que el cliente debe confirmar, así que actúa igual que handleAssistantOpenProduct (abre el modal maestro).
  // La cantidad pedida llega al modal como `initialQty`: el contador arranca en `qty` en lugar de 1.
  // Arquitectura lista para el futuro: cuando el producto no tenga grupos de variantes obligatorios se podrá construir el ítem y guardarlo en
  // localStorage['cart_data'] (vía updateCartStorage) sin tocar el asistente.
  const handleAssistantAddToCart = (productId: string, qty: number) => {
    handleAssistantOpenProduct(productId, qty);
  };

  const overlaysNode = (
    <>
        {cartItems.length > 0 && (
          <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-950/90 hover:bg-slate-950 text-white backdrop-blur-md shadow-2xl border border-white/10 transition-all duration-300 cursor-pointer active:scale-95"
            >
              <span className="bg-[#FE6712] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{totalItems}</span>
              <span className="font-bold text-sm tracking-wide">Total: ${subtotalUSD.toFixed(2)} USD</span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 border-l border-white/20 pl-3 ml-1 uppercase tracking-wider">
                Ver mi Pedido 
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </button>
          </div>
        )}

        {!templateNiche && isMasterModalOpen && selectedProductDetail && (
          <MasterProductModal
            storeCatalog={products}
            product={selectedProductDetail}
            isOpen={isMasterModalOpen}
            onClose={() => setIsMasterModalOpen(false)}
            onAddToCart={handleAddToCartFromModal}
            nicheEngine={modalEngine}
            bcvRate={bcvRate}
            initialQty={modalInitialQty}
            store={{ name: merchant.name, code: merchant.code }}
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
        <SalesRecoveryAssistant menuContext={assistantMenuContext} cartContext={assistantCartContext} onOpenProduct={handleAssistantOpenProduct} onAddToCart={handleAssistantAddToCart} />

        {/* Lightbox: solo visor de la foto en alta resolución, no toca el carrito ni el modal del producto */}
        {lightboxImage && (
          <div
            role="dialog"
            aria-label={`Foto ampliada de ${lightboxImage.name}`}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              aria-label="Cerrar imagen"
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.name}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
          </div>
        )}
    </>
  );

  if (templateNiche) {
    return (
      <>
      {isologoNode}
      <MerchantTemplateEngine
        niche={templateNiche}
        storeNiche={storeNiche}
        merchantName={merchant.name}
        storeCode={merchant.code}
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
        productInitialQty={modalInitialQty}
      >
        {contentNode}
        {overlaysNode}
      </MerchantTemplateEngine>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {isologoNode}
      {heroNode}

      <div className={`${sidebarLayout ? 'max-w-7xl' : 'max-w-4xl'} mx-auto w-full px-4 md:px-8 py-6 relative z-10`}>
        {contentNode}
      </div>

      {overlaysNode}
    </div>
  );
}
