const fs = require('fs');
let code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

// 1. Update viewMode type
code = code.replace(
  /const \[viewMode, setViewMode\] = useState<'options' \| 'customize' \| 'comboRoom'>\('options'\);/,
  `const [viewMode, setViewMode] = useState<'options' | 'customize' | 'comboRoom' | 'host_setup'>('options');
    const [hostPaymentMode, setHostPaymentMode] = useState<'split' | 'host_pays'>('split');
    const [hostSetupUnits, setHostSetupUnits] = useState(1);
    const [hostSetupExclusions, setHostSetupExclusions] = useState<string[]>([]);`
);

// 2. Update createComboRoom to use these states
code = code.replace(
  /hostName: 'Anfitrión',[\s\S]*?hostUnitsCount: Math\.min\(totalUnits, 1\),[\s\S]*?hostSelectedVariants: selectedVariants,[\s\S]*?hostExclusions: selectedExclusions,/g,
  `hostName: 'Anfitrión',
          hostUnitsCount: hostSetupUnits,
          hostSelectedVariants: {},
          hostExclusions: hostSetupExclusions,
          paymentMode: hostPaymentMode,`
);

// 3. Update button onClick in options
code = code.replace(
  /onClick=\{createComboRoom\}[\s\n]*className="w-full bg-\[\#FE6712\]/g,
  `onClick={() => { setHostSetupUnits(1); setHostSetupExclusions([]); setViewMode('host_setup'); }}\n            className="w-full bg-[#FE6712]`
);

fs.writeFileSync('src/components/MasterProductModal.tsx', code);
console.log('API and State updated in Modal');
