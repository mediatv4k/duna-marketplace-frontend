// Ubicación base de la plataforma y criterio de GPS "explícito". Compartido por el Home (MarketplaceHub) y por la vista de tienda (botón
// "Mi Ubicación" del carrito) para que ambos apliquen exactamente el mismo filtro. Funciones puras, sin React ni red.

/** Zona base: Cabimas, Zulia. Con ella arranca el Home y a ella se vuelve siempre que el navegador no entregue un GPS preciso. */
export const CABIMAS_DEFAULT_LOCATION: { lat: number; lng: number; label: string } = { lat: 10.3933, lng: -71.4442, label: 'Cabimas, Zulia' };

/**
 * Máximo error (metros) para dar una posición del navegador por GPS explícito. Una posición con más error es de red/IP/antena y puede
 * caer en otra ciudad (p. ej. Maracaibo, la del proveedor de internet): NO se usa, porque sobrescribiría la zona base y bloquearía el
 * flete y el delivery por distancia (límite de 12 km).
 */
export const MAX_GPS_ACCURACY_METERS = 100;

/** `true` solo si la lectura trae coordenadas válidas y un error de `MAX_GPS_ACCURACY_METERS` o menos. */
export function isExplicitGps(coords: { latitude: number; longitude: number; accuracy: number } | null | undefined): boolean {
  if (!coords) return false;
  const { latitude, longitude, accuracy } = coords;
  return (
    Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 &&
    Number.isFinite(longitude) && longitude >= -180 && longitude <= 180 &&
    Number.isFinite(accuracy) && accuracy >= 0 && accuracy <= MAX_GPS_ACCURACY_METERS
  );
}
