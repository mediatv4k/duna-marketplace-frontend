/**
 * REFERENCIA — Tabs de categoría "Todo el Catálogo"
 * ---------------------------------------------------------------------
 * Rescatado de src/components/MerchantStoreView.bak.tsx (líneas ~61, 93,
 * 96, 309-321) antes de archivar ese componente. NO es código activo —
 * es material de referencia para la tarea pendiente de rediseño del
 * catálogo de tienda (StoreExperience.tsx / ProductGrid.tsx).
 *
 * Contexto de uso original: filtraba `products` por categoría de
 * PRODUCTO (product.category), no por nicho de tienda. La categoría
 * "ALL" mostraba el texto especial "✨ Todo el Catálogo".
 *
 * Para la tarea pendiente del catálogo, este patrón debería recibir
 * `filterType` desde `getNicheConfig(niche).filterType` en vez de
 * asumir siempre pestañas de categoría (algunos nichos usan
 * SIZE_AND_COLOR, WEIGHT_PRESENTATION, etc. en su lugar).
 */

import { useState } from 'react';
import { Search } from 'lucide-react';

// --- Estado (línea 61 y 93 del .bak) ---
// const [selectedCategory, setSelectedCategory] = useState('ALL');
// const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category)))];
//
// Filtro derivado (línea 96 del .bak):
// const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;

interface CategoryTabsReferenceProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export function CategoryTabsReference({
  categories,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
}: CategoryTabsReferenceProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-[#fe6712] text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat === 'ALL' ? '✨ Todo el Catálogo' : cat}
          </button>
        ))}
      </div>
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar en esta tienda..."
          className="w-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[#fe6712] focus:bg-white transition"
        />
      </div>
    </div>
  );
}
