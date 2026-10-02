'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin } from 'lucide-react';
import { MAX_DELIVERY_REFERENCE_LENGTH, MIN_DELIVERY_REFERENCE_LENGTH, cleanDeliveryReference, isValidDeliveryReference } from '@/lib/deliveryAddress';

// Dirección o punto de referencia OBLIGATORIO antes de pasar al pago en un pedido a domicilio cuya ubicación no es un punto elegido en el
// mapa (la zona base de Cabimas o un GPS que solo trae el nombre de la ciudad). Sin esto, el repartidor recibiría solo las coordenadas
// genéricas del centro. Lo abre la vista de tienda justo después de "PROCEDER AL PAGO"; el checkout no se toca.

interface DeliveryReferenceModalProps {
  isOpen: boolean;
  /** Referencia ya escrita antes (se conserva mientras la vista de tienda siga abierta). */
  initialValue?: string;
  /** Rótulo de la ubicación que se usará de base (p. ej. "Cabimas, Zulia"). */
  locationLabel?: string;
  /** Volver al carrito sin continuar. */
  onCancel: () => void;
  /** La referencia ya limpia y válida. */
  onConfirm: (reference: string) => void;
}

function DeliveryReferenceBody({ initialValue = '', locationLabel, onCancel, onConfirm }: Omit<DeliveryReferenceModalProps, 'isOpen'>) {
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  const valid = isValidDeliveryReference(value);

  useEffect(() => {
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const lockedByUs = previousOverflow !== 'hidden';
    if (lockedByUs) body.style.overflow = 'hidden';
    inputRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancelRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (lockedByUs) body.style.overflow = previousOverflow;
    };
  }, []);

  // Foco atrapado dentro del diálogo (Tab / Shift+Tab)
  const trapTab = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('input, button:not([disabled])'));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    onConfirm(cleanDeliveryReference(value));
  };

  return createPortal(
    <div className="fixed inset-0 z-[145] flex items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm animate-in fade-in duration-150" data-testid="delivery-reference-modal">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delivery-reference-title"
        onKeyDown={trapTab}
        className="my-auto w-full max-w-[400px] rounded-[28px] border border-slate-100 bg-white p-5 shadow-2xl outline-none sm:p-6"
      >
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff5ed] text-[#fe6712]"><MapPin className="h-5 w-5" aria-hidden="true" /></span>
          <h2 id="delivery-reference-title" className="text-lg font-black leading-tight text-slate-900">¿Dónde entregamos tu pedido?</h2>
        </div>
        <p className="text-xs font-medium leading-relaxed text-slate-500">
          Escribe tu dirección o un punto de referencia (calle, casa o edificio, "cerca de…"). El repartidor lo necesita para llegar{locationLabel ? `; la zona base es ${locationLabel}` : ''}.
        </p>
        <form onSubmit={submit} noValidate className="mt-3">
          <label htmlFor="delivery-reference-input" className="sr-only">Dirección o punto de referencia</label>
          <input
            id="delivery-reference-input"
            ref={inputRef}
            data-testid="delivery-reference-input"
            type="text"
            value={value}
            maxLength={MAX_DELIVERY_REFERENCE_LENGTH}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={touched && !valid}
            aria-describedby="delivery-reference-hint"
            autoComplete="street-address"
            placeholder="Ej. Calle 5, casa 12, frente a la panadería"
            className={`h-12 w-full rounded-xl border bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:bg-white ${touched && !valid ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-[#FE6712]'}`}
          />
          <p id="delivery-reference-hint" data-testid="delivery-reference-hint" role={touched && !valid ? 'alert' : undefined} className={`mt-1.5 text-[11px] font-bold ${touched && !valid ? 'text-red-600' : 'text-slate-400'}`}>
            {touched && !valid ? `Escribe al menos ${MIN_DELIVERY_REFERENCE_LENGTH} caracteres, con letras o números.` : `${cleanDeliveryReference(value).length}/${MAX_DELIVERY_REFERENCE_LENGTH}`}
          </p>
          <button
            type="submit"
            data-testid="delivery-reference-confirm"
            disabled={!valid}
            className="mt-4 h-12 w-full rounded-xl bg-[#FE6712] text-sm font-black text-white shadow-md shadow-orange-500/25 transition hover:bg-[#e0580d] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
          >
            Continuar al pago
          </button>
          <button
            type="button"
            data-testid="delivery-reference-cancel"
            onClick={onCancel}
            className="mt-1 h-10 w-full rounded-xl text-sm font-bold text-slate-500 transition hover:text-slate-800 cursor-pointer"
          >
            Volver al carrito
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function DeliveryReferenceModal({ isOpen, ...rest }: DeliveryReferenceModalProps) {
  if (!isOpen) return null;
  return <DeliveryReferenceBody {...rest} />;
}
