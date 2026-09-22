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

export function shareProductWhatsApp(product: { name: string; price: number; code: string }, selectedVariant?: string, bcvRate?: number | null) {
  const productUrl = `${window.location.origin}${window.location.pathname}?item=${product.code}`;
  // Solo se muestra Bs. si se pasa una tasa real
  const priceBsText = bcvRate ? ` (~ Bs. ${(product.price * bcvRate).toFixed(2)})` : '';
  const variantText = selectedVariant ? ` (Opción: ${selectedVariant})` : '';

  const text = `✨ *¡Mira este producto en D'una Marketplace!*\n\n🛍️ *${product.name}*${variantText}\n💰 *Precio:* $${product.price.toFixed(2)}${priceBsText}\n\n🔗 *Cómpralo directo aquí:*\n${productUrl}\n\n👉 _¡Delivery inmediato en Cabimas!_`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
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