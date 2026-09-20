'use client';

import { useEffect, useRef } from 'react';
import type { TrackingPhase } from '@/lib/orderTracking';

// Chime armonioso con Web Audio API (dos tonos senoidales suaves, sin archivos externos)
function playChime(ctx: AudioContext) {
  const start = ctx.currentTime;
  [[659.25, 0], [987.77, 0.22]].forEach(([freq, offset]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, start + offset);
    gain.gain.linearRampToValueAtTime(0.25, start + offset + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, start + offset + 0.7);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start + offset);
    osc.stop(start + offset + 0.75);
  });
}

// Alerta sonora + háptica en el instante en que el polling detecta la TRANSICIÓN a "Llega a sitio".
// No suena si el pedido ya estaba en ese estado al cargar (no es una transición). Los navegadores exigen un gesto del
// usuario previo para audio/vibración: se "desbloquea" el AudioContext en el primer toque/clic/tecla de la página.
export function useArrivalAlert(phase: TrackingPhase, hasData: boolean) {
  const audioRef = useRef<AudioContext | null>(null);
  const prevPhaseRef = useRef<TrackingPhase | null>(null);

  useEffect(() => {
    const unlock = () => {
      try {
        const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtor) return;
        if (!audioRef.current) audioRef.current = new AudioCtor();
        if (audioRef.current.state === 'suspended') audioRef.current.resume();
      } catch {
        /* sin Web Audio */
      }
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    if (!hasData) {
      prevPhaseRef.current = null;
      return;
    }
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;
    if (prev === null || prev === 'arrived' || phase !== 'arrived') return;

    try {
      const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtor) {
        if (!audioRef.current) audioRef.current = new AudioCtor();
        const ctx = audioRef.current;
        if (ctx) {
          if (ctx.state === 'suspended') ctx.resume();
          playChime(ctx);
        }
      }
    } catch {
      /* el navegador bloqueó el audio */
    }
    if (typeof window !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([200, 100, 200]);
  }, [phase, hasData]);
}
