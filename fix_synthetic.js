const fs = require('fs');
let code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

const signatureRegex = /const handleSlotOptionQuantityChange = \(groupIdx: number \| string, optionCode: string, delta: number\) => \{/;
const newSignature = "const handleSlotOptionQuantityChange = (groupIdx: number | string, optionCode: string, delta: number, syntheticOpt?: any) => {";

code = code.replace(signatureRegex, newSignature);

const handleSlotChangePatchFix = `if (updatedList.length === 0) {
          const grp = typeof groupIdx === 'number' ? availableGroups[groupIdx] : null;
          if (grp && grp.options) {
            updatedList = grp.options.map((o: any) => ({ ...o, count: o.code === optionCode || o.id === optionCode ? Math.max(0, delta) : 0 }));
          } else if (syntheticOpt) {
            updatedList = [{ ...syntheticOpt, count: Math.max(0, delta) }];
          }
        }`;

// Replace the buggy patch if it was applied, or the original if it wasn't.
code = code.replace(/if \(updatedList\.length === 0\) \{\s*const grp = typeof groupIdx === 'number' \? availableGroups\[groupIdx\] : null;\s*if \(grp && grp\.options\) \{[\s\S]*?\}\s*\} else if \(arguments\.length > 3\) \{[\s\S]*?\}\s*\}/, handleSlotChangePatchFix);

code = code.replace(/if \(updatedList\.length === 0\) \{\s*const grp = availableGroups\[Number\(groupIdx\)\];\s*if \(grp && grp\.options\) \{[\s\S]*?\}\s*\}/, handleSlotChangePatchFix);

fs.writeFileSync('src/components/MasterProductModal.tsx', code);
console.log('Fixed syntheticOpt signature');
