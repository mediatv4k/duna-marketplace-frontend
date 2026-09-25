import { useCallback, useEffect, useRef, useState } from 'react';

// Faro guiado del checkout: pulso naranja breve (se apaga solo) + scroll suave hacia el siguiente paso.
// `motion-safe:` => con "reducir movimiento" no anima. Solo Tailwind y React nativo, sin librerías.
export const BEACON_CLASS = 'ring-2 ring-[#FE6712] ring-offset-2 shadow-md shadow-[#FE6712]/20 motion-safe:animate-pulse';

// Un `overflow-y: auto|scroll` que realmente desborda: solo entonces tiene sentido hacer scroll (dentro de un modal fijo
// sin scroll propio, scrollIntoView podría mover la página de fondo).
function hasScrollableAncestor(el: HTMLElement): boolean {
  let node: HTMLElement | null = el.parentElement;
  while (node && node !== document.body) {
    const oy = getComputedStyle(node).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && node.scrollHeight > node.clientHeight + 1) return true;
    node = node.parentElement;
  }
  return false;
}

const USER_SCROLL_QUIET_MS = 1500;

// IMPORTANTE: es un hook — llamarlo SIEMPRE en el nivel superior del componente, antes de cualquier return condicional
// (un hook después de un return provoca el error #300 de React).
export function useBeacon<T extends string>(defaultMs = 2000) {
  const [active, setActive] = useState<T | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastUserScrollRef = useRef(0);

  // Si el usuario está scrolleando con el dedo o la rueda, el faro no lo mueve (solo pulsa): evita saltos bruscos
  useEffect(() => {
    const mark = () => { lastUserScrollRef.current = Date.now(); };
    window.addEventListener('wheel', mark, { passive: true, capture: true });
    window.addEventListener('touchmove', mark, { passive: true, capture: true });
    return () => {
      window.removeEventListener('wheel', mark, { capture: true } as EventListenerOptions);
      window.removeEventListener('touchmove', mark, { capture: true } as EventListenerOptions);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const fire = useCallback((beacon: T, ms: number = defaultMs) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActive(beacon);
    timerRef.current = setTimeout(() => setActive(null), ms);
  }, [defaultMs]);

  const scrollTo = useCallback((el: HTMLElement | null, block: ScrollLogicalPosition = 'center') => {
    if (!el || typeof window === 'undefined') return;
    if (Date.now() - lastUserScrollRef.current < USER_SCROLL_QUIET_MS) return;
    if (!hasScrollableAncestor(el)) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block });
  }, []);

  return { active, fire, scrollTo };
}
