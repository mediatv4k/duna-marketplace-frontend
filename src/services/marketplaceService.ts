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
  } catch (error) {
    return { code: 500, data: null as unknown as T, message: 'Error de red al llamar a la API' };
  }
}

export async function getProductsByStore(storeIdOrCode: string | number) {
  return apiFetch<any>(`/products/store/${storeIdOrCode}?query=&page=1&category=&subCategory=&orderId=`);
}

export async function getProduct(productId: number | string, promotion?: string) {
  return apiFetch<any>(`/product/${productId}/web?promo=${promotion || ''}`);
}

export async function getStoreSchedules(storeId: number) {
  return apiFetch<any>(`/store/${storeId}/schedule/open?apikey=${API_KEY}`);
}

export async function getStorePromotions(storeCode: string) {
  return apiFetch<any>(`/promotion?store=${storeCode}`);
}

export async function getStorePaymentInfo(storeId: number) {
  return apiFetch<any>(`/store/${storeId}/payment/info`);
}

export async function getDeliveryRate(storeId: number, lat: number, lng: number, distanceKm: number, durationMin: number) {
  return apiFetch<any>(`/delivery/request/purchase/deliveryRate?storeId=${storeId}&lat=${lat}&lng=${lng}&distance=${distanceKm}&duration=${durationMin}`);
}

export async function getCustomerLoyalties(phone: string) {
  try {
    const res = await fetch(`${API_BASE}/loyalties/${phone}`, { headers: { 'Content-Type': 'application/json' } });
    const text = await res.text();
    return JSON.parse(text) as ApiResponse<any>;
  } catch (error) {
    return { code: 500, data: null, message: 'Error al consultar cupones' };
  }
}

export async function submitPurchaseOrder(orderData: object, paymentFile?: File) {
  try {
    const formData = new FormData();
    formData.append('orderData', JSON.stringify(orderData));
    if (paymentFile) {
      formData.append('paymentFile', paymentFile);
    }

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
      return JSON.parse(text) as ApiResponse<{ id: number; url: string }>;
    } catch {
      return { code: res.status || 500, data: null as any, message: text || 'Error interno en el servidor de Osvaldo' };
    }
  } catch (error) {
    return { code: 500, data: null as any, message: 'Error de red al procesar la compra' };
  }
}

export async function getOrderTimeline(orderId: number | string) {
  try {
    const res = await fetch(`${API_BASE}/delivery/request/${orderId}/public?apiKey=${API_KEY}`, { headers: { 'Content-Type': 'application/json' } });
    const text = await res.text();
    return JSON.parse(text) as ApiResponse<any>;
  } catch (error) {
    return { code: 500, data: null, message: 'Error al obtener seguimiento' };
  }
}
