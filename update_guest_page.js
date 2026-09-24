const fs = require('fs');
let code = fs.readFileSync('src/app/combo/[id]/page.tsx', 'utf8');

// 1. Add import for bcvRate
if (!code.includes('import { getBCVRate }')) {
  code = code.replace(
    /import \{ getProduct \} from '@\/services\/marketplaceService';/,
    `import { getProduct } from '@/services/marketplaceService';\nimport { getBCVRate } from '@/lib/bcvRate';`
  );
}

// 2. Add paymentMode to ComboRoomData
code = code.replace(
  /claimedUnits: number;/,
  `claimedUnits: number;\n  paymentMode: 'split' | 'host_pays';`
);

// 3. Add state and effect for bcvRate
code = code.replace(
  /const \[myClaim, setMyClaim\] = useState<ParticipantClaim \| null>\(null\);/,
  `const [myClaim, setMyClaim] = useState<ParticipantClaim | null>(null);\n  const [bcvRate, setBcvRate] = useState<number | null>(null);`
);

const useEffectRegex = /useEffect\(\(\) => \{\n\s*fetchRoom\(\);\n\s*\}, \[fetchRoom\]\);/;
if (code.match(useEffectRegex)) {
  code = code.replace(
    useEffectRegex,
    `useEffect(() => {\n    fetchRoom();\n    getBCVRate().then(setBcvRate);\n  }, [fetchRoom]);`
  );
}

// 4. Update phase === 'done' rendering
// We need to replace the entire 'done' block
const doneRegex = /if \(phase === 'done' && myClaim\) \{[\s\S]*?return null;\n\}/;

const newDoneBlock = `if (phase === 'done' && myClaim) {
    if (room.paymentMode === 'host_pays') {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-8 shadow-xl max-w-sm w-full space-y-6 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-3xl">🎉</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">¡Listo, {guestName}!</h2>
              <p className="text-sm text-slate-500 mt-2">Tus {myClaim.unitsCount} unidades ya fueron confirmadas y agregadas a la orden. ¡Buen provecho!</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-sm w-full space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">¡Listo, {guestName}!</h2>
              <p className="text-sm text-slate-500 mt-1">El anfitrión ha recibido tu pedido.</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-200">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Tu Ticket</p>
              <p className="text-sm font-black text-slate-800">{myClaim.unitsCount}x {room.productName}</p>
              {myClaim.exclusions.length > 0 ? (
                <p className="text-xs text-red-500 font-bold mt-1.5">Sin: {myClaim.exclusions.join(', ')}</p>
              ) : (
                <p className="text-xs text-emerald-600 font-bold mt-1.5">Con Todo</p>
              )}
            </div>
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 uppercase">Total a pagar:</span>
              <div className="text-right">
                <p className="text-lg font-black text-slate-900">\${myClaim.subtotalUsd.toFixed(2)}</p>
                {bcvRate && <p className="text-[10px] font-bold text-slate-500">Bs. {(myClaim.subtotalUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              const msg = \`¡Epale! Ya armé mis \${myClaim.unitsCount} unidades. Mi parte son $\${myClaim.subtotalUsd.toFixed(2)}\` + (bcvRate ? \` (Bs. \${(myClaim.subtotalUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}).\` : '.');
              window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(msg), '_blank');
            }}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-md cursor-pointer"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Avisar al Anfitrión por WhatsApp
          </button>
        </div>
      </div>
    );
  }

  return null;
}`;

code = code.replace(doneRegex, newDoneBlock);

// 5. Update formatting of exclusions ("Sin SIN..." fix)
code = code.replace(
  /Sin: \{myClaim\.exclusions\.join\(\', \'\)\}/g,
  `{myClaim.exclusions.map(e => e.toUpperCase().startsWith('SIN ') ? e : 'Sin ' + e).join(', ')}`
);

code = code.replace(
  /Sin: \{guestExclusions\.join\(\', \'\)\}/g,
  `{guestExclusions.map(e => e.toUpperCase().startsWith('SIN ') ? e : 'Sin ' + e).join(', ')}`
);

fs.writeFileSync('src/app/combo/[id]/page.tsx', code);
console.log('Guest page updated');
