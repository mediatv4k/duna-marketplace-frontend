# DOCUMENTO TÉCNICO OFICIAL FRONTEND — BACKEND (ADONISJS 5)
> **Autor:** Equipo Core / Osvaldo
> **Repositorio Frontend:** carjos-marketplace-web (Next.js)
> **Repositorio Backend:** carjos-marketplace-core (AdonisJS 5)

---

## §1. Datos de conexión y API Key oficial
- **Base URL (DEV):** `https://dev.carjos-marketplace.cloud`
- **API Key Oficial (DEV):** `bf8f1b64-6342-48c5-af05-501e4c15a6cb`
Todas las peticiones públicas (sin sesión) deben enviar esta API Key en el header `apiKey`. Adicionalmente, se recomienda enviar `timeZone: America/Caracas` para garantizar la correcta sincronización temporal de apertura/cierre de los comercios.

---

## §2. Convención de respuestas y envoltorios
El backend AdonisJS responde siempre con HTTP `200 OK` (salvo errores fatales de red 500 o no autorizado 401). El resultado de la operación se determina inspeccionando la propiedad `code` en el cuerpo del JSON:
- **HTTP 200 con `code: 1`** -> Éxito. La operación procesó correctamente.
- **HTTP 200 con `code: 15`** -> Error de negocio estándar (ej. comercio cerrado, falta de stock).
- **HTTP 200 con `code: 21`** -> Inconsistencia crítica detectada (ej. manipulación de precios en el payload, cupones inválidos). Provoca un rollback automático en la base de datos de Adonis.

---

## §3. Mapa del recorrido de compra
1. **Home / Categorías:** El cliente ingresa a `duna-marketplace-frontend.vercel.app`, explora por categorías o geolocalización.
2. **Página de Comercio (`MerchantStoreView`):** Carga los productos por sección. Se valida si el comercio está `isOpen`.
3. **Página de Producto (`MasterProductModal`):** Selección de cantidades y personalización (variantes, adicionales, combos grupales).
4. **Carrito y Checkout (`CheckoutModal`):** Validación matemática de la orden. Ingreso de datos del cliente, método de pago e intercepción logística.
5. **Confirmación:** Carga del boucher de pago y posteo hacia AdonisJS.
6. **Post-compra (`OrderTimelinePanel`):** Seguimiento en vivo.

---

## §4. Home y categorías
El Home invoca las listas de comercios. Se pueden filtrar por zonas y nichos (Restaurantes, Bodegones, Farmacias).
- Se utiliza caché de cliente (`localStorage` o estados globales) para guardar la ubicación (coordenadas GPS) y calcular la distancia con respecto a los comercios.

---

## §5. Página del comercio y horarios
- Se verifica constantemente la propiedad `isOpen` y los `scheduleInfo` del comercio.
- Si el comercio está cerrado, se bloquea la adición al carrito o el avance en el checkout.
- Cada tienda expone sus métodos de pago activos (`paymentMethods`). Si un comercio no tiene métodos configurados, el Checkout deshabilita el botón de confirmar.

---

## §6. Página de producto y variantes
Se gestiona a través de `MasterProductModal` (y `VariantModal`).
- Soporta dos modos: **Transaccional (Simple)** y **Slot/Combo (Grupal)**.
- Se calculan límites `minRequired` y `maxAllowed` por cada grupo de opciones (modifiers/addons).
- Opción social "Compra entre panas" (Combos): Genera un enlace a `/combo/[id]` para distribuir selecciones en dispositivos separados. El enlace se comparte vía `api.whatsapp.com/send`.

---

## §7. Checkout
El `CheckoutModal` agrupa todos los elementos del carrito y prepara el payload final.

### §7.1.1 Fees y Logística
- `deliveryMode`: Puede ser `delivery` (despacho a domicilio), `pickup` (retiro en tienda), o `national`.
- Tarifa Logística calculada vía `GET /delivery/request/purchase/deliveryRate` enviando lat, lng, storeId.

### §7.3.1 Cupones de fidelidad
- Se valida si el comercio posee cupones aplicables. Un cupón mal formateado disparará `code: 21`.

### §7.5 Fórmulas matemáticas
La estructura de precios debe ser perfecta para evitar el `code: 21` de Adonis:
- `unitBasePrice`: Precio base unitario.
- `addonsTotal`: Sumatoria estricta de todos los precios de addons elegidos * sus cantidades.
- `unitFinalPrice`: `unitBasePrice + addonsTotal`
- `totalPrice` por ítem de carrito: `unitFinalPrice * cantidad`
- `totalPaidDefaultAmount`: La suma absoluta de todos los `totalPrice` de los ítems en el carrito, más el delivery y/o restando descuentos.

---

## §8. Confirmación de compra (`storeWeb`)
Endpoint: `POST /delivery/request/purchase/web`

### §8.1 Payload Multipart
El request es obligatoriamente `multipart/form-data`:
- **`orderData`**: String JSON que contiene el `osvaldoPayload` validado (incluyendo nombre, ubicación, carrito, detalles de pago).
- **`paymentFile`**: Blob o archivo binario del comprobante de pago (zelle, transferencia o pago móvil).

### §8.3 Validaciones Previas (Frontend)
- `orderSummary.location` debe poseer `lat` y `lng` finitos (incluso si es pickup, el frontend puede arrastrar el valor por defecto).
- Si no hay métodos de pago o la tienda está cerrada, el botón permanece `disabled`.

---

## §9. Post-compra y timeline público
El usuario es redirigido a `/order/[orderId]/timeline`.
- Efectúa polling a `GET /delivery/request/{id}/public`.
- Fases procesadas vía `orderTracking.ts`: `driver_assigned`, `inicia`, `aceptado`, `listo`, `recogido`, `entregando`, finalizando en `DELIVERED` o `CANCELLED`.

---

## §10. Códigos de error de negocio
Explicación ampliada de retornos del backend:
- **`code: 1`**: La orden se insertó en MySQL, se le asignó un `order_number` y se emitió el evento por Socket.io.
- **`code: 15`**: Error leve: comercio no labora en este horario, faltan datos de la tienda, número de contacto inválido, o el ítem ya no se encuentra en la BD del merchant.
- **`code: 21`**: Inconsistencia matemática. Ocurre si la suma de `addons` enviada desde el front no concuerda con los registros del core, o si `totalPaidDefaultAmount` fue adulterado.

---

## §11. Tabla resumen de endpoints y funciones front
| Propósito | Verbo y Endpoint | Función Front/Componente |
| :--- | :--- | :--- |
| Calcular Envío | `GET /delivery/request/purchase/deliveryRate` | `services/marketplaceService.ts` -> `getDeliveryQuote` |
| Emitir Orden | `POST /delivery/request/purchase/web` | `CheckoutModal.tsx` -> `submitPurchaseOrder` |
| Tracking | `GET /delivery/request/{id}/public` | `OrderTimelinePanel.tsx` |
| WhatsApp Fallback| `https://wa.me/{phone}?text=...` | `orderTracking.ts` -> `toWhatsAppNumber` |

---

## §12. Inconsistencias detectadas y cURL oficial
**Hallazgos QA recientes:**
- **Inconsistencia de GPS en Pickup:** `CheckoutModal.tsx` exige coordenadas en el location incluso si `deliveryMode === 'pickup'`, causando rechazo de validación frontend si el usuario no autorizó ubicación. (Recomendado hacer bypass).

**cURL Oficial de Prueba Web:**
```bash
curl -X POST "https://dev.carjos-marketplace.cloud/delivery/request/purchase/web" \
  -H "apiKey: bf8f1b64-6342-48c5-af05-501e4c15a6cb" \
  -F 'orderData={"storeId": 10, "customerName": "Test", "totalPaidDefaultAmount": 12.50, "items": [{"id": 101, "cant": 1, "pricing": {"unitBasePrice": 10.00, "addonsTotal": 2.50, "unitFinalPrice": 12.50}}]}' \
  -F "paymentFile=@boucher.jpg"
```
