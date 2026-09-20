'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, Loader2, Check, Search } from 'lucide-react';
import { getDistanceAndTime } from '@/lib/logisticsEngine';

// Clave oficial de Google Maps (navegador). Debe estar restringida por dominio (HTTP referrer) en Google Cloud.
const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || 'AIzaSyA3st-WKKm39nwOJKMAbSY2zQoGFS1dkgo';
const MAX_DELIVERY_KM = 12;

declare global {
  interface Window {
    google?: any;
    __dunaMapsLoading?: Promise<any>;
  }
}

// Carga única del script de Google Maps JS (mapa + Geocoder + Places)
function loadGoogleMaps(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Google Maps solo carga en el navegador'));
  if (window.google?.maps) return Promise.resolve(window.google);
  if (window.__dunaMapsLoading) return window.__dunaMapsLoading;

  window.__dunaMapsLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_KEY)}&libraries=places&language=es&region=VE`;
    script.async = true;
    script.defer = true;
    script.onload = () => (window.google?.maps ? resolve(window.google) : reject(new Error('Google Maps no disponible')));
    script.onerror = () => {
      window.__dunaMapsLoading = undefined;
      reject(new Error('No se pudo cargar Google Maps'));
    };
    document.head.appendChild(script);
  });
  return window.__dunaMapsLoading;
}

export interface PickedLocation {
  lat: number;
  lng: number;
  address: string;
}

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: PickedLocation) => void;
  initialCenter: { lat: number; lng: number };
  storeCoords?: { lat: number; lng: number } | null;
}

export default function LocationPickerModal(props: LocationPickerModalProps) {
  if (!props.isOpen) return null;
  return <PickerBody {...props} />;
}

function PickerBody({ onClose, onConfirm, initialCenter, storeCoords }: LocationPickerModalProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [position, setPosition] = useState<{ lat: number; lng: number }>({ lat: initialCenter.lat, lng: initialCenter.lng });
  const [address, setAddress] = useState('');
  const [resolving, setResolving] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  // Dirección legible del punto (Geocoder inverso); si falla, se conservan las coordenadas
  const resolveAddress = (lat: number, lng: number) => {
    const geocoder = geocoderRef.current;
    if (!geocoder) return;
    setResolving(true);
    geocoder.geocode({ location: { lat, lng } }, (results: any[], geoStatus: string) => {
      setResolving(false);
      setAddress(geoStatus === 'OK' && results?.[0]?.formatted_address ? results[0].formatted_address : '');
    });
  };

  const moveTo = (lat: number, lng: number, recenter: boolean) => {
    setPosition({ lat, lng });
    if (markerRef.current) markerRef.current.setPosition({ lat, lng });
    if (recenter && mapRef.current) mapRef.current.panTo({ lat, lng });
    resolveAddress(lat, lng);
  };

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !mapDivRef.current) return;
        const center = { lat: initialCenter.lat, lng: initialCenter.lng };
        const map = new google.maps.Map(mapDivRef.current, {
          center,
          zoom: 16,
          gestureHandling: 'greedy',
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        });
        const marker = new google.maps.Marker({ position: center, map, draggable: true });
        mapRef.current = map;
        markerRef.current = marker;
        geocoderRef.current = new google.maps.Geocoder();

        map.addListener('click', (e: any) => moveTo(e.latLng.lat(), e.latLng.lng(), false));
        marker.addListener('dragend', (e: any) => moveTo(e.latLng.lat(), e.latLng.lng(), false));

        // Autocompletado de direcciones (Places). Si la API no está habilitada para la clave, la búsqueda por texto sigue funcionando vía Geocoder.
        try {
          if (searchInputRef.current && google.maps.places?.Autocomplete) {
            const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
              componentRestrictions: { country: 've' },
              fields: ['geometry', 'formatted_address'],
            });
            autocomplete.addListener('place_changed', () => {
              const place = autocomplete.getPlace();
              const loc = place?.geometry?.location;
              if (loc) {
                map.setZoom(17);
                moveTo(loc.lat(), loc.lng(), true);
              }
            });
          }
        } catch {
          /* sin Places: se usa solo Geocoder */
        }

        setStatus('ready');
        resolveAddress(center.lat, center.lng);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setErrorMsg(err?.message || 'No se pudo cargar Google Maps');
        setStatus('error');
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Distancia en línea recta a la tienda (aviso previo; el bloqueo oficial lo aplica el carrito al confirmar)
  useEffect(() => {
    if (!storeCoords) { setDistanceKm(null); return; }
    let cancelled = false;
    getDistanceAndTime({ lat: storeCoords.lat, lng: storeCoords.lng }, position).then((m) => {
      if (!cancelled) setDistanceKm(Number((m.distance / 1000).toFixed(1)));
    });
    return () => { cancelled = true; };
  }, [position, storeCoords]);

  const handleSearch = () => {
    const query = searchText.trim();
    if (!query || !geocoderRef.current) return;
    geocoderRef.current.geocode({ address: query, componentRestrictions: { country: 'VE' } }, (results: any[], geoStatus: string) => {
      const loc = geoStatus === 'OK' ? results?.[0]?.geometry?.location : null;
      if (loc) {
        mapRef.current?.setZoom(17);
        moveTo(loc.lat(), loc.lng(), true);
      } else {
        setAddress('');
        alert('No encontramos esa dirección. Prueba con otra o mueve el pin en el mapa.');
      }
    });
  };

  const handleConfirm = () => {
    onConfirm({
      lat: position.lat,
      lng: position.lng,
      address: address || `Ubicación seleccionada (${position.lat.toFixed(5)}, ${position.lng.toFixed(5)})`,
    });
  };

  const outOfRange = distanceKm !== null && distanceKm > MAX_DELIVERY_KM;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm">
      <div className="w-full max-w-[420px] max-h-[92vh] overflow-hidden rounded-[28px] bg-white shadow-2xl border border-slate-100 flex flex-col">
        <div className="bg-[#fe6712] px-5 py-3 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-black text-[16px] leading-tight mb-0.5">Elegir dirección de entrega</h3>
            <p className="text-[10px] font-medium text-white/90">Busca una dirección o mueve el pin en el mapa</p>
          </div>
          <button type="button" onClick={onClose} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition cursor-pointer shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-3 space-y-2 overflow-y-auto">
          <div className="flex gap-1.5">
            <input
              ref={searchInputRef}
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
              placeholder="Buscar dirección en Venezuela..."
              className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-[#fe6712] focus:outline-none"
            />
            <button type="button" onClick={handleSearch} className="w-9 h-9 rounded-xl bg-[#fe6712] hover:bg-[#e0580d] text-white flex items-center justify-center cursor-pointer shrink-0" aria-label="Buscar">
              <Search className="w-4 h-4" />
            </button>
          </div>

          <div className="relative w-full h-[280px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
            <div ref={mapDivRef} className="absolute inset-0" />
            {status === 'loading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-slate-400 bg-slate-50">
                <Loader2 className="h-6 w-6 animate-spin text-[#fe6712]" />
                <span className="text-[10px] font-bold">Cargando mapa...</span>
              </div>
            )}
            {status === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center bg-slate-50">
                <MapPin className="h-6 w-6 text-slate-300" />
                <span className="text-[11px] font-black text-red-600">{errorMsg}</span>
                <span className="text-[9px] font-medium text-slate-400">Verifica la clave de Google Maps y que la API de Maps JavaScript esté habilitada.</span>
              </div>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 space-y-0.5">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Dirección seleccionada</span>
            <p className="text-[11px] font-bold text-slate-800 leading-tight">
              {resolving ? 'Buscando dirección...' : (address || `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`)}
            </p>
            {distanceKm !== null && (
              <p className={`text-[10px] font-bold ${outOfRange ? 'text-red-600' : 'text-slate-500'}`}>
                {outOfRange ? 'Servicio no disponible a más de 12km' : `A ${distanceKm.toFixed(1)} km de la tienda`}
              </p>
            )}
          </div>
        </div>

        <div className="px-4 py-3 border-t border-slate-100 bg-white shrink-0 flex gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={status !== 'ready'}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-[#fe6712] hover:bg-[#e0580d] disabled:opacity-50 py-2 text-xs font-black text-white shadow-md cursor-pointer"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            <span>Confirmar esta ubicación</span>
          </button>
        </div>
      </div>
    </div>
  );
}
