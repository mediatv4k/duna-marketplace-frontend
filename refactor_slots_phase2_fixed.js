const fs = require('fs');
let code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

// 1. REFACTOR: handleAddToCart format
// Use a split approach for handleAddToCart to be safe.
const parts1 = code.split('activeSlots.forEach((slot, idx) => {');
const preCart = parts1[0];
const postCartFull = parts1.slice(1).join('activeSlots.forEach((slot, idx) => {');
// Now split by `      } else {\n        Object.keys(selectedVariants).forEach(key => {`
const parts2 = postCartFull.split(/}\s*else\s*\{\s*Object\.keys\(selectedVariants\)/);
const postCart = '      } else {\n        Object.keys(selectedVariants)' + parts2.slice(1).join('} else { Object.keys(selectedVariants)');

const newAddToCartSlots = `breakdown.push(\`------- \${(product.name || 'PEDIDO').toUpperCase()} -------\`);
        activeSlots.forEach((slot, idx) => {
          const slotTitle = slot.name?.trim() || '';
          // Format: • Perro #1 (Nombre): Sin papita, Sin salsa roja [+ Ración Papas]
          const slotHeader = \`• \${unitLabel} #\${idx + 1}\${slotTitle ? \` (\${slotTitle})\` : ''}\`;
          const exclusionsParts = [];
          const extrasParts = [];

          if (slot.exclusions && slot.exclusions.length > 0) {
            slot.exclusions.forEach((ex: string) => {
              exclusionsParts.push(ex.toUpperCase().startsWith('SIN ') ? ex : \`Sin \${ex}\`);
            });
          }

          Object.values(slot.selectedVariants).forEach((sel: any) => {
            if (!sel) return;
            if (Array.isArray(sel)) {
              sel.forEach(item => {
                if ((item.count || 0) > 0) {
                  const modLabel = /^sin\\b/i.test(String(item.name || '').trim()) ? String(item.name).trim() : \`\${item.count > 1 ? item.count + 'x ' : ''}\${item.name}\`;
                  extrasParts.push(\`+ \${modLabel}\`);
                }
              });
            } else if (sel.name) {
              extrasParts.push(\`+ \${sel.name}\`);
            }
          });

          let line = slotHeader + ': ';
          if (exclusionsParts.length === 0 && extrasParts.length === 0) {
            line += 'Con todo';
          } else {
            const allParts = [];
            if (exclusionsParts.length > 0) allParts.push(exclusionsParts.join(', '));
            if (extrasParts.length > 0) allParts.push(\`[\${extrasParts.join(', ')}]\`);
            if (exclusionsParts.length === 0 && extrasParts.length > 0) {
               line += 'Con todo ' + allParts.join(' ');
            } else {
               line += allParts.join(' ');
            }
          }
          breakdown.push(line);
        });
`;

code = preCart + newAddToCartSlots + postCart;


// 2. REFACTOR: Slots UI
// Split by `{viewMode === 'slots' ? (` and then by `        ) : (\n          /* Modo`
const uiParts1 = code.split("{viewMode === 'slots' ? (");
const preUI = uiParts1[0];
const postUIFull = uiParts1.slice(1).join("{viewMode === 'slots' ? (");
// Now split at `        ) : (\n          /* Modo`
const uiParts2 = postUIFull.split(/\)\s*:\s*\(\s*\/\*\s*Modo /);
const postUI = ') : (\n          /* Modo ' + uiParts2.slice(1).join(') : (\n          /* Modo ');

const newSlotsUI = `
          <div className="space-y-4">
            {/* 1. CABECERA SUPERIOR FIJA PARA NAVEGACIÓN DE RANURAS */}
            <div className="sticky top-0 bg-white z-20 p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between shadow-xs">
              <button
                type="button"
                disabled={activeSlotIndex === 0}
                onClick={() => setActiveSlotIndex(Math.max(0, activeSlotIndex - 1))}
                className="text-[11px] font-black text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition cursor-pointer bg-white hover:bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                <span className="hidden sm:inline">Anterior</span>
              </button>
              
              <div className="flex flex-col items-center flex-1 mx-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Unidad {activeSlotIndex + 1} de {slots.length}</span>
                {slots[activeSlotIndex].name ? (
                   <span className="text-[12px] font-black text-slate-800 mt-0.5 truncate max-w-[120px] sm:max-w-[180px] text-center">{slots[activeSlotIndex].name}</span>
                ) : (
                   <span className="text-[12px] font-black text-slate-800 mt-0.5">{unitLabel} {activeSlotIndex + 1}</span>
                )}
              </div>

              {activeSlotIndex < slots.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveSlotIndex(Math.min(slots.length - 1, activeSlotIndex + 1))}
                  className="text-[11px] font-black text-slate-600 flex items-center gap-1.5 transition cursor-pointer bg-white hover:bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shadow-sm"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setViewMode('options')}
                  className="text-[11px] font-black text-white flex items-center gap-1 transition cursor-pointer bg-[#FE6712] hover:bg-[#e0580d] px-3 py-2 rounded-xl shadow-md active:scale-95"
                >
                  <span className="hidden sm:inline">Listo, confirmar</span>
                  <span className="sm:hidden">Confirmar</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </button>
              )}
            </div>

            {/* Active Slot Content */}
            <div className="p-4 sm:p-5 bg-white border border-slate-100 rounded-2xl space-y-6 shadow-sm">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nombre (opcional):</label>
                <input
                  type="text"
                  value={slots[activeSlotIndex].name || ''}
                  onChange={(e) => {
                    const newSlots = [...slots];
                    newSlots[activeSlotIndex].name = e.target.value;
                    setSlots(newSlots);
                  }}
                  placeholder="Ej. Juan, María..."
                  maxLength={30}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#fe6712] transition shadow-xs"
                />
              </div>

              {/* 2. CUADRÍCULA COMPACTA DE EXCLUSIONES (2 COLUMNAS) */}
              {product.exclusions && product.exclusions.length > 0 && (
                <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Ingredientes a excluir:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {product.exclusions.map((exc) => {
                      const isChecked = slots[activeSlotIndex].exclusions?.includes(exc);
                      const displayLabel = exc.toUpperCase().startsWith('SIN ') ? exc : 'Sin ' + exc;
                      return (
                        <label
                          key={exc}
                          className={\`flex items-center gap-2 px-2.5 h-9 rounded-xl border text-[11px] font-bold cursor-pointer transition shadow-xs \${
                            isChecked
                              ? 'bg-red-50 border-red-200 text-red-700'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-[#FE6712]/40 hover:bg-orange-50/30'
                          }\`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const newSlots = [...slots];
                              if (isChecked) {
                                newSlots[activeSlotIndex].exclusions = newSlots[activeSlotIndex].exclusions.filter(e => e !== exc);
                              } else {
                                newSlots[activeSlotIndex].exclusions = [...(newSlots[activeSlotIndex].exclusions || []), exc];
                              }
                              setSlots(newSlots);
                            }}
                            className="w-3.5 h-3.5 accent-[#FE6712] rounded cursor-pointer shrink-0"
                          />
                          <span className={\`truncate \${isChecked ? 'line-through opacity-70' : ''}\`}>{displayLabel}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* 3. EXTRAS / VENTA CRUZADA INTEGRADA EN LÍNEA (OPCIÓN B) */}
              {availableGroups.length > 0 && availableGroups.map((group, gIdx) => {
                  const currentSlotVars = slots[activeSlotIndex].selectedVariants[gIdx] || [];
                  const groupTitle = group.title || '';
                  const isExtra = groupTitle.toLowerCase().includes('extra') || groupTitle.toLowerCase().includes('acompaña') || groupTitle.toLowerCase().includes('adicional');
                  
                  return (
                    <div key={gIdx} className="space-y-2.5 pt-4 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        {isExtra ? '¿Acompañamos esta unidad?' : groupTitle}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((opt) => {
                          const matched = Array.isArray(currentSlotVars)
                            ? currentSlotVars.find((i) => (i.code === opt.code || i.id === opt.id))
                            : (currentSlotVars?.id === opt.id || currentSlotVars?.code === opt.code ? currentSlotVars : null);
                          
                          const isSelected = !!matched && (matched.count === undefined || matched.count > 0);
                          
                          return (
                            <button
                              key={opt.code || opt.id}
                              type="button"
                              onClick={() => {
                                 // Chips type behavior: Toggle on/off.
                                 const delta = isSelected ? -1 : 1;
                                 handleSlotOptionQuantityChange(gIdx, opt.code || opt.id, delta);
                              }}
                              className={\`h-9 px-3.5 rounded-full border text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95 \${
                                isSelected 
                                  ? 'bg-[#fff5ed] border-[#FE6712] text-[#FE6712]' 
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300'
                              }\`}
                            >
                              <span className={isSelected ? 'text-[#FE6712]' : 'text-slate-400 font-black'}>{isSelected ? '✓' : '+'}</span>
                              <span className="truncate max-w-[150px]">{opt.name || opt.title}</span>
                              {opt.price > 0 && <span className={isSelected ? 'text-orange-700 font-black' : 'text-slate-500'}>(+\$\${opt.price.toFixed(2)})</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
            {/* Quick exit button just in case */}
            <div className="flex justify-center pb-4">
              <button
                onClick={() => setViewMode('options')}
                className="text-[11px] font-black text-slate-400 hover:text-slate-600 underline cursor-pointer"
              >
                Salir al menú sin confirmar
              </button>
            </div>
          </div>
        `;

code = preUI + "{viewMode === 'slots' ? (" + newSlotsUI + postUI;

fs.writeFileSync('src/components/MasterProductModal.tsx', code);
console.log('Phase 2 slots window refactor applied via split method.');
