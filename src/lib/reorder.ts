// "Volver a pedir": de las líneas de un pedido ANTERIOR a líneas válidas del carrito de HOY. Funciones puras (sin React); la única
// salida a la red es la función `fetchProduct` que recibe `prepareReorder` (así se prueba sin backend).
//
// Por qué no se copian las líneas viejas tal cual: el backend recalcula cada ítem con SU catálogo y responde `code: 21` si los montos no
// cuadran (DOCUMENTO_TECNICO_OSWALDO.md §7.5 y §10), o `code: 15` si un producto ya no está. Un precio de hace semanas, un sabor
// agotado o un producto retirado dejarían al cliente con un carrito que nunca pasa. Por eso cada línea se RECONSTRUYE contra el
// detalle actual del producto (`GET /product/{id}/web`):
//   · sigue igual                       → entra al carrito;
//   · cambió de precio                  → entra con el precio de HOY y se le avisa al cliente antes de agregarla;
//   · agotado / retirado / sin la opción → no entra, y se le dice por qué;
//   · no se puede reconstruir con certeza (combo personalizado por unidad, pedido entre panas, opciones obligatorias nuevas)
//                                        → no entra: se arma de nuevo desde su ficha, donde están todas sus opciones.
// Nunca se inventa un precio ni se adivina una opción.
//
// La reconstrucción replica, operación por operación, lo que arma `MasterProductModal.handleAddToCart` para una compra normal
// (más la normalización de `MerchantStoreView.handleProductClick`): la línea resultante es idéntica a la que se obtiene agregando
// hoy ese producto a mano con las mismas opciones, incluida su identidad en el carrito (`código::variantes[::nota]`), así que se
// fusiona con una línea igual que ya estuviera en la bolsa.

import { isProductSoldOut } from './productStock';
import { isOptionAvailable } from './sizeAdvisor';

export type ReorderSkipReason =
  | 'gone' // el producto ya no existe en el catálogo (o dejó de ser el mismo)
  | 'soldOut' // agotado
  | 'optionUnavailable' // una opción elegida (talla, sabor, adicional) ya no está, cambió o está agotada
  | 'needsConfiguration' // hay que armarlo de nuevo desde su ficha
  | 'unverified'; // no se pudo consultar el catálogo (red)

export interface ReorderLineOutcome {
  /** Línea original del pedido anterior. */
  original: any;
  name: string;
  qty: number;
  status: 'ready' | 'skipped';
  /** Línea lista para el carrito, con los precios de hoy (solo si `status === 'ready'`). */
  line?: any;
  /** Precio unitario cobrado antes y ahora, solo si cambió. */
  priceChanged?: { before: number; after: number };
  reason?: ReorderSkipReason;
  /** Dato para el mensaje: la opción que falta, o por qué hay que armarlo de nuevo. */
  detail?: string;
}

export interface ReorderPlan {
  outcomes: ReorderLineOutcome[];
  /** Líneas listas para el carrito (precios de hoy). */
  lines: any[];
  skipped: ReorderLineOutcome[];
  priceChanged: ReorderLineOutcome[];
  /** Subtotal de las líneas listas (USD). */
  totalNow: number;
  /** Alguna consulta al catálogo falló por red: conviene reintentar antes de dar un producto por perdido. */
  networkError: boolean;
}

export type ProductLookup = { kind: 'ok'; raw: any } | { kind: 'gone' } | { kind: 'error' };
export type ProductFetcher = (productId: number) => Promise<ProductLookup>;

// ── Utilidades ───────────────────────────────────────────────────────────────────────────────────────────────────────

const finite = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
// Comparación de textos del catálogo: sin distinguir mayúsculas ni espacios repetidos ("TALLA  L" = "Talla L")
const norm = (v: unknown): string => String(v ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
const key = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

export function lineQty(line: any): number {
  return Math.max(1, Math.floor(finite(line?.qty ?? line?.quantity ?? line?.cant ?? 1)) || 1);
}

/** Identidad de una línea en el carrito: la misma que arma `MerchantStoreView.handleAddToCartFromModal`. */
export function cartItemIdOf(code: unknown, variants: unknown, notes: unknown): string {
  return `${code}::${JSON.stringify(variants || [])}${notes ? `::${notes}` : ''}`;
}

/**
 * ¿La línea tiene la estructura de una compra normal (opciones + precios estructurados)? Quedan fuera, porque su detalle solo existe
 * como texto y no se puede recalcular con certeza: los combos personalizados unidad por unidad (sin `pricing`) y los pedidos
 * entre panas. Devuelve el motivo para el mensaje, o `null` si la línea es reconstruible.
 */
export function customLineKind(line: any): 'room' | 'slots' | null {
  const first = String(Array.isArray(line?.breakdown) ? line.breakdown[0] ?? '' : '');
  if (first.includes('PEDIDO ENTRE PANAS')) return 'room';
  const p = line?.pricing;
  const structured = p && typeof p === 'object' && Number.isFinite(Number(p.unitBasePrice)) && Number.isFinite(Number(p.unitFinalPrice));
  return structured && Array.isArray(line?.variants) ? null : 'slots';
}

// ── Catálogo actual del producto ─────────────────────────────────────────────────────────────────────────────────────

interface CurrentOption {
  code: unknown; // tal cual lo envía el backend: es el que viaja en el pedido
  title: unknown; // ídem
  price: number;
  affects: unknown;
  available: boolean;
}

interface CurrentGroup {
  name: string;
  code: unknown;
  selectType: string;
  pricingRole: string;
  isCheckin: boolean;
  min: number;
  max: number;
  options: CurrentOption[];
}

const optionList = (g: any): any[] => {
  const list = g?.items || g?.options || g?.values || g?.variants || g?.choices || [];
  return Array.isArray(list) ? list : [];
};

/**
 * Grupos de opciones del detalle crudo, normalizados como lo hacen `handleProductClick` y el modal. `null` si la estructura no es
 * una lista de grupos (p. ej. una lista plana de sabores, cuyos códigos el modal genera por posición): no es reconstruible.
 */
function readGroups(raw: any): CurrentGroup[] | null {
  if (raw?.metadata != null && typeof raw.metadata !== 'object') return null;
  const rawVariants =
    raw?.metadata?.variants || raw?.variants || raw?.groups || raw?.metadata?.groups ||
    raw?.sabores || raw?.metadata?.sabores || raw?.pack_items || raw?.metadata?.pack_items ||
    raw?.options || raw?.metadata?.options || raw?.customizations || raw?.metadata?.customizations || [];
  if (!Array.isArray(rawVariants)) return null;
  if (rawVariants.length === 0) return [];
  const isGroupList = rawVariants.some((g: any) =>
    g && typeof g === 'object' && (Array.isArray(g.items) || Array.isArray(g.options) || Array.isArray(g.values) || Array.isArray(g.variants) || Array.isArray(g.choices))
  );
  if (!isGroupList) return null;

  return rawVariants.map((g: any) => {
    const isCheckin = g?.selectType === 'CHECKIN' || Boolean(g?.checkbox);
    const isMultiple = g?.selectType === 'MULTIPLE' || isCheckin || Number(g?.max || g?.maxItems || 0) > 1;
    const selectType: string = isCheckin ? 'CHECKIN' : isMultiple ? 'MULTIPLE' : g?.selectType || 'SINGLE';
    const pricingRole: string = g?.pricingRole || 'ADDON';
    // Las opciones INACTIVE van al final (orden estable), igual que en la ficha: define el orden de `items` y de las sumas
    const sorted = [...optionList(g)].sort((a: any, b: any) => {
      const aIn = a?.status === 'INACTIVE';
      const bIn = b?.status === 'INACTIVE';
      return aIn === bIn ? 0 : aIn ? 1 : -1;
    });
    return {
      name: g?.name || g?.title || g?.label || 'Opciones',
      code: g?.code,
      selectType,
      pricingRole,
      isCheckin,
      min: Number(g?.minItems ?? g?.min ?? (g?.required ? 1 : selectType === 'SINGLE' && pricingRole === 'BASE' ? 1 : 0)) || 0,
      max: Number(g?.maxItems || g?.max || 0) || 0,
      options: sorted
        .filter((item: any) => item && typeof item === 'object')
        .map((item: any) => ({
          code: item.code || item.id || item.value,
          title: item.title || item.name || item.label,
          price: Number(item.price || item.unitPrice || 0),
          affects: item.affects,
          available: isOptionAvailable(item),
        })),
    };
  });
}

// ── Reconstrucción de una línea ──────────────────────────────────────────────────────────────────────────────────────

const skip = (original: any, reason: ReorderSkipReason, detail?: string): ReorderLineOutcome => ({
  original,
  name: String(original?.name || 'Producto'),
  qty: lineQty(original),
  status: 'skipped',
  reason,
  ...(detail ? { detail } : {}),
});

/**
 * Reconstruye UNA línea contra el detalle actual de su producto (`raw` = `data` de `GET /product/{id}/web`).
 * `expectedStoreCode`: código de la tienda del pedido; si el producto ahora pertenece a otra tienda no se agrega.
 */
export function rebuildReorderLine(original: any, raw: any, expectedStoreCode?: string): ReorderLineOutcome {
  const custom = customLineKind(original);
  if (custom) return skip(original, 'needsConfiguration', custom);
  if (!raw || typeof raw !== 'object') return skip(original, 'gone');

  // Mismo producto: mismo id y mismo código (son la identidad que valida el backend)
  const id = Number(raw.id);
  if (!Number.isFinite(id) || id <= 0 || id !== Number(original?.id) || !key(raw.code) || key(raw.code) !== key(original?.code)) return skip(original, 'gone');
  if (expectedStoreCode && raw.storeCode && norm(raw.storeCode) !== norm(expectedStoreCode)) return skip(original, 'gone');
  if (isProductSoldOut(raw)) return skip(original, 'soldOut');

  const groups = readGroups(raw);
  if (!groups) return skip(original, 'needsConfiguration', 'options');

  // 1) Qué eligió el cliente en cada grupo, ubicado en el catálogo de HOY por código (y, si el grupo no tiene código, por nombre).
  //    Cada opción debe seguir existiendo con el mismo código Y el mismo nombre, y estar disponible.
  const picks = new Map<CurrentGroup, Map<string, number>>();
  for (const stored of Array.isArray(original.variants) ? original.variants : []) {
    if (!stored || typeof stored !== 'object') continue;
    const wanted: Array<{ code: unknown; title: unknown; quantity: number }> = stored.selected && typeof stored.selected === 'object'
      ? [{ code: stored.selected.code, title: stored.selected.title, quantity: 1 }]
      : (Array.isArray(stored.items) ? stored.items : []).map((it: any) => ({ code: it?.code, title: it?.title, quantity: Math.floor(finite(it?.quantity)) }));
    if (wanted.length === 0) continue;

    const group =
      groups.find((g) => !picks.has(g) && key(stored.code) !== '' && key(g.code) === key(stored.code)) ||
      groups.find((g) => !picks.has(g) && norm(g.name) === norm(stored.name));
    const groupLabel = String(stored.name || 'una opción');
    if (!group) return skip(original, 'optionUnavailable', groupLabel);
    // El grupo debe seguir siendo del mismo tipo: precio BASE (una opción elegida) o adicionales (opciones con cantidad)
    if ((group.pricingRole === 'BASE') !== Boolean(stored.selected)) return skip(original, 'needsConfiguration', 'options');

    const chosen = new Map<string, number>();
    for (const w of wanted) {
      const label = String(w.title || groupLabel);
      const option = group.options.find((o) => key(o.code) !== '' && key(o.code) === key(w.code));
      if (!option || !(w.quantity >= 1) || norm(option.title) !== norm(w.title) || !option.available) return skip(original, 'optionUnavailable', label);
      chosen.set(key(option.code), (chosen.get(key(option.code)) || 0) + w.quantity);
    }
    picks.set(group, chosen);
  }

  // 2) Reglas de HOY de cada grupo (las mismas que valida la ficha): mínimos obligatorios y tope de casillas
  for (const g of groups) {
    const chosen = picks.get(g);
    const units = chosen ? Array.from(chosen.values()).reduce((n, q) => n + q, 0) : 0;
    if (g.min > 0 && units < g.min) return skip(original, 'needsConfiguration', 'options');
    if (g.isCheckin && g.max > 0 && (chosen ? chosen.size : 0) > g.max) return skip(original, 'needsConfiguration', 'options');
  }

  // 3) Precios de HOY, con las mismas operaciones y en el mismo orden que el modal (grupos y opciones en el orden del catálogo)
  const priceMeta = raw.metadata?.price;
  // Precio del listado = basePrice o, si viene nulo, infoPrice (verificado en DEV con 84 productos de 6 tiendas): es el que la
  // ficha recibe de la tarjeta del catálogo y usa cuando el detalle no trae `price` ni `basePrice`
  const listingPrice = priceMeta?.basePrice ?? priceMeta?.infoPrice;
  const adaptedPrice = finite(raw.price || priceMeta?.basePrice || listingPrice || 0);
  const base = priceMeta?.basePrice !== undefined && priceMeta?.basePrice !== null
    ? Number(priceMeta.basePrice)
    : priceMeta?.infoPrice !== undefined && priceMeta?.infoPrice !== null
      ? 0
      : adaptedPrice;
  if (!Number.isFinite(base)) return skip(original, 'gone');

  let extras = 0;
  let unitBasePrice = adaptedPrice;
  let addonsTotal = 0;
  const variants: any[] = [];
  for (const g of groups) {
    const chosen = picks.get(g);
    if (!chosen) continue;
    const selected = g.options.filter((o) => chosen.has(key(o.code))).map((o) => ({ o, count: chosen.get(key(o.code)) as number }));
    if (selected.length === 0) continue;
    const isBase = g.pricingRole === 'BASE';
    for (const { o, count } of selected) {
      if (count > 0 && o.price > 0 && o.affects !== 'CAMBIA') extras += isBase ? o.price - base : o.price * count;
    }
    if (isBase) {
      const first = selected[0].o;
      unitBasePrice = first.price;
      variants.push({ name: g.name, code: g.code, type: g.selectType || 'SINGLE', selected: { code: first.code, title: first.title, unitPrice: first.price } });
    } else {
      const items = selected.map(({ o, count }) => ({ title: o.title, code: o.code, quantity: count, unitPrice: o.price, totalPrice: (o.price || 0) * count }));
      addonsTotal += items.reduce((sum, it) => sum + it.totalPrice, 0);
      variants.push({ name: g.name, code: g.code, type: g.isCheckin ? 'CHECKIN' : g.selectType || 'MULTIPLE', items });
    }
  }

  const unit = base + extras;
  if (!Number.isFinite(unit) || !(unit > 0)) return skip(original, 'gone'); // sin precio real no entra al carrito
  const qty = lineQty(original);
  const notes = typeof original.notes === 'string' && original.notes.trim() ? original.notes : undefined;

  const line = {
    id,
    cartItemId: cartItemIdOf(raw.code, variants, notes),
    code: raw.code,
    name: raw.name || original.name || 'Producto',
    price: unit,
    qty,
    quantity: qty,
    totalPrice: unit * qty,
    // Los nombres de las opciones se verificaron uno por uno, así que el desglose del pedido anterior sigue siendo exacto
    breakdown: Array.isArray(original.breakdown) ? [...original.breakdown] : [],
    variants,
    pricing: { unitBasePrice, addonsTotal, unitFinalPrice: unitBasePrice + addonsTotal },
    notes,
    extrasByPerson: undefined,
    image: raw.image || original.image || '',
    category: raw.category || original.category || 'General',
  };

  const before = finite(original.price);
  const changed = before > 0 && Math.abs(unit - before) > 0.005;
  return {
    original,
    name: String(line.name),
    qty,
    status: 'ready',
    line,
    ...(changed ? { priceChanged: { before, after: unit } } : {}),
  };
}

// ── Pedido completo ──────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Revisa TODAS las líneas de un pedido anterior contra el catálogo de hoy. Consulta una vez cada producto distinto (hasta
 * `concurrency` a la vez) con `fetchProduct`; las líneas que no son reconstruibles ni siquiera consultan.
 */
export async function prepareReorder(
  items: any[],
  fetchProduct: ProductFetcher,
  options: { storeCode?: string; concurrency?: number } = {}
): Promise<ReorderPlan> {
  const list = Array.isArray(items) ? items : [];
  const ids = Array.from(new Set(list.filter((l) => !customLineKind(l)).map((l) => Number(l?.id)).filter((n) => Number.isFinite(n) && n > 0)));
  const lookups = new Map<number, ProductLookup>();
  const queue = [...ids];
  const worker = async () => {
    for (let id = queue.shift(); id !== undefined; id = queue.shift()) {
      try {
        lookups.set(id, await fetchProduct(id));
      } catch {
        lookups.set(id, { kind: 'error' });
      }
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(options.concurrency ?? 4, queue.length)) }, worker));

  const outcomes = list.map((original): ReorderLineOutcome => {
    const custom = customLineKind(original);
    if (custom) return skip(original, 'needsConfiguration', custom);
    const found = lookups.get(Number(original?.id));
    if (!found || found.kind === 'error') return skip(original, 'unverified');
    if (found.kind === 'gone') return skip(original, 'gone');
    return rebuildReorderLine(original, found.raw, options.storeCode);
  });

  const ready = outcomes.filter((o) => o.status === 'ready');
  return {
    outcomes,
    lines: ready.map((o) => o.line),
    skipped: outcomes.filter((o) => o.status === 'skipped'),
    priceChanged: ready.filter((o) => o.priceChanged),
    totalNow: ready.reduce((sum, o) => sum + finite(o.line?.totalPrice), 0),
    networkError: outcomes.some((o) => o.reason === 'unverified'),
  };
}

/** Explicación para el cliente de por qué una línea no se puede agregar con un toque. */
export function reorderSkipText(outcome: ReorderLineOutcome): string {
  switch (outcome.reason) {
    case 'soldOut':
      return 'Agotado por ahora.';
    case 'optionUnavailable':
      return `${outcome.detail ? `«${outcome.detail}»` : 'Una de sus opciones'} ya no está disponible.`;
    case 'needsConfiguration':
      if (outcome.detail === 'room') return 'Fue un pedido entre panas: ármalo de nuevo desde la tienda.';
      if (outcome.detail === 'slots') return 'Lo personalizaste unidad por unidad: ármalo de nuevo desde su ficha.';
      return 'Sus opciones cambiaron: elígelas de nuevo en su ficha.';
    case 'unverified':
      return 'No pudimos verificarlo. Revisa tu conexión e inténtalo de nuevo.';
    case 'gone':
    default:
      return 'Ya no está disponible en la tienda.';
  }
}

/**
 * Suma las líneas reconstruidas al carrito de la tienda: una línea con la misma identidad solo aumenta su cantidad (misma regla que
 * al agregar un producto a mano); las demás se añaden al final. No modifica el arreglo recibido.
 */
export function mergeLinesIntoCart(cart: any[], lines: any[]): any[] {
  let next = Array.isArray(cart) ? [...cart] : [];
  for (const line of Array.isArray(lines) ? lines : []) {
    if (!line || !line.cartItemId || !(Number(line.totalPrice) > 0)) continue;
    const addQty = lineQty(line);
    const index = next.findIndex((item) => item?.cartItemId === line.cartItemId);
    if (index > -1) {
      const newQty = lineQty(next[index]) + addQty;
      next = next.map((item, i) => (i === index ? { ...item, qty: newQty, quantity: newQty, totalPrice: newQty * (item.price || line.price) } : item));
    } else {
      next.push({ ...line });
    }
  }
  return next;
}
