const fs = require('fs');
let code = fs.readFileSync('src/app/api/combo/[id]/route.ts', 'utf8');

code = code.replace(
  /hostExclusions,?\r?\n\s*}\s*=\s*body;/,
  `hostExclusions,\n        paymentMode = 'split',\n      } = body;`
);

code = code.replace(
  /claimedUnits:\s*hostClaim\.unitsCount,?\r?\n\s*participants:\s*\[hostClaim\],?/,
  `claimedUnits: hostClaim.unitsCount,\n        paymentMode,\n        participants: [hostClaim],`
);

fs.writeFileSync('src/app/api/combo/[id]/route.ts', code);
console.log('API route updated');
