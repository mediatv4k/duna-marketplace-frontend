const fs = require('fs');
const file = 'src/components/MasterProductModal.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace createComboRoom
const createComboRoomRegex = /const createComboRoom = async \(\) => \{[\s\S]*?\s+try \{[\s\S]*?body: JSON.stringify\(\{[\s\S]*?\}\),[\s\S]*?\} catch \{ \/\* silent \*\/ \} finally \{\s*setComboCreating\(false\);\s*\}\s*\};/g;

code = code.replace(createComboRoomRegex, `const createComboRoom = async () => {
    if (!product) return;
    setComboCreating(true);
    try {
      const tempId = "new";
      const totalUnits = (baseSlotCount > 1 ? baseSlotCount : 1) * qty;
      const unitPriceUsd = totalCalculated / totalUnits;
      
      const res = await fetch(\`/api/combo/\${tempId}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id || product.code || tempId,
          productName: product.name || 'Producto',
          storeName: store?.name || '',
          storeCode: store?.code || '',
          totalUnits,
          unitPriceUsd,
          hostName: 'Anfitrión',
          hostUnitsCount: Math.min(totalUnits, 1),
          hostSelectedVariants: selectedVariants,
          hostExclusions: selectedExclusions,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        const finalRoomId = data.room.id;
        setComboRoomId(finalRoomId);
        setComboRoomData(data.room);
        setShowComboPanel(true);
        setViewMode('comboRoom');
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('duna_pedido_amigos_active', JSON.stringify({
            roomId: finalRoomId,
            storeSlug: store?.code || '',
            storeName: store?.name || '',
            productName: product?.name || '',
            isHost: true,
            createdAt: Date.now(),
            status: 'ACTIVE',
          }));
        }
        if (comboPollingRef.current) clearInterval(comboPollingRef.current);
        comboPollingRef.current = setInterval(async () => {
          try {
            const pr = await fetch(\`/api/combo/\${finalRoomId}\`);
            const pd = await pr.json();
            if (pd.ok) setComboRoomData(pd.room);
          } catch { /* silent */ }
        }, 2000);
      }
    } catch { /* silent */ } finally {
      setComboCreating(false);
    }
  };`);

// Remove comboRoomSlots and replace with comboRoomData and viewMode
code = code.replace(
  `const [comboRoomSlots, setComboRoomSlots] = useState<any[]>([]);`,
  `const [comboRoomData, setComboRoomData] = useState<any>(null);\n    const [viewMode, setViewMode] = useState<'options' | 'customize' | 'comboRoom'>(isCombo ? 'options' : 'customize');`
);

// Fix comboAllDone
code = code.replace(
  `const comboAllDone = comboRoomSlots.length > 0 && comboRoomSlots.every(s => !!s.completedAt);`,
  `const comboAllDone = comboRoomData && comboRoomData.claimedUnits >= comboRoomData.totalUnits;`
);

// Fix reset in closeModal
code = code.replace(
  `setComboRoomSlots([]);`,
  `setComboRoomData(null);\n        setViewMode(isCombo ? 'options' : 'customize');`
);

// Fix total price calculation useMemo dependencies
code = code.replace(
  `}, [product, selectedVariants, slots, isSlotMode, upsellSelections, availableGroups, showComboPanel, comboRoomSlots]);`,
  `}, [product, selectedVariants, slots, isSlotMode, upsellSelections, availableGroups, showComboPanel, comboRoomData]);`
);

// Fix loop in total price
code = code.replace(
  `const targetSlots = (showComboPanel && comboAllDone) ? comboRoomSlots : slots;`,
  `const targetSlots = slots; // Pool variants don't affect base host config right now`
);

// Fix handleAddToCart logic
code = code.replace(
  `const activeSlots = (showComboPanel && comboAllDone) ? comboRoomSlots : slots;`,
  `const activeSlots = slots;`
);

// Fix isSlotMode - set to false entirely because we deleted it!
code = code.replace(
  `const isSlotMode = hasSinVariant && (isCombo || (qty > 1 && isSlotCustomizationActive));`,
  `const isSlotMode = false;`
);

fs.writeFileSync(file, code);
console.log('Done!');
