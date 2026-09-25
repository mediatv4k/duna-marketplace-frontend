const fs = require('fs');
let code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

// ── Fix 1: Replace old exit button with wide CTA footer ──
const oldExitBtn = code.indexOf('{/* Quick exit button just in case */}');
const closingDivAfterExit = code.indexOf('          </div>\r\n        ) : (', oldExitBtn);

if (oldExitBtn === -1 || closingDivAfterExit === -1) {
  console.log('Exit button markers not found:', oldExitBtn, closingDivAfterExit);
  // try LF fallback
  const closeDiv2 = code.indexOf('          </div>\n        ) : (', oldExitBtn);
  console.log('LF version:', closeDiv2);
} else {
  const beforeExit = code.substring(0, oldExitBtn);
  const afterExit = code.substring(closingDivAfterExit);

  const newBtn = `            {/* BOTÓN PRINCIPAL ANCHO — PIE DE LA PERSONALIZACIÓN */}
            <div className="pt-4 pb-6 px-1">
              {activeSlotIndex < slots.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveSlotIndex(Math.min(slots.length - 1, activeSlotIndex + 1))}
                  className="w-full bg-[#FE6712] hover:bg-[#E05509] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                >
                  <span>Continuar al perro {activeSlotIndex + 2} de {slots.length}</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setViewMode('options')}
                  className="w-full bg-[#FE6712] hover:bg-[#E05509] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <span>Listo, confirmar combo</span>
                </button>
              )}
            </div>
`;

  code = beforeExit + newBtn + afterExit;
  fs.writeFileSync('src/components/MasterProductModal.tsx', code);
  console.log('CTA footer replaced');
}

// ── Fix 2: Fix +$$ → +$ in cross-sell price ──
let code2 = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');
const old = '+$${(Number(opt.price) || 0).toFixed(2)}';
const newStr = '+${(Number(opt.price) || 0).toFixed(2)}';
if (code2.includes(old)) {
  code2 = code2.replace(old, newStr);
  fs.writeFileSync('src/components/MasterProductModal.tsx', code2);
  console.log('Double $$ fixed');
} else {
  console.log('Double $$ not found, checking alternatives...');
  // Check if it was already fixed
  if (code2.includes(newStr)) console.log('Already correct');
}
