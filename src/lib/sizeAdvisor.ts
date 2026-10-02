// Modo Espejo (probador virtual): sugiere una talla por estatura y peso y la valida contra las tallas REALES del producto
// (grupo de variantes del backend, p. ej. "Tallas" → "Talla S", "Talla M"…). Migrado del script de Bereshit Boutique
// (`calculateVirtualSize`); ver AGENTS.md, entrada "Migración de funciones de Bereshit Boutique".
//
// Todo lo de arriba de "Perfil guardado" es puro (sin React, sin red, sin `window`). Nada aquí calcula precios ni toca el carrito.

/** Escala de tallas por letra, de menor a mayor. La distancia entre dos tallas es la diferencia de índices. */
export const LETTER_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'] as const;
export type LetterSize = (typeof LETTER_SIZES)[number];

const SIZE_ALIASES: Record<string, LetterSize> = {
  XXS: 'XXS', '2XS': 'XXS',
  XS: 'XS', S: 'S', M: 'M', L: 'L', XL: 'XL',
  XXL: 'XXL', '2XL': 'XXL',
  XXXL: '3XL', '3XL': '3XL',
  XXXXL: '4XL', '4XL': '4XL',
  XXXXXL: '5XL', '5XL': '5XL',
};

const stripAccents = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Talla por letra de una opción del backend: "Talla XS", "TALLA  L", "xl", "Talla 2XL" → 'XS' | 'L' | 'XL' | 'XXL'.
 * Devuelve `null` si el texto no es una talla por letra inequívoca (tallas numéricas como "TALLA 32", "Única", colores…):
 * para esas no hay sugerencia posible y el probador no se muestra.
 */
export function parseLetterSize(label: unknown): LetterSize | null {
  const tokens = stripAccents(String(label ?? ''))
    .toUpperCase()
    .replace(/\b(TALLAS?|SIZES?)\b/g, ' ')
    .split(/[^A-Z0-9]+/)
    .filter(Boolean);
  const found = new Set<LetterSize>();
  for (const t of tokens) {
    const size = SIZE_ALIASES[t];
    if (size) found.add(size);
  }
  return found.size === 1 ? Array.from(found)[0] : null;
}

/**
 * Regla de corte del script original (peso en kg, estatura en cm). Es una orientación por complexión, no una medida
 * de la prenda: el backend no trae medidas por talla, así que no hay nada más preciso con qué comparar.
 */
export function suggestLetterSize(heightCm: number, weightKg: number): LetterSize | null {
  if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg) || heightCm <= 0 || weightKg <= 0) return null;
  if (weightKg <= 52 && heightCm <= 162) return 'XS';
  if (weightKg <= 62 && heightCm <= 170) return 'S';
  if (weightKg <= 75 && heightCm <= 178) return 'M';
  if (weightKg <= 88 && heightCm <= 185) return 'L';
  return 'XL';
}

/**
 * ¿La opción se puede pedir? Mismo criterio con el que el modal deshabilita una cápsula (`status === 'INACTIVE'`), más los
 * campos de existencias por si el backend los envía en la opción (hoy solo llega `status`).
 */
export function isOptionAvailable(opt: any): boolean {
  if (!opt || opt.status === 'INACTIVE' || opt.outOfStock === true) return false;
  if (typeof opt.stock === 'number' && opt.stock <= 0) return false;
  return true;
}

export interface SizeOption {
  code: string;
  label: string;
  size: LetterSize | null;
  available: boolean;
  price: number;
}

const groupLabel = (g: any) => stripAccents(String(g?.name || g?.title || g?.label || '')).toLowerCase();
const groupOptions = (g: any): any[] => (Array.isArray(g?.options) ? g.options : Array.isArray(g?.items) ? g.items : []);

/**
 * Índice del grupo de tallas dentro de los grupos del producto, o -1. Es de tallas si se llama "Talla(s)"/"Size(s)" o si
 * TODAS sus opciones (2 o más) son tallas por letra.
 */
export function findSizeGroupIndex(groups: any[]): number {
  if (!Array.isArray(groups)) return -1;
  const byName = groups.findIndex((g) => /\b(tallas?|sizes?)\b/.test(groupLabel(g)) && groupOptions(g).length > 0);
  if (byName >= 0) return byName;
  return groups.findIndex((g) => {
    const opts = groupOptions(g);
    return opts.length >= 2 && opts.every((o) => parseLetterSize(o?.name || o?.title || o?.label) !== null);
  });
}

export function readSizeOptions(group: any): SizeOption[] {
  return groupOptions(group).map((o: any) => {
    const label = String(o?.name || o?.title || o?.label || '').replace(/\s+/g, ' ').trim();
    return {
      code: String(o?.code ?? o?.id ?? ''),
      label,
      size: parseLetterSize(label),
      available: isOptionAvailable(o),
      price: Number(o?.price || 0),
    };
  });
}

export type SizeAdvice =
  // La talla ideal existe en esta prenda y tiene stock
  | { kind: 'exact'; ideal: LetterSize; option: SizeOption }
  // La ideal está agotada o la prenda no viene en esa talla, pero la contigua sí está disponible
  | { kind: 'nearby'; ideal: LetterSize; option: SizeOption; why: 'soldOut' | 'notOffered'; fit: 'looser' | 'tighter' }
  // Nada que recomendar: ni la ideal ni una contigua. `allSoldOut` = la prenda no tiene ninguna talla disponible
  | { kind: 'none'; ideal: LetterSize; why: 'soldOut' | 'notOffered'; allSoldOut: boolean };

/**
 * Cruza la talla ideal con las tallas reales del producto. Solo se propone una alternativa si es la talla CONTIGUA
 * (primero la siguiente más grande: una prenda holgada sirve, una ajustada puede no entrar); más lejos que eso no se
 * recomienda nada. `productSoldOut` = el producto entero está agotado (ver `isProductSoldOut` en `productStock.ts`).
 */
export function adviseSize(ideal: LetterSize, options: SizeOption[], productSoldOut = false): SizeAdvice {
  const letter = options.filter((o) => o.size !== null);
  // "Agotada" = la prenda sí viene en la talla ideal pero sin stock; "no ofrecida" = no existe esa talla en esta prenda
  const why: 'soldOut' | 'notOffered' = productSoldOut || letter.some((o) => o.size === ideal) ? 'soldOut' : 'notOffered';
  const availableLetter = productSoldOut ? [] : letter.filter((o) => o.available);

  if (availableLetter.length === 0) return { kind: 'none', ideal, why, allSoldOut: true };

  const exact = availableLetter.find((o) => o.size === ideal);
  if (exact) return { kind: 'exact', ideal, option: exact };

  const idx = LETTER_SIZES.indexOf(ideal);
  const larger = availableLetter.find((o) => o.size === LETTER_SIZES[idx + 1]);
  if (larger) return { kind: 'nearby', ideal, option: larger, why, fit: 'looser' };
  const smaller = idx > 0 ? availableLetter.find((o) => o.size === LETTER_SIZES[idx - 1]) : undefined;
  if (smaller) return { kind: 'nearby', ideal, option: smaller, why, fit: 'tighter' };

  return { kind: 'none', ideal, why, allSoldOut: false };
}

// ── Perfil guardado (solo este dispositivo) ──────────────────────────────────────────────────────────────────────────
// La estatura y el peso que eligió el cliente se recuerdan en `localStorage` para no volver a pedirlos en cada prenda.
// No salen del navegador: no viajan al backend ni forman parte del pedido.

export interface FitProfile { heightCm: number; weightKg: number }
const FIT_PROFILE_KEY = 'duna_fit_profile_v1';

export function loadFitProfile(): FitProfile | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(FIT_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const heightCm = Number(parsed?.heightCm);
    const weightKg = Number(parsed?.weightKg);
    return heightCm > 0 && weightKg > 0 ? { heightCm, weightKg } : null;
  } catch {
    return null;
  }
}

export function saveFitProfile(profile: FitProfile): void {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(FIT_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* almacenamiento bloqueado: el probador funciona igual, solo no recuerda los datos */
  }
}
