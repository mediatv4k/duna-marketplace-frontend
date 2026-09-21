# AGENTS.md — Memoria Permanente y Plano Arquitectónico

> **Bitácora y fuente de verdad obligatoria** del proyecto **D'una Marketplace** (Next.js).
> Este archivo existe para evitar "amnesia" entre sesiones de agentes de IA. Cualquier
> agente (Claude u otro) que trabaje en este repositorio debe leerlo ANTES de tocar código,
> y actualizarlo DESPUÉS de cualquier cambio importante, refactorización o feature nueva.
>
> Última actualización: 2026-09-20

---

## 0. Cómo usar este documento

- Antes de implementar algo, revisa si ya existe una regla de negocio aquí que lo afecte
  (tasa BCV, Cofre Recompensa, logística, comandas). No reinventes ni contradigas estas reglas
  sin confirmarlo explícitamente con el usuario.
- Al terminar un cambio relevante, **actualiza la sección correspondiente** de este archivo
  en el mismo commit/tarea. Ver [Protocolo de Actualización](#6-protocolo-de-actualización-obligatorio).
- Las rutas de archivo se dan relativas a la raíz del repo.

### Reglas de oro (inquebrantables)

1. **No reescribir lo que ya funciona.** Todo cambio se hace con parches acoplados sobre la
   base existente.
2. **El contrato técnico de AdonisJS manda.** Llamadas HTTP, payload multipart (`orderData`
   JSON + `paymentFile`) y códigos de negocio (`1`, `15`, `21`) se rigen por
   `DOCUMENTO_TECNICO_OSWALDO.md` / el documento técnico oficial del backend.
3. **Datos 100% reales.** Tiendas, productos, promociones, carrito, checkout y tarifas salen
   del backend real. La **única** API key de fallback autorizada es `bf8f1b64-…` (la misma de
   `.env.local`). No dejar claves viejas ni mocks.

---

## 1. Arquitectura y Estructura del Proyecto

### 1.1 Stack

- **Framework**: Next.js 14.2.5 (App Router), React 18, TypeScript.
- **Estilos**: Tailwind CSS + `tailwindcss-animate`.
- **Iconos**: `lucide-react`.
- **Backend externo**: AdonisJS, desplegado en `https://dev.carjos-marketplace.cloud`
  (ver `DOCUMENTO_TECNICO_OSWALDO.md` para el contrato completo del endpoint de compra).
- **Firebase**: dependencia instalada (`firebase ^12.18.0`) — integración auxiliar, no es
  la fuente de verdad del catálogo/pedidos (eso vive en el backend AdonisJS).
- **Variables de entorno** (`.env.local`, nunca commitear valores reales):
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_SERVER_API_KEY`
  - `NEXT_PUBLIC_TIMEZONE`
  - `NEXT_PUBLIC_GOOGLE_MAPS_KEY`

### 1.2 Rutas (`src/app`)

- `src/app/layout.tsx` — layout raíz.
- `src/app/page.tsx` — **Home real y único flujo de compra activo.** Carga del backend las
  categorías (`/product/categories`), las tiendas (`/store/find`) y las promociones de todo
  el marketplace (`getStorePromotions('')`, solo de tiendas abiertas, franja
  `PromotionsCarousel` sobre "Categorías"). Al entrar a una tienda (`handleStoreClick`)
  arma `mappedInfo` (`id`, `code`, `categoriesName`, `avatar`, `banner`, `name`, `category`,
  `rating`, `deliveryFee`, `isOpen`, `badge`, ...) y renderiza
  `MerchantStoreView` → `CartModal` → `CheckoutModal` → `OrderTrackingModal`.
  **Regla:** si el backend manda un campo nuevo que un componente necesita, hay que copiarlo
  a `mappedInfo`; varios bugs fueron campos que se perdían ahí (`code`, `categoriesName`,
  `avatar`, `banner`).
- `src/app/order/[orderId]/timeline/page.tsx` — **página pública de seguimiento** (destino de los links `trackingUrl` que envían el repartidor/backend por WhatsApp, p. ej. `/order/1620/timeline`). Cliente puro: toma `orderId` de la URL (`useParams`), consume `getOrderPublic(orderId)` con polling de 9 s hasta estado final y dibuja `OrderTimelinePanel` a pantalla completa (historial descendente, estados amigables, ficha del chofer, Google Maps). **Acceso libre:** no usa `localStorage` ni comprueba dispositivo/sesión; los datos que ve son los que expone `GET /delivery/request/{id}/public` (nombre y dirección del cliente, no su teléfono).
- **Orden del listado de tiendas (Home):** prioridad **estrictamente por horario en tiempo real** (`scheduleStatus`): 1° `OPEN`, 2° `OPENING`, 3° `CLOSED`/`INACTIVE`/sin horario activo (el `status` administrativo ya no cuenta); orden estable (dentro de cada grupo se respeta el del backend). Una tienda con `status: OPEN` y `scheduleStatus: OPENING` (p. ej. Papá Helado, "Abre a las 12:00 PM") queda en el grupo 2. La píldora de horario de cada tarjeta (texto de `scheduleInfo`) es un botón que abre `StoreScheduleModal` (con `stopPropagation`, no abre la tienda).
- **FAB de pedido activo (Home, `page.tsx`):** botón flotante naranja (icono `ClipboardList`, abajo a la derecha) visible si hay un id en `localStorage['last_active_order_id']` (o `last_active_order.id`, se actualiza en `onFinalizeOrder`). Consulta `getOrderPublic` al montar y cada 30 s; se **oculta** al llegar a un estado final (`FINAL_STATUSES`). Al pulsarlo abre `OrderTrackingModal` con esa orden (en el Home el modal se monta sin `orderSummary` para no mostrar el resumen placeholder).
- `src/app/tienda/demo-mostaza/page.tsx` — demo del nicho "Mostaza" (fast food, combos por
  ranuras); hardcodea `nicheEngine="FOOD_FAST"`.
- `src/app/test-helado/page.tsx`, `src/app/test-logistica/page.tsx` — sandboxes de prueba
  (helados/variantes, motor logístico con carritos hardcodeados). No son parte del flujo real.
- **Archivadas en `_archive/` (ya NO son rutas, no compilan):** `test-plantilla` y
  `tienda/[slug]` (mocks con `STORES_DATA` hardcodeado), más `MerchantStoreView.bak.tsx` y
  `CategoryTabs.reference.tsx` (referencia de los tabs de categoría que se reconstruyeron en
  `MerchantStoreView.tsx`). No editar ni importar desde `_archive/`.
- `src/app/api/bcv/route.ts` — endpoint interno (Route Handler) que expone la tasa BCV
  (ver [§2.2](#22-tasa-bcv-y-bolívares)).

### 1.3 Componentes críticos (`src/components`)

| Componente | Rol |
|---|---|
| `CheckoutModal.tsx` | **Checkout real.** Métodos de pago desde `GET /store/{id}/payment/info`; datos del cliente, propina, **Cofre Recompensa D'una** (25% OFF flete), badge de vehículo + `vehicleType` (`MOTO`/`SEDAN`) del motor logístico, total en USD y Bs, y envío a `POST /delivery/request/purchase/web`. **Bloquea "Continuar" si `orderSummary.isOpen === false`** (ver §2.4). **Sin datos inventados:** el pedido no se envía (error controlado) si falta `merchantId`, el teléfono real del comercio (`merchantPhone`), la tasa oficial, la ubicación real, o si algún ítem no trae `id`/`code`/`price` reales; ya no hay `70`, `'04165675220'`, `101`, `'P001'` ni precio `1.0` de respaldo. **Fase 4 – Confirmación de orden (diseño original restaurado):** si la orden se crea (`code: 1`) sin comprobante (`paymentFile`) ni referencia (`paymentRef`), el paso `exito` muestra: cabecera naranja con check blanco en recuadro verde, `merchantName || 'Comercio'` y "Confirmación De Orden"; cuerpo "¡Tu pedido ya está en la cocina! 🚀" / "En D'una tú tienes el control. Elige cómo prefieres pagar:", tarjetas **Pago Express** ("Sube tu comprobante en el seguimiento de orden.") y **Pago Directo (WhatsApp)** ("Espera que {comercio} te escriba."), botón "💳 ¡Prefiero pagar ahora mismo en la plataforma!" (vuelve a la Fase 3 conservando referencia/archivo) y pie "🕒 Ver seguimiento de pedido" (`onViewTracking`; el modal toma el id de `last_active_order_id`) + "Continuar". Con comprobante o referencia se mantiene la confirmación normal. **Precarga y persistencia del cliente:** al abrir el checkout se rellenan (solo si están vacíos) nombre, cédula (`V-`/`E-`/`J-` + número) y teléfono (`+58`/`+57`/`+1`) desde `localStorage` (`customerName`/`customerDocument`/`customerPhone`, con respaldo a `name`/`document`/`phone`); tras `code: 1` se guardan esas tres claves. **La ubicación no se persiste en `localStorage`**; en `MerchantStoreView` el pin manual del mapa (`manual: true`) vive solo en esa vista y no se escribe ni en `sessionStorage` (solo el GPS/sector se recuerda en `sessionStorage['duna_customer_location']`). **Sin pedidos duplicados:** el contrato solo tiene `POST /delivery/request/purchase/web` (crea), así que tras `code: 1` `ordenCreada = true` y `handleCompleteFinalOrder` no reenvía; si el cliente vuelve a la Fase 3, el botón final pasa a **"Enviar comprobante"**: `uploadPaymentReference({orderId: response.data.id, file, referenceText})` (`PUT …/payment/reference`, sin volver a llamar a `purchase`); con `code: 1` se muestra la confirmación normal. **Ya no existe el botón "O reportar por WhatsApp"** (ni `buildWhatsAppReportUrl`): la Fase 3 con orden creada solo tiene "Enviar comprobante" y "Volver a la confirmación"; si la respuesta de compra no trae `id` o el PUT falla se muestra un mensaje de error para reintentar. **Textos al cliente sin tecnicismos:** la confirmación dice "¡Pedido enviado a {comercio}!" / "Recibimos tu comprobante de pago. El comercio está verificando tu orden." (se eliminó "…registrada con éxito en el servidor de AdonisJS"); también "Registrando tu pedido..." y "No pudimos registrar tu pedido. Revisa tus datos e inténtalo de nuevo." reemplazan las menciones a AdonisJS. **Bolsa vaciada al comprar:** tras `code: 1`, `CheckoutModal` borra `cart_data`/`current_order`/`current_cart_store_id` de `localStorage` y emite `window` event `duna:cart-cleared`; `MerchantStoreView` lo escucha y hace `updateCartStorage([])`, por lo que la barra flotante "Productos en bolsa" (`cartItems.length > 0`) se oculta al instante (antes solo se vaciaba al cerrar el checkout con "Continuar", no al ir a "Ver seguimiento"). Se envían `referenceImage` y `referenceText` juntos si el cliente cargó ambos (el contrato dice "imagen o texto": no verificado que acepte los dos a la vez). **Pendiente:** el texto "Sube tu comprobante en el seguimiento de orden" (Pago Express) sigue describiendo una función que `OrderTrackingModal` no tiene; la subida real ocurre desde la Fase 3 ("Prefiero pagar ahora mismo"). El número de orden mostrado sale de `response.data.order_number ?? orderNumber ?? id` (forma de la respuesta de compra no documentada: sin verificar en vivo, si falta se omite el número). | `serviceAmount` y `tip` viajan como string con 2 decimales. |
| `OrderTrackingModal.tsx` | Modal post-compra con 3 pestañas: **Comanda POS** (ticket térmico), **Estatus**, **Recibo**. **Tracking real:** consume `getOrderPublic(orderId)` (`GET /delivery/request/{id}/public?apiKey=`) al abrir y hace polling cada 9 s hasta estado final (`DELIVERED`/`CANCELLED`/`REJECTED`/`COMPLETED`). La pestaña Estatus dibuja `history[]` real; cliente, dirección, comercio, teléfono y `id` (ID global de la orden) salen de `data`. Los ítems/totales (que `/public` no devuelve) vienen de `localStorage['last_active_order']`, solo si su `id` coincide. Sin `orderId` o con error de API muestra un estado vacío/mensaje, nunca datos inventados. Firestore fue eliminado. **Pestaña Estatus (2026-09-20):** timeline en orden **descendente** (evento más reciente arriba, resaltado con "Estado actual"; empate de fecha → `id` mayor primero) con nombres amigables (`DRIVER_ASSIGNED`→"Repartidor asignado", `Inicia`→"Pedido registrado", `Solicitud completa`→"Notificando al comercio", `Aceptado`→"Preparando tu pedido", `Listo`→"Orden lista para entrega", `Recogido`→"Pedido entregado al repartidor", `Entregando`→"Pedido en camino" (solo textos; la lógica de fase/`driverConfirmed` usa los estados crudos); cualquier otro se limpia: `FORWARDED`→"Forwarded"); **tarjeta del repartidor** (`delivery_driver_name`, `delivery_driver_phone`, `delivery_vehicle_type/brand/color/license`) con enlace `wa.me` (teléfonos `04…` se convierten a `58…`); **Recibo:** la línea de pago dice "Pago en verificación" (ámbar), no "Pago verificado": el backend no expone una señal fiable de pago validado (`paid` viene `false` incluso en pedidos entregados). **Pickup:** el flete es 0 en el total del carrito (`CartModal`/`MerchantStoreView`). Botón "📍 Ver en Google Maps" con `current_location` (string JSON `{latitude,longitude}`) o, si no hay posición del repartidor, la dirección de entrega (`customer_address` / `customer_address_text`). Campos verificados en DEV (órdenes con conductor, p. ej. #1564, #1578); `current_location` puede venir `null`. |
| `MasterProductModal.tsx` | Modal maestro de producto. **Combos por ranuras** (`ComboSlot`, `slotGroups`, `slotsCount`). Grupos `SINGLE` (selección única) vs `MULTIPLE` (contadores); `pricingRole` `BASE` (reemplaza el precio) vs `ADDON` (suma); mínimos por `minItems`; precio inicial desde `metadata.price.basePrice` (`infoPrice` es solo referencial, arranca en $0); arma `variants` + `pricing` estructurados para el carrito. Las opciones se dibujan como **cápsulas táctiles** (`OptionCapsule`, con etiqueta de precio extra en $ y Bs vía `getOptionPriceLabels`): solo presentación, los handlers y cálculos no cambian. Recibe `nicheEngine` (un `ModalEngine`, ver §4) y `bcvRate` real. |
| `CartModal.tsx` | **Carrito real.** Cada ítem se identifica por `cartItemId` (`productCode::JSON(variants)`), así sabores distintos del mismo producto no se fusionan. |
| `MerchantStoreView.tsx` | **Vista de tienda real** (catálogo). Hero con badges de confianza y "Destacado de hoy", franja `PromotionsCarousel`, tabs de categoría reales, buscador, grilla. Ver §4.1. |
| `PromotionsCarousel.tsx` | Franja "Promociones Imperdibles" (scroll horizontal). Recibe el array de promociones y un `onSelectPromotion`; no hace fetch propio; retorna `null` si el array está vacío. Usada en el Home y en cada tienda. |
| `OrderTimelinePanel.tsx` | Vista de seguimiento **compartida** por la pestaña Estatus de `OrderTrackingModal` y la página `/order/[orderId]/timeline` (props: `remote`, `trackingError`). **Sin tarjeta de cliente ni coordenadas** (cero scroll). En orden: (1) **tarjeta del código de entrega** — solo en la fase `arrived` ("Llega a sitio") y pedido no final: "🔑 ¡TU REPARTIDOR ESTÁ EN LA PUERTA!" + "Código de entrega: [ código ]" + "Dicta este código…" con pulso; en cualquier otra fase el código no se renderiza; (2) **ficha compacta del repartidor** (foto `delivery_avatar` o iniciales, nombre, vehículo `tipo marca`, color, placa). **Clasificación (corregida tras la orden #55):** `driverConfirmed` (en `getTrackingState`) es verdadero **si y solo si** el historial contiene `DRIVER_ASSIGNED` (o un estado posterior de entrega: `TAKEN`, `Entregando`, `Llega a sitio`, `Entregado`). **`Recogido` / "Pedido en camino" NO confirma al chofer** (es despacho de la tienda/sistema; el sistema asigna preliminarmente a un chofer de turno que puede no aceptar y la orden rota, caso orden #57) → título "REPARTIDOR ASIGNADO" + WhatsApp verde habilitado (`wa.me` con `delivery_driver_phone`); solo sin ninguno de esos eventos (rotación por turnos, chofer tentativo) → "REPARTIDOR DE TURNO" + WhatsApp gris deshabilitado ("Contacto por WhatsApp disponible al confirmar la carrera"). Antes `DRIVER_ASSIGNED` estaba mal clasificado como "de turno". La ficha se oculta al entregarse/cancelarse; (3) botón "🛵 Sigue tu pedido en línea" que **reemplaza el enlace externo a Google Maps** y abre en la misma pantalla el mapa embebido `LiveOrderMap` (al abrirlo se oculta el timeline; "Ver seguimiento" vuelve al timeline; solo mientras el pedido no es final y haya alguna coordenada); (4) timeline descendente con nombres amigables. **Cierre al entregar** (`Entregado`/`DELIVERED`/`COMPLETED`): modal "¡Orden entregada con éxito!" con calificación 1–5 del servicio y del comercio; al enviar o cerrar (X) se marca `duna_order_closed_{id}` (no vuelve a aparecer), se borran `last_active_order`/`last_active_order_id` (solo si son de esa orden) y se emite el evento `duna:order-closed`, que `page.tsx` escucha para ocultar el FAB. **La calificación solo se guarda en `localStorage['duna_order_rating_{id}']`: el backend no tiene endpoint de calificación** (se probaron `scoring/score/rating/rate/qualify/review` bajo `/delivery/request/{id}/…` → `E_ROUTE_NOT_FOUND`); pendiente confirmar con Osvaldo (el campo `request_scoring` viaja en `/public`). |
| `LocationPickerModal.tsx` | Selector de **dirección de entrega alterna** (pin del mapa en `CartModal`): mapa de Google Maps JS con pin arrastrable/clic, buscador (Places Autocomplete + Geocoder, restringido a Venezuela), dirección por Geocoder inverso y aviso de distancia a la tienda. Clave: `NEXT_PUBLIC_GOOGLE_MAPS_KEY` (con respaldo a la clave oficial). Devuelve `{lat, lng, address}`; `MerchantStoreView` la guarda como `customerLocation` y el efecto de cotización recalcula distancia, bloqueo de 12 km y `getDeliveryRate`. || `theme.ts` | Tokens de tema compartidos (colores, branding `#fe6712`). |
| `LiveOrderMap.tsx` | Mapa de Google **embebido** en el seguimiento (`OrderTimelinePanel`): marcadores del comercio 🏪 (`food_store_location`), dirección del cliente 🏠 (`customer_address`) y repartidor 🛵 (`current_location`), todos parseados con `parseCoords` (string JSON). Iconos SVG generados en código (sin archivos). Las posiciones llegan por props, así que el repartidor se mueve con cada ciclo de polling (9 s); el encuadre (`fitBounds`) solo se recalcula cuando aparece/desaparece un punto, no en cada ciclo. Altura `36vh` (mín. 210, máx. 300 px). |
| `StoreScheduleModal.tsx` | Horario semanal del comercio: `getStoreSchedule(id)` → `GET /store/{id}/schedule/open?apikey=` (query **y** header). Respuesta real: `data[] = { id, day (monday…sunday), name, open_time "HH:mm", close_time "HH:mm", food_store_id, status "ACTIVE" }` (ojo: snake_case, no `openTime`). Lista Lunes→Domingo en 12 h ("9:00 PM"), resalta el día de hoy (zona America/Caracas), días sin fila = "Cerrado", status ≠ ACTIVE se muestra tal cual. El backend escribe "Miercóles": se usan nombres locales por clave `day`. |
| `MerchantTemplateEngine.tsx` | **Motor multiplantilla** (layout contenedor, solo presentación). **Integrado en `MerchantStoreView`** (2026-09-21): la vista de tienda se monta dentro del motor cuando `templateNicheFromStoreNiche(storeNiche)` devuelve plantilla (FAST_FOOD/PIZZERIA/SEAFOOD→`fast-food`, FOOD_SWEETS→`ice-cream`, FASHION→`boutique`, TECH/PARTS_CATALOG→`tech`, LIQUOR_GOURMET→`bodegon`, MINIMARKET→`minimarket`, PHARMACY→`farma`); `GENERIC` se muestra como antes, sin motor. En modo motor: el hero entra por la prop `hero`, el navbar muestra el BCV real y su botón de carrito abre el `CartModal` existente (`onOpenCart`; el drawer interno queda sin uso), las categorías salen de `productCategories` (`filters`/`activeFilter`/`onFilterChange` = `selectedCategory`) y **reemplazan** las pestañas y las insignias propias de la vista (se pintan una sola vez), el `MasterProductModal` lo monta el motor con el mismo `storeNiche` y `handleAddToCartFromModal` (montaje condicional idéntico), y el buscador pegajoso baja a `top-[61px]` bajo el navbar. Sin handler no se dibuja el probador virtual (boutique), el toggle de fichas técnicas (tech) ni el buscador propio de farma (la vista ya tiene el suyo): hoy esos handlers no existen en el proyecto. Verificado en un servidor de desarrollo aislado (Papá Helado, Farma D'una Virtual, Franela Store): chips filtran la grilla (30→13), el modal abre, agregar actualiza la barra de bolsa y el contador del navbar sin abrir el carrito solo, y sin errores de consola. Prop `niche`: `'fast-food' | 'boutique' | 'tech' | 'ice-cream' | 'minimarket' | 'bodegon' | 'farma'` (se traduce a `StoreNiche` de `nicheConfig` para badges, umbral gamificado y `getModalEngine`). Núcleo universal: navbar corporativo (píldoras BCV y Wallet solo si el padre pasa valores reales, botón de carrito), drawer del carrito con termómetro gamificado (umbral de `nicheConfig.cartGamification.thresholdLabel` o prop `freeShippingThreshold`) y `MasterProductModal`. Cabecera por nicho: moods con emoji (fast-food), botón de probador virtual (boutique, solo si llega `onOpenVirtualFitter`), toggle de fichas técnicas (tech), chips de formato/pasillos (ice-cream/minimarket), aviso +18 (bodegón) y buscador por principio activo con aviso sanitario (farma). Filtros = categorías reales de `products` o `filters`. **No calcula precios, no toca el carrito ni el backend:** todo por props/callbacks; el catálogo entra como `children`. |
**Componentes sin importadores** (verificado por grep 2026-09-20; código huérfano, no forman
parte del flujo real): `PaymentModal.tsx` (prototipo anterior del checkout con bancos
fijos), `OrderSuccessModal.tsx` (con la lógica condicional `pagoAnexado` de "Pago Express /
Pago Directo WhatsApp", nunca conectada), `CartDrawer.tsx`, `VariantModal.tsx`,
`PharmacyStoreView.tsx`, `MapTracker.tsx`, `Header.tsx`, `Navbar.tsx`. Antes de reutilizar
uno, confirmar con el usuario.

### 1.4 Lógica de negocio (`src/lib`)

| Archivo | Responsabilidad |
|---|---|
| `logisticsEngine.ts` | **Motor logístico y de flota** (asignación de vehículo por peso/volumen/dimensión, cálculo de costo de envío, cálculo de distancia/duración haversine). Ver [§3](#3-logística-y-transporte-duna-delivery). |
| `deliveryGps.ts` | Cálculo de tarifa de flete real vía GPS estricto (`calculateStrictGpsFare`): consulta distancia real, aplica límite de 12 km de servicio, y llama al endpoint del backend `deliveryRate` para el precio oficial. |
| `bcvRate.ts` | `getBCVRate()` → `number \| null`: consulta `/api/bcv` (solo Home/listados) y persiste la última tasa **real** en `localStorage['duna_tasa_bcv_v2']`. **Sin fallback fijo:** si no hay tasa viva ni guardada devuelve `null` y la UI oculta los Bs. (la clave `_v2` descarta el `48.50` inventado que guardaba la versión anterior). |
| `nicheConfig.ts` | **Motor multi-nicho v2** (10 nichos + fallback). Ver §4. Reemplazó al detector viejo de 6 nichos (`BOUTIQUE`/`ABASTO`/`BODEGON`/`GENERAL`/`getNicheFeatures`, ya no existen). |
| `nicheIcons.tsx` | Traduce los slugs de ícono de `nicheConfig` (estilo FontAwesome, ej. `fa-solid fa-snowflake`) a componentes de `lucide-react` (`getNicheIcon`) y los `colorToken` de los badges a clases Tailwind (`getBadgeColorClasses`). Slug no mapeado → `ShieldCheck` + `console.warn`. |
| `orderTracking.ts` | Helpers del seguimiento: `FINAL_STATUSES`/`isFinalStatus`, `friendlyStatus`, `parseCoords`, `toWhatsAppNumber` (`04…` → `58…`), y la **fase** del pedido: `sortHistoryDesc`, `trackingPhase`/`getTrackingState` → `driver_assigned` \| `on_route` (TAKEN/Recogido/Entregando/En camino) \| `arrived` (Llega a sitio/Llegó) \| `delivered` \| `other`, más `deliveryCode` (`delivery_code`, alias `code`/`pin`/`confirmation_code`). La fase sale del evento **más reciente** del historial. |
| `googleMaps.ts` | `loadGoogleMaps()` (carga única del script de Maps JS con `NEXT_PUBLIC_GOOGLE_MAPS_KEY`, respaldo a la clave oficial) compartido por `LocationPickerModal` y `LiveOrderMap`; declara `window.google`. |
| `useArrivalAlert.ts` | Hook: al detectar la **transición** a `arrived` mientras el modal/página están abiertos, toca un chime (Web Audio API, dos senoidales 659 Hz + 988 Hz, sin mp3) y `navigator.vibrate([200, 100, 200])`. No suena si el pedido ya estaba en `arrived` al cargar. Los navegadores exigen un gesto previo del usuario para audio/vibración (el `AudioContext` se desbloquea en el primer clic/toque/tecla). `OrderTrackingModal` lo llama a nivel de modal (funciona aunque la pestaña visible no sea Estatus, y cambia a Estatus al llegar/entregar); la página `/timeline` también. |

### 1.5 Servicios y tipos

- `src/services/marketplaceService.ts` — cliente HTTP centralizado hacia el backend AdonisJS
  (`apiFetch`, `submitPurchaseOrder`, `getDeliveryRate` → `GET /delivery/request/purchase/deliveryRate` (ver §3.2), `getStoreSchedule` (ver `StoreScheduleModal`), `uploadPaymentReference` → `PUT /delivery/request/{orderId}/payment/reference` (multipart: `referenceImage` archivo y/o `referenceText`; ruta verificada en DEV con un id inexistente → `{code:0, message:"E_ROW_NOT_FOUND"}`; el caso de éxito NO se probó para no tocar órdenes reales), `getOrderPublic` → `/delivery/request/{id}/public?apiKey=` (verificado con la orden #1620: `data` trae `order_number`, `customer_name`, `customer_address_text`, `food_store`, `status`, `history[{id,status,date}]`, `totalPaidDefaultAmount`/`totalPaidReferenceAmount`), `getStorePaymentInfo`, `getProductsByStore`, `getProduct`
  → `/product/{id}/web`, y `getStorePromotions(storeCode)` → `GET /promotion?store={code}`).
  Headers obligatorios: `apiKey`, `timeZone` (SIN prefijo `X-`).
- **Promociones** (`GET /promotion`, verificado contra el backend real el 2026-09-16): filtra
  por el **código/slug** de la tienda (ej. `papa-helado`), no por el id numérico; con
  `store=` vacío devuelve las de varias tiendas. `amount` viaja como **string**. Solo está
  confirmado que en `type: "pricing"` el `amount` es el precio final; no hay muestras de
  `gift`/`discount`, así que no se calcula precio para esos tipos. El único identificador de
  producto es `productHash`.
- `src/types/store.ts` — tipos base: `Product` (incluye metadatos de cubicaje opcionales:
  `weightKg`, `lengthCm`, `widthCm`, `heightCm`), `CartItem`, `Merchant` (incluye envío
  nacional: `isNationalShippingEnabled`, `preferredNationalCouriers`), `CheckoutSummary`
  (incluye metadatos de checkout híbrido: `esEnvioNacional`, `agenciaNacional`,
  `modalidadNacional`, `costoEnvioNacional`).

### 1.6 Contrato con el backend (referencia rápida)

Ver `DOCUMENTO_TECNICO_OSWALDO.md` para el detalle completo. Resumen:

- **Endpoint**: `POST /delivery/request/purchase/web` (multipart/form-data: `orderData` JSON
  string + `paymentFile` opcional).
- **Headers**: `apiKey`, `timeZone` (nunca `X-API-Key`).
- **Códigos de negocio**: `1` = éxito, `15` = validación/comercio cerrado, `21` = inconsistencia
  de montos (revisar que `totalPaidDefaultAmount` = subtotalNeto + envío + propina en USD, y
  `totalPaidReferenceAmount` = totalFinalUSD × tasaBCV en Bs).

---

## 2. Reglas de Negocio y Lógica Financiera / Fiscal

### 2.1 Cofre Recompensa D'una (25% OFF en flete)

**Regla**: descuento exclusivo del **25% sobre el costo de envío (flete)** al completar la
dinámica de fidelización en la fase de pago. **Nunca** se aplica sobre productos ni sobre la
propina.

- Implementado en `src/components/CheckoutModal.tsx` (estado `orderCount`/`usarRecompensa`,
  cálculo `descuentoUSD`, y bloque visual en el paso de instrucciones de pago).
- `orderCount` arranca en 3 y el botón "3 de 3" alterna 2↔3: es un **simulador**, no lee el
  historial real de pedidos del cliente (pendiente de conectar al backend).
- Elegibilidad: `orderCount >= 3 && metodoEntrega === 'delivery'` (simula 3 pedidos previos
  como umbral de desbloqueo; UI muestra progreso "2 de 3" → "3 de 3 (¡Desbloqueado!)").
- El usuario decide en el momento si **usa** el cupón (`usarRecompensa = true`, aplica
  `descuentoUSD = costoEnvio * 0.25` de inmediato) o lo **guarda para después**.
- Fórmula final: `totalFinalUSD = subtotalNeto + costoEnvio + propina - descuentoUSD`.
- El descuento se propaga al ticket/comanda (`OrderTrackingModal.tsx`, campo
  `orderData.descuentoUSD`) mostrando el flete tachado (precio original) junto al monto final
  con la etiqueta `(Cofre -25%)`.

### 2.2 Tasa BCV y Bolívares

**Regla estricta**: la **tasa de referencia** (`Tasa Ref. Bs. X.XX`) y el **monto total en
Bolívares** (`Bs.S`) son dos datos independientes y **jamás se combinan en una sola línea**.
Siempre se muestran en renglones/celdas separadas.

- **Fuente de verdad por pantalla (2026-09-20, sin tasas fijas en ningún archivo):**
  - **Tienda (`MerchantStoreView`) y Checkout (`CheckoutModal`):** estrictamente
    `store.referenceRateValue` de `GET /store/{id}/payment/info` (verificado: Papá Helado = 849.56).
    Si no llega, la tasa queda `null`: la tienda no muestra Bs. y el Checkout **no deja continuar** ("No se
    pudo obtener la tasa oficial del comercio") ni enviar el pedido.
  - **Home, listados y `Navbar`:** `GET /api/bcv` → `getBCVRate()`. La ruta consulta
    `https://ve.dolarapi.com/v1/dolares/oficial` (campo `promedio`, tasa BCV oficial; el endpoint
    `/v1/dolares/bcv` que se usaba devuelve **404**, por eso antes siempre caía al 48.50 falso). Timeout 4 s,
    revalidación 1 h. Si falla responde `{success:false, tasa:null}` con HTTP 503; **ya no existe el
    fallback corporativo 48.50**. Sin tasa, el Home muestra "Tasa BCV: no disponible" y solo precios en USD.
  - **Ticket (`OrderTrackingModal`):** tasa guardada en el pedido, o la deducida del backend
    (`totalPaidReferenceAmount / totalPaidDefaultAmount`); sin ninguna, no dibuja las líneas Bs.
- Fórmula: `Total Bs. = Total Final USD × Tasa Ref.` (única fuente de verdad en el ticket:
  `displayTotalBs = displayTotal * tasaRef` en `OrderTrackingModal.tsx`).
- `MasterProductModal` recibe `bcvRate: number | null` y omite los montos en Bs. cuando es `null`.
- En el ticket (`OrderTrackingModal.tsx`, Comanda POS y Recibo) el bloque de cierre es una
  cuadrícula de 2 columnas con los montos alineados a la derecha:
  ```
  TOTAL ................ $76.60                ← total en USD
  Ref Bs.S 842,21 ...... Bs.S 64.505,00        ← tasa (etiqueta) | total en Bs. (monto)
  ```

### 2.3 Estructura de Recibos y Comandas (POS)

Implementado principalmente en `src/components/OrderTrackingModal.tsx`, pestaña
**"Comanda POS"** (ticket de impresora térmica) y su espejo en **"Recibo"**.

- **Productos simples** (sin variantes/breakdown): fila tradicional simétrica —
  `[Cant] [Nombre] .......... [Monto total línea]`, en negrita, alineado con `flex justify-between`.
- **Productos compuestos (combos/sabores/ranuras)**:
  1. Nombre del producto padre centrado, entre separadores: `-------- NOMBRE --------`.
  2. Debajo, cada variante/ranura seleccionada con su cantidad exacta:
     `[Qty] [Nombre variante] .......... [Monto]` (o vacío si el monto es 0, p. ej. una
     exclusión "Sin cebolla" se muestra en rojo/negrita sin monto).
  3. Al cierre del bloque, una única línea `Subtotal .......... [monto total del ítem]`
     en negrita — **no se repiten etiquetas "SUBTOTAL" en los renglones intermedios de
     variantes**, solo al cierre del bloque completo.
  4. Los montos siempre alineados limpiamente a la derecha (`shrink-0`, `text-right`).
- Función que aplana la estructura: `getItemBreakdownRows()` (`OrderTrackingModal.tsx`) — lee `item.variants` (grupos con `.selected` o `.items[]`) y/o
  `item.breakdown` (líneas de texto, detectando exclusiones con regex `/sin\s/i`).
- El documento siempre lleva el disclaimer: *"Este documento es una Comanda / Orden de
  Compra interna y no constituye factura fiscal."*
- Cierre financiero del ticket, en este orden: Subtotal general → Envío/Domicilio (con
  Cofre si aplica) → Propina (si > 0) → Total (USD + línea Ref Bs.S separada, ver §2.2) →
  Forma de pago (checkboxes ☑/☐) → Notas.
- Formato térmico monoespaciado: separadores `----------------------------------------`,
  cabecera con `COMANDA N°`, fecha/hora y tipo (Delivery/Retiro), datos del cliente (nombre,
  teléfono, dirección) y pie con "¡Gracias por tu pedido!" + "Preparado por: ______".

### 2.4 Tienda cerrada (`isOpen`)

- `page.tsx` deriva `isOpen = store.status === 'OPEN'` (campo real de `GET /store/find`) y lo
  pasa en `mappedInfo` y en `orderSummaryData` (junto con `scheduleInfo`, que sale de
  `mappedInfo.badge`).
- **Promociones:** el "Destacado de hoy" del hero, la franja de promociones de la tienda y
  la del Home solo se muestran con la tienda abierta (en `MerchantStoreView.tsx` con la
  variable compartida `canShowPromotions`; en el Home se filtra por `storeCode` contra las
  tiendas con `status === 'OPEN'`).
- **Checkout:** en el paso "Continuar al pago" de `CheckoutModal.tsx`, si
  `orderSummary.isOpen === false` se muestra "Este Comercio Se Encuentra Cerrado" (con el
  horario debajo) y el botón queda `disabled`. Se usa `=== false` a propósito: si el dato
  no llega (`undefined`) NO se bloquea la compra.
- **No bloqueado (pendiente):** entrar a una tienda cerrada (`handleStoreClick`), agregar al
  carrito y abrir el carrito siguen permitidos; solo el checkout se bloquea.
- El backend documenta `code: 15` (`"...el comercio no está abierto"`) para
  `POST /delivery/request/purchase/web`, y `CheckoutModal.tsx` muestra cualquier
  `response.message` de error en una caja roja. **No se verificó en vivo** que el DEV
  backend efectivamente rechace pedidos a tiendas cerradas.

---

## 3. Logística y Transporte (D'una Delivery)

Motor central: `src/lib/logisticsEngine.ts` (`calculateLogistics`).

### 3.1 Regla de asignación de flota por volumen y peso

Se evalúa en cascada (moto → auto/sedán → camioneta → camión 350 → gandola), asignando el
**primer vehículo** en el que la carga total quepa en peso, volumen **y** dimensión máxima:

| Vehículo | Peso máx. | Volumen máx. | Dimensión máx. de lado | Tarifa base | Tarifa/km |
|---|---|---|---|---|---|
| 🛵 **Moto** (`moto`) | 15 kg | 91,125 cm³ (~45×45×45) | **45 cm** | $1.00 | $0.50 |
| 🚗 **Sedán/Baúl** (`auto`) | 80 kg | 350,000 cm³ | 90 cm | $2.50 | $0.80 |
| 🛻 Pick-Up (`camioneta`) | 750 kg | 1,800,000 cm³ | 200 cm | $7.00 | $1.50 |
| 🚚 Camión 350 (`camion_350`) | 3,500 kg | 12,000,000 cm³ | 350 cm | $25.00 | $2.50 |
| 🚛 Gandola (`gandola`) | 30,000 kg | 70,000,000 cm³ | 1,200 cm | $120.00 | $4.00 |

**Regla clave solicitada por el negocio**: hasta **45×45 cm y máximo 15 kg → MOTO**;
superando esas medidas o ese peso, pasa automáticamente a **SEDÁN** (y así sucesivamente
hacia arriba en la tabla si se siguen excediendo los límites).

- Peso volumétrico: `volumenTotalCm3 / 5000` (kg). El **peso facturable** es el mayor entre
  peso real y peso volumétrico (`pesoFacturableKg = max(pesoTotalKg, pesoVolumetricoKg)`).
- Valores por defecto si el producto no declara cubicaje: peso 0.25 kg, 15×10×5 cm.
- Costo de envío: `tarifaBaseUSD + (distanciaKm * tarifaPorKmUSD)` del vehículo asignado.

### 3.2 Cálculo de distancia y GPS estricto

- `getDistanceAndTime()` (`logisticsEngine.ts`) calcula distancia haversine y duración
  estimada a 30 km/h.
- `calculateStrictGpsFare()` (`src/lib/deliveryGps.ts`) es el flujo de producción real:
  requiere coordenadas GPS exactas del cliente, **rechaza el servicio a más de 12 km** de
  distancia, y consulta el endpoint del backend (`/delivery/request/purchase/deliveryRate`)
  para obtener la tarifa oficial — el cálculo local del motor logístico (`logisticsEngine.ts`)
  sirve de simulador/fallback y para asignación de tipo de vehículo, no reemplaza el precio
  oficial del backend.
- **Flete dinámico real (2026-09-20):** `MerchantStoreView.tsx` cotiza cuando el carrito está
  abierto en modo delivery: toma la ubicación del cliente (GPS vía el botón "Mi Ubicación" de
  `CartModal`, o la ubicación ya elegida en el Home, guardada también en
  `sessionStorage['duna_customer_location']`), calcula distancia/tiempo contra `merchant.coords`
  (`getDistanceAndTime`, haversine a 30 km/h), **bloquea a más de 12 km** ("Servicio no disponible
  a más de 12km") y llama a `getDeliveryRate({storeId, lat, lng, distance, duration})`
  (`marketplaceService.ts`). Contrato verificado en DEV: hasta 12 km → `{code:1, data:{rate}}`
  (Papá Helado: 1 km=$1, 3=$3, 6=$4.5, 8=$5.5, 12=$6, tope `deliveryMaximumRate`); desde 13 km →
  `{code:1, data:{message:"Servicio de entrega no disponible para tu ubicación"}}`; `storeId`
  inexistente o parámetros faltantes → HTTP 500 sin `code`. Sin cotización exitosa el botón
  "PROCEDER AL PAGO" queda deshabilitado y el flete se muestra "—" (la tarifa mínima de la
  tienda solo se usa como referencia interna, nunca se cobra). `distance` (km, 1 decimal) y
  `duration` (minutos) viajan a `CheckoutModal` en `orderSummary` (`location`, `distanceKm`,
  `durationMin`) y de ahí al `orderData` (`location`, `distance`, `duration`, textos y
  `serviceAmount` con 2 decimales). Pickup/nacional: `distance=0`, `location` = cliente si se conoce, si no la
  tienda. `CheckoutModal` no envía el pedido si falta `location`. **Ubicación alterna (2026-09-20):** el pin de `CartModal` abre `LocationPickerModal`; al confirmar se reemplaza `customerLocation` (`label` = dirección del mapa) y todo lo demás (distancia, bloqueo >12 km, `getDeliveryRate`, `direccion`/`location` hacia `CheckoutModal`) se recalcula con el mismo efecto que usa el GPS. El botón "Nacional" no se modificó. `deliveryGps.ts` ahora delega en
  `getDeliveryRate` (sigue sin importadores).
- **Integración en el checkout:** `CheckoutModal.tsx` corre `calculateLogistics()` sobre los
  ítems del carrito, muestra el badge "Vehículo asignado" (solo en delivery) y envía
  `vehicleType` (`MOTO` si es `moto`, `SEDAN` para cualquier otro vehículo) dentro de
  `orderData`. Es informativo: no altera `serviceAmount` ni el Cofre. Ningún producto real trae
  peso/dimensiones del backend, así que se usan los valores por defecto y casi todo pedido
  resulta `MOTO`. `vehicleType` no figura en el contrato documentado del endpoint de compra:
  pendiente de confirmar con Osvaldo que lo acepte/use.

### 3.3 Envío nacional (fase adicional, metadatos ya en tipos)

`src/types/store.ts` ya contempla envío interurbano vía couriers nacionales (`MRW`, `ZOOM`,
`TEALCA`, `LIBERTY`), modalidad `PREPAID` o `COD` (cobro a destino) — ver `Merchant` y
`CheckoutSummary`. Confirmar con el usuario el estado de implementación real en UI antes de
asumir que está activo en un flujo específico.

---

## 4. Personalización de Nicho y Combos

### 4.0 Motor multi-nicho (`src/lib/nicheConfig.ts`, v2)

Separa dos preguntas que antes estaban mezcladas en un solo campo:

- **`StoreNiche`** — nicho de **negocio** (fino, 10 valores + fallback): `FOOD_SWEETS`,
  `FAST_FOOD`, `PIZZERIA`, `FASHION`, `TECH`, `SEAFOOD`, `LIQUOR_GOURMET`, `MINIMARKET`,
  `PARTS_CATALOG`, `PHARMACY`, `GENERIC`. Define hero, filtros, tarjetas y badges de confianza.
- **`ModalEngine`** — motor del **modal de producto** (grueso, 4 valores): `FOOD_FAST`,
  `FOOD_SWEET`, `BODEGON_MARKET`, `STANDARD`. Es lo único que `MasterProductModal` necesita
  como prop `nicheEngine` (define qué upsells/mecánica usa). Varios `StoreNiche` comparten
  motor (p. ej. `FAST_FOOD` y `PIZZERIA` → `FOOD_FAST`).

Funciones exportadas:

| Función | Uso |
|---|---|
| `detectStoreNiche(store)` | Detecta el nicho por `categoriesName` real del backend (ej. `"Heladerías "`, se hace `trim`), con fallback por palabras clave en nombre/código. Requiere que `merchant` traiga `categoriesName` (ver `mappedInfo` en §1.2). |
| `getModalEngine(niche)` | `StoreNiche` → `ModalEngine`. Es lo que se le pasa a `MasterProductModal` (ya no está hardcodeado `"FOOD_SWEET"`). |
| `getNicheConfig(niche)` | Config visual: `heroVariant` (`PROMO_HERO`/`STAT_HERO`), `filterType`, `productCardVariant`, `trustBadges`, `cartGamification`. **Hoy solo se consumen `heroVariant` y `trustBadges`**; `filterType`, `productCardVariant` y `cartGamification` están definidos pero ninguna UI los lee todavía (los tabs son siempre por categoría de producto y el umbral de envío gratis sigue en `MerchantStoreView`: 20, o 15 en modo `FIXED`). |
| `categoryRequiresAgeGate(category)` | Age-gate por **categoría de producto** (nunca por tienda). Definida pero **aún no conectada a ninguna UI**. |
| `productRequiresPrescriptionNotice(activeIngredient)` | Aviso de prescripción. Su lista arranca **vacía a propósito**: no es decisión de frontend qué medicamento requiere receta; no completar sin confirmación legal. Hoy siempre devuelve `false`. |

Los nichos NO reconocidos caen en `GENERIC` (sin badges, sin promo hero forzada).

### 4.1 Catálogo de tienda (`MerchantStoreView.tsx`)

Orden visual de arriba hacia abajo:

1. **Hero:** banner (`merchant.banner`, con gradiente de respaldo) y, solo si la tienda está
   abierta y el nicho es `PROMO_HERO`, la tarjeta "Destacado de hoy" (z-20 para quedar sobre
   la tarjeta de info). El destacado sale de las promociones reales (`role === 'primary'`,
   o la primera); sin promociones cae a la heurística temporal (primer producto con
   `metadata.price.promoPrice`, o `products[0]`) — **`// TODO`: definir con negocio si el
   destacado lo elige el comercio o es automático.**
2. **Tarjeta de info** de la tienda (avatar real, categoría, rating, tiempo, delivery).
3. **Badges de confianza** (`nicheConfig.trustBadges`, íconos vía `nicheIcons.tsx`,
   scroll horizontal en mobile).
4. **Promociones Imperdibles** (`PromotionsCarousel`). Click → abre el modal del producto
   reutilizando `handleProductClick` con `productHash` como id (el contrato acepta id o hash);
   si la promo no trae `productHash`, no hace nada.
5. **Tabs de categoría** derivados de `products.map(p => p.category)` (únicos, en orden de
   aparición, "Otros" si falta la categoría). Se combinan (AND) con el buscador de texto.
6. **Buscador** y grilla de productos. **Tarjeta de producto (2026-09-21):** grilla `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` con tarjeta vertical (imagen `object-contain`, etiqueta superior = `brand`/`laboratory` si existen, si no `category`; título; subcategoría = `internalCategory` en `text-brand-orange`; precio; "Ver Ficha"; botón "+ Agregar"). El `onClick` del contenedor sigue siendo `handleProductClick` (abre el modal maestro): "Ver Ficha" y "+ Agregar" no tienen handler propio, disparan ese mismo clic por propagación. La insignia (Marca Oficial azul / Genérico verde) solo se dibuja si el producto trae `isOfficialBrand` / `isGeneric`: hoy el backend no envía esos datos, por eso no aparece. `tailwind.config.js` define el color `brand-orange` (`#fe6712`).
- `src/components/MasterProductModal.tsx` implementa **combos por ranuras estilo Mostaza**:
  - `ComboSlot`, `slotGroups`, `slotsCount`/`slots` definen cuántas "ranuras" tiene un combo
    y qué grupos de variantes puede tener cada ranura.
  - `isSlotMode` se activa si el producto es combo, o si `qty > 1` y el usuario activa
    personalización manual (`isSlotCustomizationActive`).
  - `targetSlotCount = baseSlotCount * qty` cuando es combo (cada unidad extra del combo
    multiplica las ranuras a personalizar).
  - La demo de referencia visual de este patrón vive en `src/app/tienda/demo-mostaza/page.tsx`.
- **Carrito y variantes:** `MasterProductModal` entrega al carrito `variants` (por grupo:
  `selected` para `BASE`/`SINGLE`, `items[]` con cantidad para `MULTIPLE`) y `pricing`
  (`unitBasePrice`, `addonsTotal`, `unitFinalPrice`). `CheckoutModal` los reenvía en
  `orderData.data[]`; el backend recalcula precios con su propio catálogo por `code` de
  variante, así que esos `code` deben coincidir con los del backend.

---

## 5. Notas de mantenimiento

- `_archive/` (raíz del repo, fuera de `src/`) guarda material retirado. **Está en el
  `exclude` de `tsconfig.json`** (igual que `Nextjs-Clean`): `include` toma `**/*.tsx`, así
  que cualquier carpeta con TSX suelto rompe `next build` si no se excluye. Contenido:
  `MerchantStoreView.bak.tsx`, `CategoryTabs.reference.tsx`, `test-plantilla.page.reference.tsx`
  y `tienda-slug.page.reference.tsx`. Es solo referencia; no importar ni editar como código
  activo. Los `.reference.tsx` se movieron ahí porque mover un `page.tsx` fuera de `src/app`
  quita la ruta del build.
- El backend recalcula los precios por `code` de variante según el contrato (§8.3 del
  documento técnico); se documenta como comportamiento del contrato, no se probó en vivo.

### Deuda técnica conocida (a 2026-09-20)

- `handleStoreClick` (`page.tsx`) no bloquea la entrada a tiendas cerradas; solo el checkout.
- **Mapa de seguimiento:** las coordenadas del repartidor (`current_location`) en DEV son de prueba (California/Colombia, p. ej. `37.42,-122.08`), por lo que el encuadre automático puede quedar muy alejado; en producción debería traer la posición viva. Requiere Maps JavaScript API habilitada y la clave restringida por dominio.
- **Seguridad del código de entrega:** `GET /delivery/request/{id}/public` devuelve `delivery_code` desde que se crea el pedido (verificado en DEV: p. ej. "496" con el pedido recién iniciado) y los ids son secuenciales. La UI lo oculta hasta "Llega a sitio", pero cualquiera que llame al endpoint puede leerlo antes. Solución real = backend (Osvaldo): no exponer `delivery_code` en `/public` hasta ese estado.
- **Google Maps:** la clave del navegador (`NEXT_PUBLIC_GOOGLE_MAPS_KEY`) debe restringirse por dominio (HTTP referrer) y tener habilitadas *Maps JavaScript API* y *Geocoding API* (verificada: Geocoding responde OK); *Places API* es opcional (sin ella el buscador usa solo Geocoder). La página `/order/[orderId]/timeline` es pública y los ids son secuenciales: cualquiera puede consultar pedidos ajenos (nombre, dirección, chofer); es lo que expone el endpoint `/public` del backend.
- Pendiente de purga (no forman parte del flujo real): `tienda/demo-mostaza` pasa `bcvRate={40}` fijo y `nicheEngine="FOOD_FAST"`; `MerchantStoreView` usa `price || 1.5` como precio de respaldo del detalle de producto si el backend no lo trae; `CheckoutModal` envía `discountAmount: "0"`/`totalWithoutDiscount` iguales al total aunque el Cofre descuente flete (sin verificar contra el backend, posible causa de `code: 21`).
- `page.tsx` ya no usa `phone: '584140000000'` de respaldo: si el comercio no trae teléfono, el checkout bloquea el pedido.
- El botón de mapa (pin) de `CartModal` no tiene selector de mapa; la ubicación viene de GPS o del Home. La distancia es en línea recta (haversine), no por ruta.
- Si el flete es gratis por umbral (`esEnvioGratis`), `serviceAmount` viaja en 0; no verificado contra el backend.
- El Cofre Recompensa usa un contador simulado (ver §2.1).
- Los flujos "Pago Express / Pago Directo (WhatsApp)" y "pagar ahora en la plataforma" no
  existen en el flujo real (solo en componentes huérfanos, y el tercero en ninguno).
- `src/lib/deliveryGps.ts`, `src/app/page.tsx` y `src/services/marketplaceService.ts` son
  los únicos archivos con fallback de API key; los tres usan `bf8f1b64-…`.
- Varios archivos tienen diffs previos sin commitear ajenos a estas tareas (p. ej. una
  reescritura anterior de `CheckoutModal.tsx` y funciones que ya no están en
  `marketplaceService.ts` respecto de HEAD). Revisar antes de agrupar commits.
- `find-variants.js`, `repomix-output.xml`, `tsconfig.tsbuildinfo` son artefactos de
  utilidad/build, no código fuente de producto.
- El repo versiona actualmente artefactos de `.next/` (build cache) — no es una convención
  recomendada a largo plazo, pero no se toca sin pedirlo explícitamente el usuario.

---

## 6. Protocolo de Actualización (obligatorio)

**Cada vez que se realice un cambio importante, una refactorización o una nueva
funcionalidad, este archivo `AGENTS.md` DEBE actualizarse en la misma tarea/commit** para
reflejar el estado actual del sistema. Esto incluye (no exhaustivo):

- Cambios en la fórmula o condiciones del **Cofre Recompensa D'una**.
- Cambios en cómo se calcula, muestra o separa la **Tasa BCV / Bs.S**.
- Cambios en el formato de la **comanda/recibo** (nuevas secciones, nuevo layout).
- Cambios en las **tablas de flota, tarifas o umbrales de asignación** logística.
- Nuevos componentes críticos, nuevas rutas, nuevos servicios de backend, o eliminación de
  los existentes.
- Cambios en el contrato del backend (`DOCUMENTO_TECNICO_OSWALDO.md` debe mantenerse en
  sync si el endpoint de compra cambia).

Objetivo: que cualquier agente que retome el proyecto en una sesión nueva pueda leer este
archivo y entender el estado real del sistema sin tener que releer todo el código desde
cero ("cero amnesia").
