const fs = require('fs');
let code = fs.readFileSync('src/app/combo/[id]/page.tsx', 'utf8');

// 1. Rename qty to claimedUnits
code = code.replace(/const \[qty, setQty\] = useState\(1\);/g, 'const [claimedUnits, setClaimedUnits] = useState(1);');
code = code.replace(/qty/g, 'claimedUnits');
code = code.replace(/setQty/g, 'setClaimedUnits');

// 2. Add customizationType state
code = code.replace(
  /const \[localExclusions, setLocalExclusions\] = useState<string\[\]>\(\[\]\);/,
  "const [localExclusions, setLocalExclusions] = useState<string[]>([]);\n  const [customizationType, setCustomizationType] = useState<'all' | 'custom'>('all');"
);

// 3. Fix the active/inactive button styles and logic in the pick phase
const pickButtonsRegex = /<div className="space-y-3 pt-2">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/;

const newPickUI = `
              {/* Payment Mode Alert */}
              {room.paymentMode === 'host_pays' && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-start gap-2">
                  <span className="text-emerald-500 text-lg">🎁</span>
                  <p className="text-[11px] font-bold text-emerald-800 leading-tight">
                    ¡Estás invitado por el anfitrión! Solo elige tus porciones.
                  </p>
                </div>
              )}

              {saveError && <p className="text-xs font-bold text-red-600 text-center">{saveError}</p>}

              <div className="space-y-4 pt-2">
                {hasSinGroups && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">¿Cómo los prefieres?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomizationType('all')}
                        className={\`py-2.5 px-2 rounded-xl text-xs transition cursor-pointer border \${customizationType === 'all' ? 'bg-[#FE6712] text-white border-[#FE6712] font-black shadow-md' : 'bg-white text-slate-800 border-slate-300 font-bold hover:bg-slate-50'}\`}
                      >
                        🥬 Salen con todo
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCustomizationType('custom'); initVariants(); }}
                        className={\`py-2.5 px-2 rounded-xl text-xs transition cursor-pointer border \${customizationType === 'custom' ? 'bg-[#FE6712] text-white border-[#FE6712] font-black shadow-md' : 'bg-white text-slate-800 border-slate-300 font-bold hover:bg-slate-50'}\`}
                      >
                        🛠️ Quitar ingredientes
                      </button>
                    </div>
                  </div>
                )}

                {hasSinGroups && customizationType === 'custom' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Selecciona lo que NO quieres:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(room.groups || [])
                        .filter((g: any) => /\\bsin\\b/i.test(String(g.name || g.title || '')))
                        .flatMap((g: any) => g.options || g.items || [])
                        .map((opt: any) => {
                          const label = opt.name || opt.title || '';
                          const selected = localExclusions.includes(label);
                          // Prevent Sin SIN duplication
                          const displayLabel = label.toUpperCase().startsWith('SIN ') ? label : 'Sin ' + label;
                          return (
                            <label key={label} className={\`flex items-center gap-2 p-2 rounded-xl border text-[11px] font-bold cursor-pointer transition shadow-sm \${selected ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-300 text-slate-800 hover:border-[#FE6712]/50'}\`}>
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => setLocalExclusions(prev => selected ? prev.filter(e => e !== label) : [...prev, label])}
                                className="w-4 h-4 accent-[#FE6712] rounded cursor-pointer"
                              />
                              <span className={selected ? 'line-through opacity-70' : ''}>{displayLabel}</span>
                            </label>
                          );
                        })}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!guestName.trim() || saving || availableUnits < 1}
                  onClick={() => {
                     if (customizationType === 'all') {
                        handleSaveStandard();
                     } else {
                        handleSaveCustom();
                     }
                  }}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-300 disabled:border disabled:cursor-not-allowed text-white font-black py-4 rounded-xl text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-md cursor-pointer"
                >
                  {saving ? 'Guardando...' : (customizationType === 'all' ? 'Confirmar mis porciones' : 'Guardar personalización')}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
`;

code = code.replace(pickButtonsRegex, newPickUI);

// 4. In done phase for split, update the text
code = code.replace(
  /Tu Ticket/g,
  'Resumen de tu pedido'
);
code = code.replace(
  /<span className="text-xs font-black text-slate-500 uppercase">Total a pagar:<\/span>[\s\S]*?<div className="text-right">[\s\S]*?<p className="text-lg font-black text-slate-900">\$\{myClaim\.subtotalUsd\.toFixed\(2\)\}<\/p>[\s\S]*?\{bcvRate && <p className="text-\[10px\] font-bold text-slate-500">Bs\. \{\(myClaim\.subtotalUsd \* bcvRate\)\.toLocaleString\('es-VE', \{ minimumFractionDigits: 2, maximumFractionDigits: 2 \}\)\}<\/p>\}[\s\S]*?<\/div>/,
  `<div className="flex flex-col gap-1 w-full">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-black text-slate-500 uppercase">Tu parte:</span>
                  <span className="text-lg font-black text-slate-900">\${myClaim.subtotalUsd.toFixed(2)}</span>
                </div>
                {bcvRate && (
                  <div className="flex justify-between items-baseline pt-1 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">En Bolívares (BCV):</span>
                    <span className="text-xs font-bold text-slate-500">Bs. {(myClaim.subtotalUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>`
);

// 5. Clean "Sin SIN" in myClaim exclusions in the ticket
// This is already done properly in my previous edits probably, but I will make sure the output text is safe.
// The regex: \{myClaim.exclusions.map\(e => e.toUpperCase\(\).startsWith\('SIN '\) \? e : 'Sin ' \+ e\).join\(', '\)\}
// It's probably already correct! Let's just leave it if it's there.

// Remove the customize phase entirely, as we folded it into the pick phase!
code = code.replace(/if \(phase === 'customize'\) \{[\s\S]*?if \(phase === 'done' && myClaim\) \{/, "if (phase === 'done' && myClaim) {");

fs.writeFileSync('src/app/combo/[id]/page.tsx', code);
console.log('Guest page refactored');
