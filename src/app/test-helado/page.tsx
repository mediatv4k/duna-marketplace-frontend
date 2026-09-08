'use client';

import React, { useState } from 'react';
import { 
  MapPin, Wallet, IceCream, Search, ShoppingCart, 
  Sun, Film, X, Snowflake, ArrowRight, LayoutGrid, CupSoda, Package
} from 'lucide-react';

const BCV_RATE = 48.50;

const catalog = [
  {
    code: "H001-004", cat: "LÍNEA ML", name: "Papa Cono 12 Und", desc: "12 Unidades. Sabores con selección libre por unidad.",
    status: "ACTIVE", price: 9.3, img: "https://carjos-marketplace.cloud/uploads/uploads/files/images/cm614aslh00282omrgpvy2e4k.png",
    req_units: 12,
    flavors: [
      { code: "SB1201", name: "Fresa", img: "https://carjos-marketplace.cloud/uploads/uploads/files/images/cmh9iok9w002j1wl89hxlchgk.png" },
      { code: "SB1202", name: "Chocolate", img: "https://carjos-marketplace.cloud/uploads/uploads/files/images/cmh9ip225002l1wl82yyn1388.png" },
      { code: "SB1203", name: "Mantecado", img: "https://carjos-marketplace.cloud/uploads/uploads/files/images/cmh9ipghn002n1wl8cm4l6vo1.png" }
    ]
  },
  {
    code: "H007-001", cat: "PAPA CHICHA", name: "Chicha para llevar 32 Oz Especial", desc: "Rica chicha tradicional, con canela, leche condensada y toppings crocantes.",
    status: "ACTIVE", price: 8.0, img: "https://carjos-marketplace.cloud/uploads/uploads/files/images/cmioua6xw000v1uo5f1x4e10g.png",
    req_units: 0, flavors: []
  }
];

export default function PapaHeladoView() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<any>(null);
  const [selections, setSelections] = useState<Record<string, number>>({});

  const openModal = (product: any) => {
    setActiveProduct(product);
    setSelections({});
    setIsModalOpen(true);
  };

  const adjustFlavor = (code: string, delta: number) => {
    setSelections(prev => {
      const current = prev[code] || 0;
      const newCount = Math.max(0, current + delta);
      const totalSelected = Object.values(prev).reduce((a, b) => a + b, 0) - current + newCount;
      if (activeProduct.req_units > 0 && totalSelected > activeProduct.req_units) return prev;
      
      const next = { ...prev };
      if (newCount === 0) delete next[code];
      else next[code] = newCount;
      return next;
    });
  };

  const totalSelectedInBox = Object.values(selections).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <div className="bg-[#002855] text-white text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-orange-200">
            <MapPin className="w-3.5 h-3.5 text-[#fe6712]" />
            <span>Cabimas, Estado Zulia</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 bg-white/10 px-3 py-0.5 rounded-full">
              <Snowflake className="w-3.5 h-3.5 text-cyan-300" />
              <span>Cadena de Frío: <strong>15 - 30 min</strong></span>
            </div>
          </div>
        </div>
      </div>

      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#fe6712] to-amber-500 flex items-center justify-center text-white shadow-md">
              <IceCream className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-[#002855]">PAPÁ</span>
                <span className="text-xl font-black text-[#fe6712]">HELADO</span>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-[#002855] text-white px-4 py-2 rounded-2xl shadow-md">
            <ShoppingCart className="w-4 h-4 text-[#fe6712]" />
            <span className="text-xs font-black">$0.00</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {catalog.map(p => (
          <div key={p.code} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group" onClick={() => openModal(p)}>
             <span className="absolute top-3 left-3 bg-[#fff5ed] text-[#fe6712] border border-[#ffd8bf] text-[9px] font-black px-2 py-0.5 rounded-md uppercase z-10">{p.cat}</span>
             <div className="w-full h-40 bg-slate-50 rounded-xl flex items-center justify-center p-2 mb-3">
                <img src={p.img} alt={p.name} className="max-h-full object-contain group-hover:scale-105 transition-transform" />
             </div>
             <h4 className="text-sm font-bold text-[#002855]">{p.name}</h4>
             <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{p.desc}</p>
             <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-lg font-black text-[#002855]">${p.price.toFixed(2)}</span>
                </div>
                <button className="bg-[#002855] text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm">
                  Configurar
                </button>
             </div>
          </div>
        ))}
      </main>

      {isModalOpen && activeProduct && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full max-w-2xl rounded-t-[2.5rem] sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-white z-20">
               <div>
                 <span className="text-[10px] font-black text-[#002855] bg-slate-100 px-2 py-0.5 rounded-md uppercase">{activeProduct.code}</span>
                 <h3 className="text-xl font-black text-[#002855] mt-1">{activeProduct.name}</h3>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-5 overflow-y-auto space-y-6 flex-1 bg-white">
               <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center border border-slate-200 shrink-0 p-2">
                    <img src={activeProduct.img} alt="Product" className="max-h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Precio Pack</span>
                    <span className="text-2xl font-black text-[#002855]">${activeProduct.price.toFixed(2)}</span>
                  </div>
               </div>

               {activeProduct.req_units > 0 && (
                 <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200 space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-[#fe6712]" />
                            <span className="text-xs font-black text-[#002855] uppercase tracking-wider">Tu Cajita Papá Helado</span>
                        </div>
                        <span className={`text-xs font-black px-3 py-0.5 rounded-full border shadow-sm ${totalSelectedInBox === activeProduct.req_units ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-[#fe6712] border-orange-200'}`}>
                            {totalSelectedInBox} / {activeProduct.req_units}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 p-3 bg-white/80 rounded-xl border border-orange-100 min-h-[60px] items-center">
                       {Object.entries(selections).flatMap(([code, count]) => {
                         const flavor = activeProduct.flavors.find((f:any) => f.code === code);
                         return Array.from({ length: count as number }).map((_, i) => (
                           <div key={`${code}-${i}`} className="bg-[#fe6712] text-white text-[9px] font-black px-2 py-1 rounded-md shadow-sm">
                              🍦 {flavor?.name}
                           </div>
                         ));
                       })}
                       {Array.from({ length: activeProduct.req_units - totalSelectedInBox }).map((_, i) => (
                          <div key={`empty-${i}`} className="border border-dashed border-slate-300 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                             +{i + 1}
                          </div>
                       ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                      {activeProduct.flavors.map((flavor: any) => {
                        const count = selections[flavor.code] || 0;
                        return (
                          <div key={flavor.code} className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between gap-2 shadow-sm">
                            <div className="flex items-center gap-2">
                               <img src={flavor.img} className="w-8 h-8 rounded-md object-contain bg-slate-50 border border-slate-100" />
                               <span className="text-xs font-bold text-slate-800">{flavor.name}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-100 px-1.5 py-1 rounded-lg">
                               <button onClick={() => adjustFlavor(flavor.code, -1)} className="w-6 h-6 flex items-center justify-center font-black text-slate-600 hover:text-[#fe6712]">-</button>
                               <span className="text-xs font-black text-[#002855] w-4 text-center">{count}</span>
                               <button onClick={() => adjustFlavor(flavor.code, 1)} className="w-6 h-6 flex items-center justify-center font-black text-slate-600 hover:text-[#fe6712]">+</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                 </div>
               )}
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
               <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase block">Total a Pagar</span>
                  <span className="text-xl font-black text-[#002855]">${activeProduct.price.toFixed(2)}</span>
               </div>
               {activeProduct.req_units > 0 && totalSelectedInBox !== activeProduct.req_units ? (
                 <button disabled className="flex-1 bg-slate-200 text-slate-500 font-black py-3.5 rounded-xl cursor-not-allowed text-xs flex items-center justify-center gap-2">
                   Faltan {activeProduct.req_units - totalSelectedInBox} unidades
                 </button>
               ) : (
                 <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-[#fe6712] text-white font-black py-3.5 rounded-xl shadow-md hover:bg-[#e0580d] transition text-xs flex items-center justify-center gap-2">
                   Agregar a la Bolsa <ArrowRight className="w-4 h-4" />
                 </button>
               )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}