'use client';

import React, { useState } from 'react';
import { Link2, Check } from 'lucide-react';
import { buildProductWhatsAppText, whatsAppSendUrl, copyToClipboard, type ProductShareData } from '@/lib/shareUtils';

// Compartir un producto con su enlace directo: por WhatsApp (mensaje con nombre, talla elegida y precio en $ y Bs.) o
// copiando el enlace. Solo presentación: recibe los datos ya calculados por la ficha y no toca carrito ni backend.
// El enlace de WhatsApp es un `<a>` real (no `window.open`), así no lo frena el bloqueador de ventanas emergentes.
export default function ProductShareRow(props: ProductShareData) {
  const [copied, setCopied] = useState(false);
  const waHref = whatsAppSendUrl(buildProductWhatsAppText(props));
  // El subtítulo dice solo lo que el mensaje realmente lleva (sin talla elegida o sin tasa oficial, no se promete)
  const included: string[] = [];
  if (String(props.sizeLabel || '').trim()) included.push('la talla elegida');
  if (Number(props.priceUsd) > 0) included.push(Number(props.bcvRate) > 0 ? 'el precio en $ y Bs.' : 'el precio en $');
  const hint = included.length > 0 ? `El mensaje lleva ${included.join(' y ')}` : 'El enlace abre este producto directamente';

  const handleCopy = async () => {
    const ok = await copyToClipboard(props.url).catch(() => false);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section data-testid="product-share" aria-label="Compartir producto" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-xs font-black text-emerald-950">Compartir enlace directo</p>
        <p data-testid="share-hint" className="text-[10px] font-semibold text-emerald-800">{hint}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="share-whatsapp"
          aria-label="Enviar este producto por WhatsApp"
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#25D366] px-3 text-[11px] font-black text-white shadow-sm transition hover:bg-[#20bd5a] active:scale-95"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-3.5 w-3.5 shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>
        <button
          type="button"
          onClick={handleCopy}
          data-testid="share-copy"
          aria-label="Copiar el enlace de este producto"
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 text-[11px] font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-100 active:scale-95 cursor-pointer"
        >
          {copied ? <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : <Link2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
          {copied ? 'Copiado' : 'Copiar enlace'}
        </button>
      </div>
    </section>
  );
}
