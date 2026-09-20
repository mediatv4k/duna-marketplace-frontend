async function testStores() {
  const headers = {
    'apiKey': '79e42cdd-eb99-4268-b61a-17dbc6df2c5d',
    'timeZone': 'America/Caracas',
    'Content-Type': 'application/json'
  };

  const res = await fetch('https://dev.carjos-marketplace.cloud/store/find?category=&keywords=', { headers });
  const data = await res.json();

  for (const s of (data.data || [])) {
    console.log(`=== TIENDA ID ${s.id}: ${s.name} ===`);
    const prodRes = await fetch(`https://dev.carjos-marketplace.cloud/products/store/${s.id}`, { headers });
    const prodData = await prodRes.json();
    console.log(`Productos status: ${prodRes.status}, code: ${prodData.code}`);
    if (prodData.data) {
      if (Array.isArray(prodData.data)) {
        console.log(`Cant productos: ${prodData.data.length}`);
        prodData.data.slice(0, 3).forEach(p => console.log(`  - Prod: ${p.id} | ${p.name} | Variantes: ${JSON.stringify(p.variants?.length || 0)}`));
      } else {
        console.log('Estructura prodData.data:', Object.keys(prodData.data));
      }
    }
  }
}
testStores();
