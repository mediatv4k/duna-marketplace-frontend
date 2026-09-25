const fs = require('fs');
let code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

// 1. REFACTOR: handleAddToCart format
// Find the activeSlots.forEach block
const addToCartSlotsRegex = /activeSlots\.forEach\(\(slot, idx\) => \{[\s\S]*?\}\);\n      \} else \{/;

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
      } else {`;

code = code.replace(addToCartSlotsRegex, newAddToCartSlots);


// 2. REFACTOR: Slots UI
// Find the entire slots view mode block
const slotsUI_Regex = /\{viewMode === 'slots' \? \([\s\S]*?\) : \(\n\s*\/\*\s*Modo Estándar/;

const newSlotsUI = `{viewMode === 'slots' ? (
          <div className="space-y-4">
            {/* 1. CABECERA SUPERIOR FIJA PARA NAVEGACIÓN DE RANURAS */}
            <div className="sticky top-0 bg-white z-20 p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between shadow-xs">
              <button
                type="button"
                disabled={activeSlotIndex === 0}
                onClick={() => setActiveSlotIndex(Math.max(0, activeSlotIndex - 1))}
                className="text-xs font-black text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition cursor-pointer bg-white hover:bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                <span className="hidden sm:inline">Anterior</span>
              </button>
              
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Unidad {activeSlotIndex + 1} de {slots.length}</span>
                {slots[activeSlotIndex].name ? (
                   <span className="text-[13px] font-black text-slate-800 mt-0.5 truncate max-w-[120px] sm:max-w-[200px]">{slots[activeSlotIndex].name}</span>
                ) : (
                   <span className="text-[13px] font-black text-slate-800 mt-0.5">{unitLabel} {activeSlotIndex + 1}</span>
                )}
              </div>

              {activeSlotIndex < slots.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveSlotIndex(Math.min(slots.length - 1, activeSlotIndex + 1))}
                  className="text-xs font-black text-slate-600 flex items-center gap-1.5 transition cursor-pointer bg-white hover:bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shadow-sm"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setViewMode('options')}
                  className="text-xs font-black text-white flex items-center gap-1 transition cursor-pointer bg-[#FE6712] hover:bg-[#e0580d] px-3 py-2 rounded-xl shadow-md active:scale-95"
                >
                  <span className="hidden sm:inline">Listo, confirmar</span>
                  <span className="sm:hidden">Confirmar</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </button>
              )}
            </div>

            {/* Pestañas de Ranura (Mantenidas para navegación rápida pero opcionales) */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
              {slots.map((slot, idx) => {
                const isActive = activeSlotIndex === idx;
                const slotLabel = slot.name ? \`\${unitLabel} \${idx + 1}: \${slot.name}\` : \`\${unitLabel} \${idx + 1}\`;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlotIndex(idx)}
                    className={\`shrink-0 px-4 py-2 rounded-xl text-[11px] font-black transition cursor-pointer border \${
                      isActive 
                        ? 'bg-[#FE6712] text-white border-[#FE6712] shadow-sm' 
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                    }\`}
                  >
                    {slotLabel}
                  </button>
                );
              })}
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
                                 // Chips type behavior: Toggle on/off. Delta is 1 if turning on, -1 if turning off.
                                 // The handleSlotOptionQuantityChange adds delta to current count.
                                 // Since current count is 1 (if selected) or 0 (if not), delta -1 makes it 0.
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

            {/* Bottom confirm button just in case, for fast closing without scrolling up */}
            <div className="pt-2">
              <button
                onClick={() => setViewMode('options')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl text-sm transition shadow-md active:scale-[0.98] cursor-pointer flex justify-center items-center gap-2"
              >
                Listo, guardar y volver al producto
              </button>
            </div>
          </div>
        ) : (
          /* Modo Estándar`;

code = code.replace(slotsUI_Regex, newSlotsUI);

fs.writeFileSync('src/components/MasterProductModal.tsx', code);
console.log('Phase 2 slots window refactor applied.');
