const CLOUD_NAME = 'rukjbnry';

/**
 * Optimiza y encuadra automáticamente los productos al vuelo:
 * - PROMOTION: Conserva geometría original sin recortar (f_auto,q_auto).
 * - PRODUCT: La IA detecta el objeto/producto principal, hace zoom y lo maximiza
 *   a 512x512 eliminando espacios muertos para que se vea grande y comercial.
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

  // Productos: Detección de sujeto con IA + Zoom protagónico en 512x512
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/c_fill,g_auto:subject,w_512,h_512,f_auto,q_auto/${encodeURIComponent(url)}`;
}
