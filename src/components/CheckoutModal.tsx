'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBeacon, BEACON_CLASS } from '@/lib/beacon';
import {
  ArrowRight, ArrowLeft, X, HeartHandshake, Check, Copy, Upload,
  CheckCircle2, Info, Clock, FileText, Loader2, MessageCircle,
  CreditCard, Bike, Car, Truck, Gift, Tag
} from 'lucide-react';

// Ícono del vehículo asignado por el motor logístico (antes emoji de `logisticsEngine.icono`): moto → Bike,
// sedán/baúl → Car, resto (camioneta/camión/gandola) → Truck. Solo presentación; no toca `logisticsResult`.
function VehicleIcon({ vehicleId, className }: { vehicleId: string; className?: string }) {
  if (vehicleId === 'moto') return <Bike className={className} />;
  if (vehicleId === 'auto') return <Car className={className} />;
  return <Truck className={className} />;
}

import { submitPurchaseOrder, getStorePaymentInfo, uploadPaymentReference, getOrderPublic, getDeliveryRate, getCustomerLoyalties, type ApiResponse } from '@/services/marketplaceService';
import { parseLoyaltyResponse, rewardDiscount, describeReward, rewardTitle, type LoyaltyReward } from '@/lib/loyalty';
import { parseStoreAdjustments, computeStoreAdjustments, adjustmentsSignature, type StoreAdjustment } from '@/lib/storeAdjustments';
import { calculateLogistics, PhysicalItem } from '@/lib/logisticsEngine';
import { clearCart } from '@/lib/cartStorage';
import { toWhatsAppNumber } from '@/lib/orderTracking';

export interface PaymentConfigItem {
  code: string;
  value: string;
  config?: Array<{ label: string; value: string }>;
  toCopy?: string;
  field4?: string;
  field5?: string;
}

export interface CartItemOption {
  id?: string | number;
  code?: string;
  name?: string;
  price?: number | string;
  qty?: number | string;
  quantity?: number | string;
  cant?: number | string;
  image?: string;
  img?: string;
  variants?: unknown[];
  [key: string]: unknown;
}

export interface SubmittedOrderPayload {
  id: string;
  // Correlativo comercial (`order_number` de la respuesta de compra): es el número que ven el cliente y el comercio; `id` es el id primario
  orderNumber?: string;
  nombre: string;
  cedula: string;
  telefono: string;
  metodoEntrega: 'delivery' | 'pickup' | 'national';
  direccion: string;
  costoEnvio: number;
  // Descuento del cupón del Cofre de Recompensas (GET /loyalties): monto en USD, código y dónde se aplicó. `costoEnvio` y `subtotalUSD`
  // van SIN descuento; `totalUSD` ya lo trae descontado. Pedidos antiguos (Cofre 25 % simulado) traen `descuentoUSD` sin `cuponAplicaA`.
  descuentoUSD?: number;
  cuponCode?: string;
  cuponAplicaA?: 'PURCHASE' | 'DELIVERY';
  // Descuentos (monto negativo) y cargos (positivo) propios del comercio aplicados a este pedido (`additionalItemsPercent`/`Amount`);
  // `subtotalUSD` va sin ellos y `totalUSD` ya los incluye. El recibo los dibuja línea por línea para que cuadre con el total.
  ajustesTienda?: { label: string; amount: number }[];
  items: CartItemOption[];
  merchantName?: string;
  subtotalUSD: number;
  propina: number;
  metodoPago: string;
  bancoSeleccionado: string;
  totalUSD: number;
  totalBolivares: number | null;
  tasaBcv: number;
  referencia: string;
  comprobante: string | null;
  createdAt: Date;
  status: string;
}

export interface OrderSummaryData {
  metodoEntrega: 'delivery' | 'pickup' | 'national';
  direccion: string;
  costoEnvio: number;
  subtotalUSD: number;
  totalUSD: number;
  items?: CartItemOption[];
  merchantName?: string;
  merchantId?: string | number;
  merchantPhone?: string;
  isOpen?: boolean;
  scheduleInfo?: string;
  // Ubicación y ruta reales (cotizadas en el carrito con GPS + GET /deliveryRate)
  location?: { lat: number; lng: number } | null;
  distanceKm?: number;
  durationMin?: number;
  // Descuentos/cargos del comercio ya consultados en la tienda (payment/info): siembran el primer render del checkout para que el total no
  // "salte"; el checkout los vuelve a consultar al abrir y esa respuesta manda
  storeAdjustments?: StoreAdjustment[];
}

// Comprime la imagen del comprobante (canvas): ancho máx. 1024 px y JPEG calidad 0.6, para no superar el límite del backend (Error 413).
// Si algo falla o el resultado no es más liviano, se conserva el archivo original.
async function compressPaymentImage(file: File, maxWidth = 1024, quality = 0.6): Promise<File> {
  if (typeof window === 'undefined' || !file.type.startsWith('image/')) return file;
  try {
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    URL.revokeObjectURL(url);
    const scale = Math.min(1, maxWidth / img.width);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], `${file.name.replace(/.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

// La respuesta de compra (POST /delivery/request/purchase/web) solo trae { id, url }: NO trae `order_number`. El correlativo comercial se
// obtiene del seguimiento público (GET /delivery/request/{id}/public). Se reintenta unos segundos por si el pedido aún no está listo;
// si no llega devuelve null (la confirmación queda sin número: jamás se muestra el id primario en su lugar).
async function fetchCommercialNumber(orderId: string): Promise<string | null> {
  const MAX_ATTEMPTS = 4;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await getOrderPublic(orderId);
      const n = res && res.code === 1 ? (res.data as { order_number?: string | number } | undefined)?.order_number : undefined;
      if (n) return String(n);
    } catch {
      /* se reintenta */
    }
    if (attempt < MAX_ATTEMPTS - 1) await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
  }
  return null;
}

// ── Fallos de la compra: mensajes claros para el cliente (auditoría C9) ───────────────────────────────────────────────────────────
// Antes se mostraba `response.message` crudo (E_STORE_NOT_OPEN, E_AMOUNT_MISMATCH, "Failed to fetch"...). Se clasifica así:
//  · mismatch  (code 21 / E_AMOUNT_MISMATCH): los montos no cuadran con el backend -> se refrescan tarifas y se vuelve a la Fase 2.
//  · business  (code 15 / tienda cerrada, sin jornada, sin stock, sin saldo): el comercio no puede recibir el pedido ahora.
//  · ambiguous (timeout / red / respuesta no válida): puede que el pedido SÍ se haya creado -> se pide verificar antes de reintentar.
//  · generic   (cualquier otro error del backend): texto amable; solo se muestra el mensaje del backend si es lenguaje natural.
type PurchaseFailure = { kind: 'mismatch' | 'business' | 'ambiguous' | 'generic'; message: string };

const CLOSED_RE = /cerrad|closed|not[_ ]?open|no est[aá] abiert|horario|jornada|schedule|shift/i;
const STOCK_RE = /stock|agotad|disponib|inventar|inventory|existencia|out[_ ]?of/i;
const WALLET_RE = /billetera|wallet|saldo|balance|fondos|credit/i;
const MISMATCH_RE = /AMOUNT_MISMATCH|inconsisten|mismatch/i;
// "Presentable" = texto normal en español; se descartan códigos E_*, errores de JavaScript y stacks
const isPresentable = (m: string) =>
  !!m && m.length <= 200 && !/\bE_[A-Z0-9_]{3,}/.test(m) && !/(TypeError|ReferenceError|undefined|null|stack| at |Cannot |ECONN|fetch)/i.test(m);

function classifyPurchaseFailure(response: ApiResponse<any> | null | undefined, merchantName: string): PurchaseFailure {
  const merchant = merchantName || 'el comercio';
  const msg = String(response?.message || '').trim();
  const code = Number(response?.code);

  if (response?.errorKind) {
    const lead = response.errorKind === 'timeout'
      ? 'La confirmación de tu pedido tardó demasiado.'
      : response.errorKind === 'network'
        ? 'Hubo un problema de conexión al enviar tu pedido.'
        : 'No recibimos una respuesta válida del servidor.';
    return { kind: 'ambiguous', message: `${lead} No sabemos si ${merchant} llegó a recibirlo. Antes de intentarlo de nuevo, verifica con el comercio para no duplicar tu pedido.` };
  }
  if (code === 21 || MISMATCH_RE.test(msg)) {
    return { kind: 'mismatch', message: 'Se actualizó la tarifa de envío o la tasa de cambio y el total ya no coincidía.' };
  }
  if (code === 15 || CLOSED_RE.test(msg)) {
    // Si el backend ya explica el motivo en lenguaje natural (con espacios, sin códigos E_*), ese ES el motivo comercial exacto
    if (isPresentable(msg) && /\s/.test(msg)) return { kind: 'business', message: `${merchant} no pudo recibir tu pedido: ${msg}` };
    if (CLOSED_RE.test(msg)) return { kind: 'business', message: `${merchant} está cerrado en este momento o no tiene una jornada activa. Revisa su horario e inténtalo cuando esté abierto.` };
    if (STOCK_RE.test(msg)) return { kind: 'business', message: 'Alguno de los productos de tu carrito ya no tiene disponibilidad. Vuelve al carrito, revísalo e inténtalo de nuevo.' };
    if (WALLET_RE.test(msg)) return { kind: 'business', message: `${merchant} no puede recibir pedidos en este momento. Inténtalo de nuevo más tarde o elige otro comercio.` };
    return {
      kind: 'business',
      message: isPresentable(msg)
        ? `${merchant} no pudo recibir tu pedido: ${msg}`
        : `${merchant} no puede recibir tu pedido en este momento (cerrado, sin disponibilidad o sin jornada activa). Revisa su horario o tu carrito e inténtalo más tarde.`,
    };
  }
  return {
    kind: 'generic',
    message: isPresentable(msg) ? msg : `No pudimos registrar tu pedido. Inténtalo de nuevo en unos minutos; si el problema continúa, comunícate con ${merchant}.`,
  };
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderSummary: OrderSummaryData;
  merchantName?: string;
  onFinalizeOrder: (orderData: SubmittedOrderPayload) => void;
  onBackToCart: () => void;
  onViewTracking?: () => void;
  onViewReceipt?: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  orderSummary,
  merchantName = 'el aliado comercial',
  onFinalizeOrder,
  onBackToCart,
  onViewTracking = () => console.log("Rastrear"),
  onViewReceipt = () => alert("Mostrando recibo digital..."),
}: CheckoutModalProps) {

  const [pasoVista, setPasoVista] = useState<'formulario' | 'instrucciones' | 'exito'>('formulario');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Fase 4: orden creada sin comprobante ni referencia → pago pendiente (se reporta por WhatsApp)
  const [pagoPendiente, setPagoPendiente] = useState<boolean>(false);
  const [numeroOrden, setNumeroOrden] = useState<string>('');
  const [ordenCreada, setOrdenCreada] = useState<boolean>(false);
  const [ordenId, setOrdenId] = useState<string>(''); // id real de la orden creada (para PUT payment/reference)
  // Último pedido creado en este modal: evita que el correlativo resuelto en segundo plano de un pedido anterior se pinte en el nuevo.
  // (Hook al nivel superior, antes del `return null`.)
  const latestOrderIdRef = useRef<string>('');
  const [uploading, setUploading] = useState<boolean>(false);

  const [paymentMethods, setPaymentMethods] = useState<PaymentConfigItem[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentConfigItem | null>(null);
  const [loadingPaymentInfo, setLoadingPaymentInfo] = useState<boolean>(true);
  // Tasa oficial: solo store.referenceRateValue de GET /store/{id}/payment/info (null = no disponible)
  const [liveRateBcv, setLiveRateBcv] = useState<number | null>(null);

  const [nombre, setNombre] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('V-');
  const [cedula, setCedula] = useState('');
  const [codigoPais, setCodigoPais] = useState('+58');
  const [telefono, setTelefono] = useState('');

  const [propinaElegida, setPropina] = useState<number>(0.50);
  const [referenciaPago, setReferenciaPago] = useState('');
  const [archivoComprobante, setArchivoComprobante] = useState<File | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
  const [copiadoTexto, setCopiadoTexto] = useState<string | null>(null);

  // Tarifas refrescadas tras un `code: 21` (auditoría C9): flete cotizado de nuevo (null = el del carrito) y aviso para el cliente
  const [fleteRefrescado, setFleteRefrescado] = useState<number | null>(null);
  const [avisoTarifa, setAvisoTarifa] = useState<string | null>(null);
  // Falló la compra sin saber si el pedido llegó a crearse (timeout / red / respuesta no válida): se pide verificar antes de reintentar
  const [intentoAmbiguo, setIntentoAmbiguo] = useState<boolean>(false);
  // Guardia síncrona contra doble envío (el estado `submitting` tarda un render en deshabilitar el botón)
  const submittingRef = useRef<boolean>(false);

  // ── Cofre de Recompensas (GET /loyalties/{phone} -> `activeRewards`) ─────────────────────────────────────────────────────────
  // Fuente de verdad = el backend: no hay contador local ni simulador. `rewardsPhoneRef` = último teléfono consultado (evita repetir la
  // consulta) y `rewardsReqRef` descarta respuestas de consultas viejas (el cliente puede seguir editando el número).
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [selectedRewardId, setSelectedRewardId] = useState<number | null>(null);
  const rewardsPhoneRef = useRef<string>('');
  const rewardsReqRef = useRef<number>(0);
  // Descuentos (< 0) y cargos (> 0) del comercio: `store.additionalItemsPercent`/`additionalItemsAmount` de payment/info. Se siembran con lo que
  // la tienda ya consultó y la consulta fresca al abrir (y la de un `code: 21`) los reemplaza: esa respuesta es la fuente de verdad.
  const [storeAdjustments, setStoreAdjustments] = useState<StoreAdjustment[]>(() => orderSummary.storeAdjustments ?? []);

  // Teléfono con el mismo formato que `phone` de la compra (+58…)
  const buildFullPhone = () => `${codigoPais}${telefono.replace(/\D/g, '').replace(/^0+/, '')}`;
  const clearRewards = () => {
    rewardsReqRef.current++; // invalida consultas en curso
    rewardsPhoneRef.current = '';
    setRewards([]);
    setSelectedRewardId(null);
  };
  // Consulta las recompensas activas. Devuelve la lista, o null si el backend no respondió con claridad (red/timeout) o llegó una
  // consulta más nueva: en ese caso NO se toca lo que el cliente ya tenía (no se concluye que perdió su recompensa).
  const fetchRewards = async (fullPhone: string): Promise<LoyaltyReward[] | null> => {
    const reqId = ++rewardsReqRef.current;
    try {
      const parsed = parseLoyaltyResponse(await getCustomerLoyalties(fullPhone));
      if (reqId !== rewardsReqRef.current || !parsed.answered) return null;
      setRewards(parsed.rewards);
      setSelectedRewardId((prev) => (prev !== null && parsed.rewards.some((r) => r.id === prev) ? prev : null));
      return parsed.rewards;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const storeId = orderSummary.merchantId;
    setLiveRateBcv(null);
    setFleteRefrescado(null);
    setAvisoTarifa(null);
    setIntentoAmbiguo(false);
    clearRewards();
    setStoreAdjustments(orderSummary.storeAdjustments ?? []);
    if (!storeId) {
      // Sin id real de comercio no se consulta ni se inventa uno
      setLoadingPaymentInfo(false);
      return;
    }
    setLoadingPaymentInfo(true);

    getStorePaymentInfo(storeId).then((res) => {
      setLoadingPaymentInfo(false);
      if (res && res?.code === 1 && res?.data) {
        const methods: PaymentConfigItem[] = res?.data?.paymentConfig || [];
        setPaymentMethods(methods);
        if (methods.length > 0) {
          setSelectedMethod(methods[0]);
        }
        const officialRate = Number(res?.data?.store?.referenceRateValue);
        if (Number.isFinite(officialRate) && officialRate > 0) {
          setLiveRateBcv(officialRate);
        }
        // La respuesta fresca del comercio manda: sin campos = el comercio ya no tiene descuentos/cargos
        if (res?.data?.store) setStoreAdjustments(parseStoreAdjustments(res.data.store));
      }
    }).catch(() => {
      setLoadingPaymentInfo(false);
    });
  }, [isOpen, orderSummary.merchantId]);

  // Pre-carga de datos del cliente (solo campos vacíos). Claves: customerName/customerDocument/customerPhone o name/document/phone
  useEffect(() => {
    if (!isOpen) return;
    try {
      const pick = (...keys: string[]) => keys.map((key) => localStorage.getItem(key)).find((v) => v && v.trim()) || '';
      const savedName = pick('customerName', 'name').trim();
      const savedDoc = pick('customerDocument', 'document').trim();
      const savedPhone = pick('customerPhone', 'phone').trim();

      if (savedName && !nombre) setNombre(savedName);

      if (savedDoc && !cedula) {
        const docMatch = savedDoc.match(/^([VEJ])\s*-?\s*(.+)$/i);
        if (docMatch) {
          setTipoDocumento(`${docMatch[1].toUpperCase()}-`);
          setCedula(docMatch[2].trim());
        } else {
          setCedula(savedDoc);
        }
      }

      if (savedPhone && !telefono) {
        const digits = savedPhone.replace(/\D/g, '');
        const code = ['58', '57', '1'].find((c) => (savedPhone.startsWith('+') || digits.length > 10) && digits.startsWith(c));
        if (code) {
          setCodigoPais(`+${code}`);
          setTelefono(digits.slice(code.length));
        } else {
          setTelefono(digits.replace(/^0+/, ''));
        }
      }
    } catch {
      /* localStorage no disponible: se deja el formulario vacío */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Faro guiado (Pasos 2 y 3). Hooks SIEMPRE antes del `return null` (regla #300). ───────────────────────────────────
  const { active: beacon, fire: fireBeacon, scrollTo: beaconScrollTo } = useBeacon<'continue' | 'bank' | 'reference' | 'confirm'>();
  const bankCardRef = useRef<HTMLDivElement>(null);
  const referenceRef = useRef<HTMLDivElement>(null);
  const hasMethodConfig = !!selectedMethod && (selectedMethod.config || []).length > 0;
  // Referencia con longitud creíble (≥ 4) o comprobante adjunto = el cliente ya pagó y tiene con qué confirmar
  const paymentInfoReady = referenciaPago.trim().length >= 4 || !!archivoComprobante;

  // Paso 2: al entrar a la Fase 3 con un método elegido -> tarjeta de datos bancarios + pulso en "Copiar Todos Los Datos"
  useEffect(() => {
    if (!isOpen || pasoVista !== 'instrucciones' || !hasMethodConfig) return;
    const t = setTimeout(() => { beaconScrollTo(bankCardRef.current); fireBeacon('bank'); }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pasoVista, hasMethodConfig]);

  // Paso 3a: en cuanto copia los datos -> lleva el foco a la referencia / comprobante
  useEffect(() => {
    if (!copiadoTexto || pasoVista !== 'instrucciones') return;
    const t = setTimeout(() => { beaconScrollTo(referenceRef.current); fireBeacon('reference'); }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copiadoTexto, pasoVista]);

  // Paso 3b: con referencia o comprobante listos -> pulso en el botón principal (Completar pedido / Enviar comprobante)
  useEffect(() => {
    if (!isOpen || pasoVista !== 'instrucciones' || !paymentInfoReady) return;
    const t = setTimeout(() => fireBeacon('confirm'), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pasoVista, paymentInfoReady]);

  // Al abrir el modal con el estado de un pedido YA creado (la tienda sigue abierta y el cliente arma otro pedido) se empieza un
  // checkout nuevo: sin esto reaparecía la confirmación vieja y `ordenCreada` impedía enviar el pedido nuevo (auditoría C2). El padre
  // además remonta este componente con una `key` por pedido; este reinicio es la red de seguridad. Los datos del cliente
  // (nombre, cédula, teléfono) se conservan. Hook ANTES del `return null` (regla #300).
  useEffect(() => {
    if (!isOpen || !ordenCreada) return;
    setPasoVista('formulario');
    setOrdenCreada(false);
    setOrdenId('');
    setNumeroOrden('');
    setPagoPendiente(false);
    setSubmitting(false);
    setSubmitError(null);
    setUploading(false);
    setReferenciaPago('');
    setArchivoComprobante(null);
    setNombreArchivo(null);
    setFleteRefrescado(null);
    setAvisoTarifa(null);
    setIntentoAmbiguo(false);
    clearRewards(); // el cupón del pedido anterior ya se consumió: se vuelve a consultar
    latestOrderIdRef.current = '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Recompensas del cliente: al escribir un WhatsApp de ≥ 7 dígitos (Fase 2) se consultan tras una pausa de 600 ms. Va DESPUÉS de los
  // efectos que reinician el estado y ANTES del `return null` (regla #300). Al cambiar el número las recompensas anteriores se quitan
  // de inmediato: un cupón consultado con otro teléfono nunca queda aplicado.
  useEffect(() => {
    if (!isOpen) return;
    const digits = telefono.replace(/\D/g, '').replace(/^0+/, '');
    if (digits.length < 7) {
      if (rewardsPhoneRef.current || rewards.length > 0 || selectedRewardId !== null) clearRewards();
      return;
    }
    const full = `${codigoPais}${digits}`;
    if (rewardsPhoneRef.current === full) return; // ya consultado
    if (rewardsPhoneRef.current) clearRewards(); // el número cambió: fuera las recompensas del anterior
    const t = setTimeout(() => {
      rewardsPhoneRef.current = full;
      void fetchRewards(full);
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, telefono, codigoPais]);

  if (!isOpen) return null;

  const subtotalNeto = Number(orderSummary.subtotalUSD || 0);
  // Flete = el cotizado en el carrito, o el re-cotizado tras un `code: 21` (fleteRefrescado)
  const costoEnvio = fleteRefrescado ?? Number(orderSummary.costoEnvio || 0);

  // Retiro en tienda (pickup): sin propina, sin importar lo elegido antes
  const propina = orderSummary.metodoEntrega === 'pickup' ? 0 : propinaElegida;

  // Cofre de Recompensas: el único descuento posible es el de una recompensa REAL del backend (`activeRewards`), elegida por el cliente.
  // El simulador local de 25 % (auditoría C6) no existe. Bases: PURCHASE = subtotal de productos; DELIVERY = flete (0 en retiro en tienda).
  // Descuentos (< 0) y cargos (> 0) del comercio, de payment/info. Base de los porcentajes = subtotal de productos; cada línea a 2 decimales.
  // Los descuentos se ACUMULAN con el cupón: primero el de la tienda y el cupón PURCHASE se calcula sobre el subtotal ya descontado
  // (el de DELIVERY sobre el flete). Los cargos no forman parte de esa base.
  const adjResult = computeStoreAdjustments(storeAdjustments, subtotalNeto);
  const subtotalConDescuentoTienda = subtotalNeto - adjResult.discountTotal;
  const rewardBases = { purchase: subtotalConDescuentoTienda, delivery: orderSummary.metodoEntrega === 'pickup' ? 0 : costoEnvio };
  const selectedReward = rewards.find((r) => r.id === selectedRewardId) ?? null;
  const rewardDiscountUSD = selectedReward ? rewardDiscount(selectedReward, rewardBases) : 0;
  // Una recompensa cuyo descuento da 0 (p. ej. de flete en un retiro) no se aplica ni viaja en el pedido
  const appliedReward = rewardDiscountUSD > 0 ? selectedReward : null;
  // Total ANTES del cupón (ya con los descuentos/cargos del comercio) y total a pagar:
  //   total = subtotal − descuentos de tienda + cargos de tienda + flete + propina − cupón
  const totalAntesDescuento = subtotalConDescuentoTienda + adjResult.chargesTotal + costoEnvio + propina;
  const totalFinalUSD = totalAntesDescuento - rewardDiscountUSD;

  const cobraEnBs = selectedMethod?.field5 === 'REF';
  const tasaRef = liveRateBcv ?? 0;
  const totalBolivares = totalFinalUSD * tasaRef;

  // Motor logístico D'una: MOTO hasta 45x45cm y 15kg; si excede cualquiera de las dos, pasa a SEDÁN
  const logisticsItems: PhysicalItem[] = (orderSummary.items || []).map((item: CartItemOption) => ({
    nombre: String(item.name || 'Producto'),
    precio: Number(item.price || 0),
    cantidad: Number(item.qty || item.quantity || item.cant || 1),
    pesoKg: (item as any).weightKg !== undefined ? Number((item as any).weightKg) : undefined,
    largoCm: (item as any).lengthCm !== undefined ? Number((item as any).lengthCm) : undefined,
    anchoCm: (item as any).widthCm !== undefined ? Number((item as any).widthCm) : undefined,
    altoCm: (item as any).heightCm !== undefined ? Number((item as any).heightCm) : undefined,
  }));
  const logisticsResult = calculateLogistics(logisticsItems, Number(orderSummary.distanceKm || 0));
  const vehicleType: 'MOTO' | 'SEDAN' = logisticsResult.vehiculoAsignado.id === 'moto' ? 'MOTO' : 'SEDAN';

  const handleToggleTip = (monto: number) => setPropina((prev) => (prev === monto ? 0 : monto));

  const handleCopyText = (texto: string, campo: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoTexto(campo);
    setTimeout(() => setCopiadoTexto(null), 2000);
  };

  const handleCopyAll = () => {
    if (!selectedMethod) return;
    const amountStr = cobraEnBs ? `Bs.S ${totalBolivares.toFixed(2)}` : `$${totalFinalUSD.toFixed(2)}`;
    let texto = selectedMethod.toCopy
      ? selectedMethod.toCopy.replace('{AMOUNT}', amountStr)
      : `${selectedMethod.value} - ${amountStr}`;

    navigator.clipboard.writeText(texto);
    setCopiadoTexto('todo');
    setTimeout(() => setCopiadoTexto(null), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const original = e.target.files[0];
      setNombreArchivo(original.name);
      setArchivoComprobante(await compressPaymentImage(original));
    }
  };

  // `code: 21` (montos/tarifa no coinciden con el backend). El pedido NO se creó. Se devuelve al cliente a la Fase 2 con un aviso claro y,
  // en segundo plano, se vuelve a consultar la tasa oficial y el flete para que revise el total ACTUALIZADO antes de reintentar.
  const handleAmountMismatch = async () => {
    setSubmitError(null);
    setIntentoAmbiguo(false);
    setPasoVista('formulario');
    setAvisoTarifa('Se actualizó la tarifa de envío o la tasa de cambio mientras completabas tu pedido, así que el total ya no coincidía. Estamos actualizando los valores…');
    const cambios: string[] = [];
    // El `code: 21` del contrato también cubre "cupón no aplicable": si había un cupón aplicado se vuelve a validar contra el backend
    const cuponPrevio = appliedReward;
    let cuponQuitado = false;
    try {
      const storeId = orderSummary.merchantId;
      if (storeId) {
        const info = await getStorePaymentInfo(storeId);
        if (info?.code === 1 && info?.data) {
          const nuevaTasa = Number(info.data?.store?.referenceRateValue);
          if (Number.isFinite(nuevaTasa) && nuevaTasa > 0) {
            if (Math.abs(nuevaTasa - tasaRef) > 0.0001) cambios.push(`la tasa de cambio (Bs. ${tasaRef.toFixed(2)} → Bs. ${nuevaTasa.toFixed(2)})`);
            setLiveRateBcv(nuevaTasa);
          }
          // Los descuentos/cargos del comercio también pueden haber cambiado (p. ej. terminó una promoción)
          if (info.data?.store) {
            const nuevosAjustes = parseStoreAdjustments(info.data.store);
            if (adjustmentsSignature(nuevosAjustes) !== adjustmentsSignature(storeAdjustments)) cambios.push('el descuento o cargo de la tienda');
            setStoreAdjustments(nuevosAjustes);
          }
          const methods: PaymentConfigItem[] = info.data?.paymentConfig || [];
          if (methods.length > 0) {
            setPaymentMethods(methods);
            setSelectedMethod((prev) => methods.find((m) => m.code === prev?.code && m.value === prev?.value) || methods[0]);
          }
        }
        const loc = orderSummary.location;
        if (orderSummary.metodoEntrega === 'delivery' && loc && orderSummary.distanceKm !== undefined && orderSummary.durationMin !== undefined) {
          const cot = await getDeliveryRate({ storeId, lat: Number(loc.lat), lng: Number(loc.lng), distance: Number(orderSummary.distanceKm), duration: Number(orderSummary.durationMin) });
          if (cot.ok) {
            if (Math.abs(cot.rate - costoEnvio) > 0.0001) cambios.push(`el flete ($${costoEnvio.toFixed(2)} → $${cot.rate.toFixed(2)})`);
            setFleteRefrescado(cot.rate);
          }
        }
      }
      if (cuponPrevio) {
        // `fetchRewards` ya quita la selección si la recompensa dejó de estar activa; si la consulta no respondió (null) no se concluye nada
        const vigentes = await fetchRewards(buildFullPhone());
        if (vigentes && !vigentes.some((r) => r.id === cuponPrevio.id)) cuponQuitado = true;
      }
    } catch {
      /* se informa igual: el cliente puede revisar y reintentar */
    }
    const partes: string[] = [];
    if (cambios.length > 0) partes.push(`Se actualizó ${cambios.join(' y ')} y el total cambió.`);
    if (cuponQuitado && cuponPrevio) partes.push(`Tu cupón "${rewardTitle(cuponPrevio)}" ya no está disponible y se quitó del pedido.`);
    setAvisoTarifa(
      partes.length > 0
        ? `${partes.join(' ')} Revisa el nuevo total y continúa cuando estés de acuerdo.`
        : `Actualizamos las tarifas pero no encontramos cambios. ${cuponPrevio ? `Es posible que tu cupón "${rewardTitle(cuponPrevio)}" no sea aplicable a este pedido: quítalo del Cofre de Recompensas e inténtalo de nuevo. ` : ''}Si el total no coincide con lo que esperabas, vuelve al carrito y revisa tus productos, o comunícate con ${merchantName || 'el comercio'}.`
    );
  };

  const handleSelectReward = (id: number) => setSelectedRewardId((prev) => (prev === id ? null : id));

  const handleProceedToInstructions = () => {
    // El envío nacional no tiene soporte en el contrato de Adonis: no se deja avanzar (defensa en profundidad; el carrito ya no lo ofrece)
    if (orderSummary.metodoEntrega === 'national') {
      alert('El envío nacional todavía no está disponible. Vuelve al carrito y elige delivery o retiro en tienda.');
      return;
    }
    if (!(tasaRef > 0)) {
      alert('No se pudo obtener la tasa oficial del comercio. Intenta de nuevo en unos momentos.');
      return;
    }
    if (!nombre.trim() || !cedula.trim() || !telefono.trim()) {
      alert('Por favor completa tu nombre, cédula y teléfono de contacto.');
      return;
    }
    if (!selectedMethod) {
      alert('Por favor selecciona un método de pago.');
      return;
    }
    setAvisoTarifa(null);
    setPasoVista('instrucciones');
  };

  const handleCompleteFinalOrder = async () => {
    // La orden ya fue registrada en el backend: el contrato solo tiene POST de creación, reenviar duplicaría el pedido.
    // `submittingRef` evita un segundo envío mientras el primero sigue en curso (doble toque).
    if (ordenCreada || submittingRef.current) return;

    // Una orden nacional NUNCA viaja como DELIVERY local con un flete plano inventado (auditoría C7)
    if (orderSummary.metodoEntrega === 'national') {
      setSubmitError('El envío nacional todavía no está disponible. Vuelve al carrito y elige delivery o retiro en tienda.');
      return;
    }

    // Sin datos reales no se envía el pedido: nunca se inventan comercio, teléfono, tasa, ubicación ni productos
    const storeIdNum = Number(orderSummary.merchantId);
    const storePhoneStr = String(orderSummary.merchantPhone || '').trim();
    if (!Number.isFinite(storeIdNum) || storeIdNum <= 0) {
      setSubmitError('No se pudo identificar el comercio. Vuelve a la tienda e inténtalo de nuevo.');
      return;
    }
    if (!storePhoneStr) {
      setSubmitError('El comercio no tiene un teléfono registrado. No se puede enviar el pedido.');
      return;
    }
    if (!(tasaRef > 0)) {
      setSubmitError('No se pudo obtener la tasa oficial del comercio. Intenta de nuevo en unos momentos.');
      return;
    }
    const cartLines = orderSummary.items || [];
    const invalidLine = cartLines.find((item: CartItemOption) =>
      !Number.isFinite(Number(item.id)) || Number(item.id) <= 0 || !String(item?.code || '').trim() || !Number.isFinite(Number(item.price))
    );
    if (cartLines.length === 0 || invalidLine) {
      setSubmitError('Un producto del carrito no tiene identificador válido. Vuelve a agregarlo desde la tienda.');
      return;
    }
    if (!orderSummary.location || !Number.isFinite(Number(orderSummary.location.lat)) || !Number.isFinite(Number(orderSummary.location.lng))) {
      setSubmitError('Falta tu ubicación de entrega. Vuelve al carrito y toca "Mi Ubicación".');
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    setIntentoAmbiguo(false);

    const numeroLimpio = telefono.replace(/\D/g, '').replace(/^0+/, '');
    const telefonoCompleto = `${codigoPais}${numeroLimpio}`;

    // Sanitización numérica estricta: ningún monto/cantidad viaja como string (el contrato de Adonis espera number)
    const money = (v: unknown) => {
      const n = Number(v || 0);
      return Number.isFinite(n) ? parseFloat(n.toFixed(2)) : 0;
    };
    // Dentro de `variants[]`: cantidades enteras y montos con 2 decimales. Se conservan las demás propiedades tal cual
    // (nombres y estructura del contrato); solo se tipan `quantity`, `unitPrice` y `totalPrice` (y `selected.unitPrice`).
    const sanitizeVariantNumbers = (group: any) => {
      if (!group || typeof group !== 'object') return group;
      const out = { ...group };
      if (Array.isArray(group.items)) {
        out.items = group.items.map((vItem: any) => {
          if (!vItem || typeof vItem !== 'object') return vItem;
          const quantity = parseInt(String(vItem.quantity || 1), 10) || 1;
          const unitPrice = money(vItem.unitPrice);
          return {
            ...vItem,
            quantity,
            unitPrice,
            // Sin `totalPrice` de origen se deriva de unitario × cantidad (nunca un 0 que descuadre el recálculo)
            totalPrice: vItem.totalPrice == null ? money(unitPrice * quantity) : money(vItem.totalPrice)
          };
        });
      }
      if (group.selected && typeof group.selected === 'object') {
        out.selected = { ...group.selected };
        if (group.selected.unitPrice != null) out.selected.unitPrice = money(group.selected.unitPrice);
      }
      return out;
    };

    const itemsAdonis = (orderSummary.items || []).map((item: CartItemOption) => {
      const basePrice = money(item.price);
      const cantNum = parseInt(String(item.qty || item.quantity || item.cant || 1), 10) || 1;
      const itemPricing = item.pricing as { unitBasePrice?: number; addonsTotal?: number; unitFinalPrice?: number } | undefined;
      const unitFinalPrice = money(itemPricing?.unitFinalPrice ?? basePrice);
      return {
        id: Number(item.id),
        code: String(item?.code),
        name: String(item.name || 'Producto'),
        image: String(item.image || item.img || ''),
        // Contrato (§2): las sugerencias de cocina por ítem viajan SOLO en `comments`; se omite si el ítem no tiene nota
        ...(typeof item.notes === 'string' && item.notes.trim() ? { comments: item.notes.trim() } : {}),
        cant: cantNum,
        pricing: {
          unitBasePrice: money(itemPricing?.unitBasePrice ?? basePrice),
          addonsTotal: money(itemPricing?.addonsTotal ?? 0),
          unitFinalPrice
        },
        totalPrice: money(unitFinalPrice * cantNum),
        // Contrato: variantes SINGLE/SIMPLE viajan con objeto `selected` (sin arreglo `items`); MULTIPLE conserva `items`
        variants: Array.isArray(item.variants)
          ? item.variants.map((v: any) => {
              if ((v?.type === 'SINGLE' || v?.type === 'SIMPLE') && Array.isArray(v?.items) && v.items.length > 0) {
                const rest = { ...v };
                delete rest.items;
                return sanitizeVariantNumbers({ ...rest, selected: { code: v.items[0]?.code, title: v.items[0]?.title, unitPrice: v.items[0]?.unitPrice } });
              }
              return sanitizeVariantNumbers(v);
            })
          : [],
        promo: null
      };
    });

    // Método de pago reconstruido desde la lista real del backend (no se envía el estado tal cual: solo code, value, field4, field5)
    const metodoPagoReal = paymentMethods.find((m) => m === selectedMethod)
      || paymentMethods.find((m) => m.code === selectedMethod?.code && m.value === selectedMethod?.value)
      || selectedMethod;
    const osvaldoPayload = {
      id: null,
      data: itemsAdonis,
      vehicleType,
      service: orderSummary.metodoEntrega === 'pickup' ? 'PICKUP' : 'DELIVERY',
      location: { lat: Number(orderSummary.location.lat), lng: Number(orderSummary.location.lng) },
      // Campos raíz numéricos (confirmado por Oswaldo): viajan como `number` con 2 decimales, jamás como string. Se conservan
      // los redondeos de siempre (minutos enteros y distancia a 1 decimal: son los valores con los que se cotizó el flete);
      // solo cambia el tipo. Los textos (`durationText`, `distanceText`) y los identificadores siguen siendo string.
      duration: money(Math.round(Number(orderSummary.durationMin || 0))),
      distance: money(Number(orderSummary.distanceKm || 0).toFixed(1)),
      durationText: `${Math.round(Number(orderSummary.durationMin || 0))} mins`,
      distanceText: `${Number(orderSummary.distanceKm || 0).toFixed(1)} km`,
      serviceAmount: money(costoEnvio),
      address: String(orderSummary.direccion || 'Cabimas, Zulia'),
      phone: telefonoCompleto,
      customerName: nombre,
      customerDocument: `${tipoDocumento}${cedula}`,
      ftoken: '',
      paymentRef: referenciaPago || "",
      totalPaidReferenceAmount: money(totalBolivares),
      // Total cobrado = subtotal − descuentos de tienda + cargos de tienda + flete + propina − cupón. Los ajustes del comercio (`additionalItems*`)
      // viajan SOLO dentro del total (Adonis los aplica desde la configuración del comercio); `discountAmount`/`couponId` son únicamente del
      // cupón. `totalWithoutDiscount` = el mismo total ANTES del cupón (con cupón, `totalWithoutDiscount − totalPaidDefaultAmount = discountAmount`).
      totalPaidDefaultAmount: money(totalFinalUSD),
      totalWithoutDiscount: money(totalAntesDescuento),
      paymentMethod: metodoPagoReal ? { code: metodoPagoReal.code, value: metodoPagoReal.value } : { code: 'PAGO', value: 'Banco' },
      tip: money(propina),
      store: { id: storeIdNum, phone: storePhoneStr },
      foodStoreId: String(storeIdNum),
      // Cupón del Cofre de Recompensas (contrato §8.1): con cupón aplicado viajan su id numérico, su código y el descuento calculado
      // (2 decimales, `number`); sin cupón, `null`/`null`/`0`.
      couponId: appliedReward ? appliedReward.id : null,
      couponCode: appliedReward ? appliedReward.code : null,
      discountAmount: money(appliedReward ? rewardDiscountUSD : 0)
    };

    console.log('[AUDITORIA CHECKOUT] osvaldoPayload.data (items + variants + pricing):', JSON.stringify(itemsAdonis, null, 2));

    try {
      const response = await submitPurchaseOrder(osvaldoPayload, archivoComprobante);

      const created = response?.data as { id?: string | number; order_number?: string | number; orderNumber?: string | number } | undefined;
      const createdId = created?.id !== undefined && created?.id !== null ? String(created.id).trim() : '';

      // ÉXITO ÚNICAMENTE con `code === 1` Y el `data.id` real del backend. Nunca se inventa un id en el cliente (antes: UUID de
      // respaldo) y ya no se aceptan `code` 200/201 (eran estados HTTP convertidos a `code` por el servicio, no confirmaciones).
      if (response && response.code === 1 && createdId && createdId !== '0') {
        const resolvedId = createdId;
        // La respuesta de compra solo trae { id, url }: si algún día trae el correlativo `order_number` se usa; si no, se resuelve más
        // abajo desde el seguimiento público. El id primario NUNCA se muestra como número de pedido.
        const commercialNumber = String(created?.order_number || created?.orderNumber || '');

        onFinalizeOrder({
          id: resolvedId,
          orderNumber: commercialNumber || undefined,
          nombre,
          cedula: `${tipoDocumento}${cedula}`,
          telefono: telefonoCompleto,
          metodoEntrega: orderSummary.metodoEntrega,
          direccion: orderSummary.direccion,
          costoEnvio,
          ...(appliedReward ? { descuentoUSD: money(rewardDiscountUSD), cuponAplicaA: appliedReward.applyTo, ...(appliedReward.code ? { cuponCode: appliedReward.code } : {}) } : {}),
          ...(adjResult.lines.length > 0 ? { ajustesTienda: adjResult.lines.map((l) => ({ label: l.label, amount: l.amount })) } : {}),
          items: orderSummary.items || [],
          merchantName,
          subtotalUSD: subtotalNeto,
          propina,
          metodoPago: selectedMethod?.code || 'PAGO',
          bancoSeleccionado: selectedMethod?.value || 'Banco',
          totalUSD: totalFinalUSD,
          totalBolivares: cobraEnBs ? totalBolivares : null,
          tasaBcv: tasaRef,
          referencia: referenciaPago,
          comprobante: nombreArchivo,
          createdAt: new Date(),
          status: 'pendiente'
        });

        setNumeroOrden(commercialNumber);
        setOrdenCreada(true);
        // Compra registrada: la bolsa se vacía de inmediato (localStorage + estado de la tienda vía evento)
        try {
          clearCart();
          localStorage.removeItem('current_order');
          localStorage.removeItem('current_cart_store_id');
        } catch {
          /* sin localStorage */
        }
        window.dispatchEvent(new Event('duna:cart-cleared'));
        setOrdenId(createdId);
        // Correlativo comercial en segundo plano (la confirmación ya está visible): al llegar se muestra en la cabecera y se guarda en
        // `last_active_order` para que el seguimiento lo tenga desde el primer instante
        latestOrderIdRef.current = createdId;
        if (!commercialNumber) {
          const idToResolve = latestOrderIdRef.current;
          void fetchCommercialNumber(idToResolve).then((n) => {
            if (!n || latestOrderIdRef.current !== idToResolve) return; // sin dato, o ya se creó otro pedido
            setNumeroOrden(n);
            try {
              const raw = localStorage.getItem('last_active_order');
              const saved = raw ? JSON.parse(raw) : null;
              if (saved && String(saved.id) === idToResolve) localStorage.setItem('last_active_order', JSON.stringify({ ...saved, orderNumber: n }));
            } catch {
              /* sin localStorage */
            }
          });
        }
        // Datos del cliente para futuras compras (la ubicación NO se guarda: el GPS en vivo es la predeterminada)
        try {
          localStorage.setItem('customerName', nombre.trim());
          localStorage.setItem('customerDocument', `${tipoDocumento}${cedula.trim()}`);
          localStorage.setItem('customerPhone', telefonoCompleto);
        } catch {
          /* sin localStorage: no se persiste */
        }
        setPagoPendiente(!archivoComprobante && !referenciaPago.trim());
        setPasoVista('exito');
      } else if (response && response.code === 1) {
        // El backend dijo "ok" pero sin `data.id`: no se puede confirmar ni rastrear el pedido. Se trata como fallo y se evita que
        // el cliente lo repita a ciegas (podría haberse registrado).
        setSubmitError(`Recibimos una respuesta incompleta del servidor y no pudimos confirmar tu pedido. Antes de intentarlo de nuevo, comunícate con ${merchantName || 'el comercio'} para verificar si se registró.`);
        setIntentoAmbiguo(true);
      } else {
        const failure = classifyPurchaseFailure(response, merchantName);
        if (failure.kind === 'mismatch') {
          // Sin `await`: el refresco de tarifas corre en segundo plano y el botón se libera de inmediato
          void handleAmountMismatch();
        } else {
          setSubmitError(failure.message);
          setIntentoAmbiguo(failure.kind === 'ambiguous');
        }
      }
    } catch (err: unknown) {
      setSubmitError(`Ocurrió un error inesperado al enviar tu pedido. Antes de intentarlo de nuevo, comunícate con ${merchantName || 'el comercio'} para verificar si se registró.`);
      setIntentoAmbiguo(true);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  // Orden ya creada: se adjunta comprobante/referencia con PUT payment/reference (nunca se vuelve a llamar a purchase)
  const handleUploadReference = async () => {
    if (!ordenId) {
      setSubmitError('No pudimos identificar tu orden para adjuntar el comprobante. Inténtalo de nuevo en unos minutos.');
      return;
    }
    if (!archivoComprobante && !referenciaPago.trim()) {
      setSubmitError('Adjunta tu comprobante o escribe el número de referencia.');
      return;
    }
    setUploading(true);
    setSubmitError(null);
    const res = await uploadPaymentReference({ orderId: ordenId, file: archivoComprobante, referenceText: referenciaPago });
    setUploading(false);
    if (res && (res?.code === 1 || res?.code === 200 || res?.code === 201)) {
      setPagoPendiente(false);
      setPasoVista('exito');
    } else {
      setSubmitError(res?.message || 'No se pudo enviar el comprobante. Intenta de nuevo.');
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm">
      <div className="w-full max-w-[420px] h-[610px] bg-white rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 justify-between">

        {pasoVista === 'exito' && pagoPendiente ? (
          <div className="bg-[#fe6712] px-5 py-3 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-white stroke-[3]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-[17px] leading-tight mb-0.5 truncate">{merchantName || 'Comercio'}</h3>
                <p className="text-[10px] font-medium text-white/90 truncate">Confirmación De Orden{numeroOrden && <> · <span className="font-black">N° {numeroOrden}</span></>}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 shrink-0">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="bg-[#fe6712] px-5 py-3 text-white flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-black text-[17px] leading-tight mb-0.5">
                {pasoVista === 'formulario' ? 'Fase 2: Datos y Métodos' : pasoVista === 'instrucciones' ? 'Fase 3: Pago' : 'Confirmación'}
              </h3>
              <p className="text-[10px] font-medium text-white/90">
                {pasoVista === 'formulario' ? 'Completa tus datos reales de contacto' : pasoVista === 'instrucciones' ? 'Transfiere a las cuentas oficiales del comercio' : <>Orden registrada{numeroOrden && <> · <span className="font-black">N° {numeroOrden}</span></>}</>}
              </p>
            </div>
            <button type="button" onClick={onClose} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {pasoVista === 'formulario' && (
          <div className="px-5 py-3 space-y-3 flex-1 overflow-y-auto no-scrollbar flex flex-col justify-between">
            {avisoTarifa && (
              <div role="alert" className="shrink-0 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-[10.5px] font-bold text-amber-800 leading-snug">
                {avisoTarifa}
              </div>
            )}
            {orderSummary.metodoEntrega === 'delivery' && (
              <div className="shrink-0 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                <VehicleIcon vehicleId={logisticsResult.vehiculoAsignado.id} className="w-5 h-5 shrink-0 text-slate-600" />
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-800 leading-tight">
                    Vehículo asignado: {vehicleType === 'MOTO' ? 'Moto Express' : 'Sedán por volumen'}
                  </p>
                  <p className="text-[8.5px] text-slate-500 font-medium truncate">{logisticsResult.motivoAsignacion}</p>
                </div>
              </div>
            )}

            <div className="bg-slate-50/70 p-2.5 rounded-2xl border border-slate-100 space-y-1.5 shrink-0">
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase block mb-0.5">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm font-bold text-slate-800 focus:border-[#fe6712] focus:outline-none"
                />
              </div>
              <div className="flex flex-row gap-2 w-full">
                <div className="w-[125px] shrink-0">
                  <label className="text-[8px] font-black text-slate-400 uppercase block mb-0.5">Cédula</label>
                  <div className="flex gap-1">
                    <select
                      value={tipoDocumento}
                      onChange={(e) => setTipoDocumento(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-1 py-1.5 text-[11px] font-bold text-slate-700 focus:outline-none shrink-0"
                    >
                      <option value="V-">V-</option>
                      <option value="E-">E-</option>
                      <option value="J-">J-</option>
                    </select>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="12345678"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      className="w-full min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[13px] font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[8px] font-black text-slate-400 uppercase block mb-0.5">WhatsApp</label>
                  <div className="flex gap-1">
                    <select
                      value={codigoPais}
                      onChange={(e) => setCodigoPais(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-1 py-1.5 text-[11px] font-bold text-slate-700 focus:outline-none shrink-0"
                    >
                      <option value="+58">🇻🇪 +58</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+57">🇨🇴 +57</option>
                    </select>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="4121234567"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[13px] font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {orderSummary.metodoEntrega !== 'pickup' && (
            <div className="shrink-0 bg-slate-50/70 p-2 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1 shrink-0">
                <HeartHandshake className="h-3.5 w-3.5 text-[#fe6712]" /> Propina:
              </span>
              <div className="grid grid-cols-4 gap-1 flex-1">
                {[0.50, 1.00, 1.50, 2.00].map((monto) => (
                  <button
                    type="button"
                    key={monto}
                    onClick={() => handleToggleTip(monto)}
                    className={`py-1 rounded-lg text-[10px] font-black transition ${
                      propina === monto ? 'bg-[#fe6712] text-white' : 'border border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    ${monto.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Cofre de Recompensas: solo aparece si el backend (GET /loyalties/{phone}) devuelve recompensas activas para este WhatsApp */}
            {rewards.length > 0 && (
              <div data-testid="rewards-card" className="shrink-0 bg-orange-50/70 border border-orange-200/60 px-3 py-2 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-800 flex items-center gap-1.5">
                    <Gift className="h-3.5 w-3.5 text-[#fe6712]" />
                    Cofre de Recompensas D&apos;una
                  </span>
                  <span className="text-[8px] font-black text-[#fe6712] bg-orange-100 px-1.5 py-0.5 rounded-md">
                    {rewards.length} disponible{rewards.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="space-y-1 max-h-[140px] overflow-y-auto no-scrollbar">
                  {rewards.map((reward) => {
                    const descuento = rewardDiscount(reward, rewardBases);
                    const disponible = descuento > 0;
                    const seleccionada = appliedReward?.id === reward.id;
                    return (
                      <button
                        type="button"
                        key={reward.id}
                        disabled={!disponible}
                        aria-pressed={seleccionada}
                        onClick={() => handleSelectReward(reward.id)}
                        className={`w-full flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-left transition ${
                          seleccionada
                            ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300/50'
                            : disponible ? 'border-orange-200 bg-white hover:bg-orange-50 cursor-pointer' : 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-[10.5px] font-black text-slate-800 leading-tight truncate">{rewardTitle(reward)}</p>
                          <p className="text-[8.5px] font-medium text-slate-500 leading-tight">
                            {disponible
                              ? describeReward(reward)
                              : reward.applyTo === 'DELIVERY' ? 'Aplica al envío: no disponible en retiro en tienda' : 'No aplica a este pedido'}
                          </p>
                        </div>
                        {seleccionada ? (
                          <span className="shrink-0 text-[9px] font-black text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> -${descuento.toFixed(2)}
                          </span>
                        ) : disponible ? (
                          <span className="shrink-0 text-[9px] font-black text-white bg-emerald-500 rounded px-1.5 py-0.5">Usar -${descuento.toFixed(2)}</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                {appliedReward && (
                  <button
                    type="button"
                    onClick={() => setSelectedRewardId(null)}
                    className="text-[8.5px] text-slate-500 underline hover:text-slate-800 transition cursor-pointer"
                  >
                    Guardar para después
                  </button>
                )}
              </div>
            )}

            <div className="shrink-0 flex-1">
              <label className="text-[9px] font-bold text-slate-700 block mb-1">
                Cuentas activas en la tienda ({paymentMethods.length})
              </label>

              {loadingPaymentInfo ? (
                <div className="py-6 flex flex-col items-center justify-center text-slate-400 gap-1.5">
                  <Loader2 className="h-5 w-5 animate-spin text-[#fe6712]" />
                  <span className="text-[10px] font-bold">Consultando cuentas con el servidor...</span>
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                  No hay métodos de pago habilitados para este comercio.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  {paymentMethods.map((metodo, idx) => {
                    const isSelected = selectedMethod?.code === metodo?.code && selectedMethod?.value === metodo?.value;
                    return (
                      <div
                        key={`${metodo?.code}-${idx}`}
                        onClick={() => { setSelectedMethod(metodo); fireBeacon('continue'); }}
                        className={`flex items-center gap-2 p-2 rounded-xl border transition cursor-pointer ${
                          isSelected ? 'border-[#fe6712] bg-orange-50/50 shadow-xs ring-1 ring-[#fe6712]/30' : 'border-slate-200 bg-white hover:bg-orange-50/20'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-slate-900 leading-tight truncate">{metodo.value}</p>
                          <p className="text-[9px] font-medium text-slate-400">
                            {metodo.field5 === 'REF' ? 'Cobro en Bs (BCV)' : 'Cobro en Divisa ($)'}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#fe6712] text-white shrink-0">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {pasoVista === 'instrucciones' && selectedMethod && (
          <div className="px-5 py-2 space-y-2 flex-1 overflow-y-auto no-scrollbar flex flex-col justify-between">
            {cobraEnBs && (
              <div className="bg-orange-50/70 border border-orange-200/60 px-3 py-1 rounded-xl flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-[#fe6712]" />
                  <span className="text-[9.5px] font-black text-slate-700 uppercase">Tasa BCV</span>
                </div>
                <span className="text-[9.5px] font-black text-[#fe6712]">Bs.S {tasaRef.toFixed(2)} / $</span>
              </div>
            )}

            <div className="text-center shrink-0 py-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
              {adjResult.lines.map((line, idx) => (
                <span
                  key={`${line.label}-${idx}`}
                  data-testid={line.isDiscount ? 'store-discount-line-p3' : 'store-charge-line-p3'}
                  className={`block text-[10px] font-black mb-0.5 ${line.isDiscount ? 'text-emerald-600' : 'text-slate-600'}`}
                >
                  {line.label}: {line.amount < 0 ? '- ' : '+ '}{cobraEnBs
                    ? `Bs.S ${(Math.abs(line.amount) * tasaRef).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `$${Math.abs(line.amount).toFixed(2)} USD`}
                </span>
              ))}
              {appliedReward && (
                <span data-testid="discount-line-p3" className="block text-[10px] font-black text-emerald-600 mb-0.5">
                  Descuento{appliedReward.code ? ` (${appliedReward.code})` : ''}: - {cobraEnBs
                    ? `Bs.S ${(rewardDiscountUSD * tasaRef).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `$${rewardDiscountUSD.toFixed(2)} USD`}
                </span>
              )}
              <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">Total A Pagar</span>
              <span className="text-2xl font-black text-[#fe6712] block leading-tight mt-0.5">
                {cobraEnBs
                  ? `Bs.S ${totalBolivares.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `$${totalFinalUSD.toFixed(2)} USD`}
              </span>
              <span className="inline-block mt-1 text-[8px] font-black bg-orange-50 text-[#fe6712] px-2 py-0.5 rounded-full border border-orange-200/50">
                {selectedMethod.value.toUpperCase()}
              </span>
            </div>

            <div ref={bankCardRef} className="space-y-1 text-xs px-1 shrink-0 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {(selectedMethod.config || []).map((campo, cIdx) => (
                <div key={cIdx} className="flex justify-between items-center pb-1 border-b border-slate-100 last:border-b-0 last:pb-0">
                  <div>
                    <span className="text-[7.5px] font-black text-slate-400 uppercase block leading-none">{campo.label}</span>
                    <span className="font-bold text-slate-800 text-sm">{campo.value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(campo.value, campo.label)}
                    className="px-2 py-0.5 bg-orange-50 hover:bg-orange-100 text-[#fe6712] text-[8.5px] font-black rounded-lg transition border border-orange-200/40 flex items-center gap-1"
                  >
                    <Copy className="h-2.5 w-2.5" />
                    <span>{copiadoTexto === campo.label ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCopyAll}
              className={`w-full py-1.5 rounded-xl border border-[#fe6712] bg-orange-50/40 hover:bg-orange-100/60 text-[#fe6712] text-[10.5px] font-black transition flex items-center justify-center gap-1.5 shrink-0 ${beacon === 'bank' ? BEACON_CLASS : ''}`}
            >
              <Copy className="h-3 w-3" />
              <span>{copiadoTexto === 'todo' ? '¡Datos copiados!' : 'Copiar Todos Los Datos'}</span>
            </button>

            <div ref={referenceRef} className={`space-y-1 shrink-0 rounded-xl transition ${beacon === 'reference' ? BEACON_CLASS : ''}`}>
              <input
                type="text"
                placeholder="Nro. De Referencia (Opcional)"
                value={referenciaPago}
                onChange={(e) => setReferenciaPago(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm font-bold text-slate-800 focus:border-[#fe6712] focus:outline-none"
              />
              <label
                className={`flex items-center justify-center gap-2 w-full py-1 px-3 rounded-xl cursor-pointer transition text-xs font-bold ${
                  nombreArchivo ? 'bg-emerald-50 border border-emerald-300 text-emerald-800' : 'border border-dashed border-slate-300 bg-white text-[#fe6712]'
                }`}
              >
                {nombreArchivo ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Upload className="h-3.5 w-3.5" />}
                <span className="truncate">{nombreArchivo || 'Adjuntar Comprobante (Imagen)'}</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {pasoVista === 'exito' && pagoPendiente && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center text-center px-5 bg-white py-4">
            <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mb-2 shrink-0">
              <Check className="w-7 h-7 text-[#fe6712] stroke-[3]" />
            </div>
            <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">¡Tu pedido ya está en la cocina!</h3>
            <p className="text-[12px] text-slate-500 font-medium mb-3">
              En D&apos;una tú tienes el control. Elige cómo prefieres pagar:
            </p>

            <div className="w-full space-y-2">
              <div className="flex items-start gap-3 text-left bg-orange-50/60 border border-orange-100 rounded-2xl p-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h4 className="text-[12px] font-black text-slate-900 leading-tight">Pago Express</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-snug">Sube tu comprobante en el seguimiento de orden.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-left bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-[12px] font-black text-slate-900 leading-tight">Pago Directo (WhatsApp)</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-snug">Espera que {merchantName || 'el comercio'} te escriba.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { setSubmitError(null); setPasoVista('instrucciones'); }}
              className="w-full mt-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 py-2 px-3 text-[12px] font-black text-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" /> ¡Prefiero pagar ahora mismo en la plataforma!
            </button>
          </div>
        )}

        {pasoVista === 'exito' && !pagoPendiente && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-white py-6">
            <div className="w-16 h-16 bg-[#10b981] rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(16,185,129,0.3)] mb-4">
              <Check className="w-8 h-8 text-white stroke-[3]" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">¡Pedido enviado a {merchantName || 'el comercio'}!</h3>
            <p className="text-[12px] text-slate-500 font-medium mb-4">
              Recibimos tu comprobante de pago. El comercio está verificando tu orden.
            </p>
            <button
              onClick={onViewReceipt}
              className="flex items-center gap-1.5 text-[#fe6712] font-black text-[12px] hover:text-[#e0580d] transition"
            >
              <FileText className="w-4 h-4" />
              <span>Ver Mi Recibo Digital</span>
            </button>
          </div>
        )}

        <div className="px-5 py-2.5 border-t border-slate-100 bg-white shrink-0 space-y-1">
          {pasoVista === 'formulario' ? (
            <>
              {orderSummary.isOpen === false && (
                <div className="mb-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[11px] font-black text-center">
                  Este Comercio Se Encuentra Cerrado
                  {orderSummary.scheduleInfo && (
                    <span className="block text-[10px] font-bold text-red-500 mt-0.5">{orderSummary.scheduleInfo}</span>
                  )}
                </div>
              )}
              {adjResult.lines.map((line, idx) => (
                <div
                  key={`${line.label}-${idx}`}
                  data-testid={line.isDiscount ? 'store-discount-line' : 'store-charge-line'}
                  className={`flex items-center justify-between gap-2 text-[10.5px] px-1 font-black ${line.isDiscount ? 'text-emerald-600' : 'text-slate-600'}`}
                >
                  <span className="flex items-center gap-1 min-w-0">
                    {line.isDiscount && <Tag className="w-3 h-3 shrink-0" />}
                    <span className="truncate">{line.label}:</span>
                  </span>
                  <span className="shrink-0">{line.amount < 0 ? '-' : '+'}${Math.abs(line.amount).toFixed(2)} USD</span>
                </div>
              ))}
              {appliedReward && (
                <div data-testid="discount-line" className="flex items-center justify-between text-[10.5px] px-1 font-black text-emerald-600">
                  <span>Descuento{appliedReward.code ? ` (${appliedReward.code})` : ''}:</span>
                  <span>-${rewardDiscountUSD.toFixed(2)} USD</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs px-1 font-black mb-1">
                <span className="text-slate-500">Total a pagar:</span>
                <span className="text-[#fe6712] text-base font-black">${totalFinalUSD.toFixed(2)} USD
                  {selectedMethod?.field5 === 'REF' && tasaRef > 0 && (
                    <span className="ml-1 text-sm text-slate-500 font-medium">/ Bs.S {totalBolivares.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  )}
                </span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={onBackToCart} className="rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleProceedToInstructions}
                  disabled={loadingPaymentInfo || paymentMethods.length === 0 || orderSummary.isOpen === false}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#fe6712] hover:bg-[#e0580d] disabled:opacity-50 py-2 text-xs font-black text-white shadow-md ${beacon === 'continue' ? BEACON_CLASS : ''}`}
                >
                  <span>CONTINUAR AL PAGO</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : pasoVista === 'instrucciones' ? (
            <div className="space-y-1.5">
              {submitError && (
                <div role="alert" className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold text-center">
                  {submitError}
                  {intentoAmbiguo && toWhatsAppNumber(orderSummary.merchantPhone) && (
                    <a
                      href={`https://wa.me/${toWhatsAppNumber(orderSummary.merchantPhone)}?text=${encodeURIComponent(`Hola, intenté hacer un pedido en D'una a nombre de ${nombre.trim() || 'un cliente'} y no recibí confirmación. ¿Les llegó?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-1 underline font-black text-red-700"
                    >
                      Verificar con {merchantName || 'el comercio'} por WhatsApp
                    </a>
                  )}
                </div>
              )}
              {ordenCreada ? (
                <>
                  <button
                    type="button"
                    onClick={handleUploadReference}
                    disabled={uploading}
                    className={`w-full flex items-center justify-center gap-2 rounded-full bg-[#fe6712] hover:bg-[#e0580d] disabled:opacity-50 py-2 text-xs font-black text-white shadow-md ${beacon === 'confirm' ? BEACON_CLASS : ''}`}
                  >
                    <span>{uploading ? 'Enviando comprobante...' : 'Enviar comprobante'}</span>
                    {!uploading && <Upload className="h-4 w-4" />}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteFinalOrder}
                  disabled={submitting}
                  className={`w-full flex items-center justify-center gap-2 rounded-full bg-[#fe6712] hover:bg-[#e0580d] disabled:opacity-50 py-2 text-xs font-black text-white shadow-md ${beacon === 'confirm' ? BEACON_CLASS : ''}`}
                >
                  <span>{submitting ? 'Registrando tu pedido...' : (intentoAmbiguo ? 'Ya verifiqué, reintentar pedido' : 'Completar pedido')}</span>
                  {!submitting && <Check className="h-4 w-4 stroke-[3]" />}
                </button>
              )}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setPasoVista(ordenCreada ? 'exito' : 'formulario')}
                  disabled={submitting || uploading}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline"
                >
                  {ordenCreada ? 'Volver a la confirmación' : 'Volver para cambiar método'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {pagoPendiente ? (
                <button type="button" onClick={onViewTracking} className="w-full flex items-center justify-center gap-2 rounded-full bg-[#fe6712] hover:bg-[#e0580d] py-2 text-xs font-black text-white shadow-md">
                  <Clock className="h-4 w-4" />
                  <span>Ver seguimiento de pedido</span>
                </button>
              ) : (
                <button type="button" onClick={onViewTracking} className="w-full flex items-center justify-center gap-2 rounded-full bg-[#fe6712] hover:bg-[#e0580d] py-2 text-xs font-black text-white shadow-md">
                  <Clock className="h-4 w-4" />
                  <span>Ver seguimiento de pedido</span>
                </button>
              )}
              <button type="button" onClick={onClose} className="w-full flex items-center justify-center rounded-full bg-white border border-slate-200 hover:bg-slate-50 py-2 text-xs font-bold text-slate-700">
                Continuar
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
