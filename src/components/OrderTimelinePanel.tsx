'use client';

import React from 'react';
import { MapPin, Bike } from 'lucide-react';
import { friendlyStatus, isFinalStatus, parseCoords, toWhatsAppNumber } from '@/lib/orderTracking';

interface OrderTimelinePanelProps {
  remote: any; // data de GET /delivery/request/{id}/public (null mientras no hay respuesta)
  trackingError?: string | null;
  displayClient: string;
  displayAddress: string;
}

// Vista de seguimiento compartida por el modal (pestaña Estatus) y la página pública /order/[orderId]/timeline:
// cliente + estado actual, ficha del repartidor, botón Google Maps y timeline descendente.
export default function OrderTimelinePanel({ remote, trackingError, displayClient, displayAddress }: OrderTimelinePanelProps) {
  // Timeline descendente: el evento más reciente arriba (empate de fecha → id mayor primero)
  const trackingHistory: any[] = Array.isArray(remote?.history)
    ? [...remote.history].sort((x: any, y: any) =>
        (new Date(y.date).getTime() - new Date(x.date).getTime()) || (Number(y.id || 0) - Number(x.id || 0)))
    : [];
  const remoteStatusUpper = String(remote?.status || '').toUpperCase();
  const isFinal = isFinalStatus(remoteStatusUpper);

  // Repartidor (campos reales de GET /delivery/request/{id}/public)
  const driverName = String(remote?.delivery_driver_name || '').trim();
  const driverPhoneRaw = String(remote?.delivery_driver_phone || '').trim();
  const driverWa = toWhatsAppNumber(driverPhoneRaw);
  const vehicleDesc = [remote?.delivery_vehicle_type, remote?.delivery_vehicle_brand, remote?.delivery_vehicle_color]
    .map((v: unknown) => String(v || '').trim()).filter(Boolean).join(' · ');
  const vehiclePlate = String(remote?.delivery_vehicle_license || '').trim();
  const hasDriver = !!(driverName || driverPhoneRaw);

  // Google Maps: posición viva del repartidor; si no viene, coordenadas o texto de la dirección de entrega
  const driverPos = parseCoords(remote?.current_location);
  const customerPos = parseCoords(remote?.customer_address);
  const customerText = String(remote?.customer_address_text || '').trim();
  const mapsUrl = driverPos
    ? `https://www.google.com/maps?q=${driverPos.lat},${driverPos.lng}`
    : customerPos
      ? `https://www.google.com/maps?q=${customerPos.lat},${customerPos.lng}`
      : customerText
        ? `https://www.google.com/maps?q=${encodeURIComponent(customerText)}`
        : null;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      {trackingError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold p-2.5 rounded-xl">{trackingError}</div>
      )}
      <div className="bg-orange-50/70 border border-orange-200/60 p-4 rounded-2xl space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Cliente</span>
          {remote && (
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 ${remoteStatusUpper === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
              {!isFinal && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
              {trackingHistory.length > 0 ? friendlyStatus(trackingHistory[0].status) : friendlyStatus(remote.status)}
            </span>
          )}
        </div>
        <h3 className="text-base font-black text-slate-900 leading-tight">{displayClient}</h3>
        <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#fe6712] shrink-0" />
          <span className="truncate">{displayAddress}</span>
        </p>
      </div>

      {hasDriver && (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <Bike className="w-4 h-4 text-[#fe6712]" /> Tu repartidor
          </h4>
          {driverName && <p className="text-sm font-black text-slate-900 leading-tight">{driverName}</p>}
          {driverPhoneRaw && <p className="text-[11px] text-slate-600 font-medium">Teléfono: {driverPhoneRaw}</p>}
          {(vehicleDesc || vehiclePlate) && (
            <p className="text-[11px] text-slate-600 font-medium">
              Vehículo: {vehicleDesc}{vehicleDesc && vehiclePlate ? ' · ' : ''}{vehiclePlate && <span>Placa <strong>{vehiclePlate}</strong></span>}
            </p>
          )}
          {driverWa && (
            <a
              href={`https://wa.me/${driverWa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] py-1.5 text-[11px] font-black text-white shadow-sm"
            >
              Escribir al repartidor por WhatsApp
            </a>
          )}
        </div>
      )}

      {mapsUrl && (
        <div className="space-y-1">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1.5 rounded-full border border-[#fe6712] bg-white hover:bg-orange-50 py-1.5 text-[11px] font-black text-[#fe6712]"
          >
            📍 Ver en Google Maps
          </a>
          {!driverPos && (
            <p className="text-[9px] text-slate-400 text-center">Aún no hay posición del repartidor: se abrirá la dirección de entrega.</p>
          )}
        </div>
      )}

      <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-4">Estatus del pedido</h4>
        {trackingHistory.length === 0 ? (
          <p className="text-[10px] text-slate-400">Sin movimientos registrados todavía.</p>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-y-2 before:left-3 before:w-0.5 before:bg-slate-200">
            {trackingHistory.map((h: any, hIdx: number) => {
              const isCurrent = hIdx === 0;
              const isCancel = isCurrent && remoteStatusUpper === 'CANCELLED';
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
    </div>
  );
}
