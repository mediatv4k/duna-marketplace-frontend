'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Info, Loader2, X } from 'lucide-react';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { toAuthError } from '@/services/authService';
import {
  PASSWORD_MIN_LENGTH,
  PHONE_PREFIXES,
  normalizeEmail,
  toInternationalPhone,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
  type PhonePrefix,
} from '@/lib/authValidation';

// Modal único de acceso: "Continuar con Google" arriba, separador y, debajo, pestañas Iniciar sesión / Registrarme con correo y contraseña.
// "¿Olvidaste tu contraseña?" (pestaña de inicio de sesión) lleva a una vista para pedir el enlace de recuperación por correo y a otra de confirmación.
// Comprar NO exige cuenta: el modal solo ofrece identificarse (lo abren la cabecera y el checkout). Las acciones llegan por props desde el
// `AuthProvider` (no importa el contexto: sin dependencia circular). Los errores del servidor (`AuthError`) se muestran ya en español.
// Va en un portal a `document.body` con z-[150]: por encima de los modales de compra (z-[100]–z-[140]) y libre de ancestros con transform.

export type AuthMode = 'login' | 'register';

export interface AuthModalActions {
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string, phone: string) => Promise<void>;
  loginWithGoogle: (credentialToken: string) => Promise<void>;
  loginWithGooglePopup: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

interface AuthModalProps {
  initialMode?: AuthMode;
  onClose: () => void;
  onSuccess?: () => void;
  actions: AuthModalActions;
  /** Motivo por el que se pide identificarse (p. ej. guardar un favorito): se muestra destacado sobre el formulario. */
  notice?: string;
}

type FieldName = 'name' | 'email' | 'phone' | 'password';
type FieldErrors = Partial<Record<FieldName, string>>;

const INPUT_BASE =
  'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-400';
const inputClass = (hasError: boolean) =>
  `${INPUT_BASE} ${hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-400' : 'border-slate-200 focus:border-[#fe6712] focus:ring-[#fe6712]'}`;

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], iframe, [tabindex]:not([tabindex="-1"])';

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[11px] font-black uppercase tracking-wide text-slate-500">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-[11px] font-bold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default function AuthModal({ initialMode = 'login', onClose, onSuccess, actions, notice }: AuthModalProps) {
  const uid = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);
  const mountedRef = useRef(true);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [prefix, setPrefix] = useState<PhonePrefix>('+58');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  // Recuperar contraseña: 'auth' = formulario normal, 'reset' = pedir el correo, 'reset-sent' = confirmación
  const [view, setView] = useState<'auth' | 'reset' | 'reset-sent'>('auth');
  const [resetEmail, setResetEmail] = useState('');
  const [resetFieldError, setResetFieldError] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const id = (field: string) => `${uid}-${field}`;

  // Bloqueo del scroll del fondo (solo si no estaba ya bloqueado por otro modal abierto), foco al diálogo y foco de vuelta al cerrar
  useEffect(() => {
    mountedRef.current = true;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const lockedByUs = previousOverflow !== 'hidden';
    if (lockedByUs) body.style.overflow = 'hidden';
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();
    // Escape también con el foco fuera del diálogo: al enviar, el botón enfocado se deshabilita y el foco cae a <body>
    const onWindowKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) onCloseRef.current();
    };
    window.addEventListener('keydown', onWindowKeyDown);
    return () => {
      window.removeEventListener('keydown', onWindowKeyDown);
      mountedRef.current = false;
      if (lockedByUs) body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  // Al terminar un envío el foco vuelve al diálogo si se perdió (los controles se deshabilitan mientras se envía): así el teclado y Escape siguen funcionando
  const refocusIfLost = () => {
    const active = document.activeElement;
    if (!active || active === document.body) dialogRef.current?.focus();
  };

  // Al cambiar de vista el foco va al primer control de la vista nueva (correo / botón de volver)
  useEffect(() => {
    if (view === 'reset') document.getElementById(`${uid}-reset-email`)?.focus();
    if (view === 'reset-sent') document.getElementById(`${uid}-reset-back`)?.focus();
  }, [view, uid]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !dialogRef.current) return;
    // El foco no se escapa del diálogo (aria-modal)
    const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const run = useCallback(
    async (action: () => Promise<void>) => {
      if (submittingRef.current) return; // doble toque
      submittingRef.current = true;
      setSubmitting(true);
      setFormError(null);
      try {
        await action();
        onClose();
        onSuccess?.();
      } catch (err) {
        const authError = toAuthError(err);
        if (authError.code !== 'cancelled' && mountedRef.current) setFormError(authError.message); // cerrar la ventana de Google no es un error
      } finally {
        submittingRef.current = false;
        if (mountedRef.current) {
          setSubmitting(false);
          refocusIfLost();
        }
      }
    },
    [onClose, onSuccess]
  );

  const switchMode = (next: AuthMode) => {
    if (next === mode || submitting) return;
    setMode(next);
    setFormError(null);
    setFieldErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FieldErrors = {};
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    const passwordError = validatePassword(password, mode);
    if (passwordError) errors.password = passwordError;
    if (mode === 'register') {
      const nameError = validateName(name);
      if (nameError) errors.name = nameError;
      const phoneError = validatePhone(phone, prefix);
      if (phoneError) errors.phone = phoneError;
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError(null);
      const firstInvalid = (['name', 'email', 'phone', 'password'] as FieldName[]).find((f) => errors[f]);
      if (firstInvalid) dialogRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id(firstInvalid))}`)?.focus();
      return;
    }
    if (mode === 'login') void run(() => actions.loginWithEmail(normalizeEmail(email), password));
    else void run(() => actions.registerWithEmail(name.trim(), normalizeEmail(email), password, toInternationalPhone(phone, prefix)));
  };

  const openReset = () => {
    if (submitting) return;
    setResetEmail(email); // el correo ya escrito en el inicio de sesión pasa a la vista de recuperación
    setResetFieldError(null);
    setResetError(null);
    setFormError(null);
    setView('reset');
  };

  const backToLogin = () => {
    if (submitting) return;
    if (resetEmail.trim()) setEmail(resetEmail);
    setMode('login');
    setFieldErrors({});
    setResetFieldError(null);
    setResetError(null);
    setView('auth');
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return; // doble toque
    const emailError = validateEmail(resetEmail);
    setResetFieldError(emailError);
    setResetError(null);
    if (emailError) {
      document.getElementById(`${uid}-reset-email`)?.focus();
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await actions.sendPasswordReset(normalizeEmail(resetEmail));
      if (mountedRef.current) setView('reset-sent');
    } catch (err) {
      if (mountedRef.current) setResetError(toAuthError(err).message);
    } finally {
      submittingRef.current = false;
      if (mountedRef.current) {
        setSubmitting(false);
        refocusIfLost();
      }
    }
  };

  const handleGoogleCredential = useCallback((token: string) => { void run(() => actions.loginWithGoogle(token)); }, [run, actions]);
  const handleGooglePopup = useCallback(() => { void run(() => actions.loginWithGooglePopup()); }, [run, actions]);

  const describedBy = (field: FieldName) => (fieldErrors[field] ? `${id(field)}-error` : undefined);

  const modal = (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm animate-in fade-in duration-150"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id('title')}
        aria-describedby={notice && view === 'auth' ? id('notice') : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="relative my-auto w-full max-w-[400px] rounded-[28px] border border-slate-100 bg-white p-5 shadow-2xl outline-none sm:p-6"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 pr-8">
          <h2 id={id('title')} className="text-xl font-black leading-tight text-slate-900">
            {view === 'reset' ? 'Recupera tu contraseña' : view === 'reset-sent' ? 'Revisa tu correo' : mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
          </h2>
          {view !== 'reset-sent' && (
            <p className="mt-1 text-xs font-medium text-slate-500">
              {view === 'reset' ? 'Escribe el correo de tu cuenta y te enviaremos un enlace para crear una nueva contraseña.' : "Guarda tus datos y compra más rápido en D'una."}
            </p>
          )}
        </div>

        {view === 'auth' && (
        <>
        {notice && (
          <p id={id('notice')} data-testid="auth-notice" className="mb-4 flex items-start gap-2 rounded-xl border border-orange-200 bg-[#fff5ed] px-3 py-2.5 text-xs font-bold leading-snug text-[#9a3412]">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#fe6712]" aria-hidden="true" />
            <span>{notice}</span>
          </p>
        )}
        <GoogleSignInButton onCredential={handleGoogleCredential} onPopup={handleGooglePopup} disabled={submitting} />

        <div className="my-4 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-bold text-slate-400">o ingresa con tu correo</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <div role="tablist" aria-label="Acceso" className="mb-4 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-black">
          {(['login', 'register'] as AuthMode[]).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              id={id(`tab-${tab}`)}
              aria-selected={mode === tab}
              aria-controls={id('panel')}
              onClick={() => switchMode(tab)}
              className={`rounded-lg py-2 transition cursor-pointer ${mode === tab ? 'bg-white text-[#fe6712] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {tab === 'login' ? 'Iniciar Sesión' : 'Registrarme'}
            </button>
          ))}
        </div>

        <form id={id('panel')} role="tabpanel" aria-labelledby={id(`tab-${mode}`)} onSubmit={handleSubmit} noValidate className="space-y-3">
          {mode === 'register' && (
            <Field id={id('name')} label="Nombre completo" error={fieldErrors.name}>
              <input
                id={id('name')}
                type="text"
                autoComplete="name"
                placeholder="Ej. Juan Pérez"
                value={name}
                disabled={submitting}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!fieldErrors.name}
                aria-describedby={describedBy('name')}
                className={inputClass(!!fieldErrors.name)}
              />
            </Field>
          )}

          <Field id={id('email')} label="Correo electrónico" error={fieldErrors.email}>
            <input
              id={id('email')}
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              disabled={submitting}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={describedBy('email')}
              className={inputClass(!!fieldErrors.email)}
            />
          </Field>

          {mode === 'register' && (
            <Field id={id('phone')} label="WhatsApp" error={fieldErrors.phone}>
              <div className="flex gap-1.5">
                <select
                  aria-label="Prefijo del país"
                  value={prefix}
                  disabled={submitting}
                  onChange={(e) => setPrefix(e.target.value as PhonePrefix)}
                  className="shrink-0 rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-sm font-bold text-slate-700 focus:border-[#fe6712] focus:outline-none"
                >
                  {PHONE_PREFIXES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <input
                  id={id('phone')}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="4121234567"
                  value={phone}
                  disabled={submitting}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={!!fieldErrors.phone}
                  aria-describedby={describedBy('phone')}
                  className={`${inputClass(!!fieldErrors.phone)} min-w-0 flex-1`}
                />
              </div>
            </Field>
          )}

          <Field id={id('password')} label="Contraseña" error={fieldErrors.password}>
            <div className="relative">
              <input
                id={id('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder={mode === 'register' ? `Mínimo ${PASSWORD_MIN_LENGTH} caracteres` : 'Tu contraseña'}
                value={password}
                disabled={submitting}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={describedBy('password')}
                className={`${inputClass(!!fieldErrors.password)} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={showPassword}
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          {mode === 'login' && (
            <div className="-mt-1 text-right">
              <button type="button" onClick={openReset} disabled={submitting} className="text-[12px] font-bold text-[#fe6712] transition hover:underline disabled:opacity-60 cursor-pointer">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {formError && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FE6712] text-sm font-black text-white shadow-md shadow-orange-500/25 transition hover:bg-[#e0580d] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {mode === 'login' ? 'Ingresando…' : 'Creando tu cuenta…'}
              </>
            ) : mode === 'login' ? (
              'Iniciar Sesión'
            ) : (
              'Crear mi cuenta'
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] font-medium text-slate-400">
          ¿Prefieres no registrarte? Puedes comprar como invitado con solo tu número de WhatsApp.
        </p>
        </>
        )}

        {view === 'reset' && (
          <form onSubmit={handleResetSubmit} noValidate className="space-y-3">
            <Field id={`${uid}-reset-email`} label="Correo electrónico" error={resetFieldError ?? undefined}>
              <input
                id={`${uid}-reset-email`}
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                placeholder="tucorreo@ejemplo.com"
                value={resetEmail}
                disabled={submitting}
                onChange={(e) => setResetEmail(e.target.value)}
                aria-invalid={!!resetFieldError}
                aria-describedby={resetFieldError ? `${uid}-reset-email-error` : undefined}
                className={inputClass(!!resetFieldError)}
              />
            </Field>

            {resetError && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FE6712] text-sm font-black text-white shadow-md shadow-orange-500/25 transition hover:bg-[#e0580d] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando…
                </>
              ) : (
                'Enviar enlace de recuperación'
              )}
            </button>
            <button type="button" onClick={backToLogin} disabled={submitting} className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-sm font-bold text-slate-500 transition hover:text-slate-800 disabled:opacity-60 cursor-pointer">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver a iniciar sesión
            </button>
          </form>
        )}

        {view === 'reset-sent' && (
          <div className="space-y-4">
            <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
              <div>
                <p className="text-sm font-black leading-snug text-emerald-800">Te hemos enviado un correo con instrucciones para restablecer tu contraseña</p>
                <p className="mt-1 text-xs font-medium text-emerald-700">Revisa también tu carpeta de spam. Si no llega, verifica que sea el correo de tu cuenta.</p>
              </div>
            </div>
            <button
              id={`${uid}-reset-back`}
              type="button"
              onClick={backToLogin}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FE6712] text-sm font-black text-white shadow-md shadow-orange-500/25 transition hover:bg-[#e0580d] active:scale-[0.99] cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver a iniciar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
