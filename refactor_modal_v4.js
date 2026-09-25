const fs = require('fs');
let code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

// 1. Update viewMode type
code = code.replace(
  /useState<'options' \| 'customize' \| 'comboRoom' \| 'host_setup'>\('options'\);/,
  "useState<'options' | 'customize' | 'slots' | 'host_setup' | 'comboRoom'>('options');"
);

// 2. Update isSlotMode logic
code = code.replace(
  /const isSlotMode = false;/,
  "const isSlotMode = isSlotCustomizationActive && (isCombo || qty > 1);"
);

// 3. Replace the 3 big buttons in viewMode === 'options'
const optionsRegex = /\{viewMode === 'options' && \([\s\S]*?<div className="space-y-3 pb-3 border-b border-gray-100">[\s\S]*?Personalizar en esta pantalla[\s\S]*?<\/div>\s*\)\}/;

const newOptionsBlock = `{viewMode === 'options' && (isCombo || qty > 1) && (
          <div className="pb-3 border-b border-gray-100 flex justify-center mt-3">
            <button
              onClick={() => { setIsSlotCustomizationActive(true); setViewMode('customize'); }}
              className="border border-[#fe6712] text-[#fe6712] font-black py-2.5 px-6 rounded-full text-xs hover:bg-orange-50 transition cursor-pointer flex items-center gap-2 shadow-xs active:scale-95"
            >
              <span className="text-base">⚙️</span> {isCombo ? 'Personalizar combo' : 'Personalizar tu pedido'}
            </button>
          </div>
        )}`;

code = code.replace(optionsRegex, newOptionsBlock);

// 4. Add the customize menu block
const customizeMenuBlock = `
        {viewMode === 'customize' && (
          <div className="space-y-4 pb-4 border-b border-gray-100 mt-2">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setViewMode('options')} className="p-1.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Volver al producto</h4>
            </div>
            
            <button
              onClick={() => setViewMode('slots')}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-black py-4 px-4 rounded-xl text-sm transition text-left flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="block text-sm">🎨 Personalizar aquí mismo</span>
                <span className="text-[11px] text-slate-500 font-medium mt-1 block">Ajusta ingredientes unidad por unidad.</span>
              </div>
              <svg className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>

            <button
              onClick={() => { setHostSetupUnits(1); setHostSetupExclusions([]); setViewMode('host_setup'); }}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-4 px-4 rounded-xl text-sm transition text-left flex items-center justify-between shadow-md cursor-pointer"
            >
              <div>
                <span className="block text-sm">👥 Compartir entre panas por WhatsApp</span>
                <span className="text-[11px] text-green-100 font-medium mt-1 block">Arma el pedido con tus amigos.</span>
              </div>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>
        )}
`;

code = code.replace(newOptionsBlock, newOptionsBlock + customizeMenuBlock);

// 5. Change slot rendering condition
code = code.replace(/\{isSlotMode \? \(/, '{viewMode === \'slots\' ? (');

// 6. Change global variants rendering condition
code = code.replace(/\{\(!isCombo \|\| viewMode === 'customize'\) && availableGroups\.map/, '{(!isCombo && viewMode === \'options\' && qty === 1) && availableGroups.map');

// 7. Remove max-h and overflows from right column container to fix scrolls (point 3)
code = code.replace(/className="w-full lg:w-1\/2 flex flex-col h-full overflow-hidden bg-white"/, 'className="w-full lg:w-1/2 flex flex-col bg-white"');
// The inner one is likely <div className="flex-1 overflow-y-auto no-scrollbar">
code = code.replace(/className="flex-1 overflow-y-auto no-scrollbar"/, 'className="flex-1 pb-32"');
// If it was just "flex-1" we don't have to change it, but it had overflow-y-auto before. Let's make it robust:
code = code.replace(/className="flex-1"/, 'className="flex-1 pb-32"');
// Also, fix the sticky footer container to just normal div if we want? The prompt says "La barra inferior flotante (sticky bottom-0) mantiene su botón". So we keep the sticky footer, but the scroll trap is removed.

// Let's add the "Listo, confirmar personalización" button inside slots
// Wait, the slots are rendered when `viewMode === 'slots'`. 
// The slots view currently ends before the global variants.
// We can add the confirmation button at the end of the slots block.
const slotsRegex = /<\/div>\s*<\/div>\s*\)\s*:\s*\(\s*\/\*\s*Modo Estándar\s*\*\/\s*<div className="space-y-4">/;
const slotsConfirmButton = `
            <div className="pt-4 mt-2">
              <button
                onClick={() => setViewMode('options')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-xl text-sm transition shadow-md active:scale-[0.98] cursor-pointer"
              >
                Listo, confirmar personalización
              </button>
            </div>
`;
code = code.replace(slotsRegex, (match) => {
  return slotsConfirmButton + match;
});

// 8. Fix exclusions checkboxes: "Cada ranura permite ingresar un nombre referencial opcional y seleccionar casillas limpias (checkboxes reales, sin la palabra "Incluido" ni radio buttons) para las exclusiones de ingredientes."
// Let's remove `nicheEngine === 'FOOD_FAST'` requirement for exclusions
code = code.replace(/nicheEngine === 'FOOD_FAST' && product\.exclusions && product\.exclusions\.length > 0 && \(/g, 'product.exclusions && product.exclusions.length > 0 && (');

fs.writeFileSync('src/components/MasterProductModal.tsx', code);
console.log('Phase 1 done');
