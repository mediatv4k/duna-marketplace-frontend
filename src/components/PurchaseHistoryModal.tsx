'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, ExternalLink, Loader2, RotateCcw, ShoppingBag } from 'lucide-react';
import { PanelShell } from '@/components/AccountModals';
import { useAuth } from '@/context/AuthContext';
import { getOrderPublic, lookupProduct } from '@/services/marketplaceService';
import { getPurchaseHistory, purchaseStatusOf, type PurchaseRecord, type PurchaseStatusKind } from '@/lib/purchaseHistory';
import { lineQty, prepareReorder, reorderSkipText, type ReorderLineOutcome, type ReorderPlan } from '@/lib/reorder';
import { peekCart } from '@/lib/cartStorage';

// "Mis Últimas Compras" (menú de la cuenta): los pedidos de la cuenta, del más reciente al más antiguo, con "Volver a pedir".
//
// Datos (regla de oro 3, sin nada inventado):
//   · La lista sale del registro de la cuenta (src/lib/purchaseHistory.ts): cada pedido se anotó cuando el backend lo confirmó.
//   · El ESTADO, el número de orden y la fecha oficial de cada pedido se consultan en vivo (`GET /delivery/request/{id}/public`).
//   · "Volver a pedir" NO copia el pedido viejo: revisa cada producto contra el catálogo de hoy (`GET /product/{id}/web`, ver
//     src/lib/reorder.ts). Si todo sigue igual, el pedido entra al carrito con UN toque; si algo cambió (precio, agotado, opción
//     retirada, carrito de otra tienda) se le muestra al cliente ANTES de tocar su carrito, y decide.

const STATUS_TIMEOUT_MS = 10_000;
const LOOKUP_TIMEOUT_MS = 10_000;
const money = (n: number) => `$${(Number.isFinite(n) ? n : 0).toFixed(2)}`;

type RemoteOrder = { state: 'ok'; data: any } | { state: 'error' };

type Review =
  | { phase: 'review'; record: PurchaseRecord; plan: ReorderPlan; replaces: { storeName: string; count: number } | null }
  | { phase: 'error'; record: PurchaseRecord; message: string };

interface PurchaseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Tiendas reales del Home (`GET /store/find`): para saber si el comercio del pedido sigue en D'una. */
  stores: any[];
  /** El listado de tiendas aún está cargando. */
  storesLoading: boolean;
  /** ¿La tienda está abierta ahora? (mismo criterio del Home). Sin la función no se muestra el aviso de "cerrada". */
  isStoreOpenNow?: (store: any) => boolean;
  /** Abre la tienda del pedido con esas líneas (ya verificadas contra el catálogo de hoy) sumadas al carrito. */
  onReorder: (record: PurchaseRecord, lines: any[]) => void;
}

const STATUS_STYLE: Record<PurchaseStatusKind, string> = {
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
  active: 'bg-amber-50 text-amber-700 border-amber-200',
};

function formatDate(value: unknown): string {
  const date = new Date(value as string | number);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatusChip({ remote }: { remote: RemoteOrder | undefined }) {
  if (!remote) return <span data-testid="purchase-status" data-status="loading" className="h-5 w-20 shrink-0 animate-pulse rounded-full bg-slate-100" aria-label="Consultando el estado del pedido" />;
  if (remote.state === 'error') {
    return <span data-testid="purchase-status" data-status="unknown" className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-400">Estado no disponible</span>;
  }
  const status = purchaseStatusOf(remote.data);
  return (
    <span data-testid="purchase-status" data-status={status.kind} className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${STATUS_STYLE[status.kind]}`}>
      {status.kind === 'active' && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />}
      {status.label}
    </span>
  );
}

function PurchaseHistoryBody({ onClose, stores, storesLoading, isStoreOpenNow, onReorder }: Omit<PurchaseHistoryModalProps, 'isOpen'>) {
  const { user } = useAuth();
  const uid = user?.uid ?? '';
  const [records, setRecords] = useState<PurchaseRecord[]>([]);
  const [remote, setRemote] = useState<Record<string, RemoteOrder>>({});
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const busyRef = useRef(false);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    setRecords(uid ? getPurchaseHistory(uid) : []);
  }, [uid]);

  // Estado real de cada pedido (4 consultas a la vez). Si una falla, ese pedido dice "Estado no disponible": no se inventa uno.
  const recordsKey = records.map((r) => r.orderId).join(',');
  useEffect(() => {
    if (records.length === 0) return;
    let cancelled = false;
    const queue = [...records];
    const worker = async () => {
      for (let record = queue.shift(); record && !cancelled; record = queue.shift()) {
        const id = record.orderId;
        let result: RemoteOrder = { state: 'error' };
        try {
          const res = await getOrderPublic(id, STATUS_TIMEOUT_MS);
          if (res && res.code === 1 && res.data && typeof res.data === 'object') result = { state: 'ok', data: res.data };
        } catch {
          /* sin estado para este pedido */
        }
        if (cancelled) return;
        setRemote((prev) => ({ ...prev, [id]: result }));
      }
    };
    for (let i = 0; i < 4; i++) void worker();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordsKey]);

  const storeOf = (storeId: string) => stores.find((s: any) => String(s?.id) === storeId);

  const startReorder = async (record: PurchaseRecord) => {
    if (busyRef.current) return; // doble toque
    const store = storeOf(record.storeId);
    if (!store) {
      setReview({
        phase: 'error',
        record,
        message: storesLoading ? 'Aún estamos cargando las tiendas. Inténtalo de nuevo en un momento.' : `${record.storeName} ya no está disponible en D'una, así que este pedido no se puede repetir.`,
      });
      return;
    }
    busyRef.current = true;
    setCheckingId(record.orderId);
    try {
      const plan = await prepareReorder(record.items, (id) => lookupProduct(id, LOOKUP_TIMEOUT_MS), { storeCode: String(store.code || record.storeCode || '') });
      if (!aliveRef.current) return;
      // El carrito es de UNA tienda: si hay uno de otro comercio, volver a pedir lo reemplaza (se avisa antes)
      const cart = peekCart();
      const replaces = cart && cart.storeId !== record.storeId ? { storeName: String(storeOf(cart.storeId)?.name || 'otra tienda'), count: cart.count } : null;
      if (plan.lines.length > 0 && plan.skipped.length === 0 && plan.priceChanged.length === 0 && !replaces) {
        onReorder(record, plan.lines); // nada cambió: un toque y al carrito
        return;
      }
      setReview({ phase: 'review', record, plan, replaces });
    } catch {
      if (aliveRef.current) setReview({ phase: 'error', record, message: 'No pudimos verificar tu pedido. Revisa tu conexión e inténtalo de nuevo.' });
    } finally {
      busyRef.current = false;
      if (aliveRef.current) setCheckingId(null);
    }
  };

  const productHref = (record: PurchaseRecord, outcome: ReorderLineOutcome) => {
    const code = String(storeOf(record.storeId)?.code || record.storeCode || '');
    const id = Number(outcome.original?.id);
    return code && Number.isFinite(id) && id > 0 ? `/store/${encodeURIComponent(code)}/product/${id}` : null;
  };

  // ── Revisión previa: algo cambió desde ese pedido ────────────────────────────────────────────────────────────────────
  if (review) {
    const { record } = review;
    const plan = review.phase === 'review' ? review.plan : null;
    const ready = plan ? plan.outcomes.filter((o) => o.status === 'ready') : [];
    const units = ready.reduce((n, o) => n + o.qty, 0);
    return (
      <PanelShell title="Volver a pedir" icon={<RotateCcw className="h-5 w-5" />} onClose={onClose} wide>
        <div data-testid="reorder-review">
          <button type="button" onClick={() => setReview(null)} className="mb-3 flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-slate-800 cursor-pointer">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Volver a mis compras
          </button>
          <p className="text-sm font-black text-slate-900">Tu pedido de {record.storeName}</p>

          {review.phase === 'error' && (
            <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold leading-snug text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> <span>{review.message}</span>
            </p>
          )}

          {plan && ready.length === 0 && (
            <p role="alert" data-testid="reorder-none" className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold leading-snug text-slate-700">
              Ningún producto de este pedido se puede agregar ahora.
            </p>
          )}

          {plan && ready.length > 0 && (
            <section className="mt-3" aria-label="Productos que se agregarán">
              <h3 className="text-[11px] font-black uppercase tracking-wide text-slate-500">Se agregarán a tu carrito</h3>
              <ul className="mt-1.5 space-y-1.5">
                {ready.map((o, i) => (
                  <li key={i} data-testid="reorder-ready" className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                    <div className="flex items-start justify-between gap-3">
                      <span className="min-w-0 text-xs font-bold leading-snug text-slate-800">{o.qty}× {o.name}</span>
                      <span className="shrink-0 text-xs font-black text-slate-900">{money(Number(o.line?.totalPrice))}</span>
                    </div>
                    {o.priceChanged && (
                      <p data-testid="reorder-price-change" className="mt-1 text-[11px] font-bold text-amber-700">
                        Cambió de precio: antes {money(o.priceChanged.before)}, ahora {money(o.priceChanged.after)} c/u.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {plan && plan.skipped.length > 0 && (
            <section className="mt-3" aria-label="Productos que no se pueden agregar">
              <h3 className="text-[11px] font-black uppercase tracking-wide text-slate-500">No se pueden agregar</h3>
              <ul className="mt-1.5 space-y-1.5">
                {plan.skipped.map((o, i) => {
                  // El producto sigue existiendo pero hay que elegir sus opciones: enlace directo a su ficha
                  const href = o.reason === 'needsConfiguration' || o.reason === 'optionUnavailable' ? productHref(record, o) : null;
                  return (
                    <li key={i} data-testid="reorder-skipped" data-reason={o.reason} className="rounded-xl border border-slate-100 bg-white px-3 py-2">
                      <p className="text-xs font-bold leading-snug text-slate-500 line-through decoration-slate-300">{o.qty}× {o.name}</p>
                      <p className="mt-0.5 text-[11px] font-semibold leading-snug text-slate-600">{reorderSkipText(o)}</p>
                      {href && (
                        <a href={href} className="mt-1 inline-flex items-center gap-1 text-[11px] font-black text-[#fe6712] hover:underline">
                          Abrir su ficha <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {review.phase === 'review' && review.replaces && ready.length > 0 && (
            <p data-testid="reorder-replaces" className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] font-bold leading-snug text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Tienes {review.replaces.count === 1 ? '1 producto' : `${review.replaces.count} productos`} de {review.replaces.storeName} en tu carrito. Al continuar se reemplazarán por este pedido.
              </span>
            </p>
          )}

          <div className="mt-4 space-y-2">
            {plan && ready.length > 0 && (
              <button
                type="button"
                data-testid="reorder-confirm"
                onClick={() => onReorder(record, plan.lines)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FE6712] text-sm font-black text-white shadow-md shadow-orange-500/25 transition hover:bg-[#e0580d] active:scale-[0.99] cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                Agregar {units === 1 ? '1 producto' : `${units} productos`} · {money(plan.totalNow)}
              </button>
            )}
            {(review.phase === 'error' || plan?.networkError) && (
              <button
                type="button"
                data-testid="reorder-retry"
                disabled={checkingId !== null}
                onClick={() => { setReview(null); void startReorder(record); }}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#fe6712] text-sm font-black text-[#fe6712] transition hover:bg-[#fff5ed] disabled:opacity-60 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reintentar
              </button>
            )}
            <button type="button" onClick={() => setReview(null)} className="h-10 w-full rounded-xl text-sm font-bold text-slate-500 transition hover:text-slate-800 cursor-pointer">
              {plan && ready.length > 0 ? 'Cancelar' : 'Volver'}
            </button>
          </div>
        </div>
      </PanelShell>
    );
  }

  // ── Lista de compras ─────────────────────────────────────────────────────────────────────────────────────────────────
  return (
    <PanelShell title="Mis Últimas Compras" icon={<ShoppingBag className="h-5 w-5" />} onClose={onClose} wide>
      {records.length === 0 ? (
        <div data-testid="purchases-empty" className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
          <ShoppingBag className="mx-auto h-6 w-6 text-slate-300" aria-hidden="true" />
          <p className="mt-2 text-sm font-bold text-slate-700">Aún no tienes compras con esta cuenta.</p>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">Cuando hagas un pedido con tu sesión iniciada aparecerá aquí, listo para repetirlo con un toque.</p>
        </div>
      ) : (
        <ul className="space-y-2.5" aria-label="Pedidos anteriores">
          {records.map((record) => {
            const info = remote[record.orderId];
            const data = info?.state === 'ok' ? info.data : null;
            const orderNumber = data?.order_number !== undefined && data?.order_number !== null ? String(data.order_number).trim() : '';
            const date = formatDate(data?.created_at ?? record.createdAt) || formatDate(record.createdAt);
            const store = storeOf(record.storeId);
            const closedNow = Boolean(store && isStoreOpenNow && !isStoreOpenNow(store));
            const checking = checkingId === record.orderId;
            const shownItems = record.items.slice(0, 3);
            return (
              <li key={record.orderId} data-testid="purchase-row" data-order-id={record.orderId} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">{record.storeName}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                      {/* El número visible es el correlativo comercial (`order_number`); el id primario nunca se muestra como número de pedido */}
                      {orderNumber ? `Pedido N° ${orderNumber}` : 'Pedido'}{date ? ` · ${date}` : ''}
                    </p>
                  </div>
                  <StatusChip remote={info} />
                </div>

                <ul className="mt-2 space-y-0.5">
                  {shownItems.map((item, i) => (
                    <li key={i} className="truncate text-xs font-semibold text-slate-700">{lineQty(item)}× {item.name}</li>
                  ))}
                  {record.items.length > shownItems.length && (
                    <li className="text-[11px] font-bold text-slate-400">+{record.items.length - shownItems.length} más</li>
                  )}
                </ul>

                <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-200/70 pt-2.5">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Total pagado</p>
                    <p className="text-sm font-black text-slate-900">{money(record.totalUSD)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <a
                      href={`/order/${encodeURIComponent(record.orderId)}/timeline`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 items-center rounded-full px-2.5 text-[11px] font-black text-slate-500 transition hover:text-[#fe6712]"
                    >
                      Seguimiento
                    </a>
                    <button
                      type="button"
                      data-testid="reorder-button"
                      disabled={checkingId !== null}
                      onClick={() => void startReorder(record)}
                      className="flex h-9 items-center gap-1.5 rounded-full bg-[#FE6712] px-3.5 text-xs font-black text-white shadow-sm transition hover:bg-[#e0580d] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                      {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />}
                      {checking ? 'Verificando…' : 'Volver a pedir'}
                    </button>
                  </div>
                </div>
                {closedNow && (
                  <p data-testid="purchase-closed" className="mt-2 text-[11px] font-bold text-slate-500">La tienda está cerrada ahora: puedes armar el carrito y pagar cuando abra.</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-4 text-center text-[11px] font-medium leading-relaxed text-slate-400">
        Aquí aparecen los pedidos hechos con tu sesión iniciada en este dispositivo. Antes de repetir uno verificamos precios y disponibilidad de hoy.
      </p>
    </PanelShell>
  );
}

/** Panel "Mis Últimas Compras" del menú de la cuenta. */
export default function PurchaseHistoryModal({ isOpen, ...rest }: PurchaseHistoryModalProps) {
  if (!isOpen) return null;
  return <PurchaseHistoryBody {...rest} />;
}
