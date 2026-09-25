# CONTRATO TÉCNICO OFICIAL FRONTEND — BACKEND (ADONISJS 5)
> **Repositorio Frontend:** carjos-marketplace-web (Next.js)
> **Repositorio Backend:** carjos-marketplace-core (AdonisJS 5)
> **Base URL (DEV):** [https://dev.carjos-marketplace.cloud](https://dev.carjos-marketplace.cloud)
> **API Key (DEV):** bf8f1b64-6342-48c5-af05-501e4c15a6cb

---

## 1. CONVENCIÓN GENERAL DE RESPUESTAS Y CÓDIGOS DE NEGOCIO
- HTTP 200/201 con code: 1 -> Éxito.
- HTTP 200 con code: 15 -> Error de validación de negocio (comercio cerrado, stock insuficiente, sin jornada).
- HTTP 200 con code: 21 -> Inconsistencia de montos o cupón no aplicable (rollback automático).

---

## 2. CHECKOUT Y COMPRA WEB (CUSTOMER)
Endpoint: POST /delivery/request/purchase/web (multipart/form-data)
Headers: apiKey, timeZone: America/Caracas
FormData:
- orderData: JSON string
- paymentFile: archivo binario opcional

### Estructura de orderData.data[] (Por ítem):
{
  "id": 101,
  "code": "P010",
  "name": "Producto",
  "image": "https://...",
  "comments": "Sugerencias de cocina (poca salsa, sin cebolla, etc.)",
  "cant": 1,
  "pricing": {
    "unitBasePrice": 10.00,
    "addonsTotal": 2.50,
    "unitFinalPrice": 12.50
  },
  "totalPrice": 12.50,
  "variants": [
    {
      "name": "Adicionales",
      "code": "ADDONS",
      "type": "MULTIPLE",
      "items": [
        { "code": "PAPAS", "title": "Papas Fritas", "quantity": 1, "unitPrice": 2.50, "totalPrice": 2.50 }
      ]
    }
  ],
  "promo": null
}

### Reglas de Revalidación (Blindaje code: 21):
- El backend recalcula el total de la orden en base de datos.
- totalPaidDefaultAmount debe coincidir exactamente con la suma de precios base + pricing.addonsTotal + fees.
- Las notas de cocina por ítem viajan exclusivamente en la propiedad `comments`.

---

## 3. LOGÍSTICA Y TARIFAS DE ENVÍO
- Endpoint: GET /delivery/request/purchase/deliveryRate?storeId=&lat=&lng=&distance=&duration=
- Regla: El monto de entrega (serviceAmount) depende únicamente de distancia, duración y zonas. El peso y volumen no alteran la tarifa pagada por el cliente.

---

## 4. PORTAL DE COMERCIO (STORE)
- Token de sesión en localStorage: "iac_store"
- Endpoints protegidos con Authorization: Bearer <iac_store> y apiKey:
  - GET /store/:storeId/products/all
  - POST /product y PUT /product/:id
  - POST /store/:storeId/products/batch/v2 (Carga masiva Excel)
  - GET /store/:storeId/products/download/v2 (Exportar Excel)
