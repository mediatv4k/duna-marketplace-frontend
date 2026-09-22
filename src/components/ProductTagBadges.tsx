'use client';

import React from 'react';
import { Snowflake } from 'lucide-react';
import type { ProductTagKey, ProductTags } from '@/lib/productTags';

// Insignias visuales de las etiquetas ocultas en la descripción (ver `src/lib/productTags.ts`). Compartido por
// `MerchantStoreView` (tarjetas del catálogo) y `MasterProductModal` (ficha del producto) para que el estilo de
// cada etiqueta (colores, ícono) sea idéntico en los dos lugares. Solo presentación: no toca precios ni el carrito.

interface Badge {
  text: string;
  className: string;
  icon?: React.ReactNode;
}

function badgeFor(key: ProductTagKey, rawValue: string): Badge | null {
  const value = rawValue.trim();
  switch (key) {
    case 'VENTA': {
      // Restringida (fórmula/récipe médico) → alerta; libre → tranquilidad; cualquier otro texto → neutral
      if (/f[oó]rmula|r[eé]cipe|prescripci[oó]n/i.test(value)) {
        return { text: value, className: 'bg-red-50 text-red-700 border border-red-100' };
      }
      if (/libre/i.test(value)) {
        return { text: value, className: 'bg-emerald-50 text-emerald-700 border border-emerald-100' };
      }
      return { text: value, className: 'bg-slate-100 text-slate-600' };
    }
    case 'FRIO': {
      // Solo "SI" (con o sin tilde) muestra badge (tono hielo + copo de nieve); cualquier otro valor ("NO", etc.)
      // no se dibuja: en UX no aporta saturar la tarjeta con "Sin refrigeración" para el caso normal/negativo.
      if (/^s[ií]$/i.test(value)) {
        return {
          text: 'Cadena de frío',
          className: 'bg-sky-50 text-sky-700 border border-sky-100',
          icon: <Snowflake className="h-3 w-3" aria-hidden="true" />,
        };
      }
      return null;
    }
    case 'PRINCIPIO':
    case 'CONCENTRACION':
      // El corazón del producto (qué es / cuánto trae): tono corporativo D'una
      return { text: value, className: 'bg-brand-orange-light text-brand-orange border border-orange-100' };
    case 'REGISTRO':
      return { text: `Reg. ${value}`, className: 'bg-slate-100 text-slate-600' };
    case 'MARCA':
    case 'LABORATORIO':
    default:
      return { text: value, className: 'bg-slate-100 text-slate-600' };
  }
}

export default function ProductTagBadges({ tags, className = '' }: { tags: ProductTags; className?: string }) {
  const entries = (Object.entries(tags || {}) as [ProductTagKey, string][])
    .map(([key, value]) => [key, badgeFor(key, value)] as const)
    .filter((entry): entry is [ProductTagKey, Badge] => entry[1] !== null);
  if (entries.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {entries.map(([key, badge]) => (
        <span
          key={key}
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${badge.className}`}
        >
          {badge.icon}
          {badge.text}
        </span>
      ))}
    </div>
  );
}
