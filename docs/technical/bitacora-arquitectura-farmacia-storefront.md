# BitÃ¡cora de Arquitectura y Manual de Contingencia: MÃ³dulo Farmacia y Persistencia de Metadatos

## 1. Contexto y Arquitectura General
La arquitectura del ecosistema e-commerce se apoya en un desacoplamiento estricto entre:
- **`carjos-marketplace-web` (Storefront Frontend):** Construido sobre Next.js y React 18, consumiendo de manera agnÃ³stica la capa de datos.
- **`carjos-marketplace-core` (Core Backend):** Orquestado mediante AdonisJS 5, centralizando catÃ¡logos, metadatos y procesos logÃ­sticos.

**Roles y Convenciones de Acceso:**
- El acceso estÃ¡ segmentado en roles principales (`CUSTOMER`, `STORE`, `ADMIN`).
- El manejo de sesiones y tokens se define por alcance: operaciones de tenant/comercio usan `iac_store`, mientras que operaciones administrativas globales usan `iac`.
- **Cabecera Transversal (`apiKey`):** Toda peticiÃ³n hacia el backend, sea pÃºblica o privada, requiere obligatoriamente el header `apiKey` asociado al tenant (`BigCustomer`) para el ruteo interno correcto de la informaciÃ³n.

## 2. DiagnÃ³stico del Incidente de Persistencia
- **Causa RaÃ­z:** Al enviar payloads de actualizaciÃ³n a travÃ©s del endpoint `PUT /product/:id`, se detectÃ³ una pÃ©rdida de los campos clÃ­nicos dinÃ¡micos. El origen radicaba en la omisiÃ³n o filtrado de campos no declarados en el validador estricto del modelo de AdonisJS, lo que causaba que la subestructura del JSON se descartara al persistir.
- **ResoluciÃ³n ArquitectÃ³nica:** Se acordÃ³ la persistencia Ã­ntegra del objeto JSON dinÃ¡mico dentro de la columna genÃ©rica de la base de datos bajo la clave `metadata.farmacia`. Esto obliga al validador en AdonisJS a aceptar el subnodo dinÃ¡mico completo, delegando la estructura especÃ­fica al contrato de frontend.

## 3. Contrato de Datos Oficial (`metadata.farmacia`)
La validaciÃ³n en Storefront depende de un contrato tipado riguroso definido en TypeScript:

```typescript
export interface FarmaciaMetadata {
  principioActivo: string;
  concentracion: string;
  presentacion: string;
  laboratorio: string;
  registroSanitario: string;
  condicionVenta: 'Venta Libre' | 'Bajo Receta' | 'Bajo RÃ©cipe';
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

## 4. ImplementaciÃ³n UI/UX en Storefront (`MasterProductModal.tsx`)
El bloque de informaciÃ³n clÃ­nica en `MasterProductModal.tsx` se diseÃ±Ã³ bajo estrictos principios de neuroventa y confianza clÃ­nica:
- **Sobriedad GrÃ¡fica:** ProhibiciÃ³n absoluta de emojis. El apoyo visual depende de micro-SVGs minimalistas y monocromÃ¡ticos (`strokeWidth={1.5}`/`1.75`) en tonos sobrios (slate).
- **JerarquÃ­a de VademÃ©cum:**
  - El Principio Activo y la ConcentraciÃ³n ocupan el foco de certeza principal.
  - El Registro Sanitario Oficial se resalta en tipografÃ­a tÃ©cnica (`font-mono`).
  - Badges condicionales identifican el grado de restricciÃ³n (`Venta Libre` vs `Bajo Receta`).
  - Descargo sanitario legal presente como clausura visual.
- **Tolerancia a Fallos:** El sistema es robusto ante estructuras antiguas (evalÃºa tanto `cadenaFrio` como `requiereFrio` de manera retrocompatible) e inyecta fallbacks institucionales (ej. "No especificado", cÃ³digo de producto) si hay valores nulos.

## 5. Runbook de Contingencia (Troubleshooting)
Si el modal de producto no despliega la informaciÃ³n tÃ©cnica adecuadamente, el tÃ©cnico de guardia debe seguir esta ruta:
1. **InspecciÃ³n de Red (Navegador):** Abrir DevTools, monitorear la respuesta del catÃ¡logo API, y verificar si el payload del producto en particular incluye o no `metadata.farmacia`.
2. **ValidaciÃ³n en Base de Datos:** Acceder a PostgreSQL y verificar de forma directa la presencia y estructura de `metadata.farmacia` en el registro del producto.
3. **Purga de CachÃ© (Next.js):** Si los datos existen pero no se reflejan, ejecutar un reinicio local forzado con `npx next dev -p 3001` limpiando el directorio `.next` para mitigar bloqueos de cachÃ©.
4. **RevisiÃ³n de Backend:** Analizar validadores y sanitizadores en el controlador de productos de AdonisJS para detectar exclusiones silenciosas sobre el nodo `metadata`.

## 6. Historial de Modificaciones TÃ©cnicas
| Fecha | Archivos Intervenidos | Problema / Requerimiento Abordado | LÃ³gica y Contratos Implementados | VerificaciÃ³n |
|-------|------------------------|------------------------------------|-----------------------------------|--------------|
| 2026-09-23 | `MasterProductModal.tsx` | RefactorizaciÃ³n de Tarjeta ClÃ­nica | Se implementÃ³ el rediseÃ±o sin emojis, soporte mixto `cadenaFrio`/`requiereFrio` y validaciÃ³n de fallbacks | CompilaciÃ³n Exitosa (cero errores) |
| 2026-09-23 | \MasterProductModal.tsx\ | Regla de Oro de Cero Scroll | Reestructuración de UI a layout 2 columnas, controles absolutos y compactación de paddings para eliminar overflow vertical | Compilación Exitosa |
| 2026-09-23 | \MasterProductModal.tsx\ | Encuadre y jerarquía visual de la imagen | Ajuste de altura a \h-48\, fondo sutil neutro y padding optimizado para destacar medicamentos | Compilación Exitosa |
| 2026-09-23 | \MasterProductModal.tsx\ | Badge de subcategoría e imagen | Inyección del badge de subcategoría dinámica y reducción de padding en imagen | Compilación Exitosa |
| 2026-09-23 | \MerchantStoreView.tsx\ | Acordeón Desplegable de Departamentos | Se implementó renderizado dinámico de subcategorías (estado \selectedSubcategory\) dentro de un acordeón lateral filtrando por \internalCategory\ | Compilación Exitosa |
| 2026-09-23 | \MasterProductModal.tsx\ | Descripción terapéutica y fallback taxonómico | Remoción estricta de truncamiento en descripción (\line-clamp\) y forzado de resolución regex-like para el badge de subcategoría (\Antialergico\) | Compilación Exitosa |
| 2026-09-23 | \MasterProductModal.tsx\ | Refinamiento de Jerarquía Tipográfica | Alineación de Principio Activo y Concentración en una línea; contraste equilibrado en Laboratorio/Presentación y estilización monolítica (\ont-mono\) para el Registro Sanitario, sin romper el Cero Scroll | Compilación Exitosa |
| 2026-09-23 | \MasterProductModal.tsx\ | Ficha Técnica Vademécum Ejecutivo | Reemplazo íntegro del JSX de la ficha farmacológica para aplicar el snippet exacto proporcionado, solventando el problema de refresco del DOM | Compilación Exitosa |
| 2026-09-23 | \MasterProductModal.tsx\ | Escalado Imponente de Imagen | Ajuste de clases relativas (\h-48\, \overflow-hidden\) y escalas directas (\scale-110\) de imagen para llenar el viewport manteniendo estrictamente la regla de Cero Scroll | Compilación Exitosa |
| 2026-09-23 | \MasterProductModal.tsx\ | Suite de Neuroventa & Estabilización | Resolución de error 500 limpiando caché \.next\. Inyección de los 4 gatillos: Inmediatez Logística, Micro-Escasez (ping animado), Confianza Clínica (SVG) y rediseño de CTA Comprar Ahora. Todo renderizado bajo formato monocromático sin emojis, respetando Cero Scroll | Compilación Exitosa |
| 2026-09-23 | \MasterProductModal.tsx\ | Refinamiento Visual UI/UX | Migración de cinta 'Entrega Express' a paleta Sky-blue tecnológica y desacople de cabecera farmacológica a línea simple (\whitespace-nowrap\). Todo respetando lineamiento Cero Scroll | Compilación Exitosa |
| 2026-09-23 | \MasterProductModal.tsx\ | Escalado Real y Tipografía Unificada | Reconfiguración de escala en imagen base a \scale-150\ y eliminación de paddings para dominancia visual. Unificación de los bloques de Principio Activo y Concentración en una sola línea textual. Cumplimiento estricto Cero Scroll. | Compilación Exitosa |
| 2026-09-23 | \MerchantStoreView.tsx\ / \MasterProductModal.tsx\ | Directiva Maestra de Neuroventa e-commerce | Rediseño completo de Hero Banner Institucional, Buscador/Sidebar con anclaje \sticky\, nueva cápsula de carrito flotante en glassmorphism, y universalización de taxonomías/tarjetas en el modal. | Compilación Exitosa |
| 2026-09-23 | \MerchantStoreView.tsx\ / \MasterProductModal.tsx\ | Restauración Visual y Cero Scroll | Despeje de Hero Banner, eliminación de botones duplicados, compactación extrema de opciones y eliminación de scroll vertical. | Compilación Exitosa |
| 2026-09-25 | `MasterProductModal.tsx` / `MerchantStoreView.tsx` / `combo/[id]/page.tsx` / `api/combo/[id]/route.ts` / `page.tsx` | Pedido entre panas: monitor en vivo, pase a caja, invitado bimonetario | Monitor del anfitrion con "Ranuras ocupadas X de Y", pastillas por ranura y detalle por participante (Listo/Eligiendo, sin/extras, USD+Bs). Al llenarse la sala el CTA "Proceder al Pago y Despacho (N/N)" agrega el combo y abre el carrito (proceedToCheckout) rumbo al checkout; mientras falten ranuras se ofrece re-compartir por WhatsApp (sin boton duplicado). Total del pie = suma real de participantes. Invitado: carrusel de adicionales reales del producto (PUT con addonsUsd, sumado a subtotalUsd), Bs. protagonista + USD + tasa BCV (antes nunca se cargaba la tasa), pantalla final con "Explorar el menu de la tienda" (enlace /?store=code que abre la tienda en el Home). Pedido colaborativo ya pagado abre el seguimiento en Estatus. productCode de la sala usa product.code real. | tsc exit 0, build exit 0, QA en navegador con sala simulada |
| 2026-09-25 | `MasterProductModal.tsx` / `api/combo/[id]/route.ts` | Personalizar mi (unidad) del anfitrion y retorno seguro a la sala | Bug A: el anfitrion no podia elegir ingredientes desde el Monitor en Vivo. Bug B: el boton final de la vista de ranuras siempre hacia setViewMode(options) y caia en la compra individual con "Agregar al carrito". Ahora slotReturnView admite options/host_setup/comboRoom; el boton "Guardar personalizacion y volver a la sala" vuelve a host_setup o, desde el monitor, hace PATCH /api/combo/[id] (participantId host) y regresa a comboRoom. buildHostClaim resume exclusiones/opciones/adicionales de las ranuras del anfitrion; createComboRoom ahora los envia (antes hostSelectedVariants={} y se perdian) y el POST suma hostAddonsUsd. slotReturnView se reinicia a options al entrar por las rutas individuales. Nuevo PATCH solo admite host, no cambia unidades reclamadas. | tsc exit 0, build exit 0, QA en navegador (setup->personalizar->setup->crear sala->monitor->personalizar->guardar->monitor) con API simulada |
