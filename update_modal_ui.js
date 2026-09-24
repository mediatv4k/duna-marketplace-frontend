const fs = require('fs');
let code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

// The UI block to inject
const hostSetupBlock = `
      {viewMode === 'host_setup' && (
        <div className="space-y-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => setViewMode('options')} className="p-1.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Configurar Sala</h4>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <p className="text-xs font-black text-slate-800 uppercase mb-2">1. Tus propias unidades</p>
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-600">¿Cuántos son para ti?</span>
                <div className="flex items-center gap-3 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200">
                  <button onClick={() => setHostSetupUnits(Math.max(1, hostSetupUnits - 1))} className="w-5 h-5 flex items-center justify-center text-[#fe6712] hover:bg-orange-50 rounded transition cursor-pointer">
                    <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                  </button>
                  <span className="font-black text-xs w-4 text-center text-slate-900">{hostSetupUnits}</span>
                  <button onClick={() => setHostSetupUnits(Math.min((baseSlotCount > 1 ? baseSlotCount : 1) * qty, hostSetupUnits + 1))} className="w-5 h-5 flex items-center justify-center text-[#fe6712] hover:bg-orange-50 rounded transition cursor-pointer">
                    <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
              </div>
              
              {product.exclusions && product.exclusions.length > 0 && (
                <div className="mt-3 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Quitar Ingredientes (Opcional)</span>
                  <div className="grid grid-cols-2 gap-2">
                    {product.exclusions.map((exc: string) => (
                      <label key={exc} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer shadow-xs hover:border-[#fe6712] transition">
                        <input
                          type="checkbox"
                          checked={hostSetupExclusions.includes(exc)}
                          onChange={() => setHostSetupExclusions(prev => prev.includes(exc) ? prev.filter(i => i !== exc) : [...prev, exc])}
                          className="w-3.5 h-3.5 accent-[#fe6712] rounded cursor-pointer"
                        />
                        <span className="truncate">{exc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs font-black text-slate-800 uppercase mb-2">2. Modalidad de Pago</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => setHostPaymentMode('split')}
                  className={\`p-2.5 rounded-xl border text-left transition cursor-pointer flex gap-2 \${hostPaymentMode === 'split' ? 'bg-orange-50 border-[#fe6712] ring-1 ring-[#fe6712]' : 'bg-white border-slate-200 hover:border-slate-300'}\`}
                >
                  <span className="text-base">💵</span>
                  <div>
                    <span className={\`block text-xs font-black \${hostPaymentMode === 'split' ? 'text-slate-900' : 'text-slate-700'}\`}>Dividir cuenta</span>
                    <span className="text-[9px] font-medium text-slate-500">Muestra el monto exacto (Tipo Gringo).</span>
                  </div>
                </button>
                <button
                  onClick={() => setHostPaymentMode('host_pays')}
                  className={\`p-2.5 rounded-xl border text-left transition cursor-pointer flex gap-2 \${hostPaymentMode === 'host_pays' ? 'bg-orange-50 border-[#fe6712] ring-1 ring-[#fe6712]' : 'bg-white border-slate-200 hover:border-slate-300'}\`}
                >
                  <span className="text-base">🎁</span>
                  <div>
                    <span className={\`block text-xs font-black \${hostPaymentMode === 'host_pays' ? 'text-slate-900' : 'text-slate-700'}\`}>Yo invito (Brindis)</span>
                    <span className="text-[9px] font-medium text-slate-500">Oculta precios a los invitados.</span>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  createComboRoom().then(() => {
                    const hostUrl = window.location.origin + \`/combo/\${comboRoomId || 'new'}\`; // The real ID gets set after createComboRoom, but we can't await state. 
                    // Better to just let createComboRoom open whatsapp.
                  });
                }}
                disabled={comboCreating}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-3.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {comboCreating ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creando...</>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Crear Sala y Enviar a WhatsApp
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  /\{\s*viewMode === 'comboRoom' && comboRoomData && \(/,
  hostSetupBlock.trim() + "\n\n      {viewMode === 'comboRoom' && comboRoomData && ("
);

// We need to fix createComboRoom to open whatsapp AFTER room creation.
// Look at `setComboRoomData(data.room);`
const onRoomCreated = `
        const finalRoomId = data.room.id;
        setComboRoomId(finalRoomId);
        setComboRoomData(data.room);
        setShowComboPanel(true);
        setViewMode('comboRoom');
        
        // OPEN WHATSAPP
        const hostUrl = window.location.origin + '/combo/' + finalRoomId;
        const msg = "¡Pilas panas! Entren a este link para armar el combo en D'una: " + hostUrl;
        if (typeof window !== 'undefined') window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(msg), '_blank');
`;

code = code.replace(
  /const finalRoomId = data\.room\.id;\s*setComboRoomId\(finalRoomId\);\s*setComboRoomData\(data\.room\);\s*setShowComboPanel\(true\);\s*setViewMode\('comboRoom'\);/,
  onRoomCreated.trim()
);

// Fix "Sin SIN" in handleAddToCart in MasterProductModal
// In MasterProductModal, participantParts formatting
code = code.replace(
  /participantParts\.push\(\`Sin \$\{p\.exclusions\.join\(\', \'\)\}\`\);/g,
  `participantParts.push(p.exclusions.map((e: string) => e.toUpperCase().startsWith('SIN ') ? e : \`Sin \${e}\`).join(', '));`
);

code = code.replace(
  /breakdown\.push\(\`Firma D'una: Sin \$\{selectedExclusions\.join\(\', \'\)\}\`\);/g,
  `breakdown.push(\`Firma D'una: \${selectedExclusions.map(e => e.toUpperCase().startsWith('SIN ') ? e : 'Sin ' + e).join(', ')}\`);`
);


fs.writeFileSync('src/components/MasterProductModal.tsx', code);
console.log('UI injected');
