'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Mic } from 'lucide-react';

// Botón de dictado por voz para el buscador (Web Speech API nativa). Aislado: solo entrega el texto reconocido por `onResult`;
// no conoce el catálogo ni el carrito. Si el navegador no soporta la API no se dibuja nada, y cualquier error (permiso denegado,
// micrófono ocupado, sin voz) se maneja en silencio para no romper la interfaz.

interface VoiceSearchButtonProps {
  onResult: (text: string) => void;
  lang?: string;
  className?: string;
}

export default function VoiceSearchButton({ onResult, lang = 'es-VE', className = '' }: VoiceSearchButtonProps) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [denied, setDenied] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    try {
      const w = window as any;
      setSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
    } catch {
      setSupported(false);
    }
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        /* sin reconocimiento activo */
      }
    };
  }, []);

  const toggle = () => {
    try {
      if (listening) {
        recognitionRef.current?.stop();
        return;
      }
      const w = window as any;
      const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (!Ctor) return;
      const recognition = new Ctor();
      recognition.lang = lang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;
      recognition.onstart = () => {
        setDenied(false);
        setListening(true);
      };
      recognition.onresult = (event: any) => {
        try {
          const transcript = String(event?.results?.[0]?.[0]?.transcript || '').trim().replace(/[.,;!?¿¡]+$/g, '');
          if (transcript) onResult(transcript);
        } catch {
          /* resultado inesperado: se ignora */
        }
      };
      recognition.onerror = (event: any) => {
        setListening(false);
        if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') setDenied(true);
      };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setListening(false);
    }
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? 'Detener dictado por voz' : 'Buscar por voz'}
      aria-pressed={listening}
      title={denied ? 'Permite el acceso al micrófono en tu navegador para buscar por voz' : listening ? 'Escuchando…' : 'Buscar por voz'}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition cursor-pointer ${
        listening
          ? 'bg-[#fe6712] text-white animate-pulse shadow-md shadow-orange-500/30'
          : denied
            ? 'bg-slate-100 text-slate-300'
            : 'bg-slate-100 text-slate-500 hover:bg-orange-50 hover:text-[#fe6712]'
      } ${className}`}
    >
      <Mic className="h-4 w-4" />
    </button>
  );
}
