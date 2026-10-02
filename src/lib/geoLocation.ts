// Ubicación base de la plataforma y criterio para aceptar una posición del navegador. Compartido por el Home (MarketplaceHub) y por la vista
// de tienda (botón "Mi Ubicación" del carrito) para que ambos apliquen exactamente el mismo filtro. Funciones puras, sin React ni red.

/** Zona base: Cabimas, Zulia. Con ella arranca el Home y a ella se vuelve cuando el navegador no entrega una lectura aceptable. */
export const CABIMAS_DEFAULT_LOCATION: { lat: number; lng: number; label: string } = { lat: 10.3933, lng: -71.4442, label: 'Cabimas, Zulia' };

/**
 * Tolerancia de precisión (metros) de una lectura normal del navegador dentro de la zona de Cabimas. Las PCs no tienen GPS satelital y
 * reportan por Wi-Fi o red entre 300 y 1.500 m: eso es una lectura válida. Más error que esto es una posición por IP/antena y no se
 * puede tomar como el punto del cliente.
 */
export const MAX_GPS_ACCURACY_METERS = 2000;

/** Error (metros) de un GPS real (satélite): se respeta en cualquier lugar, incluso lejos de Cabimas. */
export const HIGH_PRECISION_GPS_METERS = 100;

/**
 * Radio (km) de la zona de Cabimas alrededor de la zona base. Más allá, la lectura es de otra ciudad: Maracaibo, la que suele dar la red
 * del proveedor de internet, queda a unos 32 km del centro de Cabimas.
 */
export const CABIMAS_ZONE_RADIUS_KM = 25;

/** Distancia en línea recta (km, haversine) entre dos puntos. */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Distancia (km) desde la zona base de Cabimas hasta un punto. */
export function distanceFromCabimasKm(lat: number, lng: number): number {
  return haversineKm(CABIMAS_DEFAULT_LOCATION.lat, CABIMAS_DEFAULT_LOCATION.lng, lat, lng);
}

/** ¿Está el punto dentro de la zona de Cabimas (`CABIMAS_ZONE_RADIUS_KM`)? */
export function isInsideCabimasZone(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && distanceFromCabimasKm(lat, lng) <= CABIMAS_ZONE_RADIUS_KM;
}

/**
 * Ubicación con la que se sigue cuando una lectura del navegador se descarta o no llega: la vigente si sirve para repartir (un punto que
 * el cliente eligió en el mapa, o cualquier punto dentro de la zona de Cabimas) y, si no, la zona base. Así una posición lejana que
 * hubiera quedado adoptada (otra ciudad, por la IP del proveedor) no deja el delivery bloqueado por distancia.
 */
export function usableLocationOrBase<T extends { lat: number; lng: number; manual?: boolean }>(
  current: T | null | undefined
): T | { lat: number; lng: number; label: string } {
  if (current && (current.manual === true || isInsideCabimasZone(Number(current.lat), Number(current.lng)))) return current;
  return { ...CABIMAS_DEFAULT_LOCATION };
}

/**
 * ¿Se acepta esta lectura del navegador como la posición real del cliente? Coordenadas y precisión deben ser válidas, y además:
 *  · un GPS real (`HIGH_PRECISION_GPS_METERS` o menos) se acepta en cualquier lugar;
 *  · dentro de la zona de Cabimas (`CABIMAS_ZONE_RADIUS_KM`) se acepta toda lectura normal, de `MAX_GPS_ACCURACY_METERS` o menos
 *    (GPS de teléfono, Wi-Fi o red de una PC);
 *  · lo demás se descarta: una lectura imprecisa que cae lejos de Cabimas (otra ciudad por la red del proveedor) o una tan imprecisa
 *    que no sirve para centrar al cliente.
 * Si se descarta, quien llama conserva la ubicación vigente (Cabimas por defecto).
 */
export function isExplicitGps(coords: { latitude: number; longitude: number; accuracy: number } | null | undefined): boolean {
  if (!coords) return false;
  const { latitude, longitude, accuracy } = coords;
  const validPosition = Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
  if (!validPosition || !Number.isFinite(accuracy) || accuracy < 0) return false;
  if (accuracy <= HIGH_PRECISION_GPS_METERS) return true;
  return accuracy <= MAX_GPS_ACCURACY_METERS && distanceFromCabimasKm(latitude, longitude) <= CABIMAS_ZONE_RADIUS_KM;
}
