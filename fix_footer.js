const fs = require('fs');
let code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

const regex = /<div className="sticky bottom-0 bg-white border-t border-slate-100 z-30 shrink-0 shadow-md pb-\[max\(0\.75rem,env\(safe-area-inset-bottom\)\)\]">/;

code = code.replace(regex, `{(viewMode === 'customize' || viewMode === 'comboRoom') && (
        <div className="sticky bottom-0 bg-white border-t border-slate-100 z-30 shrink-0 shadow-md pb-[max(0.75rem,env(safe-area-inset-bottom))]">`);

// Close the conditional block before the final closing divs
code = code.replace(
  /                  <\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/g,
  `                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>

      </div>
    </div>
  );
}`
);

fs.writeFileSync('src/components/MasterProductModal.tsx', code);
console.log('Fixed sticky footer');
