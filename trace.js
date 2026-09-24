const fs = require('fs');
const code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

const lines = code.split('\n');

let p = 0;
let b = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '(') p++;
    if (line[j] === ')') p--;
    if (line[j] === '{') b++;
    if (line[j] === '}') b--;
  }
  
  if (p > 0 && p > 3) { // usually shouldn't be nested deep outside of functions
    // console.log(`Line ${i}: p=${p}, b=${b}`);
  }
}
console.log('Final counts:', { p, b });
