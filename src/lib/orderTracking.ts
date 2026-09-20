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

// ---- Fase actual del pedido (a partir de history[] y status de GET /delivery/request/{id}/public) ----
export type TrackingPhase = 'driver_assigned' | 'on_route' | 'arrived' | 'delivered' | 'other';

// Historial con el evento más reciente primero (empate de fecha → id mayor primero)
export function sortHistoryDesc(history: unknown): any[] {
  if (!Array.isArray(history)) return [];
  return [...history].sort((x: any, y: any) =>
    (new Date(y.date).getTime() - new Date(x.date).getTime()) || (Number(y.id || 0) - Number(x.id || 0)));
}

// Fase según el evento más reciente del historial (vocabulario real del backend: DRIVER_ASSIGNED, Recogido,
// Entregando, Llega a sitio, Entregado, "(2x)"…). Entregado también se reconoce por el status final de la orden.
export function trackingPhase(currentRaw: unknown, orderStatus: unknown): TrackingPhase {
  const cur = String(currentRaw ?? '').trim().toLowerCase();
  const status = String(orderStatus ?? '').trim().toUpperCase();
  if (['DELIVERED', 'COMPLETED', 'DOUBLE_DELIVERED'].includes(status) || /^entregado/.test(cur)) return 'delivered';
  if (/^(llega a sitio|lleg[oó])/.test(cur)) return 'arrived';
  if (/^(taken|recogido|entregando|en camino)/.test(cur)) return 'on_route';
  if (cur === 'driver_assigned') return 'driver_assigned';
  return 'other';
}

export function getTrackingState(remote: any) {
  const history = sortHistoryDesc(remote?.history);
  const currentRaw = history.length > 0 ? history[0].status : remote?.status;
  const phase = trackingPhase(currentRaw, remote?.status);
  // Código de entrega: delivery_code (verificado en DEV); se aceptan alias por si el backend los expone
  const deliveryCode = [remote?.delivery_code, remote?.code, remote?.pin, remote?.confirmation_code]
    .map((v: unknown) => String(v ?? '').trim()).find(Boolean) || '';
  // Chofer CONFIRMADO si y solo si el historial contiene DRIVER_ASSIGNED (o un estado posterior de entrega: TAKEN / Entregando /
  // Llega a sitio / Entregado). "Recogido" / "Pedido en camino" es un despacho de la tienda/sistema y NO confirma al chofer: el
  // sistema asigna preliminarmente a un chofer de turno que puede no aceptar y la orden rota (caso orden #57).
  const driverConfirmed = history.some((h: any) => /^(driver_assigned|taken|entregando|llega a sitio|lleg[oó]|entregado)/i.test(String(h?.status ?? '').trim()));
  return { history, currentRaw, phase, isFinal: isFinalStatus(remote?.status), deliveryCode, driverConfirmed };
}
