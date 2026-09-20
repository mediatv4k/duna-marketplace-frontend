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
| `CheckoutModal.tsx` | **Checkout real.** Métodos de pago desde `GET /store/{id}/payment/info`; datos del cliente, propina, **Cofre Recompensa D'una** (25% OFF flete), badge de vehículo + `vehicleType` (`MOTO`/`SEDAN`) del motor logístico, total en USD y Bs, y envío a `POST /delivery/request/purchase/web`. **Bloquea "Continuar" si `orderSummary.isOpen === false`** (ver §2.4). |
| `OrderTrackingModal.tsx` | Modal post-compra con 3 pestañas: **Comanda POS** (ticket térmico), **Estatus**, **Recibo**. Lee el pedido de `localStorage['last_active_order']` (lo escribe `page.tsx` en `onFinalizeOrder`); su consulta a Firestore `orders` no tiene ningún escritor en el repo, así que en la práctica cae siempre al respaldo local. |
| `MasterProductModal.tsx` | Modal maestro de producto. **Combos por ranuras** (`ComboSlot`, `slotGroups`, `slotsCount`). Grupos `SINGLE` (selección única) vs `MULTIPLE` (contadores); `pricingRole` `BASE` (reemplaza el precio) vs `ADDON` (suma); mínimos por `minItems`; precio inicial desde `metadata.price.basePrice` (`infoPrice` es solo referencial, arranca en $0); arma `variants` + `pricing` estructurados para el carrito. Recibe `nicheEngine` (un `ModalEngine`, ver §4) y `bcvRate` real. |
| `CartModal.tsx` | **Carrito real.** Cada ítem se identifica por `cartItemId` (`productCode::JSON(variants)`), así sabores distintos del mismo producto no se fusionan. |
| `MerchantStoreView.tsx` | **Vista de tienda real** (catálogo). Hero con badges de confianza y "Destacado de hoy", franja `PromotionsCarousel`, tabs de categoría reales, buscador, grilla. Ver §4.1. |
| `PromotionsCarousel.tsx` | Franja "Promociones Imperdibles" (scroll horizontal). Recibe el array de promociones y un `onSelectPromotion`; no hace fetch propio; retorna `null` si el array está vacío. Usada en el Home y en cada tienda. |
| `theme.ts` | Tokens de tema compartidos (colores, branding `#fe6712`). |

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
| `bcvRate.ts` | Gestor de tasa BCV con caché en `localStorage` (`duna_tasa_bcv`) y fallback fijo `48.50`. |
| `nicheConfig.ts` | **Motor multi-nicho v2** (10 nichos + fallback). Ver §4. Reemplazó al detector viejo de 6 nichos (`BOUTIQUE`/`ABASTO`/`BODEGON`/`GENERAL`/`getNicheFeatures`, ya no existen). |
| `nicheIcons.tsx` | Traduce los slugs de ícono de `nicheConfig` (estilo FontAwesome, ej. `fa-solid fa-snowflake`) a componentes de `lucide-react` (`getNicheIcon`) y los `colorToken` de los badges a clases Tailwind (`getBadgeColorClasses`). Slug no mapeado → `ShieldCheck` + `console.warn`. |
| `shareUtils.ts` | Utilidades de compartir (ej. generación de texto/enlace de pedido). |

### 1.5 Servicios y tipos

- `src/services/marketplaceService.ts` — cliente HTTP centralizado hacia el backend AdonisJS
  (`apiFetch`, `submitPurchaseOrder`, `getStorePaymentInfo`, `getProductsByStore`, `getProduct`
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

- Fuente de la tasa: `src/app/api/bcv/route.ts` → consulta `https://ve.dolarapi.com/v1/dolares/bcv`
  (campo `promedio`) con timeout de 4s y caché de revalidación de 1h; si falla, usa el
  **fallback corporativo fijo `48.50`**.
- Cliente: `src/lib/bcvRate.ts` (`getBCVRate`) persiste la última tasa buena en
  `localStorage` bajo la clave `duna_tasa_bcv` para resiliencia offline (crítico en
  contexto venezolano de conectividad inestable).
- Fórmula: `Total Bs. = Total Final USD × Tasa Ref.` (única fuente de verdad en el ticket:
  `displayTotalBs = displayTotal * tasaRef` en `OrderTrackingModal.tsx`).
- `MerchantStoreView.tsx` obtiene la tasa real con `getBCVRate()` (arranca en 48.50 mientras
  carga) y se la pasa a `MasterProductModal`. **Deuda conocida:** `page.tsx` todavía tiene
  `TASA_BCV_ACTUAL = 48.50` fijo, que usa para formatear precios del Home y como `tasaBcv`
  inicial de `CheckoutModal` (este la sobrescribe con `store.referenceRateValue` si el
  backend la trae).
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
6. **Buscador** y grilla de productos.
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
- `TASA_BCV_ACTUAL = 48.50` fija en `page.tsx` (ver §2.2).
- El Cofre Recompensa usa un contador simulado (ver §2.1).
- Los flujos "Pago Express / Pago Directo (WhatsApp)" y "pagar ahora en la plataforma" no
  existen en el flujo real (solo en componentes huérfanos, y el tercero en ninguno).
- `tienda/demo-mostaza` hardcodea `nicheEngine="FOOD_FAST"`.
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
