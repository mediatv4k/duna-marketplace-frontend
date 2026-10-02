/**
 * ==============================================================================
 * BITÁCORA DE ACTUALIZACIÓN - MOTOR UNIVERSAL DE COMPARTIR WHATSAPP (FASE 2)
 * ==============================================================================
 * Fecha: Lunes, 07 de Septiembre de 2026
 * Hora Local: 12:56 AM (Cabimas, Estado Zulia, Venezuela)
 * Archivo: src/lib/shareUtils.ts
 * ==============================================================================
 */

export function shareStoreWhatsApp(store: { name: string; code: string; address?: string }) {
  const storeUrl = `${window.location.origin}/store/${store.code}`;
  const text = `✨ *¡Visita ${store.name} en D'una Marketplace!*\n\n📍 ${store.address || 'Cabimas, Zulia'}\n\n🔗 *Pídelo con delivery express aquí:*\n${storeUrl}\n\n👉 _¡Ecosistema digital D'una Group!_`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

// ── Compartir un producto por WhatsApp (enlace directo + talla + precio en $ y Bs.) ─────────────────────────────────────
// Migrado del script de Bereshit Boutique. Tres funciones puras (sin `window`): la ficha arma con ellas el enlace del botón.

/**
 * Enlace directo a la ficha del producto: la ruta real `/store/{code}/product/{id}` (existe desde 2026-09-26 y trae etiquetas
 * Open Graph, así que WhatsApp muestra la vista previa con foto). Mismo formato que arma el botón "Compartir" del modal.
 * El script original usaba `?item={code}` sobre la página actual: ese parámetro no lo lee ninguna pantalla de esta app.
 */
export function buildProductShareUrl(origin: string, storeCode: string, productId: string | number): string {
  return `${String(origin || '').replace(/\/+$/, '')}/store/${storeCode}/product/${productId}`;
}

export interface ProductShareData {
  productName: string;
  storeName?: string | null;
  /** Talla elegida, tal como llega del backend ("Talla M"); sin talla elegida el mensaje no la menciona */
  sizeLabel?: string | null;
  /** Precio unitario en USD de la configuración actual; sin precio válido el mensaje no lo menciona */
  priceUsd?: number | null;
  /** Tasa oficial del comercio (`referenceRateValue`). Sin tasa real NO se escribe ningún monto en Bs. (AGENTS.md §2.2) */
  bcvRate?: number | null;
  url: string;
}

/** Texto del mensaje (formato de WhatsApp: *negrita*). Los emojis son del mensaje saliente, no de la interfaz. */
export function buildProductWhatsAppText(data: ProductShareData): string {
  const store = String(data.storeName || '').trim();
  const size = String(data.sizeLabel || '').replace(/\b(?:tallas?|sizes?)\b\s*:?/gi, ' ').replace(/\s+/g, ' ').trim();
  const price = Number(data.priceUsd);
  const rate = Number(data.bcvRate);
  const lines: string[] = [
    `✨ *¡Mira esto en ${store ? `${store} (D'una Marketplace)` : "D'una Marketplace"}!*`,
    '',
    `🛍️ *${String(data.productName || '').trim()}*`,
  ];
  if (size) lines.push(`📏 Talla: ${size}`);
  if (Number.isFinite(price) && price > 0) {
    const bs = Number.isFinite(rate) && rate > 0
      ? ` (Bs. ${(price * rate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
      : '';
    lines.push(`💰 Precio: $${price.toFixed(2)}${bs}`);
  }
  lines.push('', '🔗 Cómpralo directo aquí:', data.url);
  return lines.join('\n');
}

export function whatsAppSendUrl(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/** Abre WhatsApp con el mensaje del producto. (La ficha usa un enlace `<a>` con `whatsAppSendUrl`; esto queda para usos imperativos.) */
export function shareProductWhatsApp(data: ProductShareData) {
  window.open(whatsAppSendUrl(buildProductWhatsAppText(data)), '_blank', 'noopener,noreferrer');
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
}

// Compartir nativo (2026-09-22): abre el selector nativo del sistema (`navigator.share`, WhatsApp/Instagram/Mail/
// lo que el usuario tenga instalado) en vez de forzar WhatsApp como los helpers de arriba. Sin soporte (la mayoría
// de navegadores de escritorio) o si el usuario cancela, cae a copiar el enlace al portapapeles. Nunca lanza: el
// botón que lo llama decide cómo avisar el resultado (`ok: 'shared' | 'copied' | 'failed'`).
export type NativeShareResult = { ok: 'shared' | 'copied' | 'failed' };

export async function shareNative(data: { title: string; text: string; url: string }): Promise<NativeShareResult> {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share(data);
      return { ok: 'shared' };
    }
  } catch (err: any) {
    // AbortError: el usuario cerró el selector nativo sin elegir nada — no es un error real, no se cae a copiar
    if (err?.name === 'AbortError') return { ok: 'failed' };
  }
  const copied = await copyToClipboard(data.url).catch(() => false);
  return { ok: copied ? 'copied' : 'failed' };
}