/**
 * ==============================================================================
 * BITÁCORA DE ACTUALIZACIÓN - CARRITO D'UNA
 * ==============================================================================
 * Fecha: Miércoles, 09 de Septiembre de 2026
 * Arquitectura: Single-Line Layout (Cero scroll en productos) + Título Fase 1
 * Archivo: src/components/CartModal.tsx
 * ==============================================================================
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBeacon, BEACON_CLASS } from '@/lib/beacon';
import {
  X, Bike, Store, Navigation, MapPin,
  Trash2, ArrowRight, Truck, Package, Tag
} from 'lucide-react';

export interface CartItem {
  code: string;
  cartItemId?: string;
  category: string;
  name: string;
  desc: string;
  price: number;
  image?: string;
  img?: string;
  status: 'ACTIVE' | 'INACTIVE';
  qty: number;
  breakdown?: string[];
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalItems: number;
  subtotalUSD: number;
  deliveryMode: 'delivery' | 'pickup' | 'national';
  setDeliveryMode: (mode: 'delivery' | 'pickup' | 'national') => void;
  deliveryCost: number; // flete = cotización oficial del backend (deliveryRate); no existe ninguna regla local de "envío gratis"
  totalUSD: number;
  // Descuentos (monto negativo, en verde) y cargos (positivo) del comercio sobre el subtotal, ya calculados por la tienda con los
  // `additionalItemsPercent`/`additionalItemsAmount` reales de payment/info
  adjustmentLines?: { label: string; amount: number; isDiscount: boolean }[];
  onUpdateQty: (identifier: string, delta: number) => void;
  onOpenCheckout: (summary: any) => void;
  isNationalShippingEnabled?: boolean;
  // Cotización real de delivery (GPS + GET /deliveryRate). Por defecto 'ok' para no bloquear usos sin cotización.
  quoteStatus?: 'idle' | 'loading' | 'ok' | 'blocked';
  quoteMessage?: string;
  distanceKm?: number;
  durationMin?: number;
  customerLocation?: { lat: number; lng: number; label: string } | null;
  isLocating?: boolean;
  locationError?: string | null;
  onRequestLocation?: () => void;
  onPickLocation?: () => void; // pin del mapa: elegir una dirección de entrega distinta al GPS
}

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  totalItems,
  subtotalUSD,
  deliveryMode,
  setDeliveryMode,
  deliveryCost,
  totalUSD,
  adjustmentLines = [],
  onUpdateQty,
  onOpenCheckout,
  // El envío nacional NO tiene soporte en el contrato de Adonis: la opción solo se ofrece si el comercio lo habilita explícitamente
  isNationalShippingEnabled = false,
  quoteStatus = 'ok',
  quoteMessage,
  distanceKm,
  durationMin,
  customerLocation,
  isLocating = false,
  locationError,
  onRequestLocation,
  onPickLocation,
}: CartModalProps) {

  const [selectedAgency, setSelectedAgency] = useState<'MRW' | 'ZOOM' | 'TEALCA'>('MRW');
  const costoNacionalFijo = 4.50;

  // ── Faro guiado (Paso 1). Hooks SIEMPRE antes del `return null` (regla #300). ─────────────────────────────────────────
  const { active: beacon, fire: fireBeacon, scrollTo: beaconScrollTo } = useBeacon<'location' | 'proceed'>();
  const locationCardRef = useRef<HTMLDivElement>(null);
  const prevQuoteRef = useRef(quoteStatus);
  const hasLocation = !!customerLocation;

  // Al abrir el carrito (o cambiar a delivery) sin dirección: pulso en la tarjeta de ubicación
  useEffect(() => {
    if (!isOpen || deliveryMode !== 'delivery' || hasLocation) return;
    const t = setTimeout(() => { beaconScrollTo(locationCardRef.current); fireBeacon('location'); }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, deliveryMode, hasLocation]);

  // Cotización: "bloqueada" (fuera de zona) -> vuelve a señalar la ubicación; recién lista -> señala "Proceder al pago"
  useEffect(() => {
    const prev = prevQuoteRef.current;
    prevQuoteRef.current = quoteStatus;
    if (!isOpen || deliveryMode !== 'delivery' || prev === quoteStatus) return;
    if (quoteStatus === 'blocked') {
      beaconScrollTo(locationCardRef.current);
      fireBeacon('location');
    } else if (quoteStatus === 'ok') {
      fireBeacon('proceed');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteStatus, isOpen, deliveryMode]);

  if (!isOpen) return null;

  // En delivery no se muestra ni se cobra flete hasta tener la cotización oficial
  const deliveryBlocked = deliveryMode === 'delivery' && quoteStatus !== 'ok';
  const fleteFinalMostrado = deliveryMode === 'pickup' ? 0 : (deliveryMode === 'national' ? costoNacionalFijo : (deliveryBlocked ? 0 : deliveryCost));
  // total = subtotal + (cargos − descuentos del comercio) + flete
  const ajusteNeto = Math.round(adjustmentLines.reduce((acc, l) => acc + l.amount, 0) * 100) / 100;
  const totalCalculadoFinal = subtotalUSD + ajusteNeto + fleteFinalMostrado;
  // El modal mide 590 px fijos (325 lista + 265 totales) y el bloque de totales ya viene justo: cada línea de descuento/cargo (20 px) se
  // le resta a la lista de productos (que tiene su propio scroll) y se le da al bloque de totales, para que "Total a pagar" y
  // "PROCEDER AL PAGO" nunca queden recortados. Sin ajustes = alturas de siempre; tope de 6 líneas.
  const extraTotalsPx = Math.min(adjustmentLines.length, 6) * 20;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-[420px] h-[590px] bg-white rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        <div className="h-[325px] flex flex-col border-b border-slate-100 bg-white shrink-0" style={extraTotalsPx ? { height: 325 - extraTotalsPx } : undefined}>

          {/* Header Fijo */}
          <div className="bg-[#fe6712] w-full px-5 py-3 flex justify-between items-center text-white shrink-0">
            <div>
              <h3 className="font-black text-[17px] leading-tight mb-0.5">Fase 1: Tu Pedido y Entrega</h3>
              <p className="text-[10px] font-medium text-white/90">Revisa tus productos y configura tu destino</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition cursor-pointer shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Título de Sección Fijo */}
          <div className="px-4 pt-1 pb-0.5 shrink-0 flex justify-between items-center">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Productos Seleccionados ({totalItems})
            </h4>
          </div>

          {/* Scroll Exclusivo de Productos (DISEÑO PLANO DE 1 SOLA LÍNEA) */}
          <div className="flex-1 overflow-y-auto px-4 py-1 space-y-1 pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
            <div className="space-y-1 pb-2">
              {cartItems && cartItems.length > 0 ? (
                cartItems.map((item, idx) => (
                  <div key={item.cartItemId || item.code || idx} className="bg-white border border-slate-100 rounded-xl px-2.5 py-2 shadow-sm flex items-center gap-2">
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center justify-between gap-2 w-full">
                        <h5 className="text-[12px] font-black text-slate-900 truncate flex-1" title={item.name || 'Producto'}>
                          {item.name || 'Producto'}
                        </h5>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9.5px] text-slate-500 font-bold bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
                            Cant: {item.qty || 1}
                          </span>
                          <span className="text-[12px] font-black text-[#fe6712] w-14 text-right">
                            ${((item.price || 0) * (item.qty || 1)).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {item.breakdown && item.breakdown.length > 0 && (
                        <div className="flex flex-wrap gap-x-2 mt-0.5">
                          {item.breakdown.map((b, bIdx) => (
                            <p key={bIdx} className="text-[9px] font-semibold text-slate-500 whitespace-pre-wrap break-words leading-tight">
                              <span className="text-[#fe6712]">•</span>
                              <span className="whitespace-normal break-words">{b}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (totalItems <= 1) {
                          onClose();
                        }
                        onUpdateQty(item.cartItemId || item.code, -(item.qty || 1));
                      }}
                      className="w-6 h-6 rounded-md border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-[12px] p-3 text-center">
                  <p className="text-xs font-medium text-slate-400">No hay productos seleccionados.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="h-[265px] shrink-0 px-4 pt-2 pb-2.5 bg-white flex flex-col justify-between" style={extraTotalsPx ? { height: 265 + extraTotalsPx } : undefined}>

          <div className="space-y-1">
            <div className={`grid gap-1.5 ${isNationalShippingEnabled ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <button
                type="button"
                onClick={() => setDeliveryMode('delivery')}
                className={`py-1 rounded-full text-[11px] font-black flex items-center justify-center gap-1 transition-all ${deliveryMode === 'delivery' ? 'bg-[#fe6712] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                <Bike className="w-3 h-3" /> Delivery
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMode('pickup')}
                className={`py-1 rounded-full text-[11px] font-black flex items-center justify-center gap-1 transition-all ${deliveryMode === 'pickup' ? 'bg-[#fe6712] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                <Store className="w-3 h-3" /> Pickup
              </button>
              {isNationalShippingEnabled && (
                <button
                  type="button"
                  onClick={() => setDeliveryMode('national')}
                  className={`py-1 rounded-full text-[11px] font-black flex items-center justify-center gap-1 transition-all ${deliveryMode === 'national' ? 'bg-sky-600 text-white shadow-md' : 'bg-white border border-sky-200 text-sky-700 hover:bg-sky-50'}`}
                >
                  <Truck className="w-3 h-3" /> Nacional
                </button>
              )}
            </div>

            {deliveryMode === 'national' ? (
              <div className="bg-sky-50/80 rounded-2xl py-1.5 px-3 border border-sky-200 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-sky-900 flex items-center gap-1 shrink-0">
                  <Package className="w-3 h-3" /> Courier:
                </span>
                <select
                  value={selectedAgency}
                  onChange={(e) => setSelectedAgency(e.target.value as any)}
                  className="bg-white border border-sky-300 text-sky-900 text-[11px] font-black rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer w-full max-w-[170px]"
                >
                  <option value="MRW">MRW Encomiendas</option>
                  <option value="ZOOM">Grupo Zoom</option>
                  <option value="TEALCA">Tealca Nacional</option>
                </select>
              </div>
            ) : (
              <div ref={locationCardRef} className={`space-y-1 rounded-2xl transition ${beacon === 'location' ? BEACON_CLASS : ''}`}>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={onRequestLocation}
                    disabled={isLocating}
                    className="flex-1 border border-orange-200 text-[#fe6712] py-1 rounded-full text-[12px] font-black flex items-center justify-center gap-1 hover:bg-orange-50 transition cursor-pointer disabled:opacity-60"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Mi Ubicación
                  </button>
                  <button
                    type="button"
                    onClick={onPickLocation}
                    title="Elegir otra dirección de entrega en el mapa"
                    aria-label="Elegir otra dirección de entrega en el mapa"
                    className="w-7 h-7 border border-orange-200 text-[#fe6712] rounded-full flex items-center justify-center hover:bg-orange-50 transition cursor-pointer shrink-0"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-slate-50 rounded-full py-1 px-3 text-center border border-slate-200 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {deliveryMode === 'delivery' ? (
                    <span className={`text-[10px] font-bold truncate ${quoteStatus === 'blocked' || locationError ? 'text-red-600' : 'text-slate-700'}`}>
                      {isLocating
                        ? 'Obteniendo tu ubicación…'
                        : locationError
                          ? locationError
                          : !customerLocation
                            ? 'Toca "Mi Ubicación" para cotizar tu delivery'
                            : quoteStatus === 'loading'
                              ? 'Cotizando flete…'
                              : quoteStatus === 'blocked'
                                ? (quoteMessage || 'Servicio no disponible para tu ubicación')
                                : customerLocation.label}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-700 truncate">Retiro en la tienda</span>
                  )}
                </div>
              </div>
            )}

            {deliveryMode === 'delivery' && (
              <div className="grid grid-cols-3 pt-0.5">
                <div className="text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Flete Final</p>
                  <p className="text-[10px] font-black"><span className="text-[#fe6712]">{deliveryBlocked ? '—' : `$${deliveryCost.toFixed(2)}`}</span></p>
                </div>
                <div className="text-center border-l border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Distancia</p>
                  <p className="text-[10px] font-black text-slate-800">{distanceKm !== undefined ? `${distanceKm.toFixed(1)} km` : '—'}</p>
                </div>
                <div className="text-center border-l border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tiempo Est.</p>
                  <p className="text-[10px] font-black text-slate-800">{durationMin !== undefined ? `${durationMin} min` : '—'}</p>
                </div>
              </div>
            )}

            {deliveryMode === 'national' && (
              <div className="grid grid-cols-2 pt-0.5 px-2 bg-sky-50/50 rounded-xl py-1 border border-sky-100">
                <div className="text-center">
                  <p className="text-[8px] font-black text-sky-600 uppercase tracking-widest">Tramo 1 (Local D'una)</p>
                  <p className="text-[10px] font-black text-slate-800">Incluido</p>
                </div>
                <div className="text-center border-l border-sky-200">
                  <p className="text-[8px] font-black text-sky-600 uppercase tracking-widest">Courier Interurbano</p>
                  <p className="text-[10px] font-black text-sky-900">${costoNacionalFijo.toFixed(2)} USD</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-1 flex flex-col gap-0.5">
            <div className="flex justify-between text-slate-500 font-medium">
              <span className="text-[12px]">Subtotal:</span>
              <span className="font-black text-slate-800 text-[12px]">${subtotalUSD.toFixed(2)} USD</span>
            </div>

            {adjustmentLines.map((line, idx) => (
              <div
                key={`${line.label}-${idx}`}
                data-testid={line.isDiscount ? 'cart-store-discount' : 'cart-store-charge'}
                className={`flex justify-between items-center gap-2 font-medium ${line.isDiscount ? 'text-emerald-600' : 'text-slate-500'}`}
              >
                <span className="flex items-center gap-1 text-[12px] min-w-0">
                  {line.isDiscount && <Tag className="w-3 h-3 shrink-0" />}
                  <span className="truncate">{line.label}:</span>
                </span>
                <span className={`font-black text-[12px] shrink-0 ${line.isDiscount ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {line.amount < 0 ? '-' : '+'}${Math.abs(line.amount).toFixed(2)} USD
                </span>
              </div>
            ))}

            {deliveryMode === 'delivery' && (
              <div className="flex justify-between items-center text-slate-500 font-medium">
                <span className="flex items-center gap-1 text-[12px]">Delivery:</span>
                <span className="font-black text-[#fe6712] text-[12px]">
                  {deliveryBlocked ? '—' : `$${deliveryCost.toFixed(2)} USD`}
                </span>
              </div>
            )}

            {deliveryMode === 'national' && (
              <div className="flex justify-between items-center text-slate-500 font-medium">
                <span className="flex items-center gap-1 text-[12px] text-sky-800 font-bold">
                  Envío Nacional ({selectedAgency}):
                </span>
                <span className="font-black text-sky-700 text-[12px]">
                  ${costoNacionalFijo.toFixed(2)} USD
                </span>
              </div>
            )}

            <div className="flex justify-between items-end pt-0.5">
              <span className="text-[14px] font-semibold text-slate-700">Total a pagar:</span>
              <span className="text-[18px] font-black text-[#fe6712] leading-none">${totalCalculadoFinal.toFixed(2)} USD</span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCheckout({
                  metodoEntrega: deliveryMode,
                  direccion: deliveryMode === 'national' ? `Agencia ${selectedAgency} (Cabimas)` : 'Cabimas Centro (Sector Av. Intercomunal)',
                  costoEnvio: fleteFinalMostrado,
                  subtotalUSD: subtotalUSD,
                  totalUSD: totalCalculadoFinal,
                  esEnvioNacional: deliveryMode === 'national',
                  agenciaNacional: deliveryMode === 'national' ? selectedAgency : null,
                  costoEnvioNacional: deliveryMode === 'national' ? costoNacionalFijo : 0,
                  items: cartItems
                });
              }}
              disabled={deliveryBlocked}
              className={`w-full text-white font-black py-1.5 mt-1 rounded-full transition shadow-md text-[12px] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${deliveryMode === 'national' ? 'bg-sky-600 hover:bg-sky-700' : 'bg-[#fe6712] hover:bg-[#e0580d]'} ${beacon === 'proceed' ? BEACON_CLASS : ''}`}
            >
              <span>PROCEDER AL PAGO</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}