'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBeacon, BEACON_CLASS } from '@/lib/beacon';
import {
  ArrowRight, ArrowLeft, X, HeartHandshake, Check, Copy, Upload,
  CheckCircle2, Info, Clock, FileText, Loader2, Gift, Bookmark, MessageCircle,
  CreditCard, Bike, Car, Truck
} from 'lucide-react';

// Ícono del vehículo asignado por el motor logístico (antes emoji de `logisticsEngine.icono`): moto → Bike,
// sedán/baúl → Car, resto (camioneta/camión/gandola) → Truck. Solo presentación; no toca `logisticsResult`.
function VehicleIcon({ vehicleId, className }: { vehicleId: string; className?: string }) {
  if (vehicleId === 'moto') return <Bike className={className} />;
  if (vehicleId === 'auto') return <Car className={className} />;
  return <Truck className={className} />;
}

import { submitPurchaseOrder, getStorePaymentInfo, uploadPaymentReference } from '@/services/marketplaceService';
import { calculateLogistics, PhysicalItem } from '@/lib/logisticsEngine';

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
  nombre: string;
  cedula: string;
  telefono: string;
  metodoEntrega: 'delivery' | 'pickup' | 'national';
  direccion: string;
  costoEnvio: number;
  descuentoUSD?: number;
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

  const [orderCount, setOrderCount] = useState<number>(3);
  const [usarRecompensa, setUsarRecompensa] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const storeId = orderSummary.merchantId;
    setLiveRateBcv(null);
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

  if (!isOpen) return null;

  const subtotalNeto = Number(orderSummary.subtotalUSD || 0);
  const costoEnvio = Number(orderSummary.costoEnvio || 0);

  // Cofre Recompensa D'una: 25% OFF exclusivo sobre el flete, nunca sobre productos ni propina
  const esElegibleParaCofre = orderCount >= 3 && orderSummary.metodoEntrega === 'delivery';
  const aplicaDescuentoDelivery = esElegibleParaCofre && usarRecompensa;
  const descuentoUSD = aplicaDescuentoDelivery ? costoEnvio * 0.25 : 0;

  // Retiro en tienda (pickup): sin propina, sin importar lo elegido antes
  const propina = orderSummary.metodoEntrega === 'pickup' ? 0 : propinaElegida;
  const totalFinalUSD = subtotalNeto + costoEnvio + propina - descuentoUSD;

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

  const handleProceedToInstructions = () => {
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
    setPasoVista('instrucciones');
  };

  const handleCompleteFinalOrder = async () => {
    // La orden ya fue registrada en el backend: el contrato solo tiene POST de creación, reenviar duplicaría el pedido
    if (ordenCreada) return;

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
    setSubmitting(true);
    setSubmitError(null);

    const numeroLimpio = telefono.replace(/\D/g, '').replace(/^0+/, '');
    const telefonoCompleto = `${codigoPais}${numeroLimpio}`;
    const generatedOrderId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `ord_${Date.now()}`;

    const itemsAdonis = (orderSummary.items || []).map((item: CartItemOption) => {
      const basePrice = Number(item.price);
      const cantNum = Number(item.qty || item.quantity || item.cant || 1);
      const itemPricing = item.pricing as { unitBasePrice?: number; addonsTotal?: number; unitFinalPrice?: number } | undefined;
      const unitFinalPrice = itemPricing?.unitFinalPrice ?? basePrice;
      return {
        id: Number(item.id),
        code: String(item?.code),
        name: String(item.name || 'Producto'),
        image: String(item.image || item.img || ''),
        // Contrato (§2): las sugerencias de cocina por ítem viajan SOLO en `comments`; se omite si el ítem no tiene nota
        ...(typeof item.notes === 'string' && item.notes.trim() ? { comments: item.notes.trim() } : {}),
        cant: cantNum,
        pricing: {
          unitBasePrice: itemPricing?.unitBasePrice ?? basePrice,
          addonsTotal: itemPricing?.addonsTotal ?? 0,
          unitFinalPrice
        },
        totalPrice: unitFinalPrice * cantNum,
        // Contrato: variantes SINGLE/SIMPLE viajan con objeto `selected` (sin arreglo `items`); MULTIPLE conserva `items`
        variants: Array.isArray(item.variants)
          ? item.variants.map((v: any) => {
              if ((v?.type === 'SINGLE' || v?.type === 'SIMPLE') && Array.isArray(v?.items) && v.items.length > 0) {
                const rest = { ...v };
                delete rest.items;
                return { ...rest, selected: { code: v.items[0]?.code, title: v.items[0]?.title, unitPrice: v.items[0]?.unitPrice } };
              }
              return v;
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
      duration: String(Math.round(Number(orderSummary.durationMin || 0))),
      distance: Number(orderSummary.distanceKm || 0).toFixed(1),
      durationText: `${Math.round(Number(orderSummary.durationMin || 0))} mins`,
      distanceText: `${Number(orderSummary.distanceKm || 0).toFixed(1)} km`,
      serviceAmount: costoEnvio.toFixed(2),
      address: String(orderSummary.direccion || 'Cabimas, Zulia'),
      phone: telefonoCompleto,
      customerName: nombre,
      customerDocument: `${tipoDocumento}${cedula}`,
      ftoken: '',
      paymentRef: referenciaPago || "",
      totalPaidReferenceAmount: String(totalBolivares.toFixed(2)),
      totalPaidDefaultAmount: String(totalFinalUSD.toFixed(2)),
      totalWithoutDiscount: (totalFinalUSD || (subtotalNeto + costoEnvio + propina)).toFixed(2),
      paymentMethod: metodoPagoReal ? { code: metodoPagoReal.code, value: metodoPagoReal.value } : { code: 'PAGO', value: 'Banco' },
      tip: propina.toFixed(2),
      store: { id: storeIdNum, phone: storePhoneStr },
      foodStoreId: String(storeIdNum),
      couponId: "",
      couponCode: "",
      discountAmount: "0"
    };

    console.log('[AUDITORIA CHECKOUT] osvaldoPayload.data (items + variants + pricing):', JSON.stringify(itemsAdonis, null, 2));

    try {
      const response = await submitPurchaseOrder(osvaldoPayload, archivoComprobante);

      if (response && (response?.code === 1 || response?.code === 200 || response?.code === 201)) {
        const resolvedId = (response?.data as { id?: string | number } | undefined)?.id
          ? String((response?.data as { id?: string | number }).id)
          : generatedOrderId;

        onFinalizeOrder({
          id: resolvedId,
          nombre,
          cedula: `${tipoDocumento}${cedula}`,
          telefono: telefonoCompleto,
          metodoEntrega: orderSummary.metodoEntrega,
          direccion: orderSummary.direccion,
          costoEnvio,
          descuentoUSD,
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

        const created = response?.data as { id?: string | number; order_number?: string | number; orderNumber?: string | number } | undefined;
        setNumeroOrden(String(created?.order_number ?? created?.orderNumber ?? created?.id ?? ''));
        setOrdenCreada(true);
        // Compra registrada: la bolsa se vacía de inmediato (localStorage + estado de la tienda vía evento)
        try {
          localStorage.removeItem('cart_data');
          localStorage.removeItem('current_order');
          localStorage.removeItem('current_cart_store_id');
        } catch {
          /* sin localStorage */
        }
        window.dispatchEvent(new Event('duna:cart-cleared'));
        setOrdenId(created?.id !== undefined && created?.id !== null ? String(created.id) : '');
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
      } else {
        const errorMsg = response?.message || 'No pudimos registrar tu pedido. Revisa tus datos e inténtalo de nuevo.';
        setSubmitError(errorMsg);
      }
    } catch (err: unknown) {
      setSubmitError('Error al contactar con la pasarela de pedidos.');
    } finally {
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
                <p className="text-[10px] font-medium text-white/90">Confirmación De Orden</p>
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
                {pasoVista === 'formulario' ? 'Completa tus datos reales de contacto' : pasoVista === 'instrucciones' ? 'Transfiere a las cuentas oficiales del comercio' : 'Orden registrada'}
              </p>
            </div>
            <button type="button" onClick={onClose} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {pasoVista === 'formulario' && (
          <div className="px-5 py-3 space-y-3 flex-1 overflow-y-auto no-scrollbar flex flex-col justify-between">
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
            {orderSummary.metodoEntrega === 'delivery' && (
              <div className="bg-orange-50/70 border border-orange-200/60 px-3 py-1.5 rounded-xl shrink-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-800 flex items-center gap-1.5">
                    <Gift className="h-3.5 w-3.5 text-[#fe6712]" />
                    Cofre Recompensa D&apos;una
                  </span>
                  <button
                    type="button"
                    onClick={() => setOrderCount(prev => prev === 2 ? 3 : 2)}
                    title="Simular 3 compras"
                    className="text-[8px] font-black text-[#fe6712] bg-orange-100 px-1.5 py-0.5 rounded-md hover:bg-orange-200 transition cursor-pointer"
                  >
                    {orderCount >= 3 ? '3 de 3 (¡Desbloqueado!)' : '2 de 3 pedidos'}
                  </button>
                </div>

                <div className="flex gap-1 h-1">
                  <div className="h-1 flex-1 rounded-full bg-emerald-500"></div>
                  <div className="h-1 flex-1 rounded-full bg-emerald-500"></div>
                  <div className={`h-1 flex-1 rounded-full ${orderCount >= 3 ? 'bg-emerald-500' : 'bg-orange-200'}`}></div>
                </div>

                {orderCount >= 3 ? (
                  !usarRecompensa ? (
                    <div className="flex items-center justify-between mt-1 animate-in fade-in">
                      <p className="text-[8px] text-slate-600 font-medium leading-tight w-2/3">
                        Tienes un cupón del <strong>25% OFF en Flete</strong> disponible. ¿Lo usas hoy o lo guardas para después?
                      </p>
                      <button
                        type="button"
                        onClick={() => setUsarRecompensa(true)}
                        className="bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded shadow-sm hover:bg-emerald-600 transition cursor-pointer"
                      >
                        Usar Ahora
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-1 bg-emerald-50 p-1 rounded-lg border border-emerald-200 animate-in zoom-in-95">
                      <span className="text-[8.5px] font-black text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> ¡Descuento Aplicado!
                      </span>
                      <button
                        type="button"
                        onClick={() => setUsarRecompensa(false)}
                        className="text-[8px] text-slate-500 underline flex items-center gap-0.5 hover:text-slate-800 transition cursor-pointer"
                      >
                        <Bookmark className="w-2.5 h-2.5" /> Guardar para después
                      </button>
                    </div>
                  )
                ) : (
                  <p className="text-[8.5px] font-bold text-slate-600 leading-tight flex items-center gap-1">
                    <Gift className="w-3 h-3 shrink-0" /> ¡Estás a solo <span className="text-[#fe6712] font-black">1 pedido</span> de destapar tu cupón sorpresa!
                  </p>
                )}
              </div>
            )}

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
              {descuentoUSD > 0 && (
                <span className="block text-[10px] font-black text-emerald-600 mb-0.5">
                  Cofre Recompensa D&apos;una (25% OFF en flete): - {cobraEnBs
                    ? `Bs.S ${(descuentoUSD * tasaRef).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `$${descuentoUSD.toFixed(2)} USD`}
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
                <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold text-center">
                  {submitError}
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
                  <span>{submitting ? 'Registrando tu pedido...' : 'Completar pedido'}</span>
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
