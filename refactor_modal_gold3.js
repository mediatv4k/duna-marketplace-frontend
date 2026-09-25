const fs = require('fs');
let code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

// 1. Remove Left Column Price
// First occurrence (main left column)
const leftColumnPriceRegex1 = /<div className="flex justify-between items-baseline">\s*<div>\s*<span className="text-\[10px\] font-black text-slate-400 uppercase tracking-wider block">'Precio Base'<\/span>[\s\S]*?<\/div>\s*<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0\.5 text-\[10px\] font-bold text-emerald-700 border border-emerald-200">/;
code = code.replace(leftColumnPriceRegex1, `<div className="flex justify-between items-center pb-2">\n                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">`);

// Second occurrence (if any)
const leftColumnPriceRegex2 = /<div className="flex justify-between items-baseline">\s*<div>\s*<span className="text-\[10px\] font-black text-slate-400 uppercase tracking-wider block">Precio Base<\/span>[\s\S]*?<\/div>\s*<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0\.5 text-\[10px\] font-bold text-emerald-700 border border-emerald-200">/;
code = code.replace(leftColumnPriceRegex2, `<div className="flex justify-between items-center pb-2">\n                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">`);

// 2. Ergonometric Header for Slots
// We need to replace the old sticky top header
const stickyHeaderRegex = /\{\/\* 1\. CABECERA SUPERIOR FIJA PARA NAVEGACIÓN DE RANURAS \*\/\}\s*<div className="sticky top-0 bg-white z-20 p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between shadow-xs">[\s\S]*?\{\/\* Active Slot Content \*\/\}/;

const newErgoHeader = `{/* 1. CABECERA ERGONÓMICA: NOMBRE COMPACTO + BOTÓN INTEGRADO */}
            <div className="sticky top-0 bg-white z-20 py-3 px-3 sm:px-4 border-b border-slate-100 flex items-center justify-between gap-2 shadow-xs">
              <button
                type="button"
                disabled={activeSlotIndex === 0}
                onClick={() => setActiveSlotIndex(Math.max(0, activeSlotIndex - 1))}
                className="text-[11px] font-black text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                <span className="hidden sm:inline">Anterior</span>
              </button>
              
              <div className="flex items-center gap-2 flex-1 justify-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider hidden sm:inline-block pt-0.5">Unidad {activeSlotIndex + 1} de {slots.length}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider sm:hidden pt-0.5">{activeSlotIndex + 1}/{slots.length}</span>
                
                <input
                  type="text"
                  value={slots[activeSlotIndex].name || ''}
                  onChange={(e) => {
                    const newSlots = [...slots];
                    newSlots[activeSlotIndex].name = e.target.value;
                    setSlots(newSlots);
                  }}
                  placeholder="Nombre (opcional)"
                  maxLength={20}
                  className="w-24 sm:w-36 max-w-[180px] h-9 text-xs px-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#fe6712] transition"
                />

                {activeSlotIndex < slots.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveSlotIndex(Math.min(slots.length - 1, activeSlotIndex + 1))}
                    className="h-9 px-3 sm:px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                  >
                    <span className="hidden sm:inline">Siguiente</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setViewMode('options')}
                    className="h-9 px-3 sm:px-4 rounded-lg bg-[#FE6712] hover:bg-[#e0580d] text-white text-xs font-black shadow-md flex items-center gap-1 transition cursor-pointer shrink-0 active:scale-95"
                  >
                    <span className="hidden sm:inline">Listo, confirmar</span>
                    <span className="sm:hidden">Confirmar</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </button>
                )}
              </div>
            </div>

            {/* Active Slot Content */}`;
code = code.replace(stickyHeaderRegex, newErgoHeader);

// 3. Remove old full width input
const oldInputRegex = /\{\/\* Name Input \*\/\}\s*<div className="space-y-2">\s*<label className="text-\[10px\] font-black text-slate-400 uppercase tracking-wider">Nombre \(opcional\):<\/label>\s*<input[\s\S]*?<\/div>\s*\{\/\* 2\. CUADRÍCULA COMPACTA DE EXCLUSIONES/;
code = code.replace(oldInputRegex, '{/* 2. CUADRÍCULA COMPACTA DE EXCLUSIONES');

fs.writeFileSync('src/components/MasterProductModal.tsx', code);
console.log('Ergo Header and price fix applied');
