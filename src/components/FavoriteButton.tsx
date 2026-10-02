'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { toWishlistItem } from '@/lib/wishlist';

// Corazón de favoritos, compartido por la tarjeta del catálogo (MerchantStoreView) y la ficha del producto (MasterProductModal) para
// que se comporte igual en los dos lugares. Solo presentación: el estado, la condición de sesión y el guardado viven en
// WishlistContext. Recibe el producto y la tienda REALES; sin identidad real (id numérico, nombre, código de tienda) no se dibuja.
// Tampoco se dibuja si este despliegue no tiene inicio de sesión: sin cuenta no hay dónde guardar un favorito.
// El toque no se propaga: en la tarjeta no abre la ficha del producto.

interface FavoriteButtonProps {
  product: unknown;
  store: unknown;
  className?: string;
  iconClassName?: string;
}

export default function FavoriteButton({ product, store, className = '', iconClassName = 'h-4 w-4' }: FavoriteButtonProps) {
  const { isAvailable, isFavorite, toggleFavorite } = useWishlist();
  const candidate = toWishlistItem(product, store);
  if (!isAvailable || !candidate) return null;
  const active = isFavorite(candidate.productId);

  return (
    <button
      type="button"
      data-testid="favorite-button"
      data-product-id={candidate.productId}
      data-favorite={active ? 'true' : 'false'}
      aria-pressed={active}
      aria-label={active ? `Quitar ${candidate.name} de tus favoritos` : `Guardar ${candidate.name} en tus favoritos`}
      title={active ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(candidate);
      }}
      className={className}
    >
      <Heart className={`${iconClassName} transition-transform duration-150 ${active ? 'scale-110 fill-rose-500 text-rose-500' : 'text-slate-500'}`} aria-hidden="true" />
    </button>
  );
}
