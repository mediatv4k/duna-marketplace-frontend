const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dev.carjos-marketplace.cloud';
const API_KEY = process.env.NEXT_PUBLIC_SERVER_API_KEY || 'bf8f1b64-6342-48c5-af05-501e4c15a6cb';
const TIMEZONE = process.env.NEXT_PUBLIC_TIMEZONE || 'America/Caracas';

export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

// Tiempo máximo razonable para las lecturas críticas (Home, catálogo): 15 s. Pasado ese tiempo la petición se aborta de verdad
// (AbortController) y el llamador recibe un error claro; nunca se sustituye por datos de respaldo.
export const REQUEST_TIMEOUT_MS = 15000;

// `timeoutMs` es opcional: sin él la petición no tiene límite (comportamiento anterior de los demás llamadores).
async function apiFetch<T>(endpoint: string, options: RequestInit = {}, timeoutMs?: number): Promise<ApiResponse<T>> {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'apiKey': API_KEY,
    'timeZone': TIMEZONE,
  };
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };
  const controller = timeoutMs ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  if (controller) config.signal = controller.signal;
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const text = await res.text();
    try {
      return JSON.parse(text) as ApiResponse<T>;
    } catch {
      return { code: res.status || 500, data: null as unknown as T, message: text || 'Error en el servidor' };
    }
  } catch (e: any) {
    const timedOut = e?.name === 'AbortError';
    return {
      code: 500,
      data: null as unknown as T,
      message: timedOut ? 'La solicitud tardó demasiado. Revisa tu conexión e inténtalo de nuevo.' : (e?.message || 'Error de conexión con la API'),
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// GET /product/categories — categorías del Home (sin categorías sin productos activos)
export async function getProductCategories(): Promise<ApiResponse<any>> {
  return await apiFetch<any>('/product/categories?unused=false', {}, REQUEST_TIMEOUT_MS);
}

// GET /store/find — listado de tiendas del Home
export async function findStores(): Promise<ApiResponse<any>> {
  return await apiFetch<any>('/store/find?category=&keywords=', {}, REQUEST_TIMEOUT_MS);
}

export async function getStorePaymentInfo(storeId: number | string): Promise<ApiResponse<any>> {
  return await apiFetch<any>(`/store/${storeId}/payment/info`);
}

export async function submitPurchaseOrder(orderDataPayload: any, file?: File | null): Promise<ApiResponse<any>> {
  const formData = new FormData();
  formData.append('orderData', JSON.stringify(orderDataPayload));
  if (file) {
    formData.append('paymentFile', file);
  }

  try {
    const res = await fetch(`${API_BASE}/delivery/request/purchase/web`, {
      method: 'POST',
      headers: {
        'apiKey': API_KEY,
        'timeZone': TIMEZONE,
      },
      body: formData,
    });
    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      json = undefined;
    }
    // Solo vale un sobre JSON { code, data, message }. Texto plano, HTML o cuerpo vacío NO son una respuesta válida aunque el
    // HTTP sea 200/201: el estado HTTP ya NO se convierte en `code` (antes un "200 OK" sin JSON se leía como compra exitosa).
    if (!json || typeof json !== 'object' || Array.isArray(json)) {
      console.warn('[purchase/web] Respuesta no válida (HTTP', res.status, '):', text.slice(0, 200));
      return { code: 0, data: null, message: 'No recibimos una respuesta válida del servidor, así que tu pedido no fue confirmado. Inténtalo de nuevo.' };
    }
    const envelope = json as Partial<ApiResponse<any>>;
    return { ...(envelope as ApiResponse<any>), code: typeof envelope.code === 'number' ? envelope.code : 0 };
  } catch {
    return { code: 500, data: null, message: 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.' };
  }
}


// GET /products/store/{id}?page=N — el backend pagina de a 30 productos (data.meta.{total,per_page,current_page,last_page}, data.hasMore).
// Verificado en DEV: Proseco Bodegón = 255 productos en 9 páginas; Papá Helado = 38 en 2. Sin `page` devuelve la página 1.
export async function getProductsByStore(storeId: number | string, page: number = 1): Promise<ApiResponse<any>> {
  return await apiFetch<any>(`/products/store/${storeId}${page > 1 ? `?page=${page}` : ''}`, {}, REQUEST_TIMEOUT_MS);
}

export async function getProduct(productId: number | string): Promise<ApiResponse<any>> {
  return await apiFetch<any>(`/product/${productId}/web`);
}

// GET /store/{id}/schedule/open?apikey= — horario semanal del comercio. El contrato pide "apikey" en query y en header
// (los headers no distinguen mayúsculas: apiKey/apikey). Verificado en DEV: data[] = { id, day (monday…sunday),
// name, open_time "HH:mm", close_time "HH:mm", food_store_id, status "ACTIVE" }.
export async function getStoreSchedule(storeId: number | string): Promise<ApiResponse<any>> {
  return await apiFetch<any>(`/store/${storeId}/schedule/open?apikey=${encodeURIComponent(API_KEY)}`);
}

// PUT /delivery/request/{orderId}/payment/reference — adjunta comprobante (referenceImage) y/o referencia (referenceText)
// a una orden YA creada, sin volver a llamar a purchase/web (evita órdenes duplicadas). multipart/form-data:
// no se fija Content-Type a mano para que el navegador agregue el boundary. Ruta verificada en DEV (con un id inexistente
// responde { code: 0, message: "E_ROW_NOT_FOUND" }); el caso de éxito no se probó para no alterar órdenes reales.
export async function uploadPaymentReference(params: {
  orderId: number | string;
  file?: File | null;
  referenceText?: string;
}): Promise<ApiResponse<any>> {
  const formData = new FormData();
  if (params.file) formData.append('referenceImage', params.file);
  const text = (params.referenceText || '').trim();
  if (text) formData.append('referenceText', text);

  try {
    const res = await fetch(`${API_BASE}/delivery/request/${encodeURIComponent(String(params.orderId))}/payment/reference`, {
      method: 'PUT',
      headers: {
        'apiKey': API_KEY,
        'timeZone': TIMEZONE,
      },
      body: formData,
    });
    const raw = await res.text();
    try {
      return JSON.parse(raw);
    } catch {
      return { code: res.status || 500, data: null, message: raw || 'Error en el servidor' };
    }
  } catch (err: any) {
    return { code: 500, data: null, message: err?.message || 'Fallo de red al enviar el comprobante' };
  }
}

// GET /delivery/request/purchase/deliveryRate — cotización oficial del flete (verificado en DEV):
//  · hasta 12 km  → { code: 1, data: { rate: number } }
//  · más de 12 km → { code: 1, data: { message: "Servicio de entrega no disponible para tu ubicación" } }
//  · storeId inexistente / parámetros faltantes → HTTP 500 sin envelope { code } (solo { message, stack })
export type DeliveryRateResult = { ok: true; rate: number } | { ok: false; message: string };

export async function getDeliveryRate(params: {
  storeId: number | string;
  lat: number;
  lng: number;
  distance: number;
  duration: number;
}): Promise<DeliveryRateResult> {
  const qs = new URLSearchParams({
    storeId: String(params.storeId),
    lat: String(params.lat),
    lng: String(params.lng),
    distance: String(params.distance),
    duration: String(params.duration),
  });
  const res = await apiFetch<any>(`/delivery/request/purchase/deliveryRate?${qs.toString()}`);
  const rate = res?.data?.rate;
  if (res?.code === 1 && rate !== null && rate !== undefined && Number.isFinite(Number(rate))) {
    return { ok: true, rate: Number(rate) };
  }
  const msg = res?.data?.message || res?.message;
  return { ok: false, message: typeof msg === 'string' && msg && !msg.startsWith('E_') && !msg.includes('Expected a string') ? msg : 'No se pudo cotizar el flete. Intenta de nuevo.' };
}

// GET /delivery/request/{orderId}/public?apiKey= — tracking público del pedido (envelope { code, data, message }).
// El contrato exige apiKey como query param. Verificado en DEV con la orden #1620.
export async function getOrderPublic(orderId: number | string): Promise<ApiResponse<any>> {
  return await apiFetch<any>(`/delivery/request/${encodeURIComponent(String(orderId))}/public?apiKey=${encodeURIComponent(API_KEY)}`);
}

// GET /promotion?store={code} — el backend filtra por el CÓDIGO/slug de la tienda (ej. "papa-helado"),
// no por el id numérico. Verificado contra el backend real de DEV el 2026-09-16.
export async function getStorePromotions(storeCode: string): Promise<ApiResponse<any>> {
  return await apiFetch<any>(`/promotion?store=${encodeURIComponent(storeCode || '')}`, {}, REQUEST_TIMEOUT_MS);
}
