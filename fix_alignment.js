const fs = require('fs');
let code = fs.readFileSync('src/components/OrderTrackingModal.tsx', 'utf8');

const oldRegex = /<div key=\{eIdx\} className="grid grid-cols-\[1fr_auto_auto\] gap-2 items-center text-\[10px\] text-slate-600 pl-4">[\s\S]*?<\/div>/g;

const newHTML = `<div key={eIdx} className="flex items-center justify-between text-xs font-mono py-0.5 text-slate-600 pl-4">
                                        <span className="text-left flex-1 truncate pr-2">
                                          {ext.name}
                                        </span>
                                        <span className="text-center shrink-0 w-24 text-slate-400 italic">
                                          {ext.participant ? \`(\${ext.participant})\` : ''}
                                        </span>
                                        <span className="text-right shrink-0 w-16 font-medium text-slate-700">
                                          {ext.price > 0 ? \`+\$\${ext.price.toFixed(2)}\` : ''}
                                        </span>
                                      </div>`;

if (code.match(oldRegex)) {
  code = code.replace(oldRegex, newHTML);
  fs.writeFileSync('src/components/OrderTrackingModal.tsx', code);
  console.log('Flex layout applied');
} else {
  console.log('Not found');
}
