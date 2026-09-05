'use client';

import React from 'react';
import { X, Check, Clock, FileText, CheckCircle2, MessageCircle } from 'lucide-react';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewTracking: () => void;
  onViewReceipt: () => void;
  storeName?: string;
  pagoAnexado?: boolean; // LA LLAVE MÁGICA: Define qué cara de la ventana se muestra
}

export default function OrderSuccessModal({ 
  isOpen, 
  onClose, 
  onViewTracking, 
  onViewReceipt,
  storeName = "Papá Helado",
  pagoAnexado = true // Por defecto lo dejamos en true para no romper usos anteriores
}: OrderSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="purchase-overlay">
      <div className="purchase-modal-container">
        
        {/* Cabecera Corporativa (INTACTA) */}
        <div className="purchase-header">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-white flex items-center justify-center text-[#fe6712] font-black text-xs shadow-sm">
              🍦
            </div>
            <div>
              <h2 className="text-xs font-black tracking-tight leading-none text-white">{storeName}</h2>
              <p className="text-[9px] text-orange-100 font-medium mt-0.5">Confirmación De Orden</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition text-white cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Cuerpo Plano (CON RENDERIZADO CONDICIONAL) */}
        <div className="purchase-body flex flex-col items-center justify-center text-center py-6">
          
          {pagoAnexado ? (
            /* CONDICIÓN A: EL CLIENTE SÍ ENVIÓ EL PAGO (Tu código original 100% intacto) */
            <>
              <div className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mb-4">
                <Check className="h-8 w-8 stroke-[3]" />
              </div>

              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">
                ¡Pedido enviado!
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-6">
                Tu orden ha sido procesada con éxito.
              </p>

              <button 
                onClick={onViewReceipt}
                className="text-xs font-black text-[#fe6712] hover:underline flex items-center gap-1.5 transition cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Ver Mi Recibo Digital</span>
              </button>
            </>
          ) : (
            /* CONDICIÓN B: EL CLIENTE NO ENVIÓ EL PAGO (Neuromarketing D'una) */
            <div className="flex flex-col items-center text-center w-full px-4 animate-in fade-in zoom-in duration-300">
              <div className="w-14 h-14 bg-orange-100 text-[#fe6712] rounded-full flex items-center justify-center mb-4 shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              
              <h3 className="text-lg font-black text-slate-900 leading-tight mb-1.5">
                ¡Tu pedido ya está en la cocina! 🚀
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mb-5 px-2">
                En <strong className="text-[#fe6712]">D'una</strong> tú tienes el control. Elige la opción de pago que prefieras:
              </p>

              <div className="w-full bg-slate-50 rounded-2xl p-3 text-left space-y-2.5 border border-slate-100 shadow-sm">
                <div className="flex gap-2.5 items-start">
                  <div className="mt-0.5"><Clock className="w-4 h-4 text-[#fe6712]" /></div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 leading-none mb-1">Pago Express</h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-snug">
                      Sube tu comprobante en el seguimiento de orden para acelerar tu envío.
                    </p>
                  </div>
                </div>
                
                <div className="w-full h-px bg-slate-200"></div>

                <div className="flex gap-2.5 items-start">
                  <div className="mt-0.5"><MessageCircle className="w-4 h-4 text-[#10b981]" /></div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 leading-none mb-1">Pago Directo (WhatsApp)</h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-snug">
                      No subas nada ahora. Espera a que <strong className="text-[#fe6712]">{storeName}</strong> te escriba para pagarles con total confianza.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer (INTACTO) */}
        <div className="purchase-footer flex flex-col gap-2">
          <button
            type="button"
            onClick={onViewTracking}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#fe6712] hover:bg-[#e0580d] py-3 text-xs font-black text-white shadow-md transition active:scale-[0.98] cursor-pointer"
          >
            <Clock className="h-4 w-4" />
            <span>Ver seguimiento de pedido</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 py-3 text-xs font-black text-slate-700 transition active:scale-[0.98] cursor-pointer"
          >
            Continuar
          </button>
        </div>

      </div>
    </div>
  );
}