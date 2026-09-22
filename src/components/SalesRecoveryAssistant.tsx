'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, X } from 'lucide-react';

// Asistente de ventas. Componente 100% aislado: no lee ni modifica el carrito, las categorías ni el catálogo.
// Vigila la inactividad del usuario y, pasado el tiempo, muestra un widget flotante y saluda una sola vez con la voz nativa del
// navegador (Web Speech API). Con "Sí, ayúdame" se vuelve interactivo: el cliente dicta con el micrófono, el texto viaja a
// POST /api/assistant (Gemini; la API key vive solo en el servidor) y la respuesta se muestra en un globo y se lee en voz alta.
// Los navegadores pueden bloquear la voz si la página aún no recibió ninguna interacción del usuario.
//
// Blindaje anti-bucles (revisado 2026-09-21): ningún useEffect depende de un estado que él mismo actualice
// (restartTimer solo depende de idleMs/muted; el saludo solo depende de isIdle/muted y se autolimita con
// hasSpokenRef). `contextRef` se muta directamente en cada render y nunca dispara un re-render por sí sola,
// así que no puede formar un ciclo. La única fuente real de fetches repetidos era el usuario disparando `ask()`
// más de una vez (doble tap, eco del reconocimiento): ver `isProcessingRef`/`isProcessing` más abajo.

const IDLE_MS = 15000;
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = ['mousemove', 'touchstart', 'keydown', 'scroll'];
const GREETING = 'Hola, ¿te puedo ayudar con esta fase y dirigirte en el proceso hasta que hagas tu compra?';

const MUTE_TAG = '[MUTE_ASSISTANT]';
const CART_TAG_RE = /\[AGREGAR_CARRITO:([a-zA-Z0-9_-]+):(\d+)\]/; // comando de venta: agregar `cantidad` del producto `id`
const PRODUCT_TAG_RE = /\[VER_PRODUCTO:([a-zA-Z0-9_-]+)\]/; // comando de navegación: abre la ficha del producto
const MUTE_STORAGE_KEY = 'duna_assistant_muted'; // silencio para el resto de la sesión (sessionStorage)

// Regla 6 (FORMATO ESTRICTO DE VOZ): Gemini a veces igual devuelve Markdown pese al prompt. Se limpia antes de mostrarlo
// en el globo o de pasarlo al sintetizador de voz, que si no lee los símbolos en voz alta ("asterisco asterisco Hola…").
function stripMarkdown(text: string): string {
  return text
    .replace(/[*_#]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

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
  menuContext?: string; // catálogo resumido de la tienda actual (lo arma el padre; el asistente no lee el catálogo)
  cartContext?: string; // carrito actual resumido (lo arma el padre; el asistente no lee ni toca el carrito)
  onAddToCart?: (id: string, qty: number) => void; // el padre decide cómo agregarlo (hoy abre la ficha para confirmar variantes)
  onOpenProduct?: (productId: string) => void; // el padre abre la ficha del producto (la app no tiene rutas /store/.../product: la ficha es un modal)
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

export default function SalesRecoveryAssistant({ idleMs = IDLE_MS, onAccept, menuContext, cartContext, onOpenProduct, onAddToCart }: SalesRecoveryAssistantProps) {
  return null; // [TEMP] Desactivado temporalmente por solicitud del usuario para trabajos de UI.

  const [isIdle, setIsIdle] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [bubble, setBubble] = useState('');
  const [notice, setNotice] = useState('');
  const [canListen, setCanListen] = useState(false);
  const [muted, setMuted] = useState(false); // el cliente prefiere comprar solo: el asistente desaparece el resto de la sesión
  const [farewell, setFarewell] = useState(false); // despedida en curso: micrófono deshabilitado hasta que se oculte
  const [isProcessing, setIsProcessing] = useState(false); // hay una consulta en curso (fetch real o simulada): micrófono bloqueado
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSpokenRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const abortRef = useRef<AbortController | null>(null);
  const aliveRef = useRef(true);
  // Espejo síncrono de `isProcessing`: el estado de React tarda un render en reflejarse y `ask` necesita el valor
  // ya actualizado en la misma llamada (si no, dos disparos seguidos —doble tap, eco del reconocimiento— entrarían los dos).
  const isProcessingRef = useRef(false);
  // El último contexto siempre disponible para `ask` sin recrear el callback en cada cambio del carrito
  // (es una ref mutada en cada render, no un estado: no dispara re-render ni puede formar un bucle).
  const contextRef = useRef({ menuContext, cartContext, onOpenProduct, onAddToCart });
  contextRef.current = { menuContext, cartContext, onOpenProduct, onAddToCart };

  const restartTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsIdle(true), idleMs);
  }, [idleMs]);

  // Inactividad: cualquier actividad reinicia la cuenta. El widget, una vez visible, solo se cierra con la X
  // (si se ocultara al mover el mouse, el usuario no podría alcanzar el botón).
  useEffect(() => {
    if (muted) return;
    restartTimer();
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, restartTimer, { passive: true }));
    return () => {
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, restartTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [restartTimer, muted]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(MUTE_STORAGE_KEY) === '1') setMuted(true);
    } catch {
      /* sin sessionStorage */
    }
  }, []);

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
    if (muted || !isIdle || hasSpokenRef.current) return;
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
  }, [isIdle, muted]);

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

  // Silencio definitivo (resto de la sesión): corta voz/escucha/petición y oculta toda la interfaz
  const muteNow = useCallback(() => {
    stopEverything();
    setMuted(true);
  }, [stopEverything]);

  const ask = useCallback(async (text: string) => {
    // Blindaje anti-bucles: una consulta ya en curso ignora cualquier otra (doble tap, eco del reconocimiento,
    // o una segunda llamada mientras la primera todavía espera la API). La función de envío corta aquí mismo.
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsProcessing(true);
    setPhase('thinking');
    setNotice('');
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      let ok = true;
      let rawReply = '';
      let apiError: string | undefined;

      // Modo simulador: la palabra exacta "TEST" prueba todo el flujo (globo, voz, comandos, silencio) sin llamar a
      // Gemini ni gastar cuota — útil para QA repetida. Comparación sin distinguir mayúsculas: la voz suele transcribir en minúsculas.
      if (text.trim().toUpperCase() === 'TEST') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (!aliveRef.current) return;
        rawReply = 'Respuesta de prueba [AGREGAR_CARRITO:2172:3]';
      } else {
        const res = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, menuContext: contextRef.current.menuContext, cartContext: contextRef.current.cartContext }),
          signal: controller.signal,
        });
        const data = await res.json().catch(() => null);
        if (!aliveRef.current) return;
        ok = res.ok;
        rawReply = typeof data?.reply === 'string' ? data.reply : '';
        apiError = data?.error;
      }

      const wantsMute = ok && rawReply.includes(MUTE_TAG);
      // La etiqueta es una señal interna: nunca se muestra ni se lee en voz alta
      // Comando [VER_PRODUCTO:id]: se extrae el id y la etiqueta se quita del texto (ni se muestra ni se lee)
      const productMatch = ok ? rawReply.match(PRODUCT_TAG_RE) : null;
      // Comando [AGREGAR_CARRITO:id:cantidad]: mismo trato; si vienen los dos comandos, manda el de venta (no se abre la ficha dos veces)
      const cartMatch = ok ? rawReply.match(CART_TAG_RE) : null;
      const taglessReply = rawReply
        .split(MUTE_TAG).join('')
        .replace(new RegExp(PRODUCT_TAG_RE.source, 'g'), '')
        .replace(new RegExp(CART_TAG_RE.source, 'g'), '')
        .trim();
      // El globo y la voz solo ven texto ya purificado de Markdown
      const reply = stripMarkdown(taglessReply);
      if (cartMatch) {
        const qty = Math.min(Math.max(parseInt(cartMatch[2], 10) || 1, 1), 99);
        try { contextRef.current.onAddToCart?.(cartMatch[1], qty); } catch { /* el padre no pudo agregar */ }
      } else if (productMatch) {
        try { contextRef.current.onOpenProduct?.(productMatch[1]); } catch { /* el padre no pudo abrir la ficha */ }
      }
      if ((productMatch || cartMatch) && !reply) {
        setPhase('idle');
        return;
      }
      if (wantsMute) {
        try { sessionStorage.setItem(MUTE_STORAGE_KEY, '1'); } catch { /* sin sessionStorage */ }
      }
      if (wantsMute && !reply) {
        muteNow();
        return;
      }
      if (!ok || !reply) {
        setBubble('');
        setNotice(apiError || 'No pude responder ahora. Intenta de nuevo.');
        setPhase('idle');
        return;
      }
      setBubble(reply);
      if (wantsMute) setFarewell(true);
      setPhase('speaking');
      // Con despedida, la interfaz se oculta cuando termina de hablar (o a los 4 s si el navegador no tiene voz)
      const started = speak(reply, () => {
        if (!aliveRef.current) return;
        setPhase('idle');
        if (wantsMute) muteNow();
      });
      if (!started) {
        setPhase('idle');
        if (wantsMute) setTimeout(() => { if (aliveRef.current) muteNow(); }, 4000);
      }
    } catch (e: any) {
      if (!aliveRef.current || e?.name === 'AbortError') return;
      setBubble('');
      setNotice('No pude conectarme. Intenta de nuevo.');
      setPhase('idle');
    } finally {
      // Se libera apenas se conoce el resultado (no espera a que termine de hablar): así el micrófono ya
      // permite interrumpir la voz, igual que antes de este blindaje.
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [muteNow]);

  const toggleMic = () => {
    // El botón ya queda `disabled` en estos casos; el guardia se repite aquí por si se dispara por otra vía (defensivo)
    if (farewell || isProcessing) return;
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

  if (muted || !isIdle) return null;

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
                disabled={farewell || isProcessing}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition cursor-pointer disabled:cursor-default disabled:opacity-60 ${
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
