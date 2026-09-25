const fs = require('fs');

// 1. MerchantStoreView.tsx
let msv = fs.readFileSync('src/components/MerchantStoreView.tsx', 'utf8');
msv = msv.replace(
  /<MasterProductModal\s+product=\{selectedProductDetail\}/,
  '<MasterProductModal\n            storeCatalog={products}\n            product={selectedProductDetail}'
);
fs.writeFileSync('src/components/MerchantStoreView.tsx', msv);

// 2. MerchantTemplateEngine.tsx
let mte = fs.readFileSync('src/components/MerchantTemplateEngine.tsx', 'utf8');
mte = mte.replace(
  /<MasterProductModal\s+isOpen=\{isProductModalOpen\}/,
  '<MasterProductModal\n            storeCatalog={products || []}\n            isOpen={isProductModalOpen}'
);
fs.writeFileSync('src/components/MerchantTemplateEngine.tsx', mte);

console.log('Added storeCatalog prop to both usages');
