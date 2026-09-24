const fs = require('fs');
let code = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8');

// 1. Rename comboRoomSlots -> comboRoomData
code = code.replace(
  `const [comboRoomSlots, setComboRoomSlots] = useState<any[]>([]);`,
  `const [comboRoomData, setComboRoomData] = useState<any>(null);\n    const [viewMode, setViewMode] = useState<'options' | 'customize' | 'comboRoom'>('options');`
);

// 2. update comboAllDone
code = code.replace(
  `const comboAllDone = comboRoomSlots.length > 0 && comboRoomSlots.every(s => !!s.completedAt);`,
  `const comboAllDone = comboRoomData && comboRoomData.claimedUnits >= comboRoomData.totalUnits;`
);

// 3. update closeModal reset
code = code.replace(
  `setComboRoomSlots([]);`,
  `setComboRoomData(null);\n        setViewMode('options');`
);

// 4. Update createComboRoom function using regex to avoid encoding issues
const createComboRegex = /const createComboRoom = async \(\) => \{[\s\S]*?\s+try \{[\s\S]*?body: JSON.stringify\(\{[\s\S]*?\}\),[\s\S]*?\} catch \{ \/\* silent \*\/ \} finally \{\s*setComboCreating\(false\);\s*\}\s*\};/;

const newCreateComboRoomStr = `const createComboRoom = async () => {
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
  };`;

code = code.replace(createComboRegex, newCreateComboRoomStr);

// 5. targetSlots calculation
const targetSlotsRegex = /const targetSlots = \(showComboPanel && comboRoomSlots\.length > 0 && comboRoomSlots\.every\(s => !!s\.completedAt\)\) \? comboRoomSlots : slots;/;
code = code.replace(targetSlotsRegex, `const targetSlots = slots;`);

// 6. Fix price calculation dependencies
code = code.replace(
  `}, [product, selectedVariants, slots, isSlotMode, upsellSelections, availableGroups, showComboPanel, comboRoomSlots]);`,
  `}, [product, selectedVariants, slots, isSlotMode, upsellSelections, availableGroups, showComboPanel, comboRoomData]);`
);

// 7. Force isSlotMode = false
code = code.replace(
  `const isSlotMode = hasSinVariant && (isCombo || (qty > 1 && isSlotCustomizationActive));`,
  `const isSlotMode = false;`
);

// 8. HandleAddToCart
const handleAddRegex = /  const handleAddToCart = \(\) => \{[\s\S]*?const activeSlots = \(showComboPanel && comboAllDone\) \? comboRoomSlots : slots;/;
const handleAddReplacement = `  const handleAddToCart = () => {
    if (!product) return;
    const breakdown: string[] = [];

    if (viewMode === 'comboRoom' && comboRoomData) {
      let totalCartPrice = 0;
      breakdown.push(\`Pedido entre panas: \${comboRoomData.productName} (\${comboRoomData.totalUnits} unidades)\`);
      comboRoomData.participants.forEach((p: any) => {
        totalCartPrice += p.subtotalUsd;
        const participantParts: string[] = [];
        
        if (p.exclusions && p.exclusions.length > 0) {
          participantParts.push(\`Sin \${p.exclusions.join(', ')}\`);
        } else {
          participantParts.push('Con Todo');
        }
        Object.values(p.selectedVariants || {}).forEach((sel: any) => {
           if (Array.isArray(sel)) {
             sel.forEach((item: any) => {
               if (item.count > 0) participantParts.push(\`\${item.count}x \${item.name}\`);
             });
           } else if (sel.name) {
             participantParts.push(sel.name);
           }
        });
        
        breakdown.push(\`\${p.name} (\${p.unitsCount}x): \${participantParts.join(', ')}\`);
      });
      
      onAddToCart({
        productCode: String(product.id || product.code),
        productName: product.name,
        qty: qty,
        quantity: qty,
        totalPrice: totalCartPrice,
        totalUSD: totalCartPrice,
        summaryText: breakdown.join(' | '),
        breakdown: breakdown
      });
      if (typeof window !== 'undefined') window.localStorage.removeItem('duna_pedido_amigos_active');
      onClose();
      return;
    }

    const activeSlots = slots;`;

code = code.replace(handleAddRegex, handleAddReplacement);

// 9. Fix slotTitle
code = code.replace(
  `const slotTitle = slot.guestName?.trim() || slot.name?.trim() || '';`,
  `const slotTitle = slot.name?.trim() || '';`
);

fs.writeFileSync('src/components/MasterProductModal.tsx', code);
console.log('Logic updated safely.');
