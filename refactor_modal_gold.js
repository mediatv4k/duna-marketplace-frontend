const fs = require('fs');
let code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

// 1. ELIMINACIÓN TOTAL DE PRECIOS REDUNDANTES: Left Column
// Replace the dynamic price calculation in the left column with just unitPrice (or unitPrice * qty if preferred. I'll use unitPrice to be a pure reference).
code = code.replace(
  /\{\(isSlotMode \? \(unitPrice \* qty \+ totalSlotVariantsPrice\) : \(\(unitPrice \+ totalVariantsPrice\) \* qty\)\)\.toFixed\(2\)\}/g,
  "{unitPrice.toFixed(2)}"
);
// Make sure the label just says 'Precio Base'
code = code.replace(
  /\{isSlotMode \? 'Precio Configurado' : 'Precio Base'\}/g,
  "'Precio Base'"
);

// 1b. Footer Buy Button: Remove the price
code = code.replace(
  /`Comprar • \$\$\{totalCalculated\.toFixed\(2\)\}`/g,
  "'Agregar al carrito'"
);
// Also for combo room
code = code.replace(
  /`Agregar combo al carrito \(\$\$\{totalCalculated\.toFixed\(2\)\}\)`/g,
  "'Agregar combo al carrito'"
);

// 2. TRAMPA DEL FOOTER Y CONTROL DE EDICIÓN
// In the sticky footer, hide it or disable it when viewMode === 'slots'.
// The sticky footer starts with <div className="sticky bottom-0
code = code.replace(
  /<div className="sticky bottom-0 bg-white border-t border-slate-100 z-30 shrink-0 shadow-md pb-\[max\(0\.75rem,env\(safe-area-inset-bottom\)\)\]">/,
  `<div className={\`sticky bottom-0 bg-white border-t border-slate-100 z-30 shrink-0 shadow-md pb-[max(0.75rem,env(safe-area-inset-bottom))] \${viewMode === 'slots' ? 'hidden' : ''}\`}>`
);

// Update "Personalizar combo" button to "Editar personalización (X/Y configuradas)"
// The button is in viewMode === 'options'
const customizeButtonTextRegex = /\{isCombo \? 'Personalizar combo' : 'Personalizar tu pedido'\}/;
const newCustomizeText = `isSlotCustomizationActive ? \`✏️ Editar personalización (\${slots.filter(s => Object.keys(s.selectedVariants).length > 0 || s.exclusions?.length > 0).length}/\${qty} listas)\` : (isCombo ? 'Personalizar combo' : 'Personalizar tu pedido')`;
code = code.replace(customizeButtonTextRegex, `{${newCustomizeText}}`);
// Also remove the explicit ⚙️ span since the new text has an emoji or we can keep it.
code = code.replace(
  /<span className="text-base">⚙️<\/span>\s*\{isSlotCustomizationActive/,
  "{isSlotCustomizationActive"
);

// "Salir al menú sin confirmar" with confirmation dialog
// Find the exit button
code = code.replace(
  /onClick=\{\(\) => setViewMode\('options'\)\}\s*className="text-\[11px\] font-black text-slate-400 hover:text-slate-600 underline cursor-pointer"\s*>\s*Salir al menú sin confirmar\s*<\/button>/g,
  `onClick={() => {
                  const configuredCount = slots.filter(s => Object.keys(s.selectedVariants).length > 0 || s.exclusions?.length > 0).length;
                  if (configuredCount < qty) {
                     if (window.confirm(\`Has configurado \${configuredCount} de \${qty} unidades. ¿Deseas continuar configurando o salir y que las restantes salgan Con Todo?\`)) {
                        setViewMode('options');
                     }
                  } else {
                     setViewMode('options');
                  }
                }}
                className="text-[11px] font-black text-slate-400 hover:text-slate-600 underline cursor-pointer"
              >
                Salir al menú sin confirmar
              </button>`
);

// Also apply the same confirmation to the top left "Volver al producto (sin guardar)" button
code = code.replace(
  /onClick=\{\(\) => setViewMode\('customize'\)\}\s*className="text-\[11px\] font-black text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1\.5 transition cursor-pointer bg-white hover:bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shadow-sm"/g,
  `onClick={() => {
                  const configuredCount = slots.filter(s => Object.keys(s.selectedVariants).length > 0 || s.exclusions?.length > 0).length;
                  if (configuredCount < qty) {
                     if (window.confirm(\`Has configurado \${configuredCount} de \${qty} unidades. ¿Deseas continuar configurando o salir y que las restantes salgan Con Todo?\`)) {
                        setViewMode('customize');
                     }
                  } else {
                     setViewMode('customize');
                  }
                }}
                className="text-[11px] font-black text-slate-600 flex items-center gap-1.5 transition cursor-pointer bg-white hover:bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shadow-sm"`
);

// Fallback extras logic if `availableGroups` doesn't have an extra group natively.
// We can inject a synthetic group into `availableGroups` if it doesn't exist, OR just append it directly in the UI if not found.
// The prompt says "Si el producto no trae un grupo nativo de variantes de extras en la base de datos, inyecta los extras estándar".
// Let's do it in the UI mapping.
// Find the availableGroups.map block in slots UI
const availableGroupsRegex = /\{availableGroups\.length > 0 && availableGroups\.map\(\(group, gIdx\) => \{[\s\S]*?\}\)\}/;

const newExtrasLogic = `{(() => {
                let hasExtrasGroup = false;
                const groupsRendered = availableGroups.map((group, gIdx) => {
                  const currentSlotVars = slots[activeSlotIndex].selectedVariants[gIdx] || [];
                  const groupTitle = group.title || '';
                  const isExtra = groupTitle.toLowerCase().includes('extra') || groupTitle.toLowerCase().includes('acompaña') || groupTitle.toLowerCase().includes('adicional');
                  if (isExtra) hasExtrasGroup = true;
                  
                  return (
                    <div key={gIdx} className="space-y-2.5 pt-4 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        {isExtra ? '¿Acompañamos esta unidad?' : groupTitle}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((opt: any) => {
                          const matched = Array.isArray(currentSlotVars)
                            ? currentSlotVars.find((i: any) => (i.code === opt.code || i.id === opt.id))
                            : (currentSlotVars?.id === opt.id || currentSlotVars?.code === opt.code ? currentSlotVars : null);
                          
                          const isSelected = !!matched && (matched.count === undefined || matched.count > 0);
                          
                          return (
                            <button
                              key={opt.code || opt.id}
                              type="button"
                              onClick={() => {
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
                });
                
                // Si no hay un grupo nativo de extras, inyectamos los estándar (Fallback)
                if (!hasExtrasGroup) {
                   const fallbackExtras = [
                     { id: 'f_papas', name: '🍟 Ración Papas', price: 2.00 },
                     { id: 'f_tequenos', name: '🧀 Tequeños 6 uds', price: 3.50 },
                     { id: 'f_refresco', name: '🥤 Refresco / Bebida', price: 1.50 }
                   ];
                   const fallbackGIdx = 'fallback_extras';
                   const currentSlotVars = slots[activeSlotIndex].selectedVariants[fallbackGIdx] || [];
                   
                   groupsRendered.push(
                     <div key="fallback_extras" className="space-y-2.5 pt-4 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        ¿Acompañamos esta unidad?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {fallbackExtras.map((opt: any) => {
                          const matched = Array.isArray(currentSlotVars)
                            ? currentSlotVars.find((i: any) => (i.code === opt.id || i.id === opt.id))
                            : null;
                          const isSelected = !!matched && (matched.count > 0);
                          
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                 const delta = isSelected ? -1 : 1;
                                 // Para inyectar en handleSlotOptionQuantityChange, le pasamos opt simulado
                                 handleSlotOptionQuantityChange(fallbackGIdx, opt.id, delta, opt);
                              }}
                              className={\`h-9 px-3.5 rounded-full border text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95 \${
                                isSelected 
                                  ? 'bg-[#fff5ed] border-[#FE6712] text-[#FE6712]' 
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300'
                              }\`}
                            >
                              <span className={isSelected ? 'text-[#FE6712]' : 'text-slate-400 font-black'}>{isSelected ? '✓' : '+'}</span>
                              <span className="truncate max-w-[150px]">{opt.name}</span>
                              <span className={isSelected ? 'text-orange-700 font-black' : 'text-slate-500'}>(+\$\${opt.price.toFixed(2)})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                   );
                }
                
                return groupsRendered;
              })()}`;

code = code.replace(availableGroupsRegex, newExtrasLogic);

// WAIT! `handleSlotOptionQuantityChange` might not accept a 4th argument (opt) to create the item if it doesn't exist in availableGroups!
// If fallbackGIdx is not in availableGroups, `handleSlotOptionQuantityChange` will fail when doing `const grp = availableGroups[Number(groupIdx)];`
// Let's patch `handleSlotOptionQuantityChange` to support synthetic options
const handleSlotChangeRegex = /if \(updatedList\.length === 0\) \{\s*const grp = availableGroups\[Number\(groupIdx\)\];\s*if \(grp && grp\.options\) \{[\s\S]*?\}\s*\}/;
const handleSlotChangePatch = `if (updatedList.length === 0) {
          const grp = typeof groupIdx === 'number' ? availableGroups[groupIdx] : null;
          if (grp && grp.options) {
            updatedList = grp.options.map((o: any) => ({ ...o, count: o.code === optionCode || o.id === optionCode ? Math.max(0, delta) : 0 }));
          } else if (arguments.length > 3) {
            // Synthetic option passed as 4th arg
            const syntheticOpt = arguments[3];
            updatedList = [{ ...syntheticOpt, count: Math.max(0, delta) }];
          }
        }`;
code = code.replace(handleSlotChangeRegex, handleSlotChangePatch);


fs.writeFileSync('src/components/MasterProductModal.tsx', code);
console.log('Reglas de Oro applied.');
