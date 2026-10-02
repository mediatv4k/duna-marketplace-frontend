// "Completa tu look": qué productos REALES de la misma tienda combinan con la prenda abierta y cómo entran al pedido.
// Funciones puras (sin React, sin red). Migrado del script de Bereshit Boutique con una diferencia de fondo: aquel ofrecía dos
// accesorios escritos a mano (códigos UP-BELT / UP-PERF que no existen en ningún catálogo). Aquí cada sugerencia es un
// producto del catálogo del comercio y, al activarla, entra al carrito como una LÍNEA PROPIA con su id, código, variantes y
// precio reales: es lo único que el backend puede validar (regla de oro 3 de AGENTS.md, datos 100% reales).

import { parseLetterSize, isOptionAvailable, LETTER_SIZES, type LetterSize } from './sizeAdvisor';
import { isProductSoldOut } from './productStock';

// Minúsculas y sin acentos, pero conservando la ñ (U+0303 no se quita): "moño" no debe leerse como "mono"
const normalize = (s: unknown) => String(s ?? '').normalize('NFD').replace(/[̀-̂̄-ͯ]/g, '').normalize('NFC').toLowerCase();

// ── 1. Qué tipo de prenda es ────────────────────────────────────────────────────────────────────────────────────────

export type GarmentZone = 'ACCESSORY' | 'FOOTWEAR' | 'FULL' | 'BOTTOM' | 'OUTER' | 'TOP' | 'UNKNOWN';

const zoneRegex = (words: string[]) => new RegExp(`\\b(?:${words.join('|')})\\b`);

// Palabras en minúscula y sin acentos (la ñ sí se conserva); cada una trae su propio plural. "mono" es pantalón (uso venezolano)
// y "braga", enterizo.
const ZONE_PATTERNS: Array<[Exclude<GarmentZone, 'UNKNOWN'>, RegExp]> = [
  ['ACCESSORY', zoneRegex([
    'accesorios?', 'cinturon(?:es)?', 'correas?', 'cintos?', 'gorras?', 'sombreros?', 'boinas?', 'bandanas?', 'bolsos?', 'carteras?',
    'billeteras?', 'monederos?', 'mochilas?', 'morral(?:es)?', 'koalas?', 'ri[nñ]oneras?', 'lentes', 'gafas', 'collar(?:es)?', 'pulseras?',
    'zarcillos?', 'aretes?', 'anillos?', 'cadenas?', 'dijes?', 'reloj(?:es)?', 'bufandas?', 'pashminas?', 'pa[nñ]uelos?', 'corbatas?',
    'tirantes', 'bisuteria', 'cintillos?', 'moños?', 'llaveros?', 'medias', 'calcetin(?:es)?', 'guantes?', 'perfumes?', 'colonias?',
    'fragancias?', 'cosmetiqueras?',
  ])],
  ['FOOTWEAR', zoneRegex([
    'zapatos?', 'zapatillas?', 'sandalias?', 'tacon(?:es)?', 'botas?', 'botin(?:es)?', 'tenis', 'mocasin(?:es)?', 'cholas?', 'chanclas?',
    'alpargatas?', 'calzados?',
  ])],
  ['FULL', zoneRegex(['vestidos?', 'enterizos?', 'bragas?', 'jumpsuits?', 'conjuntos?', 'sets?', 'pijamas?', 'trajes?', 'overol(?:es)?'])],
  ['BOTTOM', zoneRegex([
    'jeans?', 'bluejeans?', 'pantalon(?:es)?', 'monos?', 'shorts?', 'bermudas?', 'faldas?', 'leggings?', 'licras?', 'joggers?',
  ])],
  ['OUTER', zoneRegex([
    'chaquetas?', 'sueter(?:es)?', 'sweaters?', 'abrigos?', 'cardigans?', 'blazers?', 'hoodies?', 'sudaderas?', 'chalecos?', 'kimonos?',
    'cortavientos?',
  ])],
  ['TOP', zoneRegex([
    'franelas?', 'franelillas?', 'camisas?', 'camisetas?', 'blusas?', 'blusones?', 'chemises?', 'chemis', 'polos?', 'tops?', 'bodys?',
    'body', 'corsets?', 'crop', 'oversize',
  ])],
];

function zoneOfText(text: string): GarmentZone {
  let best: GarmentZone = 'UNKNOWN';
  let bestAt = Infinity;
  for (const [zone, re] of ZONE_PATTERNS) {
    const m = re.exec(text);
    if (m && m.index < bestAt) {
      best = zone;
      bestAt = m.index;
    }
  }
  return best;
}

/**
 * Tipo de prenda según el NOMBRE (gana la palabra que aparece primero: "Vestido negro con cinturón" es un vestido, no un
 * cinturón); si el nombre no dice nada, según la subcategoría y luego la categoría del comercio.
 */
export function garmentZone(product: any): GarmentZone {
  for (const field of [product?.name, product?.internalCategory, product?.category]) {
    const zone = zoneOfText(normalize(field));
    if (zone !== 'UNKNOWN') return zone;
  }
  return 'UNKNOWN';
}

// Qué combina con qué. Los accesorios van siempre primero: son el complemento natural de cualquier prenda.
const COMPLEMENT_ZONES: Record<GarmentZone, GarmentZone[]> = {
  TOP: ['ACCESSORY', 'BOTTOM', 'FOOTWEAR', 'OUTER'],
  BOTTOM: ['ACCESSORY', 'TOP', 'FOOTWEAR', 'OUTER'],
  FULL: ['ACCESSORY', 'FOOTWEAR', 'OUTER'],
  OUTER: ['ACCESSORY', 'TOP', 'BOTTOM'],
  FOOTWEAR: ['ACCESSORY'],
  ACCESSORY: ['ACCESSORY'],
  UNKNOWN: ['ACCESSORY'],
};

type Gender = 'F' | 'M' | 'K';
const GENDER_PATTERNS: Array<[Gender, RegExp]> = [
  ['F', /\b(?:damas?|mujer(?:es)?|femenin[oa]s?|chicas?)\b/],
  ['M', /\b(?:caballeros?|hombres?|masculin[oa]s?|varon(?:es)?)\b/],
  ['K', /\b(?:ni[nñ][oa]s?|bebes?|infantil(?:es)?|kids?)\b/],
];

/** Público de la prenda si el comercio lo declara (categoría "DAMAS", "FRANELAS CABALLERO"…); `null` si no lo dice o es mixto. */
function genderOf(product: any): Gender | null {
  const text = normalize(`${product?.category || ''} ${product?.internalCategory || ''} ${product?.name || ''}`);
  const found = GENDER_PATTERNS.filter(([, re]) => re.test(text)).map(([g]) => g);
  return found.length === 1 ? found[0] : null;
}

/**
 * Candidatos del catálogo (listado de la tienda) para la prenda `current`, en orden de preferencia y sin pasar de `limit`.
 * Excluye la propia prenda, los agotados y las prendas declaradas para otro público. Dentro de cada tipo de prenda se
 * intercalan las categorías del comercio (un jean, un mono, un short…) para que no salgan cuatro productos casi iguales.
 */
export function pickLookCandidates(current: any, catalog: any[], limit = 6): any[] {
  if (!current || !Array.isArray(catalog) || catalog.length === 0 || limit <= 0) return [];
  const currentId = String(current.id ?? '');
  // El detalle del producto no trae `internalCategory`: se toma de su fila del listado
  const listed = catalog.find((p) => p && String(p.id) === currentId);
  const me = { ...current, internalCategory: current.internalCategory || listed?.internalCategory };
  const wanted = COMPLEMENT_ZONES[garmentZone(me)];
  const myGender = genderOf(me);

  const byZone = new Map<GarmentZone, any[]>();
  for (const p of catalog) {
    if (!p || p.id == null || String(p.id) === currentId || isProductSoldOut(p)) continue;
    const gender = genderOf(p);
    if (myGender && gender && gender !== myGender) continue;
    const zone = garmentZone(p);
    if (!wanted.includes(zone)) continue;
    if (!byZone.has(zone)) byZone.set(zone, []);
    byZone.get(zone)!.push(p);
  }

  const out: any[] = [];
  for (const zone of wanted) {
    const queues = new Map<string, any[]>();
    for (const p of byZone.get(zone) || []) {
      const key = String(p.category || '');
      if (!queues.has(key)) queues.set(key, []);
      queues.get(key)!.push(p);
    }
    const lists = Array.from(queues.values());
    for (let i = 0; out.length < limit && lists.some((q) => q.length > i); i++) {
      for (const q of lists) {
        if (q[i] && out.length < limit) out.push(q[i]);
      }
    }
    if (out.length >= limit) break;
  }
  return out;
}

// ── 2. Cómo entra al pedido ─────────────────────────────────────────────────────────────────────────────────────────

/** Lo que el modal le entrega a la tienda por cada complemento activado: mismo formato que un producto agregado a mano. */
export interface LookComplementPayload {
  productId: number;
  productCode: string;
  productName: string;
  image: string;
  category: string;
  totalPrice: number;
  totalUSD: number;
  qty: number;
  quantity: number;
  summaryText: string;
  breakdown: string[];
  variants: any[];
  pricing: { unitBasePrice: number; addonsTotal: number; unitFinalPrice: number };
}

export interface ComplementOption {
  code: string;      // clave para la interfaz (siempre texto)
  rawCode: unknown;  // código tal cual lo envía el backend: es el que viaja en el pedido
  title: string;     // título exacto del backend ("TALLA  L" con sus espacios): es el que viaja en el pedido
  label: string;     // el mismo título con los espacios limpios, solo para mostrarlo
  price: number;
  size: LetterSize | null;
}

export interface LookComplement {
  id: string;
  name: string;
  image: string;
  /** 'direct' = se agrega tal cual; 'choice' = hay que elegir UNA opción obligatoria (la talla) antes de agregarlo */
  kind: 'direct' | 'choice';
  price: number; // 'direct': precio final · 'choice': el menor precio entre sus opciones disponibles
  groupName: string; // 'choice': nombre real del grupo ("Tallas")
  isSizeGroup: boolean;
  options: ComplementOption[];
  // Datos internos para armar el ítem con la misma forma que produce MasterProductModal (código y nombre SIN retocar)
  product: { id: number; code: string; name: string; image: string; category: string; adaptedPrice: number; base: number };
  group: { name: string; code: unknown; type: string } | null;
}

const itemList = (g: any): any[] => {
  const list = g?.items || g?.options || g?.values || g?.variants || g?.choices || [];
  return Array.isArray(list) ? list : [];
};

/**
 * Lee el detalle crudo de `GET /product/{id}/web` y decide si ese producto se puede agregar desde "Completa tu look".
 * Solo se aceptan los dos casos en los que no hay ambigüedad posible:
 *   · sin variantes obligatorias → se agrega directo;
 *   · UNA sola variante obligatoria de una opción y de precio base (la talla) → se elige en la misma tarjeta.
 * Cualquier otra estructura (varios grupos obligatorios, mínimos mayores a 1, adicionales obligatorios, listas planas,
 * casillas) devuelve `null`: ese producto se compra desde su propia ficha, donde están todas sus opciones.
 * La normalización replica la de `MerchantStoreView.handleProductClick` + `MasterProductModal` para que el ítem resultante
 * sea idéntico al que se obtiene agregando el producto a mano (misma identidad en el carrito, mismos `variants`/`pricing`).
 */
export function readLookComplement(raw: any, listing?: any): LookComplement | null {
  if (!raw || typeof raw !== 'object') return null;
  const id = Number(raw.id ?? listing?.id);
  // Código y nombre viajan al pedido exactamente como los envía el backend; el texto limpio es solo para validar y mostrar
  const code = raw.code;
  const rawName = raw.name ?? listing?.name;
  const name = String(rawName ?? '').replace(/\s+/g, ' ').trim();
  if (!Number.isFinite(id) || id <= 0 || !String(code ?? '').trim() || !name) return null;
  if (isProductSoldOut(raw) || (raw.metadata != null && typeof raw.metadata !== 'object')) return null;

  const rawVariants =
    raw.metadata?.variants || raw.variants || raw.groups || raw.metadata?.groups ||
    raw.sabores || raw.metadata?.sabores || raw.pack_items || raw.metadata?.pack_items ||
    raw.options || raw.metadata?.options || raw.customizations || raw.metadata?.customizations || [];
  if (!Array.isArray(rawVariants)) return null;
  const isGroupList = rawVariants.some((g: any) =>
    g && typeof g === 'object' && (Array.isArray(g.items) || Array.isArray(g.options) || Array.isArray(g.values) || Array.isArray(g.variants) || Array.isArray(g.choices))
  );
  if (rawVariants.length > 0 && !isGroupList) return null;

  const adaptedPrice = Number(raw.price || raw.metadata?.price?.basePrice || listing?.price || 0);
  const priceMeta = raw.metadata?.price;
  const base = priceMeta?.basePrice !== undefined && priceMeta?.basePrice !== null
    ? Number(priceMeta.basePrice)
    : priceMeta?.infoPrice !== undefined && priceMeta?.infoPrice !== null
      ? 0
      : adaptedPrice;
  if (!Number.isFinite(base) || !Number.isFinite(adaptedPrice)) return null;

  const groups = rawVariants.map((g: any) => {
    const isCheckbox = g?.selectType === 'CHECKIN' || Boolean(g?.checkbox);
    const isMultiple = g?.selectType === 'MULTIPLE' || isCheckbox || Number(g?.max || g?.maxItems || 0) > 1;
    const selectType: string = isCheckbox ? 'CHECKIN' : isMultiple ? 'MULTIPLE' : g?.selectType || 'SINGLE';
    const pricingRole: string = g?.pricingRole || 'ADDON';
    const min = Number(g?.minItems ?? g?.min ?? (g?.required ? 1 : selectType === 'SINGLE' && pricingRole === 'BASE' ? 1 : 0)) || 0;
    return { raw: g, name: String(g?.name || g?.title || g?.label || 'Opciones'), selectType, pricingRole, isCheckbox, min };
  });

  const product = { id, code, name: rawName, image: raw.image || listing?.image || '', category: raw.category || 'General', adaptedPrice, base };
  const required = groups.filter((g) => g.min > 0);

  if (required.length === 0) {
    // El modal cobra `base` y declara `adaptedPrice` como precio unitario: solo se ofrece si ambos coinciden y hay precio real
    if (!(base > 0) || Math.abs(base - adaptedPrice) > 0.005) return null;
    return { id: String(id), name, image: product.image, kind: 'direct', price: base, groupName: '', isSizeGroup: false, options: [], product, group: null };
  }

  if (required.length !== 1) return null;
  const g = required[0];
  if (g.min !== 1 || g.isCheckbox || g.pricingRole !== 'BASE') return null;

  const options: ComplementOption[] = [];
  for (const item of itemList(g.raw)) {
    if (!item || typeof item !== 'object' || !isOptionAvailable(item) || item.affects === 'CAMBIA') continue;
    const optCode = item.code || item.id || item.value;
    const title = item.title || item.name || item.label;
    const label = String(title || '').replace(/\s+/g, ' ').trim();
    const price = Number(item.price || item.unitPrice || 0);
    if (!optCode || !label || !(price > 0)) continue;
    options.push({ code: String(optCode), rawCode: optCode, title, label, price, size: parseLetterSize(label) });
  }
  if (options.length === 0) return null;

  // Solo presentación: las tallas se muestran de menor a mayor (XS…XL o 30…38) en vez del orden de carga del comercio.
  // Si alguna opción no es una talla reconocible se respeta el orden del backend. El pedido no depende de este orden.
  const isSizeGroup = /\b(?:tallas?|sizes?)\b/.test(normalize(g.name));
  const rank = (o: ComplementOption): number | null => {
    if (o.size) return LETTER_SIZES.indexOf(o.size);
    const m = /\d+(?:[.,]\d+)?/.exec(o.label);
    return m ? 1000 + Number(m[0].replace(',', '.')) : null;
  };
  if (isSizeGroup && options.every((o) => rank(o) !== null)) options.sort((a, b) => (rank(a) as number) - (rank(b) as number));

  return {
    id: String(id),
    name,
    image: product.image,
    kind: 'choice',
    price: Math.min(...options.map((o) => o.price)),
    groupName: g.name,
    isSizeGroup,
    options,
    product,
    group: { name: g.name, code: g.raw?.code, type: g.selectType || 'SINGLE' },
  };
}

/**
 * Ítem listo para el carrito. `optionCode` es obligatorio en los complementos 'choice'. Devuelve `null` si falta la opción
 * o ya no existe. La forma (y el orden de las claves de `variants`, que define la identidad del ítem en el carrito)
 * es la misma que arma `MasterProductModal.handleAddToCart` para una unidad.
 */
export function buildLookPayload(complement: LookComplement, optionCode?: string | null): LookComplementPayload | null {
  const { product, group } = complement;
  const common = { productId: product.id, productCode: product.code, productName: product.name, image: product.image, category: product.category, qty: 1, quantity: 1 };

  if (complement.kind === 'direct') {
    const total = product.base;
    return {
      ...common,
      totalPrice: total,
      totalUSD: total,
      summaryText: '',
      breakdown: [],
      variants: [],
      pricing: { unitBasePrice: product.adaptedPrice, addonsTotal: 0, unitFinalPrice: product.adaptedPrice },
    };
  }

  const chosen = complement.options.find((o) => o.code === String(optionCode ?? ''));
  if (!chosen || !group) return null;
  const total = product.base + (chosen.price - product.base); // misma operación que el modal para un grupo de precio BASE
  const breakdown = [`1x ${chosen.title}`];
  return {
    ...common,
    totalPrice: total,
    totalUSD: total,
    summaryText: breakdown.join(' | '),
    breakdown,
    variants: [{ name: group.name, code: group.code, type: group.type, selected: { code: chosen.rawCode, title: chosen.title, unitPrice: chosen.price } }],
    pricing: { unitBasePrice: chosen.price, addonsTotal: 0, unitFinalPrice: chosen.price },
  };
}

/** Línea del carrito para un complemento: mismos campos que arma `MerchantStoreView.handleAddToCartFromModal`. */
export function mergeLookComplementIntoCart(cart: any[], c: LookComplementPayload): any[] {
  const realId = Number(c?.productId);
  const productCode = c?.productCode;
  // Mismas tres defensas que el producto principal: id, código y precio reales, o no entra al pedido
  if (!Number.isFinite(realId) || realId <= 0 || !String(productCode ?? '').trim() || !(Number(c?.totalPrice) > 0)) return cart;
  const cartItemId = `${productCode}::${JSON.stringify(c.variants || [])}`;
  const addQty = c.qty || c.quantity || 1;
  const index = cart.findIndex((item) => item.cartItemId === cartItemId);
  if (index > -1) {
    const next = [...cart];
    const newQty = (next[index].qty || next[index].quantity || 1) + addQty;
    next[index] = { ...next[index], qty: newQty, quantity: newQty, totalPrice: newQty * (next[index].price || c.totalPrice / addQty) };
    return next;
  }
  return [
    ...cart,
    {
      id: realId,
      cartItemId,
      code: productCode,
      name: c.productName || 'Producto',
      price: c.totalPrice / addQty,
      qty: addQty,
      quantity: addQty,
      totalPrice: c.totalPrice,
      breakdown: c.breakdown || [],
      variants: c.variants || [],
      pricing: c.pricing || null,
      notes: undefined,
      extrasByPerson: undefined,
      image: c.image || '',
      category: c.category || 'General',
    },
  ];
}
