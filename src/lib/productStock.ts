// Stock Guard: un solo criterio de "agotado" para el orden del catálogo, la tarjeta, el probador de talla y las sugerencias.
// Función pura. Campos reales del backend (verificados en DEV):
//   · listado  `GET /products/store/{id}`  → `outOfStock` (true | false | null). No trae `status`.
//   · detalle  `GET /product/{id}/web`     → `storeManageStock` + `stock` (0 = agotado). No trae `outOfStock`.
// `status === 'INACTIVE'` se conserva porque el catálogo ya lo contemplaba.

export function isProductSoldOut(product: any): boolean {
  if (!product) return false;
  if (product.status === 'INACTIVE' || Boolean(product.outOfStock)) return true;
  return product.storeManageStock === true && Number.isFinite(Number(product.stock)) && Number(product.stock) <= 0;
}

/**
 * Comparador para `Array.prototype.sort`: disponibles primero, agotados al final. Devuelve 0 entre productos del mismo
 * grupo, así el orden del backend se conserva dentro de cada uno (el sort de JS es estable). Compara booleanos: comparar
 * los valores crudos (`null` contra `false`) daba -1 en los dos sentidos y podía desordenar una tienda que mezclara ambos.
 */
export function compareBySoldOut(a: any, b: any): number {
  const aOut = isProductSoldOut(a);
  const bOut = isProductSoldOut(b);
  if (aOut === bOut) return 0;
  return aOut ? 1 : -1;
}
