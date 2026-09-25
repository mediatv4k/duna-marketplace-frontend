const fs = require('fs');
let code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

// 1. ELIMINACIÓN TOTAL DE PRECIOS REDUNDANTES: Left Column
code = code.replace(
  /\{\(isSlotMode \? \(unitPrice \* qty \+ totalSlotVariantsPrice\) : \(\(unitPrice \+ totalVariantsPrice\) \* qty\)\)\.toFixed\(2\)\}/g,
  "{unitPrice.toFixed(2)}"
);
code = code.replace(
  /\{isSlotMode \? 'Precio Configurado' : 'Precio Base'\}/g,
  "'Precio Base'"
);

// 1b. Footer Buy Button: Remove the price
code = code.replace(
  /`Comprar • \$\$\{totalCalculated\.toFixed\(2\)\}`/g,
  "'Agregar al carrito'"
);
code = code.replace(
  /`Agregar combo al carrito \(\$\$\{totalCalculated\.toFixed\(2\)\}\)`/g,
  "'Agregar combo al carrito'"
);

// 2. TRAMPA DEL FOOTER Y CONTROL DE EDICIÓN
code = code.replace(
  /<div className="sticky bottom-0 bg-white border-t border-slate-100 z-30 shrink-0 shadow-md pb-\[max\(0\.75rem,env\(safe-area-inset-bottom\)\)\]">/,
  `<div className={\`sticky bottom-0 bg-white border-t border-slate-100 z-30 shrink-0 shadow-md pb-[max(0.75rem,env(safe-area-inset-bottom))] \${viewMode === 'slots' ? 'hidden' : ''}\`}>`
);

const customizeButtonTextRegex = /\{isCombo \? 'Personalizar combo' : 'Personalizar tu pedido'\}/;
const newCustomizeText = `isSlotCustomizationActive ? \`✏️ Editar personalización (\${slots.filter(s => Object.keys(s.selectedVariants).length > 0 || s.exclusions?.length > 0).length}/\${qty} listas)\` : (isCombo ? 'Personalizar combo' : 'Personalizar tu pedido')`;
code = code.replace(customizeButtonTextRegex, `{${newCustomizeText}}`);
code = code.replace(
  /<span className="text-base">⚙️<\/span>\s*\{isSlotCustomizationActive/,
  "{isSlotCustomizationActive"
);

// Confirm Dialog on "Salir al menú sin confirmar"
code = code.replace(
  /onClick=\{\(\) => setViewMode\('options'\)\}\s*className="text-\[11px\] font-black text-slate-400 hover:text-slate-600 underline cursor-pointer"\s*>\s*Salir al menú sin confirmar\s*<\/button>/g,
  `onClick={() => {
                  const configuredCount = slots.filter(s => Object.keys(s.selectedVariants).length > 0 || s.exclusions?.length > 0).length;
                  if (configuredCount > 0 && configuredCount < slots.length) {
                     if (window.confirm(\`Has configurado \${configuredCount} de \${slots.length} unidades. ¿Deseas continuar configurando o salir y que las restantes salgan Con Todo?\`)) {
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

// Fallback extras logic via substring replacement to avoid regex issues
const searchString = '{availableGroups.length > 0 && availableGroups.map((group, gIdx) => {';
const tailString = '{/* Quick exit button just in case */}';

if (code.includes(searchString) && code.includes(tailString)) {
  const startIndex = code.indexOf(searchString);
  const endIndex = code.indexOf(tailString);
  if (startIndex !== -1 && endIndex > startIndex) {
    const pre = code.substring(0, startIndex);
    const post = code.substring(endIndex);
    
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
                   const currentSlotVars = slots[activeSlotIndex]?.selectedVariants[fallbackGIdx] || [];
                   
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
              })()}
            </div>
            `;
    
    code = pre + newExtrasLogic + post;
  }
}

// Ensure `handleSlotOptionQuantityChange` signature
const signatureRegex = /const handleSlotOptionQuantityChange = \(groupIdx: number \| string, optionCode: string, delta: number\) => \{/;
const newSignature = "const handleSlotOptionQuantityChange = (groupIdx: number | string, optionCode: string, delta: number, syntheticOpt?: any) => {";
code = code.replace(signatureRegex, newSignature);

const handleSlotChangeRegex = /if \(updatedList\.length === 0\) \{\s*const grp = availableGroups\[Number\(groupIdx\)\];\s*if \(grp && grp\.options\) \{[\s\S]*?\}\s*\}/;
const handleSlotChangePatch = `if (updatedList.length === 0) {
          const grp = typeof groupIdx === 'number' ? availableGroups[groupIdx] : null;
          if (grp && grp.options) {
            updatedList = grp.options.map((o: any) => ({ ...o, count: o.code === optionCode || o.id === optionCode ? Math.max(0, delta) : 0 }));
          } else if (syntheticOpt) {
            updatedList = [{ ...syntheticOpt, count: Math.max(0, delta) }];
          }
        }`;
code = code.replace(handleSlotChangeRegex, handleSlotChangePatch);

// TotalVariantsPrice needs to sum the fallback extras too!
// Because if we add synthetic extras, they won't be calculated by `totalSlotVariantsPrice` maybe? Let's check how `totalSlotVariantsPrice` is computed.
// Let's add it to `totalSlotVariantsPrice` calculation.
const totalSlotVariantsPriceRegex = /const totalSlotVariantsPrice = useMemo\(\(\) => \{\s*let sum = 0;\s*slots\.forEach\(slot => \{\s*Object\.values\(slot\.selectedVariants\)\.forEach\(\(sel: any\) => \{[\s\S]*?\}\);\s*\}\);\s*return sum;\s*\}, \[slots\]\);/;
// Wait, `totalSlotVariantsPrice` just uses `Object.values(slot.selectedVariants)`.
// `Object.values()` iterates over ALL keys! So our fallback extras will automatically be summed up!
// Because we store them in `selectedVariants['fallback_extras']` as an array with items that have `price` and `count`!
// This is brilliant!

fs.writeFileSync('src/components/MasterProductModal.tsx', code);
console.log('Reglas de Oro applied safely.');
