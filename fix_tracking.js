const fs = require('fs');
let code = fs.readFileSync('src/components/OrderTrackingModal.tsx', 'utf8');
code = code.split('className="text-center text-slate-500 truncate"').join('className="text-center text-slate-500 whitespace-pre-wrap break-words"');
fs.writeFileSync('src/components/OrderTrackingModal.tsx', code);
console.log('Done replacement');
