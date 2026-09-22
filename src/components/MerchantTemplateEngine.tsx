'use client';

import React, { useMemo, useState } from 'react';
import {
  X, Trash2, Gift, Shirt, Cpu, IceCream, ShoppingBasket, Wine, Pill, Search, ArrowRight,
} from 'lucide-react';
import MasterProductModal from './MasterProductModal';
import { getModalEngine, getNicheConfig, type StoreNiche } from '@/lib/nicheConfig';

// ─────────────────────────────────────────────────────────────────────────────
// Motor multiplantilla (layout contenedor). SOLO presentación:
//  · núcleo universal: Drawer del carrito con termómetro gamificado y MasterProductModal (sin navbar propio,
//    ver §4.1 en AGENTS.md: 2026-09-21 se eliminó la franja superior con nombre/BCV; el buscador y el isologo
//    fijo de MerchantStoreView cubren esa función);
//  · cabecera/barra de filtros específica por nicho, inyectada según la prop `niche`.
// No calcula precios ni gestiona el carrito ni llama al backend: todo llega por props (datos reales del padre) y las acciones
// salen por callbacks. El catálogo (grilla de productos) lo aporta el padre como `children`.
// ─────────────────────────────────────────────────────────────────────────────

export type TemplateNiche = 'fast-food' | 'boutique' | 'tech' | 'ice-cream' | 'minimarket' | 'bodegon' | 'farma';

// Plantilla → nicho de negocio existente (nicheConfig): de ahí salen badges de confianza, umbral gamificado y motor del modal
const TEMPLATE_TO_STORE_NICHE: Record<TemplateNiche, StoreNiche> = {
  'fast-food': 'FAST_FOOD',
  boutique: 'FASHION',
  tech: 'TECH',
  'ice-cream': 'FOOD_SWEETS',
  minimarket: 'MINIMARKET',
  bodegon: 'LIQUOR_GOURMET',
  farma: 'PHARMACY',
};

// Nicho de negocio (nicheConfig) → plantilla. GENERIC no tiene plantilla: la vista se muestra sin motor.
export function templateNicheFromStoreNiche(niche: StoreNiche): TemplateNiche | null {
  switch (niche) {
    case 'FAST_FOOD':
    case 'PIZZERIA':
    case 'SEAFOOD':
      return 'fast-food';
    case 'FOOD_SWEETS':
      return 'ice-cream';
    case 'FASHION':
      return 'boutique';
    case 'TECH':
    case 'PARTS_CATALOG':
      return 'tech';
    case 'LIQUOR_GOURMET':
      return 'bodegon';
    case 'MINIMARKET':
      return 'minimarket';
    case 'PHARMACY':
      return 'farma';
    default:
      return null;
  }
}

export interface TemplateCartItem {
  cartItemId?: string;
  code?: string;
  name?: string;
  price?: number;
  qty?: number;
  quantity?: number;
  totalPrice?: number;
  breakdown?: string[];
  [key: string]: unknown;
}

export interface MerchantTemplateEngineProps {
  niche: TemplateNiche;
  // Nicho de negocio real de la tienda. Si el padre ya lo detectó, se usa tal cual (badges, umbral y motor del modal idénticos a los actuales)
  storeNiche?: StoreNiche;
  merchantName?: string;
  storeCode?: string; // slug real de la tienda (ej. "papa-helado"), para el botón "Compartir" del modal de producto
  hero?: React.ReactNode;     // portada de la tienda (a sangre, fuera del contenedor centrado)
  children?: React.ReactNode; // catálogo del comercio (grilla), lo aporta el padre
  // Si el padre ya tiene su propio carrito (CartModal), el botón del navbar lo abre en vez del drawer interno
  onOpenCart?: () => void;
  // Escritorio con barra lateral: contenedores max-w-7xl y los chips de categoría pasan solo a móvil (el padre dibuja "Departamentos")
  desktopSidebarLayout?: boolean;
  // Oculta en escritorio toda la cinta de nicho (avisos, insignias, chips): solo cuando el padre ya la reemplaza (p. ej. farmacia)
  hideNicheHeaderDesktop?: boolean;
  // Botón "Volver" del navbar (solo escritorio): reemplaza al de la portada cuando ésta se oculta
  onBack?: () => void;

  // Navbar corporativo (valores reales; si no hay dato, la píldora no se muestra)
  bcvRate?: number | null;
  walletBalanceUSD?: number | null;

  // Filtros del catálogo (controlados por el padre). Si no se pasa `filters`, se derivan de las categorías reales de `products`
  products?: any[];
  filters?: string[];
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  onSearch?: (text: string) => void; // farma: búsqueda por principio activo / nombre

  // Acciones específicas por nicho (solo se dibuja el control si el padre entrega el handler)
  onOpenVirtualFitter?: () => void; // boutique: probador virtual
  specsMode?: boolean;              // tech: fichas técnicas
  onSpecsModeChange?: (enabled: boolean) => void;

  // Carrito (presentación; el estado vive en el padre)
  cartItems?: TemplateCartItem[];
  subtotalUSD?: number;
  freeShippingThreshold?: number; // si no viene, se toma de la config del nicho (p. ej. "Envío gratis desde $15")
  onRemoveCartItem?: (identifier: string) => void;
  onCheckout?: () => void;

  // MasterProductModal
  selectedProduct?: any | null;
  isProductModalOpen?: boolean;
  onCloseProductModal?: () => void;
  onAddToCart?: (payload: any) => void;
  productInitialQty?: number; // cantidad inicial del modal de producto (asistente)
}

// Emoji decorativo para las categorías tipo "mood" del fast-food (solo estética)
function moodEmoji(category: string): string {
  const c = category.toLowerCase();
  if (/hamburg/.test(c)) return '🍔';
  if (/perro|hot ?dog/.test(c)) return '🌭';
  if (/pizza/.test(c)) return '🍕';
  if (/bebida|refresco|jugo|batido/.test(c)) return '🥤';
  if (/postre|helado|dulce/.test(c)) return '🍰';
  if (/combo|promo/.test(c)) return '🎁';
  if (/pollo|alita/.test(c)) return '🍗';
  return '🔥';
}

function deriveFilters(products: any[] | undefined): string[] {
  const seen = new Set<string>();
  const list: string[] = [];
  (products || []).forEach((p: any) => {
    const cat = (p?.category && String(p.category).trim()) || 'Otros';
    if (!seen.has(cat)) {
      seen.add(cat);
      list.push(cat);
    }
  });
  return list;
}

// Umbral de envío gratis: "Envío gratis desde $15" → 15 (solo para el termómetro visual)
function parseThreshold(label: string | undefined): number | null {
  const match = label?.match(/\$\s*(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

export default function MerchantTemplateEngine({
  niche,
  storeNiche: storeNicheProp,
  merchantName,
  storeCode,
  hero,
  children,
  onOpenCart,
  desktopSidebarLayout = false,
  hideNicheHeaderDesktop = false,
  onBack,
  bcvRate,
  walletBalanceUSD,
  products,
  filters,
  activeFilter = 'ALL',
  onFilterChange,
  onSearch,
  onOpenVirtualFitter,
  specsMode = false,
  onSpecsModeChange,
  cartItems = [],
  subtotalUSD = 0,
  freeShippingThreshold,
  onRemoveCartItem,
  onCheckout,
  selectedProduct = null,
  isProductModalOpen = false,
  onCloseProductModal = () => {},
  onAddToCart = () => {},
  productInitialQty = 1,
}: MerchantTemplateEngineProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const storeNiche = storeNicheProp ?? TEMPLATE_TO_STORE_NICHE[niche];
  const nicheConfig = getNicheConfig(storeNiche);
  const filterList = useMemo(() => filters ?? deriveFilters(products), [filters, products]);
  const totalItems = cartItems.reduce((acc, it) => acc + Number(it.qty ?? it.quantity ?? 1), 0);
  const threshold = freeShippingThreshold ?? parseThreshold(nicheConfig.cartGamification?.thresholdLabel);
  const gamificationOn = nicheConfig.cartGamification?.enabled !== false && !!threshold && threshold > 0;
  const progress = gamificationOn && threshold ? Math.min(100, (subtotalUSD / threshold) * 100) : 0;
  const missing = gamificationOn && threshold ? Math.max(0, threshold - subtotalUSD) : 0;

  const filterChip = (value: string, label: string, emoji?: string) => (
    <button
      key={value}
      type="button"
      onClick={() => onFilterChange?.(value)}
      className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap shrink-0 transition cursor-pointer ${
        activeFilter === value ? 'bg-[#fe6712] text-white shadow-md shadow-orange-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {emoji ? `${emoji} ` : ''}{label}
    </button>
  );

  const chipsRow = (withEmoji: boolean) => filterList.length > 0 && (
    <div className={`flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 ${desktopSidebarLayout ? 'lg:hidden' : ''}`}>
      {filterChip('ALL', 'Todos', withEmoji ? '✨' : undefined)}
      {filterList.map((cat) => filterChip(cat, cat, withEmoji ? moodEmoji(cat) : undefined))}
    </div>
  );

  // ── Cabecera / barra de filtros específica del nicho ──
  const renderNicheHeader = () => {
    switch (niche) {
      case 'fast-food':
        return (
          <div className="space-y-1.5">
            <p className={`text-[10px] font-black uppercase tracking-wider text-slate-400 ${desktopSidebarLayout ? 'lg:hidden' : ''}`}>¿Qué se te antoja hoy?</p>
            {chipsRow(true)}
          </div>
        );
      case 'boutique':
        return (
          <div className="space-y-2">
            {onOpenVirtualFitter && (
              <button
                type="button"
                onClick={onOpenVirtualFitter}
                className="w-full flex items-center justify-between gap-3 rounded-2xl border border-fuchsia-200 bg-fuchsia-50/70 px-4 py-3 text-left cursor-pointer hover:bg-fuchsia-50 transition"
              >
                <span className="flex items-center gap-2 text-xs font-black text-fuchsia-800">
                  <Shirt className="w-4 h-4" /> Probador virtual
                </span>
                <span className="flex items-center gap-1 text-[10px] font-black text-fuchsia-700">Probar ahora <ArrowRight className="w-3 h-3" /></span>
              </button>
            )}
            {chipsRow(false)}
          </div>
        );
      case 'tech':
        return (
          <div className="space-y-2">
            {onSpecsModeChange && (
              <button
                type="button"
                onClick={() => onSpecsModeChange(!specsMode)}
                aria-pressed={specsMode}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition cursor-pointer ${
                  specsMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Cpu className="w-4 h-4" /> {specsMode ? 'Fichas técnicas activadas' : 'Ver fichas técnicas'}
              </button>
            )}
            {chipsRow(false)}
          </div>
        );
      case 'ice-cream':
        return (
          <div className="space-y-1.5">
            <p className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 ${desktopSidebarLayout ? 'lg:hidden' : ''}`}>
              <IceCream className="w-3.5 h-3.5" /> Elige tu formato
            </p>
            {chipsRow(false)}
          </div>
        );
      case 'minimarket':
        return (
          <div className="space-y-1.5">
            <p className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 ${desktopSidebarLayout ? 'lg:hidden' : ''}`}>
              <ShoppingBasket className="w-3.5 h-3.5" /> Pasillos
            </p>
            {chipsRow(false)}
          </div>
        );
      case 'bodegon':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-2.5 text-[11px] font-bold text-rose-800">
              <Wine className="w-4 h-4 shrink-0" /> Venta de bebidas alcohólicas solo a mayores de 18 años.
            </div>
            {chipsRow(false)}
          </div>
        );
      case 'farma':
        return (
          <div className="space-y-2">
            {onSearch && (
              <div className="relative">
                <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar medicamento o principio activo..."
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#fe6712] focus:ring-2 focus:ring-orange-100 transition"
                />
              </div>
            )}
            <p className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
              <Pill className="w-3.5 h-3.5" /> Consulta siempre a tu médico o farmacéutico antes de usar un medicamento.
            </p>
            {chipsRow(false)}
          </div>
        );
      default:
        return null;
    }
  };

  const nicheHeader = renderNicheHeader();

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Franja superior (nombre de la tienda + tasa BCV + carrito) eliminada (2026-09-21): el isologo fijo y el
          buscador de MerchantStoreView cubren "volver" y la bolsa se abre desde la barra "Productos en bolsa". */}

      {hero}

      {/* ── Cabecera / filtros específicos del nicho (sin insignias de garantía) ── */}
      {nicheHeader && (
        <div className={`${desktopSidebarLayout ? 'max-w-7xl md:px-8' : 'max-w-4xl'} ${hideNicheHeaderDesktop ? 'lg:hidden' : ''} mx-auto px-4 pt-3 pb-2 sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-sm lg:static lg:bg-transparent lg:backdrop-blur-none lg:shadow-none lg:pb-0`}>
          {nicheHeader}
        </div>
      )}

      {/* ── Catálogo del comercio (lo aporta el padre) ── */}
      <main className={desktopSidebarLayout ? 'max-w-7xl mx-auto w-full px-4 md:px-8 py-6 flex-1' : 'max-w-4xl mx-auto px-4 pt-4'}>{children}</main>

      {/* ── Núcleo universal: Drawer del carrito con termómetro gamificado ── */}
      {!onOpenCart && isCartOpen && (
        <div className="fixed inset-0 z-[140] flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}>
          <aside className="h-full w-full max-w-sm bg-white shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-sm font-black text-slate-900">Tu bolsa ({totalItems})</h2>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                aria-label="Cerrar carrito"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {gamificationOn && (
              <div className="px-5 py-3 border-b border-gray-100 shrink-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-black text-slate-800">
                    <Gift className="w-3.5 h-3.5 text-[#fe6712]" /> Recompensa D&apos;una
                  </span>
                  <span className="text-[10px] font-black text-[#fe6712]">
                    {missing === 0 ? '¡Envío gratis desbloqueado!' : `Te faltan $${missing.toFixed(2)}`}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-[#fe6712] transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[10px] font-medium text-slate-500">{nicheConfig.cartGamification?.thresholdLabel}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
              {cartItems.length === 0 ? (
                <p className="py-10 text-center text-xs font-medium text-slate-400">Tu bolsa está vacía.</p>
              ) : (
                cartItems.map((item, idx) => {
                  const qty = Number(item.qty ?? item.quantity ?? 1);
                  const line = Number(item.totalPrice ?? (item.price ?? 0) * qty);
                  const id = String(item.cartItemId || item.code || idx);
                  return (
                    <div key={id} className="flex items-start gap-2 pb-2 border-b border-gray-100 last:border-b-0">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-black text-slate-900">{qty} × {item.name}</p>
                        {item.breakdown?.[0] && <p className="truncate text-[10px] font-medium text-slate-400">{item.breakdown[0]}</p>}
                      </div>
                      <span className="shrink-0 text-xs font-black text-[#fe6712]">${line.toFixed(2)}</span>
                      {onRemoveCartItem && (
                        <button
                          type="button"
                          onClick={() => onRemoveCartItem(id)}
                          aria-label="Quitar producto"
                          className="shrink-0 text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 shrink-0 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Subtotal</span>
                <span className="text-sm font-black text-slate-900">${subtotalUSD.toFixed(2)} USD</span>
              </div>
              <button
                type="button"
                disabled={cartItems.length === 0 || !onCheckout}
                onClick={() => { setIsCartOpen(false); onCheckout?.(); }}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#fe6712] hover:bg-[#e0580d] disabled:opacity-50 disabled:cursor-not-allowed py-2.5 text-xs font-black text-white shadow-md cursor-pointer"
              >
                <span>PROCEDER AL PAGO</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Núcleo universal: modal maestro de producto (aplanado) ── */}
      {isProductModalOpen && selectedProduct && (
        <MasterProductModal
          isOpen={isProductModalOpen}
          onClose={onCloseProductModal}
          product={selectedProduct}
          nicheEngine={getModalEngine(storeNiche)}
          bcvRate={bcvRate ?? null}
          onAddToCart={onAddToCart}
          initialQty={productInitialQty}
          store={storeCode ? { name: merchantName || '', code: storeCode } : null}
        />
      )}
    </div>
  );
}
