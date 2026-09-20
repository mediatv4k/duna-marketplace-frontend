const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dev.carjos-marketplace.cloud';
const API_KEY = process.env.NEXT_PUBLIC_SERVER_API_KEY || 'bf8f1b64-6342-48c5-af05-501e4c15a6cb';
const TIMEZONE = process.env.NEXT_PUBLIC_TIMEZONE || 'America/Caracas';

export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
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
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const text = await res.text();
    try {
      return JSON.parse(text) as ApiResponse<T>;
    } catch {
      return { code: res.status || 500, data: null as unknown as T, message: text || 'Error en el servidor' };
    }
  } catch (e: any) {
    return { code: 500, data: null as unknown as T, message: e?.message || 'Error de conexión con la API' };
  }
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
    try {
      return JSON.parse(text);
    } catch {
      return { code: res.status || 500, data: null, message: text || 'Error en el servidor' };
    }
  } catch (err: any) {
    return { code: 500, data: null, message: err?.message || 'Fallo de red al enviar la orden' };
  }
}


export async function getProductsByStore(storeId: number | string): Promise<ApiResponse<any>> {
  return await apiFetch<any>(`/products/store/${storeId}`);
}

export async function getProduct(productId: number | string): Promise<ApiResponse<any>> {
  return await apiFetch<any>(`/product/${productId}/web`);
}

// GET /promotion?store={code} — el backend filtra por el CÓDIGO/slug de la tienda (ej. "papa-helado"),
// no por el id numérico. Verificado contra el backend real de DEV el 2026-09-16.
export async function getStorePromotions(storeCode: string): Promise<ApiResponse<any>> {
  return await apiFetch<any>(`/promotion?store=${encodeURIComponent(storeCode || '')}`);
}
