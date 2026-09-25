const fs = require('fs');
let code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

// 1. Grid adjustments
code = code.replace(
  `<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6 items-start">`,
  `<div className={\`grid grid-cols-1 \${viewMode === 'slots' ? '' : 'md:grid-cols-2'} gap-4 md:gap-6 p-4 md:p-6 items-start\`}>`
);

code = code.replace(
  `{/* Columna Izquierda (Mitad 50% - Anclada / Sin Scroll) */}
                    <div className="w-full flex flex-col justify-between overflow-hidden bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 gap-3 md:sticky md:top-6">`,
  `{/* Columna Izquierda (Mitad 50% - Anclada / Sin Scroll) */}
                    {viewMode !== 'slots' && (
                    <div className="w-full flex flex-col justify-between overflow-hidden bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 gap-3 md:sticky md:top-6">`
);

code = code.replace(
  `{/* Columna Derecha (Mitad 50% - Vitrina de Opciones con Scroll) */}`,
  `)}
                    {/* Columna Derecha (Mitad 50% - Vitrina de Opciones con Scroll) */}`
);

// Right column header hiding
const rightColumnHeader = `{/* Cabecera */}
                      <div className="pb-3 border-b border-slate-100 shrink-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5 pr-14 text-[10px] font-black uppercase tracking-wider text-slate-500">
                          <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{product.code}</span>
                          <span>|</span>
                          <span className="text-[#fe6712] bg-[#fff5ed] px-2 py-0.5 rounded">{(product.category || product.cat || 'PRODUCTO').toUpperCase()}</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight pr-14 mb-1">{product.name}</h3>
                        {cleanDescription && <p className="text-xs text-slate-600 leading-relaxed mb-2">{cleanDescription}</p>}
                        {descriptionTags && Object.keys(descriptionTags).length > 0 && <ProductTagBadges tags={descriptionTags} className="mb-2" />}
                      </div>`;

code = code.replace(
  rightColumnHeader,
  `{viewMode !== 'slots' && (\n                        <>\n${rightColumnHeader}\n                        </>\n                      )}`
);

// 2. Rewrite the viewMode === 'slots' rendering completely
// Let's find the current slots block: `{viewMode === 'slots' ? ( ... ) : (` and replace it with the new layout
const currentSlotsRegex = /\{viewMode === 'slots' \? \([\s\S]*?<\/div>\s*<\/div>\s*\)\s*:\s*\(\s*\/\*\s*Modo Estándar/;

const newSlotsUI = `{viewMode === 'slots' ? (
          <div className="space-y-5">
            {/* Header: Back button + Title */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <button
                type="button"
                onClick={() => setViewMode('customize')}
                className="text-xs font-black text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Volver al producto (sin guardar)
              </button>
              <h4 className="text-sm font-black text-slate-900">{isCombo ? product.name : product.name + ' x' + qty}</h4>
            </div>

            {/* Pestañas de Ranura */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {slots.map((slot, idx) => {
                const isActive = activeSlotIndex === idx;
                const slotLabel = slot.name ? \`\${unitLabel} \${idx + 1}: \${slot.name}\` : \`\${unitLabel} \${idx + 1}\`;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlotIndex(idx)}
                    className={\`shrink-0 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer border \${
                      isActive 
                        ? 'bg-[#FE6712] text-white border-[#FE6712] shadow-sm' 
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                    }\`}
                  >
                    {slotLabel}
                  </button>
                );
              })}
            </div>

            {/* Active Slot Content */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Nombre (opcional):</label>
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
                  className="w-full max-w-sm rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#fe6712] transition shadow-sm"
                />
              </div>

              {/* Exclusions */}
              {product.exclusions && product.exclusions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Ingredientes a excluir:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {product.exclusions.map((exc) => {
                      const isChecked = slots[activeSlotIndex].exclusions?.includes(exc);
                      const displayLabel = exc.toUpperCase().startsWith('SIN ') ? exc : 'Sin ' + exc;
                      return (
                        <label
                          key={exc}
                          className={\`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition shadow-sm \${
                            isChecked
                              ? 'bg-red-50 border-red-200 text-red-700'
                              : 'bg-white border-slate-300 text-slate-800 hover:border-[#FE6712]/50'
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
                            className="w-4 h-4 accent-[#FE6712] rounded cursor-pointer"
                          />
                          <span className={isChecked ? 'line-through opacity-70' : ''}>{displayLabel}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Regular Addons and variants for this slot if any */}
              {availableGroups.length > 0 && availableGroups.map((group, gIdx) => {
                  const currentSlotVars = slots[activeSlotIndex].selectedVariants[gIdx];
                  return (
                    <div key={gIdx} className="space-y-3 pt-4 border-t border-slate-200">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{group.title}</span>
                        <span className="text-[9px] font-bold text-slate-400">{group.subtitle || 'Ajusta las cantidades'}</span>
                      </div>
                      <div className="flex flex-col gap-2.5 w-full">
                        {group.options.map((opt) => {
                          const matched = Array.isArray(currentSlotVars)
                            ? currentSlotVars.find((i) => (i.code === opt.code || i.id === opt.id))
                            : null;
                          const currentCount = matched?.count || 0;
                          return (
                            <div key={opt.code || opt.id} className="flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-white">
                              <span className="text-[11px] font-bold text-slate-700">{opt.name || opt.title}</span>
                              <div className="flex items-center gap-3">
                                {opt.price > 0 && (
                                  <span className="text-[10px] font-black text-slate-400">+$\${opt.price.toFixed(2)}</span>
                                )}
                                <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-0.5 border border-slate-100">
                                  <button
                                    type="button"
                                    onClick={() => handleSlotOptionQuantityChange(activeSlotIndex, gIdx, opt.code || opt.id, Math.max(0, currentCount - 1), opt)}
                                    className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-600 flex items-center justify-center cursor-pointer shadow-xs active:scale-95 disabled:opacity-30"
                                    disabled={currentCount === 0}
                                  >
                                    -
                                  </button>
                                  <span className="w-4 text-center text-xs font-black text-slate-800">{currentCount}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleSlotOptionQuantityChange(activeSlotIndex, gIdx, opt.code || opt.id, currentCount + 1, opt)}
                                    className="w-6 h-6 rounded-md bg-[#fe6712] text-white flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="pt-4 mt-2">
              <button
                onClick={() => setViewMode('options')}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-4 rounded-xl text-sm transition shadow-md active:scale-[0.98] cursor-pointer"
              >
                Listo, confirmar personalización
              </button>
            </div>
          </div>
        ) : (
          /* Modo Estándar`;

code = code.replace(currentSlotsRegex, newSlotsUI);

fs.writeFileSync('src/components/MasterProductModal.tsx', code);
console.log('Slots completely refactored to Full Window design');
