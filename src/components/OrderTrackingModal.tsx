'use client';

import React, { useState, useEffect } from 'react';
import {
  X, Clock, MapPin, ShieldCheck, RefreshCw, ChefHat,
  Bike, PackageCheck, Receipt, Printer, DollarSign, FileText
} from 'lucide-react';
import { getOrderPublic } from '@/services/marketplaceService';

const POLL_INTERVAL_MS = 9000;
const FINAL_STATUSES = ['DELIVERED', 'CANCELLED', 'REJECTED', 'COMPLETED'];

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  orderSummary?: any; // <-- Blindaje añadido para evitar el error de TypeScript en Vercel
}

export default function OrderTrackingModal({ isOpen, onClose, orderId, orderSummary }: OrderTrackingModalProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [remote, setRemote] = useState<any>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'TRACKING' | 'KITCHEN' | 'RECEIPT'>('KITCHEN');

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    // Datos locales del checkout (items/totales): /public no devuelve los ítems del pedido
    let savedOrder: any = null;
    let resolvedId: string | null = orderId || null;
    try {
      const savedOrderStr = localStorage.getItem('last_active_order');
      if (savedOrderStr) savedOrder = JSON.parse(savedOrderStr);
      if (!resolvedId) resolvedId = savedOrder?.id ? String(savedOrder.id) : localStorage.getItem('last_active_order_id');
    } catch (e) {}

    if (!resolvedId) {
      setOrderData(null);
      setRemote(null);
      setTrackingError('No hay un pedido activo para rastrear.');
      setLoading(false);
      return;
    }

    if (savedOrder && String(savedOrder.id) === String(resolvedId)) {
      setOrderData({
        ...savedOrder,
        tasa: savedOrder.tasaBcv,
        items: (orderSummary?.items && orderSummary.items.length > 0) ? orderSummary.items : (savedOrder.items || [])
      });
    } else {
      setOrderData(null);
    }

    setRemote(null);
    setTrackingError(null);

    async function fetchOrder(first: boolean) {
      if (first) setLoading(true);
      const res = await getOrderPublic(resolvedId as string);
      if (!isMounted) return;
      if (res && res.code === 1 && res.data) {
        setRemote(res.data);
        setTrackingError(null);
        if (!FINAL_STATUSES.includes(String(res.data.status || '').toUpperCase())) {
          timer = setTimeout(() => fetchOrder(false), POLL_INTERVAL_MS);
        }
      } else {
        setTrackingError(res?.message || 'No se pudo consultar el estado del pedido.');
        // Error transitorio: se reintenta; si ya hay datos previos se conservan
        timer = setTimeout(() => fetchOrder(false), POLL_INTERVAL_MS);
      }
      if (first) setLoading(false);
    }

    fetchOrder(true);

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, orderId, orderSummary]);

  if (!isOpen) return null;

  const currentItems: any[] = (orderData?.items && orderData.items.length > 0)
    ? orderData.items
    : (orderSummary?.items || []);

  // Aplana item.variants (estructura anidada real) + exclusiones de item.breakdown en filas para la matriz
  const getItemBreakdownRows = (item: any): { qty: number | null; name: string; price: number; isExclusion: boolean }[] => {
    const rows: { qty: number | null; name: string; price: number; isExclusion: boolean }[] = [];
    const groups = Array.isArray(item.variants) ? item.variants : [];

    groups.forEach((g: any) => {
      if (g.selected) {
        rows.push({ qty: 1, name: g.selected.title || g.selected.name || g.name || 'Opción', price: Number(g.selected.unitPrice || 0), isExclusion: false });
      } else if (Array.isArray(g.items)) {
        g.items.forEach((it: any) => {
          rows.push({ qty: Number(it.quantity || it.qty || 1), name: it.title || it.name || 'Opción', price: Number(it.unitPrice || it.price || 0), isExclusion: false });
        });
      }
    });

    const lines: string[] = Array.isArray(item.breakdown) ? item.breakdown : [];
    lines.forEach((line: string) => {
      const isExclusion = /sin\s/i.test(line);
      if (isExclusion) {
        rows.push({ qty: null, name: line, price: 0, isExclusion: true });
      } else if (rows.length === 0) {
        const match = line.match(/^(\d+)x\s+(.+)$/);
        if (match) rows.push({ qty: Number(match[1]), name: match[2], price: 0, isExclusion: false });
      }
    });

    return rows;
  };

  // Prioridad: datos reales del backend (/public) → datos locales del checkout. Sin valores inventados.
  const displayMerchant = remote?.food_store || orderData?.merchantName || orderSummary?.merchantName || '';
  const displayId = remote?.order_number || remote?.id || orderData?.id || orderId || '';
  const displayClient = remote?.customer_name || orderData?.nombre || '';
  const displayAddress = remote?.customer_address_text || orderData?.direccion || orderSummary?.direccion || '';
  const costoEnvio = Number(orderData?.costoEnvio ?? orderSummary?.costoEnvio ?? remote?.service_amount ?? 0);
  const propinaVal = Number(orderData?.propina ?? orderSummary?.propina ?? remote?.customer_tip_amount ?? 0);
  const displayTotal = Number(orderData?.totalUSD ?? remote?.totalPaidDefaultAmount ?? (orderSummary?.totalUSD ? (orderSummary.totalUSD + propinaVal) : 0));
  const subtotalNeto = currentItems.reduce((acc: number, it: any) => acc + ((it.price || 0) * (it.qty || it.quantity || 1)), 0);
  // Fuente única de verdad para la tasa de referencia: Total Bs. = Total USD * Tasa REF
  const remoteRate = Number(remote?.totalPaidDefaultAmount) > 0 ? Number(remote?.totalPaidReferenceAmount) / Number(remote?.totalPaidDefaultAmount) : 0;
  const tasaRef = Number(orderData?.tasa) || remoteRate || 0;
  const displayTotalBs = displayTotal * tasaRef;
  // Cofre Recompensa D'una: refleja el 25% OFF en flete si el cliente lo activó en el checkout
  const descuentoFleteVal = orderData?.descuentoUSD ?? 0;
  const costoEnvioFinal = Math.max(0, costoEnvio - descuentoFleteVal);
  const displayPhone = remote?.customer_phone || orderData?.telefono || orderSummary?.telefono || '';
  const metodoPagoLower = String(orderData?.metodoPago || '').toLowerCase();
  const isPagoMethod = (keyword: string) => metodoPagoLower.includes(keyword);
  const trackingHistory: any[] = Array.isArray(remote?.history)
    ? [...remote.history].sort((x: any, y: any) => new Date(x.date).getTime() - new Date(y.date).getTime())
    : [];
  const DIVIDER = '-'.repeat(40);

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-[420px] max-h-[90vh] overflow-hidden rounded-[28px] bg-white shadow-2xl border border-slate-100 flex flex-col justify-between">

        {/* Cabecera */}
        <div className="bg-[#fe6712] px-5 py-3 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight leading-none">Orden #{displayId}</h2>
              <p className="text-[9px] text-orange-100 font-medium mt-0.5">Monitoreo de Flota D&apos;una Cabimas</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 hover:bg-white/35 transition cursor-pointer">
            <X className="h-3.5 w-3.5 text-white" />
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-slate-200 shrink-0 bg-slate-50">
          <button onClick={() => setActiveTab('KITCHEN')} className={`flex-1 py-3 text-[10px] font-black flex flex-col items-center gap-1 transition-colors border-b-2 ${activeTab === 'KITCHEN' ? 'border-[#fe6712] text-[#fe6712] bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Printer className="w-4 h-4" /> Comanda POS
          </button>
          <button onClick={() => setActiveTab('TRACKING')} className={`flex-1 py-3 text-[10px] font-black flex flex-col items-center gap-1 transition-colors border-b-2 ${activeTab === 'TRACKING' ? 'border-[#fe6712] text-[#fe6712] bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Clock className="w-4 h-4" /> Estatus
          </button>
          <button onClick={() => setActiveTab('RECEIPT')} className={`flex-1 py-3 text-[10px] font-black flex flex-col items-center gap-1 transition-colors border-b-2 ${activeTab === 'RECEIPT' ? 'border-[#fe6712] text-[#fe6712] bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Receipt className="w-4 h-4" /> Recibo
          </button>
        </div>

        {/* Cuerpo Scrolleable */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 no-scrollbar bg-slate-50/50">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#fe6712] animate-spin" />
              <p className="text-xs font-bold text-slate-500">Sincronizando de forma segura...</p>
            </div>
          ) : (!remote && !orderData) ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-2 text-center">
              <Clock className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-bold text-slate-600">{trackingError || 'No hay información del pedido.'}</p>
              {orderId || remote ? <p className="text-[10px] text-slate-400">Reintentando automáticamente…</p> : null}
            </div>
          ) : (
            <>
              {/* VISTA 1: COMANDA EXACTA (DISEÑO DEL PDF) */}
              {activeTab === 'KITCHEN' && (
                <div className="animate-in fade-in duration-300">
                  <div className="bg-[#fe6712]/10 border border-[#fe6712]/30 text-[#fe6712] text-[10px] font-bold p-3 rounded-xl mb-4 flex items-start gap-2 shadow-sm">
                    <ChefHat className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>Así imprime la máquina (POS) en el restaurante cuando se recibe un pedido en <strong>Modo Familia</strong>.</p>
                  </div>

                  <div className="bg-white p-5 shadow-sm border border-slate-300 font-mono text-[10px] sm:text-[11px] text-slate-900 mx-auto w-full max-w-[320px] relative">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAiIGZpbGw9IiNmMThmMWZhIi8+PC9zdmc+')] bg-repeat-x rotate-180"></div>

                    {/* CABECERA */}
                    <div className="text-center mt-2">
                      <h3 className="font-black text-sm uppercase">{displayMerchant}</h3>
                      <p>COMANDA N° {displayId}</p>
                      <p>{new Date().toLocaleDateString('es-VE')} {new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                      <p className="uppercase font-bold">{orderData?.metodoEntrega === 'pickup' ? 'Retiro en Tienda' : 'Delivery'}</p>
                    </div>

                    <p className="text-slate-300 select-none overflow-hidden whitespace-nowrap my-1.5">{DIVIDER}</p>

                    <div className="text-center text-[8.5px] text-slate-500 italic leading-tight px-1">
                      Este documento es una Comanda / Orden de Compra interna y no constituye factura fiscal.
                    </div>

                    <p className="text-slate-300 select-none overflow-hidden whitespace-nowrap my-1.5">{DIVIDER}</p>

                    {/* DATOS DEL CLIENTE */}
                    <div className="space-y-0.5">
                      <p>Cliente: {displayClient}</p>
                      <p>Teléfono: {displayPhone || 'N/D'}</p>
                      <p>Dirección: {displayAddress}</p>
                    </div>

                    <p className="text-slate-300 select-none overflow-hidden whitespace-nowrap my-1.5">{DIVIDER}</p>

                    {/* PRODUCTOS */}
                    <div className="space-y-1.5">
                      {currentItems.length > 0 ? (
                        currentItems.map((item: any, idx: number) => {
                          const qty = item.qty || item.quantity || 1;
                          const price = item.price || 0;
                          const total = price * qty;
                          const variantRows = getItemBreakdownRows(item);

                          if (variantRows.length > 0) {
                            return (
                              <div key={item.cartItemId || item.code || idx}>
                                <p className="text-center text-slate-500 truncate">-------- {String(item.name || '').toUpperCase()} --------</p>
                                {variantRows.map((v, vIdx) => (
                                  <div key={vIdx} className={`flex justify-between gap-2 ${v.isExclusion ? 'text-red-600 font-bold' : ''}`}>
                                    <span className="truncate">{v.qty ? `${v.qty} ` : ''}{v.name}</span>
                                    <span className="shrink-0">{v.price > 0 && v.qty ? (v.price * v.qty).toFixed(2) : ''}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between font-bold">
                                  <span>Subtotal</span>
                                  <span>{total.toFixed(2)}</span>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div key={item.cartItemId || item.code || idx} className="flex justify-between gap-2 font-bold">
                              <span className="truncate">{qty} {item.name}</span>
                              <span className="shrink-0">{total.toFixed(2)}</span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-center text-slate-400 italic">No hay productos registrados en esta orden.</p>
                      )}
                    </div>

                    <p className="text-slate-300 select-none overflow-hidden whitespace-nowrap my-1.5">{DIVIDER}</p>

                    {/* CIERRE Y PAGOS */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between">
                        <span>Subtotal general</span>
                        <span>{subtotalNeto.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>
                          {orderData?.metodoEntrega === 'pickup' ? 'Retiro en Tienda' : 'Domicilio'}
                          {descuentoFleteVal > 0 && <span className="text-emerald-600"> (Cofre -25%)</span>}
                        </span>
                        <span>
                          {descuentoFleteVal > 0 ? (
                            <>
                              <span className="line-through text-slate-400 mr-1">{costoEnvio.toFixed(2)}</span>
                              <span className="text-emerald-600 font-black">{costoEnvioFinal.toFixed(2)}</span>
                            </>
                          ) : (
                            costoEnvio.toFixed(2)
                          )}
                        </span>
                      </div>
                      {propinaVal > 0 && (
                        <div className="flex justify-between">
                          <span>Propina</span>
                          <span>{propinaVal.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-slate-300 select-none overflow-hidden whitespace-nowrap my-1.5">{DIVIDER}</p>

                    <div className="grid grid-cols-[1fr_auto] gap-x-2 font-black text-sm uppercase">
                      <span>Total</span>
                      <span className="text-right">${displayTotal.toFixed(2)}</span>
                      {tasaRef > 0 && <><span className="truncate">Ref Bs.S {tasaRef.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <span className="text-right">Bs.S {displayTotalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></>}
                    </div>

                    <p className="text-slate-300 select-none overflow-hidden whitespace-nowrap my-1.5">{DIVIDER}</p>

                    {/* FORMA DE PAGO */}
                    <div>
                      <p className="font-bold mb-0.5">Forma de pago:</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        <span>{isPagoMethod('efectivo') ? '☑' : '☐'} Efectivo</span>
                        <span>{isPagoMethod('movil') || isPagoMethod('móvil') ? '☑' : '☐'} Pago móvil</span>
                        <span>{isPagoMethod('transfer') ? '☑' : '☐'} Transferencia</span>
                        <span>{isPagoMethod('divisa') || isPagoMethod('usd') || isPagoMethod('dolar') || isPagoMethod('dólar') ? '☑' : '☐'} Divisas</span>
                      </div>
                    </div>

                    <p className="text-slate-300 select-none overflow-hidden whitespace-nowrap my-1.5">{DIVIDER}</p>

                    {/* NOTAS */}
                    <div>
                      <p className="font-bold">Notas:</p>
                      <p className="text-slate-400">{orderData?.observaciones || '(Sin observaciones)'}</p>
                    </div>

                    <p className="text-slate-300 select-none overflow-hidden whitespace-nowrap my-1.5">{DIVIDER}</p>

                    <div className="text-center space-y-0.5">
                      <p className="font-bold">¡Gracias por tu pedido!</p>
                      <p>Preparado por: ______________</p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wide mt-1">D&apos;una Group · Soporte 24/7</p>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAiIGZpbGw9IiNmMThmMWZhIi8+PC9zdmc+')] bg-repeat-x"></div>
                  </div>
                </div>
              )}

              {/* VISTA 2: SEGUIMIENTO ORIGINAL (TIMELINE) */}
              {activeTab === 'TRACKING' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  {trackingError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold p-2.5 rounded-xl">{trackingError}</div>
                  )}
                  <div className="bg-orange-50/70 border border-orange-200/60 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Cliente</span>
                      {remote && (
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 ${remote.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {!FINAL_STATUSES.includes(String(remote.status || '').toUpperCase()) && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                          {trackingHistory.length > 0 ? trackingHistory[trackingHistory.length - 1].status : remote.status}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-slate-900 leading-tight">{displayClient}</h3>
                    <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#fe6712] shrink-0" />
                      <span className="truncate">{displayAddress}</span>
                    </p>
                  </div>

                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-4">Estatus del pedido</h4>
                    {trackingHistory.length === 0 ? (
                      <p className="text-[10px] text-slate-400">Sin movimientos registrados todavía.</p>
                    ) : (
                      <div className="space-y-4 relative before:absolute before:inset-y-2 before:left-3 before:w-0.5 before:bg-slate-200">
                        {trackingHistory.map((h: any, hIdx: number) => {
                          const isLast = hIdx === trackingHistory.length - 1;
                          const isCancel = isLast && String(remote?.status || '').toUpperCase() === 'CANCELLED';
                          return (
                            <div key={h.id ?? hIdx} className="flex items-start gap-3 relative">
                              <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center z-10 shrink-0 text-xs shadow-xs ${isCancel ? 'bg-red-500' : isLast && !FINAL_STATUSES.includes(String(remote?.status || '').toUpperCase()) ? 'bg-[#fe6712] animate-pulse' : 'bg-emerald-500'}`}>{isCancel ? '✕' : '✓'}</div>
                              <div>
                                <h5 className="text-xs font-black text-slate-900 leading-none">{h.status}</h5>
                                <p className="text-[10px] text-slate-500 mt-0.5">{h.date ? new Date(h.date).toLocaleString('es-VE') : ''}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VISTA 3: RECIBO DEL CLIENTE */}
              {activeTab === 'RECEIPT' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comercio</h4>
                        <p className="font-black text-slate-900 text-sm">{displayMerchant}</p>
                      </div>
                      <div className="text-right">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Orden</h4>
                        <p className="font-black text-[#fe6712] text-sm">#{displayId}</p>
                      </div>
                    </div>

                    <p className="text-[9px] text-slate-400 italic leading-tight">
                      Este documento es una Comanda / Orden de Compra interna y no constituye factura fiscal.
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <p className="truncate"><strong>Entrega:</strong> {displayAddress}</p>
                    </div>

                    {displayPhone && (
                      <p className="text-xs text-slate-600"><strong>Teléfono:</strong> {displayPhone}</p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                      <DollarSign className="w-4 h-4 shrink-0 text-emerald-600" />
                      <p><strong>Pago verificado:</strong> {orderData?.metodoPago === 'efectivo' ? 'Efectivo en Entrega' : 'Pago Móvil'}</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm font-mono text-[11px] text-slate-900">
                    <h4 className="font-black flex items-center gap-2 mb-2 text-xs uppercase">
                      <FileText className="w-4 h-4 text-[#fe6712]" /> Resumen de Compra
                    </h4>

                    <p className="text-slate-300 select-none overflow-hidden whitespace-nowrap my-1">{DIVIDER}</p>

                    <div className="space-y-1.5">
                      {currentItems.length > 0 ? (
                        currentItems.map((item: any, idx: number) => {
                          const qty = item.qty || item.quantity || 1;
                          const price = item.price || 0;
                          const itemTotal = price * qty;
                          const variantRows = getItemBreakdownRows(item);

                          if (variantRows.length > 0) {
                            return (
                              <div key={item.cartItemId || item.code || idx}>
                                <p className="text-center text-slate-500 truncate">-------- {String(item.name || '').toUpperCase()} --------</p>
                                {variantRows.map((v, vIdx) => (
                                  <div key={vIdx} className={`flex justify-between gap-2 ${v.isExclusion ? 'text-red-600 font-bold' : ''}`}>
                                    <span className="truncate">{v.qty ? `${v.qty} ` : ''}{v.name}</span>
                                    <span className="shrink-0">{v.price > 0 && v.qty ? (v.price * v.qty).toFixed(2) : ''}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between font-bold">
                                  <span>Subtotal</span>
                                  <span>{itemTotal.toFixed(2)}</span>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div key={item.cartItemId || item.code || idx} className="flex justify-between gap-2 font-bold">
                              <span className="truncate">{qty} {item.name}</span>
                              <span className="shrink-0">{itemTotal.toFixed(2)}</span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-center text-slate-400 italic">No hay productos registrados en esta orden.</p>
                      )}
                    </div>

                    <p className="text-slate-300 select-none overflow-hidden whitespace-nowrap my-1.5">{DIVIDER}</p>

                    <div className="space-y-0.5">
                      <div className="flex justify-between">
                        <span>Subtotal general</span>
                        <span>{subtotalNeto.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>
                          Domicilio
                          {descuentoFleteVal > 0 && <span className="text-emerald-600"> (Cofre -25%)</span>}
                        </span>
                        <span>
                          {descuentoFleteVal > 0 ? (
                            <>
                              <span className="line-through text-slate-400 mr-1">{costoEnvio.toFixed(2)}</span>
                              <span className="text-emerald-600 font-black">{costoEnvioFinal.toFixed(2)}</span>
                            </>
                          ) : (
                            costoEnvio.toFixed(2)
                          )}
                        </span>
                      </div>
                      {propinaVal > 0 && (
                        <div className="flex justify-between">
                          <span>Propina</span>
                          <span>{propinaVal.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-slate-300 select-none overflow-hidden whitespace-nowrap my-1.5">{DIVIDER}</p>

                    <div className="grid grid-cols-[1fr_auto] gap-x-2 font-black text-sm uppercase">
                      <span>Total</span>
                      <span className="text-right">${displayTotal.toFixed(2)}</span>
                      {tasaRef > 0 && <><span className="truncate">Ref Bs.S {tasaRef.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <span className="text-right">Bs.S {displayTotalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></>}
                    </div>

                    <p className="text-slate-300 select-none overflow-hidden whitespace-nowrap my-1.5">{DIVIDER}</p>

                    <div>
                      <p className="font-bold mb-0.5">Forma de pago:</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        <span>{isPagoMethod('efectivo') ? '☑' : '☐'} Efectivo</span>
                        <span>{isPagoMethod('movil') || isPagoMethod('móvil') ? '☑' : '☐'} Pago móvil</span>
                        <span>{isPagoMethod('transfer') ? '☑' : '☐'} Transferencia</span>
                        <span>{isPagoMethod('divisa') || isPagoMethod('usd') || isPagoMethod('dolar') || isPagoMethod('dólar') ? '☑' : '☐'} Divisas</span>
                      </div>
                    </div>

                    <p className="text-slate-300 select-none overflow-hidden whitespace-nowrap my-1.5">{DIVIDER}</p>

                    <div>
                      <p className="font-bold">Notas:</p>
                      <p className="text-slate-400">{orderData?.observaciones || '(Sin observaciones)'}</p>
                    </div>

                    <p className="text-slate-300 select-none overflow-hidden whitespace-nowrap my-1.5">{DIVIDER}</p>

                    <div className="text-center space-y-0.5">
                      <p className="font-bold">¡Gracias por tu pedido!</p>
                      <p>Preparado por: ______________</p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wide mt-1 font-sans">D&apos;una Group · Soporte 24/7</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-white shrink-0">
          <div className="flex items-center justify-between mb-3 text-[10px] font-bold text-slate-600">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Garantía D'una</span>
            <span className="text-[#fe6712]">Soporte 24/7</span>
          </div>
          <button type="button" onClick={onClose} className="w-full py-2.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white font-black text-xs transition cursor-pointer shadow-md">
            Cerrar seguimiento
          </button>
        </div>

      </div>
    </div>
  );
}