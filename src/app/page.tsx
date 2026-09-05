'use client';

import React, { useState } from 'react';
import MerchantStoreView from '@/components/MerchantStoreView';
import CheckoutModal from '@/components/CheckoutModal';
import OrderTrackingModal from '@/components/OrderTrackingModal';
import { Clock } from 'lucide-react';

// Base de datos completa de Comercios Aliados y sus Catálogos Reales en Cabimas
const merchantsData: Record<string, {
  info: {
    id: string;
    name: string;
    category: string;
    rating: number;
    deliveryTime: string;
    deliveryFee: string;
    image: string;
    badge: string;
  };
  products: Array<{
    code: string;
    category: string;
    name: string;
    desc: string;
    price: number;
    image: string;
    status: 'ACTIVE' | 'INACTIVE';
  }>;
}> = {
  'papa-helado': {
    info: {
      id: 'papa-helado',
      name: 'Papá Helado',
      category: 'Gastronomía & Postres',
      rating: 4.9,
      deliveryTime: '15 - 25 min',
      deliveryFee: '$1.50',
      image: 'https://images.unsplash.com/photo-1560008511-11c63416e52d?w=500&auto=format&fit=crop&q=60',
      badge: 'Aliado Destacado'
    },
    products: [
      { 
        code: 'H001-004', 
        category: 'LÍNEA ML', 
        name: 'Papa Cono 12 Und Mínimo', 
        desc: 'Arma tu combo seleccionando tus 12 sabores favoritos ($0.775 c/u).', 
        price: 9.30, 
        image: 'https://carjos-marketplace.cloud/uploads/uploads/files/images/cmh9iok9w002j1wl89hxlchgk.png', 
        status: 'ACTIVE' 
      },
      { 
        code: 'H001-001', 
        category: 'LÍNEA ML', 
        name: 'Paleta Cítrica Rellena', 
        desc: 'Paleta artesanal con centro cremoso', 
        price: 2.5, 
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=60', 
        status: 'ACTIVE' 
      },
      { 
        code: 'H001-002', 
        category: 'HELADOS', 
        name: 'Tinita de Helado Familiar', 
        desc: 'Helado cremoso de litro con 2 sabores a elegir', 
        price: 8.5, 
        image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=500&auto=format&fit=crop&q=60', 
        status: 'ACTIVE' 
      },
      { 
        code: 'H004-003', 
        category: 'PRODUCTOS ADICIONALES', 
        name: 'Super Conos', 
        desc: 'Paquete de conos crujientes para servir helado', 
        price: 3.25, 
        image: 'https://images.unsplash.com/photo-1559703248-dcaaec9fab78?w=500&auto=format&fit=crop&q=60', 
        status: 'ACTIVE' 
      },
      { 
        code: 'H004-002', 
        category: 'PRODUCTOS ADICIONALES', 
        name: 'Bolso Térmico', 
        desc: 'Bolso aislante para transporte de helados y refrigerados', 
        price: 13.65, 
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60', 
        status: 'ACTIVE' 
      },
      { 
        code: 'H006-001', 
        category: 'PROMOCIÓN', 
        name: 'Ponche Crema Combo 6 Unidades', 
        desc: 'Chicha y un Toque De Licor', 
        price: 29.7, 
        image: 'https://carjos-marketplace.cloud/uploads/uploads/files/images/cmigeb2yg00041uob81872xba.png', 
        status: 'INACTIVE' 
      }
    ]
  },
  'farma-duna': {
    info: {
      id: 'farma-duna',
      name: "Farma D'una Megastore",
      category: 'Farmacia & Salud',
      rating: 5.0,
      deliveryTime: '10 - 20 min',
      deliveryFee: '¡Gratis!',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
      badge: 'Regencia 24/7'
    },
    products: [
      { code: 'FD001-001', category: 'Antialergico', name: 'Cetirizina 10 mg Cetral Siegfried Caja x 10 Tabletas', desc: 'Antihistamínico para alivio de síntomas alérgicos.', price: 21.0, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60', status: 'ACTIVE' },
      { code: 'FD001-002', category: 'Antialergico', name: 'Loratadina 10mg Loradex Caja x 10 Tabletas', desc: 'Alivio de alergias respiratorias.', price: 12.0, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60', status: 'ACTIVE' },
      { code: 'FD002-002', category: 'Antihipertensivos', name: 'Losartán Potásico 50 mg DAC Caja x 30 Tabletas', desc: 'Control cardiovascular y presión arterial.', price: 21.0, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60', status: 'ACTIVE' },
      { code: 'FD003-001', category: 'Analgesicos', name: 'Acetaminofen 650mg 10tabletas Genven', desc: 'Alivio rápido del dolor de cabeza y fiebre.', price: 1.0, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60', status: 'ACTIVE' }
    ]
  },
  'grupo-bitmar': {
    info: {
      id: 'grupo-bitmar',
      name: 'Grupo Bitmar',
      category: 'Tecnología & Gaming',
      rating: 4.8,
      deliveryTime: '20 - 30 min',
      deliveryFee: '$2.00',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60',
      badge: 'Oficial Autorizado'
    },
    products: [
      { code: 'BM001-001', category: 'TELEFONIA', name: 'HONOR X7D', desc: 'Batería de 6,500 mAh con carga de 35W, pantalla a 120 Hz, 256 GB.', price: 193.0, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUQcGSdgXj0eRybQEJ_Wd6hEKw5HYcwp9cKIZR2hmA5Q&s=10', status: 'ACTIVE' },
      { code: 'BM001-002', category: 'TELEFONIA', name: 'HONOR 600e 5G', desc: 'Pantalla AMOLED 120Hz, 512 GB, cámara 108 MP, batería 6,520 mAh.', price: 377.0, image: 'https://soytechno.com/wp-content/uploads/2026/07/Honor-600e-8GB256GB-LNA-NX3-Velvet-Grey-Gris-Terciopelo-1.jpg', status: 'ACTIVE' },
      { code: 'BM001-016', category: 'MONITORES', name: 'MONITOR LG 20MK40L 165Hz', desc: 'Tiempo de respuesta 1 ms, panel IPS Full HD.', price: 100.0, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRsWq31vUIsGg4Ldl5AdEZQHZhXKSCbeO34DeG4aCygxRGA5asmJvPNEk&s=10', status: 'ACTIVE' }
    ]
  }
};

const merchantsList = Object.values(merchantsData).map(m => m.info);

export default function MultitiendaHub() {
  const [activeMerchantId, setActiveMerchantId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string>('788');
  const [hasCompletedOrder, setHasCompletedOrder] = useState<boolean>(false);

  const [orderSummaryData, setOrderSummaryData] = useState({
    metodoEntrega: 'delivery' as const,
    direccion: 'Cabimas, Zulia',
    costoEnvio: 2.00,
    subtotalUSD: 10.00,
    totalUSD: 12.00,
  });

  // Rutina de cierre al finalizar compra: limpia datos y regresa al Marketplace
  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    if (hasCompletedOrder) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart_data');
        localStorage.removeItem('current_order');
      }
      setActiveMerchantId(null);
      setHasCompletedOrder(false);
    }
  };

  // Rutina para ir a seguimiento desde el modal de compra
  const handleViewTrackingFromCheckout = () => {
    setIsCheckoutOpen(false);
    if (hasCompletedOrder) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart_data');
        localStorage.removeItem('current_order');
      }
      setActiveMerchantId(null);
      setHasCompletedOrder(false);
    }
    setIsTrackingOpen(true);
  };

  if (activeMerchantId && merchantsData[activeMerchantId]) {
    const merchantInfo = merchantsData[activeMerchantId].info;
    const merchantProducts = merchantsData[activeMerchantId].products;

    return (
      <>
        <MerchantStoreView 
          key={activeMerchantId}
          merchant={merchantInfo}
          products={merchantProducts}
          onBack={() => setActiveMerchantId(null)}
          onOpenCheckout={(summary) => {
            setOrderSummaryData(summary);
            setIsCheckoutOpen(true);
          }}
        />

        <CheckoutModal 
          isOpen={isCheckoutOpen}
          onClose={handleCloseCheckout}
          orderSummary={orderSummaryData}
          tasaBcv={48.50}
          merchantName={merchantInfo.name}
          onFinalizeOrder={(orderData) => { 
            console.log("Orden procesada con éxito:", orderData);
            setHasCompletedOrder(true);
            const idGenerado = orderData?.id || '788';
            setActiveOrderId(idGenerado);
            if (typeof window !== 'undefined') {
              localStorage.setItem('last_active_order_id', idGenerado);
            }
          }}
          onBackToCart={() => setIsCheckoutOpen(false)}
          onViewTracking={handleViewTrackingFromCheckout}
        />

        <OrderTrackingModal 
          isOpen={isTrackingOpen}
          onClose={() => setIsTrackingOpen(false)}
          orderId={activeOrderId}
        />
      </>
    );
  }

  const filteredMerchants = merchantsList.filter(m => {
    const matchCat = selectedCategory === 'ALL' || m.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-[#fe6712] selection:text-white">
      
      {/* Topbar Corporativo D'una & BCV */}
      <div className="bg-[#090d16] text-white text-xs py-2 px-4 md:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2 font-bold">
            <span>📍 Entregar en: <strong className="underline decoration-[#fe6712]">Cabimas, Estado Zulia</strong></span>
          </div>
          <div className="flex items-center gap-3">
            {/* Botón para retomar seguimiento de pedidos pendientes */}
            <button 
              type="button"
              onClick={() => setIsTrackingOpen(true)}
              className="flex items-center gap-1.5 bg-[#fe6712]/20 hover:bg-[#fe6712]/30 border border-[#fe6712]/40 px-3 py-0.5 rounded-full transition cursor-pointer text-white"
            >
              <Clock className="w-3.5 h-3.5 text-[#fe6712]" />
              <span>Seguimiento de Pedido</span>
            </button>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-0.5 rounded-full text-slate-300">
              <span>💰 D'una Wallet: <strong className="text-white">$124.50</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-0.5 rounded-full border border-white/10 text-slate-300">
              <span>🏦 Tasa BCV: <strong className="text-white">Bs. 48.50</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Header / Buscador Principal */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <div 
              onClick={() => setActiveMerchantId(null)}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#fe6712] to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-md">
                D'
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight leading-none text-slate-900">D'UNA <span className="text-[#fe6712]">MARKETPLACE</span></h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Ecosistema Multitienda • Cabimas</p>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-xl w-full">
            <div className="relative flex items-center bg-slate-100 rounded-2xl border border-slate-200 focus-within:border-[#fe6712] focus-within:bg-white transition">
              <span className="absolute left-4 text-slate-400">🔍</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca tiendas, helados, medicinas, ropa, repuestos..." 
                className="w-full bg-transparent text-xs font-semibold text-slate-800 pl-11 pr-4 py-3 focus:outline-none placeholder-slate-400"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button 
              type="button"
              onClick={() => setIsTrackingOpen(true)}
              className="bg-orange-50 hover:bg-orange-100 text-[#fe6712] border border-orange-200 px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer"
            >
              <Clock className="w-4 h-4 text-[#fe6712]" />
              <span>Mis Órdenes</span>
            </button>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sistema Multitienda Activo
            </span>
          </div>

        </div>

        {/* Categorías / Nichos Rápidos */}
        <div className="border-t border-slate-100 px-4 md:px-8 py-2.5 overflow-x-auto no-scrollbar bg-slate-50/50">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-bold whitespace-nowrap">
            {[
              { id: 'ALL', label: '✨ Todos los Comercios' },
              { id: 'Gastronomía', label: '🍕 Gastronomía & Postres' },
              { id: 'Farmacia', label: '💊 Farmacia & Salud' },
              { id: 'Tecnología', label: '⚡ Tecnología & Gaming' },
            ].map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-2xl transition cursor-pointer shadow-2xs ${
                    isActive 
                      ? 'bg-[#0f172a] text-white font-black' 
                      : 'bg-white text-slate-700 hover:bg-orange-50 hover:text-[#fe6712] border border-slate-200'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content: Hub de Tiendas */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex-1 space-y-8">
        
        {/* Banner Hero Multitienda */}
        <div className="rounded-3xl bg-gradient-to-r from-[#0f172a] via-slate-800 to-[#fe6712] text-white p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3 max-w-xl text-center md:text-left">
            <span className="bg-white/25 backdrop-blur-md px-3.5 py-1 rounded-full text-orange-100 text-[10px] font-black uppercase tracking-wider border border-white/10 inline-block">
              Centro Comercial Digital de Cabimas
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-white leading-tight">
              Todo lo que necesitas, <span className="text-amber-300">en un solo lugar</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed">
              Selecciona una tienda abajo para explorar su catálogo real sincronizado y armar tu pedido con entrega express y PIN de seguridad.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-4 bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20 shadow-2xl">
            <div className="text-center">
              <p className="text-3xl font-black text-amber-300">3</p>
              <p className="text-[10px] uppercase font-bold text-slate-200">Tiendas Activas</p>
            </div>
            <div className="h-10 w-[1px] bg-white/20"></div>
            <div className="text-center">
              <p className="text-3xl font-black text-emerald-400">15 min</p>
              <p className="text-[10px] uppercase font-bold text-slate-200">Delivery Express</p>
            </div>
          </div>
        </div>

        {/* Grid de Comercios Aliados */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#fe6712]"></span>
              Comercios Aliados Disponibles ({filteredMerchants.length})
            </h3>
            <span className="text-xs font-bold text-slate-400">Cabimas, Zulia</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMerchants.map(merchant => (
              <div 
                key={merchant.id}
                onClick={() => setActiveMerchantId(merchant.id)}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                    <img 
                      src={merchant.image} 
                      alt={merchant.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
                      {merchant.badge}
                    </span>
                    <span className="absolute bottom-3 left-3 text-white text-xs font-bold flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Abierto
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black text-[#fe6712] uppercase tracking-wider block">{merchant.category}</span>
                        <h4 className="text-lg font-black text-slate-900 group-hover:text-[#fe6712] transition-colors">{merchant.name}</h4>
                      </div>
                      <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-xl text-xs font-black border border-amber-200">
                        ⭐ {merchant.rating}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
                      <span>⏱️ {merchant.deliveryTime}</span>
                      <span>•</span>
                      <span>Envío: <strong className="text-slate-800">{merchant.deliveryFee}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-0">
                  <div className="w-full py-2.5 bg-slate-50 group-hover:bg-[#fe6712] group-hover:text-white text-slate-700 text-xs font-black rounded-2xl transition flex items-center justify-center gap-1.5 border border-slate-200 group-hover:border-[#fe6712]">
                    <span>Entrar a la Tienda</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Modal de Seguimiento Global (accesible desde el Hub) */}
      <OrderTrackingModal 
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        orderId={activeOrderId}
      />

    </div>
  );
}