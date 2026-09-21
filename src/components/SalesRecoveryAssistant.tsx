'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, X } from 'lucide-react';

// Asistente de ventas. Componente 100% aislado: no lee ni modifica el carrito, las categorías ni el catálogo.
// Vigila la inactividad del usuario y, pasado el tiempo, muestra un widget flotante y saluda una sola vez con la voz nativa del
// navegador (Web Speech API). Con "Sí, ayúdame" se vuelve interactivo: el cliente dicta con el micrófono, el texto viaja a
// POST /api/assistant (Gemini; la API key vive solo en el servidor) y la respuesta se muestra en un globo y se lee en voz alta.
// Los navegadores pueden bloquear la voz si la página aún no recibió ninguna interacción del usuario.

const IDLE_MS = 15000;
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = ['mousemove', 'touchstart', 'keydown', 'scroll'];
const GREETING = 'Hola, ¿te puedo ayudar con esta fase y dirigirte en el proceso hasta que hagas tu compra?';

type Phase = 'idle' | 'listening' | 'thinking' | 'speaking';

const PHASE_LABEL: Record<Phase, string> = {
  idle: 'Toca el micrófono y dime qué buscas',
  listening: 'Escuchando...',
  thinking: 'Pensando...',
  speaking: 'Hablando',
};

interface SalesRecoveryAssistantProps {
  idleMs?: number;
  onAccept?: () => void; // acción extra opcional al aceptar la ayuda
}

function speak(text: string, onEnd: () => void): boolean {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-US';
    const spanish = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('es'));
    if (spanish) utterance.voice = spanish;
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export default function SalesRecoveryAssistant({ idleMs = IDLE_MS, onAccept }: SalesRecoveryAssistantProps) {
  const [isIdle, setIsIdle] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [bubble, setBubble] = useState('');
  const [notice, setNotice] = useState('');
  const [canListen, setCanListen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSpokenRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const abortRef = useRef<AbortController | null>(null);
  const aliveRef = useRef(true);

  const restartTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsIdle(true), idleMs);
  }, [idleMs]);

  // Inactividad: cualquier actividad reinicia la cuenta. El widget, una vez visible, solo se cierra con la X
  // (si se ocultara al mover el mouse, el usuario no podría alcanzar el botón).
  useEffect(() => {
    restartTimer();
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, restartTimer, { passive: true }));
    return () => {
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, restartTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [restartTimer]);

  useEffect(() => {
    try {
      const w = window as any;
      setCanListen(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
    } catch {
      setCanListen(false);
    }
  }, []);

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

  const stopEverything = useCallback(() => {
    try { recognitionRef.current?.abort(); } catch { /* sin reconocimiento activo */ }
    recognitionRef.current = null;
    try { abortRef.current?.abort(); } catch { /* sin petición en curso */ }
    abortRef.current = null;
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    } catch {
      /* sin síntesis de voz */
    }
  }, []);

  // Al desmontar (p. ej. salir de la tienda) se corta cualquier voz, escucha o petición en curso
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      stopEverything();
    };
  }, [stopEverything]);

  const ask = useCallback(async (text: string) => {
    setPhase('thinking');
    setNotice('');
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => null);
      if (!aliveRef.current) return;
      const reply = typeof data?.reply === 'string' ? data.reply.trim() : '';
      if (!res.ok || !reply) {
        setBubble('');
        setNotice(data?.error || 'No pude responder ahora. Intenta de nuevo.');
        setPhase('idle');
        return;
      }
      setBubble(reply);
      setPhase('speaking');
      const started = speak(reply, () => { if (aliveRef.current) setPhase('idle'); });
      if (!started) setPhase('idle');
    } catch (e: any) {
      if (!aliveRef.current || e?.name === 'AbortError') return;
      setBubble('');
      setNotice('No pude conectarme. Intenta de nuevo.');
      setPhase('idle');
    }
  }, []);

  const toggleMic = () => {
    try {
      if (phase === 'listening') {
        recognitionRef.current?.stop();
        return;
      }
      if (phase === 'thinking' || phase === 'speaking') {
        // Un toque durante la respuesta la interrumpe y deja al asistente listo para escuchar de nuevo
        stopEverything();
        setPhase('idle');
        return;
      }
      const w = window as any;
      const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (!Ctor) return;
      try { window.speechSynthesis?.cancel(); } catch { /* sin síntesis de voz */ }
      setNotice('');
      const recognition = new Ctor();
      recognition.lang = 'es-VE';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;
      let gotText = false;
      recognition.onstart = () => setPhase('listening');
      recognition.onresult = (event: any) => {
        try {
          const transcript = String(event?.results?.[0]?.[0]?.transcript || '').trim();
          if (transcript) {
            gotText = true;
            ask(transcript);
          }
        } catch {
          /* resultado inesperado: se ignora */
        }
      };
      recognition.onerror = (event: any) => {
        if (!aliveRef.current) return;
        setPhase('idle');
        if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
          setNotice('Permite el acceso al micrófono en tu navegador para hablar conmigo.');
        } else if (event?.error === 'no-speech') {
          setNotice('No te escuché. Toca el micrófono e inténtalo otra vez.');
        }
      };
      recognition.onend = () => {
        if (!aliveRef.current) return;
        // Si terminó sin texto ni error, se vuelve a reposo; si hubo texto, `ask` ya pasó a "Pensando..."
        setPhase((p) => (p === 'listening' && !gotText ? 'idle' : p));
      };
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setPhase('idle');
      setNotice('No se pudo activar el micrófono.');
    }
  };

  const dismiss = () => {
    stopEverything();
    setPhase('idle');
    setBubble('');
    setNotice('');
    setChatOpen(false);
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

      {!chatOpen ? (
        <>
          <p className="pr-6 text-sm font-medium text-slate-600 leading-snug">Hola, ¿puedo ayudarte a terminar tu pedido?</p>
          <button
            type="button"
            onClick={() => {
              try { window.speechSynthesis?.cancel(); } catch { /* sin síntesis de voz */ }
              onAccept?.();
              setChatOpen(true);
            }}
            className="mt-3 w-full rounded-xl bg-[#fe6712] hover:bg-[#e0580d] py-2 text-xs font-black text-white shadow-md transition cursor-pointer"
          >
            Sí, ayúdame
          </button>
        </>
      ) : (
        <div className="pr-6">
          {bubble && (
            <p className="mb-3 rounded-2xl rounded-tl-sm bg-orange-50 border border-orange-100 px-3 py-2 text-sm font-medium text-slate-700 leading-snug">
              {bubble}
            </p>
          )}
          {notice && <p className="mb-3 text-xs font-bold text-red-500 leading-snug">{notice}</p>}
          {canListen ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMic}
                aria-label={phase === 'listening' ? 'Dejar de escuchar' : phase === 'idle' ? 'Hablar con el asistente' : 'Detener'}
                aria-pressed={phase === 'listening'}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition cursor-pointer ${
                  phase === 'listening'
                    ? 'bg-[#fe6712] text-white animate-pulse shadow-md shadow-orange-500/30'
                    : phase === 'idle'
                      ? 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-[#fe6712]'
                      : 'bg-orange-100 text-[#fe6712]'
                }`}
              >
                <Mic className="h-5 w-5" />
              </button>
              <p className={`text-xs font-bold leading-snug ${phase === 'idle' ? 'text-slate-500' : 'text-[#fe6712]'}`} aria-live="polite">
                {PHASE_LABEL[phase]}
              </p>
            </div>
          ) : (
            <p className="text-xs font-medium text-slate-500 leading-snug">Tu navegador no permite dictado por voz. Prueba con Chrome o Edge.</p>
          )}
        </div>
      )}
    </div>
  );
}
