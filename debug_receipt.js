const fs = require('fs');
let code = fs.readFileSync('src/components/OrderTrackingModal.tsx', 'utf8');

const searchStr = `const rawLines = Array.isArray(item.breakdown) ? item.breakdown : [];
                             rawLines.forEach((line: string) => {
                               const trimmed = line.trim();
                               
                               // Check for participant name header (e.g. "• OMAR (1 Unidades)" or "• #1 (Omar):")`;

if (!code.includes(searchStr)) {
  // Try to find what's actually in the file
  const idx = code.indexOf('rawLines.forEach((line: string)');
  if (idx > -1) {
    console.log('FOUND at index', idx);
    console.log(JSON.stringify(code.substring(idx - 200, idx + 500)));
  } else {
    console.log('NOT FOUND at all');
    console.log(JSON.stringify(code.substring(10000, 10500)));
  }
} else {
  console.log('FOUND exact match');
}
