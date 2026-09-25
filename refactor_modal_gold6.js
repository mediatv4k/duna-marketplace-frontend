const fs = require('fs');

// 1. CartModal.tsx
let cm = fs.readFileSync('src/components/CartModal.tsx', 'utf8');
cm = cm.replace(
  /<span className="truncate max-w-\[120px\]">\{b\}<\/span>/g,
  '<span className="whitespace-normal break-words">{b}</span>'
);
// Also modify the wrapper paragraph to have whitespace-pre-wrap if it uses spaces for indentation
cm = cm.replace(
  /className="text-\[8\.5px\] font-semibold text-slate-400 flex items-center gap-0\.5 leading-none"/g,
  'className="text-[9px] font-semibold text-slate-500 whitespace-pre-wrap break-words leading-tight"'
);
fs.writeFileSync('src/components/CartModal.tsx', cm);

// 2. MerchantTemplateEngine.tsx
let mte = fs.readFileSync('src/components/MerchantTemplateEngine.tsx', 'utf8');
mte = mte.replace(
  /<p className="truncate text-\[10px\] font-medium text-slate-400">\{item\.breakdown\[0\]\}<\/p>/g,
  '<p className="text-[10px] font-medium text-slate-400 whitespace-pre-wrap break-words">{item.breakdown.join(\'\\n\')}</p>'
);
fs.writeFileSync('src/components/MerchantTemplateEngine.tsx', mte);

console.log('Cart text truncation removed');
