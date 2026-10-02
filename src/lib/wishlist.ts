// Lista de favoritos del cliente: funciones puras de almacenamiento (sin React ni red), por usuario (uid).
//
// Dónde vive: SOLO en este dispositivo (localStorage), igual que el teléfono y las direcciones de la cuenta (ver customerProfile.ts).
// El backend de AdonisJS no expone favoritos por cliente (verificado en DEV el 2026-10-01: /favorites, /wishlist,
// /customer/{tel}/favorites… responden E_ROUTE_NOT_FOUND) y Firestore no se usa a propósito (sus reglas de seguridad no están
// versionadas en el repo). Cuando exista un endpoint, se reemplaza este archivo y el contexto y los corazones no cambian.
//
// Qué se guarda: la identidad REAL del producto y de su tienda (id, código, nombre, foto). El precio y el stock NO se guardan:
// cambian, así que el panel de favoritos los consulta en vivo (GET /product/{id}/web).
// Todo va en try/catch: sin localStorage (modo privado, cuota llena) nada se rompe y el llamador se entera (`outcome: 'failed'`).

const WISHLIST_KEY = (uid: string) => `duna_wishlist_v1_${uid}`;
export const MAX_WISHLIST_ITEMS = 100;

export interface WishlistItem {
  /** Id real del producto (el que acepta `GET /product/{id}/web` y la ruta `/store/{code}/product/{id}`). */
  productId: string;
  productCode: string;
  name: string;
  image: string;
  storeId: string;
  storeCode: string;
  storeName: string;
  addedAt: number;
}

const text = (v: unknown): string => (typeof v === 'string' || typeof v === 'number' ? String(v).trim() : '');

const isWishlistItem = (v: unknown): v is WishlistItem => {
  if (!v || typeof v !== 'object') return false;
  const i = v as Record<string, unknown>;
  return (
    typeof i.productId === 'string' && /^\d+$/.test(i.productId) &&
    typeof i.name === 'string' && i.name !== '' &&
    typeof i.storeCode === 'string' && i.storeCode !== '' &&
    typeof i.storeId === 'string' && typeof i.storeName === 'string' &&
    typeof i.productCode === 'string' && typeof i.image === 'string' &&
    typeof i.addedAt === 'number'
  );
};

/** Clave de un producto en la lista: su id numérico real, como texto. '' si el producto no tiene un id válido. */
export function wishlistKey(productId: unknown): string {
  const id = text(productId);
  return /^\d+$/.test(id) && Number(id) > 0 ? String(Number(id)) : '';
}

/**
 * Arma el favorito a partir del producto y la tienda REALES (fila del listado o detalle del backend). Devuelve `null` si falta
 * algún dato de identidad (id numérico, nombre, código de la tienda): sin eso no hay nada verdadero que guardar ni a dónde volver.
 */
export function toWishlistItem(product: unknown, store: unknown, now: number = Date.now()): WishlistItem | null {
  const p = (product && typeof product === 'object' ? product : {}) as Record<string, unknown>;
  const s = (store && typeof store === 'object' ? store : {}) as Record<string, unknown>;
  const productId = wishlistKey(p.id);
  const name = text(p.name).replace(/\s+/g, ' ');
  const storeCode = text(s.code) || text(p.storeCode);
  if (!productId || !name || !storeCode) return null;
  return {
    productId,
    productCode: text(p.code),
    name: name.slice(0, 160),
    image: text(p.image) || text(p.img),
    storeId: text(s.id) || text(p.storeId),
    storeCode,
    storeName: (text(s.name) || text(p.storeName)).slice(0, 120),
    addedAt: now,
  };
}

export function getWishlist(uid: string): WishlistItem[] {
  if (!uid) return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY(uid));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    // Un mismo producto nunca aparece dos veces, aunque el almacenamiento haya sido editado a mano
    const seen = new Set<string>();
    return parsed.filter(isWishlistItem).filter((i) => (seen.has(i.productId) ? false : (seen.add(i.productId), true)));
  } catch {
    return [];
  }
}

const writeWishlist = (uid: string, list: WishlistItem[]): boolean => {
  try {
    localStorage.setItem(WISHLIST_KEY(uid), JSON.stringify(list));
    return true;
  } catch {
    return false; // sin almacenamiento (modo privado, cuota): el llamador avisa que no se guardó
  }
};

export function isInWishlist(list: WishlistItem[], productId: unknown): boolean {
  const key = wishlistKey(productId);
  return key !== '' && list.some((i) => i.productId === key);
}

export type WishlistAddOutcome = 'added' | 'exists' | 'full' | 'failed';

/** Agrega un favorito (el más reciente arriba). No duplica, no pasa de `MAX_WISHLIST_ITEMS` y no finge haber guardado si no pudo. */
export function addToWishlist(uid: string, item: WishlistItem): { items: WishlistItem[]; outcome: WishlistAddOutcome } {
  const current = getWishlist(uid);
  if (!uid || !isWishlistItem(item)) return { items: current, outcome: 'failed' };
  if (current.some((i) => i.productId === item.productId)) return { items: current, outcome: 'exists' };
  if (current.length >= MAX_WISHLIST_ITEMS) return { items: current, outcome: 'full' };
  const next = [item, ...current];
  return writeWishlist(uid, next) ? { items: next, outcome: 'added' } : { items: current, outcome: 'failed' };
}

/** Quita un favorito. `removed` es false si no estaba o si no se pudo guardar el cambio. */
export function removeFromWishlist(uid: string, productId: unknown): { items: WishlistItem[]; removed: boolean } {
  const current = getWishlist(uid);
  const key = wishlistKey(productId);
  if (!uid || !key || !current.some((i) => i.productId === key)) return { items: current, removed: false };
  const next = current.filter((i) => i.productId !== key);
  return writeWishlist(uid, next) ? { items: next, removed: true } : { items: current, removed: false };
}

/** Clave de localStorage de la lista de un usuario (para escuchar cambios hechos en otra pestaña). */
export const wishlistStorageKey = WISHLIST_KEY;
