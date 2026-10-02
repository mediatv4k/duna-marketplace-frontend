'use client';

import React, { useEffect, useState } from 'react';
import { ChevronRight, Heart, Loader2, Package } from 'lucide-react';
import { PanelShell } from '@/components/AccountModals';
import { useWishlist } from '@/context/WishlistContext';
import { lookupProduct } from '@/services/marketplaceService';
import { isProductSoldOut } from '@/lib/productStock';
import { getOptimizedImageUrl } from '@/lib/imageOptimizer';
import type { WishlistItem } from '@/lib/wishlist';

// "Mis Favoritos" (menú de la cuenta): los productos que el cliente marcó con el corazón, el más reciente arriba.
// De cada favorito se guarda solo su identidad (producto y tienda); el precio y la disponibilidad se consultan EN VIVO al abrir el
// panel (`GET /product/{id}/web`), así nunca se muestra un precio viejo ni se ofrece como disponible algo agotado o retirado.
// Cada favorito lleva a su ficha por la ruta de siempre (`/store/{tienda}/product/{id}`).

const PAGE_SIZE = 12; // favoritos visibles (y consultados) por tanda
const LOOKUP_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 60_000;

type Live =
  | { state: 'ok'; price: number; soldOut: boolean; storeCode: string }
  | { state: 'gone' } // el backend dice que el producto ya no existe
  | { state: 'error' }; // no se pudo consultar: no se afirma nada

// Caché de la sesión: reabrir el panel enseguida no repite las consultas
const liveCache = new Map<string, { at: number; info: Live }>();

async function readLive(item: WishlistItem): Promise<Live> {
  const result = await lookupProduct(item.productId, LOOKUP_TIMEOUT_MS);
  if (result.kind === 'gone') return { state: 'gone' };
  if (result.kind === 'error') return { state: 'error' };
  const raw = result.raw;
  const priceMeta = raw?.metadata?.price;
  // El mismo precio que muestra la tarjeta del catálogo: basePrice o, si viene nulo, infoPrice
  const price = Number(priceMeta?.basePrice ?? priceMeta?.infoPrice ?? raw?.price ?? 0);
  return {
    state: 'ok',
    price: Number.isFinite(price) && price > 0 ? price : 0,
    soldOut: isProductSoldOut(raw),
    storeCode: typeof raw?.storeCode === 'string' && raw.storeCode.trim() ? raw.storeCode.trim() : item.storeCode,
  };
}

function FavoriteRow({ item, live, onRemove }: { item: WishlistItem; live: Live | undefined; onRemove: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  const gone = live?.state === 'gone';
  const storeCode = live?.state === 'ok' ? live.storeCode : item.storeCode;
  const href = `/store/${encodeURIComponent(storeCode)}/product/${encodeURIComponent(item.productId)}`;

  const body = (
    <>
      <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white">
        {item.image && !imageFailed ? (
          <img src={getOptimizedImageUrl(item.image, 'PRODUCT')} alt="" loading="lazy" onError={() => setImageFailed(true)} className="h-full w-full object-contain" />
        ) : (
          <Package className="h-5 w-5 text-slate-300" aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 block text-xs font-black leading-snug text-slate-800">{item.name}</span>
        {item.storeName && <span className="mt-0.5 block truncate text-[11px] font-semibold text-slate-500">{item.storeName}</span>}
        <span className="mt-1 flex min-h-[18px] items-center gap-1.5" data-testid="favorite-live">
          {!live && <Loader2 className="h-3 w-3 animate-spin text-slate-300" aria-label="Consultando disponibilidad" />}
          {live?.state === 'ok' && live.price > 0 && <span className="text-xs font-black text-slate-900">${live.price.toFixed(2)}</span>}
          {live?.state === 'ok' && live.soldOut && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-rose-600">Agotado</span>}
          {gone && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-500">Ya no está disponible</span>}
        </span>
      </span>
    </>
  );

  return (
    <li data-testid="favorite-row" data-product-id={item.productId} className="flex items-center gap-1.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-2">
      {gone ? (
        <div className="flex min-w-0 flex-1 items-center gap-3 opacity-70">{body}</div>
      ) : (
        <a href={href} aria-label={`Ver ${item.name}`} className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl transition hover:bg-white">
          {body}
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-[#fe6712]" aria-hidden="true" />
        </a>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar ${item.name} de tus favoritos`}
        title="Quitar de favoritos"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-rose-500 transition hover:bg-rose-50 cursor-pointer"
      >
        <Heart className="h-4 w-4 fill-rose-500" aria-hidden="true" />
      </button>
    </li>
  );
}

function FavoritesBody({ onClose }: { onClose: () => void }) {
  const { items, removeFavorite } = useWishlist();
  const [shown, setShown] = useState(PAGE_SIZE);
  const [live, setLive] = useState<Record<string, Live>>({});

  const visible = items.slice(0, shown);
  const visibleKey = visible.map((i) => i.productId).join(',');

  // Precio y disponibilidad en vivo de los favoritos a la vista (4 consultas a la vez). Un fallo de red deja la fila sin dato: no se inventa.
  useEffect(() => {
    let cancelled = false;
    const now = Date.now();
    const fresh: Record<string, Live> = {};
    const queue: WishlistItem[] = [];
    for (const item of visible) {
      const cached = liveCache.get(item.productId);
      if (cached && now - cached.at < CACHE_TTL_MS && cached.info.state !== 'error') fresh[item.productId] = cached.info;
      else queue.push(item);
    }
    if (Object.keys(fresh).length > 0) setLive((prev) => ({ ...prev, ...fresh }));
    const worker = async () => {
      for (let item = queue.shift(); item && !cancelled; item = queue.shift()) {
        const info = await readLive(item).catch((): Live => ({ state: 'error' }));
        liveCache.set(item.productId, { at: Date.now(), info });
        if (cancelled) return;
        const id = item.productId;
        setLive((prev) => ({ ...prev, [id]: info }));
      }
    };
    for (let i = 0; i < 4; i++) void worker();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleKey]);

  return (
    <PanelShell title="Mis Favoritos" icon={<Heart className="h-5 w-5" />} onClose={onClose} wide>
      {items.length === 0 ? (
        <div data-testid="favorites-empty" className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
          <Heart className="mx-auto h-6 w-6 text-slate-300" aria-hidden="true" />
          <p className="mt-2 text-sm font-bold text-slate-700">Aún no tienes favoritos.</p>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">Toca el corazón de cualquier producto y lo encontrarás aquí cuando vuelvas.</p>
        </div>
      ) : (
        <>
          <ul className="space-y-2" aria-label="Productos favoritos">
            {visible.map((item) => (
              <FavoriteRow key={item.productId} item={item} live={live[item.productId]} onRemove={() => removeFavorite(item.productId)} />
            ))}
          </ul>
          {items.length > shown && (
            <button type="button" onClick={() => setShown((n) => n + PAGE_SIZE)} className="mt-3 h-10 w-full rounded-xl border border-slate-200 text-xs font-black text-slate-600 transition hover:border-[#fe6712]/50 hover:text-[#fe6712] cursor-pointer">
              Ver más ({items.length - shown})
            </button>
          )}
        </>
      )}
      <p className="mt-4 text-center text-[11px] font-medium text-slate-400">Tus favoritos se guardan en tu cuenta, en este dispositivo.</p>
    </PanelShell>
  );
}

/** Panel "Mis Favoritos" del menú de la cuenta. */
export default function FavoritesModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return <FavoritesBody onClose={onClose} />;
}
