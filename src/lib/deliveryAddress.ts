// Dirección de entrega de un pedido a domicilio: la ubicación (rótulo + coordenadas) y, cuando esa ubicación NO es un punto que el cliente
// eligió en el mapa (la zona base de Cabimas o un GPS que solo trae el nombre de la ciudad), la dirección o punto de referencia que escribe
// el cliente. El checkout no tiene campo de dirección: `address` del pedido sale de este texto. Funciones puras, sin React ni red.

export const MIN_DELIVERY_REFERENCE_LENGTH = 6;
export const MAX_DELIVERY_REFERENCE_LENGTH = 120;

/** Texto en una sola línea: sin caracteres de control, espacios colapsados, recortado al máximo. */
export function cleanDeliveryReference(text: unknown): string {
  return String(text ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_DELIVERY_REFERENCE_LENGTH)
    .trim();
}

/** Una referencia válida tiene al menos 6 caracteres y 4 letras o números ("....." o "aaa" no sirven para llegar a una casa). */
export function isValidDeliveryReference(text: unknown): boolean {
  const clean = cleanDeliveryReference(text);
  return clean.length >= MIN_DELIVERY_REFERENCE_LENGTH && (clean.match(/[A-Za-zÀ-ÿ0-9]/g) || []).length >= 4;
}

/**
 * Texto de `address` del pedido. Sin referencia es exactamente el formato de siempre ("Rótulo: lat, lng"); con referencia va primero:
 * "Casa 12 frente a la panadería - Cabimas, Zulia: 10.39330, -71.44420".
 */
export function composeDeliveryAddress(location: { lat: number; lng: number; label: string }, reference: unknown = ''): string {
  const base = `${location.label}: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`;
  const clean = cleanDeliveryReference(reference);
  return clean ? `${clean} - ${base}` : base;
}
