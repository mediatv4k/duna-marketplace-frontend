'use client';

import React, { useEffect, useState } from 'react';
import { Bike, Package, Truck } from 'lucide-react';

// "Servicios D'una" (2026-10-02): acceso anclado en la barra de categorías del Home hacia la landing de D'una Delivery, que
// promociona el delivery y los servicios de transporte y encomiendas que vienen. Sustituye al botón "D'una Delivery" de la cabecera.
// Mismo tamaño que una categoría, pero no es una categoría: vive FUERA del carril que se desplaza (por eso queda anclado) y lleva el
// azul corporativo para distinguirse. "Dinámico": el icono alterna entre moto, paquete y camión; con `prefers-reduced-motion` se
// queda fijo. No promete nada que no exista: el texto es solo el nombre y todo lleva a la misma landing.
// `href` lo da quien lo monta (NEXT_PUBLIC_DELIVERY_LANDING_URL); sin destino no se dibuja nada.

const ICONS = [Bike, Package, Truck];
const ROTATE_MS = 2600;

export default function ServicesShortcut({ href }: { href: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % ICONS.length), ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  if (!href) return null;
  const Icon = ICONS[index];

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="services-shortcut"
      aria-label="Servicios D'una"
      title="Servicios D'una: delivery y más"
      className="group flex min-w-[76px] shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-brand-navy to-brand-navy-light p-2 text-white shadow-md shadow-slate-900/15 transition-all hover:shadow-lg active:scale-[0.98] cursor-pointer select-none sm:min-w-[88px]"
    >
      <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#ff9a5c] transition-transform group-hover:scale-110" aria-hidden="true">
        <Icon key={index} className="h-5 w-5 shrink-0 animate-in fade-in zoom-in-75 duration-300" strokeWidth={1.8} />
      </span>
      <span className="text-center text-[10px] font-bold leading-3 tracking-tight sm:text-[11px] sm:leading-[13px]">
        Servicios
        <br />
        D&apos;una
      </span>
    </a>
  );
}
