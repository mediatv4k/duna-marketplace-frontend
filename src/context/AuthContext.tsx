'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
// El modal recibe las acciones por props (no importa este archivo): evita una dependencia circular contexto <-> modal
import AuthModal, { type AuthMode } from '@/components/AuthModal';
import {
  isAuthAvailable,
  loginWithEmail as serviceLoginWithEmail,
  loginWithGoogleCredential,
  loginWithGooglePopup as serviceLoginWithGooglePopup,
  logout as serviceLogout,
  registerWithEmail as serviceRegisterWithEmail,
  sendPasswordReset as serviceSendPasswordReset,
  subscribeToSession,
  type AuthSession,
  type AuthUser,
} from '@/services/authService';

// Estado global de la cuenta del cliente. La sesión la mantiene el SDK de Firebase (persistida en el navegador); aquí solo se refleja:
// `isLoading` es true hasta que se sabe si hay una sesión guardada (evita mostrar "Iniciar sesión" un instante a quien ya está dentro).
// Comprar NO exige cuenta: nada de la app depende de `isAuthenticated` para funcionar.

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  /** Teléfono internacional ya normalizado (`+584121234567`). */
  phone: string;
}

export interface OpenAuthOptions {
  mode?: AuthMode;
  /** Se ejecuta cuando el cliente termina de iniciar sesión o registrarse desde el modal. */
  onSuccess?: () => void;
  /** Por qué se le pide identificarse (p. ej. al tocar un corazón sin sesión): se muestra destacado dentro del modal. */
  message?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** ID token de Firebase vigente (null sin sesión). */
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Firebase está configurado en este despliegue; si no, la UI no ofrece inicio de sesión. */
  isAvailable: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string, phone: string) => Promise<void>;
  /** `credentialToken` = `credential` que entrega Google Identity Services. */
  loginWithGoogle: (credentialToken: string) => Promise<void>;
  /** Alternativa sin Client ID de Google Identity Services: ventana emergente de Firebase. */
  loginWithGooglePopup: () => Promise<void>;
  logout: () => Promise<void>;
  /** Envía el correo de recuperación de contraseña (no revela si el correo tiene cuenta). */
  sendPasswordReset: (email: string) => Promise<void>;
  openAuthModal: (options?: OpenAuthOptions) => void;
  closeAuthModal: () => void;
}

const noop = async () => {};
const DEFAULT_VALUE: AuthContextValue = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isAvailable: false,
  loginWithEmail: noop,
  registerWithEmail: noop,
  loginWithGoogle: noop,
  loginWithGooglePopup: noop,
  logout: noop,
  sendPasswordReset: noop,
  openAuthModal: () => {},
  closeAuthModal: () => {},
};

const AuthContext = createContext<AuthContextValue>(DEFAULT_VALUE);

interface ModalState {
  open: boolean;
  mode: AuthMode;
  onSuccess?: () => void;
  message?: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(isAuthAvailable);
  const [modal, setModal] = useState<ModalState>({ open: false, mode: 'login' });

  // Verificación de sesión al cargar: el SDK restaura la sesión guardada y avisa de cada cambio (inicio, cierre, renovación del token)
  useEffect(() => {
    if (!isAuthAvailable) return;
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;
    subscribeToSession((next) => {
      if (cancelled) return;
      setSession(next);
      setIsLoading(false);
    })
      .then((stop) => {
        if (cancelled) stop();
        else unsubscribe = stop;
      })
      .catch(() => {
        // No se pudo cargar el SDK (sin red): se sigue como invitado, la app no depende de la sesión
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const closeAuthModal = useCallback(() => setModal((m) => ({ ...m, open: false })), []);
  const openAuthModal = useCallback((options?: OpenAuthOptions) => {
    if (!isAuthAvailable) return;
    setModal({ open: true, mode: options?.mode ?? 'login', onSuccess: options?.onSuccess, message: options?.message });
  }, []);

  // Las acciones lanzan `AuthError` (mensaje en español) para que el modal lo muestre junto al formulario
  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setSession(await serviceLoginWithEmail(email, password));
  }, []);
  const registerWithEmail = useCallback(async (name: string, email: string, password: string, phone: string) => {
    setSession(await serviceRegisterWithEmail({ name, email, password, phone }));
  }, []);
  const loginWithGoogle = useCallback(async (credentialToken: string) => {
    setSession(await loginWithGoogleCredential(credentialToken));
  }, []);
  const loginWithGooglePopup = useCallback(async () => {
    setSession(await serviceLoginWithGooglePopup());
  }, []);
  const logout = useCallback(async () => {
    await serviceLogout();
    setSession(null);
  }, []);
  const sendPasswordReset = useCallback((email: string) => serviceSendPasswordReset(email), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: session !== null,
      isLoading,
      isAvailable: isAuthAvailable,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      loginWithGooglePopup,
      logout,
      sendPasswordReset,
      openAuthModal,
      closeAuthModal,
    }),
    [session, isLoading, loginWithEmail, registerWithEmail, loginWithGoogle, loginWithGooglePopup, logout, sendPasswordReset, openAuthModal, closeAuthModal]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {modal.open && (
        <AuthModal
          initialMode={modal.mode}
          notice={modal.message}
          onClose={closeAuthModal}
          onSuccess={modal.onSuccess}
          actions={{ loginWithEmail, registerWithEmail, loginWithGoogle, loginWithGooglePopup, sendPasswordReset }}
        />
      )}
    </AuthContext.Provider>
  );
}

/** Estado y acciones de la cuenta. Fuera de un `AuthProvider` devuelve un valor inerte (sin sesión, sin inicio de sesión disponible). */
export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
