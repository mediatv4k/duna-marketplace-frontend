const fs = require('fs');
let code = fs.readFileSync('src/components/OrderTrackingModal.tsx', 'utf8');

// Fix the price span: was w-16, needs min-w-[70px] and +$ prefix
const oldSpan = `<span className="text-right shrink-0 w-16 font-medium text-slate-700">
                                            {ext.price > 0 ? \`+\${ext.price.toFixed(2)}\` : ''}
                                          </span>`;

const newSpan = `<span className="text-right shrink-0 min-w-[70px] font-medium text-slate-700 tabular-nums">
                                            {ext.price > 0 ? \`+\$\${ext.price.toFixed(2)}\` : ''}
                                          </span>`;

if (code.includes(oldSpan)) {
  code = code.replace(oldSpan, newSpan);
  fs.writeFileSync('src/components/OrderTrackingModal.tsx', code);
  console.log('Price span fixed');
} else {
  // Try with existing format
  const altOld = code.match(/text-right shrink-0 w-16 font-medium text-slate-700/);
  console.log('Alt search:', altOld ? 'found' : 'not found');
  
  // Brute-force fix
  code = code.replace(/className="text-right shrink-0 w-16 font-medium text-slate-700"/g, 
    'className="text-right shrink-0 min-w-[70px] font-medium text-slate-700 tabular-nums"');
  
  // Fix the price rendering to ensure +$ prefix
  code = code.replace(/ext\.price > 0 \? `\+\$\{ext\.price\.toFixed\(2\)\}` : ''/g,
    'ext.price > 0 ? `+$${ext.price.toFixed(2)}` : \'\'');
  
  fs.writeFileSync('src/components/OrderTrackingModal.tsx', code);
  console.log('Brute-force fix applied');
}
