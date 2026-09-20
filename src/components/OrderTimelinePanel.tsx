'use client';

import React, { useEffect, useState } from 'react';
import { Star, X } from 'lucide-react';
import { friendlyStatus, getTrackingState, parseCoords, toWhatsAppNumber } from '@/lib/orderTracking';
import LiveOrderMap from './LiveOrderMap';

interface OrderTimelinePanelProps {
  remote: any; // data de GET /delivery/request/{id}/public (null mientras no hay respuesta)
  trackingError?: string | null;
}

// Vista de seguimiento compartida por el modal (pestaña Estatus) y la página pública /order/[orderId]/timeline:
// código de entrega (solo al llegar), ficha compacta del repartidor, botón Google Maps y timeline descendente.
// Al entregarse muestra el cierre con calificación. La alerta sonora/háptica vive en useArrivalAlert (la llama el contenedor).
export default function OrderTimelinePanel({ remote, trackingError }: OrderTimelinePanelProps) {
  const { history: trackingHistory, phase, isFinal, deliveryCode, driverConfirmed } = getTrackingState(remote);
  const orderKey = remote?.id !== undefined && remote?.id !== null ? String(remote.id) : '';

  // Repartidor (campos reales de GET /delivery/request/{id}/public)
  const driverName = String(remote?.delivery_driver_name || '').trim();
  const driverPhoneRaw = String(remote?.delivery_driver_phone || '').trim();
  const driverWa = toWhatsAppNumber(driverPhoneRaw);
  const avatarUrl = String(remote?.delivery_avatar || '').trim();
  const vehicleDesc = [remote?.delivery_vehicle_type, remote?.delivery_vehicle_brand]
    .map((v: unknown) => String(v || '').trim()).filter(Boolean).join(' ');
  const vehicleColor = String(remote?.delivery_vehicle_color || '').trim();
  const vehiclePlate = String(remote?.delivery_vehicle_license || '').trim();
  const hasDriver = !!(driverName || driverPhoneRaw);
  const initials = driverName.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '🛵';

  // El bloque del repartidor solo existe mientras el pedido está en curso (se oculta al entregarse/cancelarse)
  const showDriver = hasDriver && !isFinal && phase !== 'delivered';
  // Chofer confirmado (DRIVER_ASSIGNED en el historial, o Entregando / Llega a sitio) → "Repartidor asignado" + WhatsApp habilitado.
  // Con datos de chofer pero sin DRIVER_ASSIGNED (p. ej. solo "Pedido en camino") es el chofer "de turno": WhatsApp deshabilitado.
  const whatsappEnabled = driverConfirmed;

  const [avatarFailed, setAvatarFailed] = useState(false);
  useEffect(() => { setAvatarFailed(false); }, [avatarUrl]);

  // Coordenadas reales del endpoint para el mapa embebido (food_store_location, customer_address, current_location)
  const storePos = parseCoords(remote?.food_store_location);
  const customerPos = parseCoords(remote?.customer_address);
  const driverPos = parseCoords(remote?.current_location);
  const hasMapPoints = !!(storePos || customerPos || driverPos);
  const [showMap, setShowMap] = useState(false);
  const mapVisible = showMap && hasMapPoints && !isFinal;

  // ---- Cierre al entregar: calificación 1–5 (servicio y comercio) ----
  const [showClosure, setShowClosure] = useState(false);
  const [serviceRating, setServiceRating] = useState(0);
  const [storeRating, setStoreRating] = useState(0);

  useEffect(() => {
    if (phase !== 'delivered' || !orderKey) return;
    try {
      // Una orden ya cerrada/calificada no vuelve a mostrar el cierre (p. ej. al reabrir el link público)
      if (!localStorage.getItem(`duna_order_closed_${orderKey}`)) setShowClosure(true);
    } catch {
      setShowClosure(true);
    }
  }, [phase, orderKey]);

  const closeOrder = (saveRating: boolean) => {
    try {
      // La calificación se guarda localmente: el backend no expone (todavía) un endpoint de calificación
      if (saveRating && (serviceRating > 0 || storeRating > 0)) {
        localStorage.setItem(`duna_order_rating_${orderKey}`, JSON.stringify({ service: serviceRating, store: storeRating, at: new Date().toISOString() }));
      }
      localStorage.setItem(`duna_order_closed_${orderKey}`, '1');
      // Limpia la orden activa (solo si es esta orden) para ocultar el FAB del Home
      const activeId = localStorage.getItem('last_active_order_id');
      if (!activeId || activeId === orderKey) {
        localStorage.removeItem('last_active_order');
        localStorage.removeItem('last_active_order_id');
      }
    } catch {
      /* sin localStorage */
    }
    window.dispatchEvent(new CustomEvent('duna:order-closed', { detail: { orderId: orderKey } }));
    setShowClosure(false);
  };

  const renderStars = (value: number, onChange: (n: number) => void, label: string) => (
    <div className="space-y-1">
      <p className="text-[11px] font-black text-slate-700">{label}</p>
      <div className="flex items-center justify-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} de 5 estrellas`} className="p-0.5 cursor-pointer">
            <Star className={`w-7 h-7 ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
      {trackingError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold p-2.5 rounded-xl">{trackingError}</div>
      )}

      {/* Código de entrega: 100% oculto hasta que el repartidor llega a sitio */}
      {phase === 'arrived' && !isFinal && (
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-3.5 text-center space-y-1 animate-pulse shadow-md shadow-amber-200/60">
          <p className="text-[13px] font-black text-amber-900 leading-tight">🔑 ¡TU REPARTIDOR ESTÁ EN LA PUERTA!</p>
          {deliveryCode && (
            <p className="text-[15px] font-black text-slate-900">
              Código de entrega: <span className="font-mono tracking-widest text-[#fe6712]">[ {deliveryCode} ]</span>
            </p>
          )}
          <p className="text-[10px] font-bold text-amber-800">Dicta este código de entrega al repartidor para recibir tu pedido.</p>
        </div>
      )}

      {showDriver && (
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
            {whatsappEnabled ? 'Repartidor asignado' : 'Repartidor de turno'}
          </h4>
          <div className="flex items-center gap-3">
            {avatarUrl && !avatarFailed ? (
              <img
                src={avatarUrl}
                alt={driverName || 'Repartidor'}
                onError={() => setAvatarFailed(true)}
                className="w-11 h-11 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-orange-100 text-[#fe6712] flex items-center justify-center text-sm font-black shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              {driverName && <p className="text-sm font-black text-slate-900 leading-tight truncate">{driverName}</p>}
              {(vehicleDesc || vehicleColor) && (
                <p className="text-[11px] text-slate-600 font-medium leading-tight truncate">{[vehicleDesc, vehicleColor].filter(Boolean).join(' · ')}</p>
              )}
              {vehiclePlate && (
                <span className="inline-block mt-0.5 text-[10px] font-black text-slate-700 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">
                  Placa {vehiclePlate}
                </span>
              )}
            </div>
          </div>
          {whatsappEnabled ? (
            driverWa && (
              <a
                href={`https://wa.me/${driverWa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] py-1.5 text-[11px] font-black text-white shadow-sm"
              >
                Escribir por WhatsApp
              </a>
            )
          ) : (
            <div className="space-y-1">
              <button
                type="button"
                disabled
                className="w-full flex items-center justify-center gap-1.5 rounded-full bg-slate-200 py-1.5 text-[11px] font-black text-slate-400 cursor-not-allowed"
              >
                Escribir por WhatsApp
              </button>
              <p className="text-[9px] text-slate-400 text-center">Contacto por WhatsApp disponible al confirmar la carrera</p>
            </div>
          )}
        </div>
      )}

      {hasMapPoints && !isFinal && !mapVisible && (
        <button
          type="button"
          onClick={() => setShowMap(true)}
          className="w-full flex items-center justify-center gap-1.5 rounded-full border border-[#fe6712] bg-white hover:bg-orange-50 py-1.5 text-[11px] font-black text-[#fe6712] cursor-pointer"
        >
          🛵 Sigue tu pedido en línea
        </button>
      )}

      {mapVisible && (
        <div className="space-y-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Sigue tu pedido en línea</h4>
            <button
              type="button"
              onClick={() => setShowMap(false)}
              className="text-[10px] font-black text-[#fe6712] bg-orange-50 border border-orange-200 rounded-full px-2.5 py-0.5 cursor-pointer"
            >
              Ver seguimiento
            </button>
          </div>
          <LiveOrderMap store={storePos} customer={customerPos} driver={driverPos} />
        </div>
      )}

      {!mapVisible && (
      <div className="space-y-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-3">Estatus del pedido</h4>
        {trackingHistory.length === 0 ? (
          <p className="text-[10px] text-slate-400">Sin movimientos registrados todavía.</p>
        ) : (
          <div className="space-y-3 relative before:absolute before:inset-y-2 before:left-3 before:w-0.5 before:bg-slate-200">
            {trackingHistory.map((h: any, hIdx: number) => {
              const isCurrent = hIdx === 0;
              const isCancel = isCurrent && String(remote?.status || '').toUpperCase() === 'CANCELLED';
              const dotClass = isCancel
                ? 'bg-red-500'
                : isCurrent && !isFinal
                  ? 'bg-[#fe6712] animate-pulse ring-4 ring-orange-100'
                  : 'bg-emerald-500';
              return (
                <div key={h.id ?? hIdx} className="flex items-start gap-3 relative">
                  <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center z-10 shrink-0 text-xs shadow-xs ${dotClass}`}>{isCancel ? '✕' : '✓'}</div>
                  <div>
                    <h5 className={`leading-none ${isCurrent ? 'text-sm font-black text-slate-900' : 'text-xs font-bold text-slate-600'}`}>
                      {friendlyStatus(h.status)}
                      {isCurrent && <span className="ml-1.5 align-middle text-[8px] font-black uppercase tracking-wide text-[#fe6712] bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full">Estado actual</span>}
                    </h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">{h.date ? new Date(h.date).toLocaleString('es-VE') : ''}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {showClosure && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-[380px] rounded-[28px] bg-white shadow-2xl border border-slate-100 p-6 text-center space-y-4">
            <button
              type="button"
              onClick={() => closeOrder(false)}
              aria-label="Cerrar"
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-14 h-14 mx-auto rounded-full bg-[#10b981] flex items-center justify-center shadow-[0_8px_30px_rgba(16,185,129,0.3)] text-white text-2xl font-black">✓</div>
            <h3 className="text-xl font-black text-slate-900 leading-tight">¡Orden entregada con éxito!</h3>
            <p className="text-[12px] text-slate-500 font-medium">Cuéntanos cómo te fue:</p>
            {renderStars(serviceRating, setServiceRating, 'Califica el servicio de entrega')}
            {renderStars(storeRating, setStoreRating, `Califica a ${remote?.food_store || 'el comercio'}`)}
            <button
              type="button"
              onClick={() => closeOrder(true)}
              className="w-full rounded-full bg-[#fe6712] hover:bg-[#e0580d] py-2 text-xs font-black text-white shadow-md cursor-pointer"
            >
              {serviceRating > 0 || storeRating > 0 ? 'Enviar calificación' : 'Cerrar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
