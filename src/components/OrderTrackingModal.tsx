'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Clock, MapPin, ShieldCheck, RefreshCw, ChefHat, 
  Bike, PackageCheck, Receipt, Printer, DollarSign, FileText 
} from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
}

export default function OrderTrackingModal({ isOpen, onClose, orderId }: OrderTrackingModalProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'TRACKING' | 'KITCHEN' | 'RECEIPT'>('TRACKING');

  useEffect(() => {
    if (!isOpen) return;

    async function fetchLatestOrder() {
      setLoading(true);
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          setOrderData({
            id: querySnapshot.docs[0].id.slice(-6).toUpperCase(),
            ...docData
          });
        } else {
          // Fallback local
          setOrderData({
            id: orderId || 'DUNA-788',
            nombre: 'OSMER BENITO',
            direccion: 'Cabimas, Estado Zulia',
            totalUSD: 13.80,
            status: 'pendiente',
            metodoPago: 'pago_movil',
            createdAt: new Date()
          });
        }
      } catch (err: any) {
        console.warn("Usando datos locales de respaldo para seguimiento:", err.message);
        setOrderData({
          id: orderId || 'DUNA-788',
          nombre: 'OSMER BENITO',
          direccion: 'Cabimas, Estado Zulia',
          totalUSD: 13.80,
          status: 'pendiente',
          metodoPago: 'pago_movil',
          createdAt: new Date()
        });
      } finally {
        setLoading(false);
      }
    }

    fetchLatestOrder();
  }, [isOpen, orderId]);

  if (!isOpen) return null;

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
              <h2 className="text-sm font-black tracking-tight leading-none">Orden #{orderData?.id || orderId}</h2>
              <p className="text-[9px] text-orange-100 font-medium mt-0.5">Monitoreo de Flota D&apos;una Cabimas</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 hover:bg-white/35 transition cursor-pointer">
            <X className="h-3.5 w-3.5 text-white" />
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-slate-200 shrink-0 bg-slate-50">
          <button onClick={() => setActiveTab('TRACKING')} className={`flex-1 py-3 text-[10px] font-black flex flex-col items-center gap-1 transition-colors border-b-2 ${activeTab === 'TRACKING' ? 'border-[#fe6712] text-[#fe6712] bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Clock className="w-4 h-4" /> Estatus
          </button>
          <button onClick={() => setActiveTab('KITCHEN')} className={`flex-1 py-3 text-[10px] font-black flex flex-col items-center gap-1 transition-colors border-b-2 ${activeTab === 'KITCHEN' ? 'border-[#fe6712] text-[#fe6712] bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <ChefHat className="w-4 h-4" /> Comanda
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
              <p className="text-xs font-bold text-slate-500">Sincronizando con base de datos...</p>
            </div>
          ) : (
            <>
              {/* VISTA 1: SEGUIMIENTO ORIGINAL (Intacta) */}
              {activeTab === 'TRACKING' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-orange-50/70 border border-orange-200/60 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Cliente</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> En proceso
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 leading-tight">{orderData.nombre || 'Cliente D\'una'}</h3>
                    <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#fe6712] shrink-0" />
                      <span className="truncate">{orderData.direccion || 'Cabimas, Estado Zulia'}</span>
                    </p>
                  </div>

                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-4">Estatus del pedido</h4>
                    <div className="space-y-4 relative before:absolute before:inset-y-2 before:left-3 before:w-0.5 before:bg-slate-200">
                      
                      <div className="flex items-start gap-3 relative">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center z-10 shrink-0 text-xs shadow-xs">✓</div>
                        <div>
                          <h5 className="text-xs font-black text-slate-900 leading-none">Pedido Recibido</h5>
                          <p className="text-[10px] text-slate-500 mt-0.5">Pago validado por pasarela D&apos;una.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 relative">
                        <div className="w-6 h-6 rounded-full bg-[#fe6712] text-white flex items-center justify-center z-10 shrink-0 shadow-xs animate-pulse">
                          <ChefHat className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-900 leading-none">En preparación</h5>
                          <p className="text-[10px] text-slate-500 mt-0.5">El aliado comercial está cocinando.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 relative opacity-50">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center z-10 shrink-0"><Bike className="w-3.5 h-3.5" /></div>
                        <div>
                          <h5 className="text-xs font-black text-slate-700 leading-none">En camino</h5>
                          <p className="text-[10px] text-slate-400 mt-0.5">Asignado a Flota Activa Cabimas.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 relative opacity-50">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center z-10 shrink-0"><PackageCheck className="w-3.5 h-3.5" /></div>
                        <div>
                          <h5 className="text-xs font-black text-slate-700 leading-none">Entregado</h5>
                          <p className="text-[10px] text-slate-400 mt-0.5">¡Disfruta tu pedido D&apos;una!</p>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* VISTA 2: COMANDA DE COCINA (TICKET TÉRMICO) */}
              {activeTab === 'KITCHEN' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-amber-100/40 border border-amber-200 text-amber-800 text-[10px] font-bold p-3 rounded-xl mb-4 flex items-start gap-2 shadow-sm">
                    <Printer className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>Así debe imprimirse o mostrarse la comanda en la pantalla del restaurante usando el <strong>Modo Familia</strong>.</p>
                  </div>

                  <div className="bg-[#fdfbf7] p-5 shadow-sm border border-slate-300 font-mono text-xs text-slate-800 relative">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAiIGZpbGw9IiNmMThmMWZhIi8+PC9zdmc+')] bg-repeat-x rotate-180"></div>
                    
                    <div className="text-center border-b-2 border-dashed border-slate-400 pb-3 mb-3 mt-1">
                      <h3 className="font-black text-lg uppercase tracking-widest">Mostaza</h3>
                      <p className="text-[10px] uppercase mt-0.5">Food Truck</p>
                      <p className="text-base mt-2">ORDEN: <span className="font-black">#{orderData.id}</span></p>
                      <p className="text-[10px] mt-1">{new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="font-black text-sm">1x COMBO 5 PERROS SIFRINOS</p>
                        <div className="pl-2 mt-2 space-y-2 text-[11px]">
                          <div className="border-l-2 border-slate-800 pl-2">
                            <p className="font-bold">[1] Para: OMAR</p>
                            <p className="text-slate-600">- SIN Queso</p>
                          </div>
                          <div className="border-l-2 border-slate-800 pl-2">
                            <p className="font-bold">[2] Para: OSVALDO</p>
                            <p className="text-slate-600 uppercase font-bold text-red-600">* SIN Salchicha</p>
                            <p className="text-slate-600">- SIN Ensalada</p>
                          </div>
                          <div className="border-l-2 border-slate-800 pl-2">
                            <p className="font-bold">[3] Para: ESPOSA</p>
                            <p className="text-slate-600">- SIN Salsas, SIN Papitas</p>
                          </div>
                          <div className="border-l-2 border-slate-800 pl-2">
                            <p className="font-bold">[4] Para: HIJA</p>
                            <p className="text-slate-600 uppercase">CON TODO</p>
                          </div>
                          <div className="border-l-2 border-slate-800 pl-2">
                            <p className="font-bold">[5] Para: INVITADO</p>
                            <p className="text-slate-600 uppercase">CON TODO</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t-2 border-dashed border-slate-400 pt-3 mt-4 text-center">
                      <p className="font-bold text-sm uppercase">Total a preparar: 5</p>
                      <p className="text-[10px] mt-2">--- FIN DE COMANDA ---</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAiIGZpbGw9IiNmMThmMWZhIi8+PC9zdmc+')] bg-repeat-x"></div>
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
                        <p className="font-black text-slate-900 text-sm">Mostaza Food Truck</p>
                      </div>
                      <div className="text-right">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Orden</h4>
                        <p className="font-black text-[#fe6712] text-sm">#{orderData.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <p className="truncate"><strong>Entrega:</strong> {orderData.direccion}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                      <DollarSign className="w-4 h-4 shrink-0 text-emerald-600" />
                      <p><strong>Pago verificado:</strong> {orderData.metodoPago === 'pago_movil' ? 'Pago Móvil' : orderData.metodoPago}</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="font-black text-slate-900 flex items-center gap-2 mb-3 text-sm">
                      <FileText className="w-4 h-4 text-[#fe6712]" /> Resumen de Compra
                    </h4>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 font-medium">1x Combo 5 Perros Sifrinos</span>
                        <span className="font-bold text-slate-900">$12.30</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-bold text-slate-700">$12.30</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Delivery D'una</span>
                        <span className="font-bold text-slate-700">$1.50</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-3 mt-3 flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                      </div>
                      <span className="text-xl font-black text-slate-900">${orderData.totalUSD.toFixed(2)}</span>
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