const fs = require('fs');
let code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

// Columna Derecha parent
code = code.replace(
  /<div className="w-full flex flex-col flex-1 overflow-hidden min-h-0 bg-white md:h-full">/g,
  '<div className="w-full flex flex-col flex-1 bg-white">'
);

// Columna Derecha inner scroll container
code = code.replace(
  /<div className="w-full flex-1 max-h-\[460px\] md:max-h-\[500px\] overflow-y-auto pr-2 pt-3 space-y-3\.5 scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400">/g,
  '<div className="w-full flex-1 pb-32 pr-2 pt-3 space-y-3.5">'
);

// Outer content wrappers
code = code.replace(
  /<div className="flex-1 overflow-y-auto md:overflow-hidden min-h-0">/g,
  '<div className="flex-1 overflow-y-auto min-h-0">'
);
code = code.replace(
  /<div className="flex flex-col h-full overflow-y-auto md:overflow-hidden">/g,
  '<div className="flex flex-col h-full overflow-y-auto">'
);

// Grid
code = code.replace(
  /<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6 items-start md:h-full">/g,
  '<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6 items-start">'
);

// Sticky left column
code = code.replace(
  /<div className="w-full flex flex-col justify-between md:h-full overflow-hidden bg-slate-50\/70 rounded-2xl p-4 border border-slate-200\/80 gap-3">/g,
  '<div className="w-full flex flex-col justify-between overflow-hidden bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 gap-3 md:sticky md:top-6">'
);

fs.writeFileSync('src/components/MasterProductModal.tsx', code);
console.log('Scrolls unlocked');
