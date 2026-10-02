// Tallas con contador (tiendas de moda): de "2 de la M y 1 de la L" a líneas válidas del carrito.
// Funciones puras (sin React ni red).
//
// El contrato de Adonis (DOCUMENTO_TECNICO_OSWALDO.md §7.5) exige por ítem `totalPrice = unitFinalPrice × cantidad`, y el
// total del pedido es la suma de esos `totalPrice`; si no cuadra responde `code: 21`. Un ítem solo puede llevar UNA talla
// (grupo de precio BASE → `selected`). Por eso cada talla marcada es una línea propia: mismo producto, esa talla como
// variante, `cantidad` = unidades de esa talla. Antes las unidades se quedaban en el texto del desglose ("2x Talla M")
// y el ítem viajaba con cantidad 1 y una sola talla, cobrando de menos o descuadrando el pedido.

import type { LookComplementPayload } from './lookComplements';

/** Línea de carrito de una talla: misma forma que un producto agregado desde su ficha (más la nota del cliente, si la hay). */
export type SizeLinePayload = LookComplementPayload;

/** Unidades y monto de lo marcado en el grupo de tallas (solo opciones con cantidad y precio reales). */
export function sizeSelectionTotals(selection: unknown): { units: number; amount: number } {
  let units = 0;
  let amount = 0;
  if (Array.isArray(selection)) {
    for (const item of selection) {
      const count = Math.floor(Number(item?.count) || 0);
      const price = Number(item?.price) || 0;
      if (count > 0 && price > 0) {
        units += count;
        amount += price * count;
      }
    }
  }
  return { units, amount };
}

export interface SizeLinesInput {
  product: { id: unknown; code: unknown; name: unknown; image?: unknown; category?: unknown };
  /** Opciones de talla marcadas (count > 0), en el orden del selector */
  sizes: any[];
  /** Cantidad general del producto (en este modo siempre 1: las unidades se eligen por talla) */
  multiplier: number;
  /** `variants` del ítem tal como las arma el modal, con la entrada del grupo de tallas incluida */
  variants: any[];
  /** Posición de la entrada del grupo de tallas dentro de `variants` */
  sizeVariantIndex: number;
  /** Adicionales por unidad de los demás grupos (0 si el producto solo tiene tallas) */
  addonsTotal: number;
  /** Renglones del desglose que no son de talla (otros grupos, nota) */
  breakdownRest?: string[];
  note?: string;
}

/**
 * Una línea por talla marcada. Cada línea es idéntica a la que produce la ficha al elegir SOLO esa talla (desglose
 * "1x Talla M", `selected` con esa talla, `pricing` unitario), con `qty` = unidades de esa talla: así dos pedidos de la
 * misma talla se fusionan en una sola línea del carrito y `totalPrice` siempre es `unitFinalPrice × qty`.
 */
export function buildSizeLines(input: SizeLinesInput): SizeLinePayload[] {
  const { product, variants, sizeVariantIndex } = input;
  const multiplier = Math.max(1, Math.floor(Number(input.multiplier) || 1));
  const addonsTotal = Number(input.addonsTotal) || 0;
  const rest = input.breakdownRest || [];
  const lines: SizeLinePayload[] = [];
  if (!Array.isArray(variants) || sizeVariantIndex < 0 || sizeVariantIndex >= variants.length) return lines;

  for (const size of input.sizes || []) {
    const count = Math.floor(Number(size?.count) || 0);
    const unitBasePrice = Number(size?.price) || 0;
    if (count <= 0 || !(unitBasePrice > 0)) continue;
    const units = count * multiplier;
    const title = size.name || size.title;
    const unitFinalPrice = unitBasePrice + addonsTotal;
    const total = unitFinalPrice * units;
    const breakdown = [`1x ${title}`, ...rest];
    lines.push({
      productId: Number(product.id),
      productCode: product.code as string,
      productName: product.name as string,
      image: (product.image as string) || '',
      category: (product.category as string) || 'General',
      totalPrice: total,
      totalUSD: total,
      qty: units,
      quantity: units,
      summaryText: breakdown.join(' | '),
      breakdown,
      // Mismo orden de claves que arma el modal (name, code, type, selected): define la identidad del ítem en el carrito
      variants: variants.map((v, i) => (i === sizeVariantIndex
        ? { ...v, selected: { code: size.code || size.id, title, unitPrice: size.price } }
        : v)),
      pricing: { unitBasePrice, addonsTotal, unitFinalPrice },
      notes: input.note || undefined,
    });
  }
  return lines;
}
