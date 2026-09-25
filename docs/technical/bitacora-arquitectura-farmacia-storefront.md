# Bit√°cora de Arquitectura y Manual de Contingencia: M√≥dulo Farmacia y Persistencia de Metadatos

## 1. Contexto y Arquitectura General
La arquitectura del ecosistema e-commerce se apoya en un desacoplamiento estricto entre:
- **`carjos-marketplace-web` (Storefront Frontend):** Construido sobre Next.js y React 18, consumiendo de manera agn√≥stica la capa de datos.
- **`carjos-marketplace-core` (Core Backend):** Orquestado mediante AdonisJS 5, centralizando cat√°logos, metadatos y procesos log√≠sticos.

**Roles y Convenciones de Acceso:**
- El acceso est√° segmentado en roles principales (`CUSTOMER`, `STORE`, `ADMIN`).
- El manejo de sesiones y tokens se define por alcance: operaciones de tenant/comercio usan `iac_store`, mientras que operaciones administrativas globales usan `iac`.
- **Cabecera Transversal (`apiKey`):** Toda petici√≥n hacia el backend, sea p√∫blica o privada, requiere obligatoriamente el header `apiKey` asociado al tenant (`BigCustomer`) para el ruteo interno correcto de la informaci√≥n.

## 2. Diagn√≥stico del Incidente de Persistencia
- **Causa Ra√≠z:** Al enviar payloads de actualizaci√≥n a trav√©s del endpoint `PUT /product/:id`, se detect√≥ una p√©rdida de los campos cl√≠nicos din√°micos. El origen radicaba en la omisi√≥n o filtrado de campos no declarados en el validador estricto del modelo de AdonisJS, lo que causaba que la subestructura del JSON se descartara al persistir.
- **Resoluci√≥n Arquitect√≥nica:** Se acord√≥ la persistencia √≠ntegra del objeto JSON din√°mico dentro de la columna gen√©rica de la base de datos bajo la clave `metadata.farmacia`. Esto obliga al validador en AdonisJS a aceptar el subnodo din√°mico completo, delegando la estructura espec√≠fica al contrato de frontend.

## 3. Contrato de Datos Oficial (`metadata.farmacia`)
La validaci√≥n en Storefront depende de un contrato tipado riguroso definido en TypeScript:

```typescript
export interface FarmaciaMetadata {
  principioActivo: string;
  concentracion: string;
  presentacion: string;
  laboratorio: string;
  registroSanitario: string;
  condicionVenta: 'Venta Libre' | 'Bajo Receta' | 'Bajo R√©cipe';
  cadenaFrio?: boolean;
  requiereFrio?: boolean;
  lote?: string;
  fechaVencimiento?: string;
}
```

**Ejemplo JSON Representativo (SKU: FD001-001 - Cetirizina 10 mg Cetral Siegfried):**
```json
{
  "metadata": {
    "farmacia": {
      "principioActivo": "Cetirizina Diclorhidrato",
      "concentracion": "10 mg",
      "presentacion": "Caja x 10 Comprimidos Recubiertos",
      "laboratorio": "Siegfried",
      "registroSanitario": "E.F. 32.455/21",
      "condicionVenta": "Venta Libre",
      "cadenaFrio": false,
      "requiereFrio": false,
      "lote": "L-102938",
      "fechaVencimiento": "2028-05-31"
    }
  }
}
```

## 4. Implementaci√≥n UI/UX en Storefront (`MasterProductModal.tsx`)
El bloque de informaci√≥n cl√≠nica en `MasterProductModal.tsx` se dise√±√≥ bajo estrictos principios de neuroventa y confianza cl√≠nica:
- **Sobriedad Gr√°fica:** Prohibici√≥n absoluta de emojis. El apoyo visual depende de micro-SVGs minimalistas y monocrom√°ticos (`strokeWidth={1.5}`/`1.75`) en tonos sobrios (slate).
- **Jerarqu√≠a de Vadem√©cum:**
  - El Principio Activo y la Concentraci√≥n ocupan el foco de certeza principal.
  - El Registro Sanitario Oficial se resalta en tipograf√≠a t√©cnica (`font-mono`).
  - Badges condicionales identifican el grado de restricci√≥n (`Venta Libre` vs `Bajo Receta`).
  - Descargo sanitario legal presente como clausura visual.
- **Tolerancia a Fallos:** El sistema es robusto ante estructuras antiguas (eval√∫a tanto `cadenaFrio` como `requiereFrio` de manera retrocompatible) e inyecta fallbacks institucionales (ej. "No especificado", c√≥digo de producto) si hay valores nulos.

## 5. Runbook de Contingencia (Troubleshooting)
Si el modal de producto no despliega la informaci√≥n t√©cnica adecuadamente, el t√©cnico de guardia debe seguir esta ruta:
1. **Inspecci√≥n de Red (Navegador):** Abrir DevTools, monitorear la respuesta del cat√°logo API, y verificar si el payload del producto en particular incluye o no `metadata.farmacia`.
2. **Validaci√≥n en Base de Datos:** Acceder a PostgreSQL y verificar de forma directa la presencia y estructura de `metadata.farmacia` en el registro del producto.
3. **Purga de Cach√© (Next.js):** Si los datos existen pero no se reflejan, ejecutar un reinicio local forzado con `npx next dev -p 3001` limpiando el directorio `.next` para mitigar bloqueos de cach√©.
4. **Revisi√≥n de Backend:** Analizar validadores y sanitizadores en el controlador de productos de AdonisJS para detectar exclusiones silenciosas sobre el nodo `metadata`.

## 6. Historial de Modificaciones T√©cnicas
| Fecha | Archivos Intervenidos | Problema / Requerimiento Abordado | L√≥gica y Contratos Implementados | Verificaci√≥n |
|-------|------------------------|------------------------------------|-----------------------------------|--------------|
| 2026-09-23 | `MasterProductModal.tsx` | Refactorizaci√≥n de Tarjeta Cl√≠nica | Se implement√≥ el redise√±o sin emojis, soporte mixto `cadenaFrio`/`requiereFrio` y validaci√≥n de fallbacks | Compilaci√≥n Exitosa (cero errores) |
| 2026-09-23 | \MasterProductModal.tsx\ | Regla de Oro de Cero Scroll | ReestructuraciÛn de UI a layout 2 columnas, controles absolutos y compactaciÛn de paddings para eliminar overflow vertical | CompilaciÛn Exitosa |
| 2026-09-23 | \MasterProductModal.tsx\ | Encuadre y jerarquÌa visual de la imagen | Ajuste de altura a \h-48\, fondo sutil neutro y padding optimizado para destacar medicamentos | CompilaciÛn Exitosa |
| 2026-09-23 | \MasterProductModal.tsx\ | Badge de subcategorÌa e imagen | InyecciÛn del badge de subcategorÌa din·mica y reducciÛn de padding en imagen | CompilaciÛn Exitosa |
| 2026-09-23 | \MerchantStoreView.tsx\ | AcordeÛn Desplegable de Departamentos | Se implementÛ renderizado din·mico de subcategorÌas (estado \selectedSubcategory\) dentro de un acordeÛn lateral filtrando por \internalCategory\ | CompilaciÛn Exitosa |
| 2026-09-23 | \MasterProductModal.tsx\ | DescripciÛn terapÈutica y fallback taxonÛmico | RemociÛn estricta de truncamiento en descripciÛn (\line-clamp\) y forzado de resoluciÛn regex-like para el badge de subcategorÌa (\Antialergico\) | CompilaciÛn Exitosa |
| 2026-09-23 | \MasterProductModal.tsx\ | Refinamiento de JerarquÌa Tipogr·fica | AlineaciÛn de Principio Activo y ConcentraciÛn en una lÌnea; contraste equilibrado en Laboratorio/PresentaciÛn y estilizaciÛn monolÌtica (\ont-mono\) para el Registro Sanitario, sin romper el Cero Scroll | CompilaciÛn Exitosa |
| 2026-09-23 | \MasterProductModal.tsx\ | Ficha TÈcnica VademÈcum Ejecutivo | Reemplazo Ìntegro del JSX de la ficha farmacolÛgica para aplicar el snippet exacto proporcionado, solventando el problema de refresco del DOM | CompilaciÛn Exitosa |
| 2026-09-23 | \MasterProductModal.tsx\ | Escalado Imponente de Imagen | Ajuste de clases relativas (\h-48\, \overflow-hidden\) y escalas directas (\scale-110\) de imagen para llenar el viewport manteniendo estrictamente la regla de Cero Scroll | CompilaciÛn Exitosa |
| 2026-09-23 | \MasterProductModal.tsx\ | Suite de Neuroventa & EstabilizaciÛn | ResoluciÛn de error 500 limpiando cachÈ \.next\. InyecciÛn de los 4 gatillos: Inmediatez LogÌstica, Micro-Escasez (ping animado), Confianza ClÌnica (SVG) y rediseÒo de CTA Comprar Ahora. Todo renderizado bajo formato monocrom·tico sin emojis, respetando Cero Scroll | CompilaciÛn Exitosa |
| 2026-09-23 | \MasterProductModal.tsx\ | Refinamiento Visual UI/UX | MigraciÛn de cinta 'Entrega Express' a paleta Sky-blue tecnolÛgica y desacople de cabecera farmacolÛgica a lÌnea simple (\whitespace-nowrap\). Todo respetando lineamiento Cero Scroll | CompilaciÛn Exitosa |
| 2026-09-23 | \MasterProductModal.tsx\ | Escalado Real y TipografÌa Unificada | ReconfiguraciÛn de escala en imagen base a \scale-150\ y eliminaciÛn de paddings para dominancia visual. UnificaciÛn de los bloques de Principio Activo y ConcentraciÛn en una sola lÌnea textual. Cumplimiento estricto Cero Scroll. | CompilaciÛn Exitosa |
| 2026-09-23 | \MerchantStoreView.tsx\ / \MasterProductModal.tsx\ | Directiva Maestra de Neuroventa e-commerce | RediseÒo completo de Hero Banner Institucional, Buscador/Sidebar con anclaje \sticky\, nueva c·psula de carrito flotante en glassmorphism, y universalizaciÛn de taxonomÌas/tarjetas en el modal. | CompilaciÛn Exitosa |
| 2026-09-23 | \MerchantStoreView.tsx\ / \MasterProductModal.tsx\ | RestauraciÛn Visual y Cero Scroll | Despeje de Hero Banner, eliminaciÛn de botones duplicados, compactaciÛn extrema de opciones y eliminaciÛn de scroll vertical. | CompilaciÛn Exitosa |
| 2026-09-25 | `MasterProductModal.tsx` / `MerchantStoreView.tsx` / `combo/[id]/page.tsx` / `api/combo/[id]/route.ts` / `page.tsx` | Pedido entre panas: monitor en vivo, pase a caja, invitado bimonetario | Monitor del anfitrion con "Ranuras ocupadas X de Y", pastillas por ranura y detalle por participante (Listo/Eligiendo, sin/extras, USD+Bs). Al llenarse la sala el CTA "Proceder al Pago y Despacho (N/N)" agrega el combo y abre el carrito (proceedToCheckout) rumbo al checkout; mientras falten ranuras se ofrece re-compartir por WhatsApp (sin boton duplicado). Total del pie = suma real de participantes. Invitado: carrusel de adicionales reales del producto (PUT con addonsUsd, sumado a subtotalUsd), Bs. protagonista + USD + tasa BCV (antes nunca se cargaba la tasa), pantalla final con "Explorar el menu de la tienda" (enlace /?store=code que abre la tienda en el Home). Pedido colaborativo ya pagado abre el seguimiento en Estatus. productCode de la sala usa product.code real. | tsc exit 0, build exit 0, QA en navegador con sala simulada |
| 2026-09-25 | `MasterProductModal.tsx` / `api/combo/[id]/route.ts` | Personalizar mi (unidad) del anfitrion y retorno seguro a la sala | Bug A: el anfitrion no podia elegir ingredientes desde el Monitor en Vivo. Bug B: el boton final de la vista de ranuras siempre hacia setViewMode(options) y caia en la compra individual con "Agregar al carrito". Ahora slotReturnView admite options/host_setup/comboRoom; el boton "Guardar personalizacion y volver a la sala" vuelve a host_setup o, desde el monitor, hace PATCH /api/combo/[id] (participantId host) y regresa a comboRoom. buildHostClaim resume exclusiones/opciones/adicionales de las ranuras del anfitrion; createComboRoom ahora los envia (antes hostSelectedVariants={} y se perdian) y el POST suma hostAddonsUsd. slotReturnView se reinicia a options al entrar por las rutas individuales. Nuevo PATCH solo admite host, no cambia unidades reclamadas. | tsc exit 0, build exit 0, QA en navegador (setup->personalizar->setup->crear sala->monitor->personalizar->guardar->monitor) con API simulada |
| 2026-09-25 | `KitchenNote.tsx` (nuevo) / `MasterProductModal.tsx` / `MerchantStoreView.tsx` / `combo/[id]/page.tsx` / `api/combo/[id]/route.ts` | Notas de cocina compactas + fix de "$$" | Acordeon "Alguna sugerencia para la cocina (Opcional)" con input de 1 linea, tope 70 y contador, SOLO en 2 puntos: cada ranura del combo (anfitrion `slot.notes`, invitado un campo por reclamo) y el producto simple individual (no combos). Nada en Checkout/Delivery. Las notas viajan en participants[].notes (POST hostNotes / PUT / PATCH, saneadas a 80 car., max 12), se muestran en el Monitor ("Con todo - Nota: ...") y entran al breakdown como ">> NOTA:" (combo/sala) o "Nota:" (simple) para la Comanda POS; cartItemId incluye la nota para no fusionar items. Los parentesis se cambian por corchetes porque el Recibo detecta extras con el patron (+X). Corregido "(+$$2.50)" -> "(+$2.50)" en el chip de la ranura. IMPORTANTE: el contrato de Adonis (purchase/web) NO tiene campo de nota por item, asi que la nota NO se envia al backend; solo llega a la comanda local y al carrito. | tsc exit 0, build exit 0, QA en navegador (ranura, sala completa->carrito, invitado, simple con y sin variantes) |
| 2026-09-25 | `DOCUMENTO_TECNICO_OSWALDO.md` / `CheckoutModal.tsx` / `MasterProductModal.tsx` / `combo/[id]/page.tsx` | Contrato consolidado, `comments` por item y adicionales de sala estructurados | El contrato se reescribio en disco con la version consolidada (indicada por el equipo). CheckoutModal envia `comments` por item (solo si hay nota) tomado de `item.notes`; sala colaborativa (qty 1) envia `variants` (grupo real nombre/codigo/tipo de cada adicional con precio) + `pricing` {unitBasePrice, addonsTotal, unitFinalPrice} para que el recalculo de Adonis coincida; notas de sala/ranura se resumen en `comments` ("Anfitrion: ... | Ana: ..."). Con qty > 1 el item de sala sigue sin estructurar. | tsc exit 0, build exit 0, QA de carrito en navegador; el envio real a purchase/web NO se ejercito |
| 2026-09-25 | `MasterProductModal.tsx` | Faro guiado reactivo (Visual Beacon Flow) | Estado `activeBeacon` + refs y `scrollIntoView` suave (instantaneo con prefers-reduced-motion), pulso que se apaga solo (2 s hito 1, 2.5 s el resto). Hito 1: al abrir la vista de modos, ring naranja en "Personalizar aqui mismo" y "Compartir entre panas". Hito 2: en el setup de la sala, pulso en "Personalizar mi (unidad)" si el anfitrion aun no personalizo. Hito 3: si ya personalizo (o regresa de personalizar) el pulso verde pasa a "Crear Sala y Enviar a WhatsApp". Hito 4: al llenarse la sala, foco y pulso en "Proceder al Pago y Despacho". La tarjeta de unidad del anfitrion ahora dice "Personalizado" tambien con opciones SIN o nota. Los hooks van antes del return null. Sin dependencias nuevas. | tsc exit 0, build exit 0, QA en navegador de los 4 hitos y regresion del flujo circular |
| 2026-09-25 | `MasterProductModal.tsx` / `PedidoAmigosFloating.tsx` / `MerchantStoreView.tsx` / `MerchantTemplateEngine.tsx` / `combo/[id]/page.tsx` / `api/combo/[id]/route.ts` | Aislamiento del invitado, personalizacion por unidad, pie responsive y rescate de sala del anfitrion | (1) Monitor sin "Envia el link..." ni "Copiar Link"; en md+ el boton de WhatsApp es w-auto alineado a la derecha del pie. (2) La barra flotante global no se muestra en /combo/* (usePathname, hook antes de los returns). (3) Invitado: complementos reales del catalogo (la sala guarda storeId; mismo criterio del modal: papa/teque/bebida/refresco/extra..., sin stock 0, sin el propio producto, max 4; solo si el producto no trae adicionales con precio) y, con mas de 1 unidad, pestanas #1..#n con exclusiones por unidad + "Repetir en todos" (PUT unitExclusions; exclusions sigue siendo la union); con 1 unidad la vista no cambia. Monitor/desglose/resumen muestran una linea por unidad. (4) Rescate del anfitrion: al crear la sala se guarda active_combo_host {roomId, comboId, storeId} y duna_pedido_amigos_active (isHost, productId); la barra dice "Anfitrion - Pedido entre amigos activo" y Volver lleva a /?store=..&resumeRoom=..&resumeProduct=.. (nunca a /combo/id): MerchantStoreView abre el producto y MasterProductModal (resumeRoomId) recupera la sala y vuelve al Monitor en Vivo; sala inexistente limpia la sesion. Payload code 21, bimonetario y viewMode circular sin cambios. | tsc exit 0, build exit 0, QA en navegador (invitado, escritorio, cierre/refresco/Volver) y regresion del payload y del faro |
| 2026-09-25 | `combo/[id]/page.tsx` / `api/combo/[id]/route.ts` / `MasterProductModal.tsx` / `KitchenNote.tsx` | Vista del invitado como "Personalizar aqui" y correccion del 500 multiunidad | Causa del 500: `unitExclusions` (string[][]) es un arreglo anidado y Firestore lo rechaza; reproducido con la validacion real del SDK. Nuevo modelo participants[].units[] = {unitIndex, unitName, exclusions[], addons[], note} (solo mapas) + toFirestoreSafe en POST/PUT/PATCH; PUT deduce la cantidad de units, 409 sin cupo, 200 con la sala. Invitado: pestanas #1..#N con alias, chips Sin, carrusel de complementos por unidad, KitchenNote por unidad, Repetir en todos, boton "Confirmar mi selecci√≥n", un solo mensaje de error. Monitor/comanda/comments con el formato "Participante: #1 (Alias): Con todo | #2 (Otro): Sin salsa roja". | tsc exit 0, build exit 0, route.ts real contra la validacion real de Firestore (offline), QA en navegador y regresion |
