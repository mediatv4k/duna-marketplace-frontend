'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ClipboardList, Heart, LogOut, MapPin, ShoppingBag, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import type { AuthUser } from '@/services/authService';

// Control de cuenta de la cabecera (versión minimalista, 2026-10-02): un ÍCONO circular en la esquina derecha que despliega el menú de
// perfil. Ya no hay botón naranja "Iniciar Sesión" ni nombre junto al avatar en la barra superior.
//   · Sin sesión: ícono de usuario → menú con "Iniciar sesión" / "Crear cuenta" y los accesos a Mis Favoritos y Mis Últimas Compras.
//     Esos dos accesos piden identificarse (abren el acceso con su mensaje) y, al entrar, abren el panel pedido.
//   · Con sesión: foto o inicial → menú con Mis Favoritos, Mis Últimas Compras, Mis Pedidos, Direcciones Guardadas y Cerrar Sesión.
// Si Firebase no está configurado no dibuja nada; mientras se restaura la sesión guardada muestra un esqueleto del mismo tamaño (sin
// saltos de maquetación). Las opciones las resuelve quien lo monta; Favoritos y Compras solo se dibujan si llega su manejador.

interface AccountMenuProps {
  onOpenOrders: () => void;
  onOpenAddresses: () => void;
  /** Panel "Mis Últimas Compras" (historial de la cuenta con "Volver a pedir"). */
  onOpenPurchases?: () => void;
  /** Panel "Mis Favoritos" (productos marcados con el corazón). */
  onOpenFavorites?: () => void;
  className?: string;
}

export const FAVORITES_MENU_LOGIN_MESSAGE = 'Inicia sesión para ver tus favoritos y encontrarlos cuando vuelvas.';
export const PURCHASES_MENU_LOGIN_MESSAGE = 'Inicia sesión para ver tus últimas compras y repetirlas con un toque.';

// `trigger`: el círculo de la barra superior (tono suave, sin bloque naranja); `menu`: el avatar grande de la cabecera del menú
function Avatar({ user, variant }: { user: AuthUser; variant: 'trigger' | 'menu' }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = (user.name.trim().charAt(0) || user.email.charAt(0) || '?').toUpperCase();
  const box = variant === 'trigger' ? 'h-9 w-9 text-sm' : 'h-11 w-11 text-base';
  if (user.photoUrl && !imageFailed) {
    return (
      // Las fotos de Google bloquean el hotlink si se envía el referer
      <img src={user.photoUrl} alt="" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} className={`${box} shrink-0 rounded-full object-cover`} />
    );
  }
  const tone = variant === 'trigger' ? 'border border-[#fe6712]/25 bg-[#fff5ed] text-[#fe6712]' : 'bg-[#fe6712] text-white';
  return <span className={`${box} ${tone} flex shrink-0 items-center justify-center rounded-full font-black`} aria-hidden="true">{initial}</span>;
}

export default function AccountMenu({ onOpenOrders, onOpenAddresses, onOpenPurchases, onOpenFavorites, className = '' }: AccountMenuProps) {
  const { user, isAuthenticated, isLoading, isAvailable, logout, openAuthModal } = useAuth();
  const { count: favoritesCount } = useWishlist();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  // Cierra con clic/toque fuera y con Escape
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(true);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  // Al iniciar o cerrar sesión (aquí o desde otra pestaña) el menú se cierra: el de invitado y el de la cuenta son distintos
  useEffect(() => {
    setOpen(false);
  }, [isAuthenticated]);

  if (!isAvailable) return null;

  if (isLoading) {
    return <div className={`h-9 w-9 shrink-0 animate-pulse rounded-full bg-slate-200 ${className}`} aria-hidden="true" data-testid="account-loading" />;
  }

  const signedIn = isAuthenticated && !!user;

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      close(false);
    } catch {
      /* no se pudo cerrar la sesión (sin red): el menú sigue abierto para reintentar */
    } finally {
      setLoggingOut(false);
    }
  };

  // Acceso a un panel de la cuenta: con sesión se abre; sin sesión se pide identificarse y el panel se abre al entrar
  const openPanel = (openIt: (() => void) | undefined, loginMessage: string) => {
    close(false);
    if (!openIt) return;
    if (signedIn) openIt();
    else openAuthModal({ mode: 'login', message: loginMessage, onSuccess: openIt });
  };

  const itemClass = 'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-bold text-slate-700 transition hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60';

  const favoritesItem = onOpenFavorites && (
    <button type="button" role="menuitem" onClick={() => openPanel(onOpenFavorites, FAVORITES_MENU_LOGIN_MESSAGE)} className={itemClass}>
      <Heart className="h-4 w-4 text-[#fe6712]" aria-hidden="true" />
      <span className="flex-1">Mis Favoritos</span>
      {signedIn && favoritesCount > 0 && (
        <span data-testid="favorites-count" className="rounded-full bg-[#fff5ed] px-2 py-0.5 text-[10px] font-black text-[#fe6712]">{favoritesCount}</span>
      )}
    </button>
  );
  const purchasesItem = onOpenPurchases && (
    <button type="button" role="menuitem" onClick={() => openPanel(onOpenPurchases, PURCHASES_MENU_LOGIN_MESSAGE)} className={itemClass}>
      <ShoppingBag className="h-4 w-4 text-[#fe6712]" aria-hidden="true" /> Mis Últimas Compras
    </button>
  );

  return (
    <div ref={rootRef} className={`relative shrink-0 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        data-testid="account-trigger"
        data-signed-in={signedIn ? 'true' : 'false'}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={signedIn && user ? `Menú de la cuenta de ${user.name}` : 'Tu cuenta'}
        title={signedIn && user ? user.name : 'Tu cuenta'}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition cursor-pointer active:scale-95 ${
          signedIn
            ? 'hover:ring-2 hover:ring-[#fe6712]/25'
            : `border bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 ${open ? 'border-slate-300 text-slate-900' : 'border-slate-200'}`
        } ${open && signedIn ? 'ring-2 ring-[#fe6712]/25' : ''}`}
      >
        {signedIn && user ? <Avatar user={user} variant="trigger" /> : <UserIcon className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />}
      </button>

      {open && (
        <div role="menu" aria-label="Cuenta" className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
          {signedIn && user ? (
            <>
              <div className="flex items-center gap-3 border-b border-slate-100 px-3 pb-3 pt-2">
                <Avatar user={user} variant="menu" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">{user.name}</p>
                  {user.email && <p className="truncate text-[11px] font-medium text-slate-500">{user.email}</p>}
                </div>
              </div>
              <div className="pt-1.5">
                {favoritesItem}
                {purchasesItem}
                <button type="button" role="menuitem" onClick={() => { close(false); onOpenOrders(); }} className={itemClass}>
                  <ClipboardList className="h-4 w-4 text-[#fe6712]" aria-hidden="true" /> Mis Pedidos
                </button>
                <button type="button" role="menuitem" onClick={() => { close(false); onOpenAddresses(); }} className={itemClass}>
                  <MapPin className="h-4 w-4 text-[#fe6712]" aria-hidden="true" /> Direcciones Guardadas
                </button>
                <div className="my-1 h-px bg-slate-100" />
                <button type="button" role="menuitem" onClick={handleLogout} disabled={loggingOut} className={`${itemClass} text-red-600 hover:bg-red-50`}>
                  <LogOut className="h-4 w-4" aria-hidden="true" /> {loggingOut ? 'Cerrando sesión…' : 'Cerrar Sesión'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="border-b border-slate-100 px-3 pb-3 pt-2">
                <p className="text-sm font-black text-slate-900">Tu cuenta</p>
                <p className="mt-0.5 text-[11px] font-medium leading-snug text-slate-500">Guarda tus favoritos y repite tus compras con un toque.</p>
                <div className="mt-2.5 flex gap-2">
                  <button
                    type="button"
                    role="menuitem"
                    data-testid="account-login"
                    onClick={() => { close(false); openAuthModal({ mode: 'login' }); }}
                    className="h-9 flex-1 rounded-xl bg-[#FE6712] text-xs font-black text-white transition hover:bg-[#e0580d] active:scale-[0.98] cursor-pointer"
                  >
                    Iniciar sesión
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    data-testid="account-register"
                    onClick={() => { close(false); openAuthModal({ mode: 'register' }); }}
                    className="h-9 flex-1 rounded-xl border border-slate-200 text-xs font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] cursor-pointer"
                  >
                    Crear cuenta
                  </button>
                </div>
              </div>
              {(favoritesItem || purchasesItem) && (
                <div className="pt-1.5">
                  {favoritesItem}
                  {purchasesItem}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
