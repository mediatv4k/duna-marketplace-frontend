'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { RefreshCw, Clock } from 'lucide-react';
import { getOrderPublic } from '@/services/marketplaceService';
import { isFinalStatus, getTrackingState } from '@/lib/orderTracking';
import { useArrivalAlert } from '@/lib/useArrivalAlert';
import OrderTimelinePanel from '@/components/OrderTimelinePanel';

const POLL_INTERVAL_MS = 9000;

// Página pública de seguimiento: destino de los links que envía el repartidor/backend por WhatsApp
// (trackingUrl: /order/{id}/timeline). Acceso libre: solo depende del orderId de la URL, sin localStorage.
export default function OrderTimelinePage() {
  const params = useParams<{ orderId: string }>();
  const rawId = params?.orderId;
  const orderId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [loading, setLoading] = useState(true);
  const [remote, setRemote] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let isMounted = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function fetchOrder(first: boolean) {
      const res = await getOrderPublic(orderId as string);
      if (!isMounted) return;
      if (res && res.code === 1 && res.data) {
        setRemote(res.data);
        setError(null);
        if (!isFinalStatus(res.data.status)) timer = setTimeout(() => fetchOrder(false), POLL_INTERVAL_MS);
      } else {
        setError(res?.message || 'No se pudo consultar el estado del pedido.');
        timer = setTimeout(() => fetchOrder(false), POLL_INTERVAL_MS);
      }
      if (first) setLoading(false);
    }

    setLoading(true);
    setRemote(null);
    setError(null);
    fetchOrder(true);

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [orderId]);

  // Alerta sonora/háptica al detectar la transición a "Llega a sitio"
  useArrivalAlert(getTrackingState(remote).phase, !!remote);

  const displayId = remote?.order_number || remote?.id || orderId || '';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-[#fe6712] px-5 py-3 text-white shrink-0">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-black tracking-tight leading-none">Orden #{displayId}</h1>
            <p className="text-[10px] text-orange-100 font-medium mt-0.5 truncate">
              {remote?.food_store ? `${remote.food_store} · ` : ''}Seguimiento de tu pedido
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto p-4">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#fe6712] animate-spin" />
            <p className="text-xs font-bold text-slate-500">Consultando tu pedido...</p>
          </div>
        ) : !remote ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-2 text-center">
            <Clock className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-bold text-slate-600">{error || 'No hay información del pedido.'}</p>
            <p className="text-[10px] text-slate-400">Reintentando automáticamente…</p>
          </div>
        ) : (
          <OrderTimelinePanel remote={remote} trackingError={error} />
        )}
      </main>

      <footer className="px-5 py-4 text-center shrink-0">
        <a href="/" className="text-[11px] font-bold text-slate-500 hover:text-[#fe6712] underline">
          Ir a D&apos;una Marketplace
        </a>
      </footer>
    </div>
  );
}
