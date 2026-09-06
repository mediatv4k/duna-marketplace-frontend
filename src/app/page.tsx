/**
 * ==============================================================================
 * BITÁCORA DE ACTUALIZACIÓN - MOTOR MAESTRO D'UNA MARKETPLACE
 * ==============================================================================
 * Fecha: Domingo, 06 de Septiembre de 2026
 * Hora Local: 07:55 AM (Cabimas, Estado Zulia, Venezuela)
 * Versión de Arquitectura: 2.4.0 (Gold Master - UX & Bimonetary Upgrade)
 * Archivo: src/app/page.tsx
 * 
 * REGISTRO DE CAMBIOS Y DECISIONES ESTRATÉGICAS:
 * 1. MOTOR BIMONETARIO NATIVO: Selector global de visualización de moneda (USD / VES / DUAL).
 *    - Conversión automática de flete por kilómetro según tasa oficial BCV vigente (Bs. 48.50).
 * 2. LIMPIEZA DE RUIDO Y SOCIAL PROOF:
 *    - Sustitución de 'Sistema Multitienda Activo' por 'Flota D'una en Ruta (14 repartidores en Cabimas)'.
 *    - Eliminación de textos redundantes para optimizar el viewport vertical.
 * 3. BUSCADOR PREDICTIVO: Chips rápidos de antojo y compra impulsiva debajo del searchbar.
 * 4. MOBILE BOTTOM DOCK: Barra inferior flotante ergonómica para navegación con una sola mano.
 * 5. INFRAESTRUCTURA MANTENIDA: 1-Click GPS Haversine, loop en categorías SVG, promociones autoplay (3.2s)
 *    y blindaje total contra errores de hidratación en Next.js.
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
  Coins
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

// Lista de Categorías con claves de filtrado
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

// Quick search chips (antojos rápidos)
const quickSearchChips = [
  '🍦 Barquillas',
  '💊 Acetaminofén',
  '🍔 Cena Express',
  '🍕 Pizza Familiar',
  '📱 Accesorios Honor',
];

// Sectores urbanos de Cabimas
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

// Cálculo de distancia en km (Fórmula Haversine)
function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Base de datos de Comercios Aliados en Cabimas
const merchantsData: Record<string, {
  info: {
    id: string;
    name: string;
    category: string;
    rating: number;
    deliveryTime: string;
    deliveryFee: string;
    baseRatePerKm: number;
    isFreeDelivery?: boolean;
    coords: { lat: number; lng: number };
    image: string;
    badge: string;
    schedule: string;
    isOpen: boolean;
    weeklyHours: Array<{ day: string; hours: string }>;
  };
  products: Array<{
    code: string;
    category: string;
    name: string;
    desc: string;
    price: number;
    image: string;
    status: 'ACTIVE' | 'INACTIVE';
  }>;
}> = {
  'papa-helado': {
    info: {
      id: 'papa-helado',
      name: 'Papá Helado',
      category: 'Heladerías & Postres',
      rating: 4.9,
      deliveryTime: '15 - 25 min',
      deliveryFee: '$1.50',
      baseRatePerKm: 0.75,
      coords: { lat: 10.3922, lng: -71.4385 },
      image: '/images/logo-papa.png',
      badge: 'Aliado Destacado',
      schedule: 'Abre a las 12:00 PM',
      isOpen: true,
      weeklyHours: [
        { day: 'Lunes', hours: '12:00 PM - 09:00 PM' },
        { day: 'Martes', hours: '12:00 PM - 09:00 PM' },
        { day: 'Miércoles', hours: '12:00 PM - 09:00 PM' },
        { day: 'Jueves', hours: '12:00 PM - 09:00 PM' },
        { day: 'Viernes', hours: '12:00 PM - 09:00 PM' },
        { day: 'Sábado', hours: '12:00 PM - 09:00 PM' },
        { day: 'Domingo', hours: '12:00 PM - 09:00 PM' },
      ]
    },
    products: [
      { code: 'H001-004', category: 'LÍNEA ML', name: 'Papa Cono 12 Und Mínimo', desc: 'Arma tu combo seleccionando tus 12 sabores favoritos ($0.775 c/u).', price: 9.30, image: 'https://carjos-marketplace.cloud/uploads/uploads/files/images/cmh9iok9w002j1wl89hxlchgk.png', status: 'ACTIVE' },
      { code: 'H001-001', category: 'LÍNEA ML', name: 'Paleta Cítrica Rellena', desc: 'Paleta artesanal con centro cremoso', price: 2.5, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=60', status: 'ACTIVE' },
      { code: 'H001-002', category: 'HELADOS', name: 'Tinita de Helado Familiar', desc: 'Helado cremoso de litro con 2 sabores a elegir', price: 8.5, image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=500&auto=format&fit=crop&q=60', status: 'ACTIVE' },
      { code: 'H004-003', category: 'PRODUCTOS ADICIONALES', name: 'Super Conos', desc: 'Paquete de conos crujientes para servir helado', price: 3.25, image: 'https://images.unsplash.com/photo-1559703248-dcaaec9fab78?w=500&auto=format&fit=crop&q=60', status: 'ACTIVE' },
      { code: 'H004-002', category: 'PRODUCTOS ADICIONALES', name: 'Bolso Térmico', desc: 'Bolso aislante para transporte de helados y refrigerados', price: 13.65, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60', status: 'ACTIVE' },
      { code: 'H006-001', category: 'PROMOCIÓN', name: 'Ponche Crema Combo 6 Unidades', desc: 'Chicha y un Toque De Licor', price: 29.7, image: 'https://carjos-marketplace.cloud/uploads/uploads/files/images/cmigeb2yg00041uob81872xba.png', status: 'INACTIVE' }
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
      coords: { lat: 10.4081, lng: -71.4482 },
      image: '/images/logo-farma.png',
      badge: 'Regencia 24/7',
      schedule: 'Abierto 24 Horas',
      isOpen: true,
      weeklyHours: [
        { day: 'Lunes', hours: 'Atención Continua 24 Horas' },
        { day: 'Martes', hours: 'Atención Continua 24 Horas' },
        { day: 'Miércoles', hours: 'Atención Continua 24 Horas' },
        { day: 'Jueves', hours: 'Atención Continua 24 Horas' },
        { day: 'Viernes', hours: 'Atención Continua 24 Horas' },
        { day: 'Sábado', hours: 'Atención Continua 24 Horas' },
        { day: 'Domingo', hours: 'Atención Continua 24 Horas' },
      ]
    },
    products: [
      { code: 'FD001-001', category: 'Antialergico', name: 'Cetirizina 10 mg Cetral Siegfried Caja x 10 Tabletas', desc: 'Antihistamínico para alivio de síntomas alérgicos.', price: 21.0, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60', status: 'ACTIVE' },
      { code: 'FD001-002', category: 'Antialergico', name: 'Loratadina 10mg Loradex Caja x 10 Tabletas', desc: 'Alivio de alergias respiratorias.', price: 12.0, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60', status: 'ACTIVE' },
      { code: 'FD002-002', category: 'Antihipertensivos', name: 'Losartán Potásico 50 mg DAC Caja x 30 Tabletas', desc: 'Control cardiovascular y presión arterial.', price: 21.0, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60', status: 'ACTIVE' },
      { code: 'FD003-001', category: 'Analgesicos', name: 'Acetaminofen 650mg 10tabletas Genven', desc: 'Alivio rápido del dolor de cabeza y fiebre.', price: 1.0, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60', status: 'ACTIVE' }
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
      coords: { lat: 10.3854, lng: -71.4581 },
      image: '/images/logo-bitmar.png',
      badge: 'Oficial Autorizado',
      schedule: 'Abre a las 09:00 AM',
      isOpen: true,
      weeklyHours: [
        { day: 'Lunes', hours: '09:00 AM - 06:00 PM' },
        { day: 'Martes', hours: '09:00 AM - 06:00 PM' },
        { day: 'Miércoles', hours: '09:00 AM - 06:00 PM' },
        { day: 'Jueves', hours: '09:00 AM - 06:00 PM' },
        { day: 'Viernes', hours: '09:00 AM - 06:00 PM' },
        { day: 'Sábado', hours: '09:00 AM - 05:00 PM' },
        { day: 'Domingo', hours: 'Cerrado' },
      ]
    },
    products: [
      { code: 'BM001-001', category: 'TELEFONIA', name: 'HONOR X7D', desc: 'Batería de 6,500 mAh con carga de 35W, pantalla a 120 Hz, 256 GB.', price: 193.0, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUQcGSdgXj0eRybQEJ_Wd6hEKw5HYcwp9cKIZR2hmA5Q&s=10', status: 'ACTIVE' },
      { code: 'BM001-002', category: 'TELEFONIA', name: 'HONOR 600e 5G', desc: 'Pantalla AMOLED 120Hz, 512 GB, cámara 108 MP, batería 6,520 mAh.', price: 377.0, image: 'https://soytechno.com/wp-content/uploads/2026/07/Honor-600e-8GB256GB-LNA-NX3-Velvet-Grey-Gris-Terciopelo-1.jpg', status: 'ACTIVE' },
      { code: 'BM001-016', category: 'MONITORES', name: 'MONITOR LG 20MK40L 165Hz', desc: 'Tiempo de respuesta 1 ms, panel IPS Full HD.', price: 100.0, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRsWq31vUIsGg4Ldl5AdEZQHZhXKSCbeO34DeG4aCygxRGA5asmJvPNEk&s=10', status: 'ACTIVE' }
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

  // Selector de moneda: 'DUAL' | 'USD' | 'VES'
  const [currencyMode, setCurrencyMode] = useState<'DUAL' | 'USD' | 'VES'>('DUAL');

  // Modales y estados de compra
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string>('788');
  const [hasCompletedOrder, setHasCompletedOrder] = useState<boolean>(false);

  // Horarios y Ubicación GPS
  const [scheduleModalMerchant, setScheduleModalMerchant] = useState<typeof merchantsData['papa-helado']['info'] | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isFallbackModalOpen, setIsFallbackModalOpen] = useState<boolean>(false);

  // Referencias a contenedores de scroll
  const promoRailRef = useRef<HTMLDivElement>(null);
  const categoryRailRef = useRef<HTMLDivElement>(null);
  const [isPromoPaused, setIsPromoPaused] = useState<boolean>(false);

  // Formateador Bimonetario Inteligente
  const formatPriceBimonetary = (amountUSD: number): string => {
    const amountVES = amountUSD * TASA_BCV_ACTUAL;
    if (currencyMode === 'USD') return `$${amountUSD.toFixed(2)}`;
    if (currencyMode === 'VES') return `Bs. ${amountVES.toFixed(2)}`;
    return `$${amountUSD.toFixed(2)} (Bs. ${amountVES.toFixed(2)})`;
  };

  // Autoplay continuo de promociones (3.2s)
  useEffect(() => {
    if (isPromoPaused) return;

    const interval = setInterval(() => {
      if (!promoRailRef.current) return;
      const el = promoRailRef.current;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const step = 160;

      if (el.scrollLeft >= maxScroll - 15) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, 3200);

    return () => clearInterval(interval);
  }, [isPromoPaused]);

  // Controles manuales de Promociones con bucle
  const scrollPromos = (direction: 'left' | 'right') => {
    if (!promoRailRef.current) return;
    const el = promoRailRef.current;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const step = 220;

    if (direction === 'right') {
      if (el.scrollLeft >= maxScroll - 15) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    } else {
      if (el.scrollLeft <= 15) {
        el.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: -step, behavior: 'smooth' });
      }
    }
  };

  // Bucle infinito continuo para Categorías
  const scrollCategories = (direction: 'left' | 'right') => {
    if (!categoryRailRef.current) return;
    const el = categoryRailRef.current;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const step = 240;

    if (direction === 'right') {
      if (el.scrollLeft >= maxScroll - 15) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    } else {
      if (el.scrollLeft <= 15) {
        el.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: -step, behavior: 'smooth' });
      }
    }
  };

  // Función 1-Click GPS
  const handleTriggerGpsCalculation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLocating(true);

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const distToCabimas = getDistanceInKm(latitude, longitude, 10.3950, -71.4550);

          if (distToCabimas > 25) {
            setUserLocation({
              lat: 10.3950,
              lng: -71.4550,
              label: 'Cabimas Centro (GPS Local)',
            });
          } else {
            setUserLocation({
              lat: latitude,
              lng: longitude,
              label: 'Mi Ubicación Actual (GPS)',
            });
          }
          setIsLocating(false);
        },
        (error) => {
          console.warn('GPS denegado:', error.message);
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
            setOrderSummaryData(summary);
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
            console.log("Orden procesada con éxito:", orderData);
            setHasCompletedOrder(true);
            const idGenerado = orderData?.id || '788';
            setActiveOrderId(idGenerado);
            if (typeof window !== 'undefined') {
              localStorage.setItem('last_active_order_id', idGenerado);
            }
          }}
          onBackToCart={() => setIsCheckoutOpen(false)}
          onViewTracking={handleViewTrackingFromCheckout}
        />

        <OrderTrackingModal 
          isOpen={isTrackingOpen}
          onClose={() => setIsTrackingOpen(false)}
          orderId={activeOrderId}
        />
      </>
    );
  }

  // Filtrado de comercios
  const currentCategoryObj = categoriesList.find(c => c.id === selectedCategory);

  const filteredMerchants = merchantsList.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        m.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedCategory === 'ALL') {
      return matchSearch;
    }

    const catKeywords = currentCategoryObj ? currentCategoryObj.keywords : [];
    const matchCategory = catKeywords.some(keyword => 
      m.category.toLowerCase().includes(keyword) || m.name.toLowerCase().includes(keyword)
    );

    return matchCategory && matchSearch;
  });

  return (
    <div suppressHydrationWarning className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-[#fe6712] selection:text-white pb-16 md:pb-0">
      
      {/* Topbar Corporativo Bimonetario con Social Proof */}
      <div className="bg-[#090d16] text-white text-xs py-2 px-4 md:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          
          {/* Ubicación y Sectores */}
          <div className="flex items-center gap-2 font-bold" suppressHydrationWarning>
            <MapPin className="w-3.5 h-3.5 text-[#fe6712]" />
            <span>
              Entregar en:{' '}
              <strong className="underline decoration-[#fe6712] text-white">
                {userLocation ? userLocation.label : 'Cabimas, Estado Zulia'}
              </strong>
            </span>
            {userLocation && (
              <button 
                type="button"
                onClick={() => setIsFallbackModalOpen(true)}
                className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full text-orange-200 transition cursor-pointer ml-1"
              >
                Cambiar
              </button>
            )}
          </div>

          {/* Selector de Moneda y Tasa BCV */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            
            {/* Control Bimonetario */}
            <div className="flex items-center bg-white/10 p-0.5 rounded-full border border-white/15 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setCurrencyMode('DUAL')}
                className={`px-2 py-0.5 rounded-full transition cursor-pointer ${
                  currencyMode === 'DUAL' ? 'bg-[#fe6712] text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Dual ($/Bs)
              </button>
              <button
                type="button"
                onClick={() => setCurrencyMode('USD')}
                className={`px-2 py-0.5 rounded-full transition cursor-pointer ${
                  currencyMode === 'USD' ? 'bg-[#fe6712] text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                $ USD
              </button>
              <button
                type="button"
                onClick={() => setCurrencyMode('VES')}
                className={`px-2 py-0.5 rounded-full transition cursor-pointer ${
                  currencyMode === 'VES' ? 'bg-[#fe6712] text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Bs VES
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 text-slate-300 text-[11px]">
              <Coins className="w-3 h-3 text-amber-400" />
              <span>Tasa BCV: <strong className="text-white">Bs. {TASA_BCV_ACTUAL.toFixed(2)}</strong></span>
            </div>

            <div className="hidden lg:flex items-center gap-1 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 text-slate-300 text-[11px]">
              <span>💰 Wallet: <strong className="text-white">$124.50</strong></span>
            </div>

          </div>
        </div>
      </div>

      {/* Header Principal sin redundancia */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div 
              onClick={() => {
                setActiveMerchantId(null);
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="flex items-center cursor-pointer select-none py-0.5"
            >
              <img 
                src="/images/logo-duna.png" 
                alt="D'una Marketplace" 
                className="h-10 md:h-11 w-auto object-contain hover:scale-105 transition-transform duration-200"
              />
            </div>

            {/* Indicador de Flota en Móvil */}
            <div className="md:hidden flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>14 Repartidores en Calle</span>
            </div>
          </div>

          {/* Buscador Central Predictivo */}
          <div className="flex-1 max-w-xl w-full">
            <div className="relative flex items-center bg-slate-100 rounded-2xl border border-slate-200 focus-within:border-[#fe6712] focus-within:bg-white transition shadow-2xs">
              <span className="absolute left-4 text-slate-400">🔍</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca helados, medicinas, repuestos, combos..." 
                className="w-full bg-transparent text-xs font-semibold text-slate-800 pl-11 pr-8 py-2.5 focus:outline-none placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Social Proof y Rastreo Unificado en Escritorio */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-black text-emerald-800 bg-emerald-50/90 border border-emerald-200 px-3 py-2 rounded-2xl shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Flota D'una Activa • 14 en ruta</span>
            </div>

            <button 
              type="button"
              onClick={() => setIsTrackingOpen(true)}
              className="bg-orange-50 hover:bg-orange-100 text-[#fe6712] border border-orange-200 px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
            >
              <Clock className="w-4 h-4 text-[#fe6712]" />
              <span>Rastrear Pedido</span>
            </button>
          </div>

        </div>

        {/* Quick Search Chips (Antojos y Urgencias de Cabimas) */}
        <div className="px-4 md:px-8 py-1.5 bg-slate-50/70 border-t border-slate-100 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-[10px] font-bold text-slate-600 whitespace-nowrap">
            <span className="text-slate-400 font-medium">Búsquedas populares:</span>
            {quickSearchChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSearchQuery(chip.split(' ')[1] || chip)}
                className="bg-white hover:bg-orange-50 hover:text-[#fe6712] border border-slate-200 px-2 py-0.5 rounded-full transition cursor-pointer shadow-2xs"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-4 flex-1 space-y-6">
        
        {/* Showcase: Promociones Imperdibles (Autoplay con Pausa) */}
        <section className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-sm md:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#fe6712]" />
              Promociones Imperdibles
            </h2>

            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollPromos('left')}
                className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-orange-50 hover:border-orange-300 hover:text-[#fe6712] text-slate-600 flex items-center justify-center shadow-2xs transition cursor-pointer"
                title="Ver anteriores"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollPromos('right')}
                className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-orange-50 hover:border-orange-300 hover:text-[#fe6712] text-slate-600 flex items-center justify-center shadow-2xs transition cursor-pointer"
                title="Ver siguientes"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div
            ref={promoRailRef}
            onMouseEnter={() => setIsPromoPaused(true)}
            onMouseLeave={() => setIsPromoPaused(false)}
            onTouchStart={() => setIsPromoPaused(true)}
            onTouchEnd={() => setIsPromoPaused(false)}
            className="flex gap-3 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth no-scrollbar snap-x"
          >
            {promotionsList.map(promo => (
              <div
                key={promo.id}
                onClick={() => setActiveMerchantId(promo.merchantId)}
                className="w-28 sm:w-32 md:w-36 aspect-[2/3] flex-shrink-0 snap-start bg-white rounded-xl md:rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#fe6712]/50 transition-all duration-200 cursor-pointer group relative"
              >
                <img
                  src={promo.file}
                  alt={`Promoción ${promo.id}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 select-none"
                />
              </div>
            ))}
          </div>
        </section>

        {/* RIEL DE CATEGORÍAS (ÍCONOS VECTORIALES AMPLIADOS CON BUCLE INFINITO) */}
        <section className="space-y-2.5 pt-0.5">
          <div className="flex justify-between items-center">
            <h3 className="text-sm md:text-base font-black text-slate-900 tracking-tight">
              Categorías
            </h3>

            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollCategories('left')}
                className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-orange-50 hover:border-orange-300 hover:text-[#fe6712] text-slate-600 flex items-center justify-center shadow-2xs transition cursor-pointer"
                title="Girar categorías a la izquierda"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollCategories('right')}
                className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-orange-50 hover:border-orange-300 hover:text-[#fe6712] text-slate-600 flex items-center justify-center shadow-2xs transition cursor-pointer"
                title="Girar categorías a la derecha"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Riel Horizontal de Categorías */}
          <div
            ref={categoryRailRef}
            className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth no-scrollbar snap-x"
          >
            {categoriesList.map(cat => {
              const IconComponent = cat.icon;
              const isActive = selectedCategory === cat.id;

              return (
                <div
                  key={cat.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-shrink-0 snap-start flex flex-col items-center justify-center w-20 sm:w-22 py-2.5 px-1 rounded-2xl border transition-all duration-200 cursor-pointer group select-none ${
                    isActive
                      ? 'bg-white border-[#fe6712] ring-2 ring-[#fe6712]/20 shadow-md -translate-y-0.5'
                      : 'bg-white border-slate-200/90 hover:border-orange-300 hover:shadow-xs'
                  }`}
                >
                  <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-1.5 transition-colors p-1 ${
                    isActive 
                      ? 'bg-[#fe6712] text-white shadow-xs' 
                      : 'bg-orange-50/70 text-[#fe6712] group-hover:bg-orange-100/80'
                  }`}>
                    <IconComponent className="w-9 h-9 sm:w-10 sm:h-10" />
                  </div>

                  <span className={`text-[10px] sm:text-[11px] font-bold text-center leading-tight truncate w-full px-0.5 ${
                    isActive ? 'text-[#fe6712] font-black' : 'text-slate-700 group-hover:text-[#fe6712]'
                  }`}>
                    {cat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tiendas Recomendadas con Cálculo Bimonetario 1-Click GPS */}
        <section className="space-y-3.5 pt-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-black text-slate-900 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#fe6712]"></span>
                Tiendas Recomendadas ({filteredMerchants.length})
              </h3>
              {selectedCategory !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-0.5 rounded-md font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <span>Filtro: <strong>{currentCategoryObj?.label}</strong></span>
                  <span>✕</span>
                </button>
              )}
            </div>

            <span className="text-xs font-bold text-slate-400" suppressHydrationWarning>
              {userLocation ? `Cotizado para: ${userLocation.label}` : 'Cabimas, Zulia'}
            </span>
          </div>

          {filteredMerchants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredMerchants.map(merchant => {
                let distanceKm: number | null = null;
                let calculatedFeeText: string | null = null;

                if (userLocation) {
                  distanceKm = getDistanceInKm(
                    userLocation.lat,
                    userLocation.lng,
                    merchant.coords.lat,
                    merchant.coords.lng
                  );
                  if (merchant.isFreeDelivery) {
                    calculatedFeeText = '¡Gratis!';
                  } else {
                    const feeUSD = Math.max(1.00, Number((distanceKm * merchant.baseRatePerKm).toFixed(2)));
                    calculatedFeeText = formatPriceBimonetary(feeUSD);
                  }
                }

                return (
                  <div 
                    key={merchant.id}
                    onClick={() => setActiveMerchantId(merchant.id)}
                    className="bg-white rounded-2xl border border-slate-200/80 hover:border-[#fe6712]/50 p-3 flex items-center gap-3.5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group select-none relative"
                  >
                    {/* Cuadro de Marca con Relleno Total */}
                    <div className="w-20 h-20 sm:w-22 sm:h-22 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-200/80 shadow-xs relative">
                      <img 
                        src={merchant.image} 
                        alt={merchant.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>

                    {/* Información a 3 Niveles */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                      <div className="flex items-start justify-between gap-1.5">
                        <h4 className="text-sm font-black text-slate-900 group-hover:text-[#fe6712] transition-colors truncate">
                          {merchant.name}
                        </h4>
                        <span className="flex-shrink-0 flex items-center gap-0.5 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md text-[11px] font-black border border-amber-200/60">
                          ⭐ {merchant.rating}
                        </span>
                      </div>

                      <p className="text-[11px] font-bold text-slate-400 truncate">
                        {merchant.category}
                      </p>

                      {/* Línea Operativa con Botones Interactivos y Tarifa Bimonetaria */}
                      <div className="flex items-center gap-1.5 pt-0.5 text-[10px] font-bold overflow-hidden">
                        <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 rounded-md shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Abierto</span>
                        </span>

                        {/* Botón de Horarios */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setScheduleModalMerchant(merchant);
                          }}
                          className="flex items-center gap-1 text-slate-600 bg-slate-100 hover:bg-orange-50 hover:text-[#fe6712] px-1.5 py-0.5 rounded-md shrink-0 transition cursor-pointer"
                          title="Ver horarios de atención"
                        >
                          <Clock className="w-3 h-3 text-[#fe6712]" />
                          <span>Horarios</span>
                        </button>

                        {/* Botón 1-Click GPS o Resultado Bimonetario */}
                        {userLocation && calculatedFeeText ? (
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsFallbackModalOpen(true);
                            }}
                            className="px-1.5 py-0.5 rounded-md truncate bg-orange-50 text-[#fe6712] border border-orange-200/80 font-black cursor-pointer hover:bg-orange-100 transition"
                            title="Clic para cambiar de sector"
                          >
                            🛵 {calculatedFeeText} ({distanceKm} km)
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleTriggerGpsCalculation}
                            disabled={isLocating}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 hover:bg-orange-100 text-[#fe6712] border border-orange-200 font-black transition cursor-pointer truncate shadow-2xs hover:scale-102"
                            title="Calcular costo de flete desde la tienda hasta tu ubicación"
                          >
                            {isLocating ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-[#fe6712]" />
                                <span>Calculando...</span>
                              </>
                            ) : (
                              <>
                                <span>🛵</span>
                                <span>Calcular envío</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center max-w-lg mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#fe6712] mx-auto flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-slate-900">
                Próximamente más aliados en {currentCategoryObj?.label}
              </h4>
              <p className="text-xs text-slate-500">
                Estamos gestionando la incorporación de los comercios más destacados de este rubro en Cabimas.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className="px-4 py-2 bg-[#fe6712] text-white text-xs font-black rounded-xl hover:bg-orange-600 transition cursor-pointer shadow-xs"
              >
                Ver todos los comercios disponibles
              </button>
            </div>
          )}
        </section>

      </main>

      {/* DOCK INFERIOR FLOTANTE MÓVIL (MÁXIMA ERGONOMÍA EN CELULARES) */}
      <nav className="md:hidden fixed bottom-3 inset-x-4 z-40 bg-[#090d16]/90 backdrop-blur-lg border border-white/10 rounded-2xl py-2 px-3 shadow-2xl flex items-center justify-around text-white">
        <button
          type="button"
          onClick={() => {
            setActiveMerchantId(null);
            setSelectedCategory('ALL');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-orange-200 hover:text-white transition"
        >
          <Home className="w-4 h-4 text-[#fe6712]" />
          <span>Inicio</span>
        </button>

        <button
          type="button"
          onClick={() => setIsFallbackModalOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-300 hover:text-white transition"
        >
          <Compass className="w-4 h-4 text-slate-300" />
          <span>Sectores</span>
        </button>

        <button
          type="button"
          onClick={handleTriggerGpsCalculation}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-300 hover:text-white transition"
        >
          <Navigation className="w-4 h-4 text-[#fe6712]" />
          <span>GPS Flete</span>
        </button>

        <button
          type="button"
          onClick={() => setIsTrackingOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-300 hover:text-white transition relative"
        >
          <ShoppingBag className="w-4 h-4 text-slate-300" />
          <span>Órdenes</span>
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#fe6712] animate-pulse"></span>
        </button>
      </nav>

      {/* Modal de Horarios de Atención Semanal */}
      {scheduleModalMerchant && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setScheduleModalMerchant(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 border border-slate-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#fe6712]" />
                <h3 className="font-black text-slate-900 text-base">Horarios de Atención</h3>
              </div>
              <button 
                type="button"
                onClick={() => setScheduleModalMerchant(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              <div className="h-20 w-28 overflow-hidden rounded-2xl border border-slate-200 shadow-xs bg-slate-50">
                <img 
                  src={scheduleModalMerchant.image} 
                  alt={scheduleModalMerchant.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h4 className="font-black text-slate-900 text-sm mt-2">{scheduleModalMerchant.name}</h4>
              <span className="text-[11px] text-[#fe6712] font-bold">{scheduleModalMerchant.category}</span>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              {scheduleModalMerchant.weeklyHours.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-700 font-semibold border-b border-slate-200/50 pb-1.5 last:border-b-0 last:pb-0">
                  <span className="font-bold text-slate-900">{item.day}</span>
                  <span className="text-slate-600">{item.hours}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setScheduleModalMerchant(null)}
              className="w-full py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white font-black text-xs rounded-xl transition cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Modal de Respaldo de Sectores en Cabimas */}
      {isFallbackModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsFallbackModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#fe6712]" />
                <div>
                  <h3 className="font-black text-slate-900 text-base">Selecciona tu Sector en Cabimas</h3>
                  <p className="text-[11px] text-slate-500">Calcularemos el delivery desde cada tienda a tu ubicación</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsFallbackModalOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {cabimasSectores.map(sector => (
                <div
                  key={sector.id}
                  onClick={() => {
                    setUserLocation({
                      lat: sector.coords.lat,
                      lng: sector.coords.lng,
                      label: sector.name,
                    });
                    setIsFallbackModalOpen(false);
                  }}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-[#fe6712]/40 text-slate-700 hover:text-[#fe6712] text-xs font-bold flex justify-between items-center cursor-pointer transition"
                >
                  <span>📍 {sector.name}</span>
                  <span className="text-[11px] font-black text-slate-400">Elegir →</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Seguimiento Global */}
      <OrderTrackingModal 
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        orderId={activeOrderId}
      />

    </div>
  );
}