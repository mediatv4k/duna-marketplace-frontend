'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

// Asistente de recuperación de ventas (esqueleto). Componente 100% aislado: no lee ni modifica el carrito, las categorías ni el backend.
// Vigila la inactividad del usuario y, pasado el tiempo, muestra un widget flotante y saluda una sola vez con la voz nativa del
// navegador (Web Speech API). Los navegadores pueden bloquear la voz si la página aún no recibió ninguna interacción del usuario.

const IDLE_MS = 15000;
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = ['mousemove', 'touchstart', 'keydown', 'scroll'];
const GREETING = 'Hola, ¿te puedo ayudar con esta fase y dirigirte en el proceso hasta que hagas tu compra?';

interface SalesRecoveryAssistantProps {
  idleMs?: number;
  onAccept?: () => void; // acción futura del asistente; por ahora solo se cierra el widget
}

export default function SalesRecoveryAssistant({ idleMs = IDLE_MS, onAccept }: SalesRecoveryAssistantProps) {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSpokenRef = useRef(false);

  const restartTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsIdle(true), idleMs);
  }, [idleMs]);

  // Inactividad: cualquier actividad reinicia la cuenta. El widget, una vez visible, solo se cierra con la X o con "Sí, ayúdame"
  // (si se ocultara al mover el mouse, el usuario no podría alcanzar el botón).
  useEffect(() => {
    restartTimer();
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, restartTimer, { passive: true }));
    return () => {
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, restartTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [restartTimer]);

  // Voz nativa: solo la primera vez que el usuario queda inactivo
  useEffect(() => {
    if (!isIdle || hasSpokenRef.current) return;
    hasSpokenRef.current = true;
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      const utterance = new SpeechSynthesisUtterance(GREETING);
      utterance.lang = 'es-US';
      const spanish = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('es'));
      if (spanish) utterance.voice = spanish;
      window.speechSynthesis.speak(utterance);
    } catch {
      /* el navegador bloqueó la síntesis de voz */
    }
  }, [isIdle]);

  // Al desmontar (p. ej. salir de la tienda) se corta cualquier voz en curso
  useEffect(() => {
    return () => {
      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
      } catch {
        /* sin síntesis de voz */
      }
    };
  }, []);

  const dismiss = () => {
    try {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } catch {
      /* sin síntesis de voz */
    }
    setIsIdle(false);
    restartTimer();
  };

  if (!isIdle) return null;

  return (
    <div
      role="dialog"
      aria-label="Asistente de compra"
      className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 bg-white rounded-2xl shadow-xl border border-brand-orange/20 p-4 w-72"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar asistente"
        className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-slate-300 hover:bg-slate-100 hover:text-slate-500 transition cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <p className="pr-6 text-sm font-medium text-slate-600 leading-snug">Hola, ¿puedo ayudarte a terminar tu pedido?</p>
      <button
        type="button"
        onClick={() => {
          onAccept?.();
          dismiss();
        }}
        className="mt-3 w-full rounded-xl bg-[#fe6712] hover:bg-[#e0580d] py-2 text-xs font-black text-white shadow-md transition cursor-pointer"
      >
        Sí, ayúdame
      </button>
    </div>
  );
}
