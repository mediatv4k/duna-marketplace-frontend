// Descuentos y cargos PROPIOS del comercio. Fuente de verdad: GET /store/{id}/payment/info -> `store.additionalItemsPercent` y
// `store.additionalItemsAmount` (listas de `{ key, value }`). Convención de Adonis: valor NEGATIVO = descuento, POSITIVO = recargo
// (p. ej. "Servicio", "Empaque"); en `additionalItemsPercent` el valor es una fracción (-0.05 = 5 % de descuento) y en
// `additionalItemsAmount` es un monto en USD (-1.00 = $1 de descuento).
// Funciones puras (sin React ni red): el frontend nunca inventa porcentajes ni montos, solo aplica lo que devuelve el backend.

export type StoreAdjustmentKind = 'PERCENT' | 'AMOUNT';

export interface StoreAdjustment {
  key: string; // texto del comercio, p. ej. "Descuento 15% por Black Friday"
  kind: StoreAdjustmentKind;
  value: number; // con signo, tal cual lo manda Adonis
}

export interface StoreAdjustmentLine {
  label: string;
  kind: StoreAdjustmentKind;
  value: number;
  amount: number; // USD con signo y 2 decimales: negativo = descuento, positivo = cargo
  isDiscount: boolean;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const trimNumber = (n: number) => String(Number(n.toFixed(2))); // 15 -> "15", 12.5 -> "12.5"

function readList(list: unknown, kind: StoreAdjustmentKind): StoreAdjustment[] {
  if (!Array.isArray(list)) return [];
  const out: StoreAdjustment[] = [];
  for (const raw of list) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    const value = Number(r.value);
    if (!Number.isFinite(value) || value === 0) continue;
    // Un porcentaje fuera de ±100 % (|valor| > 1) no puede ser una fracción válida: la escala es dudosa y se ignora antes que aplicar
    // un descuento o cargo desproporcionado
    if (kind === 'PERCENT' && Math.abs(value) > 1) continue;
    out.push({ key: String(r.key ?? '').trim(), kind, value });
  }
  return out;
}

// Lee los ajustes del objeto `store` de payment/info (o de un item de /store/find si algún día trae los campos). Sin campos = [].
export function parseStoreAdjustments(store: unknown): StoreAdjustment[] {
  if (!store || typeof store !== 'object') return [];
  const s = store as Record<string, unknown>;
  return [...readList(s.additionalItemsPercent, 'PERCENT'), ...readList(s.additionalItemsAmount, 'AMOUNT')];
}

function labelFor(adj: StoreAdjustment): string {
  const isDiscount = adj.value < 0;
  const pct = adj.kind === 'PERCENT' ? trimNumber(Math.abs(adj.value) * 100) : null;
  if (adj.key) return pct && !/\d/.test(adj.key) ? `${adj.key} (${pct}%)` : adj.key;
  if (isDiscount) return pct ? `Descuento de tienda (${pct}%)` : 'Descuento de tienda';
  return pct ? `Cargo del comercio (${pct}%)` : 'Cargo del comercio';
}

export interface StoreAdjustmentsResult {
  lines: StoreAdjustmentLine[];
  discountTotal: number; // >= 0, ya con tope en el subtotal
  chargesTotal: number; // >= 0
  net: number; // cargos − descuentos (con signo): lo que se suma al subtotal
}

// Base de todos los porcentajes = subtotal de productos (antes de cualquier ajuste). Cada línea se redondea a 2 decimales por separado.
// Los descuentos nunca dejan los productos por debajo de $0: si suman más que el subtotal, las líneas se recortan en orden.
export function computeStoreAdjustments(adjustments: StoreAdjustment[], subtotal: number): StoreAdjustmentsResult {
  const base = Number.isFinite(subtotal) && subtotal > 0 ? round2(subtotal) : 0;
  const lines: StoreAdjustmentLine[] = [];
  let remaining = base; // cuánto subtotal queda por descontar
  let discountTotal = 0;
  let chargesTotal = 0;
  if (base <= 0) return { lines, discountTotal: 0, chargesTotal: 0, net: 0 };
  for (const adj of adjustments) {
    const magnitude = round2(adj.kind === 'PERCENT' ? base * Math.abs(adj.value) : Math.abs(adj.value));
    if (magnitude <= 0) continue;
    if (adj.value < 0) {
      const applied = Math.min(magnitude, remaining);
      if (applied <= 0) continue;
      remaining = round2(remaining - applied);
      discountTotal = round2(discountTotal + applied);
      lines.push({ label: labelFor(adj), kind: adj.kind, value: adj.value, amount: -applied, isDiscount: true });
    } else {
      chargesTotal = round2(chargesTotal + magnitude);
      lines.push({ label: labelFor(adj), kind: adj.kind, value: adj.value, amount: magnitude, isDiscount: false });
    }
  }
  return { lines, discountTotal, chargesTotal, net: round2(chargesTotal - discountTotal) };
}

// Insignia promocional ("15% OFF", "$1.00 OFF", "15% + $1.00 OFF") con los valores REALES de los descuentos; null si no hay descuentos.
// Los cargos (valores positivos) no son promoción y no generan insignia.
export function storeDiscountBadge(adjustments: StoreAdjustment[]): string | null {
  let pct = 0;
  let amt = 0;
  for (const adj of adjustments) {
    if (adj.value >= 0) continue;
    if (adj.kind === 'PERCENT') pct += Math.abs(adj.value) * 100;
    else amt += Math.abs(adj.value);
  }
  pct = round2(pct);
  amt = round2(amt);
  if (pct > 0 && amt > 0) return `${trimNumber(pct)}% + $${amt.toFixed(2)} OFF`;
  if (pct > 0) return `${trimNumber(pct)}% OFF`;
  if (amt > 0) return `$${amt.toFixed(2)} OFF`;
  return null;
}

// Texto del comercio para el aviso de la cabecera de tienda: sus propias descripciones de descuento (`key`), sin repetir.
export function storeDiscountNotice(adjustments: StoreAdjustment[]): string {
  const keys = adjustments.filter((a) => a.value < 0 && a.key).map((a) => a.key);
  return Array.from(new Set(keys)).join(' · ');
}

// Firma estable para detectar si los ajustes cambiaron entre dos consultas (p. ej. tras un `code: 21`)
export function adjustmentsSignature(adjustments: StoreAdjustment[]): string {
  return adjustments.map((a) => `${a.kind}:${a.value}:${a.key}`).sort().join('|');
}
