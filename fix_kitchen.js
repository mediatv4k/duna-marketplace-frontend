const fs = require('fs');
let code = fs.readFileSync('src/components/OrderTrackingModal.tsx', 'utf8');

// The block to replace in activeTab === 'KITCHEN'
const searchRegex = /\{currentItems\.length > 0 \? \(\s*currentItems\.map\(\(item: any, idx: number\) => \{\s*const qty = item\.qty \|\| item\.quantity \|\| 1;\s*const price = item\.price \|\| 0;\s*const total = price \* qty;\s*const variantRows = getItemBreakdownRows\(item\);[\s\S]*?return \(\s*<div key=\{item\.cartItemId \|\| item\.code \|\| idx\} className="flex justify-between gap-2 font-bold">\s*<span className="truncate">\{qty\} \{item\.name\}<\/span>\s*<span className="shrink-0">\{total\.toFixed\(2\)\}<\/span>\s*<\/div>\s*\);\s*\}\)\s*\) : \(/;

const newLogic = `{currentItems.length > 0 ? (
                          currentItems.map((item: any, idx: number) => {
                            const qty = item.qty || item.quantity || 1;
                            const rawLines = Array.isArray(item.breakdown) ? item.breakdown : [];
                            
                            if (rawLines.length > 0) {
                              return (
                                <div key={item.cartItemId || item.code || idx} className="flex flex-col gap-1 w-full text-left font-mono border-b border-dashed border-slate-300 pb-2 mb-2">
                                  <p className="font-bold border-b border-dashed border-slate-200 pb-1 mb-1">
                                    {qty}x {String(item.name || '').toUpperCase()}
                                  </p>
                                  {rawLines.map((line: string, lIdx: number) => {
                                    const isParticipant = line.trim().startsWith('•');
                                    const isHeader = line.includes('-------');
                                    return (
                                      <div key={lIdx} className={\`w-full whitespace-pre-wrap break-words \${isParticipant ? 'font-bold mt-2 pt-2 border-t border-dotted border-slate-300' : 'pl-2'} \${isHeader ? 'text-center font-bold my-1' : ''}\`}>
                                        {line}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            }
                            return (
                              <div key={item.cartItemId || item.code || idx} className="flex flex-col gap-1 w-full text-left font-mono border-b border-dashed border-slate-300 pb-2 mb-2">
                                <p className="font-bold">
                                  {qty}x {String(item.name || '').toUpperCase()}
                                </p>
                              </div>
                            );
                          })
                        ) : (`;

if (searchRegex.test(code)) {
  code = code.replace(searchRegex, newLogic);
  fs.writeFileSync('src/components/OrderTrackingModal.tsx', code);
  console.log('KITCHEN render logic replaced');
} else {
  console.log('Regex not found');
}
