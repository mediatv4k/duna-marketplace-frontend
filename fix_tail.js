const fs = require('fs');
let code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

code = code.replace(
  /\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/,
  `\n        </div>\n\n      </div>\n    </div>\n  );\n}`
);

fs.writeFileSync('src/components/MasterProductModal.tsx', code);
console.log('Fixed end of file');
