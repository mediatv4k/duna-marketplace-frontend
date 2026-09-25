const fs = require('fs');
let code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

const regex = /breakdown\.push\(`------- \$\{\(product\.name \|\| 'PEDIDO'\)\.toUpperCase\(\)\} -------`\);[\s\S]*?if \(exclusionsParts\.length === 0 && extrasParts\.length > 0\) \{\s*line \+= 'Con todo ' \+ allParts\.join\(' '\);\s*\} else \{\s*line \+= allParts\.join\(' '\);\s*\}\s*\}\s*breakdown\.push\(line\);\s*\}\);/;

const newLogic = `const comboSku = product.sku || product.code ? \` (\${product.sku || product.code})\` : '';
        breakdown.push(\`------- \${(product.name || 'PEDIDO').toUpperCase()}\${comboSku} -------\`);
        activeSlots.forEach((slot, idx) => {
            const slotTitle = slot.name?.trim() || '';
            const slotHeader = \`• #\${idx + 1}\${slotTitle ? \` (\${slotTitle})\` : ''}\`;
            const exclusionsParts: string[] = [];
            const extrasParts: string[] = [];
  
            if (slot.exclusions && slot.exclusions.length > 0) {
              slot.exclusions.forEach((ex: string) => {
                exclusionsParts.push(ex.toUpperCase().startsWith('SIN ') ? ex : \`Sin \${ex}\`);
              });
            }
  
            Object.values(slot.selectedVariants).forEach((sel: any) => {
              if (!sel) return;
              if (Array.isArray(sel)) {
                sel.forEach(item => {
                  if ((item.count || 0) > 0) {
                    if (/^sin\\b/i.test(String(item.name || '').trim())) {
                      exclusionsParts.push(String(item.name).trim());
                    } else {
                      const qtyPrefix = item.count > 1 ? \`\${item.count}x \` : '';
                      const skuPart = item.sku || item.code ? \`[\${item.sku || item.code}] \` : '';
                      const pricePart = item.price > 0 ? \` (+\$\${item.price.toFixed(2)})\` : '';
                      extrasParts.push(\`>> EXTRA: \${skuPart}\${qtyPrefix}\${item.name}\${pricePart}\`);
                    }
                  }
                });
              } else if (sel.name) {
                 const skuPart = sel.sku || sel.code ? \`[\${sel.sku || sel.code}] \` : '';
                 const pricePart = sel.price > 0 ? \` (+\$\${sel.price.toFixed(2)})\` : '';
                 extrasParts.push(\`>> EXTRA: \${skuPart}\${sel.name}\${pricePart}\`);
              }
            });
  
            let line = slotHeader + ': ';
            if (exclusionsParts.length === 0) {
              line += 'Con todo';
            } else {
              line += exclusionsParts.join(', ');
            }
            breakdown.push(line);
            
            if (extrasParts.length > 0) {
               extrasParts.forEach(extraLine => breakdown.push(\`  \${extraLine}\`));
            }
        });`;

if (regex.test(code)) {
  code = code.replace(regex, newLogic);
  fs.writeFileSync('src/components/MasterProductModal.tsx', code);
  console.log('Cart POS formatter updated');
} else {
  console.log('Regex failed');
}
