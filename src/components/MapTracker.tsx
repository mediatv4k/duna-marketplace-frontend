'use client';

import React from 'react';
import { Store, User, Bike, Navigation, MapPin, ShieldAlert, CheckCircle2 } from 'lucide-react';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address?: string;
}

export type OrderTrackingStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface MapTrackerProps {
  storeLocation: LocationCoordinates;
  customerLocation: LocationCoordinates;
  driverLocation?: LocationCoordinates;
  status: OrderTrackingStatus;
  estimatedTimeMin?: number;
  className?: string;
}

const statusConfig: Record<
  OrderTrackingStatus,
  { label: string; badgeColor: string; description: string; progress: number }
> = {
  PENDING: {
    label: 'Orden Confirmada',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-200',
    description: 'Esperando confirmación del comercio',
    progress: 15,
  },
  ACCEPTED: {
    label: 'Aceptado por Comercio',
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-200',
    description: 'El comercio ha aceptado tu pedido',
    progress: 30,
  },
  PREPARING: {
    label: 'En Preparación',
    badgeColor: 'bg-orange-500/10 text-[#fe6712] border-orange-200',
    description: 'Cocinando/empaquetando tus artículos',
    progress: 50,
  },
  DISPATCHED: {
    label: 'En Camino (GPS Activo)',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    description: 'El repartidor va rumbo a tu dirección',
    progress: 80,
  },
  DELIVERED: {
    label: 'Entregado',
    badgeColor: 'bg-emerald-600 text-white border-emerald-600',
    description: '¡Pedido entregado con éxito!',
    progress: 100,
  },
  CANCELLED: {
    label: 'Cancelado',
    badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-200',
    description: 'La orden ha sido cancelada',
    progress: 0,
  },
};

/**
 * Calcula posiciones relativas % dentro del contenedor simulated map
 * basándose en min/max lat/lng de las 3 coordenadas para posicionar de forma
 * proporcional los marcadores visuales.
 */
function calculateRelativePosition(
  target: LocationCoordinates,
  allCoords: LocationCoordinates[]
) {
  const lats = allCoords.map((c) => c.lat);
  const lngs = allCoords.map((c) => c.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Evitar división por cero si todas las coords son idénticas
  const latSpan = maxLat - minLat || 0.01;
  const lngSpan = maxLng - minLng || 0.01;

  // Mapeamos lng -> x (15% a 85%), lat -> y (15% a 85% invertido por coordinadas Y en pantalla)
  const x = 15 + ((target.lng - minLng) / lngSpan) * 70;
  const y = 85 - ((target.lat - minLat) / latSpan) * 70;

  return {
    left: `${Math.min(88, Math.max(12, x))}%`,
    top: `${Math.min(88, Math.max(12, y))}%`,
  };
}

export default function MapTracker({
  storeLocation,
  customerLocation,
  driverLocation,
  status,
  estimatedTimeMin = 20,
  className = '',
}: MapTrackerProps) {
  const currentStatus = statusConfig[status] || statusConfig.PENDING;

  // Colección de ubicaciones activas
  const activeLocations: LocationCoordinates[] = [storeLocation, customerLocation];
  if (driverLocation) {
    activeLocations.push(driverLocation);
  }

  const storePos = calculateRelativePosition(storeLocation, activeLocations);
  const customerPos = calculateRelativePosition(customerLocation, activeLocations);
  const driverPos = driverLocation
    ? calculateRelativePosition(driverLocation, activeLocations)
    : null;

  return (
    <div
      className={`w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden flex flex-col font-sans ${className}`}
    >
      {/* HEADER DE ESTADO */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#fe6712] flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm sm:text-base tracking-tight">Rastreo GPS en Tiempo Real</h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">{currentStatus.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span
            className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-xs ${currentStatus.badgeColor}`}
          >
            {currentStatus.label}
          </span>
        </div>
      </div>

      {/* BARRA DE PROGRESO */}
      <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#fe6712] to-emerald-500 h-full transition-all duration-700 ease-out"
          style={{ width: `${currentStatus.progress}%` }}
        />
      </div>

      {/* SIMULADOR DE MAPA INTERACTIVO CON TAILWIND */}
      <div className="relative w-full h-72 sm:h-80 bg-slate-100 overflow-hidden select-none bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
        {/* Fondo estilizado imitando rejillas y bloques urbanos */}
        <div className="absolute inset-0 bg-slate-100/60" />

        {/* Bloques de simulación urbana */}
        <div className="absolute top-6 left-8 w-28 h-20 bg-slate-200/50 rounded-xl border border-slate-300/40" />
        <div className="absolute top-10 right-12 w-36 h-24 bg-slate-200/50 rounded-2xl border border-slate-300/40" />
        <div className="absolute bottom-8 left-16 w-40 h-16 bg-slate-200/50 rounded-xl border border-slate-300/40" />
        <div className="absolute bottom-12 right-20 w-24 h-28 bg-slate-200/50 rounded-2xl border border-slate-300/40" />

        {/* Red Vial Simulada (Calles/Avenidas en Map) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-300/80" strokeWidth="6" strokeLinecap="round">
          <path d="M 0 120 Q 150 140, 300 100 T 600 180" fill="none" strokeDasharray="4 4" />
          <path d="M 100 0 Q 180 150, 220 300" fill="none" />
          <path d="M 320 0 Q 280 200, 450 320" fill="none" />
        </svg>

        {/* LÍNEA DE RUTA VECTORIAL ENTRE PUNTOS */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line
            x1={storePos.left}
            y1={storePos.top}
            x2={driverPos ? driverPos.left : customerPos.left}
            y2={driverPos ? driverPos.top : customerPos.top}
            stroke="#fe6712"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="opacity-70 animate-pulse"
          />
          {driverPos && (
            <line
              x1={driverPos.left}
              y1={driverPos.top}
              x2={customerPos.left}
              y2={customerPos.top}
              stroke="#10b981"
              strokeWidth="3"
              strokeDasharray="4 4"
              className="opacity-80"
            />
          )}
        </svg>

        {/* BANNER INFORMATIVO TEMPORAL (SIMULADOR OVIS) */}
        <div className="absolute top-3 left-3 right-3 sm:left-4 sm:right-auto z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-md flex items-center gap-2 text-xs text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span className="font-semibold text-[11px] sm:text-xs">
            Vista previa interactiva (Mapbox / Leaflet Mock)
          </span>
        </div>

        {/* MARCADOR 1: COMERCIO (STORE) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer transition-transform duration-300 hover:scale-110"
          style={{ left: storePos.left, top: storePos.top }}
        >
          <div className="relative flex flex-col items-center">
            <div className="bg-slate-900 text-white p-2.5 rounded-2xl shadow-xl border-2 border-white flex items-center justify-center">
              <Store className="w-5 h-5 text-orange-400" />
            </div>
            <div className="mt-1 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md whitespace-nowrap">
              {storeLocation.address || 'Tienda / Origen'}
            </div>
          </div>
        </div>

        {/* MARCADOR 2: CLIENTE (CUSTOMER) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer transition-transform duration-300 hover:scale-110"
          style={{ left: customerPos.left, top: customerPos.top }}
        >
          <div className="relative flex flex-col items-center">
            <div className="bg-emerald-600 text-white p-2.5 rounded-2xl shadow-xl border-2 border-white flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="mt-1 bg-emerald-950/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md whitespace-nowrap">
              {customerLocation.address || 'Destino de Entrega'}
            </div>
          </div>
        </div>

        {/* MARCADOR 3: DRIVER / REPARTIDOR (SÓLO SI EXISTE DRIVERLOCATION) */}
        {driverLocation && driverPos && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-1000 ease-in-out group cursor-pointer hover:scale-110"
            style={{ left: driverPos.left, top: driverPos.top }}
          >
            <div className="relative flex flex-col items-center">
              {/* Olla/Aura pulsante GPS */}
              <div className="absolute -inset-2 rounded-full bg-[#fe6712]/30 animate-ping" />
              <div className="relative bg-[#fe6712] text-white p-3 rounded-2xl shadow-2xl border-2 border-white flex items-center justify-center">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <div className="mt-1 bg-[#fe6712] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg whitespace-nowrap flex items-center gap-1">
                <span>Repartidor D&apos;una</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER DETALLES COORDENADAS Y TIEMPO */}
      <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white border border-slate-200/60 shadow-xs">
          <MapPin className="w-4 h-4 text-[#fe6712] shrink-0" />
          <div className="truncate">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Origen (Origen)</p>
            <p className="font-bold text-slate-800 truncate">
              {storeLocation.lat.toFixed(4)}, {storeLocation.lng.toFixed(4)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white border border-slate-200/60 shadow-xs">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="truncate">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Destino (Cliente)</p>
            <p className="font-bold text-slate-800 truncate">
              {customerLocation.lat.toFixed(4)}, {customerLocation.lng.toFixed(4)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-orange-50 border border-orange-200/60 shadow-xs">
          {status === 'DELIVERED' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-[#fe6712] shrink-0" />
          )}
          <div className="truncate">
            <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Tiempo Estimado</p>
            <p className="font-black text-slate-900 truncate">
              {status === 'DELIVERED' ? 'Completado' : `~ ${estimatedTimeMin} mins`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
