const fs = require('fs');
let code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

// 1. Add pb-28
code = code.replace(
  `{viewMode === 'host_setup' && (
        <div className="space-y-5 pb-4 border-b border-gray-100">`,
  `{viewMode === 'host_setup' && (
        <div className="space-y-5 pb-28 border-b border-gray-100">`
);

// 2. Remove the old inline WhatsApp button
const oldButtonChunk = `<div className="pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  createComboRoom().then(() => {
                    const hostUrl = window.location.origin + \`/combo/\${comboRoomId || 'new'}\`; // The real ID gets set after createComboRoom, but we can't await state. 
                    // Better to just let createComboRoom open whatsapp.
                  });
                }}
                disabled={comboCreating}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-3.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {comboCreating ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creando...</>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Crear Sala y Enviar a WhatsApp
                  </>
                )}
              </button>
            </div>`;

code = code.replace(oldButtonChunk, '');

// 3. Instead of wrapping the sticky footer with a ternary inside it, let's just use CSS `hidden`!
// It's much safer than trying to parse JSX brackets.
// Find the `p-4 sm:p-5 md:px-6 md:py-4` that wraps the price bar and button
code = code.replace(
  `<div className="p-4 sm:p-5 md:px-6 md:py-4">`,
  `{viewMode === 'host_setup' && (
            <div className="p-4 sm:p-5 md:px-6 md:py-4 bg-white">
              <button
                onClick={() => {
                  createComboRoom().then(() => {
                    const hostUrl = window.location.origin + \`/combo/\${comboRoomId || 'new'}\`; // The real ID gets set after createComboRoom, but we can't await state. 
                    // Better to just let createComboRoom open whatsapp.
                  });
                }}
                disabled={comboCreating}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-3.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {comboCreating ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creando...</>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Crear Sala y Enviar a WhatsApp
                  </>
                )}
              </button>
            </div>
          )}
          <div className={\`p-4 sm:p-5 md:px-6 md:py-4 \${viewMode === 'host_setup' ? 'hidden' : ''}\`}>`
);

fs.writeFileSync('src/components/MasterProductModal.tsx', code);
console.log('Applied safe fix');
