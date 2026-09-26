const CLOUD_NAME = 'rukjbnry';

/**
 * Optimiza y encuadra automáticamente los productos al vuelo:
 * - PROMOTION: Conserva geometría original sin recortar (f_auto,q_auto).
 * - PRODUCT: Muestra la imagen completa, centrada en un lienzo de 512x512
 *   con fondo blanco, sin recortar contenido ni textos.
 */
export function getOptimizedImageUrl(
  url: string | undefined | null,
  entityType: 'PRODUCT' | 'PROMOTION' = 'PRODUCT'
): string {
  if (!url || typeof url !== 'string') return '/placeholder.png';
  if (url.startsWith('/') || url.includes('cloudinary.com')) return url;

  // Promociones: se optimizan en formato WebP sin forzar dimensiones cuadradas
  if (entityType === 'PROMOTION') {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/f_auto,q_auto/${encodeURIComponent(url)}`;
  }

  // Productos: Se adaptan completamente en 512x512 con padding blanco sin recorte
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/c_pad,w_512,h_512,b_white,f_auto,q_auto/${encodeURIComponent(url)}`;
}
