/**
 * MOTOR MULTI-NICHO — D'una Marketplace (v2 — enum único de reconciliación)
 * ---------------------------------------------------------------------
 * Este archivo reemplaza a los 3 sistemas de nicho que hoy conviven
 * desconectados en el repo:
 *
 *   1. `src/lib/nicheConfig.ts` (existente, huérfano): StoreNiche =
 *      BOUTIQUE | PIZZERIA | FAST_FOOD | ABASTO | BODEGON | GENERAL,
 *      con detectStoreNiche() por keyword y getNicheFeatures() con
 *      banderas booleanas (hasSizes, hasBottlePacks, etc.)
 *   2. El nicheConfig.ts "rico" propuesto en la sesión anterior
 *      (FOOD_SWEETS, FASHION, TECH...) — nunca llegó a integrarse.
 *   3. El que espera `MasterProductModal.tsx` internamente en
 *      `getUpsellsByNiche()`: solo reconoce 'FOOD_FAST' | 'FOOD_SWEET'
 *      | 'BODEGON_MARKET', y hoy recibe SIEMPRE 'FOOD_SWEET' hardcodeado
 *      desde MerchantStoreView.tsx sin importar la tienda real.
 *
 * SOLUCIÓN: separar dos preguntas que hoy están mezcladas en un solo
 * campo:
 *
 *   - StoreNiche  → nicho de NEGOCIO (fino, 9 valores). Define hero,
 *     filtros de catálogo y badges de confianza. Ej: Pizzería y Fast
 *     Food son nichos de negocio distintos (copy/hero distinto).
 *   - ModalEngine → motor de MODAL DE PRODUCTO (grueso, 4 valores).
 *     Define qué mecánica de combo/upsell usa MasterProductModal.
 *     Pizzería y Fast Food comparten el mismo motor (combos por
 *     ranuras), por eso son 2 StoreNiche que mapean al mismo
 *     ModalEngine.
 *
 * `getModalEngine(niche)` es la única función que MerchantStoreView.tsx
 * necesita para reemplazar el `nicheEngine="FOOD_SWEET"` hardcodeado.
 *
 * NOTA sobre categorías (confirmado con los Excel maestros de 18
 * tiendas reales): existen DOS conceptos de "categoría" distintos:
 *   1. Categoría de TIENDA (`categoriesName`, ej. "Heladerías,Postres")
 *      → resuelve el StoreNiche (este archivo, `detectStoreNiche`).
 *   2. Categoría de PRODUCTO (`CATEGORIA` del Excel / `product.category`
 *      del API, ej. "LÍNEA ML", "LICORES") → es el menú interno de la
 *      tienda y también decide el age-gate por producto (ver
 *      `categoryRequiresAgeGate` más abajo). Una tienda puede tener
 *      productos de categorías ajenas a su nicho por error de carga
 *      (ver alerta de Papá Helado/Proseco) — el age-gate NUNCA se
 *      define a nivel de tienda completa por esto mismo.
 */

// ─────────────────────────────────────────────────────────────
// 1. StoreNiche — nicho de negocio (fino, para presentación)
// ─────────────────────────────────────────────────────────────

export type StoreNiche =
  | 'FOOD_SWEETS'      // Heladerías, Postres (ej. Papá Helado, Nena's Cake)
  | 'FAST_FOOD'        // Fast Food, Árabe (ej. Yuka Expres, Akram Shawarma, More Cheese)
  | 'PIZZERIA'         // Pizzerías (ej. N&H, El Peluche, Morandi)
  | 'FASHION'          // Moda y Más (ej. Bereshit Boutique)
  | 'TECH'             // Tecnología (ej. Grupo Bitmar)
  | 'SEAFOOD'          // Del Mar (ej. Miraflores Expres)
  | 'LIQUOR_GOURMET'   // Bodegones (ej. Proseco Bodegón)
  | 'MINIMARKET'       // Mini Market, Naturistas, P Limpieza (ej. El Abasto, Mundo Práctico)
  | 'PARTS_CATALOG'    // Bicicleta / repuestos técnicos (ej. Col Biker)
  | 'PHARMACY'         // Farmacia y Salud (ej. Farma D'una Megastore)
  | 'GENERIC';         // fallback seguro — no rompe nada, pierde estrategias de nicho

/**
 * Motor de modal de producto (grueso). Es el único valor que
 * `MasterProductModal.tsx` necesita recibir como prop `nicheEngine`.
 * Varios StoreNiche pueden compartir el mismo ModalEngine.
 */
export type ModalEngine = 'FOOD_FAST' | 'FOOD_SWEET' | 'BODEGON_MARKET' | 'STANDARD';

const NICHE_TO_MODAL_ENGINE: Record<StoreNiche, ModalEngine> = {
  FOOD_SWEETS: 'FOOD_SWEET',
  FAST_FOOD: 'FOOD_FAST',
  PIZZERIA: 'FOOD_FAST',        // mismo motor de combos por ranuras que Fast Food
  LIQUOR_GOURMET: 'BODEGON_MARKET',
  FASHION: 'STANDARD',          // no usa combos/slots; usa selector de talla (fuera del modal maestro)
  TECH: 'STANDARD',
  SEAFOOD: 'STANDARD',
  MINIMARKET: 'STANDARD',
  PARTS_CATALOG: 'STANDARD',
  PHARMACY: 'STANDARD',
  GENERIC: 'STANDARD',
};

export function getModalEngine(niche: StoreNiche): ModalEngine {
  return NICHE_TO_MODAL_ENGINE[niche] ?? 'STANDARD';
}

// ─────────────────────────────────────────────────────────────
// 2. Detección de nicho — por categoría real (preferido) con
//    fallback a keyword (compatibilidad con el detector viejo)
// ─────────────────────────────────────────────────────────────

/** Categorías reales del Home (`categoriesName`) que activan cada nicho */
const NICHE_CATEGORY_MATCH: Record<StoreNiche, string[]> = {
  FOOD_SWEETS: ['Heladerías', 'Postres'],
  FAST_FOOD: ['Fast Food', 'Árabe'],
  PIZZERIA: ['Pizzerías'],
  FASHION: ['Moda y Más'],
  TECH: ['Tecnología'],
  SEAFOOD: ['Del Mar'],
  LIQUOR_GOURMET: ['Bodegones'],
  MINIMARKET: ['Mini Market', 'Naturistas', 'P Limpieza'],
  PARTS_CATALOG: ['Bicicleta'],
  PHARMACY: ['Farmacia & Salud', 'Farmacia'],
  GENERIC: [],
};

/** Fallback por palabra clave en nombre/código — hereda la lógica del detector viejo */
const NICHE_KEYWORD_FALLBACK: Array<{ niche: StoreNiche; keywords: string[] }> = [
  { niche: 'FASHION', keywords: ['BOUTIQUE', 'MODA', 'ROPA'] },
  { niche: 'PIZZERIA', keywords: ['PIZZA', 'PIZZERIA', 'PELUCHE', 'N&H'] },
  { niche: 'FAST_FOOD', keywords: ['BURGER', 'SHAWARMA', 'YUKA', 'FAST'] },
  { niche: 'MINIMARKET', keywords: ['ABASTO', 'MINIMARKET', 'VIVERES', 'PRAKTICO'] },
  { niche: 'LIQUOR_GOURMET', keywords: ['BODEGON', 'PROSECO', 'LICOR'] },
  { niche: 'TECH', keywords: ['BITMAR', 'TECNOLOGIA', 'GAMING'] },
  { niche: 'SEAFOOD', keywords: ['MARISCO', 'PESCADO', 'MIRAFLORES'] },
  { niche: 'PARTS_CATALOG', keywords: ['BIKER', 'BICICLETA', 'REPUESTO'] },
  { niche: 'PHARMACY', keywords: ['FARMA', 'FARMACIA', 'DRUGSTORE'] },
];

export function detectStoreNiche(store: {
  categoriesName?: string;   // preferido: campo real del backend, ej. "Heladerías,Postres"
  categories?: string;       // legacy (código interno, ej. "HELADOS,POSTRES")
  name?: string;
  code?: string;
}): StoreNiche {
  // 1. Intento por categoría real de tienda (comma-separated, case-insensitive)
  const rawCategories = (store.categoriesName || store.categories || '')
    .split(',')
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);

  if (rawCategories.length > 0) {
    for (const [niche, matches] of Object.entries(NICHE_CATEGORY_MATCH) as [StoreNiche, string[]][]) {
      if (matches.some((m) => rawCategories.includes(m.toLowerCase()))) {
        return niche;
      }
    }
  }

  // 2. Fallback por keyword en nombre/código (para tiendas sin categoriesName cargado aún)
  const text = `${store.categories || ''} ${store.name || ''} ${store.code || ''}`.toUpperCase();
  for (const { niche, keywords } of NICHE_KEYWORD_FALLBACK) {
    if (keywords.some((kw) => text.includes(kw))) return niche;
  }

  return 'GENERIC';
}

// ─────────────────────────────────────────────────────────────
// 3. Configuración visual/UX por nicho (hero, filtros, badges)
// ─────────────────────────────────────────────────────────────

export type FilterType =
  | 'CATEGORY_TABS'
  | 'SIZE_AND_COLOR'
  | 'BRAND_AND_SUBCATEGORY'
  | 'WEIGHT_PRESENTATION'
  | 'MOOD_OCCASION'
  | 'PART_SEARCH';

export interface TrustBadge {
  icon: string;
  label: string;
  colorToken: 'cyan' | 'emerald' | 'amber' | 'slate';
}

export interface NicheConfig {
  niche: StoreNiche;
  label: string;
  heroVariant: 'PROMO_HERO' | 'STAT_HERO';
  filterType: FilterType;
  productCardVariant: 'STANDARD' | 'FASHION_SWATCH' | 'TECH_SPEC' | 'WEIGHT_TAG' | 'PART_CARD';
  trustBadges: TrustBadge[];
  cartGamification?: { enabled: boolean; thresholdLabel: string };
}

export const NICHE_CONFIGS: Record<StoreNiche, NicheConfig> = {
  FOOD_SWEETS: {
    niche: 'FOOD_SWEETS', label: 'Heladerías / Postres',
    heroVariant: 'PROMO_HERO', filterType: 'CATEGORY_TABS', productCardVariant: 'STANDARD',
    trustBadges: [
      { icon: 'fa-solid fa-snowflake', label: 'Cadena de Frío Garantizada', colorToken: 'cyan' },
      { icon: 'fa-solid fa-truck-fast', label: 'Entrega Express', colorToken: 'amber' },
    ],
    cartGamification: { enabled: true, thresholdLabel: 'Envío gratis desde $15' },
  },
  FAST_FOOD: {
    niche: 'FAST_FOOD', label: 'Fast Food / Árabe',
    heroVariant: 'PROMO_HERO', filterType: 'MOOD_OCCASION', productCardVariant: 'STANDARD',
    trustBadges: [
      { icon: 'fa-solid fa-clock', label: 'Listo en 15-25 min', colorToken: 'amber' },
      { icon: 'fa-solid fa-fire', label: 'Recién Preparado', colorToken: 'emerald' },
    ],
    cartGamification: { enabled: true, thresholdLabel: 'Envío gratis desde $12' },
  },
  PIZZERIA: {
    niche: 'PIZZERIA', label: 'Pizzerías',
    heroVariant: 'PROMO_HERO', filterType: 'MOOD_OCCASION', productCardVariant: 'STANDARD',
    trustBadges: [
      { icon: 'fa-solid fa-fire', label: 'Horneada al Momento', colorToken: 'amber' },
      { icon: 'fa-solid fa-clock', label: 'Listo en 20-30 min', colorToken: 'emerald' },
    ],
    cartGamification: { enabled: true, thresholdLabel: 'Envío gratis desde $12' },
  },
  FASHION: {
    niche: 'FASHION', label: 'Moda y Más',
    heroVariant: 'STAT_HERO', filterType: 'SIZE_AND_COLOR', productCardVariant: 'FASHION_SWATCH',
    trustBadges: [
      { icon: 'fa-solid fa-ruler', label: 'Guía de Tallas Verificada', colorToken: 'slate' },
      { icon: 'fa-solid fa-rotate-left', label: 'Cambios sin Complicaciones', colorToken: 'emerald' },
    ],
  },
  TECH: {
    niche: 'TECH', label: 'Tecnología',
    heroVariant: 'STAT_HERO', filterType: 'BRAND_AND_SUBCATEGORY', productCardVariant: 'TECH_SPEC',
    trustBadges: [
      { icon: 'fa-solid fa-shield-halved', label: 'Garantía Oficial', colorToken: 'slate' },
      { icon: 'fa-solid fa-box-open', label: 'Producto Original Sellado', colorToken: 'emerald' },
    ],
  },
  SEAFOOD: {
    niche: 'SEAFOOD', label: 'Del Mar',
    heroVariant: 'PROMO_HERO', filterType: 'WEIGHT_PRESENTATION', productCardVariant: 'WEIGHT_TAG',
    trustBadges: [
      { icon: 'fa-solid fa-fish', label: 'Frescura del Día', colorToken: 'cyan' },
      { icon: 'fa-solid fa-snowflake', label: 'Cadena de Frío', colorToken: 'cyan' },
    ],
  },
  LIQUOR_GOURMET: {
    niche: 'LIQUOR_GOURMET', label: 'Bodegones',
    heroVariant: 'STAT_HERO', filterType: 'BRAND_AND_SUBCATEGORY', productCardVariant: 'STANDARD',
    trustBadges: [
      { icon: 'fa-solid fa-award', label: 'Producto Original Importado', colorToken: 'amber' },
    ],
  },
  MINIMARKET: {
    niche: 'MINIMARKET', label: 'Mini Market / Naturistas / P. Limpieza',
    heroVariant: 'PROMO_HERO', filterType: 'MOOD_OCCASION', productCardVariant: 'STANDARD',
    trustBadges: [
      { icon: 'fa-solid fa-bolt', label: 'Entrega Inmediata', colorToken: 'amber' },
    ],
    cartGamification: { enabled: true, thresholdLabel: 'Envío gratis desde $10' },
  },
  PARTS_CATALOG: {
    niche: 'PARTS_CATALOG', label: 'Repuestos / Ferretería / Bicicletas',
    heroVariant: 'STAT_HERO', filterType: 'PART_SEARCH', productCardVariant: 'PART_CARD',
    trustBadges: [
      { icon: 'fa-solid fa-shield-halved', label: 'Repuesto Original Verificado', colorToken: 'slate' },
      { icon: 'fa-solid fa-truck-fast', label: 'Envío Rápido', colorToken: 'amber' },
    ],
  },
  PHARMACY: {
    niche: 'PHARMACY', label: 'Farmacia y Salud',
    heroVariant: 'STAT_HERO', filterType: 'BRAND_AND_SUBCATEGORY', productCardVariant: 'STANDARD',
    trustBadges: [
      { icon: 'fa-solid fa-briefcase-medical', label: 'Farmacia Verificada', colorToken: 'emerald' },
      { icon: 'fa-solid fa-clock', label: 'Entrega Prioritaria', colorToken: 'amber' },
    ],
    /**
     * FASE A (activo hoy): usa CATEGORIA/SUBCATEGORIA/NOMBRE, que ya existen.
     * FASE B (pendiente de Osvaldo — ver alerta-farmacia-campos-pendientes.md):
     *   - Filtro por Laboratorio y por Principio Activo requiere columnas nuevas
     *     en el Excel maestro (hoy vienen mezclados dentro de NOMBRE como texto).
     *   - El aviso de "venta bajo prescripción" depende de un campo TIPO_VENTA
     *     por producto que hoy no existe — ver productRequiresPrescriptionNotice()
     *     más abajo: el mecanismo ya está listo, pero devuelve `false` para todo
     *     hasta que ese campo llegue del backend. NO usar esta función como
     *     control legal real hasta confirmar con asesoría legal qué productos
     *     la requieren.
     */
  },
  GENERIC: {
    niche: 'GENERIC', label: 'Nicho no mapeado (fallback seguro)',
    heroVariant: 'PROMO_HERO', filterType: 'CATEGORY_TABS', productCardVariant: 'STANDARD',
    trustBadges: [],
  },
};

export function getNicheConfig(niche: StoreNiche): NicheConfig {
  return NICHE_CONFIGS[niche] ?? NICHE_CONFIGS.GENERIC;
}

// ─────────────────────────────────────────────────────────────
// 4. Age-gate por CATEGORÍA DE PRODUCTO (no por tienda/nicho)
// ─────────────────────────────────────────────────────────────

const AGE_RESTRICTED_CATEGORY_KEYWORDS = [
  'LICOR', 'WHISKY', 'RON ', 'RON.', 'VODKA', 'CERVEZA', 'VINO', 'CHAMPAGNE', 'TEQUILA', 'SANGRIA',
];

export function categoryRequiresAgeGate(productCategory: string | null | undefined): boolean {
  if (!productCategory) return false;
  const normalized = productCategory.trim().toUpperCase();
  return AGE_RESTRICTED_CATEGORY_KEYWORDS.some((kw) => normalized.includes(kw));
}

// ─────────────────────────────────────────────────────────────
// 5. Aviso de prescripción — MECANISMO LISTO, LISTA VACÍA A PROPÓSITO
// ─────────────────────────────────────────────────────────────

/**
 * IMPORTANTE — LEER ANTES DE TOCAR ESTA LISTA:
 * Esta lista arranca VACÍA a propósito. NO es una decisión legal de
 * Claude ni del equipo de frontend qué medicamento requiere receta —
 * eso depende de regulación sanitaria venezolana real y debe
 * confirmarse con asesoría legal / el ente regulador correspondiente
 * antes de completarse. Mientras esté vacía, la función siempre
 * devuelve `false` (no bloquea ni avisa nada), para no simular una
 * validación legal que no existe.
 *
 * Una vez que legal confirme la lista real, completar aquí por
 * PRINCIPIO ACTIVO (no por nombre comercial, para cubrir genéricos):
 * ej. ['AMOXICILINA', 'AZITROMICINA', 'LEVOFLOXACINA', ...]
 */
const PRESCRIPTION_REQUIRED_ACTIVE_INGREDIENTS: string[] = [
  // Intencionalmente vacío — ver nota arriba.
];

export function productRequiresPrescriptionNotice(
  activeIngredient: string | null | undefined
): boolean {
  if (PRESCRIPTION_REQUIRED_ACTIVE_INGREDIENTS.length === 0) return false;
  if (!activeIngredient) return false;
  const normalized = activeIngredient.trim().toUpperCase();
  return PRESCRIPTION_REQUIRED_ACTIVE_INGREDIENTS.some((kw) => normalized.includes(kw));
}

/**
 * USO ESPERADO en MerchantStoreView.tsx (reemplaza el hardcodeo actual):
 *
 *   const niche = detectStoreNiche(merchant);
 *   const nicheConfig = getNicheConfig(niche);
 *   const modalEngine = getModalEngine(niche);
 *   ...
 *   <MasterProductModal nicheEngine={modalEngine} bcvRate={tasaBcvReal} ... />
 *
 * Esto reemplaza en una sola línea el `nicheEngine="FOOD_SWEET"` y el
 * `bcvRate={827.74}` hardcodeados que hoy afectan a TODAS las tiendas.
 */
