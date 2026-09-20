'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { loadGoogleMaps } from '@/lib/googleMaps';

type LatLng = { lat: number; lng: number };

interface LiveOrderMapProps {
  store: LatLng | null;    // food_store_location
  customer: LatLng | null; // customer_address
  driver: LatLng | null;   // current_location (se actualiza con cada ciclo de polling)
}

type MarkerKey = 'store' | 'customer' | 'driver';

// Icono de marcador dibujado en SVG (emoji sobre círculo): sin archivos de imagen externos
function emojiIcon(google: any, emoji: string, background: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44"><circle cx="22" cy="22" r="19" fill="${background}" stroke="white" stroke-width="3"/><text x="22" y="29" font-size="20" text-anchor="middle">${emoji}</text></svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(40, 40),
    anchor: new google.maps.Point(20, 20),
  };
}

const MARKER_STYLE: Record<MarkerKey, { emoji: string; background: string; title: string }> = {
  store: { emoji: '🏪', background: '#fe6712', title: 'Comercio' },
  customer: { emoji: '🏠', background: '#0f172a', title: 'Dirección de entrega' },
  driver: { emoji: '🛵', background: '#10b981', title: 'Repartidor' },
};

// Mapa de Google embebido: comercio, dirección del cliente y repartidor (icono de moto).
// Las posiciones llegan por props y se mueven en cada polling; el encuadre solo se recalcula cuando aparece/desaparece un punto
// (no en cada ciclo) para no quitarle el control de zoom/desplazamiento al usuario.
export default function LiveOrderMap({ store, customer, driver }: LiveOrderMapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Partial<Record<MarkerKey, any>>>({});
  const fittedCountRef = useRef<number>(-1);

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !mapDivRef.current) return;
        const first = store || customer || driver || { lat: 10.39, lng: -71.45 };
        mapRef.current = new google.maps.Map(mapDivRef.current, {
          center: first,
          zoom: 14,
          gestureHandling: 'greedy',
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        });
        setStatus('ready');
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setErrorMsg(err?.message || 'No se pudo cargar Google Maps');
        setStatus('error');
      });
    return () => {
      cancelled = true;
      Object.values(markersRef.current).forEach((m: any) => m?.setMap(null));
      markersRef.current = {};
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const google = typeof window !== 'undefined' ? window.google : null;
    const map = mapRef.current;
    if (status !== 'ready' || !google?.maps || !map) return;

    const points: Record<MarkerKey, LatLng | null> = { store, customer, driver };
    (Object.keys(points) as MarkerKey[]).forEach((key) => {
      const point = points[key];
      const existing = markersRef.current[key];
      if (!point) {
        if (existing) {
          existing.setMap(null);
          delete markersRef.current[key];
        }
        return;
      }
      if (existing) {
        existing.setPosition(point);
      } else {
        const style = MARKER_STYLE[key];
        markersRef.current[key] = new google.maps.Marker({
          position: point,
          map,
          title: style.title,
          icon: emojiIcon(google, style.emoji, style.background),
          zIndex: key === 'driver' ? 3 : 1,
        });
      }
    });

    const available = (Object.values(points) as (LatLng | null)[]).filter(Boolean) as LatLng[];
    if (available.length !== fittedCountRef.current) {
      fittedCountRef.current = available.length;
      if (available.length === 1) {
        map.setCenter(available[0]);
        map.setZoom(16);
      } else if (available.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        available.forEach((p) => bounds.extend(p));
        map.fitBounds(bounds, 40);
      }
    }
  }, [status, store?.lat, store?.lng, customer?.lat, customer?.lng, driver?.lat, driver?.lng]);

  return (
    <div className="space-y-1.5">
      <div className="relative w-full h-[36vh] min-h-[210px] max-h-[300px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
        <div ref={mapDivRef} className="absolute inset-0" />
        {status === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-slate-400 bg-slate-50">
            <Loader2 className="h-6 w-6 animate-spin text-[#fe6712]" />
            <span className="text-[10px] font-bold">Cargando mapa...</span>
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center bg-slate-50">
            <span className="text-[11px] font-black text-red-600">{errorMsg}</span>
            <span className="text-[9px] font-medium text-slate-400">Verifica la clave de Google Maps y que la API de Maps JavaScript esté habilitada.</span>
          </div>
        )}
      </div>
      <p className="text-[9px] font-bold text-slate-400 text-center">
        🏪 Comercio · 🏠 Entrega · 🛵 Repartidor{driver ? '' : ' (aún sin posición)'}
      </p>
    </div>
  );
}
