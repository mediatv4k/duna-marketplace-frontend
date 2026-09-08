/**
 * ==============================================================================
 * BITÁCORA DE ACTUALIZACIÓN - MOTOR MAESTRO D'UNA MARKETPLACE
 * ==============================================================================
 * Fecha: Lunes, 07 de Septiembre de 2026
 * Hora Local: 07:15 PM (Cabimas, Estado Zulia, Venezuela)
 * Versión de Arquitectura: 6.0.3 (Production Ready - Type Safe Hotfix)
 * Archivo: src/app/page.tsx
 * ==============================================================================
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import MerchantStoreView from '@/components/MerchantStoreView';
import CheckoutModal from '@/components/CheckoutModal';
import OrderTrackingModal from '@/components/OrderTrackingModal';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  MapPin, 
  X, 
  Navigation, 
  Loader2, 
  Store, 
  Home, 
  Compass, 
  ShoppingBag,
  Coins,
  Truck,
  Bike
} from 'lucide-react';

// ==========================================================
// TASA OFICIAL Y CONFIGURACIÓN BIMONETARIA
// ==========================================================
const TASA_BCV_ACTUAL = 48.50; // Bs. por USD

// ==========================================================
// ÍCONOS VECTORIALES DE CATEGORÍAS (ARTE LINEAL CALIBRADO)
// ==========================================================
function IconTodos({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconFastFood({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11a4 4 0 0 1 8 0H3z" />
      <path d="M2 14h10" />
      <path d="M3 17h8a2 2 0 0 0 2-2v-1H1v1a2 2 0 0 0 2 2z" />
      <path d="M15 6v12" />
      <path d="M18 4v14" />
      <path d="M21 7v11" />
      <path d="M14 18h8" />
    </svg>
  );
}

function IconBicicleta({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6h-3l-2.5 6.5" />
      <path d="M12 17.5 8.5 10H4" />
      <path d="M5.5 17.5 10 10l3.5 7.5h5" />
    </svg>
  );
}

function IconPizzerias({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 2 9 15a3 3 0 0 1-2.5 4.5H5.5A3 3 0 0 1 3 17z" />
      <circle cx="10" cy="13" r="1" />
      <circle cx="14" cy="14" r="1" />
      <circle cx="12" cy="8" r="1" />
    </svg>
  );
}

function IconModa({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconMiniMarket({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function IconPostres({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
      <path d="M4 16s2-1 4-1 4 1 4 1 2-1 4-1 4 1 4 1" />
      <path d="M2 21h20" />
      <circle cx="12" cy="7" r="2" />
      <path d="M12 3v2" />
    </svg>
  );
}

function IconBodegones({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 22V10a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v12" />
      <path d="M10 2h2v4h-2z" />
      <path d="M16 14a3 3 0 0 0 6 0v-4h-6z" />
      <path d="M19 17v5" />
      <path d="M17 22h4" />
    </svg>
  );
}

function IconArabe({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="m5 8 14 6" />
      <path d="m5 14 14 6" />
    </svg>
  );
}

function IconDelMar({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6s-7.56-2.54-8.5-6Z" />
      <path d="M18 12h.01" />
      <path d="M2 16l4.5-4L2 8z" />
    </svg>
  );
}

function IconHeladerias({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7 11 4 9 4-9" />
      <path d="M7 11a4 4 0 1 1 8 0z" />
      <path d="M19 5a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v6h5z" />
      <path d="M16.5 11v4" />
    </svg>
  );
}

function IconNaturistas({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function IconTecnologia({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function IconLimpieza({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V3" />
      <path d="M3 14h14a2 2 0 0 1 2 2v5H1v-5a2 2 0 0 1 2-2z" />
      <path d="m19 5 2 2-2 2-2-2z" />
    </svg>
  );
}

const categoriesList = [
  { id: 'ALL', label: 'Todos', icon: IconTodos, keywords: [] },
  { id: 'fastfood', label: 'Fast Food', icon: IconFastFood, keywords: ['comida', 'hamburguesa', 'pizza', 'fast'] },
  { id: 'bicicleta', label: 'Bicicleta', icon: IconBicicleta, keywords: ['bicicleta', 'ciclo', 'repuestos'] },
  { id: 'pizzerias', label: 'Pizzerías', icon: IconPizzerias, keywords: ['pizza', 'pizzeria', 'italiana'] },
  { id: 'moda', label: 'Moda y Más', icon: IconModa, keywords: ['moda', 'ropa', 'franela', 'textil'] },
  { id: 'minimarket', label: 'Mini Market', icon: IconMiniMarket, keywords: ['market', 'viveres', 'abarrotes'] },
  { id: 'postres', label: 'Postres', icon: IconPostres, keywords: ['postre', 'dulce', 'helado', 'torta'] },
  { id: 'bodegones', label: 'Bodegones', icon: IconBodegones, keywords: ['bodegon', 'licor', 'bebidas'] },
  { id: 'arabe', label: 'Árabe', icon: IconArabe, keywords: ['arabe', 'shawarma', 'falafel'] },
  { id: 'delmar', label: 'Del Mar', icon: IconDelMar, keywords: ['mar', 'pescado', 'mariscos'] },
  { id: 'heladerias', label: 'Heladerías', icon: IconHeladerias, keywords: ['helad', 'paleta', 'cono'] },
  { id: 'naturistas', label: 'Naturistas', icon: IconNaturistas, keywords: ['farmacia', 'salud', 'naturista', 'medicina'] },
  { id: 'tecnologia', label: 'Tecnología', icon: IconTecnologia, keywords: ['tecnologia', 'gaming', 'computacion', 'celular'] },
  { id: 'limpieza', label: 'P Limpieza', icon: IconLimpieza, keywords: ['limpieza', 'detergente', 'hogar'] },
];

const quickSearchChips = ['🍦 Barquillas', '💊 Acetaminofén', '🍔 Cena Express', '🍕 Pizza Familiar', '📱 Accesorios Honor'];

const cabimasSectores = [
  { id: 'centro', name: 'Casco Central / Centro', coords: { lat: 10.3950, lng: -71.4550 } },
  { id: 'ambrosio', name: 'Ambrosio / Miraflores', coords: { lat: 10.4020, lng: -71.4420 } },
  { id: 'delicias', name: 'Delicias Nuevas / Las 40s', coords: { lat: 10.3910, lng: -71.4470 } },
  { id: 'buenavista', name: 'Buena Vista / Campo Blanco', coords: { lat: 10.3820, lng: -71.4390 } },
  { id: 'laureles', name: 'Los Laureles / Monte Claro', coords: { lat: 10.4150, lng: -71.4350 } },
  { id: 'nuevacabimas', name: 'Nueva Cabimas / Federación', coords: { lat: 10.4250, lng: -71.4200 } },
  { id: 'larosa', name: 'La Rosa / Concordia', coords: { lat: 10.3750, lng: -71.4620 } },
  { id: 'tierranegra', name: 'Tierra Negra / Guabina', coords: { lat: 10.3980, lng: -71.4580 } },
];

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

const merchantsData: Record<string, any> = {
  'papa-helado': {
    info: {
      id: 'papa-helado',
      name: 'Papá Helado',
      category: 'Heladerías & Postres',
      rating: 4.9,
      deliveryTime: '15 - 25 min',
      deliveryFee: '$1.50',
      baseRatePerKm: 0.75,
      isNationalShippingEnabled: false,
      coords: { lat: 10.3922, lng: -71.4385 },
      image: '/images/logo-papa.png',
      badge: 'Aliado Destacado',
      schedule: 'Abre a las 12:00 PM',
      isOpen: true,
      weeklyHours: [{ day: 'Lunes', hours: '12:00 PM - 09:00 PM' }]
    },
    products: [
      { code: 'H001-004', category: 'LÍNEA ML', name: 'Papa Cono 12 Und Mínimo', desc: 'Arma tu combo seleccionando tus 12 sabores favoritos.', price: 9.30, image: 'https://carjos-marketplace.cloud/uploads/uploads/files/images/cmh9iok9w002j1wl89hxlchgk.png', status: 'ACTIVE' }
    ]
  },
  'farma-duna': {
    info: {
      id: 'farma-duna',
      name: "Farma D'una Megastore",
      category: 'Farmacia & Salud',
      rating: 5.0,
      deliveryTime: '10 - 20 min',
      deliveryFee: '¡Gratis!',
      baseRatePerKm: 0.50,
      isFreeDelivery: true,
      isNationalShippingEnabled: true,
      preferredNationalCouriers: ['MRW'],
      coords: { lat: 10.4081, lng: -71.4482 },
      image: '/images/logo-farma.png',
      badge: 'Regencia 24/7',
      schedule: 'Abierto 24 Horas',
      isOpen: true,
      weeklyHours: [{ day: 'Lunes', hours: 'Atención Continua 24 Horas' }]
    },
    products: [
      { code: 'FD001-001', category: 'Antialergico', name: 'Cetirizina 10 mg Cetral', desc: 'Antihistamínico para alivio de síntomas alérgicos.', price: 21.0, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60', status: 'ACTIVE' }
    ]
  },
  'grupo-bitmar': {
    info: {
      id: 'grupo-bitmar',
      name: 'Grupo Bitmar',
      category: 'Tecnología & Gaming',
      rating: 4.8,
      deliveryTime: '20 - 30 min',
      deliveryFee: '$2.00',
      baseRatePerKm: 0.85,
      isNationalShippingEnabled: true,
      preferredNationalCouriers: ['ZOOM', 'TEALCA'],
      coords: { lat: 10.3854, lng: -71.4581 },
      image: '/images/logo-bitmar.png',
      badge: 'Oficial Autorizado',
      schedule: 'Abre a las 09:00 AM',
      isOpen: true,
      weeklyHours: [{ day: 'Lunes', hours: '09:00 AM - 06:00 PM' }]
    },
    products: [
      { code: 'BM001-016', category: 'MONITORES', name: 'MONITOR LG 20MK40L 165Hz', desc: 'Tiempo de respuesta 1 ms, panel IPS Full HD.', price: 100.0, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60', status: 'ACTIVE' }
    ]
  },
  'mostaza-food-truck': {
    info: {
      id: 'mostaza-food-truck',
      name: 'Mostaza Food Truck',
      category: 'Fast Food',
      rating: 4.9,
      deliveryTime: '15 - 30 min',
      deliveryFee: '$1.50',
      baseRatePerKm: 0.70,
      isNationalShippingEnabled: false,
      coords: { lat: 10.3950, lng: -71.4450 },
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80',
      badge: 'Nuevo Ingreso',
      schedule: 'Abre a las 05:00 PM',
      isOpen: true,
      weeklyHours: [{ day: 'Lunes a Domingo', hours: '05:00 PM - 12:00 AM' }]
    },
    products: [
      {
        code: "MF001-003",
        category: "PERROS CALIENTES",
        name: "Perro Sifrino (Individual)",
        desc: "Pan de la Casa, salchicha polaca, Ensalada, Papitas francesas, Queso Amarillo Rallado y Salsas.",
        price: 3.10,
        image: "https://images.unsplash.com/photo-1594212691516-74724655b412?q=80&w=500",
        status: "ACTIVE",
        exclusions: ["Sin Salchicha", "Sin Ensalada", "Sin Papitas", "Sin Queso", "Sin Salsas"]
      },
      {
        code: "MF002-002",
        category: "COMBOS",
        name: "Combo 5 Perros Sifrinos",
        desc: "Combo familiar de 5 Perros Sifrinos. ¡Ideal para probar el Modo Familia con exclusiones por persona!",
        price: 12.30,
        image: "https://images.unsplash.com/photo-1620189507195-68309c04c4d0?q=80&w=500",
        status: "ACTIVE",
        exclusions: ["Sin Salchicha", "Sin Ensalada", "Sin Papitas", "Sin Queso", "Sin Salsas"]
      }
    ]
  }
};

const promotionsList = [
  { id: 1, file: '/images/promo-1.png', merchantId: 'papa-helado' },
  { id: 2, file: '/images/promo-2.png', merchantId: 'farma-duna' },
  { id: 3, file: '/images/promo-3.png', merchantId: 'grupo-bitmar' },
  { id: 4, file: '/images/promo-4.png', merchantId: 'papa-helado' },
  { id: 5, file: '/images/promo-5.png', merchantId: 'farma-duna' },
  { id: 6, file: '/images/promo-6.png', merchantId: 'grupo-bitmar' },
  { id: 7, file: '/images/promo-7.png', merchantId: 'papa-helado' },
  { id: 8, file: '/images/promo-8.png', merchantId: 'farma-duna' },
  { id: 9, file: '/images/promo-9.png', merchantId: 'grupo-bitmar' },
  { id: 10, file: '/images/promo-10.png', merchantId: 'papa-helado' },
  { id: 11, file: '/images/promo-11.png', merchantId: 'farma-duna' },
  { id: 12, file: '/images/promo-12.png', merchantId: 'grupo-bitmar' },
];

const merchantsList = Object.values(merchantsData).map(m => m.info);

export default function MultitiendaHub() {
  const [activeMerchantId, setActiveMerchantId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [currencyMode, setCurrencyMode] = useState<'DUAL' | 'USD' | 'VES'>('DUAL');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string>('788');
  const [hasCompletedOrder, setHasCompletedOrder] = useState<boolean>(false);

  const [scheduleModalMerchant, setScheduleModalMerchant] = useState<any | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isFallbackModalOpen, setIsFallbackModalOpen] = useState<boolean>(false);

  const promoRailRef = useRef<HTMLDivElement>(null);
  const categoryRailRef = useRef<HTMLDivElement>(null);
  const [isPromoPaused, setIsPromoPaused] = useState<boolean>(false);

  const formatPriceBimonetary = (amountUSD: number): string => {
    const amountVES = amountUSD * TASA_BCV_ACTUAL;
    if (currencyMode === 'USD') return `$${amountUSD.toFixed(2)}`;
    if (currencyMode === 'VES') return `Bs. ${amountVES.toFixed(2)}`;
    return `$${amountUSD.toFixed(2)} (Bs. ${amountVES.toFixed(2)})`;
  };

  useEffect(() => {
    if (isPromoPaused) return;
    const interval = setInterval(() => {
      if (!promoRailRef.current) return;
      const el = promoRailRef.current;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 15) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 160, behavior: 'smooth' });
      }
    }, 3200);
    return () => clearInterval(interval);
  }, [isPromoPaused]);

  const scrollPromos = (dir: 'left' | 'right') => {
    if (!promoRailRef.current) return;
    const el = promoRailRef.current;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (dir === 'right') {
      if (el.scrollLeft >= maxScroll - 15) el.scrollTo({ left: 0, behavior: 'smooth' });
      else el.scrollBy({ left: 220, behavior: 'smooth' });
    } else {
      if (el.scrollLeft <= 15) el.scrollTo({ left: maxScroll, behavior: 'smooth' });
      else el.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

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

  const handleTriggerGpsCalculation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLocating(true);
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            label: 'Mi Ubicación Actual (GPS)',
          });
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
          setIsFallbackModalOpen(true);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setIsLocating(false);
      setIsFallbackModalOpen(true);
    }
  };

  const [orderSummaryData, setOrderSummaryData] = useState({
    metodoEntrega: 'delivery' as const,
    direccion: 'Cabimas, Zulia',
    costoEnvio: 2.00,
    subtotalUSD: 10.00,
    totalUSD: 12.00,
    esEnvioNacional: false,
    agenciaNacional: 'MRW' as any,
    costoEnvioNacional: 4.50,
  });

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    if (hasCompletedOrder) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart_data');
        localStorage.removeItem('current_order');
      }
      setActiveMerchantId(null);
      setHasCompletedOrder(false);
    }
  };

  const handleViewTrackingFromCheckout = () => {
    setIsCheckoutOpen(false);
    if (hasCompletedOrder) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart_data');
        localStorage.removeItem('current_order');
      }
      setActiveMerchantId(null);
      setHasCompletedOrder(false);
    }
    setIsTrackingOpen(true);
  };

  if (activeMerchantId && merchantsData[activeMerchantId]) {
    const merchantInfo = merchantsData[activeMerchantId].info;
    const merchantProducts = merchantsData[activeMerchantId].products;

    return (
      <>
        <MerchantStoreView 
          key={activeMerchantId}
          merchant={merchantInfo}
          products={merchantProducts}
          onBack={() => setActiveMerchantId(null)}
          onOpenCheckout={(summary) => {
            setOrderSummaryData({ 
              ...summary, 
              esEnvioNacional: merchantInfo.isNationalShippingEnabled || false, 
              agenciaNacional: merchantInfo.preferredNationalCouriers?.[0] || 'MRW', 
              costoEnvioNacional: 4.50 
            });
            setIsCheckoutOpen(true);
          }}
        />

        <CheckoutModal 
          isOpen={isCheckoutOpen}
          onClose={handleCloseCheckout}
          orderSummary={orderSummaryData}
          tasaBcv={TASA_BCV_ACTUAL}
          merchantName={merchantInfo.name}
          onFinalizeOrder={(orderData) => { 
            setHasCompletedOrder(true);
            const idGen = orderData?.id || '788';
            setActiveOrderId(idGen);
            if (typeof window !== 'undefined') localStorage.setItem('last_active_order_id', idGen);
          }}
          onBackToCart={() => setIsCheckoutOpen(false)}
          onViewTracking={handleViewTrackingFromCheckout}
        />

        <OrderTrackingModal isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} orderId={activeOrderId} orderSummary={orderSummaryData} />
      </>
    );
  }

  const filteredMerchants = merchantsList.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.category.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div suppressHydrationWarning className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans pb-16 md:pb-0">
      
      {/* Topbar Bimonetario */}
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
              <button type="button" onClick={() => setCurrencyMode('VES')} className={`px-2 py-0.5 rounded-full cursor-pointer ${currencyMode === 'VES' ? 'bg-[#fe6712]' : ''}`}>Bs VES</button>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 text-slate-300 text-[11px]">
              <Coins className="w-3 h-3 text-amber-400" />
              <span>Tasa BCV: <strong className="text-white">Bs. {TASA_BCV_ACTUAL.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div onClick={() => { setActiveMerchantId(null); setSelectedCategory('ALL'); setSearchQuery(''); }} className="flex items-center cursor-pointer select-none py-0.5">
              <img src="/images/logo-duna.png" alt="D'una" className="h-10 md:h-11 w-auto object-contain" />
            </div>
            <div className="md:hidden flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>14 Repartidores en Calle</span>
            </div>
          </div>

          <div className="flex-1 max-w-xl w-full">
            <div className="relative flex items-center bg-slate-100 rounded-2xl border border-slate-200 focus-within:border-[#fe6712] focus-within:bg-white transition shadow-2xs">
              <span className="absolute left-4 text-slate-400">🔍</span>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Busca helados, medicinas, repuestos, combos..." className="w-full bg-transparent text-xs font-semibold text-slate-800 pl-11 pr-8 py-2.5 focus:outline-none placeholder-slate-400" />
              {searchQuery && <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 text-slate-400 text-xs font-bold">✕</button>}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-black text-emerald-800 bg-emerald-50/90 border border-emerald-200 px-3 py-2 rounded-2xl shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Flota D'una Activa • 14 en ruta</span>
            </div>
            <button type="button" onClick={() => setIsTrackingOpen(true)} className="bg-orange-50 hover:bg-orange-100 text-[#fe6712] border border-orange-200 px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer">
              <Clock className="w-4 h-4 text-[#fe6712]" />
              <span>Rastrear Pedido</span>
            </button>
          </div>
        </div>

        <div className="px-4 md:px-8 py-1.5 bg-slate-50/70 border-t border-slate-100 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-[10px] font-bold text-slate-600 whitespace-nowrap">
            <span className="text-slate-400 font-medium">Búsquedas populares:</span>
            {quickSearchChips.map((chip, idx) => (
              <button key={idx} type="button" onClick={() => setSearchQuery(chip.split(' ')[1] || chip)} className="bg-white hover:bg-orange-50 hover:text-[#fe6712] border border-slate-200 px-2 py-0.5 rounded-full transition cursor-pointer shadow-2xs">{chip}</button>
            ))}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-4 flex-1 space-y-6">
        
        {/* Promos */}
        <section className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-sm md:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#fe6712]" /> Promociones Imperdibles
            </h2>
            <div className="hidden sm:flex items-center gap-1.5">
              <button type="button" onClick={() => scrollPromos('left')} className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-orange-50 text-slate-600 flex items-center justify-center cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => scrollPromos('right')} className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-orange-50 text-slate-600 flex items-center justify-center cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <div ref={promoRailRef} onMouseEnter={() => setIsPromoPaused(true)} onMouseLeave={() => setIsPromoPaused(false)} className="flex gap-3 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth no-scrollbar snap-x">
            {promotionsList.map(promo => (
              <div key={promo.id} onClick={() => setActiveMerchantId(promo.merchantId)} className="w-28 sm:w-32 md:w-36 aspect-[2/3] flex-shrink-0 snap-start bg-white rounded-xl md:rounded-2xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-md cursor-pointer group relative">
                <img src={promo.file} alt={`Promo ${promo.id}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 select-none" />
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="space-y-2.5 pt-0.5">
          <div className="flex justify-between items-center">
            <h3 className="text-sm md:text-base font-black text-slate-900 tracking-tight">Categorías</h3>
            <div className="hidden sm:flex items-center gap-1.5">
              <button type="button" onClick={() => scrollCategories('left')} className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-orange-50 text-slate-600 flex items-center justify-center cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => scrollCategories('right')} className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-orange-50 text-slate-600 flex items-center justify-center cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <div ref={categoryRailRef} className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth no-scrollbar snap-x">
            {categoriesList.map(cat => {
              const IconComp = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <div key={cat.id} role="button" tabIndex={0} onClick={() => setSelectedCategory(cat.id)} className={`flex-shrink-0 snap-start flex flex-col items-center justify-center w-20 sm:w-22 py-2.5 px-1 rounded-2xl border transition-all duration-200 cursor-pointer group select-none ${isActive ? 'bg-white border-[#fe6712] ring-2 ring-[#fe6712]/20 shadow-md -translate-y-0.5' : 'bg-white border-slate-200 hover:border-orange-300'}`}>
                  <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-1.5 p-1 ${isActive ? 'bg-[#fe6712] text-white shadow-xs' : 'bg-orange-50/70 text-[#fe6712] group-hover:bg-orange-100'}`}>
                    <IconComp className="w-9 h-9 sm:w-10 sm:h-10" />
                  </div>
                  <span className={`text-[10px] sm:text-[11px] font-bold text-center leading-tight truncate w-full px-0.5 ${isActive ? 'text-[#fe6712] font-black' : 'text-slate-700 group-hover:text-[#fe6712]'}`}>{cat.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tiendas Recomendadas CON LA SECUENCIA EXACTA DE 4 LÍNEAS */}
        <section className="space-y-3.5 pt-1">
          <div className="flex justify-between items-center">
            <h3 className="text-sm md:text-base font-black text-slate-900 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#fe6712]"></span> Tiendas Recomendadas ({filteredMerchants.length})
            </h3>
            <span className="text-xs font-bold text-slate-400" suppressHydrationWarning>{userLocation ? `Cotizado para: ${userLocation.label}` : 'Cabimas, Zulia'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredMerchants.map(merchant => {
              let distanceKm: number | null = null;
              let calculatedFeeText: string | null = null;

              if (userLocation) {
                distanceKm = getDistanceInKm(userLocation.lat, userLocation.lng, merchant.coords.lat, merchant.coords.lng);
                if (merchant.isFreeDelivery) {
                  calculatedFeeText = '¡Gratis!';
                } else {
                  const feeUSD = Math.max(1.00, Number((distanceKm * merchant.baseRatePerKm).toFixed(2)));
                  calculatedFeeText = formatPriceBimonetary(feeUSD);
                }
              }

              return (
                <div key={merchant.id} onClick={() => setActiveMerchantId(merchant.id)} className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#fe6712]/50 p-3.5 flex items-center gap-3.5 shadow-2xs hover:shadow-md transition cursor-pointer group">
                  
                  {/* LOGO INTACTO A LA IZQUIERDA (BLINDADO CON MEDIDAS EXACTAS PARA MÓVIL) */}
                  <div className="w-[80px] h-[80px] min-w-[80px] sm:w-[96px] sm:h-[96px] sm:min-w-[96px] flex-shrink-0 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs relative">
                    <img src={merchant.image} alt={merchant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>

                  {/* COLUMNA DERECHA: SECUENCIA ESTRICTA DE 4 LÍNEAS */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1 overflow-hidden">
                    
                    {/* LÍNEA 1: Nombre del Comercio + Rating */}
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-[#fe6712] transition-colors truncate">{merchant.name}</h4>
                      <span className="flex-shrink-0 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md text-[10px] font-black border border-amber-200 shadow-2xs">⭐ {merchant.rating}</span>
                    </div>

                    {/* LÍNEA 2: Categoría */}
                    <p className="text-[11px] font-bold text-slate-400 truncate">{merchant.category}</p>

                    {/* LÍNEA 3: Reloj Horario + Abierto + Calcular Envío Juntitos */}
                    <div className="flex items-center gap-1.5 text-[10px] font-bold">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setScheduleModalMerchant(merchant); }} className="text-slate-500 hover:text-[#fe6712] bg-slate-100 hover:bg-orange-50 p-1 rounded-md border border-slate-200/80 transition cursor-pointer shadow-2xs flex items-center justify-center shrink-0" title="Ver Horarios">
                        <Clock className="w-3 h-3 text-[#fe6712]" />
                      </button>
                      <span className="text-emerald-700 flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/70 text-[10px] font-bold shadow-2xs shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Abierto
                      </span>

                      {userLocation && calculatedFeeText ? (
                        <span onClick={(e) => { e.stopPropagation(); setIsFallbackModalOpen(true); }} className="px-2 py-0.5 rounded-md bg-orange-50 hover:bg-orange-100 text-[#fe6712] border border-orange-200 font-black cursor-pointer text-[10px] transition shadow-2xs whitespace-nowrap ml-auto">
                          🛵 {calculatedFeeText} ({distanceKm} km)
                        </span>
                      ) : (
                        <button type="button" onClick={handleTriggerGpsCalculation} disabled={isLocating} className="px-2 py-0.5 rounded-md bg-orange-50 hover:bg-orange-100 text-[#fe6712] border border-orange-200 font-black transition cursor-pointer text-[10px] flex items-center gap-1 shadow-2xs whitespace-nowrap ml-auto">
                          {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>🛵 Calcular envío</span>}
                        </button>
                      )}
                    </div>

                    {/* LÍNEA 4: Local Cabimas y Nacional */}
                    <div className="flex flex-wrap gap-1 items-center pt-0.5">
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md font-black shrink-0">
                        <Bike className="w-2.5 h-2.5 text-emerald-600 shrink-0" /> Local (Cabimas)
                      </span>
                      {merchant.isNationalShippingEnabled && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded-md font-black shrink-0">
                          <Truck className="w-2.5 h-2.5 text-sky-600 shrink-0" /> Nacional ({merchant.preferredNationalCouriers?.join(', ')})
                        </span>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* Dock Inferior Móvil */}
      <nav className="md:hidden fixed bottom-3 inset-x-4 z-40 bg-[#090d16]/90 backdrop-blur-lg border border-white/10 rounded-2xl py-2 px-3 shadow-2xl flex items-center justify-around text-white">
        <button type="button" onClick={() => { setActiveMerchantId(null); setSelectedCategory('ALL'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-orange-200">
          <Home className="w-4 h-4 text-[#fe6712]" /> <span>Inicio</span>
        </button>
        <button type="button" onClick={() => setIsFallbackModalOpen(true)} className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-300">
          <Compass className="w-4 h-4" /> <span>Sectores</span>
        </button>
        <button type="button" onClick={handleTriggerGpsCalculation} className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-300">
          <Navigation className="w-4 h-4 text-[#fe6712]" /> <span>GPS Flete</span>
        </button>
        <button type="button" onClick={() => setIsTrackingOpen(true)} className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-300 relative">
          <ShoppingBag className="w-4 h-4" /> <span>Órdenes</span>
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#fe6712] animate-pulse"></span>
        </button>
      </nav>

      {/* Modales de Horarios y Sectores */}
      {scheduleModalMerchant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setScheduleModalMerchant(null)}>
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-[#fe6712]" /><h3 className="font-black text-slate-900 text-base">Horarios de Atención</h3></div>
              <button type="button" onClick={() => setScheduleModalMerchant(null)} className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl text-xs">
              {scheduleModalMerchant.weeklyHours.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center font-semibold border-b border-slate-200/50 pb-1.5 last:border-b-0">
                  <span className="font-bold text-slate-900">{item.day}</span>
                  <span className="text-slate-600">{item.hours}</span>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setScheduleModalMerchant(null)} className="w-full py-2.5 bg-[#0f172a] text-white font-black text-xs rounded-xl cursor-pointer">Entendido</button>
          </div>
        </div>
      )}

      {isFallbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setIsFallbackModalOpen(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-[#fe6712]" /><div><h3 className="font-black text-slate-900 text-base">Selecciona tu Sector en Cabimas</h3><p className="text-[11px] text-slate-500">Calcularemos el delivery desde cada tienda</p></div></div>
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

      <OrderTrackingModal isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} orderId={activeOrderId} orderSummary={orderSummaryData} />

    </div>
  );
}