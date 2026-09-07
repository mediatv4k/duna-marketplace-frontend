// src/types/store.ts

export interface Product {
  code: string;
  category: string;
  name: string;
  desc: string;
  price: number;
  image: string;
  status: 'ACTIVE' | 'INACTIVE';
  // --- INYECCIÓN LOGÍSTICA (FASE 1 y 2): Metadatos de Cubicaje (Opcionales) ---
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}

export interface CartItem extends Product {
  qty: number;
}

export interface Merchant {
  id: string;
  name: string;
  category: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  image: string;
  badge: string;
  // --- INYECCIÓN LOGÍSTICA (FASE 2): Metadatos de Envío Nacional (Opcionales) ---
  isNationalShippingEnabled?: boolean;
  preferredNationalCouriers?: ('MRW' | 'ZOOM' | 'TEALCA' | 'LIBERTY')[];
}

export interface CheckoutSummary {
  metodoEntrega: 'delivery' | 'pickup';
  direccion: string;
  costoEnvio: number; // Este pasa a ser exclusivamente el flete local (D'una Fleet)
  totalUSD: number;
  // --- INYECCIÓN LOGÍSTICA (FASE 3): Metadatos de Checkout Híbrido (Opcionales) ---
  esEnvioNacional?: boolean;
  agenciaNacional?: 'MRW' | 'ZOOM' | 'TEALCA' | 'LIBERTY';
  modalidadNacional?: 'PREPAID' | 'COD'; // Prepagado o Cobro a Destino
  costoEnvioNacional?: number; // Costo del tramo interurbano
}