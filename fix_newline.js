const fs = require('fs');
let code = fs.readFileSync('src/app/api/combo/[id]/route.ts', 'utf8');

code = code.replace(/claimedUnits: hostClaim\.unitsCount,\\n        paymentMode,/, 'claimedUnits: hostClaim.unitsCount,\n        paymentMode,');

fs.writeFileSync('src/app/api/combo/[id]/route.ts', code);
console.log('Fixed API route');
