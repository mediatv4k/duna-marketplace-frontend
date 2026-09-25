const fs = require('fs');
let code = fs.readFileSync('src/components/OrderTrackingModal.tsx', 'utf8');

code = code.replace(/rawLines\.forEach\(line => \{/g, 'rawLines.forEach((line: string) => {');

fs.writeFileSync('src/components/OrderTrackingModal.tsx', code);
console.log('Fixed type error');
