// "Mis Últimas Compras": registro de los pedidos de la cuenta. Funciones puras de almacenamiento (sin React ni red), por usuario (uid).
//
// De dónde sale cada dato (regla de oro 3, datos reales):
//   · El pedido solo se registra cuando el backend lo CONFIRMA (`POST /delivery/request/purchase/web` → `code: 1` con `data.id` real):
//     el `orderId` es ese id y las líneas son exactamente las que se enviaron.
//   · El estado, el número de orden y la fecha oficial se leen EN VIVO de `GET /delivery/request/{id}/public` al abrir el panel.
//
// Por qué el índice de pedidos vive en este dispositivo: AdonisJS no tiene un endpoint de pedidos por cliente (verificado en DEV el
// 2026-10-01 con 44 rutas: `E_ROUTE_NOT_FOUND`, o rutas del panel que exigen token) y el seguimiento público de un pedido NO devuelve
// sus ítems. Sin eso no hay forma de pedirle a la API "los pedidos de este cliente" ni de saber qué llevaba cada uno. Consecuencia
// honesta: aquí aparecen los pedidos hechos con la sesión iniciada en ESTE dispositivo. Cuando exista el endpoint se reemplaza este
// archivo y el panel no cambia.

import { friendlyStatus, getTrackingState } from './orderTracking';

const HISTORY_KEY = (uid: string) => `duna_purchase_history_v1_${uid}`;
export const MAX_PURCHASE_RECORDS = 20;

/** Línea de un pedido: los campos del ítem del carrito que hacen falta para mostrarlo y para volver a pedirlo. */
export interface PurchaseLine {
  id: number;
  code: string;
  name: string;
  image: string;
  category: string;
  qty: number;
  /** Precio unitario cobrado en ese pedido (USD). */
  price: number;
  totalPrice: number;
  variants: unknown[];
  pricing: { unitBasePrice: number; addonsTotal: number; unitFinalPrice: number } | null;
  breakdown: string[];
  notes?: string;
}

export interface PurchaseRecord {
  /** Id real del pedido devuelto por el backend (el mismo de `/order/{id}/timeline`). */
  orderId: string;
  storeId: string;
  storeCode: string;
  storeName: string;
  /** Momento de la confirmación en este dispositivo (ms). La fecha oficial es `created_at` del seguimiento público. */
  createdAt: number;
  totalUSD: number;
  items: PurchaseLine[];
}

const text = (v: unknown): string => (typeof v === 'string' || typeof v === 'number' ? String(v).trim() : '');
const finite = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Copia compacta de un ítem del carrito. `null` si no trae la identidad real del producto (id y código) o un precio válido. */
export function toPurchaseLine(item: unknown): PurchaseLine | null {
  if (!item || typeof item !== 'object') return null;
  const it = item as Record<string, unknown>;
  const id = Number(it.id);
  const code = text(it.code);
  const qty = Math.floor(finite(it.qty ?? it.quantity ?? it.cant ?? 1)) || 1;
  const totalPrice = finite(it.totalPrice);
  const price = finite(it.price) || (qty > 0 ? totalPrice / qty : 0);
  if (!Number.isFinite(id) || id <= 0 || !code || qty <= 0 || !(price > 0)) return null;
  const pricing = it.pricing && typeof it.pricing === 'object' ? (it.pricing as Record<string, unknown>) : null;
  const notes = text(it.notes);
  return {
    id,
    code,
    name: text(it.name) || 'Producto',
    image: text(it.image) || text(it.img),
    category: text(it.category),
    qty,
    price,
    totalPrice: totalPrice > 0 ? totalPrice : price * qty,
    variants: Array.isArray(it.variants) ? it.variants : [],
    pricing: pricing
      ? { unitBasePrice: finite(pricing.unitBasePrice), addonsTotal: finite(pricing.addonsTotal), unitFinalPrice: finite(pricing.unitFinalPrice) }
      : null,
    breakdown: Array.isArray(it.breakdown) ? it.breakdown.filter((l): l is string => typeof l === 'string') : [],
    ...(notes ? { notes } : {}),
  };
}

const isPurchaseLine = (v: unknown): v is PurchaseLine => {
  if (!v || typeof v !== 'object') return false;
  const l = v as Record<string, unknown>;
  return (
    Number.isFinite(l.id) && typeof l.code === 'string' && l.code !== '' && typeof l.name === 'string' &&
    Number.isFinite(l.qty) && Number(l.qty) > 0 && Number.isFinite(l.price) && Number.isFinite(l.totalPrice) &&
    Array.isArray(l.variants) && Array.isArray(l.breakdown)
  );
};

const isPurchaseRecord = (v: unknown): v is PurchaseRecord => {
  if (!v || typeof v !== 'object') return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.orderId === 'string' && r.orderId !== '' && typeof r.storeId === 'string' && r.storeId !== '' &&
    typeof r.storeCode === 'string' && typeof r.storeName === 'string' &&
    typeof r.createdAt === 'number' && Number.isFinite(r.totalUSD) &&
    Array.isArray(r.items) && r.items.length > 0 && r.items.every(isPurchaseLine)
  );
};

/**
 * Arma el registro de un pedido recién confirmado. `null` si falta el id real del pedido, la tienda o no queda ninguna línea válida:
 * un registro a medias no se guarda.
 */
export function buildPurchaseRecord(
  order: { id?: unknown; items?: unknown; totalUSD?: unknown },
  store: { id?: unknown; code?: unknown; name?: unknown },
  now: number = Date.now()
): PurchaseRecord | null {
  const orderId = text(order?.id);
  const storeId = text(store?.id);
  const items = (Array.isArray(order?.items) ? order.items : []).map(toPurchaseLine).filter((l): l is PurchaseLine => l !== null);
  if (!orderId || orderId === '0' || !storeId || items.length === 0) return null;
  const itemsTotal = items.reduce((sum, l) => sum + l.totalPrice, 0);
  return {
    orderId,
    storeId,
    storeCode: text(store?.code),
    storeName: text(store?.name) || 'Comercio',
    createdAt: now,
    totalUSD: finite(order?.totalUSD) > 0 ? finite(order?.totalUSD) : itemsTotal,
    items,
  };
}

export function getPurchaseHistory(uid: string): PurchaseRecord[] {
  if (!uid) return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY(uid));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed
      .filter(isPurchaseRecord)
      .filter((r) => (seen.has(r.orderId) ? false : (seen.add(r.orderId), true)))
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

/**
 * Guarda un pedido en el historial de la cuenta (el más reciente arriba, sin duplicar el mismo `orderId`, máximo
 * `MAX_PURCHASE_RECORDS`). Si el almacenamiento está lleno se reintenta conservando menos pedidos antiguos; si aun así no se puede,
 * el historial queda como estaba (devuelve false) y la compra, que ya está confirmada, no se ve afectada.
 */
export function recordPurchase(uid: string, record: PurchaseRecord | null): boolean {
  if (!uid || !record || !isPurchaseRecord(record)) return false;
  const rest = getPurchaseHistory(uid).filter((r) => r.orderId !== record.orderId);
  for (const keep of [MAX_PURCHASE_RECORDS, 10, 5, 1]) {
    try {
      localStorage.setItem(HISTORY_KEY(uid), JSON.stringify([record, ...rest].slice(0, keep)));
      return true;
    } catch {
      /* cuota llena: se reintenta con menos pedidos antiguos */
    }
  }
  return false;
}

// ── Estado real del pedido (GET /delivery/request/{id}/public) ───────────────────────────────────────────────────────

export type PurchaseStatusKind = 'delivered' | 'cancelled' | 'active';

/** Traduce `data` del seguimiento público a lo que muestra el panel: entregado, cancelado o en curso (con su paso actual). */
export function purchaseStatusOf(remote: unknown): { kind: PurchaseStatusKind; label: string } {
  const state = getTrackingState(remote);
  const status = String((remote as { status?: unknown } | null)?.status ?? '').trim().toUpperCase();
  if (state.phase === 'delivered') return { kind: 'delivered', label: 'Entregado' };
  if (status === 'CANCELLED') return { kind: 'cancelled', label: 'Cancelado' };
  if (status === 'REJECTED') return { kind: 'cancelled', label: 'Rechazado' };
  return { kind: 'active', label: friendlyStatus(state.currentRaw) || 'En curso' };
}

/** Clave de localStorage del historial de un usuario (para pruebas y para escuchar cambios de otra pestaña). */
export const purchaseHistoryStorageKey = HISTORY_KEY;
