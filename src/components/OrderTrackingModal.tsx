'use client';

import React, { useState } from 'react';
import { 
  X, MapPin, MessageCircle, ShieldCheck, 
  Store, PackageCheck, Bike, CheckCircle2, Navigation, Map, Star, Clock, Check
} from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

type TrackingState = 
  | 'confirmado' 
  | 'preparando' 
  | 'asignado' 
  | 'listo' 
  | 'camino' 
  | 'cerca' 
  | 'entregado';

type ViewMode = 'timeline' | 'map' | 'rating';

export default function OrderTrackingModal({ isOpen, onClose, orderId = '788' }: OrderTrackingModalProps) {
  const [currentState, setCurrentState] = useState<TrackingState>('asignado');
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [rating, setRating] = useState(0);

  if (!isOpen) return null;

  const stateIndex: Record<TrackingState, number> = {
    confirmado: 0,
    preparando: 1,
    listo: 2,
    asignado: 3,
    camino: 4,
    cerca: 5,
    entregado: 6,
  };

  const activeIdx = stateIndex[currentState];

  const driver = {
    name: 'Daniel Delgado',
    phone: '584126573160',
    vehicleColor: 'Negro',
    plate: 'AE4R12R',
    distance: '0.6 km',
    eta: '1 min',
  };
  const deliveryCode = '681';

  const simulateAdvance = () => {
    const sequence: TrackingState[] = ['confirmado', 'preparando', 'listo', 'asignado', 'camino', 'cerca', 'entregado', 'confirmado'];
    const nextState = sequence[activeIdx + 1];
    setCurrentState(nextState);
    
    if (nextState === 'entregado') {
      setTimeout(() => setViewMode('rating'), 1200);
    } else {
      setViewMode('timeline');
    }
  };

  return (
    <div className="purchase-overlay">
      <div className="purchase-modal-container">
        
        {/* Cabecera */}
        <div className="purchase-header cursor-pointer select-none" onClick={simulateAdvance} title="Clic para simular avance">
          <div>
            <h2 className="text-sm font-black tracking-tight leading-none">
              {viewMode === 'rating' ? 'Calificar Servicio' : 'Seguimiento de Pedido'}
            </h2>
            <p className="text-[10px] text-orange-100 font-medium mt-0.5 flex items-center gap-1">
              Orden #{orderId} {viewMode !== 'rating' && <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>}
            </p>
          </div>
          <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition cursor-pointer">
            <X className="h-3.5 w-3.5 text-white" />
          </button>
        </div>

        {/* Cuerpo del Tracker */}
        <div className="purchase-body pt-3 flex flex-col gap-2.5 relative">
          
          {/* Bloque Héroe: Código de Validación */}
          {viewMode !== 'rating' && (
            <div className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-500 shrink-0 shadow-2xs ${
              activeIdx >= 6 ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50/50 border-orange-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl flex items-center justify-center ${activeIdx >= 6 ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-[#fe6712]'}`}>
                  {activeIdx >= 6 ? <Check className="h-5 w-5 stroke-[3]" /> : <ShieldCheck className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 leading-none mb-0.5">
                    {activeIdx >= 6 ? 'Estado' : 'Código de Entrega'}
                  </p>
                  <p className={`text-xl font-black leading-none tracking-tight ${activeIdx >= 6 ? 'text-emerald-600' : 'text-[#fe6712]'}`}>
                    {activeIdx >= 6 ? 'Entregado' : deliveryCode}
                  </p>
                </div>
              </div>
              
              {activeIdx < 6 && (
                <div className="flex flex-col items-end">
                  <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-sm">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-[9px] font-black text-slate-700 uppercase">{activeIdx >= 4 ? 'En Curso' : 'Preparando'}</span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tarjeta del Repartidor Consolidada */}
          {activeIdx >= 3 && viewMode !== 'rating' && (
            <div className="purchase-card-flat flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel" alt="Driver" className="h-full w-full object-cover" />
                  </div>
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                
                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase text-slate-400 leading-none mb-0.5">Repartidor Asignado</p>
                  <p className="text-xs font-black text-slate-900 leading-tight truncate">{driver.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Bike className="h-2.5 w-2.5 text-[#fe6712] shrink-0" />
                    <p className="text-[9px] font-bold text-slate-600 truncate">
                      {driver.vehicleColor} • <span className="text-slate-800">{driver.plate}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeIdx >= 4 && (
                  <div className="text-right mr-1 hidden sm:block">
                    <p className="text-[10px] font-black text-slate-800 leading-none">{driver.distance}</p>
                    <p className="text-[8px] font-bold text-slate-400">{driver.eta}</p>
                  </div>
                )}
                <button 
                  onClick={() => setViewMode(viewMode === 'map' ? 'timeline' : 'map')}
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition shadow-2xs cursor-pointer ${viewMode === 'map' ? 'bg-[#fe6712] text-white' : 'bg-orange-50 text-[#fe6712] hover:bg-orange-100'}`}
                >
                  <Map className="h-3.5 w-3.5" />
                </button>
                <a href={`https://wa.me/${driver.phone}`} target="_blank" rel="noreferrer" className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition shadow-2xs">
                  <MessageCircle className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* ÁREA DINÁMICA */}
          <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs overflow-hidden flex flex-col relative">
            
            {viewMode === 'timeline' && (
              <div className="overflow-y-auto no-scrollbar pr-1 flex flex-col gap-4">
                
                <div className={`flex gap-3 relative transition-opacity duration-300 ${activeIdx >= 6 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="flex flex-col items-center">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center z-10 ${activeIdx >= 6 ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-100 text-slate-300'}`}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="w-0.5 h-full absolute top-6 bottom-[-16px] bg-slate-100"></div>
                  </div>
                  <div className="pb-2">
                    <h4 className={`text-[11px] font-black ${activeIdx >= 6 ? 'text-emerald-600' : 'text-slate-400'}`}>¡Pedido Entregado!</h4>
                    <p className="text-[9px] text-slate-500 leading-tight mt-0.5">Disfruta tu pedido. Gracias por usar D&apos;una.</p>
                  </div>
                </div>

                <div className={`flex gap-3 relative transition-opacity duration-300 ${activeIdx >= 5 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="flex flex-col items-center">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center z-10 ${activeIdx >= 5 ? 'bg-[#fe6712] text-white shadow-md shadow-orange-500/20' : 'bg-slate-100 text-slate-300'}`}>
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <div className={`w-0.5 h-full absolute top-6 bottom-[-16px] ${activeIdx >= 6 ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>
                  </div>
                  <div className="pb-2">
                    <h4 className={`text-[11px] font-black ${activeIdx >= 5 ? 'text-slate-800' : 'text-slate-400'}`}>Repartidor Cerca</h4>
                    <p className="text-[9px] text-slate-500 leading-tight mt-0.5">Ha llegado a tu ubicación o está muy cerca.</p>
                  </div>
                </div>

                <div className={`flex gap-3 relative transition-opacity duration-300 ${activeIdx >= 4 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="flex flex-col items-center">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center z-10 ${activeIdx >= 4 ? 'bg-[#fe6712] text-white' : 'bg-slate-100 text-slate-300'}`}>
                      <Navigation className="h-3.5 w-3.5" />
                    </div>
                    <div className="w-0.5 h-full absolute top-6 bottom-[-16px] bg-slate-100"></div>
                  </div>
                  <div className="pb-2">
                    <h4 className={`text-[11px] font-black ${activeIdx >= 4 ? 'text-slate-800' : 'text-slate-400'}`}>En Camino</h4>
                    <p className="text-[9px] text-slate-500 leading-tight mt-0.5">Tu pedido está en ruta hacia tu ubicación.</p>
                  </div>
                </div>

                <div className={`flex gap-3 relative transition-opacity duration-300 ${activeIdx >= 3 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="flex flex-col items-center">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center z-10 ${activeIdx >= 3 ? 'bg-[#fe6712] text-white' : 'bg-slate-100 text-slate-300'}`}>
                      <Bike className="h-3.5 w-3.5" />
                    </div>
                    <div className="w-0.5 h-full absolute top-6 bottom-[-16px] bg-slate-100"></div>
                  </div>
                  <div className="pb-2">
                    <h4 className={`text-[11px] font-black ${activeIdx >= 3 ? 'text-slate-800' : 'text-slate-400'}`}>Repartidor Asignado</h4>
                    <p className="text-[9px] text-slate-500 leading-tight mt-0.5">Se ha asignado un motorizado a tu orden.</p>
                  </div>
                </div>

                <div className={`flex gap-3 relative transition-opacity duration-300 ${activeIdx >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="flex flex-col items-center">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center z-10 ${activeIdx >= 1 ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-300'}`}>
                      <Store className="h-3.5 w-3.5" />
                    </div>
                    <div className="w-0.5 h-full absolute top-6 bottom-[-16px] bg-slate-100"></div>
                  </div>
                  <div className="pb-2">
                    <h4 className={`text-[11px] font-black ${activeIdx >= 1 ? 'text-slate-800' : 'text-slate-400'}`}>Comercio Preparando</h4>
                    <p className="text-[9px] text-slate-500 leading-tight mt-0.5">El local aceptó y está empacando.</p>
                  </div>
                </div>
                
                <div className="flex gap-3 relative opacity-50">
                  <div className="flex flex-col items-center">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center z-10 bg-slate-800 text-white">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-800">Solicitud Confirmada</h4>
                    <p className="text-[9px] text-slate-500 leading-tight mt-0.5">Tu solicitud ha sido procesada.</p>
                  </div>
                </div>

              </div>
            )}

            {viewMode === 'map' && (
              <div className="h-full w-full bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center relative">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fe6712_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="text-center z-10 bg-white/90 p-4 rounded-2xl shadow-sm backdrop-blur-sm border border-slate-200">
                  <MapPin className="h-8 w-8 text-[#fe6712] mx-auto mb-2 animate-bounce" />
                  <p className="text-xs font-black text-slate-800">Mapa Satelital</p>
                  <p className="text-[10px] text-slate-500">Conectando GPS de Daniel...</p>
                </div>
              </div>
            )}

            {viewMode === 'rating' && (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="h-14 w-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-1">¡Servicio Completado!</h3>
                <p className="text-xs text-slate-500 mb-5 text-center">¿Qué tal estuvo la entrega con {driver.name}?</p>
                
                <div className="flex gap-2.5 mb-5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                    >
                      <Star className={`h-8 w-8 ${rating >= star ? 'fill-[#fe6712] text-[#fe6712]' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>

                <textarea 
                  placeholder="Comentarios (opcional)..." 
                  className="w-full h-24 text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#fe6712] focus:outline-none resize-none no-scrollbar mb-3 shadow-2xs"
                ></textarea>

                <button className="w-full py-3 bg-[#fe6712] hover:bg-[#e0580d] text-white text-xs font-black rounded-xl shadow-md transition active:scale-95 cursor-pointer">
                  Enviar Calificación
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="purchase-footer flex items-center justify-between">
          <div className="text-xs">
            <span className="text-[9px] text-slate-400 font-bold block leading-none uppercase tracking-wider mb-0.5">Soporte D&apos;una</span>
            <span className="font-black text-slate-800 text-[11px] cursor-pointer hover:text-[#fe6712] transition">¿Problemas con la orden?</span>
          </div>
          
          <button onClick={onClose} className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 border border-slate-200 hover:bg-slate-200 px-5 py-2.5 text-[11px] font-black text-slate-700 transition active:scale-[0.98] cursor-pointer">
            Cerrar Panel
          </button>
        </div>

      </div>
    </div>
  );
}