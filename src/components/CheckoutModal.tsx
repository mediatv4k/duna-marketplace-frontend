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
  const [activeTab, setActiveTab] = useState<'TRACKING' | 'KITCHEN' | 'RECEIPT'>('KITCHEN');

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function fetchLatestOrder() {
      setLoading(true);
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(1));
        
        // Timeout de 2 segundos para no quedarnos colgados si Firebase falla localmente
        const fetchPromise = getDocs(q);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000));
        
        const querySnapshot = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (isMounted && querySnapshot && !querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          setOrderData({
            id: querySnapshot.docs[0].id.slice(-6).toUpperCase(),
            ...docData
          });
        } else {
          throw new Error("Empty query");
        }
      } catch (err: any) {
        // Si hay error o timeout, inyectamos la data DEMO al instante
        if (isMounted) {
          setOrderData({
            id: orderId || '1986',
            nombre: 'OSMER BENITO',
            documento: '18634536',
            direccion: 'Cabimas, Estado Zulia',
            totalUSD: 14.30,
            tasa: 48.50,
            status: 'pendiente',
            metodoPago: 'pago_movil',
            createdAt: new Date()
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchLatestOrder();
    
    return () => { isMounted = false; };
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
          ) : (
            <>
              {/* VISTA 1: COMANDA EXACTA (DISEÑO DEL PDF) */}
              {activeTab === 'KITCHEN' && (
                <div className="animate-in fade-in duration-300">
                  <div className="bg-[#fe6712]/10 border border-[#fe6712]/30 text-[#fe6712] text-[10px] font-bold p-3 rounded-xl mb-4 flex items-start gap-2 shadow-sm">
                    <ChefHat className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>Así imprime la máquina (POS) en el restaurante cuando se recibe un pedido en <strong>Modo Familia</strong>.</p>
                  </div>

                  {/* TICKET TIPO PUNTO DE VENTA (IDÉNTICO AL PDF) */}
                  <div className="bg-white p-5 shadow-sm border border-slate-300 font-mono text-[10px] sm:text-[11px] text-slate-900 mx-auto w-full max-w-[320px] relative">
                    {/* Borde dentado arriba */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAiIGZpbGw9IiNmMThmMWZhIi8+PC9zdmc+')] bg-repeat-x rotate-180"></div>
                    
                    <div className="text-center mb-4 mt-2">
                      <h3 className="font-black text-sm uppercase">MOSTAZA FOOD TRUCK</h3>
                      <p>ORDEN DE COMPRA No. {orderData.id}</p>
                      <p>{new Date().toLocaleDateString('es-VE')} {new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                    </div>

                    <div className="mb-3">
                      <p>Cliente: {orderData.nombre.toLowerCase()}</p>
                    </div>

                    <table className="w-full text-left mb-3 border-collapse">
                      <thead>
                        <tr className="border-y border-slate-800 border-dashed">
                          <th className="py-1.5 w-8 font-normal">CANT</th>
                          <th className="py-1.5 font-normal">PRODUCTO</th>
                          <th className="py-1.5 text-right font-normal">PRECIO UNIT.</th>
                          <th className="py-1.5 text-right font-normal">MONTO</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2 align-top">1</td>
                          <td className="py-2 align-top">
                            <span className="uppercase block font-bold">COMBO 5 P. SIFRINOS</span>
                            <span className="pl-1 block mt-1">- [1] OMAR: Sin Queso</span>
                            <span className="pl-1 block text-red-600 font-bold">* [2] OSVALDO: Sin Salchicha</span>
                            <span className="pl-1 block">- [3] ESPOSA: Sin Salsas, Sin Papitas</span>
                            <span className="pl-1 block uppercase">- [4] HIJA: Con Todo</span>
                            <span className="pl-1 block uppercase">- [5] INVITADO: Con Todo</span>
                          </td>
                          <td className="py-2 align-top text-right">$12.30</td>
                          <td className="py-2 align-top text-right font-bold">$12.30</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td className="py-1">Domicilio</td>
                          <td></td>
                          <td className="py-1 text-right">$1.50</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td className="py-1">Propina</td>
                          <td></td>
                          <td className="py-1 text-right">$0.50</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td className="py-1">Servicio</td>
                          <td></td>
                          <td className="py-1 text-right">$0.00</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="border-t border-slate-800 border-dashed pt-2 flex justify-between font-black text-sm uppercase">
                      <span>Total:</span>
                      <span>${orderData.totalUSD.toFixed(2)}</span>
                    </div>

                    <div className="mt-4 text-center font-bold">
                      <p>REF. Bs. {(orderData.totalUSD * orderData.tasa).toFixed(2)}</p>
                    </div>

                    <div className="mt-4 text-center">
                      <p>Gracias por su compra!</p>
                    </div>

                    <div className="mt-4 flex justify-between uppercase">
                      <p>ITEMS 1</p>
                      <p>Documento: {orderData.documento || '12345678'}</p>
                    </div>

                    {/* Borde dentado abajo */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAiIGZpbGw9IiNmMThmMWZhIi8+PC9zdmc+')] bg-repeat-x"></div>
                  </div>
                </div>
              )}

              {/* VISTA 2: SEGUIMIENTO ORIGINAL (TIMELINE) */}
              {activeTab === 'TRACKING' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-orange-50/70 border border-orange-200/60 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Cliente</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> En proceso
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 leading-tight">{orderData.nombre}</h3>
                    <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#fe6712] shrink-0" />
                      <span className="truncate">{orderData.direccion}</span>
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

                    </div>
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
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Propina</span>
                        <span className="font-bold text-slate-700">$0.50</span>
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