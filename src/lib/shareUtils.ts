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

export function shareProductWhatsApp(product: { name: string; price: number; code: string }, selectedVariant?: string, bcvRate: number = 48.50) {
  const productUrl = `${window.location.origin}${window.location.pathname}?item=${product.code}`;
  const priceBs = (product.price * bcvRate).toFixed(2);
  const variantText = selectedVariant ? ` (Opción: ${selectedVariant})` : '';

  const text = `✨ *¡Mira este producto en D'una Marketplace!*\n\n🛍️ *${product.name}*${variantText}\n💰 *Precio:* $${product.price.toFixed(2)} (~ Bs. ${priceBs})\n\n🔗 *Cómpralo directo aquí:*\n${productUrl}\n\n👉 _¡Delivery inmediato en Cabimas!_`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
}