const fs = require('fs');
const file = 'src/components/MasterProductModal.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. state definition
code = code.replace(
  `const [comboRoomSlots, setComboRoomSlots] = useState<any[]>([]);`,
  `const [comboRoomData, setComboRoomData] = useState<any>(null);\n  const [viewMode, setViewMode] = useState<'options' | 'customize' | 'comboRoom'>('options');`
);

// 2. comboAllDone
code = code.replace(
  `const comboAllDone = comboRoomSlots.length > 0 && comboRoomSlots.every(s => !!s.completedAt);`,
  `const comboAllDone = comboRoomData && comboRoomData.claimedUnits >= comboRoomData.totalUnits;`
);

// 3. reset logic
code = code.replace(
  `setComboRoomSlots([]);`,
  `setComboRoomData(null);\n      setViewMode('options');`
);

// 4. createComboRoom
const createComboRoomStr = `  const createComboRoom = async () => {
    if (!product) return;
    setComboCreating(true);
    try {
      const tempId = "new";
      const res = await fetch(\`/api/combo/\${tempId}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id || product.code || tempId,
          productName: product.name || 'Producto',
          storeName: store?.name || '',
          storeCode: store?.code || '',
          totalSlots: qty > 1 ? qty : (baseSlotCount > 1 ? baseSlotCount : qty),
          hostName: 'Anfitrión',
          hostSelectedVariants: selectedVariants,
          hostExclusions: selectedExclusions,
        }),
      });
      const data = await res.json();
          if (data.ok) {
          const finalRoomId = data.room.id;
          setComboRoomId(finalRoomId);
          setComboRoomSlots(data.room.slots || []);
          setShowComboPanel(true);
          // Persistir sala activa para la barra flotante global
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
          // Polling cada 2 s
          if (comboPollingRef.current) clearInterval(comboPollingRef.current);
          comboPollingRef.current = setInterval(async () => {
            try {
              const pr = await fetch(\`/api/combo/\${finalRoomId}\`);
              const pd = await pr.json();
              if (pd.ok) setComboRoomSlots(pd.room.slots || []);
            } catch { /* silent */ }
          }, 2000);
        }
    } catch { /* silent */ } finally {
      setComboCreating(false);
    }
  };`;

const newCreateComboRoomStr = `  const createComboRoom = async () => {
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

code = code.replace(createComboRoomStr, newCreateComboRoomStr);

// 5. Price calculation fixes
code = code.replace(
  `const targetSlots = (showComboPanel && comboRoomSlots.length > 0 && comboRoomSlots.every(s => !!s.completedAt)) ? comboRoomSlots : slots;`,
  `const targetSlots = slots;`
);

code = code.replace(
  `}, [product, selectedVariants, slots, isSlotMode, upsellSelections, availableGroups, showComboPanel, comboRoomSlots]);`,
  `}, [product, selectedVariants, slots, isSlotMode, upsellSelections, availableGroups, showComboPanel, comboRoomData]);`
);

// 6. HandleAddToCart override
const oldHandleAddToCartStart = `  const handleAddToCart = () => {
    if (!product) return;
    const breakdown: string[] = [];

    const activeSlots = (showComboPanel && comboAllDone) ? comboRoomSlots : slots;`;

const newHandleAddToCartStart = `  const handleAddToCart = () => {
    if (!product) return;
    const breakdown: string[] = [];
    
    if (viewMode === 'comboRoom' && comboRoomData) {
      let totalCartPrice = 0;
      breakdown.push(\`Pedido entre panas: \${comboRoomData.productName} (\${comboRoomData.totalUnits} unidades)\`);
      comboRoomData.participants.forEach((p: any) => {
        totalCartPrice += p.subtotalUsd;
        const participantParts = [];
        
        if (p.exclusions && p.exclusions.length > 0) {
          participantParts.push(\`Sin \${p.exclusions.join(', ')}\`);
        } else {
          participantParts.push('Con Todo');
        }
        Object.values(p.selectedVariants || {}).forEach((sel: any) => {
           if (Array.isArray(sel)) {
             sel.forEach(item => {
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

code = code.replace(oldHandleAddToCartStart, newHandleAddToCartStart);

// 7. Remove the slot loop title
code = code.replace(
  `const slotTitle = slot.guestName?.trim() || slot.name?.trim() || '';`,
  `const slotTitle = slot.name?.trim() || '';`
);

// 8. Turn off isSlotMode
code = code.replace(
  `const isSlotMode = hasSinVariant && (isCombo || (qty > 1 && isSlotCustomizationActive));`,
  `const isSlotMode = false;` // Force it off so the old unit-by-unit tabs don't render!
);

fs.writeFileSync(file, code);
console.log("Refactored logic");
