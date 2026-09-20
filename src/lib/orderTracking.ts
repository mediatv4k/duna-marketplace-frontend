// Utilidades compartidas del seguimiento de pedidos (modal OrderTrackingModal, FAB del Home y
// página pública /order/[orderId]/timeline). Datos según GET /delivery/request/{id}/public.

// Estados finales: el polling se detiene y el FAB del Home se oculta
export const FINAL_STATUSES = ['DELIVERED', 'CANCELLED', 'REJECTED', 'COMPLETED'];

export function isFinalStatus(status: unknown): boolean {
  return FINAL_STATUSES.includes(String(status || '').toUpperCase());
}

// Nombres amigables de los estados del historial (history[].status del backend)
const STATUS_LABELS: Record<string, string> = {
  'driver_assigned': 'Repartidor asignado',
  'inicia': 'Pedido recibido',
  'solicitud completa': 'Orden confirmada',
  'aceptado': 'Aceptado por el comercio',
  'listo': 'Orden lista para entrega',
  'recogido': 'Pedido en camino',
};

// Estado no mapeado → texto limpio (sin guiones bajos, primera letra en mayúscula). Ej: "FORWARDED" → "Forwarded"
export function friendlyStatus(raw: unknown): string {
  const text = String(raw ?? '').trim();
  if (!text) return '';
  const mapped = STATUS_LABELS[text.toLowerCase()];
  if (mapped) return mapped;
  const clean = text.replace(/_/g, ' ').replace(/\s+/g, ' ').toLowerCase();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

// Coordenadas del backend: objeto o string JSON, con {latitude,longitude} o {lat,lng}
export function parseCoords(value: unknown): { lat: number; lng: number } | null {
  let obj: any = value;
  if (typeof value === 'string') {
    try { obj = JSON.parse(value); } catch { return null; }
  }
  if (!obj || typeof obj !== 'object') return null;
  const lat = Number(obj.latitude ?? obj.lat);
  const lng = Number(obj.longitude ?? obj.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

// Teléfono → formato internacional para wa.me (el backend trae "0416…" y "57314…"; 0 inicial = Venezuela +58)
export function toWhatsAppNumber(raw: unknown): string {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('0') ? `58${digits.slice(1)}` : digits;
}
