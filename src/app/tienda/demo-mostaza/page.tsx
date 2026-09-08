'use client';

import React, { useState } from 'react';
import MasterProductModal from '../../../components/MasterProductModal';

export default function DemoMostaza() {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // MAQUETA ESTÁTICA: 2 Productos Referenciales para mostrar a Osvaldo
  const demoProducts = [
    {
      code: "MF001-003",
      name: "Perro Sifrino (Individual)",
      price: 3.10,
      desc: "Pan de la Casa, salchicha polaca, Ensalada, Papitas francesas, Queso Amarillo Rallado y Salsas.",
      category: "PERROS CALIENTES",
      img: "https://images.unsplash.com/photo-1594212691516-74724655b412?q=80&w=500",
      exclusions: ["Sin Salchicha", "Sin Ensalada", "Sin Papitas", "Sin Queso", "Sin Salsas"]
    },
    {
      code: "MF002-002",
      name: "Combo 5 Perros Sifrinos",
      price: 12.30,
      desc: "Combo familiar de 5 Perros Sifrinos con todo. ¡Ideal para probar el Modo Familia con exclusiones por persona!",
      category: "COMBOS",
      img: "https://images.unsplash.com/photo-1620189507195-68309c04c4d0?q=80&w=500",
      exclusions: ["Sin Salchicha", "Sin Ensalada", "Sin Papitas", "Sin Queso", "Sin Salsas"]
    }
  ];

  const handleAddToCart = (payload: any) => {
    alert(`¡Comanda Simulada Generada con Éxito!\n\nASÍ LLEGARÍA A LA COCINA:\n\n${payload.summaryText}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Cabecera Demo */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#fe6712] text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Demo UX/UI</span>
            <span className="text-slate-400 text-xs font-bold">Para: Equipo de Desarrollo</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">🍔 Mostaza Food Truck</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Maqueta estática de demostración para evaluar el <strong>Modo Familia</strong> y la generación de comandas por unidad.</p>
        </div>

        {/* Listado de Productos */}
        <div className="grid sm:grid-cols-2 gap-4">
          {demoProducts.map(p => (
            <div 
              key={p.code} 
              onClick={() => { setSelectedProduct(p); setIsModalOpen(true); }} 
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-[#fe6712] transition flex flex-col h-full"
            >
              <img src={p.img} alt={p.name} className="w-full h-48 object-cover rounded-xl mb-4 bg-slate-100" />
              <div className="flex-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">{p.category}</span>
                <h3 className="font-black text-lg text-slate-900 leading-tight">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{p.desc}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="font-black text-xl text-slate-900">${p.price.toFixed(2)}</span>
                <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Probar Modal</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Modal Maestro */}
      {isModalOpen && (
        <MasterProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedProduct}
          nicheEngine="FOOD_FAST"
          bcvRate={40}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}