// Carrito persistido en localStorage['cart_data'], SIEMPRE asociado a la tienda que lo creó: { storeId, items }.
// Un carrito solo es válido para su tienda: cualquier otro contenido (formato viejo = arreglo suelto, JSON roto, tienda
// distinta) se ignora o se purga, para que ítems de un comercio nunca viajen en el pedido de otro (auditoría C1).
export const CART_STORAGE_KEY = 'cart_data';

type StoredCart = { storeId: string; items: any[] };

const normId = (storeId: string | number | null | undefined): string => (storeId === null || storeId === undefined ? '' : String(storeId).trim());

function readStored(): StoredCart | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed && typeof parsed === 'object' && !Array.isArray(parsed) &&
      typeof parsed.storeId === 'string' && parsed.storeId.trim() && Array.isArray(parsed.items)
    ) {
      return { storeId: parsed.storeId.trim(), items: parsed.items.filter((it: unknown) => it && typeof it === 'object') };
    }
  } catch {
    /* JSON roto: se trata como inválido */
  }
  return null; // formato viejo (arreglo suelto sin tienda) o inválido
}

// Ítems del carrito guardado, SOLO si pertenece exactamente a `storeId`; en cualquier otro caso, vacío.
export function readCart(storeId: string | number | null | undefined): any[] {
  const id = normId(storeId);
  if (!id) return [];
  const stored = readStored();
  return stored && stored.storeId === id ? stored.items : [];
}

// Guarda el carrito de `storeId` (sin tienda no se persiste nada). Un carrito vacío elimina la clave.
export function writeCart(storeId: string | number | null | undefined, items: any[]): void {
  if (typeof window === 'undefined') return;
  const id = normId(storeId);
  try {
    if (!id || !Array.isArray(items) || items.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ storeId: id, items }));
  } catch {
    /* sin localStorage */
  }
}

export function clearCart(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    /* sin localStorage */
  }
}

// Al entrar a una tienda: se purga cualquier carrito guardado que NO sea de esa tienda (incluye el formato viejo sin tienda).
// Devuelve true si se purgó algo.
export function purgeCartIfOtherStore(storeId: string | number | null | undefined): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (localStorage.getItem(CART_STORAGE_KEY) === null) return false;
    const stored = readStored();
    if (stored && stored.storeId === normId(storeId)) return false;
    localStorage.removeItem(CART_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
