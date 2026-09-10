'use client';

import React, { useState } from 'react';
import { ShoppingBag, ChevronRight, Search, Star, Clock, MapPin, Sparkles } from 'lucide-react';
import CartModal from './CartModal';
import MasterProductModal from './MasterProductModal';
import { getProduct } from '@/services/marketplaceService';

interface MerchantStoreViewProps {
  merchant: any;
  products: any[];
  onBack: () => void;
  onOpenCheckout: (summary: any) => void;
}

export default function MerchantStoreView({
  merchant,
  products,
  onBack,
  onOpenCheckout
}: MerchantStoreViewProps) {
  const [cartItems, setCartItems] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cart_data');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedProductDetail, setSelectedProductDetail] = useState<any>(null);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup' | 'national'>('delivery');
  const [rewardMode, setRewardMode] = useState<'DYNAMIC' | 'FIXED'>('DYNAMIC');

  const updateCartStorage = (newItems: any[]) => {
    setCartItems(newItems);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart_data', JSON.stringify(newItems));
    }
  };

  const handleProductClick = async (product: any) => {
    setLoadingProduct(true);
    try {
      const res = await getProduct(product.id);
      if (res && res.code === 1 && res.data) {
        const raw = res.data;
        const rawVariants = raw.metadata?.variants || raw.variants || raw.groups || raw.metadata?.groups || [];
        
        const normalizedGroups = Array.isArray(rawVariants) ? rawVariants.map((g: any) => {
          const list = g.items || g.options || g.values || g.variants || g.choices || [];
          
          const normalizedList = list.map((item: any) => ({
            ...item,
            name: item.title || item.name || item.label || 'Opción',
            title: item.title || item.name || item.label || 'Opción',
            label: item.title || item.name || item.label || 'Opción',
            id: item.code || item.id || item.value,
            value: item.code || item.value || item.id,
            price: item.price || item.unitPrice || 0
          }));

          const isMultiple = g.selectType === 'MULTIPLE' || g.max > 1;

          return {
            ...g,
            name: g.name || g.title || g.label || 'Opciones',
            title: g.name || g.title || g.label || 'Opciones',
            label: g.name || g.title || g.label || 'Opciones',
            type: 'SIZE_RADIO', 
            selectType: isMultiple ? 'MULTIPLE' : 'SINGLE',
            items: normalizedList,
            options: normalizedList,
            values: normalizedList,
            variants: normalizedList,
            choices: normalizedList
          };
        }) : [];

        const adaptedProduct = {
          ...raw,
          id: raw.id || product.id,
          price: raw.price || raw.metadata?.price?.basePrice || product.price || 1.5,
          variants: normalizedGroups,
          groups: normalizedGroups,
          slotGroups: normalizedGroups,
          metadata: {
            ...raw.metadata,
            variants: normalizedGroups,
            groups: normalizedGroups,
            slotGroups: normalizedGroups
          }
        };
        setSelectedProductDetail(adaptedProduct);
      } else {
        setSelectedProductDetail({
          ...product,
          id: product.id,
          price: product.price || 1.5,
          variants: [],
          groups: [],
          slotGroups: [],
          metadata: { variants: [], groups: [], slotGroups: [] }
        });
      }
      setIsMasterModalOpen(true);
    } catch (err) {
      console.error('Error al cargar detalle del producto:', err);
      setSelectedProductDetail({
        ...product,
        id: product.id,
        price: product.price || 1.5,
        variants: [],
        groups: [],
        slotGroups: [],
        metadata: { variants: [], groups: [], slotGroups: [] }
      });
      setIsMasterModalOpen(true);
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleAddToCartFromModal = (configuredItem: any) => {
    const rawId = configuredItem.productId || configuredItem.id || selectedProductDetail?.id;
    const realId = Number(rawId) || 101;

    const existingIndex = cartItems.findIndex(item => item.id === realId || item.code === configuredItem.productCode);
    let updated;
    if (existingIndex > -1) {
      updated = [...cartItems];
      const currentQty = updated[existingIndex].qty || updated[existingIndex].quantity || 1;
      const addQty = configuredItem.qty || configuredItem.quantity || 1;
      const newQty = currentQty + addQty;
      updated[existingIndex].qty = newQty;
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].totalPrice = newQty * (updated[existingIndex].price || configuredItem.totalPrice / addQty);
    } else {
      const newItem = {
        id: realId,
        code: configuredItem.productCode || selectedProductDetail?.code || 'P001',
        name: configuredItem.productName || selectedProductDetail?.name || 'Producto',
        price: configuredItem.totalPrice / (configuredItem.qty || 1),
        qty: configuredItem.qty || configuredItem.quantity || 1,
        quantity: configuredItem.qty || configuredItem.quantity || 1,
        totalPrice: configuredItem.totalPrice,
        breakdown: configuredItem.breakdown || [],
        image: selectedProductDetail?.image || '',
        category: selectedProductDetail?.category || 'General'
      };
      updated = [...cartItems, newItem];
    }
    updateCartStorage(updated);
    setIsMasterModalOpen(false);
    setIsCartOpen(true);
  };

  const handleUpdateQty = (code: string, delta: number) => {
    const updated = cartItems.map(item => {
      if (item.code === code || String(item.id) === code) {
        const currentQty = item.qty || item.quantity || 1;
        const newQty = currentQty + delta;
        if (newQty <= 0) return null;
        return {
          ...item,
          qty: newQty,
          quantity: newQty,
          totalPrice: newQty * item.price
        };
      }
      return item;
    }).filter(Boolean);
    updateCartStorage(updated);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalItems = cartItems.reduce((acc, item) => acc + (item.qty || item.quantity || 1), 0);
  const subtotalUSD = cartItems.reduce((acc, item) => acc + (item.totalPrice || (item.price * (item.qty || item.quantity || 1))), 0);

  const umbralEnvio = rewardMode === 'FIXED' ? 15 : 20;
  const faltaParaEnvioGratis = Math.max(0, umbralEnvio - subtotalUSD);
  const esEnvioGratis = subtotalUSD >= umbralEnvio;
  const progresoEnvio = Math.min(100, (subtotalUSD / umbralEnvio) * 100);
  const deliveryCost = Number(merchant?.deliveryFee?.replace('$', '') || 1.50);
  const discountDelivery = esEnvioGratis ? deliveryCost : 0;
  const fleteActivo = deliveryMode === 'national' ? 4.50 : (esEnvioGratis ? 0 : deliveryCost);
  const totalUSD = subtotalUSD + fleteActivo;

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <div className="relative h-56 bg-slate-900">
        {merchant.banner ? (
          <img src={merchant.banner} alt={merchant.name} className="w-full h-full object-cover opacity-85" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#fe6712] to-amber-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
        <button 
          onClick={onBack} 
          className="absolute top-4 left-4 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-2xl text-xs font-black backdrop-blur-md transition cursor-pointer shadow-lg border border-white/10"
        >
          ← Volver al inicio
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <img 
            src={merchant.avatar || 'https://images.unsplash.com/photo-1541658016709-82535e94bc69'} 
            alt={merchant.name} 
            className="w-24 h-24 rounded-2xl object-cover shadow-md border-4 border-white shrink-0 bg-slate-100" 
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="bg-orange-100 text-[#fe6712] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl">
                {merchant.category || 'Comercio Verificado'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{merchant.name}</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Cabimas, Zulia State, Venezuela</p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4 text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="flex items-center gap-1 text-amber-600">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {merchant.rating || '5.0'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-emerald-600">
                <Clock className="w-4 h-4" /> {merchant.deliveryTime || '25-35 min'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">Delivery: <strong className="text-slate-900">{merchant.deliveryFee || '$1.50'}</strong></span>
            </div>
          </div>
        </div>

        <div className="mt-6 relative">
          <Search className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar productos, sabores, combos o especialidades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-800 shadow-sm focus:outline-none focus:border-[#fe6712] focus:ring-2 focus:ring-orange-100 transition"
          />
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Menú y Productos ({filteredProducts.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id || product.code}
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 cursor-pointer flex gap-4 items-center group"
              >
                <img
                  src={product.image || 'https://images.unsplash.com/photo-1560008511-11c63416e52d'}
                  alt={product.name}
                  className="w-24 h-24 rounded-2xl object-cover shrink-0 group-hover:scale-105 transition duration-300 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#fe6712] bg-orange-50 px-2 py-0.5 rounded-md inline-block mb-1">
                    {product.category || 'GENERAL'}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 truncate group-hover:text-[#fe6712] transition">{product.name}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{product.description || 'Producto verificado de calidad garantizada.'}</p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-black text-slate-950">${(product.price || 1.5).toFixed(2)}</span>
                    <span className="text-[10px] font-black text-[#fe6712] bg-orange-50 px-3 py-1.5 rounded-xl group-hover:bg-[#fe6712] group-hover:text-white transition shadow-2xs">
                      Personalizar →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {cartItems.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-full max-w-md bg-slate-900 text-white rounded-3xl p-4 shadow-2xl flex items-center justify-between border border-slate-800 backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#fe6712] flex items-center justify-center font-black text-white shadow-md">
                {totalItems}
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Productos en bolsa</p>
                <p className="text-base font-black text-white">${subtotalUSD.toFixed(2)} USD</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-[#fe6712] hover:bg-[#e0580d] text-white px-5 py-3 rounded-2xl font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Ver Pedido y Entrega</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {isMasterModalOpen && selectedProductDetail && (
        <MasterProductModal
          product={selectedProductDetail}
          isOpen={isMasterModalOpen}
          onClose={() => setIsMasterModalOpen(false)}
          onAddToCart={handleAddToCartFromModal}
          nicheEngine="FOOD_SWEET"
          bcvRate={827.74}
        />
      )}

      {isCartOpen && (
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
          discountDelivery={discountDelivery}
          totalUSD={totalUSD}
          onUpdateQty={handleUpdateQty}
          onOpenCheckout={(summary) => {
            setIsCartOpen(false);
            onOpenCheckout(summary);
          }}
          isNationalShippingEnabled={true}
        />
      )}
    </div>
  );
}
