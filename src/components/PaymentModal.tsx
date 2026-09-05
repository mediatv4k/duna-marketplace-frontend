'use client';

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, X, HeartHandshake, Check, Copy, Upload, CheckCircle2, Info } from 'lucide-react';

export interface BankOption {
  id: string;
  code: string;
  name: string;
  shortName: string;
  type: 'pago_movil' | 'zelle' | 'binance' | 'efectivo';
  bgHover: string;
  borderActive: string;
  renderLogo: () => React.ReactNode;
}

export const BANK_CATALOG: BankOption[] = [
  {
    id: 'bnc',
    code: '0191',
    name: 'Banco Nacional de Crédito',
    shortName: 'BNC (0191)',
    type: 'pago_movil',
    bgHover: 'hover:bg-orange-50/40',
    borderActive: 'border-[#fe6712] bg-orange-50/50',
    renderLogo: () => <div className="flex h-5 w-5 items-center justify-center rounded bg-[#003865] text-white font-black text-[8px] shrink-0">BNC</div>,
  },
  {
    id: 'bdv',
    code: '0102',
    name: 'Banco de Venezuela',
    shortName: 'BDV (0102)',
    type: 'pago_movil',
    bgHover: 'hover:bg-red-50/40',
    borderActive: 'border-red-500 bg-red-50/30',
    renderLogo: () => <div className="flex h-5 w-5 items-center justify-center rounded bg-red-600 text-white font-black text-[8px] shrink-0">BDV</div>,
  },
  {
    id: 'banesco',
    code: '0134',
    name: 'Banesco',
    shortName: 'Banesco (0134)',
    type: 'pago_movil',
    bgHover: 'hover:bg-emerald-50/40',
    borderActive: 'border-emerald-600 bg-emerald-50/30',
    renderLogo: () => <div className="flex h-5 w-5 items-center justify-center rounded bg-[#007A33] text-white font-black text-[8px] shrink-0">BAN</div>,
  },
  {
    id: 'mercantil',
    code: '0105',
    name: 'Mercantil',
    shortName: 'Mercantil (0105)',
    type: 'pago_movil',
    bgHover: 'hover:bg-blue-50/40',
    borderActive: 'border-blue-600 bg-blue-50/30',
    renderLogo: () => <div className="flex h-5 w-5 items-center justify-center rounded bg-[#002B66] text-white font-black text-[8px] shrink-0">MRC</div>,
  },
  {
    id: 'zelle',
    code: 'ZELLE',
    name: 'Zelle Pay',
    shortName: 'Zelle ($)',
    type: 'zelle',
    bgHover: 'hover:bg-purple-50/40',
    borderActive: 'border-purple-600 bg-purple-50/30',
    renderLogo: () => <div className="flex h-5 w-5 items-center justify-center rounded bg-[#7414CA] text-white font-black text-[8px] shrink-0">Z</div>,
  },
  {
    id: 'binance',
    code: 'BINANCE',
    name: 'Binance Pay',
    shortName: 'Binance (USDT)',
    type: 'binance',
    bgHover: 'hover:bg-yellow-50/40',
    borderActive: 'border-yellow-500 bg-yellow-50/30',
    renderLogo: () => <div className="flex h-5 w-5 items-center justify-center rounded bg-[#F3BA2F] text-slate-900 font-black text-[8px] shrink-0">◈</div>,
  },
  {
    id: 'efectivo',
    code: 'CASH',
    name: 'Efectivo / Divisas ($)',
    shortName: 'Efectivo ($)',
    type: 'efectivo',
    bgHover: 'hover:bg-emerald-50/40',
    borderActive: 'border-emerald-600 bg-emerald-50/30',
    renderLogo: () => <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-600 text-white font-black text-[8px] shrink-0">💵</div>,
  },
];

const COUNTRY_CODES = [
  { code: '+58', label: '🇻🇪 +58' },
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+57', label: '🇨🇴 +57' },
  { code: '+34', label: '🇪🇸 +34' },
];

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderSummary: {
    metodoEntrega: 'delivery' | 'pickup';
    direccion: string;
    costoEnvio: number;
    totalUSD: number;
  };
  tasaBcv: number;
  merchantName?: string; // NUEVO: Para la hiper-personalización del mensaje
  onFinalizeOrder: (orderData: any) => void;
  onBackToCart: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  orderSummary,
  tasaBcv,
  merchantName = 'el aliado comercial', // Fallback por si no llega el nombre
  onFinalizeOrder,
  onBackToCart,
}: CheckoutModalProps) {
  // AHORA TENEMOS 3 VISTAS: formulario -> instrucciones -> exito
  const [pasoVista, setPasoVista] = useState<'formulario' | 'instrucciones' | 'exito'>('formulario');

  const [nombre, setNombre] = useState('OSMER BENITO');
  const [tipoDocumento, setTipoDocumento] = useState('V-');
  const [cedula, setCedula] = useState('12345678');
  const [codigoPais, setCodigoPais] = useState('+58');
  const [telefono, setTelefono] = useState('4246828503');

  const [propina, setPropina] = useState<number>(0.50);
  const [selectedBankId, setSelectedBankId] = useState<string>('bnc');

  const [referenciaPago, setReferenciaPago] = useState('');
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
  const [copiadoTexto, setCopiadoTexto] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalFinalUSD = orderSummary.totalUSD + propina;
  const currentBank = BANK_CATALOG.find((b) => b.id === selectedBankId) || BANK_CATALOG[0];
  const totalBolivares = totalFinalUSD * tasaBcv;

  const handleToggleTip = (monto: number) => {
    setPropina((prev) => (prev === monto ? 0 : monto));
  };

  const handleCopyText = (texto: string, campo: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoTexto(campo);
    setTimeout(() => setCopiadoTexto(null), 2000);
  };

  const handleCopyAll = () => {
    let info = '';
    if (currentBank.type === 'pago_movil') {
      info = `Banco: ${currentBank.code}\nTeléfono: 04246822886\nIdentificación: J403877114\nMonto: Bs.S ${totalBolivares.toFixed(2)}`;
    } else if (currentBank.type === 'zelle') {
      info = `Zelle: pagos@dunamarketplace.com\nTitular: D'una Group C.A.\nMonto: $${totalFinalUSD.toFixed(2)} USD`;
    } else if (currentBank.type === 'binance') {
      info = `Binance Pay ID: 837492019\nMonto: $${totalFinalUSD.toFixed(2)} USDT`;
    } else {
      info = `Efectivo al Repartidor\nMonto: $${totalFinalUSD.toFixed(2)} USD`;
    }
    navigator.clipboard.writeText(info);
    setCopiadoTexto('todo');
    setTimeout(() => setCopiadoTexto(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNombreArchivo(e.target.files[0].name);
    }
  };

  const handleProceedToInstructions = () => {
    if (!nombre.trim() || !cedula.trim() || !telefono.trim()) {
      alert('Por favor completa tus datos de contacto.');
      return;
    }
    setPasoVista('instrucciones');
  };

  const handleCompleteFinalOrder = () => {
    // 🔪 ALCABALA ELIMINADA: Ya no se obliga al usuario a meter número de referencia.
    // Pasan directo a la pantalla de éxito.

    const numeroLimpio = telefono.replace(/\D/g, '').replace(/^0+/, '');
    const telefonoCompleto = `${codigoPais}${numeroLimpio}`;

    // Disparamos la orden al backend/padre de forma silenciosa
    onFinalizeOrder({
      nombre,
      cedula: `${tipoDocumento}${cedula}`,
      telefono: telefonoCompleto,
      metodoEntrega: orderSummary.metodoEntrega,
      direccion: orderSummary.direccion,
      costoEnvio: orderSummary.costoEnvio,
      propina,
      metodoPago: currentBank.type,
      bancoSeleccionado: currentBank,
      totalUSD: totalFinalUSD,
      totalBolivares: currentBank.type === 'pago_movil' ? totalBolivares : null,
      tasaBcv,
      referencia: referenciaPago,
      comprobante: nombreArchivo,
    });

    // Cambiamos a la vista maestra de neuromarketing
    setPasoVista('exito');
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Contenedor Fijo Estricto 420x590px */}
      <div className="w-full max-w-[420px] h-[590px] overflow-hidden rounded-[28px] bg-white shadow-2xl border border-slate-100 flex flex-col justify-between">
        
        {/* Cabecera */}
        <div className="bg-[#fe6712] px-5 py-2.5 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-black tracking-tight leading-none">
              {pasoVista === 'formulario' ? 'Pasarela De Pago Segura' : pasoVista === 'instrucciones' ? 'Instrucciones De Pago' : '¡Pedido Confirmado!'}
            </h2>
            <p className="text-[9px] text-orange-100 font-medium mt-0.5">
              {pasoVista === 'formulario' ? 'Fase 3: Datos, Propina y Bancos' : pasoVista === 'instrucciones' ? 'Casi Terminamos Tu Pedido' : 'Transferencia de Control'}
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

        {/* ========================================================================= */}
        {/* VISTA 1: FORMULARIO */}
        {/* ========================================================================= */}
        {pasoVista === 'formulario' && (
          <div className="px-5 py-3 space-y-3 flex-1 overflow-y-auto">
            
            {/* Datos Personales */}
            <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100 space-y-2">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Nombre Completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-[#fe6712] focus:outline-none transition shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Cédula</label>
                  <div className="flex gap-1">
                    <select
                      value={tipoDocumento}
                      onChange={(e) => setTipoDocumento(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-1.5 py-1 text-[10px] font-bold text-slate-700 focus:border-[#fe6712] focus:outline-none cursor-pointer"
                    >
                      <option value="V-">V-</option>
                      <option value="E-">E-</option>
                      <option value="J-">J-</option>
                    </select>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-800 focus:border-[#fe6712] focus:outline-none transition shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">WhatsApp</label>
                  <div className="flex gap-1">
                    <select
                      value={codigoPais}
                      onChange={(e) => setCodigoPais(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-1.5 py-1 text-[10px] font-bold text-slate-700 focus:border-[#fe6712] focus:outline-none cursor-pointer shrink-0"
                    >
                      {COUNTRY_CODES.map((item) => (
                        <option key={item.code} value={item.code}>{item.label}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-800 focus:border-[#fe6712] focus:outline-none transition shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Propina */}
            <div>
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
                <HeartHandshake className="h-3.5 w-3.5 text-[#fe6712]" />
                Propina al Conductor (Opcional)
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[0.50, 1.00, 1.50, 2.00].map((monto) => (
                  <button
                    type="button"
                    key={monto}
                    onClick={() => handleToggleTip(monto)}
                    className={`py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                      propina === monto
                        ? 'bg-[#fe6712] text-white shadow-xs'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ${monto.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>

            {/* Catálogo de Bancos */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Selecciona El Método de Pago
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {BANK_CATALOG.map((banco) => {
                  const isSelected = selectedBankId === banco.id;
                  return (
                    <div
                      key={banco.id}
                      onClick={() => setSelectedBankId(banco.id)}
                      className={`flex items-center gap-2 p-1.5 rounded-xl border transition cursor-pointer ${banco.bgHover} ${
                        isSelected ? `${banco.borderActive} shadow-xs` : 'border-slate-200 bg-white'
                      }`}
                    >
                      {banco.renderLogo()}
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-black text-slate-900 leading-tight truncate">
                          {banco.shortName}
                        </p>
                        <p className="text-[8px] font-medium text-slate-400">Pago / Divisas</p>
                      </div>
                      {isSelected && (
                        <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#fe6712] text-white shrink-0">
                          <Check className="h-2 w-2 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 2: INSTRUCCIONES DE PAGO */}
        {/* ========================================================================= */}
        {pasoVista === 'instrucciones' && (
          <div className="px-5 py-2 space-y-2 flex-1 overflow-hidden flex flex-col justify-between">
            
            {/* Tasa BCV */}
            {currentBank.type === 'pago_movil' && (
              <div className="bg-orange-50/70 border border-orange-200/60 px-3 py-1.5 rounded-xl flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-[#fe6712]" />
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-wide">Tasa BCV Oficial</span>
                </div>
                <span className="text-[10px] font-black text-[#fe6712]">Bs.S {tasaBcv.toFixed(2)} / $</span>
              </div>
            )}

            {/* Total a Transferir */}
            <div className="text-center shrink-0">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Total A Transferir</span>
              <span className="text-xl font-black text-[#fe6712] block leading-tight mt-0.5">
                {currentBank.type === 'pago_movil'
                  ? `Bs.S ${totalBolivares.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : currentBank.type === 'binance'
                  ? `$${totalFinalUSD.toFixed(2)} USDT`
                  : `$${totalFinalUSD.toFixed(2)} USD`}
              </span>
              <span className="inline-block mt-0.5 text-[8px] font-black bg-orange-50 text-[#fe6712] px-2.5 py-0.2 rounded-full border border-orange-200/50">
                {currentBank.type === 'pago_movil'
                  ? `Vía P. M. ${currentBank.name.toUpperCase()}`
                  : currentBank.type === 'zelle'
                  ? 'Vía Zelle Pay'
                  : currentBank.type === 'binance'
                  ? 'Vía Binance Pay'
                  : 'Pago en Efectivo'}
              </span>
            </div>

            {/* Datos Contextuales Planos */}
            {currentBank.type === 'pago_movil' ? (
              <div className="space-y-1 text-xs px-1 shrink-0">
                <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                  <div>
                    <span className="text-[7px] font-black text-slate-400 uppercase block leading-none">Banco</span>
                    <span className="font-bold text-slate-800 text-[11px]">{currentBank.code}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(currentBank.code, 'banco')}
                    className="px-2 py-0.5 bg-orange-50 hover:bg-orange-100 text-[#fe6712] text-[9px] font-black rounded-lg transition cursor-pointer border border-orange-200/40 flex items-center gap-1"
                  >
                    <Copy className="h-2.5 w-2.5" />
                    <span>{copiadoTexto === 'banco' ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>

                <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                  <div>
                    <span className="text-[7px] font-black text-slate-400 uppercase block leading-none">Teléfono</span>
                    <span className="font-bold text-slate-800 text-[11px]">04246822886</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText('04246822886', 'telefono')}
                    className="px-2 py-0.5 bg-orange-50 hover:bg-orange-100 text-[#fe6712] text-[9px] font-black rounded-lg transition cursor-pointer border border-orange-200/40 flex items-center gap-1"
                  >
                    <Copy className="h-2.5 w-2.5" />
                    <span>{copiadoTexto === 'telefono' ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[7px] font-black text-slate-400 uppercase block leading-none">Identificacion</span>
                    <span className="font-bold text-slate-800 text-[11px]">J403877114</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText('J403877114', 'rif')}
                    className="px-2 py-0.5 bg-orange-50 hover:bg-orange-100 text-[#fe6712] text-[9px] font-black rounded-lg transition cursor-pointer border border-orange-200/40 flex items-center gap-1"
                  >
                    <Copy className="h-2.5 w-2.5" />
                    <span>{copiadoTexto === 'rif' ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            ) : currentBank.type === 'zelle' ? (
              <div className="space-y-1 text-xs px-1 shrink-0">
                <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                  <div>
                    <span className="text-[7px] font-black text-slate-400 uppercase block leading-none">Cuenta Zelle</span>
                    <span className="font-bold text-slate-800 text-[11px]">pagos@dunamarketplace.com</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText('pagos@dunamarketplace.com', 'zelle')}
                    className="px-2 py-0.5 bg-orange-50 hover:bg-orange-100 text-[#fe6712] text-[9px] font-black rounded-lg transition cursor-pointer border border-orange-200/40 flex items-center gap-1"
                  >
                    <Copy className="h-2.5 w-2.5" />
                    <span>{copiadoTexto === 'zelle' ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[7px] font-black text-slate-400 uppercase block leading-none">Titular</span>
                    <span className="font-bold text-slate-800 text-[11px]">D&apos;una Group C.A.</span>
                  </div>
                </div>
              </div>
            ) : currentBank.type === 'binance' ? (
              <div className="space-y-1 text-xs px-1 shrink-0">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[7px] font-black text-slate-400 uppercase block leading-none">Binance Pay ID</span>
                    <span className="font-bold text-slate-800 text-[11px]">837492019</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText('837492019', 'binance')}
                    className="px-2 py-0.5 bg-orange-50 hover:bg-orange-100 text-[#fe6712] text-[9px] font-black rounded-lg transition cursor-pointer border border-orange-200/40 flex items-center gap-1"
                  >
                    <Copy className="h-2.5 w-2.5" />
                    <span>{copiadoTexto === 'binance' ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-1 text-xs px-2 py-2 shrink-0">
                <p className="font-bold text-slate-800">💵 Pago en Efectivo al Repartidor</p>
                <p className="text-[10px] text-slate-500">Por favor ten el monto exacto preparado al recibir tu pedido en Cabimas.</p>
              </div>
            )}

            {/* Botón Copiar Todos Los Datos */}
            {currentBank.type !== 'efectivo' && (
              <button
                type="button"
                onClick={handleCopyAll}
                className="w-full py-1.5 rounded-xl border border-[#fe6712] bg-orange-50/40 hover:bg-orange-100/60 text-[#fe6712] text-[11px] font-black transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copiadoTexto === 'todo' ? '¡Todos los datos copiados!' : 'Copiar Todos Los Datos'}</span>
              </button>
            )}

            {/* 🔪 ALCABALA ELIMINADA: Inputs Opcionales y Claros */}
            {currentBank.type !== 'efectivo' && (
              <div className="space-y-1.5 shrink-0 pt-1">
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                    Nro. De Referencia (Opcional)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej. 123456"
                    value={referenciaPago}
                    onChange={(e) => setReferenciaPago(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-[#fe6712] focus:outline-none transition shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                    Comprobante (Opcional)
                  </label>
                  <label className={`flex items-center justify-center gap-2 w-full py-1.5 px-3 rounded-xl cursor-pointer transition text-xs font-bold shadow-2xs ${
                    nombreArchivo 
                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-800' 
                      : 'border border-dashed border-slate-300 bg-white hover:bg-orange-50/40 text-[#fe6712]'
                  }`}>
                    {nombreArchivo ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> : <Upload className="h-3.5 w-3.5 shrink-0" />}
                    <span className="truncate">{nombreArchivo ? `✓ Imagen subida con éxito` : 'Subir Captura'}</span>
                    <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 3: ÉXITO (MENSAJE NEUROMARKETING) */}
        {/* ========================================================================= */}
        {pasoVista === 'exito' && (
          <div className="px-6 py-8 flex-1 overflow-y-auto flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-orange-100 text-[#fe6712] rounded-full flex items-center justify-center mb-4 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">
              ¡Tu pedido ya está en la cocina! 🚀
            </h3>
            <p className="text-[13px] text-slate-500 font-medium mb-6">
              En <strong className="text-[#fe6712]">D'una</strong> tú tienes el control. Elige la opción de pago que prefieras:
            </p>

            <div className="w-full bg-slate-50 rounded-[16px] p-4 text-left space-y-3 border border-slate-100 shadow-sm">
              <div className="flex gap-3 items-start">
                <span className="text-lg leading-none">📎</span>
                <div>
                  <h4 className="text-xs font-black text-slate-800 leading-none mb-1">Pago Express</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-snug">
                    Si subiste tu comprobante en el paso anterior, aceleramos el envío D'una.
                  </p>
                </div>
              </div>
              
              <div className="w-full h-px bg-slate-200"></div>

              <div className="flex gap-3 items-start">
                <span className="text-lg leading-none">💬</span>
                <div>
                  <h4 className="text-xs font-black text-slate-800 leading-none mb-1">Pago Directo (WhatsApp)</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-snug">
                    Si no subiste nada, relájate. Espera a que <strong className="text-[#fe6712]">{merchantName}</strong> te escriba para que les pagues con total confianza.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FOOTER DINÁMICO */}
        {/* ========================================================================= */}
        <div className="px-5 py-2.5 border-t border-slate-100 bg-white shrink-0 space-y-1.5">
          {pasoVista === 'formulario' ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Total Definitivo</span>
                <div className="text-right">
                  {currentBank.type === 'pago_movil' ? (
                    <>
                      <span className="text-base font-black text-[#fe6712] leading-none block">
                        Bs. {totalBolivares.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold block">
                        (${totalFinalUSD.toFixed(2)} USD · Tasa BCV: {tasaBcv})
                      </span>
                      <span className="text-[8px] text-slate-700 font-black block">
                        Incluye flete y propina
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg font-black text-slate-900 leading-none">
                        ${totalFinalUSD.toFixed(2)} USD
                      </span>
                      <span className="text-[8px] text-slate-700 font-black block">
                        Incluye flete y propina
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onBackToCart}
                  className="flex items-center justify-center rounded-2xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  aria-label="Atrás"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleProceedToInstructions}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#fe6712] hover:bg-[#e0580d] py-2.5 text-xs font-black text-white shadow-md shadow-orange-500/25 transition active:scale-[0.98] cursor-pointer"
                >
                  <span>CONTINUAR AL PAGO</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : pasoVista === 'instrucciones' ? (
            <div className="space-y-1.5">
              {/* BOTÓN MAGISTRAL LIBERADO: Avanza liso sin importar los campos */}
              <button
                type="button"
                onClick={handleCompleteFinalOrder}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#fe6712] hover:bg-[#e0580d] py-2.5 text-xs font-black text-white shadow-md shadow-orange-500/25 transition active:scale-[0.98] cursor-pointer"
              >
                <span>Completar pedido</span>
                <Check className="h-4 w-4 stroke-[3]" />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setPasoVista('formulario')}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline transition cursor-pointer"
                >
                  Volver para corregir datos
                </button>
              </div>
            </div>
          ) : (
            // FOOTER PARA LA PANTALLA DE ÉXITO
            <button
              type="button"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-[#fe6712] hover:bg-[#e0580d] py-3 text-xs font-black text-white shadow-md shadow-orange-500/25 transition active:scale-[0.98] cursor-pointer"
            >
              <span>ENTENDIDO, VOLVER A LA TIENDA</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}