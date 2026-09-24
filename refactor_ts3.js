const fs = require('fs');
const file = 'src/components/MasterProductModal.tsx';
let code = fs.readFileSync(file, 'utf8');

// Fix handleGlobalOptionCount -> handleGlobalOptionQuantityChange
code = code.replace(/handleGlobalOptionCount\(/g, 'handleGlobalOptionQuantityChange(');

// Fix guestName inside slots
code = code.replace(/const slotTitle = slot\.guestName\?\.trim\(\) \|\| slot\.name\?\.trim\(\) \|\| '';/g, `const slotTitle = slot.name?.trim() || '';`);

// Delete the remnant block entirely. Let's just find `({([]).filter(s => !!s.completedAt).length}/{([]).length} listos` and delete up to `</div>`
const regex = /\{\(\[\]\)\.filter\(s => !!s\.completedAt\)[\s\S]*?\{hasVariants && step === 1 && !showComboPanel/g;
code = code.replace(regex, '{hasVariants && step === 1 && !showComboPanel');

// Wait, the regex might be brittle. Let's use string operations:
const startStr = `{([])`;
let lines = code.split('\n');
let filteredLines = [];
let skip = false;
for (let line of lines) {
    if (line.includes('{hasVariants && step === 1 && !showComboPanel && (')) {
        skip = false;
    }
    if (line.includes('{([]).filter(s => !!s.completedAt).length}/{([]).length} listos')) {
        // we're in the middle of it.
        // remove the last 15 lines just to be safe
        for (let i=0; i<15; i++) {
           let last = filteredLines.pop();
           if (last.includes('Combo en Vivo')) break; // safety
        }
        skip = true;
    }
    
    if (!skip) {
        filteredLines.push(line);
    }
}
code = filteredLines.join('\n');

// Try another way to strip the dead code if the above failed
code = code.replace(/<span className={`text-\[10px\] font-black px-2 py-0\.5 rounded-full border \$\{comboAllDone \? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'\}`}>[\s\S]*?\{\(\[\]\)\.filter\(s => !!s\.completedAt\)\.length\}\/\{\(\[\]\)\.length\} listos[\s\S]*?<\/span>[\s\S]*?<\/div>[\s\S]*?<\!-- Lista de ranuras -->[\s\S]*?<div className="grid grid-cols-2 gap-1\.5">[\s\S]*?\{\(\[\]\)\.map\(\(slot: any, i: number\) => \([\s\S]*?<\/svg>[\s\S]*?\}\)[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\}\)/g, '');

fs.writeFileSync(file, code);
