'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  MAX_WISHLIST_ITEMS,
  addToWishlist,
  getWishlist,
  isInWishlist,
  removeFromWishlist,
  wishlistKey,
  wishlistStorageKey,
  type WishlistItem,
} from '@/lib/wishlist';

// Favoritos del cliente, CONDICIONADOS A LA SESIÓN: la lista pertenece a la cuenta (uid) y solo existe con sesión iniciada.
//   · Con sesión: el corazón se marca de inmediato, el producto queda guardado en la lista de la cuenta y se avisa con un toast.
//   · Sin sesión: el corazón NO se marca (ni siquiera de forma temporal): se abre el acceso con un mensaje claro y, si el cliente inicia
//     sesión o se registra desde ESE acceso, el favorito pendiente se guarda solo. Si cierra el acceso, no pasa nada.
//   · Mientras se restaura una sesión guardada (primer instante tras cargar la página) el toque se resuelve en cuanto se sabe si hay sesión.
// El almacenamiento está en src/lib/wishlist.ts (por cuenta, en este dispositivo: el backend no tiene favoritos por cliente).

export const WISHLIST_LOGIN_MESSAGE = 'Inicia sesión para guardar tus favoritos y encontrarlos cuando vuelvas.';

interface WishlistContextValue {
  /** Favoritos de la cuenta con sesión iniciada, el más reciente primero (vacío sin sesión). */
  items: WishlistItem[];
  count: number;
  /** Este despliegue tiene inicio de sesión; sin él los corazones no se dibujan (no habría cómo guardar un favorito). */
  isAvailable: boolean;
  isFavorite: (productId: unknown) => boolean;
  /** Marca o desmarca. Sin sesión abre el acceso y completa la acción al iniciar sesión. `null` (producto sin identidad real) no hace nada. */
  toggleFavorite: (candidate: WishlistItem | null) => void;
  removeFavorite: (productId: unknown) => void;
}

const DEFAULT_VALUE: WishlistContextValue = {
  items: [],
  count: 0,
  isAvailable: false,
  isFavorite: () => false,
  toggleFavorite: () => {},
  removeFavorite: () => {},
};

const WishlistContext = createContext<WishlistContextValue>(DEFAULT_VALUE);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAvailable, openAuthModal } = useAuth();
  const showToast = useToast();
  const uid = user?.uid ?? '';
  const [items, setItems] = useState<WishlistItem[]>([]);

  // La lista es de la cuenta: se carga al iniciar sesión (o al cambiar de cuenta) y se vacía de la pantalla al cerrarla
  useEffect(() => {
    setItems(uid ? getWishlist(uid) : []);
  }, [uid]);

  // Otra pestaña del mismo navegador cambió la lista de esta cuenta
  useEffect(() => {
    if (!uid) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === wishlistStorageKey(uid)) setItems(getWishlist(uid));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [uid]);

  const addFor = useCallback(
    (targetUid: string, candidate: WishlistItem) => {
      const { items: next, outcome } = addToWishlist(targetUid, { ...candidate, addedAt: Date.now() });
      setItems(next);
      if (outcome === 'added') showToast('¡Añadido a tus favoritos!');
      else if (outcome === 'exists') showToast('Este producto ya estaba en tus favoritos.', { tone: 'info' });
      else if (outcome === 'full') showToast(`Tu lista de favoritos está llena (${MAX_WISHLIST_ITEMS}). Quita alguno para guardar otro.`, { tone: 'error', durationMs: 4200 });
      else showToast('No pudimos guardar tu favorito en este dispositivo.', { tone: 'error', durationMs: 4200 });
    },
    [showToast]
  );

  const removeFor = useCallback(
    (targetUid: string, productId: unknown) => {
      const { items: next, removed } = removeFromWishlist(targetUid, productId);
      setItems(next);
      if (removed) showToast('Quitado de tus favoritos.', { tone: 'info' });
    },
    [showToast]
  );

  // ── Corazón pulsado SIN sesión ──────────────────────────────────────────────────────────────────────────────────────
  // `pendingRef` recuerda el producto mientras el acceso está abierto. Solo el `onSuccess` de ESE acceso lo confirma: si el cliente lo
  // cierra y más tarde inicia sesión por su cuenta (cabecera, checkout), no se le agrega nada que ya no espera.
  const pendingRef = useRef<WishlistItem | null>(null);
  const [confirmed, setConfirmed] = useState<WishlistItem | null>(null);
  // Sirve en cualquier orden: el `onSuccess` del acceso y la llegada de la sesión (`uid`) no tienen un orden garantizado entre sí
  useEffect(() => {
    if (!uid || !confirmed) return;
    setConfirmed(null);
    addFor(uid, confirmed);
  }, [uid, confirmed, addFor]);

  const requestLogin = useCallback(
    (candidate: WishlistItem) => {
      pendingRef.current = candidate;
      openAuthModal({
        mode: 'login',
        message: WISHLIST_LOGIN_MESSAGE,
        onSuccess: () => {
          const pending = pendingRef.current;
          pendingRef.current = null;
          if (pending) setConfirmed(pending);
        },
      });
    },
    [openAuthModal]
  );

  const toggleFor = useCallback(
    (targetUid: string, candidate: WishlistItem) => {
      // La verdad es el almacenamiento (otra pestaña pudo cambiarlo), no el estado en memoria
      if (isInWishlist(getWishlist(targetUid), candidate.productId)) removeFor(targetUid, candidate.productId);
      else addFor(targetUid, candidate);
    },
    [addFor, removeFor]
  );

  // Toque mientras aún no se sabe si hay una sesión guardada: se resuelve al saberlo (sin abrirle el acceso a quien ya está dentro)
  const [awaitingSession, setAwaitingSession] = useState<WishlistItem | null>(null);
  useEffect(() => {
    if (isLoading || !awaitingSession) return;
    const candidate = awaitingSession;
    setAwaitingSession(null);
    if (uid) toggleFor(uid, candidate);
    else requestLogin(candidate);
  }, [isLoading, uid, awaitingSession, toggleFor, requestLogin]);

  const toggleFavorite = useCallback(
    (candidate: WishlistItem | null) => {
      if (!candidate || !isAvailable) return;
      if (isLoading) {
        setAwaitingSession(candidate);
        return;
      }
      if (!uid) {
        requestLogin(candidate);
        return;
      }
      toggleFor(uid, candidate);
    },
    [isAvailable, isLoading, uid, requestLogin, toggleFor]
  );

  const removeFavorite = useCallback(
    (productId: unknown) => {
      if (uid) removeFor(uid, productId);
    },
    [uid, removeFor]
  );

  const keys = useMemo(() => new Set(items.map((i) => i.productId)), [items]);
  const isFavorite = useCallback((productId: unknown) => keys.has(wishlistKey(productId)), [keys]);

  const value = useMemo<WishlistContextValue>(
    () => ({ items, count: items.length, isAvailable, isFavorite, toggleFavorite, removeFavorite }),
    [items, isAvailable, isFavorite, toggleFavorite, removeFavorite]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

/** Favoritos de la cuenta. Fuera de un `WishlistProvider` devuelve un valor inerte (sin corazones). */
export function useWishlist(): WishlistContextValue {
  return useContext(WishlistContext);
}
