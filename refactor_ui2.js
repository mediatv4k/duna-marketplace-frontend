const fs = require('fs');
const file = 'src/components/MasterProductModal.tsx';
let code = fs.readFileSync(file, 'utf8');

// The global variants block starts exactly like this:
const oldVariantsBlock = `      {!isSlotMode && availableGroups.map((group: any, gIdx: number) => (`;
const newVariantsBlock = `      {viewMode === 'options' && (
        <div className="space-y-3 pb-3 border-b border-gray-100">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">¿Cómo deseas pedir este combo?</h4>
          
          <button
            onClick={() => {
              availableGroups.forEach((g: any, gIndex: number) => {
                const min = g.minItems ?? g.min ?? (g.required ? 1 : 0);
                if (min > 0 && g.options?.length > 0) {
                  if (g.selectType === 'SINGLE') {
                    handleGlobalSingleSelect(gIndex, g.options[0].code || g.options[0].id);
                  } else {
                    handleGlobalOptionQuantityChange(gIndex, g.options[0].code || g.options[0].id, min);
                  }
                }
              });
              handleAddToCart();
            }}
            className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-black py-4 px-4 rounded-xl text-sm transition text-left flex items-center justify-between group cursor-pointer"
          >
            <div>
              <span className="block">🚀 Pedir combo estándar</span>
              <span className="text-[11px] text-slate-500 font-medium">Sale con todo, rápido y directo.</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
          </button>

          <button
            onClick={createComboRoom}
            className="w-full bg-[#FE6712] hover:bg-[#E05509] text-white font-black py-4 px-4 rounded-xl text-sm transition text-left flex items-center justify-between shadow-md cursor-pointer"
          >
            <div>
              <span className="block">👥 Iniciar Pedido entre panas</span>
              <span className="text-[11px] text-orange-100 font-medium">Arma el combo con tus amigos por WhatsApp.</span>
            </div>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>

          <button
            onClick={() => setViewMode('customize')}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-black py-4 px-4 rounded-xl text-sm transition text-left flex items-center justify-between group cursor-pointer"
          >
            <div>
              <span className="block">⚙️ Personalizar en esta pantalla</span>
              <span className="text-[11px] text-slate-500 font-medium">Ajusta ingredientes y sabores a tu gusto.</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
          </button>
        </div>
      )}

      {viewMode === 'comboRoom' && comboRoomData && (
        <div className="pb-4 border-b border-gray-100 space-y-4">
          <div className="bg-orange-50/50 border border-orange-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Monitor en Vivo</h4>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FE6712] animate-pulse"></span>
                <span className="text-[10px] font-bold text-orange-700">En curso</span>
              </div>
            </div>
            
            <div className="space-y-1 mb-4">
              <div className="flex justify-between text-[11px] font-bold text-slate-700">
                <span>Progreso del pozo</span>
                <span>{comboRoomData.claimedUnits} / {comboRoomData.totalUnits} u</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#FE6712] transition-all" style={{ width: \`\${(comboRoomData.claimedUnits / comboRoomData.totalUnits) * 100}%\` }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase">Participantes</p>
              {comboRoomData.participants.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{p.name} {p.isHost && '(Anfitrión)'}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{p.unitsCount}x unidades · {p.exclusions.length > 0 ? \`Sin \${p.exclusions.join(', ')}\` : 'Con Todo'}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-xs font-black text-slate-900">$\${p.subtotalUsd.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-orange-200/60">
              <p className="text-xs text-slate-600 font-medium text-center mb-2">Envía el link a tus panas para que se sumen</p>
              <button
                onClick={handleCopyComboLink}
                className="w-full bg-white hover:bg-orange-100 border border-orange-300 text-orange-700 font-black py-2.5 px-4 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                {comboCopied ? '¡Link copiado!' : 'Copiar Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {(!isCombo || viewMode === 'customize') && availableGroups.map((group: any, gIdx: number) => (`

code = code.replace(oldVariantsBlock, newVariantsBlock);

// Finally, we must REMOVE the old "Panel Colaborativo" from the footer so it doesn't double render or cause TS errors on `comboRoomSlots`.
// The old panel started with `{(false) && (` or `{hasVariants && showComboPanel && comboRoomId && (`
const oldPanelStart = `          {/* ── Panel Colaborativo (visible cuando la sala está activa) ───── */}`;
const startIdx = code.indexOf(oldPanelStart);
if (startIdx !== -1) {
    const endStr = `          <div className="flex flex-col gap-2 flex-1 items-end">`;
    const endIdx = code.indexOf(endStr, startIdx);
    if (endIdx !== -1) {
        code = code.substring(0, startIdx) + endStr + code.substring(endIdx + endStr.length);
    }
}

// We also need to fix a small issue: the footer "Agregar combo al carrito" button relies on `showComboPanel` and `comboAllDone`.
code = code.replace(
  `{showComboPanel && !comboAllDone`,
  `{viewMode === 'comboRoom' && !comboAllDone`
);
code = code.replace(
  `: (showComboPanel && comboAllDone)`,
  `: (viewMode === 'comboRoom' && comboAllDone)`
);
code = code.replace(
  `isMinimumsMet && !(showComboPanel && !comboAllDone)`,
  `isMinimumsMet && !(viewMode === 'comboRoom' && !comboAllDone)`
);
code = code.replace(
  `disabled={!isMinimumsMet || (showComboPanel && !comboAllDone)}`,
  `disabled={!isMinimumsMet || (viewMode === 'comboRoom' && !comboAllDone)}`
);
code = code.replace(
  `!(showComboPanel && !comboAllDone) ? 'text-white'`,
  `!(viewMode === 'comboRoom' && !comboAllDone) ? 'text-white'`
);

// Remove the `hasVariants && step === 1 && !showComboPanel` button (Armar con amigos) because we moved it to the top!
const oldButtonStart = `{hasVariants && step === 1 && !showComboPanel && (`;
const btnStartIdx = code.indexOf(oldButtonStart);
if (btnStartIdx !== -1) {
    const btnEndStr = `                <div className="flex flex-col gap-2 flex-1 items-end">`;
    // We already passed this in the structure. Let's just find the closing tag of that block.
    // It's easier to just use string replace:
    code = code.replace(`{hasVariants && step === 1 && !showComboPanel && (`, `{(false) && (`);
}

fs.writeFileSync(file, code);
console.log("Refactored UI");
