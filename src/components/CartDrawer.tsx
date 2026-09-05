'use client';

import React, { useState, useMemo } from 'react';
import { X, Trash2, ArrowRight, Gift, Tag, Navigation, MapPin } from 'lucide-react';
import { calculateLogistics, PhysicalItem } from '../lib/logisticsEngine';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: PhysicalItem[];
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: (cartData: {
    metodoEntrega: 'delivery' | 'pickup';
    direccion: string;
    costoEnvio: number;
    totalUSD: number;
  }) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onProceedToCheckout,
}: CartDrawerProps) {
  const [metodoEntrega, setMetodoEntrega] = useState<'delivery' | 'pickup'>('delivery');
  const [direccion, setDireccion] = useState('Cabimas Centro (Sector Av. Intercomunal)');
  const [distanciaKm, setDistanciaKm] = useState<number>(0.6);
  const [tiempoMin, setTiempoMin] = useState<number>(1);
  const [isLocating, setIsLocating] = useState(false);

  const logistica = useMemo(() => {
    return calculateLogistics(items, distanciaKm);
  }, [items, distanciaKm]);

  if (!isOpen) return null;

  const descuentoDelivery = 0.25;
  const costoEnvioOriginal = logistica.costoEnvioUSD;
  const costoEnvioFinal = metodoEntrega === 'delivery' ? costoEnvioOriginal * (1 - descuentoDelivery) : 0;

  const subtotalUSD = items.reduce((sum, item) => sum + item.precio * (item.cantidad || 1), 0);
  const totalUSD = subtotalUSD + costoEnvioFinal;

  // Lógica de cálculo para la Barra de Recompensa de Delivery Gratis (Meta: $15)
  const metaEnvioGratis = 15;
  const faltaParaEnvioGratis = Math.max(0, metaEnvioGratis - subtotalUSD);
  const progresoEnvio = Math.min(100, (subtotalUSD / metaEnvioGratis) * 100);

  const handleGetLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert('Tu dispositivo no soporta geolocalización.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        setDireccion('Cabimas Centro (Ubicación GPS Sincronizada)');
        setDistanciaKm(0.6);
        setTiempoMin(1);
        setIsLocating(false);
      },
      () => {
        setDireccion('Avenida Carabobo, Cabimas');
        setDistanciaKm(0.6);
        setTiempoMin(1);
        setIsLocating(false);
      },
      { timeout: 7000 }
    );
  };

  const handleOpenMapPicker = () => {
    const ubicacionManual = prompt('Indica tu punto de referencia en Cabimas:', direccion);
    if (ubicacionManual) {
      setDireccion(ubicacionManual);
      setDistanciaKm(1.5);
      setTiempoMin(4);
    }
  };

  const handleProceed = () => {
    onProceedToCheckout({
      metodoEntrega,
      direccion,
      costoEnvio: costoEnvioFinal,
      totalUSD,
    });
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-[420px] h-[590px] overflow-hidden rounded-[28px] bg-white shadow-2xl border border-slate-100 flex flex-col justify-between">
        
        {/* Cabecera */}
        <div className="bg-[#fe6712] px-5 py-3 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-black tracking-tight leading-none">Tu Pedido y Entrega</h2>
            <p className="text-[10px] text-orange-100 font-medium mt-0.5">
              Revisa tus productos y configura tu destino
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="h-3.5 w-3.5 text-white" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="px-5 py-2.5 space-y-2 flex-1 overflow-hidden flex flex-col justify-between">
          
          {/* BARRA DE RECOMPENSA D'UNA (Reemplazo del cofre viejo) */}
          <div className="bg-orange-50/70 border border-orange-200/60 px-3 py-2 rounded-2xl shrink-0 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-800 flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5 text-[#fe6712]" />
                Recompensa D&apos;una
              </span>
              <span className="text-[9px] font-black text-[#fe6712]">
                {faltaParaEnvioGratis === 0 ? '¡Envío 100% Gratis!' : `Faltan $${faltaParaEnvioGratis.toFixed(2)} para envío gratis`}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#fe6712] h-full transition-all duration-500" style={{ width: `${progresoEnvio}%` }}></div>
            </div>
          </div>

          {/* Espacio Sagrado de Productos */}
          <div className="space-y-1 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between shrink-0">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                Productos Seleccionados ({items.length})
              </span>
            </div>

            <div className="max-h-[175px] overflow-y-auto pr-1 space-y-1.5">
              {items.length === 0 ? (
                <div className="py-6 text-center text-slate-400">
                  <p className="text-xs font-bold text-slate-600">Tu carrito está vacío</p>
                </div>
              ) : (
                items.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition shadow-2xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <h4 className="text-xs font-black text-slate-900 truncate">{item.nombre}</h4>
                      <p className="text-[9px] font-bold text-slate-400">Cant: {item.cantidad || 1}</p>
                      <p className="text-[11px] font-black text-[#fe6712]">
                        ${(item.precio * (item.cantidad || 1)).toFixed(2)} USD
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(index)}
                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-500 transition cursor-pointer shadow-2xs"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Metodología de Entrega y Ubicación */}
          <div className="space-y-1.5 pt-1.5 border-t border-slate-100 shrink-0">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setMetodoEntrega('delivery')}
                className={`py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  metodoEntrega === 'delivery' 
                    ? 'bg-[#fe6712] text-white shadow-xs' 
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🛵 Delivery</span>
              </button>
              <button
                type="button"
                onClick={() => setMetodoEntrega('pickup')}
                className={`py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  metodoEntrega === 'pickup' 
                    ? 'bg-[#fe6712] text-white shadow-xs' 
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🏬 Pickup</span>
              </button>
            </div>

            {metodoEntrega === 'delivery' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-orange-50/40 border border-orange-200 py-1 text-xs font-black text-[#fe6712] hover:bg-orange-100/50 transition cursor-pointer shadow-2xs"
                  >
                    <Navigation className="h-3 w-3" />
                    <span>{isLocating ? 'Buscando...' : 'Mi Ubicación'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenMapPicker}
                    title="Abrir mapa"
                    className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-50/40 border border-orange-200 text-[#fe6712] hover:bg-orange-100/50 transition cursor-pointer shadow-2xs shrink-0"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-200/80 text-[10px] font-bold text-slate-700 truncate text-center shadow-2xs">
                  📍 {direccion}
                </div>

                <div className="grid grid-cols-3 gap-1 text-center bg-slate-50/80 p-1 rounded-xl border border-slate-200/60">
                  <div>
                    <p className="text-[7px] font-black text-slate-400 uppercase">Flete Final</p>
                    <p className="text-[10px] font-black text-[#fe6712]">
                      <span className="line-through text-slate-300 font-normal mr-0.5">${costoEnvioOriginal.toFixed(2)}</span>
                      ${costoEnvioFinal.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[7px] font-black text-slate-400 uppercase">Distancia</p>
                    <p className="text-[10px] font-black text-slate-800">{distanciaKm} km</p>
                  </div>
                  <div>
                    <p className="text-[7px] font-black text-slate-400 uppercase">Tiempo Est.</p>
                    <p className="text-[10px] font-black text-slate-800">{tiempoMin} min</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer Financiero Fijo */}
        <div className="px-5 py-2.5 border-t border-slate-100 bg-white shrink-0 space-y-2">
          <div className="space-y-0.5 text-xs">
            <div className="flex justify-between text-slate-500 font-semibold text-xs">
              <span>Subtotal:</span>
              <span className="font-black text-slate-800">${subtotalUSD.toFixed(2)} USD</span>
            </div>
            {metodoEntrega === 'delivery' && (
              <div className="flex justify-between text-slate-500 font-semibold items-center text-xs">
                <span className="flex items-center gap-1">
                  Delivery:
                  <span className="text-[8px] font-black bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded-full">25% OFF</span>
                </span>
                <span className="font-black text-[#fe6712]">
                  {items.length > 0 ? `$${costoEnvioFinal.toFixed(2)} USD` : '$0.00 USD'}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm pt-1 border-t border-slate-100 font-black">
              <span className="text-slate-900">Total a pagar:</span>
              <span className="text-[#fe6712] text-base">${totalUSD.toFixed(2)} USD</span>
            </div>
          </div>

          <button
            type="button"
            disabled={items.length === 0}
            onClick={handleProceed}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl py-2 text-xs font-black text-white shadow-md transition active:scale-[0.98] cursor-pointer ${
              items.length === 0 
                ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-[#fe6712] hover:bg-[#e0580d] shadow-orange-500/25'
            }`}
          >
            <span>PROCEDER AL PAGO</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}