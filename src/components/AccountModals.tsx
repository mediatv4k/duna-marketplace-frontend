'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ClipboardList, MapPin, Plus, Trash2, X } from 'lucide-react';
import LocationPickerModal, { type PickedLocation } from '@/components/LocationPickerModal';
import { useAuth } from '@/context/AuthContext';
import { MAX_SAVED_ADDRESSES, addSavedAddress, getSavedAddresses, removeSavedAddress, type SavedAddress } from '@/lib/customerProfile';

// Paneles del menú de la cuenta. Ninguna API expone pedidos ni direcciones por cliente, así que ambos viven SOLO en este dispositivo
// (decisión del 2026-09-26) y las pantallas lo dicen con claridad: nada de datos a medias ni promesas.

// Centro del mapa al AGREGAR una dirección sin ubicación previa del cliente (Cabimas, Zulia; el cliente mueve el pin o busca su dirección)
const DEFAULT_MAP_CENTER = { lat: 10.3950, lng: -71.4450 }; // mismo centro de referencia de Cabimas que usa MarketplaceHub (CABIMAS_CENTER)

function usePanelChrome(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const lockedByUs = previousOverflow !== 'hidden';
    if (lockedByUs) body.style.overflow = 'hidden';
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    ref.current?.focus();
    // Escape también con el foco fuera del panel (p. ej. tras eliminar una dirección, el botón enfocado desaparece y el foco cae a <body>)
    const onWindowKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) onCloseRef.current();
    };
    window.addEventListener('keydown', onWindowKeyDown);
    return () => {
      window.removeEventListener('keydown', onWindowKeyDown);
      if (lockedByUs) body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    }
  };
  return { ref, onKeyDown };
}

// `hidden`: el panel sigue montado (conserva su estado y el bloqueo de scroll) pero no se ve, p. ej. mientras el mapa está encima. El panel va en
// un portal al final de <body> y el mapa no: con el mismo z-index el panel taparía al mapa, por eso se oculta.
// `wide`: paneles con listas (favoritos, últimas compras) que necesitan un poco más de ancho. Exportado para esos paneles.
export function PanelShell({ title, icon, onClose, hidden, wide, children }: { title: string; icon: React.ReactNode; onClose: () => void; hidden?: boolean; wide?: boolean; children: React.ReactNode }) {
  const { ref, onKeyDown } = usePanelChrome(onClose);
  return createPortal(
    <div
      className={`fixed inset-0 z-[150] ${hidden ? 'hidden' : 'flex'} items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm animate-in fade-in duration-150`}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} onKeyDown={onKeyDown} className={`relative my-auto w-full ${wide ? 'max-w-[460px]' : 'max-w-[400px]'} rounded-[28px] border border-slate-100 bg-white p-5 shadow-2xl outline-none sm:p-6`}>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer">
          <X className="h-4 w-4" />
        </button>
        <div className="mb-4 flex items-center gap-2.5 pr-8">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff5ed] text-[#fe6712]">{icon}</span>
          <h2 className="text-lg font-black leading-tight text-slate-900">{title}</h2>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

/** "Mis Pedidos" cuando no hay ningún pedido reciente guardado en este dispositivo. */
export function NoOrdersModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <PanelShell title="Mis Pedidos" icon={<ClipboardList className="h-5 w-5" />} onClose={onClose}>
      <p className="text-sm font-bold text-slate-700">No tienes pedidos recientes en este dispositivo.</p>
      <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-500">
        Aquí ves el seguimiento del pedido que hiciste en este navegador. El historial completo de tu cuenta estará disponible cuando esté conectado al servidor.
      </p>
      <button type="button" onClick={onClose} className="mt-5 h-11 w-full rounded-xl bg-[#FE6712] text-sm font-black text-white transition hover:bg-[#e0580d] active:scale-[0.99] cursor-pointer">
        Entendido
      </button>
    </PanelShell>
  );
}

/** "Direcciones Guardadas": lista, elimina y agrega (con el mismo mapa que usa el carrito). Guardadas por usuario en este dispositivo. */
export function SavedAddressesModal({ isOpen, onClose, initialCenter }: { isOpen: boolean; onClose: () => void; initialCenter?: { lat: number; lng: number } | null }) {
  if (!isOpen) return null;
  return <SavedAddressesBody onClose={onClose} initialCenter={initialCenter ?? DEFAULT_MAP_CENTER} />;
}

function SavedAddressesBody({ onClose, initialCenter }: { onClose: () => void; initialCenter: { lat: number; lng: number } }) {
  const { user } = useAuth();
  const uid = user?.uid ?? '';
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    setAddresses(uid ? getSavedAddresses(uid) : []);
  }, [uid]);

  const handlePicked = (loc: PickedLocation) => {
    if (uid) setAddresses(addSavedAddress(uid, loc));
    setPicking(false);
  };

  const atLimit = addresses.length >= MAX_SAVED_ADDRESSES;

  return (
    <>
      <PanelShell title="Direcciones Guardadas" icon={<MapPin className="h-5 w-5" />} onClose={onClose} hidden={picking}>
        {addresses.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs font-medium text-slate-500">
            Aún no guardas ninguna dirección. Agrega una y la tendrás a un toque al elegir dónde entregar tu pedido.
          </p>
        ) : (
          <ul className="space-y-2" aria-label="Direcciones guardadas">
            {addresses.map((a) => (
              <li key={a.id} className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#fe6712]" aria-hidden="true" />
                <p className="min-w-0 flex-1 text-xs font-bold leading-snug text-slate-800">{a.address}</p>
                <button
                  type="button"
                  onClick={() => setAddresses(removeSavedAddress(uid, a.id))}
                  aria-label={`Eliminar la dirección ${a.address}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => setPicking(true)}
          disabled={atLimit}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FE6712] text-sm font-black text-white transition hover:bg-[#e0580d] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Agregar dirección
        </button>
        <p className="mt-3 text-center text-[11px] font-medium text-slate-400">
          {atLimit ? `Llegaste al máximo de ${MAX_SAVED_ADDRESSES} direcciones: elimina una para agregar otra. ` : ''}
          Se guardan solo en este dispositivo.
        </p>
      </PanelShell>

      <LocationPickerModal isOpen={picking} onClose={() => setPicking(false)} onConfirm={handlePicked} initialCenter={initialCenter} allowSave={false} />
    </>
  );
}
