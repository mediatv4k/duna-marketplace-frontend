// Metadatos ocultos en la descripción del producto (2026-09-22): algunos comercios (p. ej. farmacia) pueden escribir
// etiquetas `[CLAVE: Valor]` dentro del campo `description` del backend para anotar marca, principio activo, laboratorio,
// etc. sin un campo dedicado. `parseDescriptionTags` las extrae y devuelve la descripción limpia por separado.
// Hoy (2026-09-22) ningún producto real del backend DEV trae esta sintaxis (verificado en farmacia, bodegón, tecnología,
// autopartes): sin corchetes, `tags` queda vacío y `cleanDescription` es la descripción original, intacta.

export const PRODUCT_TAG_KEYS = ['MARCA', 'PRINCIPIO', 'CONCENTRACION', 'LABORATORIO', 'REGISTRO', 'VENTA', 'FRIO'] as const;

export type ProductTagKey = (typeof PRODUCT_TAG_KEYS)[number];

export type ProductTags = Partial<Record<ProductTagKey, string>>;

export interface ParsedDescriptionTags {
  cleanDescription: string;
  tags: ProductTags;
}

const TAG_RE = new RegExp(`\\[(${PRODUCT_TAG_KEYS.join('|')})\\s*:\\s*([^\\]]+)\\]`, 'gi');

export function parseDescriptionTags(description?: string | null): ParsedDescriptionTags {
  const text = typeof description === 'string' ? description : '';
  const tags: ProductTags = {};
  if (!text) return { cleanDescription: '', tags };

  const cleanDescription = text
    .replace(TAG_RE, (_match, rawKey: string, rawValue: string) => {
      const key = rawKey.toUpperCase() as ProductTagKey;
      const value = rawValue.trim();
      if (value) tags[key] = value;
      return '';
    })
    // Colapsa los espacios/saltos que deja la etiqueta al quitarla, sin tocar el resto del texto
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([.,;])/g, '$1')
    .trim();

  return { cleanDescription, tags };
}
