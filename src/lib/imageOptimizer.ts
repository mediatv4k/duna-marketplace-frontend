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

  // Productos: Outpainting con IA Generativa (b_gen_fill) a 512x512 exactos
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/c_pad,w_512,h_512,b_gen_fill,f_auto,q_auto/${encodeURIComponent(url)}`;
}
