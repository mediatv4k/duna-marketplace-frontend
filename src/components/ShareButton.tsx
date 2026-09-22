'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { shareNative } from '@/lib/shareUtils';

// Botón de compartir nativo (2026-09-22), compartido por MerchantStoreView (tienda) y MasterProductModal
// (producto) para que el comportamiento y el feedback visual sean idénticos en los dos lugares. Solo presentación:
// arma `{title, text, url}` y se lo pasa a `shareNative` (ver src/lib/shareUtils.ts); no toca carrito ni backend.
interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  label?: string; // texto visible junto al ícono (opcional; el botón del producto no lleva, el de la tienda sí)
  ariaLabel: string;
  className?: string;
  iconClassName?: string;
}

export default function ShareButton({ title, text, url, label, ariaLabel, className = '', iconClassName = 'w-4 h-4' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await shareNative({ title, text, url });
    if (result.ok === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button type="button" onClick={handleClick} aria-label={ariaLabel} className={className}>
      {copied ? <Check className={iconClassName} /> : <Share2 className={iconClassName} />}
      {label && <span>{copied ? 'Enlace copiado' : label}</span>}
    </button>
  );
}
