const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function runQA() {
  console.log('Iniciando script de QA Automático para D\'Una Marketplace...');
  const report = {
    timestamp: new Date().toISOString(),
    networkIntercepts: [],
    consoleErrors: [],
    domAudit: {
      obsoleteCurrency: [],
      overflowingElements: []
    },
    orderNumber: null,
    errors: [],
    status: 'success'
  };

  let browser;
  try {
    // Iniciar Puppeteer de forma visible
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 800 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Capturar errores de consola
    page.on('console', msg => {
      if (msg.type() === 'error') {
        report.consoleErrors.push(msg.text());
      }
    });

    // Otorgar permisos de geolocalización y setear ubicación falsa
    const context = browser.defaultBrowserContext();
    await context.overridePermissions('https://duna-marketplace-frontend.vercel.app', ['geolocation']);
    await page.setGeolocation({ latitude: 10.4806, longitude: -66.9036 });

    // Interceptar peticiones de red
    await page.setRequestInterception(true);
    page.on('request', request => {
      // Escuchar peticiones salientes al endpoint especificado
      if (request.url().includes('/delivery/request/purchase/web') && request.method() === 'POST') {
        try {
          const postData = JSON.parse(request.postData() || '{}');
          report.networkIntercepts.push(postData);
        } catch (e) {
          report.networkIntercepts.push({ rawData: request.postData() });
        }
      }
      request.continue();
    });

    console.log('Navegando a la aplicación (https://duna-marketplace-frontend.vercel.app)...');
    await page.goto('https://duna-marketplace-frontend.vercel.app', { waitUntil: 'networkidle2', timeout: 30000 });

    console.log('Esperando a que carguen tiendas o productos (15s)...');
    try {
      await page.waitForFunction(() => {
        // Criterio de espera: que haya enlaces, botones o elementos que asuman contenido de tiendas
        return document.querySelectorAll('a, button, img').length > 5;
      }, { timeout: 15000 });
    } catch (e) {
      console.log('Timeout esperado, continuando con el flujo...');
    }
    
    // Pequeña pausa extra para contenido dinámico
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('Intentando hacer clic en el primer comercio activo...');
    await page.evaluate(() => {
      // Intentar hacer clic en un enlace de tienda
      const storeLinks = Array.from(document.querySelectorAll('a')).filter(a => a.href.includes('/store') || a.href.includes('/tienda') || a.href.includes('/p/'));
      if (storeLinks.length > 0) {
        storeLinks[0].click();
      } else {
        // Fallback: clic en cualquier elemento interactivo que parezca una tarjeta
        const cards = document.querySelectorAll('.card, [class*="product"], [class*="item"], [class*="store"]');
        if (cards.length > 0) cards[0].click();
      }
    });

    await new Promise(resolve => setTimeout(resolve, 4000));

    console.log('Agregando un ítem al carrito...');
    await page.evaluate(() => {
      const addButtons = Array.from(document.querySelectorAll('button, a')).filter(b => 
        b.innerText.toLowerCase().includes('agregar') || 
        b.innerText.toLowerCase().includes('add') || 
        b.innerText.toLowerCase().includes('+') ||
        (b.querySelector('svg') && !b.innerText)
      );
      if (addButtons.length > 0) {
        addButtons[0].click();
      }
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Satisfaciendo GPS/Dirección en el carrito mediante emulación...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const locationBtn = buttons.find(b => 
        b.innerText.toLowerCase().includes('ubicación') || 
        b.innerText.toLowerCase().includes('gps')
      );
      if (locationBtn) locationBtn.click();
    });

    console.log('Esperando a que la ubicación resuelva en el frontend...');
    try {
      await page.waitForFunction(() => {
        const textNodes = document.body.innerText.toLowerCase();
        // Esperamos a que dejen de verse los textos de error/carga
        return !textNodes.includes('obteniendo tu ubic') && !textNodes.includes('toca "mi ubic');
      }, { timeout: 10000 });
    } catch(e) {
      console.log('Timeout esperando ubicación, continuando...');
    }
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Abriendo modal de checkout...');
    await page.evaluate(() => {
      const checkoutButtons = Array.from(document.querySelectorAll('button, a')).filter(b => 
        b.innerText.toLowerCase().includes('carrito') || 
        b.innerText.toLowerCase().includes('pagar') || 
        b.innerText.toLowerCase().includes('checkout') || 
        b.innerText.toLowerCase().includes('comprar') ||
        (b.getAttribute('href') && b.getAttribute('href').includes('cart'))
      );
      if (checkoutButtons.length > 0) {
        checkoutButtons[0].click();
      }
    });

    await new Promise(resolve => setTimeout(resolve, 3000));



    console.log('Fase 2: Rellenando campos de checkout y método de pago...');
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      
      // Nombre
      const nombreInput = inputs.find(i => i.placeholder.toLowerCase().includes('nombre') || i.placeholder.toLowerCase().includes('juan'));
      if (nombreInput) {
        nombreInput.value = 'Cliente Prueba';
        nombreInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      // Cédula
      const cedulaInput = inputs.find(i => i.placeholder.includes('1234567') || (i.name || '').toLowerCase().includes('cedula'));
      if (cedulaInput) {
        cedulaInput.value = '25000000';
        cedulaInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // Teléfono / WhatsApp
      const telInput = inputs.find(i => i.placeholder.includes('4121234567') || i.type === 'tel' || (i.name || '').toLowerCase().includes('whatsapp'));
      if (telInput) {
        telInput.value = '4141234567';
        telInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // Seleccionar método de pago (Pago Móvil u otro)
      const payOptions = Array.from(document.querySelectorAll('.grid-cols-2 > div'));
      const pagoMovil = payOptions.find(el => el.innerText.toLowerCase().includes('pago móvil') || el.innerText.toLowerCase().includes('pago movil'));
      
      if (pagoMovil) {
        pagoMovil.click();
      } else if (payOptions.length > 0) {
        payOptions[0].click();
      }
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Fase 2 -> Fase 3: Avanzando al paso final...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const continuarBtn = buttons.find(b => b.innerText.toLowerCase().includes('continuar al pago') || b.innerText.toLowerCase().includes('siguiente'));
      if (continuarBtn && !continuarBtn.disabled) {
        continuarBtn.click();
      }
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('Fase 3: Confirmando la orden (Completar pedido)...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const submitBtn = buttons.find(b => 
        b.innerText.toLowerCase().includes('completar pedido') || 
        b.innerText.toLowerCase().includes('confirmar orden') ||
        b.innerText.toLowerCase().includes('reportar pago')
      );
      if (submitBtn && !submitBtn.disabled) {
        submitBtn.click();
      }
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Realizando auditoría del DOM en vivo...');
    const auditData = await page.evaluate(() => {
      const data = {
        obsoleteCurrency: [],
        overflowingElements: [],
        orderNumber: null
      };

      // 1. Buscar texto de moneda obsoleta (Bs.S o BS.S)
      const walkNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.nodeValue;
          if (text.includes('Bs.S') || text.includes('BS.S')) {
            data.obsoleteCurrency.push({
              text: text.trim(),
              parentElement: node.parentElement ? node.parentElement.tagName : 'UNKNOWN',
              parentClasses: node.parentElement ? node.parentElement.className : ''
            });
          }
        } else {
          node.childNodes.forEach(walkNode);
        }
      };
      walkNode(document.body);

      // 2. Detectar textos cortados con desborde
      document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.overflow === 'hidden' || style.overflowX === 'hidden' || style.overflowY === 'hidden' || style.textOverflow === 'ellipsis') {
          if (el.scrollWidth > el.clientWidth) {
            data.overflowingElements.push({
              tag: el.tagName,
              classes: el.className,
              textSnippet: el.textContent.substring(0, 50).trim()
            });
          }
        }
      });

      // 3. Extraer el número de orden visible en la cabecera o comanda
      const bodyText = document.body.innerText;
      const match = bodyText.match(/(?:orden|pedido|order)\s*(?:#|nro|no|numero)?\s*[:\-]?\s*([A-Za-z0-9\-]{5,20})/i);
      if (match && match[1]) {
        data.orderNumber = match[1];
      }

      // 4. Buscar si el checkout arrojó un error de validación rojo
      const errorDiv = document.querySelector('.bg-red-50.text-red-600');
      if (errorDiv) {
        data.submitError = errorDiv.innerText;
      }

      return data;
    });

    report.domAudit = {
      obsoleteCurrency: auditData.obsoleteCurrency,
      overflowingElements: auditData.overflowingElements
    };
    report.orderNumber = auditData.orderNumber;
    if (auditData.submitError) report.submitError = auditData.submitError;
    console.log('Auditoría completada exitosamente.');

  } catch (error) {
    console.error('Error durante la ejecución del script:', error.message);
    report.status = 'error';
    report.errors.push({
      message: error.message,
      stack: error.stack
    });
  } finally {
    if (browser) {
      console.log('Cerrando navegador...');
      await browser.close();
    }
    
    // Guardar el JSON compilado en la raíz del proyecto
    const projectRoot = path.resolve(__dirname, '..');
    const reportPath = path.join(projectRoot, 'qa-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\n✅ Reporte de hallazgos generado y guardado en: ${reportPath}`);
  }
}

runQA();
