const fs = require('fs');
const file = 'src/components/MasterProductModal.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. targetSlots in useMemo
const targetSlotsRegex = /const targetSlots = \(showComboPanel && \(\[\]\)\.length > 0 && \(\[\]\)\.every\(s => !!s\.completedAt\)\) \? \(\[\]\) : slots;/;
code = code.replace(targetSlotsRegex, `const targetSlots = slots;`);

const targetSlotsRegex2 = /const targetSlots = \(showComboPanel && comboRoomSlots\.length > 0 && comboRoomSlots\.every\(s => !!s\.completedAt\)\) \? comboRoomSlots : slots;/;
code = code.replace(targetSlotsRegex2, `const targetSlots = slots;`);

// 2. handleSingleSelect and handleOptionCount in my new UI code
code = code.replace(/handleSingleSelect\(/g, 'handleGlobalSingleSelect(');
code = code.replace(/handleOptionCount\(/g, 'handleGlobalOptionCount(');

// 3. Remove the old comboRoomSlots indicator which is causing errors
code = code.replace(/comboRoomSlots/g, '([])');

// 4. `product` does not exist in type `VariantSelectionPayload`.
const payloadRegex = /onAddToCart\(\{\s*product: \{\s*id: product\.id \|\| product\.code,\s*name: product\.name,\s*price: totalCartPrice \/ qty,\s*\/\/ Avg per combo box\s*image: product\.image \|\| product\.img,\s*storeCode: store\?\.code \|\| '',\s*storeName: store\?\.name \|\| '',\s*\},\s*qty: qty,\s*totalPrice: totalCartPrice,\s*description: breakdown\.join\('\\n'\),\s*selectedVariants: \{\},\s*selectedExclusions: \[\],\s*upsells: \[\]\s*\}\);/g;

code = code.replace(payloadRegex, `onAddToCart({
          productCode: String(product.id || product.code),
          productName: product.name,
          qty: qty,
          quantity: qty,
          totalPrice: totalCartPrice,
          totalUSD: totalCartPrice,
          summaryText: breakdown.join(' | '),
          breakdown: breakdown,
        });`);

fs.writeFileSync(file, code);
