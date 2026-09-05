// src/types/store.ts

export interface Product {
  code: string;
  category: string;
  name: string;
  desc: string;
  price: number;
  image: string;
  status: 'ACTIVE' | 'INACTIVE';
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
}

export interface CheckoutSummary {
  metodoEntrega: 'delivery' | 'pickup';
  direccion: string;
  costoEnvio: number;
  totalUSD: number;
}