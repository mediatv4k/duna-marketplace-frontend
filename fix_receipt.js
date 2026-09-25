const fs = require('fs');
let code = fs.readFileSync('src/components/OrderTrackingModal.tsx', 'utf8');

const searchRegex = /\{activeTab === 'RECEIPT' && \([\s\S]*?\{currentItems\.length > 0 \? \(\s*currentItems\.map\(\(item: any, idx: number\) => \{\s*const qty = item\.qty \|\| item\.quantity \|\| 1;\s*const price = item\.price \|\| 0;\s*const itemTotal = price \* qty;\s*const variantRows = getItemBreakdownRows\(item\);[\s\S]*?return \(\s*<div key=\{item\.cartItemId \|\| item\.code \|\| idx\} className="flex justify-between gap-2 font-bold">\s*<span className="truncate">\{qty\} \{item\.name\}<\/span>\s*<span className="shrink-0">\{itemTotal\.toFixed\(2\)\}<\/span>\s*<\/div>\s*\);\s*\}\)\s*\) : \(/;

const newLogic = `{activeTab === 'RECEIPT' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                      <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comercio</h4>
                          <p className="font-black text-slate-900 text-sm">{displayMerchant}</p>
                        </div>
                        <div className="text-right">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Orden</h4>
                          <p className="font-black text-[#fe6712] text-sm">#{displayId}</p>
                        </div>
                      </div>
  
                      <p className="text-[9px] text-slate-400 italic leading-tight">
                        Este documento es una Comanda / Orden de Compra interna y no constituye factura fiscal.
                      </p>
  
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <p className="truncate"><strong>Entrega:</strong> {displayAddress}</p>
                      </div>
  
                      {displayPhone && (
                        <p className="text-xs text-slate-600"><strong>Teléfono:</strong> {displayPhone}</p>
                      )}
  
                      <div className={\`flex items-center gap-2 text-xs p-2.5 rounded-xl border \${isPaymentVerified ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-amber-700 bg-amber-50 border-amber-100'}\`}>
                        <DollarSign className={\`w-4 h-4 shrink-0 \${isPaymentVerified ? 'text-emerald-600' : 'text-amber-600'}\`} />
                        <p><strong>{isPaymentVerified ? 'Pago verificado exitosamente' : 'Pago en verificación'}:</strong> {orderData?.metodoPago === 'efectivo' ? 'Efectivo en Entrega' : 'Pago Móvil'}</p>
                      </div>
                    </div>
  
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm font-mono text-[11px] text-slate-900">
                      <h4 className="font-black flex items-center gap-2 mb-2 text-xs uppercase">
                        <FileText className="w-4 h-4 text-[#fe6712]" /> Resumen de Compra
                      </h4>
  
                      <p className="text-slate-300 select-none overflow-hidden whitespace-nowrap my-1">{DIVIDER}</p>
  
                      <div className="space-y-3">
                        {currentItems.length > 0 ? (
                          currentItems.map((item: any, idx: number) => {
                            const qty = item.qty || item.quantity || 1;
                            const price = item.price || 0;
                            const itemTotal = price * qty;
                            
                            // Parse financial extras directly from breakdown to maintain participant context
                            const financialExtras: { name: string, participant: string, price: number }[] = [];
                            let currentParticipant = '';
                            
                            const rawLines = Array.isArray(item.breakdown) ? item.breakdown : [];
                            rawLines.forEach(line => {
                              const trimmed = line.trim();
                              
                              // Check for participant name header (e.g. "• OMAR (1 Unidades)" or "• #1 (Omar):")
                              let pMatch = trimmed.match(/^•\s*(?:#\d+)?\s*\(([^)]+)\)/i);
                              if (!pMatch) pMatch = trimmed.match(/^•\s*([^(]+?)\s*\(\d+\s*Unidades\)/i);
                              
                              if (pMatch) {
                                currentParticipant = pMatch[1].trim();
                                return;
                              }
                              
                              // Exclude non-financial kitchen prep instructions
                              if (/sin\b/i.test(trimmed) || /sale con todo/i.test(trimmed)) return;
                              
                              // Extract price and clean name if it's an extra
                              const priceMatch = trimmed.match(/\\(\\+\\$([0-9.]+)\\)/);
                              if (priceMatch || trimmed.includes('>> EXTRA:')) {
                                const extPrice = priceMatch ? Number(priceMatch[1]) : 0;
                                let cleanedName = trimmed
                                  .replace(/>>\\s*EXTRA:\\s*/i, '') // remove >> EXTRA:
                                  .replace(/\\[.*?\\]\\s*/, '')      // remove [SKU]
                                  .replace(/\\(\\+\\$[0-9.]+\\)/, '') // remove (+$X.XX)
                                  .replace(/^- /, '')             // remove leading dash
                                  .trim();
                                
                                if (extPrice > 0 || cleanedName.length > 0) {
                                  financialExtras.push({ name: cleanedName, participant: currentParticipant, price: extPrice });
                                }
                              }
                            });
                            
                            // Fallback to item.variants if no string-based extras found
                            if (financialExtras.length === 0 && Array.isArray(item.variants)) {
                              item.variants.forEach((g: any) => {
                                if (g.selected) {
                                  const extPrice = Number(g.selected.unitPrice || 0);
                                  if (extPrice > 0) {
                                    financialExtras.push({ name: g.selected.title || g.selected.name || g.name || 'Opción', participant: '', price: extPrice });
                                  }
                                } else if (Array.isArray(g.items)) {
                                  g.items.forEach((it: any) => {
                                    const extPrice = Number(it.unitPrice || it.price || 0);
                                    if (extPrice > 0) {
                                      const qtyStr = it.quantity > 1 ? \`\${it.quantity}x \` : '';
                                      financialExtras.push({ name: qtyStr + (it.title || it.name || 'Opción'), participant: '', price: extPrice });
                                    }
                                  });
                                }
                              });
                            }
  
                            return (
                              <div key={item.cartItemId || item.code || idx} className="w-full">
                                <div className="flex justify-between items-start font-bold">
                                  <span>{qty}x {String(item.name || '').toUpperCase()}</span>
                                  <span className="shrink-0">{itemTotal.toFixed(2)}</span>
                                </div>
                                {financialExtras.length > 0 && (
                                  <div className="mt-1 space-y-1">
                                    {financialExtras.map((ext, eIdx) => (
                                      <div key={eIdx} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center text-[10px] text-slate-600 pl-4">
                                        <span className="truncate">{ext.name}</span>
                                        <span className="italic text-slate-400 truncate max-w-[80px]">{ext.participant ? \`(\${ext.participant})\` : ''}</span>
                                        <span className="text-right tabular-nums whitespace-nowrap min-w-[50px]">{ext.price > 0 ? \`+$ \${ext.price.toFixed(2)}\` : ''}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (`;

if (searchRegex.test(code)) {
  code = code.replace(searchRegex, newLogic);
  fs.writeFileSync('src/components/OrderTrackingModal.tsx', code);
  console.log('RECEIPT render logic replaced');
} else {
  console.log('Regex not found');
}
