// Carga única del script de Google Maps JS, compartida por el selector de ubicación (LocationPickerModal)
// y el mapa embebido del seguimiento (LiveOrderMap).

// Clave oficial de Google Maps (navegador). Debe estar restringida por dominio (HTTP referrer) en Google Cloud.
export const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || 'AIzaSyA3st-WKKm39nwOJKMAbSY2zQoGFS1dkgo';

declare global {
  interface Window {
    google?: any;
    __dunaMapsLoading?: Promise<any>;
  }
}

// Mapa + Geocoder + Places (una sola carga por página)
export function loadGoogleMaps(): Promise<any> {
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
