'use client';

import React, { useState } from 'react';
import { ArrowLeft, Search, ShoppingBag, Store, ShieldCheck, Truck, Star } from 'lucide-react';

const TASA_BCV = 48.50;

const pharmacyCatalog = [
  {
    id: 'enalapril-group',
    category: 'Antihipertensivos',
    name: 'Enalapril (Control de Presión Arterial)',
    description: 'Inhibidor de la ECA. Selecciona la concentración y laboratorio de tu preferencia.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    hasVariants: true,
    variants: [
      { code: 'ENAL-20-30-PL', title: '20 mg - Caja x 30 Tab (PlusAndex)', price: 12.00, stock: 12, status: 'ACTIVE' },
      { code: 'ENAL-10-30-PL', title: '10 mg - Caja x 30 Tab (PlusAndex)', price: 12.00, stock: 12, status: 'ACTIVE' },
      { code: 'ENAL-20-30-GV', title: '20 mg - Caja x 30 Comprimidos (Genven)', price: 1.00, stock: 12, status: 'ACTIVE' },
      { code: 'ENAL-05-10-RM', title: '5 mg - Caja x 10 Tab (Remeny)', price: 2.00, stock: 12, status: 'ACTIVE' },
      { code: 'ENAL-10-20-LS', title: '10 mg - Caja x 20 Tab (La Santé)', price: 12.00, stock: 12, status: 'ACTIVE' },
    ]
  },
  {
    id: 'cetirizina-group',
    category: 'Antialérgico',
    name: 'Cetirizina 10 mg (Antihistamínico)',
    description: 'Alivio rápido de síntomas alérgicos.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    hasVariants: true,
    variants: [
      { code: 'CET-01', title: 'Caja x 10 Tab (Cetral Siegfried)', price: 21.00, stock: 10, status: 'ACTIVE' },
      { code: 'CET-03', title: 'Caja x 10 Tab (La Santé)', price: 2.00, stock: 8, status: 'ACTIVE' },
    ]
  },
  {
    id: 'amoxicilina-group',
    category: 'Antibióticos',
    name: 'Amoxicilina + Ácido Clavulánico',
    description: 'Antibiótico de amplio espectro.',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60',
    hasVariants: true,
    variants: [
      { code: 'AMOX-875', title: '875mg/125mg Caja x 16 Comp (Fulgram)', price: 21.00, stock: 12, status: 'ACTIVE' },
      { code: 'AMOX-600', title: '600mg/5ml Suspensión x 60 ml (Fulgram)', price: 1.00, stock: 12, status: 'ACTIVE' },
    ]
  },
  { id: 'FD001-002', category: 'Antialérgico', name: 'Loratadina 10mg Loradex Caja x 10 Tabletas', description: 'Antihistamínico de alta eficacia.', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60', hasVariants: false, price: 12.00, stock: 12, status: 'ACTIVE' },
  { id: 'FD002-002', category: 'Antihipertensivos', name: 'Losartán Potásico 50 mg DAC Caja x 30 Tabletas', description: 'Tratamiento de la hipertensión.', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60', hasVariants: false, price: 21.00, stock: 12, status: 'ACTIVE' },
  { id: 'FD003-001', category: 'Analgesicos', name: 'Acetaminofen 650mg 10tabletas Genven', description: 'Alivio del dolor y la fiebre.', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60', hasVariants: false, price: 1.00, stock: 12, status: 'ACTIVE' }
];

export default function PharmacyStoreView() {
  const [viewMode, setViewMode] = useState<'marketplace' | 'store'>('marketplace');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedVariantCode, setSelectedVariantCode] = useState<string>('');
  const [cart, setCart] = useState<Array<any>>([]);
  const [searchFilter, setSearchFilter] = useState('');

  const formatPrice = (usd: number) => {
    const ves = usd * TASA_BCV;
    return '$' + usd.toFixed(2) + ' (Bs. ' + ves.toFixed(2) + ')';
  };

  const filteredProducts = pharmacyCatalog.filter(p => 
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
    p.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  if (viewMode === 'marketplace') {
    return (
      <div className='min-h-screen bg-slate-50 font-sans'>
        <header className='bg-[#090d16] text-white px-6 py-4 sticky top-0 z-30 flex justify-between items-center shadow-lg'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-2xl bg-[#fe6712] flex items-center justify-center font-black text-lg'>D'</div>
            <div>
              <h1 className='font-black text-base tracking-tight'>D'una Marketplace <span className='text-xs text-[#fe6712] bg-orange-500/10 px-2 py-0.5 rounded-full'>Cabimas</span></h1>
              <p className='text-[10px] text-slate-400'>Delivery ultrarrápido y comercios aliados</p>
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <span className='text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl'>Tasa BCV: Bs. {TASA_BCV}</span>
          </div>
        </header>
        <main className='max-w-5xl mx-auto p-6 space-y-6'>
          <div className='bg-gradient-to-r from-[#090d16] to-slate-800 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6'>
            <div className='space-y-2 text-center md:text-left'>
              <span className='bg-[#fe6712] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider'>Nuevo Módulo</span>
              <h2 className='text-2xl md:text-3xl font-black'>Salud y Medicamentos a un clic</h2>
              <p className='text-xs text-slate-300 max-w-md'>Explora nuestro catálogo certificado con regencia 24/7 y variantes matriciales por laboratorio.</p>
            </div>
            <button onClick={() => setViewMode('store')} className='bg-[#fe6712] hover:bg-orange-600 text-white font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg transition cursor-pointer flex items-center gap-2'>
              <Store className='w-4 h-4' />
              <span>Entrar a Farma D'una ➔</span>
            </button>
          </div>
          <h3 className='font-black text-slate-800 text-sm uppercase tracking-wider'>Comercios Aliados Destacados</h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div onClick={() => setViewMode('store')} className='bg-white rounded-3xl p-4 border border-slate-200/80 hover:border-[#fe6712] transition cursor-pointer shadow-sm group'>
              <div className='h-36 rounded-2xl bg-slate-100 overflow-hidden relative mb-3'>
                <img src='https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60' alt='Farma' className='w-full h-full object-cover group-hover:scale-105 transition' />
                <span className='absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow'>Abierto 24/7</span>
              </div>
              <h4 className='font-black text-slate-900 text-sm'>💊 Farma D'una Megastore</h4>
              <p className='text-[11px] text-slate-500 mt-0.5'>Medicamentos, fórmulas magistrales y cuidado personal.</p>
              <div className='flex items-center justify-between mt-3 pt-3 border-t border-slate-100'>
                <span className='text-[11px] font-black text-emerald-600 flex items-center gap-1'><Truck className='w-3.5 h-3.5' /> 15 min</span>
                <span className='text-xs font-black text-[#fe6712] group-hover:underline'>Visitar Tienda ➔</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-100 flex flex-col font-sans'>
      <header className='bg-[#090d16] text-white px-4 py-3 sticky top-0 z-30 shadow-md flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <button onClick={() => setViewMode('marketplace')} className='h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition'>
            <ArrowLeft className='w-5 h-5 text-white' />
          </button>
          <div>
            <h1 className='text-sm md:text-base font-black'>💊 Farma D'una Megastore</h1>
            <p className='text-[10px] text-emerald-400 font-bold'>Regencia Farmacéutica 24/7 • Vista Cliente Final</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-2xl text-xs font-black text-emerald-300'>
          <ShoppingBag className='w-4 h-4 text-emerald-400' />
          <span>{cart.length} Ítems</span>
        </div>
      </header>
      <div className='bg-white border-b border-slate-200 px-4 py-3 sticky top-14 z-20'>
        <div className='max-w-4xl mx-auto relative flex items-center'>
          <Search className='w-4 h-4 absolute left-3.5 text-slate-400' />
          <input 
            type='text' 
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder='Busca principios activos en la farmacia (ej. Enalapril, Cetirizina)...'
            className='w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#fe6712]'
          />
        </div>
      </div>
      <main className='max-w-4xl mx-auto w-full p-4 flex-1 space-y-3'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          {filteredProducts.map(product => (
            <div key={product.id} onClick={() => setSelectedProduct(product)} className='bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center gap-3.5 shadow-2xs hover:shadow-md transition cursor-pointer group'>
              <img src={product.image} alt={product.name} className='w-16 h-16 rounded-xl object-cover bg-slate-100' />
              <div className='flex-1 min-w-0'>
                <span className='text-[10px] font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md'>{product.category}</span>
                <h3 className='text-xs font-black text-slate-900 mt-1 truncate group-hover:text-[#fe6712] transition'>{product.name}</h3>
                <span className='text-xs font-black text-emerald-700 mt-2 block'>
                  {product.hasVariants ? 'Varias Presentaciones ➔' : formatPrice(product.price || 0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
      {selectedProduct && (
        <div className='fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4'>
          <div className='bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative'>
            <div className='flex justify-between items-center border-b pb-3'>
              <div>
                <h3 className='font-black text-slate-900 text-sm'>{selectedProduct.name}</h3>
                <p className='text-[11px] text-slate-500'>{selectedProduct.category}</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className='h-8 w-8 rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200'>✕</button>
            </div>
            <p className='text-xs text-slate-600'>{selectedProduct.description}</p>
            {selectedProduct.hasVariants && selectedProduct.variants ? (
              <div className='space-y-2 max-h-60 overflow-y-auto pr-1'>
                <label className='text-[11px] font-black text-slate-700 uppercase tracking-wider block'>Selecciona la Presentación y Laboratorio:</label>
                {selectedProduct.variants.map((v: any) => (
                  <div key={v.code} onClick={() => setSelectedVariantCode(v.code)} className={'p-3 rounded-2xl border transition flex justify-between items-center cursor-pointer ' + (selectedVariantCode === v.code ? 'border-[#fe6712] bg-orange-50 ring-1 ring-[#fe6712]/30' : 'bg-white border-slate-200 hover:border-orange-300')}>
                    <div>
                      <span className='text-xs font-black text-slate-900 block'>{v.title}</span>
                      <span className='text-[10px] text-slate-500 font-bold'>Stock: {v.stock} unidades</span>
                    </div>
                    <span className='text-xs font-black text-emerald-700'>{formatPrice(v.price)}</span>
<div></div></div>
                ))}
              </div>
            ) : (
              <div className='bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-center'>
                <span className='text-xs font-bold text-slate-800'>Precio Estándar:</span>
                <span className='text-sm font-black text-emerald-700'>{formatPrice(selectedProduct.price || 0)}</span>
              </div>
            )}
            <button onClick={() => { setCart([...cart, {name: selectedProduct.name}]); setSelectedProduct(null); }} className='w-full py-3 bg-[#fe6712] hover:bg-orange-600 text-white font-black text-xs rounded-2xl transition shadow-md'>Agregar al Carrito de Farmacia</button>
<div></div></div>
        </div>
      )}
    </div>
  );
}