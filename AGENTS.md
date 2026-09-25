# AGENTS.md — Memoria Permanente y Plano Arquitectónico

> **Bitácora y fuente de verdad obligatoria** del proyecto **D'una Marketplace** (Next.js).
> Este archivo existe para evitar "amnesia" entre sesiones de agentes de IA. Cualquier
> agente (Claude u otro) que trabaje en este repositorio debe leerlo ANTES de tocar código,
> y actualizarlo DESPUÉS de cualquier cambio importante, refactorización o feature nueva.
>
> Última actualización: 2026-09-22 (Fase "Rediseño de Categorías a Píldoras")

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
- **Botón "Atrás" en la vista de tienda (2026-09-21, `page.tsx`):** al entrar a una tienda (`activeMerchantId` pasa a tener valor) se hace `history.pushState({ view: 'merchant-store' }, '', location.href)` (una sola vez, guardado por `storeHistoryRef`). Un listener `popstate` (registrado una vez y removido al desmontar) cierra la tienda con el mismo cierre que `onBack` (`setActiveMerchantId(null)` + borra `current_cart_store_id`), así "Atrás" del navegador/teléfono vuelve al marketplace en vez de salir del sitio (también cierra cualquier modal de carrito/checkout abierto dentro de la tienda, porque son parte de esa vista). Si la tienda se cierra por la UI ("Volver", isologo, fin de compra), la entrada propia se retira con `history.back()` (solo si `history.state.view === 'merchant-store'`) para no dejar entradas fantasma; `storeHistoryRef` evita que ese `popstate` se procese dos veces. Verificado en navegador (Next 14 conserva su estado interno en el `pushState`, sin recarga): entrar +1 entrada, Atrás → marketplace con la página viva; cierre por UI → sin estado sobrante.
- **Orden del listado de tiendas (Home):** prioridad **estrictamente por horario en tiempo real**: 1° abierta ahora, 2° por abrir (sub-ordenada por hora de apertura más cercana, ver abajo), 3° cerrada (el `status` administrativo no cuenta); orden estable dentro de cada grupo (se respeta el del backend). La píldora de horario de cada tarjeta (texto de `scheduleInfo`) es un botón que abre `StoreScheduleModal` (con `stopPropagation`, no abre la tienda).
  - **`storeOpenRank` ya NO confía en `scheduleStatus` (corregido 2026-09-22, Fase 12):** se verificó contra el backend real que ese campo miente — viene `"OPEN"` incluso en tiendas cuyo `scheduleInfo` (el mismo texto que se le muestra al cliente en la píldora) dice **"Hoy cerrado"** (casos reales en DEV: Proseco Bodegón Café, Lois es Más que Pollo, Big State — las tres con `status`/`scheduleStatus: "OPEN"` pero `scheduleInfo: "Hoy cerrado"`). Antes de esta fase, esas tiendas aparecían mezcladas entre las abiertas, arriba de tiendas genuinamente abiertas o por abrir — bug real, no hipotético. El rango ahora se calcula del **texto** de `scheduleInfo` primero (`/cerrado/i` → grupo 3, `/abre a las/i` → grupo 2, `/^abierto$/i` → grupo 1), y solo cae a `scheduleStatus` si no hay texto reconocible. `scheduleInfo` es la fuente de verdad más confiable porque es exactamente lo que ya se le muestra al cliente — nunca puede contradecir lo que ve en pantalla.
  - **Apertura más cercana (Fase 12):** dentro del grupo 2 ("por abrir"), `openingMinutes()` extrae la hora de `scheduleInfo` (patrón `HH:MM AM/PM`; sin patrón reconocible, la tienda queda al final del grupo) y `minutesUntilOpen()` calcula cuánto falta **desde la hora actual del dispositivo**, con *wrap-around* a mañana (si son las 11:00 PM y una tienda abre a las 12:00 AM, faltan 60 min, no "casi un día"). Verificado en navegador con las 47 tiendas reales de DEV: cero tiendas cerradas por encima de una abierta o por abrir, y el grupo "por abrir" queda ordenado 07:00 AM → 07:00 AM → 07:00 AM → 08:00 AM ×6 → 08:30 AM ×2… ascendente.
- **Selector de categorías del Home — píldoras horizontales (2026-09-22, Fase "Rediseño de Categorías", `page.tsx`,
  sección `#categorias-tiendas`):** reemplaza por completo las cajas cuadradas verticales anteriores (`w-20 sm:w-22`,
  icono en círculo de 56 px arriba + etiqueta debajo, `flex-col`) por **cápsulas horizontales** (`rounded-full`,
  `flex items-center gap-2 px-4 py-2 text-sm`, icono `w-4 h-4` a la izquierda del texto en la misma línea). Estado
  inactivo: `bg-slate-50 border-slate-200/70 text-slate-700 font-medium`; hover: `hover:border-[#fe6712]/40`;
  estado activo: `bg-[#fe6712] text-white border-[#fe6712] shadow-sm shadow-[#fe6712]/25 font-semibold` (antes el
  activo mantenía fondo blanco con anillo — `ring-2 ring-[#fe6712]/20` — y solo el ícono interior se pintaba de
  naranja; ahora es la píldora completa la que se pinta sólida, más el pedido de la misión). Los `<div role="button"
  tabIndex={0}>` pasaron a `<button type="button">` reales (más correcto semánticamente: foco/teclado nativos, sin
  cambiar el comportamiento al clic). El contenedor (`categoryRailRef`, mismo ref de antes, usado por los botones
  `‹`/`›` de `scrollCategories()`) pasó de `flex gap-2.5 ... snap-x` (con `snap-start` por tarjeta) a `flex items-center
  gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-2` — se quitó el `snap-x`/`snap-start` porque con píldoras de
  ancho variable (según el largo del nombre) el scroll-snap por tarjeta se sentía más brusco que un scroll libre;
  `no-scrollbar` es la utilidad real del proyecto (`globals.css`) — la misión pedía `scrollbar-none`, que no es una
  clase de Tailwind base en este repo (no hay plugin de scrollbar instalado), así que se usó la utilidad ya existente
  para el mismo efecto en vez de dejar una clase sin efecto. **Altura compacta:** la fila pasó de ~90 px de alto (icono
  56 px + etiqueta + padding) a **54 px** en escritorio, medido en navegador — la grilla de tiendas sube de inmediato,
  como pedía la misión. Los íconos de categoría del backend (`cat.image`, cuando existen) se dibujan a `w-4 h-4
  object-contain` (antes `w-10 h-10` dentro de un círculo de 56 px); sin imagen, cae al mismo `Tag` de `lucide-react`
  de antes, también reducido a `w-4 h-4`. **Sin tocar la lógica de filtrado:** `selectedCategory`/`setSelectedCategory`
  y el `onClick` de cada píldora (`() => setSelectedCategory(cat.code)` / `'ALL'`) son exactamente los mismos que antes,
  ni una línea de `realCategories`/`filteredMerchants` se tocó. Verificado en navegador (1366 px y 390 px, build de
  producción aislada, datos reales): 23 píldoras reales cargaron sin desbordes; clic en "Fast Food" pintó esa píldora
  de naranja sólido, devolvió "Todos" a su estilo inactivo y el contador de tiendas cambió de "Tiendas (47)" a "Tiendas
  (13)" en vivo (confirma que el filtrado real sigue intacto, no solo el estilo); sin scroll horizontal de página en
  ningún viewport (el scroll horizontal *interno* de la fila de píldoras es el esperado/deseado).
- **Cabecera del Home — header solo-logo + sub-barra clara (2026-09-22, Fase "Redistribución de Navbar", `page.tsx`):**
  reemplaza por completo la barra única de la Fase "Unificación de Header" (la de abajo), que mezclaba logo,
  ubicación, moneda, BCV y buscador en un solo contenedor oscuro. Ahora son **dos bloques**: (1) la franja oscura
  sticky (`bg-[#090d16]`) queda **solo con el logo** (`logo-naranja-transparent.png`, `h-10 md:h-12`), centrado,
  con `py-4` de aire vertical — nada más ahí, ni buscador ni ubicación ni moneda; (2) justo debajo, una **sub-barra
  clara** (`bg-white border-b border-slate-200`, **no sticky a propósito** — apilar dos barras sticky habría
  recreado el "doble header" que se eliminó en la fase anterior) con el buscador a la izquierda (`md:max-w-md`,
  fondo `bg-slate-50`, no cruza toda la pantalla en escritorio) y, agrupados a la derecha en escritorio (apilados
  debajo del buscador en móvil): ubicación, selector de moneda (`Dual ($/Bs)` / `$ USD` / `Bs. VES`) y Tasa BCV —
  los tres repintados en tema claro (antes vivían sobre fondo oscuro: `bg-white/10`→`bg-slate-100`,
  `text-slate-300`→`text-slate-500`, etc.; el botón de moneda activo sigue en naranja pero ahora con
  `text-white` explícito, ya que el texto base ya no hereda blanco de un contenedor oscuro). Verificado en
  navegador (1366 px y 390 px): sin scroll horizontal, el buscador sigue filtrando tiendas en vivo, el selector de
  moneda sigue aplicando el estado activo correctamente. **`HeroBannerCarousel.tsx` y las clases del marquee en
  `tailwind.config.js` no se tocaron** (`git diff` vacío en ambos) — el cintillo sigue exactamente como quedó
  aprobado.
- **Logo blanco en la cabecera + borde corporativo en el buscador (2026-09-22, Fase "Ajustes Cosméticos de
  Cabecera", `page.tsx`):** el logo de la franja oscura pasó de `logo-naranja-transparent.png` a
  `/images/logo-blanco-transparent.png`; el contenedor del buscador de la sub-barra clara suma
  `border border-[#FE6712]/50 focus-within:border-[#FE6712] focus-within:ring-1 focus-within:ring-[#FE6712]`
  (antes `border-slate-200 focus-within:border-[#fe6712]`, sin ring). **`public/images/logo-blanco.png` (el
  archivo que pedía la misión) resultó inservible:** es un PNG real (firma `89504E47`, 1284×459, RGBA) pero
  sin ninguna imagen codificada — se muestreó el buffer crudo con `sharp` y el canal alfa es 255 (opaco) en
  **toda** la imagen sin variación, y el valor RGB más oscuro de todo el archivo es `R=233` (rango total
  233–255): no hay un logo real ahí, solo casi-blanco uniforme; componerlo sobre el fondo oscuro real
  (`rgb(9,13,22)`) confirma que se ve en blanco. En vez de usarlo tal cual (el logo habría desaparecido) o
  sustituirlo en silencio, se generó `public/images/logo-blanco-transparent.png` reutilizando la máscara alfa
  ya verificada de `logo-naranja-transparent.png` (de la fase anterior) y recoloreando su RGB a blanco puro
  (255,255,255) sin tocar el alfa — verificado componiéndolo sobre `rgb(9,13,22)`: wordmark blanco nítido, sin
  flecos. `logo-blanco.png` queda sin usar en el repo (no se referencia desde ningún componente); no se borra
  por si el usuario quiere reemplazarlo por un archivo real más adelante. Verificado en navegador (1366 px y
  390 px, build de producción aislada): logo blanco nítido en ambos anchos, borde naranja visible en el
  buscador en reposo, sin scroll horizontal, cintillo (`animate-marquee`) presente y sin tocar.
- **[Histórico, reemplazado arriba] Cabecera del Home — barra única (2026-09-22, Fase "Unificación de Header", `page.tsx`):** reemplaza por completo el
  diseño de dos franjas oscuras apiladas de la Fase 10 (la barra fina de ubicación/moneda + un `<header>` aparte con
  logo/buscador) — **ahora es un solo contenedor** `sticky top-0 z-40 bg-[#090d16] border-b border-white/10` (ya no
  existe la etiqueta `<header>`, verificado: 0 en el DOM). Fila 1, grid en escritorio (`md:grid-cols-[1fr_auto_1fr]`)
  y apilada en móvil (`flex flex-col`): ubicación a la izquierda, **logo naranja centrado geométricamente** (col.
  central `auto`, verificado: centro del logo = centro de la barra en 1366 px), moneda + Tasa BCV a la derecha.
  Fila 2, mismo contenedor: buscador compacto (`bg-white/10`, sin borde duro, texto claro `text-gray-200`) — ya no
  es una fila "masiva vacía" aparte, es una segunda línea delgada de la misma barra. **Logo sin pastilla blanca:**
  `/images/logo-naranja.png` es la imagen que se agregó para esto, pero **resultó ser un JPEG con fondo blanco
  opaco** (no un PNG real, ni transparente — verificado leyendo su cabecera: firma `FFD8FF` de JPEG, no `89504E47`
  de PNG; es igual de \"falso\" que los banners `banner-*.png` de la Fase 11, todos JPEG con extensión `.png`).
  Un JPEG **no puede** tener transparencia — ponerlo tal cual sobre el fondo oscuro habría dejado el mismo
  rectángulo blanco feo que se intentó evitar en la Fase 10. Se generó `public/images/logo-naranja-transparent.png`
  (con `sharp`, instalado *temporalmente* con `--no-save` solo para este proceso — no quedó en `package.json` ni en
  el lockfile, no es una dependencia del proyecto) aplicando una clave de croma sobre blanco/casi-blanco
  (`whiteness = min(r,g,b)`; opaco por debajo de 190, transparente total desde 248, degradado suave entre ambos
  para no dejar un borde duro) y esa es la imagen que usa el header. Verificado componiendo el resultado sobre un
  fondo oscuro de prueba: la transparencia es real. **Queda un fleco tenue** alrededor de las letras finas
  ("una", "MarketPlace") por artefactos de compresión JPEG en los bordes que el umbral no atrapa del todo — visible
  de cerca en una imagen grande, prácticamente imperceptible al tamaño real del navbar (`h-9`/`h-10`). Si el
  diseño consigue un PNG de verdad con canal alfa, reemplaza a `logo-naranja-transparent.png` sin tocar el código.
  **Selector de moneda** (heredado de la Fase 10, sigue igual): el contenedor `Dual ($/Bs) / $ USD / Bs. VES` con
  los tres botones completos, `flex-wrap` de seguridad en pantallas angostas. Verificado en navegador (1366 px y
  390 px): una sola barra (sin duplicado), logo centrado y sin fondo blanco, buscador integrado, los tres botones
  de moneda visibles, sin scroll horizontal.
- **Cintillo promocional del hero — marquee continuo (2026-09-22, reescrito, `page.tsx` + `HeroBannerCarousel.tsx`):**
  reemplaza por completo el slider a pantalla completa con dots de la Fase 11 (mismas tres diapositivas de
  marketing, mismos destinos: `banner-commer.png` → `https://tr.ee/aJWg3IoL3q`; `banner-delivery.png` →
  `https://tr.ee/O553DC8j5Q`; `banner-cliente.png` → sin enlace, `scrollIntoView({behavior:'smooth'})` a
  `#categorias-tiendas`). Ya no hay estado de "diapositiva activa" ni `setInterval`: es un **cintillo de CSS puro**
  (`animation: marquee`, `@keyframes`/`animation` agregados a `tailwind.config.js`) que desliza un track con las
  diapositivas **duplicadas una vez seguidas** (`[...slides, ...slides]`) `translateX(0 → -50%)`; al llegar a la
  mitad el segundo tramo es idéntico al primero, así que el corte del bucle no se nota. Se pausa al pasar el mouse
  (`group-hover:[animation-play-state:paused]`); la copia duplicada lleva `aria-hidden`/`tabIndex={-1}` para que no
  se repitan los mismos 3 enlaces al navegar con teclado/lector de pantalla. **Altura reducida drásticamente:**
  contenedor `h-24 max-h-28` (antes `aspect-[3.2/1]` a todo el ancho, ~112–420 px de alto según la pantalla) — cada
  imagen se dibuja a `h-full object-contain` (no `object-cover`: en una cinta angosta y continua no hay "recorte
  a la mitad" que valga, se ve el banner completo, más chico). Duración configurable por prop (`durationSec`, 26 s
  por defecto). Verificado en navegador: el `<header>` de la Fase 10 ya no existe (una sola barra oscura), el
  cintillo mide 96 px de alto exactos, y "Promociones Imperdibles"/la grilla de tiendas suben notablemente en la
  pantalla en ambos tamaños, sin scroll horizontal.
- **Botón flotante "Ver mi Pedido" (dentro de una tienda, `page.tsx`):** visible con `savedOrderId` (pedido recién finalizado en esa sesión) mientras no sea final ni el modal de tracking esté abierto; `fixed bottom-24 md:bottom-6 right-4 z-50` (2026-09-22: se probó `bottom-4 right-4` fijo, pero chocaba con la barra "Productos en bolsa" en móvil; `bottom-24` en móvil / `bottom-6` en escritorio la evita, igual que antes de la primera cirugía estética). Distinto del FAB de abajo (ese vive en el Home, este en la vista de tienda).
- **FAB de pedido activo (Home, `page.tsx`):** botón flotante naranja (icono `ClipboardList`, abajo a la derecha) visible si hay un id en `localStorage['last_active_order_id']` (o `last_active_order.id`, se actualiza en `onFinalizeOrder`). Consulta `getOrderPublic` al montar y cada 30 s; se **oculta** al llegar a un estado final (`FINAL_STATUSES`). Al pulsarlo abre `OrderTrackingModal` con esa orden (en el Home el modal se monta sin `orderSummary` para no mostrar el resumen placeholder).
- `src/app/tienda/demo-mostaza/page.tsx` — demo del nicho "Mostaza" (fast food, combos por
  ranuras); hardcodea `nicheEngine="FOOD_FAST"`.
- `src/app/test-helado/page.tsx`, `src/app/test-logistica/page.tsx` — sandboxes de prueba
  (helados/variantes, motor logístico con carritos hardcodeados). No son parte del flujo real.
- **Archivadas en `_archive/` (ya NO son rutas, no compilan):** `test-plantilla` y
  `tienda/[slug]` (mocks con `STORES_DATA` hardcodeado), más `MerchantStoreView.bak.tsx` y
  `CategoryTabs.reference.tsx` (referencia de los tabs de categoría que se reconstruyeron en
  `MerchantStoreView.tsx`). No editar ni importar desde `_archive/`.
- `src/app/api/assistant/route.ts` — **asistente de ventas con Gemini (2026-09-21).** `POST { message }` → `{ success, reply }`. Usa `@google/generative-ai` (`GoogleGenerativeAI`, modelo `process.env.GEMINI_MODEL || 'gemini-3.6-flash'`, con `systemInstruction`: **"Mercedes"**, vendedora estrella de D'una en Cabimas; máximo 2 oraciones, siempre cierra con una pregunta de micro-compromiso ("¿Te lo agrego al carrito?"), recomienda lo más popular y ante temas médicos/políticos/ajenos a la tienda redirige con humor comercial sin negarse ni romper el personaje; **Cerrar venta (regla 8, 2026-09-21):** ante un pedido explícito ("dame 2 de fresa") Mercedes agrega `[AGREGAR_CARRITO:id:cantidad]` al final. **Navegación (regla 7, 2026-09-21):** si el usuario pide o muestra interés en un producto, Mercedes busca su id en el catálogo del contexto (cada producto viaja como `… ($precio) [ID n]`) y termina con `[VER_PRODUCTO:id]`. **Formato de voz (regla 6, 2026-09-21):** solo texto plano, sin Markdown (asteriscos, viñetas, guiones, negritas) y lenguaje natural, porque `speechSynthesis` lee la respuesta tal cual. **Modo silencioso (regla 5, 2026-09-21):** si el usuario se frustra, pide que se calle o prefiere comprar solo, Mercedes se despide con cortesía y termina la respuesta con la etiqueta `[MUTE_ASSISTANT]` (señal interna que el frontend consume). **Visión periférica (2026-09-21):** el body acepta `prompt` (o `message`), `menuContext` y `cartContext` (opcionales, strings; se recortan a 1500 y 700 caracteres) y antes de `generateContent` arma `finalPrompt = [CONTEXTO INVISIBLE PARA MERCEDES: Catálogo disponible: … Carrito actual del usuario: …]. Mensaje del usuario: …` (`'No especificado'` / `'Vacío'` si faltan); `maxOutputTokens: 300`; **`safetySettings` en `BLOCK_NONE`** para acoso, odio, sexual explícito y contenido peligroso, para evitar 502 por bloqueos del filtro con preguntas cotidianas. Ojo: el prompt ya no incluye el aviso "consultar a su médico" ni prohíbe recomendar para síntomas; revisar con negocio/legal si el asistente responde temas de salud). **La clave es `GEMINI_API_KEY` (solo servidor, sin prefijo `NEXT_PUBLIC_`)**; sin ella responde 503 "Asistente no configurado" (verificado). Entrada recortada a 500 caracteres; errores del modelo → 502 con mensaje genérico (el detalle solo va al log del servidor). **Ojo:** `.env.local` está versionado en git (`git ls-files`): no escribir ahí la clave real sin antes sacarlo del control de versiones o usar otro archivo/variable del hosting. `gemini-3.6-flash` puede estar retirado por Google: si la API responde 404/502, definir `GEMINI_MODEL` con un modelo vigente. No probado contra Gemini real (sin clave en el entorno).
- `src/app/api/bcv/route.ts` — endpoint interno (Route Handler) que expone la tasa BCV
  (ver [§2.2](#22-tasa-bcv-y-bolívares)).

### 1.3 Componentes críticos (`src/components`)

| Componente | Rol |
|---|---|
| `CheckoutModal.tsx` | **Checkout real.** Métodos de pago desde `GET /store/{id}/payment/info`; datos del cliente, propina, **Cofre Recompensa D'una** (25% OFF flete), badge de vehículo + `vehicleType` (`MOTO`/`SEDAN`) del motor logístico, total en USD y Bs, y envío a `POST /delivery/request/purchase/web`. **Bloquea "Continuar" si `orderSummary.isOpen === false`** (ver §2.4). **Sin datos inventados:** el pedido no se envía (error controlado) si falta `merchantId`, el teléfono real del comercio (`merchantPhone`), la tasa oficial, la ubicación real, o si algún ítem no trae `id`/`code`/`price` reales; ya no hay `70`, `'04165675220'`, `101`, `'P001'` ni precio `1.0` de respaldo. **Fase 4 – Confirmación de orden (diseño original restaurado):** si la orden se crea (`code: 1`) sin comprobante (`paymentFile`) ni referencia (`paymentRef`), el paso `exito` muestra: cabecera naranja con check blanco en recuadro verde, `merchantName || 'Comercio'` y "Confirmación De Orden"; cuerpo "¡Tu pedido ya está en la cocina!" (sin el emoji 🚀 final desde 2026-09-22, ver §5) / "En D'una tú tienes el control. Elige cómo prefieres pagar:", tarjetas **Pago Express** ("Sube tu comprobante en el seguimiento de orden.") y **Pago Directo (WhatsApp)** ("Espera que {comercio} te escriba."), botón "💳 ¡Prefiero pagar ahora mismo en la plataforma!" (vuelve a la Fase 3 conservando referencia/archivo) y pie "🕒 Ver seguimiento de pedido" (`onViewTracking`; el modal toma el id de `last_active_order_id`) + "Continuar". Con comprobante o referencia se mantiene la confirmación normal. **Precarga y persistencia del cliente:** al abrir el checkout se rellenan (solo si están vacíos) nombre, cédula (`V-`/`E-`/`J-` + número) y teléfono (`+58`/`+57`/`+1`) desde `localStorage` (`customerName`/`customerDocument`/`customerPhone`, con respaldo a `name`/`document`/`phone`); tras `code: 1` se guardan esas tres claves. **La ubicación no se persiste en `localStorage`**; en `MerchantStoreView` el pin manual del mapa (`manual: true`) vive solo en esa vista y no se escribe ni en `sessionStorage` (solo el GPS/sector se recuerda en `sessionStorage['duna_customer_location']`). **Sin pedidos duplicados:** el contrato solo tiene `POST /delivery/request/purchase/web` (crea), así que tras `code: 1` `ordenCreada = true` y `handleCompleteFinalOrder` no reenvía; si el cliente vuelve a la Fase 3, el botón final pasa a **"Enviar comprobante"**: `uploadPaymentReference({orderId: response.data.id, file, referenceText})` (`PUT …/payment/reference`, sin volver a llamar a `purchase`); con `code: 1` se muestra la confirmación normal. **Ya no existe el botón "O reportar por WhatsApp"** (ni `buildWhatsAppReportUrl`): la Fase 3 con orden creada solo tiene "Enviar comprobante" y "Volver a la confirmación"; si la respuesta de compra no trae `id` o el PUT falla se muestra un mensaje de error para reintentar. **Textos al cliente sin tecnicismos:** la confirmación dice "¡Pedido enviado a {comercio}!" / "Recibimos tu comprobante de pago. El comercio está verificando tu orden." (se eliminó "…registrada con éxito en el servidor de AdonisJS"); también "Registrando tu pedido..." y "No pudimos registrar tu pedido. Revisa tus datos e inténtalo de nuevo." reemplazan las menciones a AdonisJS. **Bolsa vaciada al comprar:** tras `code: 1`, `CheckoutModal` borra `cart_data`/`current_order`/`current_cart_store_id` de `localStorage` y emite `window` event `duna:cart-cleared`; `MerchantStoreView` lo escucha y hace `updateCartStorage([])`, por lo que la barra flotante "Productos en bolsa" (`cartItems.length > 0`) se oculta al instante (antes solo se vaciaba al cerrar el checkout con "Continuar", no al ir a "Ver seguimiento"). Se envían `referenceImage` y `referenceText` juntos si el cliente cargó ambos (el contrato dice "imagen o texto": no verificado que acepte los dos a la vez). **Ajuste móvil solo de clases (2026-09-21):** el contenedor principal pasó de `w-full max-w-[420px]` a `w-[95%] max-w-lg` (alto fijo `h-[610px]` intacto; el contenido de cada fase ya scrollea internamente con `overflow-y-auto`); los totales a pagar subieron un nivel (`text-2xl` en Fase 3, `text-base`/`text-sm` en la confirmación) y los inputs/selects de datos del cliente, los textos de los métodos de pago y el campo de referencia subieron a `text-sm`/`text-xs`. Sin cambios de estructura, estados ni handlers (13 líneas, solo clases). **Pendiente:** el texto "Sube tu comprobante en el seguimiento de orden" (Pago Express) sigue describiendo una función que `OrderTrackingModal` no tiene; la subida real ocurre desde la Fase 3 ("Prefiero pagar ahora mismo"). El número de orden mostrado sale de `response.data.order_number ?? orderNumber ?? id` (forma de la respuesta de compra no documentada: sin verificar en vivo, si falta se omite el número). | `serviceAmount` y `tip` viajan como string con 2 decimales. |
| `OrderTrackingModal.tsx` | Modal post-compra con 3 pestañas: **Comanda POS** (ticket térmico), **Estatus**, **Recibo**. **Tracking real:** consume `getOrderPublic(orderId)` (`GET /delivery/request/{id}/public?apiKey=`) al abrir y hace polling cada 9 s hasta estado final (`DELIVERED`/`CANCELLED`/`REJECTED`/`COMPLETED`). La pestaña Estatus dibuja `history[]` real; cliente, dirección, comercio, teléfono y `id` (ID global de la orden) salen de `data`. Los ítems/totales (que `/public` no devuelve) vienen de `localStorage['last_active_order']`, solo si su `id` coincide. Sin `orderId` o con error de API muestra un estado vacío/mensaje, nunca datos inventados. Firestore fue eliminado. **Pestaña Estatus (2026-09-20):** timeline en orden **descendente** (evento más reciente arriba, resaltado con "Estado actual"; empate de fecha → `id` mayor primero) con nombres amigables (`DRIVER_ASSIGNED`→"Repartidor asignado", `Inicia`→"Pedido registrado", `Solicitud completa`→"Notificando al comercio", `Aceptado`→"Preparando tu pedido", `Listo`→"Orden lista para entrega", `Recogido`→"Pedido entregado al repartidor", `Entregando`→"Pedido en camino" (solo textos; la lógica de fase/`driverConfirmed` usa los estados crudos); cualquier otro se limpia: `FORWARDED`→"Forwarded"); **tarjeta del repartidor** (`delivery_driver_name`, `delivery_driver_phone`, `delivery_vehicle_type/brand/color/license`) con enlace `wa.me` (teléfonos `04…` se convierten a `58…`); **Recibo:** la línea de pago dice "Pago en verificación" (ámbar), no "Pago verificado": el backend no expone una señal fiable de pago validado (`paid` viene `false` incluso en pedidos entregados). **Pickup:** el flete es 0 en el total del carrito (`CartModal`/`MerchantStoreView`). Botón "📍 Ver en Google Maps" con `current_location` (string JSON `{latitude,longitude}`) o, si no hay posición del repartidor, la dirección de entrega (`customer_address` / `customer_address_text`). Campos verificados en DEV (órdenes con conductor, p. ej. #1564, #1578); `current_location` puede venir `null`. |
| `MasterProductModal.tsx` | Modal maestro de producto. **Combos por ranuras** (`ComboSlot`, `slotGroups`, `slotsCount`). Grupos `SINGLE` (selección única) vs `MULTIPLE` (contadores); `pricingRole` `BASE` (reemplaza el precio) vs `ADDON` (suma); mínimos por `minItems`; precio inicial desde `metadata.price.basePrice` (`infoPrice` es solo referencial, arranca en $0); arma `variants` + `pricing` estructurados para el carrito. Las opciones se dibujan como **cápsulas táctiles** (fondo siempre blanco, solo el borde naranja marca la activa; precio `text-sm font-black` y Bs `text-xs font-bold text-slate-500`, check a la derecha) (`OptionCapsule`, con etiqueta de precio extra en $ y Bs vía `getOptionPriceLabels`): solo presentación, los handlers y cálculos no cambian. Recibe `nicheEngine` (un `ModalEngine`, ver §4) y `bcvRate` real. **Ranuras solo si el producto trae grupo "SIN" (2026-09-22, revertida la Fase 8 original — ya NO depende del nicho):**
`isSlotMode` (personalización por unidad: banner "¿Personalizar cada unidad por separado?", pantalla de ranuras
"sabor/nombre por unidad") ahora exige `hasSinVariant`, no `nicheEngine`: `const hasSinVariant = availableGroups.some(g
=> /\bsin\b/i.test(g.name || g.title || g.label || ''))` y `const isSlotMode = hasSinVariant && (isCombo || (qty > 1 &&
isSlotCustomizationActive))`. Se basa en la estructura real del backend: el grupo de exclusiones llega literalmente
como `{ name: "SIN", selectType: "CHECKIN", items: [{ title: "SIN TOCINETA" }, { title: "SIN CEBOLLA" }, …] }`
(verificado en DEV, producto #1337 "CHEESE BURGUER SENCILLA", store 41). **Sin ese grupo, la función de ranuras
queda oculta sin importar el nicho** — incluida comida: se comprobó con "COMBO GRUPO" (#1350, misma tienda de
hamburguesas), un combo real cuyo único grupo es "SABORES SC (4)" (sin "SIN"): con esta regla tampoco ofrece
ranuras, aunque conceptualmente es un combo que reparte sabores por unidad — **efecto secundario conocido de la
regla tal como se pidió, no un bug**: si el usuario quiere que los combos con grupos de sabor (no solo "SIN")
también tengan ranuras, hay que ampliar el criterio. Reemplaza por completo el criterio anterior por `nicheEngine`
(`isFoodNiche`, Fase 8 original): ya no importa si la tienda es heladería, fast food, farmacia o licorería, solo si
*ese producto* trae el grupo. Verificado en navegador con tres productos reales: Papá Helado "Paletas Cítricas
Rellenas" (sin "SIN") → sin banner; "CHEESE BURGUER SENCILLA" (More Cheese Burguer, con grupo "SIN") → banner
visible; "COMBO GRUPO" (misma tienda, sin "SIN") → sin banner. **Metadatos ocultos (2026-09-22):** la descripción que se muestra ya no es `product.desc || product.description` cruda, sino `cleanDescription` de `parseDescriptionTags` (ver `src/lib/productTags.ts`), con `<ProductTagBadges>` justo debajo mostrando lo extraído. **Descripción expandida (2026-09-22):** ya no vive angosta, junto al precio/cantidad (columna derecha del bloque superior); ahora es un bloque `w-full` propio, debajo de TODO el bloque superior (imagen + precio + disponibilidad + cantidad), sin ningún `line-clamp`/truncamiento — el cliente la lee completa. Clases exactas del párrafo: `w-full text-sm text-gray-600 mt-4 mb-4 leading-relaxed whitespace-pre-line` (antes `text-xs text-slate-600 ... line-clamp-2 sm:line-clamp-none`, dentro de la columna angosta). Las insignias (`<ProductTagBadges>`) se movieron con ella, en el mismo bloque, debajo del texto. Verificado en navegador (Papá Helado): la descripción real ("6 Unidades Mínimo") aparece a todo el ancho del modal, antes del selector de tamaño/variantes, sin cortarse. **Barrido anti-demo (2026-09-22):** `availableGroups` ya NO inventa un grupo de sabores cuando el backend no trae `product.groups`/`slotGroups` (antes, cualquier combo o tienda FOOD_FAST/FOOD_SWEET sin variantes reales mostraba un grupo falso "Estándar/Clásico, Tocineta Crocante, Queso Amarillo Extra" — datos ficticios llegando a clientes reales). Ahora, sin variantes reales del backend, la sección de variantes simplemente no aparece. **Exclusiones de ingredientes solo en comida rápida:** el bloque "Firma D'una (Exclusiones)" (modo estándar y por ranura) ahora exige además `nicheEngine === 'FOOD_FAST'`; antes solo dependía de `product.exclusions`, un campo que hoy ningún flujo real llena (`MerchantStoreView` nunca lo setea), así que la sección ya estaba inactiva en la práctica — el condicional queda listo para cuando exista esa fuente real, sin que aparezca en heladerías, bodegones ni farmacia. |
| `CartModal.tsx` | **Carrito real.** Cada ítem se identifica por `cartItemId` (`productCode::JSON(variants)`), así sabores distintos del mismo producto no se fusionan. |
| `MerchantStoreView.tsx` | **Vista de tienda real** (catálogo). Hero con badges de confianza y "Destacado de hoy", franja `PromotionsCarousel`, tabs de categoría reales, buscador, grilla. Ver §4.1. **Buscador reubicado (2026-09-22):** pasó de estar debajo de promociones/tabs a ir pegado al banner principal (`searchNode`, dentro de `heroNode`, antes de cualquier otro contenido); ya no es sticky (perdió su ancla al desaparecer la franja superior del motor) y usa su propio `px-4`/`md:px-8` en vez del truco `-mx-4 px-4`. **Isologo D'una fijo (2026-09-22):** pasó de `absolute top-4 right-4` (dentro del banner, se iba con el scroll) a **`fixed top-4 right-4 z-50`** (`isologoNode`, renderizado fuera del banner en ambas ramas — con y sin plantilla): queda visible sobre toda la vista, incluido el scroll y farmacia en escritorio (donde el banner se oculta). **Círculo perfecto (2026-09-22):** el botón pasó de `bg-white/95 backdrop-blur-sm p-1.5 rounded-2xl` (esquinas redondeadas, padding con fondo blanco) a `w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-[#FE6712]` — sin fondo blanco propio ni padding, el borde naranja y la sombra dan el contraste; la imagen pasó de `object-contain` (con aire/bordes blancos) a `w-full h-full object-cover`, llenando el círculo sin recortes cuadrados. Verificado en navegador: 48×48 px, `border-radius: 9999px`, fondo transparente, sin bordes blancos visibles. Sigue ejecutando el mismo `onBack`. El `<aside>` sticky de escritorio ya no distingue `templateNiche` para su offset (`top-24` vs `top-6`): con el navbar del motor eliminado, todas las tiendas usan `top-6 max-h-[calc(100vh-3rem)]`. Verificado en navegador (390 px y 1366 px; Papá Helado, Franela, Farma D'una Virtual): sin franja de nombre/BCV, isologo fijo y visible tras el scroll, buscador justo bajo el banner, sin scroll horizontal. |
| `PromotionsCarousel.tsx` | Franja "Promociones Imperdibles" (scroll horizontal). Recibe el array de promociones y un `onSelectPromotion`; no hace fetch propio; retorna `null` si el array está vacío. Usada en el Home y en cada tienda. **Tarjetas verticales (2026-09-21):** la imagen usa `aspect-[2/3]` + `object-cover` (arte de 640×960; tarjeta `w-40 md:w-44`, reducida a **`w-28 md:w-32`** el 2026-09-22 para ocupar menos alto — mismo 2:3, ~30% menos de alto — y subir antes el catálogo). Se retiró de `MerchantStoreView` la tarjeta horizontal "Destacado de hoy", que repetía la promoción principal. **Marquee continuo en contraflujo (2026-09-22, reemplaza el autoplay anterior):** el `setInterval`+`scrollBy` de la Fase 21
(ver histórico abajo) se sustituyó por la misma técnica de `HeroBannerCarousel.tsx` — track con las tarjetas
duplicadas una vez seguidas (`[...promotions, ...promotions]`, solo si `!prefersReducedMotion`) + animación CSS
pura `animate-marquee-reverse` (`keyframes`/`animation` nuevos en `tailwind.config.js`, junto a `marquee`: mismo
truco de bucle, pero el keyframe arranca en `translateX(-50%)` y termina en `translateX(0)`, así el track "avanza"
hacia la derecha en vez de hacia la izquierda — cruce visual con el cintillo del hero, que sigue corriendo a la
izquierda sin tocarse). Duración configurable por prop (`durationSec`, 32 s por defecto, más lenta que el cintillo
del hero por tener más contenido que leer). **Pausa con estado de React, no solo CSS:** a diferencia del hero
(que usa `group-hover:[animation-play-state:paused]`, solo mouse), aquí el contenedor exterior (el que NO se
traslada, `overflow-hidden`) lleva `onMouseEnter`/`onMouseLeave`/`onTouchStart`/`onTouchEnd` que escriben un
estado `paused`, aplicado como `style={{ animationPlayState: paused ? 'paused' : 'running' }}` sobre el track
interior — así también se detiene al tocar en móvil (sin hover real), y un tap-y-clic siempre encuentra la
tarjeta inmóvil donde se tocó. Con `prefers-reduced-motion: reduce` (o cambios en vivo de esa media query, vía
`matchMedia().addEventListener('change', …)`) el componente cae a la fila estática con scroll horizontal nativo
de antes (`overflow-x-auto no-scrollbar`, sin duplicar). **Sin tocar la lógica de datos:** `onSelectPromotion`
sigue siendo la misma prop, llamada igual (`onClick={() => onSelectPromotion(promo)}`) tanto en las tarjetas
"originales" como en las "duplicadas" (marcadas `aria-hidden`/`tabIndex={-1}` igual que en el hero, para que un
lector de pantalla no repita el mismo combo dos veces); el filtrado/mapeo de imagen y monto no cambió una línea.
Verificado en navegador (1366 px y 390 px, build de producción aislada, con datos reales — las promociones de
DEV tardan ~10–20 s en llegar en este entorno de verificación, no es un regresión del cambio): `animate-marquee`
(hero) y `animate-marquee-reverse` (promociones) corren simultáneos con sentidos opuestos (confirmado leyendo
`getComputedStyle(...).transform` en dos instantes: el `translateX` de las promociones **aumenta** con el tiempo,
es decir corre a la derecha); al mover el mouse sobre el contenedor, `animationPlayState` pasa a `paused` de
inmediato; con el track ya inmóvil, un clic sobre una tarjeta real dispara `onSelectPromotion` (probado en el
carrusel del Home: abre la tienda dueña de la promoción, mismo comportamiento que antes de este cambio); sin
scroll horizontal en ningún viewport. **Nota de accesibilidad heredada, no introducida por este cambio:** igual
que en `HeroBannerCarousel.tsx`, durante la mitad del ciclo el par "duplicado" (`aria-hidden`) es el que queda
visible en pantalla mientras el "original" (tabulable) está fuera de vista — mismo compromiso ya aceptado en el
cintillo del hero, no se intentó resolver aquí para no tocar un patrón ya aprobado en otra pieza.
**[Histórico, reemplazado arriba] Autoplay por scroll nativo (2026-09-21):** `useRef` en el contenedor + `setInterval` de 4 s que avanza una tarjeta (`scrollBy`, `behavior: 'smooth'`) y, al llegar a `scrollWidth - clientWidth`, vuelve suavemente a `left: 0` (bucle). Solo corre con ≥2 promociones y si hay desborde; se pausa con mouse encima/toque y se omite con `prefers-reduced-motion`. Márgenes de la tienda: `<main>` del motor y contenedor plano usan `px-4 md:px-8 py-6`; el `<aside>` sticky lleva `-mx-1 px-1 pt-1 pb-3` para no recortar las sombras de sus tarjetas (medido sin scroll horizontal a 430/820/1366 px). |
| `OrderTimelinePanel.tsx` | Vista de seguimiento **compartida** por la pestaña Estatus de `OrderTrackingModal` y la página `/order/[orderId]/timeline` (props: `remote`, `trackingError`). **Sin tarjeta de cliente ni coordenadas** (cero scroll). En orden: (1) **tarjeta del código de entrega** — solo en la fase `arrived` ("Llega a sitio") y pedido no final: "🔑 ¡TU REPARTIDOR ESTÁ EN LA PUERTA!" + "Código de entrega: [ código ]" + "Dicta este código…" con pulso; en cualquier otra fase el código no se renderiza; (2) **ficha compacta del repartidor** (foto `delivery_avatar` o iniciales, nombre, vehículo `tipo marca`, color, placa). **Clasificación (corregida tras la orden #55):** `driverConfirmed` (en `getTrackingState`) es verdadero **si y solo si** el historial contiene `DRIVER_ASSIGNED` (o un estado posterior de entrega: `TAKEN`, `Entregando`, `Llega a sitio`, `Entregado`). **`Recogido` / "Pedido en camino" NO confirma al chofer** (es despacho de la tienda/sistema; el sistema asigna preliminarmente a un chofer de turno que puede no aceptar y la orden rota, caso orden #57) → título "REPARTIDOR ASIGNADO" + WhatsApp verde habilitado (`wa.me` con `delivery_driver_phone`); solo sin ninguno de esos eventos (rotación por turnos, chofer tentativo) → "REPARTIDOR DE TURNO" + WhatsApp gris deshabilitado ("Contacto por WhatsApp disponible al confirmar la carrera"). Antes `DRIVER_ASSIGNED` estaba mal clasificado como "de turno". La ficha se oculta al entregarse/cancelarse; (3) botón "🛵 Sigue tu pedido en línea" que **reemplaza el enlace externo a Google Maps** y abre en la misma pantalla el mapa embebido `LiveOrderMap` (al abrirlo se oculta el timeline; "Ver seguimiento" vuelve al timeline; solo mientras el pedido no es final y haya alguna coordenada); (4) timeline descendente con nombres amigables. **Cierre al entregar** (`Entregado`/`DELIVERED`/`COMPLETED`): modal "¡Orden entregada con éxito!" con calificación 1–5 del servicio y del comercio; al enviar o cerrar (X) se marca `duna_order_closed_{id}` (no vuelve a aparecer), se borran `last_active_order`/`last_active_order_id` (solo si son de esa orden) y se emite el evento `duna:order-closed`, que `page.tsx` escucha para ocultar el FAB. **La calificación solo se guarda en `localStorage['duna_order_rating_{id}']`: el backend no tiene endpoint de calificación** (se probaron `scoring/score/rating/rate/qualify/review` bajo `/delivery/request/{id}/…` → `E_ROUTE_NOT_FOUND`); pendiente confirmar con Osvaldo (el campo `request_scoring` viaja en `/public`). |
| `LocationPickerModal.tsx` | Selector de **dirección de entrega alterna** (pin del mapa en `CartModal`): mapa de Google Maps JS con pin arrastrable/clic, buscador (Places Autocomplete + Geocoder, restringido a Venezuela), dirección por Geocoder inverso y aviso de distancia a la tienda. Clave: `NEXT_PUBLIC_GOOGLE_MAPS_KEY` (con respaldo a la clave oficial). Devuelve `{lat, lng, address}`; `MerchantStoreView` la guarda como `customerLocation` y el efecto de cotización recalcula distancia, bloqueo de 12 km y `getDeliveryRate`. || `theme.ts` | Tokens de tema compartidos (colores, branding `#fe6712`). |
| `LiveOrderMap.tsx` | Mapa de Google **embebido** en el seguimiento (`OrderTimelinePanel`): marcadores del comercio 🏪 (`food_store_location`), dirección del cliente 🏠 (`customer_address`) y repartidor 🛵 (`current_location`), todos parseados con `parseCoords` (string JSON). Iconos SVG generados en código (sin archivos). Las posiciones llegan por props, así que el repartidor se mueve con cada ciclo de polling (9 s); el encuadre (`fitBounds`) solo se recalcula cuando aparece/desaparece un punto, no en cada ciclo. Altura `36vh` (mín. 210, máx. 300 px). |
| `StoreScheduleModal.tsx` | Horario semanal del comercio: `getStoreSchedule(id)` → `GET /store/{id}/schedule/open?apikey=` (query **y** header). Respuesta real: `data[] = { id, day (monday…sunday), name, open_time "HH:mm", close_time "HH:mm", food_store_id, status "ACTIVE" }` (ojo: snake_case, no `openTime`). Lista Lunes→Domingo en 12 h ("9:00 PM"), resalta el día de hoy (zona America/Caracas), días sin fila = "Cerrado", status ≠ ACTIVE se muestra tal cual. El backend escribe "Miercóles": se usan nombres locales por clave `day`. |
| `SalesRecoveryAssistant.tsx` | **[TEMP] Apagado el 2026-09-22, a pedido del usuario, mientras se hacen trabajos de UI.** `return null;` como primera línea del componente (antes de cualquier hook): el widget no aparece en ninguna tienda (verificado: ni en el Home ni dentro de una tienda, incluso pasado el tiempo de inactividad). Toda la lógica de abajo (Web Speech, Gemini, modo silencioso, comandos, blindaje anti-bucles) queda intacta y sin usarse — deja código inalcanzable después del `return` (no rompe `tsc`, que no falla por código inalcanzable con la configuración de este proyecto). **Para reactivarlo: quitar esa línea.** **Asistente de ventas interactivo (2026-09-21).** Tras "Sí, ayúdame" el widget deja de cerrarse y muestra un botón de micrófono (`SpeechRecognition`/`webkitSpeechRecognition`, `es-VE`, como el buscador), estados **"Escuchando..." → "Pensando..." → "Hablando"**, un globo con la respuesta y la lectura en voz alta con `speechSynthesis.speak`. El texto dictado va por `POST /api/assistant` (ver §1.2; la clave de Gemini nunca llega al navegador). Tocar el micrófono durante "Pensando/Hablando" interrumpe (aborta fetch y voz); la X, o desmontar, corta reconocimiento, petición y voz. Errores (permiso denegado, no se escuchó nada, API caída o sin clave) se muestran en una línea roja y vuelve a reposo; sin soporte de voz avisa. **Blindaje anti-bucles y modo simulador (2026-09-21):** `ask()` (la función de envío) empieza con `if (isProcessingRef.current) return;` — un doble tap, el eco del reconocimiento o un segundo disparo mientras la API responde no generan una segunda consulta. `isProcessingRef` (síncrona) + `isProcessing` (estado, para la UI) se ponen en `true` antes del `fetch`/simulación y se liberan en un `finally` apenas se conoce el resultado (no espera a que termine de hablar, así el micrófono sigue permitiendo interrumpir la voz como antes). Mientras `isProcessing` es `true`, el botón del micrófono queda `disabled` (junto con `farewell`, el silencio de despedida); `toggleMic` repite el guardia por defensa. **Ningún `useEffect` tiene dependencias cíclicas** (revisado y comentado en el archivo): ninguno depende de un estado que él mismo actualice, y `contextRef` es una ref mutada en cada render, nunca dispara un re-render. **Modo simulador:** si el texto (voz o, en el futuro, texto) es exactamente `TEST` (sin distinguir mayúsculas, recortando espacios), `ask()` **omite el `fetch`**, espera 1 s y usa la respuesta fija `'Respuesta de prueba [AGREGAR_CARRITO:2172:3]'`, que pasa por el mismo limpiador de etiquetas/Markdown y dispara `onAddToCart` igual que una respuesta real — sirve para probar todo el flujo (globo, voz, comandos, modo silencioso si se cambia el texto) sin gastar cuota de Gemini. Verificado: con "TEST" no hubo ningún `POST /api/assistant`, el micrófono quedó deshabilitado durante "Pensando..." y el comando de la respuesta simulada abrió el modal igual que uno real. **Filtro anti-Markdown (2026-09-21):** `stripMarkdown()` quita `*`, `_` y `#` del texto (Gemini a veces los devuelve pese a la regla 6) y colapsa espacios/saltos de línea repetidos; corre después de quitar las etiquetas `[MUTE_ASSISTANT]`/`[VER_PRODUCTO]`/`[AGREGAR_CARRITO]` y antes de `setBubble`/`speak`, así el globo y la voz solo ven texto plano. Los guiones (`-`, viñetas) no se tocan, igual que pidió la tarea. Verificado con una respuesta simulada con negritas/numeral/guion bajo: el globo mostró el texto ya limpio. **Comando `[AGREGAR_CARRITO:id:cantidad]` (2026-09-21):** regex `/[AGREGAR_CARRITO:([a-zA-Z0-9_-]+):(d+)]/`; la etiqueta se quita del texto y se llama a la prop `onAddToCart(id, qty)` (cantidad acotada a 1–99; si llegan los dos comandos manda el de venta y no se abre la ficha dos veces). `MerchantStoreView.handleAssistantAddToCart` **no inyecta al carrito**: por las variantes obligatorias abre el modal maestro (vía `handleAssistantOpenProduct`) para que el cliente confirme sabores/extras, y **la cantidad pedida llega al modal**: `handleProductClick(product, initialQty = 1)` guarda `modalInitialQty` y `MasterProductModal` (prop `initialQty`, validada a entero 1–99; el efecto de apertura hace `setQty(startQty)`) arranca su contador en ese número; también viaja por `MerchantTemplateEngine` (`productInitialQty`). El clic normal en una tarjeta o promoción sigue abriendo con 1. Con combos, las ranuras se ajustan solas a `baseSlotCount × qty`. Verificado con API simulada: `[AGREGAR_CARRITO:2172:3]` abre el modal con el contador en 3. Queda comentada la arquitectura para inyectar directo en `localStorage['cart_data']` (vía `updateCartStorage`) cuando el producto no tenga grupos obligatorios. Verificado con API simulada (se pidió `/product/2172/web`, etiqueta invisible). **Comando `[VER_PRODUCTO:id]` (2026-09-21):** el componente detecta `/[VER_PRODUCTO:([a-zA-Z0-9_-]+)]/`, quita la etiqueta del texto (ni globo ni voz la ven) y llama a la prop `onOpenProduct(id)`. **No usa `useRouter` ni rutas:** la app no tiene `/store/{id}/product/{id}` (el catálogo es estado de `page.tsx` y la URL siempre es `/`); `MerchantStoreView` implementa `handleAssistantOpenProduct`, que busca el id en los `products` cargados y ejecuta el mismo `handleProductClick` del clic en la tarjeta (abre el modal maestro; un id inexistente no hace nada). Verificado con API simulada: se pidió `/product/2172/web` y la URL no cambió. **Modo silencioso (2026-09-21):** si la respuesta trae `[MUTE_ASSISTANT]`, el componente la quita del texto (globo y voz nunca la ven), guarda `sessionStorage['duna_assistant_muted'] = '1'`, muestra la despedida con el micrófono deshabilitado (`farewell`) y, al terminar de hablar (o a los 4 s si el navegador no tiene voz), pone `muted` y devuelve `null`: sin widget, sin temporizador de inactividad y sin saludo por voz durante el resto de la sesión (el `sessionStorage` sobrevive al remontar el componente al cambiar de tienda; se limpia al cerrar la pestaña). Verificado con API simulada: etiqueta ausente del texto, micrófono deshabilitado durante la despedida, widget oculto después y tras 15 s de inactividad. Depende de que Gemini incluya la etiqueta: no probado con el modelo real. **Contexto (2026-09-21):** props opcionales `menuContext` y `cartContext` (strings) que `MerchantStoreView` arma en solo lectura desde `products` (productos con stock y precio: "Nombre (detalle) ($precio), …"; nombre completo (sin corte por nombre; el tope es el total) y detalle = "Opciones: a, b, c" con los `items[].title` de `metadata.variants` (o `variants`; hasta 8, sin las INACTIVE) si el producto los trae, si no `description` (hasta 60 caracteres, p. ej. "1 Litro"); se agregan entradas completas hasta ~1500 caracteres, el tope del backend. **Los sabores no están disponibles:** el listado `/products/store/{id}` solo trae `description`, las variantes viven en el detalle `/product/{id}/web` y no se consulta por producto (serían decenas de peticiones); si algún día el listado trae `variants`, el código ya las usa) y `cartItems` ("2x Nombre ($total), … Total: $X"; vacío si no hay ítems) y que viajan en el `POST /api/assistant`; el asistente los lee vía ref (siempre el último estado) y sigue sin tocar carrito ni catálogo. No hay store global (Zustand/Context): el carrito vive en el estado de `MerchantStoreView`, por eso se pasan por props. Verificado con reconocimiento y API simulados (estados y payload correctos; el payload real lleva el menú de Papá Helado y `cartContext: ""` con la bolsa vacía; con productos en el carrito no se probó en vivo). Descripción original: **Asistente de recuperación de ventas (esqueleto, 100% aislado)**: no lee ni toca carrito, categorías ni backend. Escucha `mousemove`, `touchstart`, `keydown` y `scroll`; tras 15 s sin actividad (`idleMs`) muestra un widget flotante (`fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50`) con "Hola, ¿puedo ayudarte a terminar tu pedido?", botón naranja "Sí, ayúdame" (hoy solo lo cierra; hay un `onAccept` opcional para conectarlo después) y una X que lo cierra y reinicia el contador. La actividad reinicia la cuenta pero **no** oculta el widget ya visible (si no, el usuario no podría alcanzar el botón). **Voz:** la primera vez que aparece habla con `speechSynthesis` (`es-US`, voz en español si el navegador la tiene): "Hola, ¿te puedo ayudar con esta fase y dirigirte en el proceso hasta que hagas tu compra?"; no se repite y se cancela al cerrar o desmontar. Los navegadores pueden bloquear la voz sin interacción previa. Montado al final de `overlaysNode` en `MerchantStoreView` (con y sin motor multiplantilla). |
| `VoiceSearchButton.tsx` | **Dictado por voz del buscador (2026-09-21).** Botón de micrófono dentro del input de búsqueda de `MerchantStoreView` (`onResult={setSearchQuery}`: mismo estado que el teclado, así el filtrado es inmediato). Usa `window.SpeechRecognition || window.webkitSpeechRecognition` (`lang` `es-VE`, un solo resultado, `results[0][0].transcript` sin puntuación final). Al escuchar el botón pasa a `bg-[#fe6712]` con `animate-pulse`; segundo clic detiene. **Defensivo:** si el navegador no soporta la API no dibuja nada; `try/catch` en todo; permiso denegado (`not-allowed`) deja el botón atenuado con `title` explicativo; aborta al desmontar. Aislado: no conoce catálogo ni carrito. Verificado en navegador con reconocimiento simulado (texto insertado, estado "escuchando"); no probado con micrófono real. El buscador propio del motor (farmacia) no se dibuja hoy, por eso no lleva botón. |
| `ProductTagBadges.tsx` | **Insignias de los metadatos ocultos (2026-09-22).** Recibe `tags` (el objeto de `parseDescriptionTags`, ver `src/lib/productTags.ts`) y dibuja `flex flex-wrap gap-2` de cápsulas (`text-xs font-semibold px-2 py-1 rounded-full`); `null` si `tags` está vacío (no deja un contenedor vacío). Compartido por la tarjeta del catálogo (`MerchantStoreView`) y la ficha (`MasterProductModal`) para que el estilo de cada etiqueta sea idéntico en los dos lugares. Estilos condicionales: `VENTA` con "fórmula"/"récipe"/"prescripción" → rojo de alerta (`bg-red-50 text-red-700`); "libre" → verde (`bg-emerald-50 text-emerald-700`); otro texto → gris neutro. `FRIO` = "SI"/"SÍ" → "Cadena de frío" en tono hielo (`bg-sky-50 text-sky-700`) con ícono `Snowflake` de `lucide-react` (no emoji, para que herede el color por `currentColor` como el resto de los íconos del proyecto); cualquier otro valor (`NO`, etc.) → **no se dibuja ningún badge para `FRIO`** (2026-09-22, a pedido del usuario: "Sin refrigeración" saturaba la tarjeta sin aportar; `badgeFor` devuelve `null` y el componente filtra esas entradas antes de contar si hay algo que mostrar). `PRINCIPIO`/`CONCENTRACION` → tono corporativo (`bg-brand-orange-light text-brand-orange`). `REGISTRO` → gris, con el prefijo "Reg. " agregado. `MARCA`/`LABORATORIO` → gris neutro. Verificado con datos simulados (interceptando `/products/store/{id}` y `/product/{id}/web` de Farma D'una Virtual, ya que ningún producto real trae hoy las etiquetas): capturas en la tarjeta y en la ficha muestran los siete tipos de insignia con los colores correctos (roja para "Venta bajo Fórmula Médica", verde para "Libre", azul+copo de nieve para "Cadena de frío"), sin llaves/corchetes visibles y sin romper el layout de las tarjetas sin etiquetas (heladerías, el resto de farmacia, etc.). |
| `ShareButton.tsx` | **Botón de compartir nativo (2026-09-22).** `<button>` con ícono `Share2` (o `Check` unos 2 s tras copiar, mismo patrón de feedback que "Copiar a todas") que llama a `shareNative({title, text, url})` (ver `src/lib/shareUtils.ts`) al hacer clic (`e.stopPropagation()` para no disparar el clic de la tarjeta/hero debajo). Compartido por `MerchantStoreView` (botón de tienda, en el hero) y `MasterProductModal` (botón de producto, en la cabecera): mismo componente, mismo comportamiento, solo cambian `title`/`text`/`url`/clases. **Sin datos inventados:** ambos componentes solo lo renderizan si tienen el `code`/slug real de la tienda (`merchant.code` / `store.code`); sin eso, no hay URL válida que compartir y el botón no aparece. |
| `MerchantTemplateEngine.tsx` | **Motor multiplantilla** (layout contenedor, solo presentación). **Integrado en `MerchantStoreView`** (2026-09-21): la vista de tienda se monta dentro del motor cuando `templateNicheFromStoreNiche(storeNiche)` devuelve plantilla (FAST_FOOD/PIZZERIA/SEAFOOD→`fast-food`, FOOD_SWEETS→`ice-cream`, FASHION→`boutique`, TECH/PARTS_CATALOG→`tech`, LIQUOR_GOURMET→`bodegon`, MINIMARKET→`minimarket`, PHARMACY→`farma`); `GENERIC` se muestra como antes, sin motor. **Sin navbar propio (2026-09-22):** se eliminó por completo la franja `<header>` (nombre de la tienda, tasa BCV, píldora Wallet, botón de carrito y "← Volver al inicio"); `MerchantStoreView` ya cubre "volver" con el isologo `fixed` y el carrito se abre desde la barra "Productos en bolsa" (mismo patrón que las tiendas sin plantilla, que nunca tuvieron ese botón). La prop `onOpenCart` y el drawer interno del motor quedan sin uso (nada los invoca ya). El contenedor de cabecera de nicho (chips/moods) pasó de `sticky top-[61px]` a **`sticky top-0`** al desaparecer esa franja. En modo motor: el hero entra por la prop `hero` (ahora incluye el buscador, ver `MerchantStoreView`), las categorías salen de `productCategories` (`filters`/`activeFilter`/`onFilterChange` = `selectedCategory`) y **reemplazan** las pestañas y las insignias propias de la vista (se pintan una sola vez), el `MasterProductModal` lo monta el motor con el mismo `storeNiche` y `handleAddToCartFromModal` (montaje condicional idéntico). Sin handler no se dibuja el probador virtual (boutique), el toggle de fichas técnicas (tech) ni el buscador propio de farma (la vista ya tiene el suyo): hoy esos handlers no existen en el proyecto. Verificado en un servidor de desarrollo aislado (Papá Helado, Farma D'una Virtual, Franela Store): chips filtran la grilla (30→13), el modal abre, agregar actualiza la barra de bolsa, y sin errores de consola. **Re-verificado 2026-09-22** tras quitar el navbar: sin "BCV:" en pantalla, isologo visible y `fixed` en mobile/desktop en las tres tiendas (incluida farmacia), sin scroll horizontal. Prop `niche`: `'fast-food' | 'boutique' | 'tech' | 'ice-cream' | 'minimarket' | 'bodegon' | 'farma'` (se traduce a `StoreNiche` de `nicheConfig` para badges, umbral gamificado y `getModalEngine`). Núcleo universal: drawer del carrito con termómetro gamificado (umbral de `nicheConfig.cartGamification.thresholdLabel` o prop `freeShippingThreshold`) y `MasterProductModal`. Cabecera por nicho: moods con emoji (fast-food), botón de probador virtual (boutique, solo si llega `onOpenVirtualFitter`), toggle de fichas técnicas (tech), chips de formato/pasillos (ice-cream/minimarket), aviso +18 (bodegón) y buscador por principio activo con aviso sanitario (farma). Filtros = categorías reales de `products` o `filters`. **No calcula precios, no toca el carrito ni el backend:** todo por props/callbacks; el catálogo entra como `children`. |
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
| `productTags.ts` | **Metadatos ocultos en `description` (2026-09-22).** `parseDescriptionTags(description)` busca etiquetas `[CLAVE: Valor]` (claves: `MARCA`, `PRINCIPIO`, `CONCENTRACION`, `LABORATORIO`, `REGISTRO`, `VENTA`, `FRIO`, case-insensitive) y devuelve `{ cleanDescription, tags }`: la descripción sin las etiquetas (espacios colapsados) y un objeto clave→valor con lo extraído. Sin corchetes (el caso real hoy, ver abajo) devuelve `tags: {}` y `cleanDescription` = el texto original, intacto. **Ningún producto real del backend DEV usa esta sintaxis todavía** (verificado 2026-09-22 en farmacia, bodegón, tecnología y autopartes, ~124 productos, 0 con corchetes): es una convención que el frontend ya sabe leer, a la espera de que algún comercio la use en su copy. |
| `orderTracking.ts` | Helpers del seguimiento: `FINAL_STATUSES`/`isFinalStatus`, `friendlyStatus`, `parseCoords`, `toWhatsAppNumber` (`04…` → `58…`), y la **fase** del pedido: `sortHistoryDesc`, `trackingPhase`/`getTrackingState` → `driver_assigned` \| `on_route` (TAKEN/Recogido/Entregando/En camino) \| `arrived` (Llega a sitio/Llegó) \| `delivered` \| `other`, más `deliveryCode` (`delivery_code`, alias `code`/`pin`/`confirmation_code`). La fase sale del evento **más reciente** del historial. |
| `googleMaps.ts` | `loadGoogleMaps()` (carga única del script de Maps JS con `NEXT_PUBLIC_GOOGLE_MAPS_KEY`, respaldo a la clave oficial) compartido por `LocationPickerModal` y `LiveOrderMap`; declara `window.google`. |
| `useArrivalAlert.ts` | Hook: al detectar la **transición** a `arrived` mientras el modal/página están abiertos, toca un chime (Web Audio API, dos senoidales 659 Hz + 988 Hz, sin mp3) y `navigator.vibrate([200, 100, 200])`. No suena si el pedido ya estaba en `arrived` al cargar. Los navegadores exigen un gesto previo del usuario para audio/vibración (el `AudioContext` se desbloquea en el primer clic/toque/tecla). `OrderTrackingModal` lo llama a nivel de modal (funciona aunque la pestaña visible no sea Estatus, y cambia a Estatus al llegar/entregar); la página `/timeline` también. |
| `shareUtils.ts` | `shareStoreWhatsApp`/`shareProductWhatsApp`/`copyToClipboard` — **sin importadores, código huérfano** (abren `api.whatsapp.com` directo; `shareProductWhatsApp` arma la URL como `${origin}${pathname}?item={code}`, un query param que ningún componente real lee). **`shareNative({title, text, url})` (2026-09-22, sí en uso):** intenta `navigator.share` (selector nativo del SO); si no existe, si el usuario lo cancela (`AbortError`) sin elegir nada no cae a nada (se considera "no completado", no error), y si falla por otro motivo cae a `copyToClipboard`. Devuelve `{ ok: 'shared' \| 'copied' \| 'failed' }`; nunca lanza — quien lo llama (`ShareButton.tsx`) decide el feedback visual. Usado por los botones de compartir tienda/producto (ver `ShareButton.tsx`); las funciones de WhatsApp de arriba siguen huérfanas, sin tocar. |

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
   **Proporción sin recorte agresivo (2026-09-22, Fase 12):** el contenedor pasó de una altura fija
   (`h-52 lg:h-44`) a `aspect-[3/1] max-h-[420px]`. Antes, con el banner a sangre (ancho completo
   del viewport, sin `max-w`) y una altura fija de apenas 176 px en escritorio, la relación forzada
   llegaba a ~7–11:1 en monitores anchos — muy lejos de la relación real de los banners subidos por
   los comercios (2.4:1–3:1, verificado descargando y midiendo varios: Papá Helado 1600×533 = 3.00,
   Franela/Proseco/Farma 960×360 = 2.67, El Abasto/Lois 3213×1323 = 2.43), así que `object-cover`
   recortaba el arte de forma agresiva (sobre todo arriba/abajo). `aspect-[3/1]` se acerca al
   promedio real (recorte mínimo) y escala con el ancho en vez de quedar fija; `max-h-[420px]` evita
   que la portada crezca sin límite en monitores ultra anchos (a costa de volver a recortar un poco
   en esos casos extremos — compromiso consciente, no se acotó el ancho del hero a `max-w` porque
   el diseño "a sangre" ya era intencional desde antes). Verificado en navegador: 1366 px → 420 px de
   alto (tope por `max-h`, ratio final 3.25); 390 px → 130 px de alto (ratio 3.00 exacto, sin tope);
   el arte y los overlays (isologo, avatar, nombre, badges, botón de compartir) se ven completos y
   legibles en ambos tamaños, sin scroll horizontal.
   **Ancho contenido en escritorio (2026-09-22, corrección):** el compromiso de la Fase 12 (dejarlo a
   sangre en escritorio, solo `max-h` como freno) resultó "tosco" en monitores anchos — se corrigió
   envolviendo el banner en `lg:max-w-7xl lg:mx-auto lg:px-8 lg:pt-4` (mismo ancho de contenido que el
   resto de la tienda) y redondeándolo como tarjeta (`lg:rounded-2xl`); en móvil sigue a sangre, sin
   cambios. Con el ancho ya acotado, `max-h-[420px]` deja de ser el freno real la mayoría del tiempo
   (a 1216 px de ancho contenido, `aspect-[3/1]` da ~405 px, por debajo del tope) — se dejó igual, es
   inofensivo. Verificado en navegador (Franela Store, 1366 px): banner en tarjeta redondeada con
   margen a ambos lados (405 px de alto, 1216 px de ancho, ya no a sangre), sin scroll horizontal.
   **Reset de scroll al entrar a una tienda (2026-09-22):** nuevo `useEffect` en `MerchantStoreView`
   (`window.scrollTo({top:0, left:0, behavior:'instant'})`, deps `[]`) — como `page.tsx` monta este
   componente con `key={activeMerchantId}`, cambiar de tienda es un remonte completo y el efecto corre
   de nuevo en cada una. Sin esto, si el cliente entraba con el Home scrolleado, la tienda podía abrir
   a mitad de página. Verificado: Home scrolleado a 1500 px → entrar a una tienda → `scrollY` cae a 0;
   repetido volviendo atrás, scrolleando de nuevo y entrando a una tienda **distinta** → también 0.
2. **Tarjeta de info** de la tienda (avatar real, categoría, rating, tiempo, delivery).
3. **Badges de confianza:** **eliminados de la vista de tienda (2026-09-21)** — ni la cinta bajo las categorías (`MerchantStoreView` ni `MerchantTemplateEngine`) ni chips tipo "Cadena de Frío Garantizada". `nicheConfig.trustBadges` sigue definido; solo se consume en la tarjeta "Garantía D'una" del aside de farmacia. El motor ya no dibuja el contenedor de cabecera si `renderNicheHeader()` devuelve `null` (sin espacio muerto).
4. **Promociones Imperdibles** (`PromotionsCarousel`). Click → abre el modal del producto
   reutilizando `handleProductClick` con `productHash` como id (el contrato acepta id o hash);
   si la promo no trae `productHash`, no hace nada.
5. **Tabs de categoría (móvil sticky, 2026-09-21):** en móvil quedan **fijas al hacer scroll** con fondo `bg-white/95 backdrop-blur-md shadow-sm`: con plantilla es el contenedor de cabecera del motor (`sticky top-[61px] z-30`, bajo el navbar; `lg:static` en escritorio); sin plantilla, la fila de chips (`sticky top-0 z-40`). Para no chocar con ellas, el buscador de `MerchantStoreView` es sticky solo en escritorio (`lg:sticky`); en móvil se desplaza con el contenido. Verificado a 390 px en Papá Helado/Franela/Proseco (quedan en `top: 61px`, sin scroll horizontal). Derivados de `products.map(p => p.category)` (únicos, en orden de
   aparición, "Otros" si falta la categoría). Se combinan (AND) con el buscador de texto.
6. **Buscador** y grilla de productos. **Metadatos ocultos en la tarjeta (2026-09-22):** debajo del nombre/subcategoría se agregó `cleanDescription` (línea corta, `line-clamp-1`, solo si no está vacía) y, debajo, `<ProductTagBadges>` con lo extraído por `parseDescriptionTags` (ver `src/lib/productTags.ts` y la fila de `ProductTagBadges.tsx`). Sin etiquetas `[CLAVE: Valor]` en la descripción (el caso de todos los productos reales verificados hoy) no cambia nada visualmente: se ve la descripción normal y ningún badge. **Tarjeta cuadrada + lightbox (2026-09-22):** la foto de cada tarjeta pasó de `h-24 md:h-32` + `object-contain` (centrada, con aire alrededor) a un marco **1:1** (`aspect-square`) con `p-2` de fondo blanco y la imagen en `object-cover` (llena el cuadro sin deformarse; el padding uniforme deja un borde blanco limpio y, con `box-sizing: border-box`, el área interior sigue siendo un cuadrado exacto). Lleva un ícono de lupa translúcido (`ZoomIn`, `bg-black/30`) en la esquina inferior derecha, ahora un `<button>` (antes un `<span>` sin interacción). **Disparador exclusivo en la lupa (2026-09-22):** solo ese botón abre el lightbox (`onClick` con `e.stopPropagation()` + `lightboxImage`, estado local: `{url, name}`); el contenedor de la foto ya NO tiene `onClick` propio (se quitó tras la Fase 2, donde vivía ahí y competía con la ficha del producto), así que tocar el resto de la foto deja que el `onClick` de la tarjeta completa burbujee y abra `handleProductClick` (el modal del producto) con normalidad, igual que el título o el precio. El lightbox abre un overlay `fixed inset-0 z-50 bg-black/80` con la imagen a tamaño grande (`max-h-[85vh] object-contain`) y botón "Cerrar" (`X`); cierra con la X o tocando el fondo oscuro (la imagen ampliada tiene su propio `stopPropagation` para no cerrarse al tocarla). Verificado en navegador (390 px, Papá Helado, con seguimiento de red): clic en la lupa → abre el lightbox y **nunca** pide `/product/{id}/web` (la ficha no se abre); clic en el resto de la foto → pide `/product/{id}/web` y abre la ficha, sin lightbox; tarjeta 147×147 con imagen recortada a `object-fit: cover`; sin scroll horizontal. **Catálogo paginado (auditoría AdonisJS, 2026-09-21):** `GET /products/store/{id}` pagina de a 30 (`data.meta.{total,per_page,current_page,last_page}`, `data.hasMore`, `?page=N`). Antes se cargaba solo la página 1, así que el catálogo y los departamentos quedaban recortados (Proseco Bodegón: 30 de 255 productos y solo "LICORES"; Papá Helado: 30 de 38 y 4 de 8 categorías). `getProductsByStore(id, page)` acepta la página y `page.tsx` (`handleStoreClick`) trae las demás en paralelo y en segundo plano (tope 12 páginas = 360 productos, deduplica por `id`, descarta si el usuario cambió de tienda; `MerchantStoreView` recibe `isLoadingMore` y muestra "Cargando catálogo completo…"). Los departamentos salen de las categorías reales de los productos (sin recortes): ahora Proseco = 255 productos / 5 categorías, Papá Helado = 38 / 8, Franela = 35 / 5, Farma = 40 / 3. `data.categories` del backend también lista categorías sin productos activos (p. ej. "SNACK"); no se usa para no mostrar departamentos vacíos. **Tarjeta de producto (2026-09-21):** grilla `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` con tarjeta vertical (imagen `object-contain`, etiqueta superior = `brand`/`laboratory` si existen, si no `category`; título; subcategoría = `internalCategory` en `text-brand-orange`; precio; "Ver Ficha"; botón "+ Agregar"). El `onClick` del contenedor sigue siendo `handleProductClick` (abre el modal maestro): "Ver Ficha" y "+ Agregar" no tienen handler propio, disparan ese mismo clic por propagación. La insignia (Marca Oficial azul / Genérico verde) solo se dibuja si el producto trae `isOfficialBrand` / `isGeneric`: hoy el backend no envía esos datos, por eso no aparece. `tailwind.config.js` define el color `brand-orange` (`#fe6712`). **Diseño de escritorio con barra lateral (2026-09-21, ahora en TODAS las tiendas):** el `<aside>` de Departamentos (sticky) y la grilla de 3 columnas se muestran en todos los comercios, con o sin plantilla; la portada se conserva en todos salvo **farmacia**, donde se oculta en escritorio ("directo al grano"). Récipe (tarjeta y botón móvil) y "Garantía D'una" siguen siendo solo de farmacia (en los demás las insignias ya se ven arriba); las pestañas/chips de categoría quedan solo en móvil (`lg:hidden`); el aviso +18 del bodegón y demás avisos de nicho siguen visibles en escritorio. Detalle del layout de farmacia: el motor recibe `desktopSidebarLayout` (contenedores `max-w-7xl`, `<main class="max-w-7xl mx-auto w-full px-4 md:px-8 py-6 flex-1">`, chips de categoría solo en móvil). **Sin Hero dividido** (se eliminó). **Portada de la tienda:** el botón de texto "← Volver al inicio" fue reemplazado por el isologo de D'una (`/images/duna-isologo.png`, `absolute top-4 right-4`) que ejecuta el mismo `onBack`. **La portada se oculta en escritorio** (`lg:hidden` cuando `sidebarLayout`; en móvil se ve normal), igual que la cinta de avisos (texto sanitario + insignias, `lg:hidden` en el motor). Como la portada traía el botón "Volver al inicio", el motor lo muestra en el navbar (prop `onBack`, solo `lg`) y el nombre de la tienda queda en el navbar; así el catálogo sube a la primera pantalla. Debajo, `grid lg:grid-cols-4` con `<aside>` — primera tarjeta "Subir Récipe Médico / Cotización con Farmacéutico" (borde `brand-orange`, fondo `orange-50`, icono; enlace `wa.me` al teléfono real del comercio con mensaje prellenado, solo si hay `merchant.phone`; la app no tiene subida de récipe propia; **en móvil** el mismo enlace `recipeHref` aparece como botón `lg:hidden` (`bg-brand-orange-light`, icono + "Subir Récipe Médico") justo encima del buscador, con la misma condición de teléfono), el `<aside>` es **sticky** (`sticky top-24 self-start max-h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar`, bajo el navbar de 61 px), luego "Departamentos" (categorías reales con contador que usan `setSelectedCategory`), "Marcas & Laboratorios" (solo si los productos traen `brand`/`laboratory`, hoy no) y "Garantía D'una" (`trustBadges` del nicho) — y `<section lg:col-span-3>` con buscador, promociones y "Todos los Productos" + badge de cantidad en 3 columnas. `tailwind.config.js` suma `brand-navy`, `brand-navy-light`, `brand-orange-light` (`#fff5ed`) y la sombra `shadow-soft`. Los demás nichos conservan el diseño anterior (grilla de 4 columnas, sin barra lateral).
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
- **Barrido corporativo de emojis (2026-09-22, Fase 6):** se quitaron/reemplazaron por íconos de `lucide-react`
  los emojis en UI compartida de componentes **activos** (con importadores reales): botón "Ver mi Pedido" (`page.tsx`,
  `Bike`), buscador y filtro de categorías del Home (`Search`, `Tag`), calificación/flete/pin del Home y de
  `MerchantStoreView` (`Star`, `Bike`, `Clock`, `MapPin`), chip "Todos" (texto plano, sin emoji), gamificación y
  courier del carrito (`CartModal.tsx`: `PartyPopper`, `Flame`, `Package`, `MapPin`), Cofre Recompensa/confirmación
  de pago/comprobante adjunto/seguimiento en `CheckoutModal.tsx` (`Gift`, `CreditCard`, `Clock`; "✓ archivo" y el
  🚀 final de "¡Tu pedido ya está en la cocina!" se quitaron sin reemplazo), badge de vehículo asignado en
  `CheckoutModal.tsx` (antes `logisticsResult.vehiculoAsignado.icono` en texto; ahora `VehicleIcon` local mapea
  `id` → `Bike`/`Car`/`Truck`, sin tocar `logisticsEngine.ts`), avatar/alerta/botón de repartidor en
  `OrderTimelinePanel.tsx` (`Bike` como fallback de iniciales, `KeyRound` en el aviso de llegada), y "Copiar a
  todas" en `MasterProductModal.tsx` (`Check`/`Copy`). Verificado con un barrido de todo `src/**/*.tsx?` (script
  ad hoc) más `tsc`/`npm run build` en exit 0; en navegador se confirmó (Home, tienda, modal de producto) que no
  queda ningún emoji visible en el texto y sin scroll horizontal — el carrito y el checkout se revisaron solo por
  código (la automatización de UI no logró agregar un producto real de forma fiable para verlos en vivo en esta
  sesión, no por un fallo del cambio).
  **Fuera de alcance a propósito (no se tocó, con motivo):**
  - Comentarios de código (`//`, `/* */`): no son texto visible para el cliente.
  - Componentes **sin importadores** (`PaymentModal.tsx`, `OrderSuccessModal.tsx`, `CartDrawer.tsx`,
    `VariantModal.tsx`, `PharmacyStoreView.tsx`, `Navbar.tsx`) y páginas sandbox/demo (`test-helado`,
    `test-logistica`, `tienda/demo-mostaza`): no forman parte del flujo real (ver §1.2/§1.3), así que limpiarlos no
    cambia lo que ve un cliente; se dejaron tal cual para no gastar riesgo en código muerto.
  - `src/lib/shareUtils.ts` (mensajes de WhatsApp al compartir tienda/producto, con ✨📍🔗👉🛍️💰): **sin
    importadores**, además de ser texto de marketing saliente (lo lee quien recibe el mensaje de WhatsApp, no la
    UI de la app), donde el emoji es una convención normal, no "ruido" de interfaz.
  - **Marcadores del mapa embebido** (`LiveOrderMap.tsx`, 🏪🏠🛵): el emoji se dibuja dentro de un SVG
    (`data:image/svg+xml`) usado como ícono real de Google Maps, no como texto de la página — cambiarlo por un
    ícono de `lucide-react` exigiría incrustar su SVG a mano en ese generador, más trabajo del que pedía esta
    tarea. La leyenda de texto bajo el mapa ("🏪 Comercio · 🏠 Entrega · 🛵 Repartidor") se dejó igual a propósito,
    para que siga coincidiendo con los pines reales del mapa.
  - **Moods con emoji de la cabecera fast-food** (`MerchantTemplateEngine.tsx`, `moodEmoji`/`chipsRow` con
    `withEmoji`): es una función de personalización de nicho **documentada** (§4.0/§1.3, "Cabecera por nicho:
    moods con emoji"), no ruido accidental; solo aplica al nicho fast-food, no a "UI compartida". Se dejó para
    no desmontar una feature de diseño existente sin que el usuario lo pida explícitamente.
  - **Banderas de país** en el selector de prefijo telefónico (`CheckoutModal.tsx` y el huérfano
    `PaymentModal.tsx`, 🇻🇪🇺🇸🇨🇴): convención estándar de UI para diferenciar +58/+1/+57 a simple vista; quitarlas
    sin un texto alternativo habría restado usabilidad al formulario.
  - **Checkboxes ☑/☐ de forma de pago** y el prefijo **👤/🍔** de los encabezados de ranura en la Comanda POS
    (`OrderTrackingModal.tsx`, `MasterProductModal.tsx`): **no son decorativos.** El formato de recibo con
    checkboxes está documentado en §2.3, y el prefijo 👤 (con su alias legado 🍔) es el delimitador que
    `OrderTrackingModal.tsx` usa para *parsear* dónde empieza cada ranura en el desglose guardado; quitarlo habría
    roto la Comanda POS y el Recibo. Los símbolos ✓/✕ sueltos de `OrderTimelinePanel.tsx` (puntos de estado del
    timeline) tampoco se tocaron: son glifos tipográficos monocromos, no emoji a color, y no estaban en los
    ejemplos de la tarea.
  - **Corregido en la Fase 7 (2026-09-22):** los upsells inventados de `getUpsellsByNiche()` que se detectaron
    aquí durante la Fase 6 (ver más abajo, "Purga de upsells falsos").
- **Purga de upsells falsos (2026-09-22, Fase 7):** `getUpsellsByNiche()` en `MasterProductModal.tsx` devolvía
  productos 100% inventados por `nicheEngine` — "Ración de Papas Fritas" (`UP-FRIES`), "Refresco Frío"
  (`UP-DRINK`), "Topping de Chocolate Extra" (`UP-CHOC`), "Paquete de Conos" (`UP-CONES`), "Bolsa de Hielo
  Gourmet" (`UP-ICE`), "Empaque de Regalo VIP" (`UP-GIFT`) — con códigos que no existen en el catálogo real del
  backend (el mismo tipo de problema que el barrido anti-demo de la Fase 4 corrigió en `availableGroups`, ver
  `MasterProductModal.tsx` en la tabla de componentes). Se eliminó la función y sus arreglos por completo; `const
  currentUpsells: {...}[] = []` queda tipado y vacío, lista para conectarse a upsells reales del backend el día
  que existan (p. ej. `product.upsells`/`product.metadata.upsells`). Las dos secciones que lo consumen ya estaban
  gateadas por `currentUpsells.length > 0` (paso "1-Tap" de step 2 y el botón "Continuar" del footer en step 1),
  así que con el arreglo vacío desaparecen solas — **sin espacios en blanco ni pasos rotos**, el modal va directo
  de la selección de variantes al botón "Agregar al Pedido". Nota aparte: el paso 2 (pantalla de upsells) ya
  estaba deshabilitado desde antes por un comentario `// TEMPORAL` en `handleNextStep` (saltaba directo a
  `handleAddToCart()` sin pasar por `setStep(2)`), así que en la práctica esta pantalla no era alcanzable de
  todos modos; ahora, sin datos falsos que mostrar, tampoco hay razón para reactivarla hasta que haya upsells
  reales. `upsellSelections`/`toggleUpsell` y su suma en el precio total quedan intactos (no son la fuente falsa,
  solo consumían lo que devolvía `getUpsellsByNiche`): con `currentUpsells` vacío nunca se selecciona nada, así
  que no afectan el cálculo. Verificado en navegador (Papá Helado, producto combo): sin ninguno de los nombres
  falsos en pantalla, sin la pantalla "¡Excelente elección!", el footer muestra "Agregar al Pedido" directo, sin
  scroll horizontal.

### Deuda técnica conocida (a 2026-09-20)

- `handleStoreClick` (`page.tsx`) no bloquea la entrada a tiendas cerradas; solo el checkout.
- **Botones de compartir (2026-09-22) apuntan a rutas que HOY NO EXISTEN:** `ShareButton` arma `${origin}/store/{code}` y
  `${origin}/store/{code}/product/{id}` (pedido explícito de la misión: slug real, nunca el id numérico), pero la app **no
  tiene** `src/app/store/[code]/page.tsx` ni `.../product/[id]/page.tsx` — toda la app vive en `/` con estado en memoria
  (ver §1.2), igual que ya le pasaba a `shareStoreWhatsApp`/`shareProductWhatsApp` en el `shareUtils.ts` huérfano. Abrir
  el enlace compartido hoy da el 404 propio de Next.js, no la tienda/producto. Implementado tal cual se pidió (no se
  inventaron rutas nuevas, fuera del alcance de esta tarea); **pendiente:** crear esas dos rutas como páginas finas que
  lean el `code`/`id` de la URL y monten el Home con esa tienda/producto ya abiertos, para que el enlace compartido
  funcione de verdad.
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

- **Refactorizaci�n de Tarjeta Cl�nica (MasterProductModal.tsx)**: Se actualiz� la secci�n de farmacia a un dise�o sobrio y elegante de alta conversi�n, eliminando emojis y usando SVGs monocrom�ticos con tipograf�a de alto contraste. Se soporta \cadenaFrio\ y \equiereFrio\, con descargo de responsabilidad institucional.

- **Bit�cora Arquitectura Farmacia**: Se cre� el documento de arquitectura y contingencia \docs/technical/bitacora-arquitectura-farmacia-storefront.md\ detallando la integraci�n, contrato de datos \metadata.farmacia\ y runbook de troubleshooting.

> **PROTOCOLO PERMANENTE DE BIT�CORA T�CNICA CONTINUA:**  
> Tras finalizar cualquier modificaci�n t�cnica, refactorizaci�n, creaci�n de nuevo c�digo, ajuste de endpoints, schema o componente en este repositorio, el agente tiene la obligaci�n mandatoria e inmediata de registrar el cambio detallado en docs/technical/bitacora-arquitectura-farmacia-storefront.md dentro de la secci�n "Historial de Modificaciones T�cnicas", indicando:  
> - Fecha y archivo(s) intervenido(s).  
> - Problema t�cnico o requerimiento abordado.  
> - L�gica de c�digo y contratos implementados.  
> - Verificaci�n y pruebas de compilaci�n (cero errores).

- **Regla de Cero Scroll (MasterProductModal.tsx)**: Se reestructur� el modal en dos columnas compactas (Regla de Oro), eliminando overflow-y-auto global innecesario y condensando m�rgenes/padding. La l�gica de \metadata.farmacia\ y el footer se mantienen fluidos sin empujar el viewport.

- **Jerarqu�a Visual de Imagen (MasterProductModal.tsx)**: Se optimiz� el encuadre (h-48), bordes (rounded-xl) y fondo neutro sutil para garantizar legibilidad instant�nea del medicamento, manteniendo el balance y la regla de Cero Scroll.

- **Actualizaci�n de UI en MasterProductModal.tsx**: Se a�adi� el renderizado condicional del badge de subcategor�a (\internalCategory || subCategory\) en la fila taxon�mica, y se ajust� el padding del contenedor de la imagen a \p-2\ para potenciar la escala visual, preservando la compacidad del modal.

- **Acorde�n Desplegable en Departamentos (MerchantStoreView.tsx)**: Se implement� sub-navegaci�n por \internalCategory\. Al seleccionar una categor�a (ej. FARMACIA), se despliega un acorde�n con subcategor�as y conteo interno. Los productos se filtran reactivamente en el cat�logo combinando categor�a y subcategor�a.

### Permisos y Autonom�a Operativa (Declaraci�n)
- **Autorizaci�n Permanente**: El agente tiene autorizaci�n permanente e impl�cita para ejecutar rutinas de lectura de logs, inspecci�n de dependencias (\package.json\), pruebas de tipos en TypeScript (\
px tsc --noEmit\), purgado de cach�s (\m -rf .next\) y arranque de servicios en desarrollo (\
ext dev\). No es necesario pedir confirmaci�n para estas tareas de estabilizaci�n y validaci�n.
- **Excepciones (Confirmaci�n Manual)**: �nicamente se requerir� solicitar confirmaci�n expl�cita del usuario ante acciones destructivas irreversibles, tales como: \m -rf\ sobre c�digo fuente o base de datos, borrado de ramas en Git, o migraciones destructivas de base de datos que impliquen p�rdida de informaci�n.

- **Correcci�n de Tarjeta Farmacol�gica (MasterProductModal.tsx)**: Se elimin� prohibici�n estricta de truncado en la descripci�n cl�nica (removido \line-clamp\). Adem�s se agreg� un fallback basado en contenido para inyectar forzosamente el badge 'Antialergico' si el producto carece de taxonomy estructurada pero pertenece a FARMACIA.

- **Refinamiento Tipogr�fico Farmacol�gico (MasterProductModal.tsx)**: Se estabiliz� la jerarqu�a visual de la ficha t�cnica. El principio activo y concentraci�n ahora comparten una misma l�nea l�xica con distinci�n sutil, y el Registro Sanitario adopt� tipograf�a monoespaciada con recuadro perimetral limpio. Todo respetando estrictamente la 'Regla de Oro de Cero Scroll'.

- **Refactor Completo Ficha T�cnica (MasterProductModal.tsx)**: Se inyect� literalmente el bloque JSX estricto del 'Vadem�cum Ejecutivo' para corregir la falta de renderizado local, unificando definitivamente el Principio Activo con su Concentraci�n y restaurando los contrastes de Laboratorio.

- **Escalado Imponente de Imagen (MasterProductModal.tsx)**: Se reformate� el contenedor izquierdo para obligar a la imagen principal a expandirse (\w-full h-full object-contain scale-110\) y apoderarse de la percepci�n visual. Se mantuvo inalterada la Regla de Cero Scroll.

- **Suite de Neuroventa Farmac�utica y Estabilizaci�n**: Se solvent� la falla de cach� (Error 500) del proceso Node.js. En \MasterProductModal.tsx\ se implantaron con �xito los 4 disparadores psicol�gicos (Entrega Express, Despacho Inmediato, Sello Original, CTA Acci�n) bajo normativas estrictas de dise�o limpio vectorial (sin emojis) y nula disrupci�n de scroll.

- **Refinamiento de Neuroventa y UI**: Se puli� la cinta de Inmediatez Log�stica transicionando a una est�tica 'Sky-blue' m�dica/tecnol�gica, y se limpi� el encabezado del Vadem�cum Ejecutivo (\whitespace-nowrap\) para forzar su alineaci�n horizontal impecable sin da�ar la altura general ni introducir scroll.

- **Escalado y Unificaci�n Tipogr�fica (MasterProductModal.tsx)**: Se forz� un escalado imponente real (\scale-150\) sobre fondo blanco puro y \p-0\ en el empaque para compensar m�rgenes de imagen, adem�s de limpiar y fusionar en un solo bloque textual continuo la taxonom�a de 'Principio Activo & Concentraci�n'.

- **Directiva Maestra de Neuroventa e-commerce**: Implementaci�n de Hero Banner cinem�tico institucional con micro-p�ldoras de log�stica. Buscador y sidebar transformados a layout \sticky\ para acompa�ar el scroll. Sustituci�n de barra de carrito antigua por C�psula Flotante (Glassmorphism). En el modal (\MasterProductModal.tsx\), se integr� l�gica de discriminaci�n contextual para sellos de confianza (Farma vs No-Farma) manteniendo la taxonom�a y la 'Regla de Cero Scroll'.

- **Restauraci�n Visual y Cero Scroll**: Despeje de elementos superpuestos en el Hero Banner. Eliminaci�n del bot�n duplicado de tracking en page.tsx. Compactaci�n extrema de MasterProductModal.tsx mediante reducci�n de paddings y OptionCapsule (py-1.5, px-2.5) garantizando renderizado 100% visible sin scroll del navegador. Eliminaci�n del fallback 'General' en la taxonom�a.
# #   2 0 2 6 - 0 9 - 2 4 :   R e f a c t o r i z a c i o n e s   d e   M a s t e r P r o d u c t M o d a l  
 -   E l i m i n a c i � n   d e   r e d u n d a n c i a   d e   p r e c i o s   ( s e   o c u l t a   T O T A L   A   P A G A R   e n   c o l u m n a   i z q u i e r d a   y   s e   l i m p i a   e l   b o t � n   d e l   f o o t e r ) .  
 -   F a l l b a c k   d e   e x t r a s   d e   v e n t a   c r u z a d a   e n   s l o t s   ( i n y e c c i � n   d i n � m i c a   d e   P a p a s ,   T e q u e � o s   y   R e f r e s c o   s i   n o   h a y   v a r i a n t e s   n a t i v a s ) .  
 -   P r o t e c c i � n   c o n t r a   f i n a l i z a c i � n   p r e m a t u r a   d e   r a n u r a s   ( w i n d o w . c o n f i r m   s i   s e   i n t e n t a   s a l i r   s i n   c o n f i g u r a r   t o d a s )   y   p e r s i s t e n c i a   d e   e d i c i � n   ( b o t � n   p r i n c i p a l   m u t a   a   E d i t a r   p e r s o n a l i z a c i � n ) .  
 # #   2 0 2 6 - 0 9 - 2 4 :   R e f a c t o r i z a c i o n e s   F i n a l e s   d e   M a s t e r P r o d u c t M o d a l   ( R e g l a s   d e   O r o )  
 -   I m p l e m e n t a d a   c a b e c e r a   e r g o n � m i c a   p a r a   n a v e g a c i � n   d e   r a n u r a s   ( n o m b r e   c o m p a c t o   i n t e g r a d o ) .  
 -   V e n t a   c r u z a d a   d i n � m i c a   c o n s u m i e n d o   e l   c a t � l o g o   r e a l   d e   l a   t i e n d a   ( f i l t r a   a c o m p a � a n t e s ,   e x c l u y e   s t o c k   0   y   a p l i c a   a n t i - c a n i b a l i s m o ) .  
 -   C o m a n d a   P O S   f o r m a t e a d a   s i n   t r u n c a m i e n t o   ( w h i t e s p a c e - n o r m a l )   y   c o n   S K U s   v i s i b l e s   p o r   u n i d a d .  
 -   L i m p i e z a   t o t a l   d e   p r e c i o s   r e d u n d a n t e s   e n   l a   f i c h a   b a s e   d e   o p c i o n e s .  
 # #   2 0 2 6 - 0 9 - 2 4 :   C o r r e c c i � n   d e   C e n t r a d o   M o d a l   T r a c k i n g   ( O r d e r T r a c k i n g M o d a l )  
 -   S e   r e e m p l a z �   l a   a l i n e a c i � n   s u p e r i o r   p o r   \  i x e d   i n s e t - 0   z - 5 0   f l e x   i t e m s - c e n t e r   j u s t i f y - c e n t e r \   e n   e l   o v e r l a y .  
 -   S e   i m p l e m e n t �   u n   c o n t e n e d o r   i n t e r n o   c o n   \ m a x - h - [ 9 0 d v h ] \   y   \ m y - a u t o \   g a r a n t i z a n d o   c e n t r a d o   m a t e m � t i c o .  
 -   S e   v a l i d �   e l   \  l e x - 1   o v e r f l o w - y - a u t o \   d e l   c u e r p o   d e l   m o d a l   p a r a   p r o t e g e r   e l   p a d d i n g   y   v i s i b i l i d a d   d e l   f o o t e r / C e r r a r   s e g u i m i e n t o .  
 # #   2 0 2 6 - 0 9 - 2 4 :   D e s g l o s e   V e r t i c a l   e n   C o m a n d a   P O S   d e   C o c i n a  
 -   M o d i f i c a d o   e l   g e n e r a d o r   d e   c a r r i t o   ( M a s t e r P r o d u c t M o d a l )   p a r a   f o r m a t e a r   p a r t i c i p a n t e s   d e   u n   ' P e d i d o   e n t r e   p a n a s '   v e r t i c a l m e n t e ,   s i n   c o n c a t e n a c i o n e s   h o r i z o n t a l e s .  
 -   R e f a c t o r i z a d a   l a   p e s t a � a   K I T C H E N   ( O r d e r T r a c k i n g M o d a l )   p a r a   c o n s u m i r   e l   b r e a k d o w n   e n   e s t r i c t o   o r d e n   v e r t i c a l ,   b y p a s s a n d o   e l   f o r m a t e a d o r   f i n a n c i e r o .  
 -   I n y e c t a d o s   s e p a r a d o r e s   v i s u a l e s   p u n t e a d o s   e n t r e   c a d a   p a r t i c i p a n t e / u n i d a d   p a r a   m � x i m a   l e g i b i l i d a d   d e l   c h e f .  
 # #   2 0 2 6 - 0 9 - 2 4 :   R e f a c t o r i z a c i � n   F i n a n c i e r a   d e   R e c i b o   ( R E C E I P T   T a b )  
 -   S e   d e s l i g �   e l   t a b   d e   R e c i b o   d e l   f o r m a t e a d o r   g e n � r i c o   p a r a   p r o c e s a r   d e   f o r m a   n a t i v a   l o s   s t r i n g s   f i n a n c i e r o s   d e l   b r e a k d o w n .  
 -   I m p l e m e n t a d o   f i l t r o   e s t r i c t o :   s e   o m i t e n   n o t a s   d e   p r e p a r a c i � n   s i n   c o s t o   ( e j .   e x c l u s i o n e s   t i p o   ' S I N . . . ' ) .  
 -   E s t r u c t u r a   d e   3   c o l u m n a s   ( G r i d   C S S )   p a r a   e x t r a s :   N o m b r e   ( l i m p i o   d e   S K U s ) ,   I d e n t i f i c a d o r   d e l   c o m e n s a l   p e r f e c t a m e n t e   t a b u l a d o   y   m o n t o   a d i c i o n a l   a l i n e a d o   a   l a   d e r e c h a .  
 