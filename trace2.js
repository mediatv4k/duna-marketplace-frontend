const fs = require('fs');
const code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

const targetIdx = code.indexOf('</div>\\n    </div>\\n  );\\n}');
const sub = code.substring(0, targetIdx);

let p = 0;
let lastP = -1;
let inString = false;
let stringChar = '';
for(let i=0; i<sub.length; i++) {
  const c = sub[i];
  if(inString) {
    if(c === stringChar && sub[i-1] !== '\\\\') inString = false;
  } else {
    if(c === '"' || c === "'" || c === '\`') { inString = true; stringChar = c; }
    else if(c === '(') { p++; lastP = i; }
    else if(c === ')') { p--; }
  }
}
console.log('p=' + p + ' last unclosed at ' + lastP);
if (lastP !== -1) console.log(sub.substring(Math.max(0, lastP - 100), lastP + 100));
