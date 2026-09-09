'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MapPin, Search, ChevronRight, ChevronLeft,
  X, ShoppingCart, Star, ArrowLeft, Sparkles, SlidersHorizontal, Plus, Truck, Bike, Store, Zap, Flame, ShieldCheck
} from 'lucide-react';
import { getBCVRate } from '@/lib/bcvRate';
import { detectStoreNiche } from '@/lib/nicheConfig';
import CartModal, { CartItem } from '@/components/CartModal';
import CheckoutModal from '@/components/CheckoutModal';
import MasterProductModal, { VariantSelectionPayload } from '@/components/MasterProductModal';
import OrderTrackingModal from '@/components/OrderTrackingModal';

const STORES_DATA: Record<string, any> = {
  "papa-helado": {
    info: {
      id: "papa-helado",
      name: "Papá Helado",
      category: "Heladería & Combos Familiares",
      rating: 5.0,
      deliveryTime: "15 - 25 min",
      deliveryFee: "$1.50",
      baseRatePerKm: 0.75,
      isNationalShippingEnabled: false,
      image: "/images/logo-papa.png",
      badge: "Aliado Oficial",
      bannerImg: "/images/banner-papa.png",
      isOpen: true
    },
    categorias: [
      { id: "todos", name: "🔥 Todos" },
      { id: "linea-ml", name: "🍦 Línea ML (Conos)" },
      { id: "tinas-47", name: "🍨 Baldes 4.7L" },
      { id: "chicha", name: "🥤 Papá Chicha" }
    ],
    promociones: [
      { id: 1, name: "SÚPER COMBO", price: 8.55, originalPrice: 12.00, badge: "🔥 -35% HOY", img: "/images/promo-1.png" },
      { id: 2, name: "LÍNEA ECONÓMICA", price: 19.25, originalPrice: 24.00, badge: "⭐ TOP VENTAS", img: "/images/promo-2.png" }
    ],
    catalogo: [
      {
        code: "H001-004", category: "LÍNEA ML", name: "Papa Cono 12 Und Mínimo",
        desc: "12 Unidades. Sabores con selección libre por unidad.",
        price: 9.30, originalPrice: 12.00, cat: "linea-ml", status: 'ACTIVE',
        stock: 2,
        badge: "🔥 85 pedidos hoy",
        rating: "5.0",
        image: "https://carjos-marketplace.cloud/uploads/uploads/files/images/cm614aslh00282omrgpvy2e4k.png",
        exclusions: ["Sin Barquilla Extra", "Menos Sirope"],
        groups: [
          {
            title: "Selecciona el Formato",
            subtitle: "Elige tu presentación preferida",
            type: "SIZE_RADIO",
            options: [
              { code: "OPT-12", name: "Pack 12 Unidades", price: 9.30 },
              { code: "OPT-24", name: "Pack Doble 24 Unidades", price: 17.50 }
            ]
          }
        ]
      },
      {
        code: "H007-001", category: "PAPA CHICHA", name: "Chicha para llevar 32 Oz Especial",
        desc: "Rica chicha tradicional con canela y leche condensada.",
        price: 8.00, originalPrice: 10.00, cat: "chicha", status: 'ACTIVE',
        stock: 15,
        badge: "🤤 MÁS VENDIDO",
        rating: "4.9",
        image: "https://carjos-marketplace.cloud/uploads/uploads/files/images/cmioua6xw000v1uo5f1x4e10g.png",
        exclusions: ["Sin Canela", "Sin Leche Condensada"],
        groups: [
          {
            title: "Presentación de Vaso",
            subtitle: "Elige el tamaño de tu chicha",
            type: "SIZE_RADIO",
            options: [
              { code: "CH-32", name: "Vaso 32 Oz", price: 8.00 },
              { code: "CH-GAL", name: "Galón Familiar", price: 24.50 }
            ]
          }
        ]
      }
    ]
  },
  "proseco-bodegon": {
    info: {
      id: "proseco-bodegon",
      name: "Proseco Bodegón",
      category: "Licores Finos & Gourmet",
      rating: 4.9,
      deliveryTime: "20 - 30 min",
      deliveryFee: "$2.00",
      baseRatePerKm: 0.85,
      isNationalShippingEnabled: true,
      preferredNationalCouriers: ["MRW", "ZOOM"],
      image: "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=500&auto=format&fit=crop&q=60",
      badge: "Boutique VIP",
      bannerImg: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&auto=format&fit=crop&q=80",
      isOpen: true
    },
    categorias: [
      { id: "todos", name: "✨ Todo" },
      { id: "licores", name: "🥃 Whisky & Rones" }
    ],
    promociones: [],
    catalogo: [
      {
        code: "PR001-001", category: "LICORES", name: "OLD PARR 12 AÑOS 0,75L",
        desc: "Whisky escocés blend 12 años 0.75L con estuche.",
        price: 38.00, originalPrice: 45.00, cat: "licores", status: 'ACTIVE',
        stock: 3,
        badge: "👑 FAVORITO VIP",
        rating: "5.0",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHVaPZgzgPwhU9uyq2X2Wg5VOE4o9S3DCBFQ&s",
        exclusions: ["Sin Estuche de Cartón"],
        groups: [
          {
            title: "Presentación de Botella",
            subtitle: "Selecciona el formato de tu botella",
            type: "SIZE_RADIO",
            options: [
              { code: "OP-75", name: "Botella 750 ml", price: 38.00 },
              { code: "OP-1L", name: "Botella 1 Litro", price: 48.00 }
            ]
          }
        ]
      }
    ]
  }
};

export default function DynamicStoreView() {
  const params = useParams();
  const rawSlug = params?.slug as string;
  const storeSlug = rawSlug || "papa-helado";
  const storeData = STORES_DATA[storeSlug] || STORES_DATA["papa-helado"];
  const merchant = storeData.info;

  const [mounted, setMounted] = useState(false);
  const [bcvRate, setBcvRate] = useState(48.50);
  const [selectedCat, setSelectedCat] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");

  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [activeProductForMaster, setActiveProductForMaster] = useState<any | null>(null);

  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState("788");

  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup' | 'national'>('delivery');
  const [rewardMode, setRewardMode] = useState<'DYNAMIC' | 'FIXED'>('DYNAMIC');

  const [orderSummaryData, setOrderSummaryData] = useState({
    metodoEntrega: 'delivery' as const,
    direccion: 'Cabimas Centro (Sector Av. Intercomunal)',
    costoEnvio: 1.50,
    subtotalUSD: 0,
    totalUSD: 0,
    esEnvioNacional: false,
    agenciaNacional: 'MRW' as any,
    costoEnvioNacional: 4.50
  });

  useEffect(() => {
    setMounted(true);
    getBCVRate().then(rate => setBcvRate(rate));
  }, []);

  const storeNiche = detectStoreNiche(merchant);

  const generateConfigHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  };

  const addToCartDirect = (product: any, customPrice?: number, customName?: string, customKey?: string, breakdown?: string[]) => {
    const priceToUse = customPrice !== undefined ? customPrice : product.price;
    const nameToUse = customName || product.name;
    const uniqueKey = customKey || product.code;

    setCart(prev => {
      const existing = prev[uniqueKey];
      if (existing) {
        return { ...prev, [uniqueKey]: { ...existing, qty: existing.qty + 1 } };
      }
      return {
        ...prev,
        [uniqueKey]: {
          code: uniqueKey,
          category: product.category || product.cat,
          name: nameToUse,
          desc: product.desc,
          price: priceToUse,
          image: product.image,
          status: product.status || 'ACTIVE',
          qty: 1,
          breakdown: breakdown || []
        }
      };
    });
  };

  const handleOpenMasterModal = (product: any) => {
    setActiveProductForMaster(product);
    setIsMasterModalOpen(true);
  };

  const handleAddToCartFromMaster = (payload: VariantSelectionPayload) => {
    if (!activeProductForMaster) return;
    const configSignature = (payload?.breakdown && payload.breakdown.length > 0)
      ? payload.breakdown.join('__')
      : (payload?.summaryText || '');
    const configHash = configSignature ? generateConfigHash(configSignature) : 'std';
    const compositeKey = `${payload.productCode}-${configHash}`;
    addToCartDirect(
      activeProductForMaster,
      payload.totalPrice / payload.qty,
      payload.productName,
      compositeKey,
      payload.breakdown
    );
  };

  const updateQty = (code: string, delta: number) => {
    setCart(prev => {
      const existing = prev[code];
      if (!existing) return prev;
      const newQty = existing.qty + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[code];
        return copy;
      }
      return { ...prev, [code]: { ...existing, qty: newQty } };
    });
  };

  const cartItems = Object.values(cart);
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const subtotalUSD = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const metaEnvioGratis = 15.00;
  const faltaParaEnvioGratis = Math.max(0, metaEnvioGratis - subtotalUSD);
  const progresoEnvio = Math.min(100, (subtotalUSD / metaEnvioGratis) * 100);
  const esEnvioGratis = subtotalUSD > 0 && faltaParaEnvioGratis === 0;

  const deliveryCost = subtotalUSD > 0 && deliveryMode === 'delivery' ? (esEnvioGratis ? 0 : 1.50) : 0;
  const totalUSD = subtotalUSD + deliveryCost;

  const filteredProducts = storeData.catalogo.filter((p: any) => {
    const matchesCat = selectedCat === "todos" || p.cat === selectedCat;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-28">

      {/* 1. TOPBAR GLOBAL */}
      <div className="bg-[#0f172a] text-white text-[11px] py-2 px-4 md:px-8 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-slate-300 hover:text-[#fe6712] font-semibold bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Directorio</span>
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-[#fe6712]" />
              <span>Entregar en: <strong className="text-white underline decoration-[#fe6712]">Cabimas, Zulia</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-2 font-bold text-amber-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            <span>🪙 Tasa BCV: <strong className="text-white">Bs. {bcvRate.toFixed(2)}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. BANNER DE IDENTIDAD Y BOTÓN D'UNA */}
      <div className="relative">
        <div className="w-full max-w-[1440px] mx-auto px-2 sm:px-4 md:px-6 pt-2">
          <div className="relative w-full h-36 sm:h-44 md:h-52 rounded-2xl md:rounded-3xl overflow-hidden shadow-xs border border-slate-200/80 bg-[#2fa8f9]">

            <img
              src={merchant.bannerImg}
              alt={merchant.name}
              className="w-full h-full object-contain sm:object-cover object-center"
              onError={(e: any) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&auto=format&fit=crop&q=80";
              }}
            />

            <Link
              href="/"
              title="Volver a D'una Marketplace"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 bg-white/90 hover:bg-white text-[#fe6712] p-2.5 sm:px-3.5 sm:py-2 rounded-2xl shadow-lg border border-white/40 flex items-center gap-2 hover:scale-105 transition backdrop-blur-md group"
            >
              <img
                src="/images/isotipo-duna.png"
                alt="D'una"
                className="w-6 h-6 object-contain"
                onError={(e: any) => { e.target.style.display = 'none'; }}
              />
              <span className="hidden sm:inline text-xs font-black text-slate-800">D'una</span>
            </Link>

            <div className="absolute bottom-10 left-3 sm:bottom-11 sm:left-6 z-20 flex items-center gap-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white p-1.5 shadow-lg border border-white/60 flex items-center justify-center shrink-0">
                <img
                  src={merchant.image}
                  alt={merchant.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-white drop-shadow-md">
                <h1 className="text-base sm:text-2xl font-black leading-tight flex items-center gap-2">
                  {merchant.name}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="inline-flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-black border border-white/20">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{merchant.rating}</span>
                  </div>
                  <span className="text-[11px] text-slate-100 hidden sm:inline">• {merchant.category}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 -mt-5 sm:-mt-6 relative z-20">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-md px-4 py-2 flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="¿Qué se te antoja hoy en esta tienda?"
              className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button className="p-1.5 rounded-xl text-slate-400 hover:text-[#fe6712] hover:bg-orange-50 transition shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-[#fe6712]" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. PROMOCIONES IMPERDIBLES */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-7 space-y-6">
        {storeData.promociones?.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#fe6712]" /> Promociones Imperdibles
            </h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
              {storeData.promociones.map((promo: any) => {
                const ahorro = promo.originalPrice ? (promo.originalPrice - promo.price).toFixed(2) : null;
                return (
                  <div
                    key={promo.id}
                    onClick={() => addToCartDirect({ code: `PROMO-${promo.id}`, name: promo.name, desc: "Promoción oficial activa.", price: promo.price, image: promo.img, status: 'ACTIVE' })}
                    className="w-[140px] sm:w-[160px] bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0 border border-slate-200/80 group flex flex-col justify-between p-2.5"
                  >
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-2">
                      <span className="absolute top-1 left-1 z-10 bg-slate-900/90 text-amber-300 text-[8px] font-black px-1.5 py-0.5 rounded">
                        {promo.badge}
                      </span>
                      <img src={promo.img} alt={promo.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900 line-clamp-1">{promo.name}</h4>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-[#fe6712]">${promo.price.toFixed(2)}</span>
                        {promo.originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through font-bold">${promo.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                      {ahorro && (
                        <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded block w-fit">
                          Ahorras ${ahorro}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* 4. CATEGORÍAS STICKY */}
      <div className="sticky top-[49px] z-40 bg-white/95 backdrop-blur-md border-y border-slate-200 shadow-xs py-2.5 transition-all mt-4">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {storeData.categorias.map((cat: any) => {
            const active = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#fe6712] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. GRID DE PRODUCTOS CON CONEXIÓN AL MASTER PRODUCT MODAL */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6 space-y-8">
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide">
              {storeData.categorias.find((c: any) => c.id === selectedCat)?.name || "CATÁLOGO"}
            </h2>
            <span className="text-xs font-bold text-slate-400">
              {filteredProducts.length} productos disponibles
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p: any) => {
              const esEscarcéz = p.stock !== undefined && p.stock <= 3;

              return (
                <div
                  key={p.code}
                  onClick={() => handleOpenMasterModal(p)}
                  className="bg-white rounded-2xl p-3 md:p-3.5 border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group relative"
                >
                  <div className="w-full aspect-square bg-slate-50 rounded-xl flex items-center justify-center p-3 mb-3 overflow-hidden border border-slate-100 relative">
                    <img src={p.image} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />

                    {p.badge && (
                      <span className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-xs text-amber-300 text-[8.5px] font-black px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        <span>{p.badge}</span>
                      </span>
                    )}

                    {esEscarcéz && (
                      <span className="absolute bottom-2 left-2 right-2 bg-red-600 text-white text-[8.5px] font-black px-2 py-0.5 rounded text-center shadow animate-pulse">
                        🔥 ¡Solo quedan {p.stock} disponibles!
                      </span>
                    )}

                    {p.rating && !esEscarcéz && (
                      <span className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs text-slate-800 text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>{p.rating}</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">{p.name}</h4>
                    <p className="text-[10.5px] text-slate-400 line-clamp-2 leading-tight">{p.desc}</p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-end justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm sm:text-base font-black text-slate-900">${p.price.toFixed(2)}</span>
                        {p.originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through font-bold">${p.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                      <span className="text-[9.5px] text-slate-400 font-bold block leading-none mt-0.5">
                        ~ Bs. {(p.price * bcvRate).toFixed(2)}
                      </span>
                    </div>

                    <button className="bg-gradient-to-r from-[#fe6712] to-amber-500 hover:from-[#e05305] text-white text-xs font-black px-3 py-2 rounded-xl transition shadow-sm shadow-orange-500/30 flex items-center gap-1 cursor-pointer">
                      <span>Configurar</span>
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* 6. BARRA FLOTANTE DE CARRITO */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto z-50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-[#0f172a] text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#fe6712] flex items-center justify-center font-black text-white shadow"><ShoppingCart className="h-5 w-5" /></div>
              <div>
                <p className="text-[10px] text-orange-200 font-bold uppercase tracking-wider">{totalItems} producto{totalItems > 1 ? 's' : ''} en bolsa</p>
                <p className="text-base font-black text-white">${totalUSD.toFixed(2)}</p>
              </div>
            </div>
            <button onClick={() => setIsCartOpen(true)} className="bg-[#fe6712] hover:bg-[#e0580d] text-white px-6 py-3 rounded-xl text-xs font-black transition shadow-md active:scale-95 cursor-pointer flex items-center gap-2">
              <span>Tu Pedido y Entrega</span><ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL MAESTRO DE PRODUCTO CON UPSELLING Y EXCLUSIONES ("FIRMA D'UNA") */}
      <MasterProductModal
        isOpen={isMasterModalOpen}
        onClose={() => setIsMasterModalOpen(false)}
        product={activeProductForMaster}
        nicheEngine={storeNiche}
        bcvRate={bcvRate}
        onAddToCart={handleAddToCartFromMaster}
      />

      {/* MODAL CARRITO MODULAR */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        totalItems={totalItems}
        subtotalUSD={subtotalUSD}
        deliveryMode={deliveryMode}
        setDeliveryMode={setDeliveryMode}
        rewardMode={rewardMode}
        setRewardMode={setRewardMode}
        faltaParaEnvioGratis={faltaParaEnvioGratis}
        progresoEnvio={progresoEnvio}
        esEnvioGratis={esEnvioGratis}
        deliveryCost={deliveryCost}
        discountDelivery={2.23}
        totalUSD={totalUSD}
        onUpdateQty={updateQty}
        onOpenCheckout={(summary) => {
          setIsCartOpen(false);
          setOrderSummaryData({
            ...summary,
            items: summary.items || [],
            merchantName: merchant.name,
            esEnvioNacional: merchant.isNationalShippingEnabled || false,
            agenciaNacional: merchant.preferredNationalCouriers?.[0] || 'MRW',
            costoEnvioNacional: 4.50
          });
          setIsCheckoutOpen(true);
        }}
        isNationalShippingEnabled={merchant.isNationalShippingEnabled}
      />

      {/* MODAL PASARELA DE PAGO */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        orderSummary={orderSummaryData}
        tasaBcv={bcvRate}
        merchantName={merchant.name}
        onFinalizeOrder={(orderData) => {
          const idGen = orderData?.id || `${Math.floor(100000 + Math.random() * 900000)}`;
          setActiveOrderId(idGen);
          if (typeof window !== 'undefined') {
            localStorage.setItem('last_active_order_id', idGen);
            localStorage.setItem('last_active_order', JSON.stringify(orderData));
          }
          setCart({});
        }}
        onBackToCart={() => {
          setIsCheckoutOpen(false);
          setIsCartOpen(true);
        }}
        onViewTracking={() => {
          setIsCheckoutOpen(false);
          setIsTrackingOpen(true);
        }}
      />

      {/* MODAL DE TRACKING */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        orderId={activeOrderId}
        orderSummary={orderSummaryData}
      />

    </div>
  );
}