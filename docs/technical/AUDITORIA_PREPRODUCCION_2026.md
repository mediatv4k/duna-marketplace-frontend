# Auditoría estática pre-producción — integración AdonisJS (2026)

> Auditoría del frontend (repo `duna-marketplace-frontend`) previa al paso a producción con AdonisJS.
> Base: código en `main` @ `7b956fb` (2026-09-26). Referencia contractual: `DOCUMENTO_TECNICO_OSWALDO.md` y lo indicado por Oswaldo sobre
> §8.2 / §9.2 del documento de proceso de compra (`documento-tecnico-proceso-compra.md`, que **no está en este repo**).
> Equivalencias de nombres: `service.ts` = `src/services/marketplaceService.ts`; `CartV2.jsx` no existe, su equivalente es `src/components/CheckoutModal.tsx`
> (con el carrito en `CartModal.tsx` y `MerchantStoreView.tsx`).

**Método.** Lectura de código + verificación en ejecución (build de producción en una copia aislada, POST de compra **interceptado**: nunca llegó
un pedido al backend). Cada hallazgo indica si fue **[verificado]** en ejecución o **[estático]**.

**Resumen.** 9 hallazgos críticos (8 verificados en ejecución), 9 riesgos medios. Lo que estaba bien: distancia/duración de la cotización coinciden con el pedido;
los campos raíz, ítems y `variants[]` salen numéricos con sumas coherentes; `ordenCreada` evita duplicados tras un éxito real; hay validaciones previas al envío
(ids, teléfono, tasa, ubicación).

## Estado de resolución

| Hallazgo | Estado |
|---|---|
| C1 – carrito cruzado entre tiendas | Resuelto en el Lote 1 (P0.1) |
| C2 – ciclo de vida del checkout | Resuelto en el Lote 1 (P0.2) |
| C3 – mocks visibles a clientes | Resuelto en el Lote 1 (P0.3) |
| C4 – falso éxito de la compra | Resuelto en el Lote 1 (P0.4) |
| C5 – envío gratis inventado | Pendiente (Lote 2) |
| C6 – Cofre Recompensa simulado | Pendiente (Lote 2) |
| C7 – modo "Nacional" | Pendiente (Lote 2) |
| C8 – petición de compra sin timeout | Pendiente (Lote 2) |
| C9 – códigos 15/21 y errores crudos | Pendiente (Lote 2) |
| M1–M9 | Pendientes (P1/P2) |

Detalle técnico del Lote 1 en `AGENTS.md` (entrada "P0 Lote 1") y en `bitacora-arquitectura-farmacia-storefront.md`.

---

## 1. Hallazgos críticos (bloqueantes)

### C1 – El carrito de una tienda se cuela en otra [verificado]
- **Causa.** Al volver de una tienda solo se borra `current_cart_store_id`, no `cart_data` (`page.tsx` `onBack` y los botones de logo; handler `popstate`). Como el marcador ya no
  existe, la purga de `handleStoreClick` (`savedCartStore && savedCartStore !== storeIdStr`) no se ejecuta. `MerchantStoreView.tsx` (estado inicial del carrito) leía `cart_data`
  sin comprobar de qué tienda era.
- **Prueba.** Se agregó un producto en Papá Helado, se volvió y se entró a Franela Store: la barra de bolsa mostró "1 · $3.00".
- **Efecto.** Ítems de un comercio enviados con el `store.id` de otro: `code: 15` o pedido cruzado.

### C2 – Tras "Ver seguimiento", el segundo pedido queda bloqueado y luego se borra [verificado]
- **Causa.** `CheckoutModal` nunca reiniciaba `ordenCreada` ni `pasoVista` (`handleCompleteFinalOrder` sale de inmediato si `ordenCreada`). `onViewTracking` no cerraba el ciclo y
  `hasCompletedOrder` quedaba en `true`.
- **Prueba.** Pedido → "Ver seguimiento" → cerrar seguimiento → agregar otro producto: el checkout abrió la confirmación vieja en vez del formulario; al pulsar "Continuar",
  `handleCloseCheckout` vació el carrito nuevo y cerró la tienda.

### C3 – Datos mock visibles para clientes reales [verificado]
- **Causa.** Un `AbortController` de 3 s compartido entre categorías y tiendas caía a tiendas falsas ("Mostaza Food Truck", "Papá Helado", ids 991/992, `isDemo`). Para el catálogo,
  un `Promise.race` de 3 s caía a productos falsos (p. ej. "Combo de Prueba $10", id 301).
- **Prueba.** Con la API tardando 3.5 s el Home solo mostró las tiendas falsas; una tienda real mostró "Combo de Prueba $10".
- **Efecto.** Viola la regla de datos 100 % reales; un ítem falso con id 301 puede coincidir con un producto real.

### C4 – Falso éxito de la compra [verificado]
- **Causa.** Los servicios convertían el estado HTTP en `code` cuando la respuesta no era JSON; el checkout aceptaba `code` 1, 200 o 201 y, sin `data.id`, inventaba un UUID de cliente.
- **Prueba.** HTTP 200 con cuerpo `OK` (no JSON) y `{code:1,data:null}` mostraron la confirmación y guardaron un UUID como id del pedido.
- **Efecto.** El cliente cree que compró; el seguimiento consulta un id inexistente; no puede adjuntar comprobante.

### C5 – "Envío gratis desde $20" inventado en el frontend [verificado]
- **Causa.** `MerchantStoreView.tsx` (`umbralEnvio`, `esEnvioGratis`, `fleteActivo`) pone el flete en 0 si el subtotal es ≥ $20.
- **Prueba.** Pedido de $25: `distance` 1.9 y `duration` 4 pero `serviceAmount: 0`, total 25.5; la cotización oficial era $1.90, así que el backend esperaría 27.4.
- **Efecto.** El contrato dice que el flete depende solo de distancia, duración y zonas. Todo pedido delivery de $20 o más cae en `code: 21` o el repartidor no cobra.

### C6 – El "simulador" del Cofre Recompensa está activo en producción [verificado]
- **Causa.** `orderCount` arranca en 3 y hay un botón "Simular 3 compras". El descuento entra al total, pero el payload manda `discountAmount: 0` y `totalWithoutDiscount` ya descontado.
- **Prueba.** Con "Usar Ahora" el total fue 4.93 contra 5.40 esperado.
- **Efecto.** Cualquier cliente obtiene 25 % de descuento en el flete; el pedido cae en `code: 21` o se cobra de menos.

### C7 – El modo "Nacional" viaja como delivery local [verificado]
- **Causa.** El botón está siempre visible (`isNationalShippingEnabled={true}` fijo en `MerchantStoreView`) aunque la tienda lo tiene en `false`. El payload solo distingue `PICKUP` de `DELIVERY`.
- **Prueba.** `service: DELIVERY`, `address: "Agencia MRW (Cabimas)"`, `distance: 0`, `serviceAmount: 4.5`. El contrato no tiene envío nacional.

### C8 – Petición colgada sin timeout [verificado]
- **Causa.** Ninguna llamada de compra o `PUT` tiene timeout.
- **Prueba.** A los 14 s el botón seguía en "Registrando tu pedido...".
- **Riesgo de duplicado.** Si la respuesta se pierde después de que Adonis creó la orden, reintentar duplica el pedido. No hay clave de idempotencia.

### C9 – Códigos 15 y 21 sin mensaje claro [verificado]
- **Causa.** Se muestra `response.message` crudo.
- **Prueba.** El cliente vio `E_STORE_NOT_OPEN`, `E_AMOUNT_MISMATCH`, `Failed to fetch` y `E_UNKNOWN: Cannot read properties…`. Un `code: 21` sin `message` dice "Revisa tus datos" (confuso).
  Ninguno deja un spinner infinito: el `finally` libera el botón.

## 2. Riesgos medios

- **M1 – Precio del flete decidido por el cliente.** Distancia en línea recta a 30 km/h (`logisticsEngine.ts`, `getDistanceAndTime`) enviada a `deliveryRate`; el cliente decide el precio. Conviene que el backend la calcule desde lat/lng.
- **M2 – Dirección débil o inventada.** En delivery solo viaja "GPS Actual: lat, lng", sin calle ni referencia. El GPS denegado cae al centro de Cabimas con la misma etiqueta que un GPS real. El retiro envía la dirección falsa "Cabimas Centro (Sector Av. Intercomunal)" [verificado].
- **M3 – Estado viejo al pagar.** `isOpen` sale de la lista cargada una vez al abrir la página; la tasa se lee al abrir el checkout y no se refresca al enviar: riesgo de `code: 21`.
- **M4 – Carrito persistente sin control.** Sin vigencia, versión ni revalidación contra el catálogo; sin validación de esquema al leer; con varias pestañas gana la última que escribe.
- **M5 – Precio unitario derivado por división** (`totalPrice/qty`) con deriva de redondeo; en modo por unidades (slots) los extras de pago no viajan en `variants`/`pricing`: probable `code: 21` (sin probar con orden real).
- **M6 – Falla de métodos de pago.** Si `payment/info` falla, el mensaje dice "No hay métodos de pago habilitados" y no hay reintento.
- **M7 – Datos personales y llaves.** Nombre, cédula y teléfono quedan en `localStorage` sin caducidad ni consentimiento. `.env.local` está versionado (llaves públicas de Google Maps y Firebase incluidas): restringir por dominio y sacarlo de git.
- **M8 – Estados finales.** `FINAL_STATUSES` solo tiene valores en inglés: un "Entregado" en español no detiene el sondeo.
- **M9 – Detalles menores.** `alert()` bloqueantes en el checkout; `last_receipt_url` solo se lee, nunca se escribe ("Ver Mi Recibo Digital" no hace nada); `current_order` solo se borra.

## 3. Plan de acción

**P0 — antes de producción**

| Orden | Cambio | Dónde |
|---|---|---|
| 1 | Guardar el `storeId` con el carrito y cargarlo solo si coincide con la tienda actual; purgar en `handleStoreClick` aunque falte el marcador | `page.tsx`, `MerchantStoreView.tsx` |
| 2 | Reiniciar el estado del checkout (`key` por pedido) y hacer que `handleCloseCheckout` no cierre la tienda si el carrito es nuevo | `CheckoutModal.tsx`, `page.tsx` |
| 3 | Quitar los mocks; timeouts de 12–15 s por petición, con pantalla de error y reintento | `page.tsx`, `marketplaceService.ts` |
| 4 | Éxito solo con `code === 1 && data?.id`; una respuesta no JSON debe ser error, no `code: res.status` | `marketplaceService.ts`, `CheckoutModal.tsx` |
| 5 | Sacar el envío gratis y el Cofre del flujo real hasta que Oswaldo confirme los campos de descuento | `MerchantStoreView.tsx`, `CheckoutModal.tsx` |
| 6 | Ocultar "Nacional" (pasar `merchant.isNationalShippingEnabled`) y bloquear el envío en ese modo | `MerchantStoreView.tsx`, `CartModal.tsx` |
| 7 | Timeout de 20–25 s en la compra y aviso para verificar el seguimiento antes de reintentar; pedir a Oswaldo una clave de idempotencia | `marketplaceService.ts` |
| 8 | Mapear 15, 21 y errores de red a textos claros; en el 21, refrescar tasa y flete y volver a la Fase 2 | `CheckoutModal.tsx` |

**P1:** refrescar tasa y estado de la tienda al abrir el checkout (M3); dirección con referencia y aviso de GPS aproximado (M2); rediseñar precio por unidad y extras de slots con una orden real (M5); reintento en métodos de pago (M6).

**P2:** M1 con Oswaldo; M7, M8 y M9.

## 4. Límites de esta auditoría

- No se pudo confirmar cómo responde Adonis a `code: 15` y `code: 21` (textos y reglas exactas de recálculo). C5, C6 y M5 son inferencias del contrato y de mediciones; una orden real de prueba en DEV las confirmaría.
- §8.2 y §9.2 del documento de proceso de compra se tomaron de lo indicado por Oswaldo (el archivo no está en el repo).
- No se ejercitó ningún envío real a Adonis (se habría creado un pedido real).
