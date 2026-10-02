'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

// Aviso breve y no bloqueante ("¡Añadido a tus favoritos!"). Uno a la vez: un aviso nuevo reemplaza al anterior. Se apaga solo.
// Va en un portal a <body> por encima de todos los modales (z-[220]) y NUNCA intercepta toques (pointer-events-none): en móvil
// aparece sobre la barra inferior y en escritorio arriba al centro, para no tapar el botón que el cliente acaba de pulsar.
// La región `aria-live` existe desde el montaje (vacía) para que los lectores de pantalla anuncien el texto al insertarse.

export type ToastTone = 'success' | 'info' | 'error';

export interface ToastOptions {
  tone?: ToastTone;
  /** Tiempo visible en ms (mínimo 1500; por defecto 2800). */
  durationMs?: number;
}

type ShowToast = (message: string, options?: ToastOptions) => void;

const ToastContext = createContext<ShowToast>(() => {});

const TONE_ICON: Record<ToastTone, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />,
  info: <Info className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />,
  error: <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string; tone: ToastTone } | null>(null);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const show = useCallback<ShowToast>((message, options) => {
    const text = String(message || '').trim();
    if (!text) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    idRef.current += 1;
    setToast({ id: idRef.current, message: text, tone: options?.tone ?? 'success' });
    timerRef.current = setTimeout(() => setToast(null), Math.max(1500, options?.durationMs ?? 2800));
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {mounted &&
        createPortal(
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="pointer-events-none fixed inset-x-0 bottom-28 z-[220] flex justify-center px-4 md:bottom-auto md:top-6"
          >
            {toast && (
              <div
                key={toast.id}
                data-testid="toast"
                data-tone={toast.tone}
                className="flex max-w-[min(92vw,380px)] items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-2.5 text-xs font-bold leading-snug text-white shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200"
              >
                {TONE_ICON[toast.tone]}
                <span>{toast.message}</span>
              </div>
            )}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

/** Muestra un aviso breve. Fuera de un `ToastProvider` no hace nada. */
export function useToast(): ShowToast {
  return useContext(ToastContext);
}
