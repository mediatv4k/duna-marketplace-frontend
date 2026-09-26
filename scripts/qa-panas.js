const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const report = {
    timestamp: new Date().toISOString(),
    scenario1_InApp: {
      success: false,
      totalPriceText: null,
      isValidPrice: false
    },
    scenario2_WhatsApp: {
      success: false,
      interceptedUrl: null,
      isProperlySanitized: false
    },
    errors: [],
    status: 'pending'
  };

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false, // para poder visualizar si es necesario
      defaultViewport: null,
      args: ['--start-maximized']
    });

    const page = await browser.newPage();
    
    // Interceptar la generación del popup de WhatsApp
    page.on('popup', async popup => {
      const url = popup.url();
      if (url.includes('api.whatsapp.com') || url.includes('wa.me')) {
        console.log('✅ [WhatsApp] Popup interceptado:', url);
        report.scenario2_WhatsApp.interceptedUrl = url;
        
        // Validación estricta de sanitización
        // Un enlace sanitizado con encodeURIComponent() no debe tener espacios literales.
        // Espacios se convierten a %20. Saltos de línea a %0A.
        const containsLiteralSpaces = url.includes(' ');
        report.scenario2_WhatsApp.isProperlySanitized = !containsLiteralSpaces;
        report.scenario2_WhatsApp.success = true;
        
        await popup.close();
      }
    });

    console.log('Navegando a la aplicación (https://duna-marketplace-frontend.vercel.app)...');
    await page.goto('https://duna-marketplace-frontend.vercel.app', { waitUntil: 'networkidle2', timeout: 30000 });

    console.log('Esperando a que carguen tiendas o productos (15s)...');
    try {
      await page.waitForFunction(() => {
        return document.querySelectorAll('a, button, img').length > 5;
      }, { timeout: 15000 });
    } catch (e) {
      console.log('Timeout esperando contenido, continuando con el flujo...');
    }
    
    await new Promise(r => setTimeout(r, 3000));

    console.log('Intentando hacer clic en el primer comercio activo...');
    await page.evaluate(() => {
      const storeLinks = Array.from(document.querySelectorAll('a')).filter(a => a.href.includes('/store') || a.href.includes('/tienda') || a.href.includes('/p/'));
      if (storeLinks.length > 0) {
        storeLinks[0].click();
      } else {
        const cards = Array.from(document.querySelectorAll('.cursor-pointer, [role="button"]'));
        if (cards.length > 0) cards[0].click();
      }
    });

    await new Promise(r => setTimeout(r, 4000));

    console.log('Haciendo clic en el primer producto del catálogo...');
    await page.evaluate(() => {
      // Intentamos seleccionar cualquier tarjeta de producto que abra el modal
      const products = Array.from(document.querySelectorAll('.cursor-pointer, button, a')).filter(el => {
        const text = el.innerText.toLowerCase();
        return text.includes('$') || text.includes('bs');
      });
      if (products.length > 0) products[0].click();
    });

    await new Promise(r => setTimeout(r, 3000));

    console.log('Buscando las opciones de Personalización o Compartir entre panas...');
    // Intentamos activar el flujo "Compartir entre panas"
    const hasSocialShare = await page.evaluate(() => {
      const shareBtn = Array.from(document.querySelectorAll('div, button')).find(el => el.innerText && el.innerText.includes('Compartir entre panas'));
      if (shareBtn) {
        shareBtn.click();
        return true;
      }
      return false;
    });

    if (hasSocialShare) {
      console.log('✅ Flujo "Compartir entre panas" detectado.');
      await new Promise(r => setTimeout(r, 4000));
      
      // En la vista de Host Setup, buscamos el botón verde de "Crear Sala y Enviar a WhatsApp"
      await page.evaluate(() => {
        const createRoomBtn = Array.from(document.querySelectorAll('button')).find(el => el.innerText && el.innerText.includes('WhatsApp'));
        if (createRoomBtn && !createRoomBtn.disabled) createRoomBtn.click();
      });
      await new Promise(r => setTimeout(r, 4000)); // Esperar a que el popup se levante
    } else {
      console.log('⚠️ El producto seleccionado no tiene la opción "Compartir entre panas".');
    }

    // Volvemos atrás o reiniciamos si es necesario para el Escenario 1
    // (O podemos simular "Personalizar aquí" si está disponible)
    console.log('Buscando el botón "Personalizar aquí mismo" / "Personalizar combo"...');
    await page.evaluate(() => {
      const customizeBtn = Array.from(document.querySelectorAll('div, button')).find(el => 
        el.innerText && (el.innerText.includes('Personalizar aquí') || el.innerText.includes('Personalizar pedido') || el.innerText.includes('Personalizar combo'))
      );
      if (customizeBtn) customizeBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 4000));

    // Seleccionamos addons al azar (simulando cumplir minRequired)
    await page.evaluate(() => {
      const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"], .cursor-pointer'));
      const addonOptions = checkboxes.filter(el => el.innerText && (el.innerText.includes('+') || el.innerText.includes('$')));
      if (addonOptions.length > 0) addonOptions[0].click();
      if (addonOptions.length > 1) addonOptions[1].click();
    });
    
    await new Promise(r => setTimeout(r, 4000));

    // Leer el precio final del botón "Agregar al pedido" o del resumen
    const priceText = await page.evaluate(() => {
      const addBtn = Array.from(document.querySelectorAll('button')).find(el => el.innerText && (el.innerText.includes('Agregar') || el.innerText.includes('Añadir')));
      if (addBtn) return addBtn.innerText;
      
      const priceElements = Array.from(document.querySelectorAll('.font-black, .text-lg, .text-xl')).filter(el => el.innerText && (el.innerText.includes('$') || el.innerText.includes('Bs')));
      if (priceElements.length > 0) return priceElements[0].innerText;
      return null;
    });

    if (priceText) {
      console.log('✅ Precio In-App detectado:', priceText);
      report.scenario1_InApp.totalPriceText = priceText;
      
      // Validación estricta
      const isNaNPresent = priceText.includes('NaN');
      const hasNumber = /\d/.test(priceText);
      report.scenario1_InApp.isValidPrice = !isNaNPresent && hasNumber;
      report.scenario1_InApp.success = report.scenario1_InApp.isValidPrice;
    }

    report.status = 'success';
    console.log('Auditoría completada.');

  } catch (err) {
    console.error('❌ Error durante la auditoría:', err.message);
    report.errors.push(err.message);
    report.status = 'error';
  } finally {
    if (browser) {
      await browser.close();
    }
    fs.writeFileSync('qa-panas-report.json', JSON.stringify(report, null, 2));
    console.log('✅ Reporte guardado en qa-panas-report.json');
  }
})();
