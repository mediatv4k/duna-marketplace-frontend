const CLOUD_NAME = 'rukjbnry';

/**
 * Normaliza imágenes de productos a 512x512 mediante Cloudinary Fetch.
 * Si es una promoción o banner, no altera su geometría ni proporción.
 */
export function getOptimizedImageUrl(
  url: string | undefined | null,
  entityType: 'PRODUCT' | 'PROMOTION' = 'PRODUCT'
): string {
  if (!url || typeof url !== 'string') return '/placeholder.png';
  if (url.startsWith('/') || url.includes('cloudinary.com')) return url;

  // REGLA: Promociones se optimizan sin recortar ni forzar cuadrado
  if (entityType === 'PROMOTION') {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/f_auto,q_auto/${encodeURIComponent(url)}`;
  }

  // REGLA: Productos se transforman estrictamente en cuadrado 512x512 con fondo extendido continuo
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/c_pad,w_512,h_512,b_auto:predominant_gradient,f_auto,q_auto/${encodeURIComponent(url)}`;
}
