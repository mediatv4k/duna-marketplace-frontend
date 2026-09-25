const fs = require('fs');
let code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

const searchRegex = /if \(viewMode === 'comboRoom' && comboRoomData\) \{[\s\S]*?comboRoomData\.participants\.forEach\(\(p: any\) => \{[\s\S]*?breakdown\.push\(`\$\{p\.name\} \(\$\{p\.unitsCount\}x\): \$\{participantParts\.join\(\', \'\)\}`\);\s*\}\);/;

const newLogic = `if (viewMode === 'comboRoom' && comboRoomData) {
        let totalCartPrice = 0;
        breakdown.push(\`------- PEDIDO ENTRE PANAS: \${comboRoomData.productName.toUpperCase()} -------\`);
        
        comboRoomData.participants.forEach((p: any) => {
          totalCartPrice += p.subtotalUsd;
          breakdown.push(\`• \${String(p.name || 'INVITADO').toUpperCase()} (\${p.unitsCount} Unidades)\`);
          
          if (p.exclusions && p.exclusions.length > 0) {
            p.exclusions.forEach((e: string) => {
              breakdown.push(\`  - \${e.toUpperCase().startsWith('SIN ') ? e : \`Sin \${e}\`}\`);
            });
          }
          
          let hasExtras = false;
          Object.values(p.selectedVariants || {}).forEach((sel: any) => {
             if (Array.isArray(sel)) {
               sel.forEach((item: any) => {
                 if ((item.count || 0) > 0) {
                    breakdown.push(\`  - \${item.count > 1 ? item.count + 'x ' : ''}\${item.name}\`);
                    hasExtras = true;
                 }
               });
             } else if (sel.name) {
               breakdown.push(\`  - \${sel.name}\`);
               hasExtras = true;
             }
          });
          
          if ((!p.exclusions || p.exclusions.length === 0) && !hasExtras) {
            breakdown.push(\`  - Sale con todo\`);
          }
        });`;

if (searchRegex.test(code)) {
  code = code.replace(searchRegex, newLogic);
  fs.writeFileSync('src/components/MasterProductModal.tsx', code);
  console.log('MasterProductModal combo room format replaced');
} else {
  console.log('Regex not found');
}
