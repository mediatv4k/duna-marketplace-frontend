const fs = require('fs');
let code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

code = code.replace(
  /\`Sin \$\{p\.exclusions\.join\(\', \'\)\}\`/g,
  `p.exclusions.map((e: string) => e.toUpperCase().startsWith('SIN ') ? e : 'Sin ' + e).join(', ')`
);

fs.writeFileSync('src/components/MasterProductModal.tsx', code);
console.log('Fixed monitor UI');
