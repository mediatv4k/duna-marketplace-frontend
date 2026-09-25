const fs = require('fs');
let code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

const searchStr = `// Si no hay un grupo nativo de extras, inyectamos los estándar (Fallback)`;
const endStr = `return groupsRendered;`;

if (code.includes(searchStr) && code.includes(endStr)) {
  const start = code.indexOf(searchStr);
  const end = code.indexOf(endStr, start);
  const pre = code.substring(0, start);
  const post = code.substring(end);
  
  const newLogic = `// Si no hay un grupo nativo de extras, inyectamos productos reales del catálogo
                if (!hasExtrasGroup && storeCatalog && storeCatalog.length > 0) {
                   const keywords = ['papa', 'tequeño', 'tequeno', 'bebida', 'refresco', 'extra', 'adicional', 'acompañante'];
                   const realExtras = storeCatalog.filter((p: any) => {
                     if (p.id === product.id) return false; // anti-canibalismo
                     if (p.stock === 0 || p.outOfStock) return false;
                     const n = String(p.name || '').toLowerCase();
                     const c = String(p.category || '').toLowerCase();
                     const sub = String(p.internalCategory || p.subCategory || '').toLowerCase();
                     return keywords.some(k => n.includes(k) || c.includes(k) || sub.includes(k));
                   }).slice(0, 4); // Max 4
                   
                   if (realExtras.length > 0) {
                     const fallbackGIdx = 'fallback_extras';
                     const currentSlotVars = slots[activeSlotIndex]?.selectedVariants[fallbackGIdx] || [];
                     
                     groupsRendered.push(
                       <div key="fallback_extras" className="space-y-3 pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                          ¿Acompañamos esta unidad?
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {realExtras.map((opt: any) => {
                            const matched = Array.isArray(currentSlotVars)
                              ? currentSlotVars.find((i: any) => (i.code === opt.id || i.id === opt.id))
                              : null;
                            const isSelected = !!matched && (matched.count > 0);
                            
                            return (
                              <div key={opt.id} className={\`flex items-center gap-2 p-2 rounded-xl border transition cursor-pointer \${isSelected ? 'border-[#FE6712]/50 bg-[#fff5ed]' : 'border-slate-200 bg-white hover:border-[#FE6712]/30'}\`} onClick={() => {
                                   const delta = isSelected ? -1 : 1;
                                   handleSlotOptionQuantityChange(fallbackGIdx, opt.id, delta, { id: opt.id, name: opt.name, price: Number(opt.price) || 0, sku: opt.sku || opt.code || '' });
                                }}>
                                <img src={opt.image || opt.imageUrl || 'https://placehold.co/100x100?text=Extra'} alt={opt.name} className="w-11 h-11 rounded-lg object-cover bg-white border border-slate-100 p-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-bold text-slate-900 truncate">{opt.name}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    {opt.sku || opt.code ? <span className="text-[9px] font-bold text-slate-400">{(opt.sku || opt.code || '').substring(0, 8)}</span> : null}
                                    <span className="text-[10px] font-black text-orange-700">+\$\${(Number(opt.price) || 0).toFixed(2)}</span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className={\`shrink-0 h-7 px-2.5 rounded-lg text-[10px] font-bold flex items-center transition \${isSelected ? 'bg-[#FE6712]/10 text-[#FE6712]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}\`}
                                >
                                  {isSelected ? '✓ Agregado' : '+ Agregar'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                     );
                   }
                }
                
                `;
  code = pre + newLogic + post;
  fs.writeFileSync('src/components/MasterProductModal.tsx', code);
  console.log('Done!');
} else {
  console.log('Not found');
}
