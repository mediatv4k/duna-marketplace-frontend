'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'duna_pedido_amigos_active';
const ROOM_TTL_MS = 4 * 60 * 60 * 1000;

interface ActiveGroupOrder {
  roomId: string;
  storeSlug: string;
  storeName: string;
  productName: string;
  isHost: boolean;
  createdAt: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

function parseActiveOrder(): ActiveGroupOrder | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: ActiveGroupOrder = JSON.parse(raw);
    if (
      !parsed.roomId ||
      parsed.status !== 'ACTIVE' ||
      Date.now() - parsed.createdAt > ROOM_TTL_MS
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function PedidoAmigosFloating() {
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<ActiveGroupOrder | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const refresh = useCallback(() => {
    setOrder(parseActiveOrder());
  }, []);

  useEffect(() => {
    setMounted(true);
    refresh();

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) refresh();
    };
    window.addEventListener('storage', onStorage);
    const interval = setInterval(refresh, 3000);

    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, [refresh]);

  if (!mounted || !order) return null;

  const handleReturn = () => {
    window.location.href = `/combo/${order.roomId}`;
  };

  const handleCancelConfirm = () => {
    localStorage.removeItem(STORAGE_KEY);
    setOrder(null);
    setConfirmingCancel(false);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
    >
      <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/60 shadow-2xl rounded-2xl p-3.5">
        {confirmingCancel ? (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-300 text-center leading-relaxed">
              ¿Cancelar el pedido entre amigos?<br />
              <span className="text-slate-400 font-normal">Tus amigos perderán el enlace activo.</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmingCancel(false)}
                className="flex-1 rounded-xl border border-slate-600 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Mantener activo
              </button>
              <button
                type="button"
                onClick={handleCancelConfirm}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 py-2 text-xs font-bold text-white transition cursor-pointer"
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Beacon animado */}
            <div className="relative shrink-0 flex items-center justify-center w-8 h-8">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#fe6712] opacity-30" />
              <span className="relative inline-flex h-5 w-5 rounded-full bg-[#fe6712]" />
            </div>

            {/* Texto */}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black text-[#fe6712] uppercase tracking-widest leading-none">
                Pedido entre amigos activo
              </p>
              <p className="text-xs font-bold text-white truncate mt-0.5">{order.productName}</p>
              {order.storeName && (
                <p className="text-[10px] text-slate-400 font-medium truncate">{order.storeName}</p>
              )}
            </div>

            {/* Botones */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleReturn}
                className="flex items-center gap-1 rounded-xl bg-[#fe6712] hover:bg-[#e0580d] px-3 py-2 text-[11px] font-black text-white transition active:scale-95 cursor-pointer"
              >
                Volver
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => setConfirmingCancel(true)}
                aria-label="Cerrar pedido entre amigos"
                className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 transition cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
