# DOCUMENTO TÉCNICO OSWALDO

## Especificaciones del Backend de AdonisJS para el Marketplace

### Información General
Este documento técnico define las especificaciones exactas para las llamadas al backend de AdonisJS que implementa el marketplace. El backend está desplegado en `https://dev.carjos-marketplace.cloud` y sigue un enfoque de API REST con validación estricta de payloads y manejo específico de errores de negocio.

### Configuración Base

#### URL Base del API
```
https://dev.carjos-marketplace.cloud
```

#### Headers Globales (Obligatorios)
Todas las solicitudes al API deben incluir los siguientes headers exactos (SIN prefijo X-):

```
apiKey: bf8f1b64-6342-48c5-af05-501e4c15a6cb
timeZone: America/Caracas
```

### Endpoint Principal: Solicitud de Compra

#### Endpoint
```
POST /delivery/request/purchase/web
```

#### Tipo de Request
**multipart/form-data** - Requiere tanto `orderData` (JSON string) como opcionalmente `paymentFile` (comprobante de pago)

#### Headers del Request
```
apiKey: bf8f1b64-6342-48c5-af05-501e4c15a6cb
timeZone: America/Caracas
```

#### Body del Request (multipart/form-data)

**Campo 1: `orderData`**
- **Tipo**: JSON string
- **Descripción**: Payload principal que contiene toda la información del pedido

**Campo 2: `paymentFile` (Opcional)**
- **Tipo**: Archivo (image/png, image/jpeg, application/pdf)
- **Descripción**: Comprobante de pago para validación

### Estructura de Payload `orderData`

```json
{
  "id": null,
  "data": [
    {
      "id": 101,
      "code": "P001",
      "name": "Producto Test",
      "image": "",
      "cant": 1,
      "pricing": {
        "unitBasePrice": 10.0,
        "addonsTotal": 0,
        "unitFinalPrice": 10.0
      },
      "totalPrice": 10.0,
      "variants": [],
      "promo": null
    }
  ],
  "service": "DELIVERY",
  "location": {
    "lat": 10.3910,
    "lng": -71.4423
  },
  "duration": "15",
  "distance": "1.0",
  "durationText": "15 mins",
  "distanceText": "1.0 km",
  "serviceAmount": "15.00",
  "address": "Cabimas, Zulia",
  "phone": "+584121234567",
  "customerName": "Juan Pérez",
  "customerDocument": "V-12345678",
  "ftoken": "",
  "paymentRef": "REF123456",
  "totalPaidReferenceAmount": "150.00",
  "totalPaidDefaultAmount": "12.50",
  "totalWithoutDiscount": "15.00",
  "paymentMethod": {
    "code": "PAGO",
    "value": "Banco"
  },
  "tip": "0.50",
  "store": {
    "id": 1,
    "phone": "+584121111111"
  },
  "foodStoreId": "1",
  "couponId": null,
  "couponCode": null,
  "discountAmount": "0"
}
```

### Códigos de Error de Negocio

#### Error Code 1
- **Significado**: Éxito - Pedido creado exitosamente

#### Error Code 15
- **Significado**: Error de validación - Problema con stock, comercio cerrado o datos inválidos

#### Error Code 21
- **Significado**: Error de inconsistencia - Desajuste en los montos calculados
- **Causas**: Inconsistencia entre `totalPaidDefaultAmount` (USD) y `totalPaidReferenceAmount` (Bs), error en cálculo de cupón o descuento, desajuste entre subtotal + envío + propina vs total.

### Referencia cURL (Ejemplo de Oswaldo)

```bash
curl -X POST https://dev.carjos-marketplace.cloud/delivery/request/purchase/web \
  -H "apiKey: bf8f1b64-6342-48c5-af05-501e4c15a6cb" \
  -H "timeZone: America/Caracas" \
  -F "orderData={...}" \
  -F "paymentFile=@/path/to/comprobante.jpg"
```

### Observaciones Importantes

#### Validación de Montos (Error Code 21)

Para evitar **Error Code 21**, asegúrese que:

1. **`totalPaidDefaultAmount`** = subtotalNeto + costoEnvio + propina (en USD)
2. **`totalPaidReferenceAmount`** = totalFinalUSD * tasaBCV (en Bs)
3. **`paymentMethod`**: `{ code: string, value: string }`

### Resumen

- **URL**: `https://dev.carjos-marketplace.cloud/delivery/request/purchase/web`
- **Method**: POST
- **Headers Requeridos**: `apiKey`, `timeZone` (NO usar X-API-Key)
- **Campos**: `orderData` (obligatorio JSON string), `paymentFile` (opcional file)
- **Error Codes**: 1 (éxito), 15 (validación/comercio cerrado), 21 (inconsistencia de montos)
- **Key**: `bf8f1b64-6342-48c5-af05-501e4c15a6cb`
- **Timezone**: `America/Caracas`