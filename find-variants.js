async function findAnyVariants() {
  const headers = {
    'apiKey': 'bf8f1b64-6342-48c5-af05-501e4c15a6cb',
    'timeZone': 'America/Caracas',
    'Content-Type': 'application/json'
  };

  const res = await fetch('https://dev.carjos-marketplace.cloud/store/find?category=&keywords=', { headers });
  const stores = (await res.json()).data || [];

  for (const store of stores) {
    const prodRes = await fetch(`https://dev.carjos-marketplace.cloud/products/store/${store.id}`, { headers });
    const prodData = await prodRes.json();
    const categories = prodData.data?.products || [];
    for (const cat of categories) {
      for (const item of (cat.data || [])) {
        if (item.variants && item.variants.length > 0) {
          console.log(`Tienda [${store.id}] ${store.name} tiene variantes en "${item.name}":`);
          console.log(JSON.stringify(item.variants, null, 2));
          return;
        }
      }
    }
  }
  console.log("Ninguna tienda en la key vieja tiene variantes.");
}
findAnyVariants();
