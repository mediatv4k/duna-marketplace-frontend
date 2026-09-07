/**
 * ==============================================================================
 * MOTOR LOGÍSTICO Y CÁLCULO DE FLOTA D'UNA
 * ==============================================================================
 */

export type TipoVehiculo = 'moto' | 'auto' | 'camioneta' | 'camion_350' | 'gandola';

export interface VehicleConfig {
  id: TipoVehiculo;
  nombre: string;
  icono: string;
  capacidadPesoKg: number;
  capacidadVolumenCm3: number;
  dimensionMaximaCm: number;
  tarifaBaseUSD: number;
  tarifaPorKmUSD: number;
  descripcion: string;
}

export const FLEET_TIERS: Record<TipoVehiculo, VehicleConfig> = {
  moto: { id: 'moto', nombre: "Moto Express D'una", icono: '🛵', capacidadPesoKg: 15, capacidadVolumenCm3: 91125, dimensionMaximaCm: 45, tarifaBaseUSD: 1.00, tarifaPorKmUSD: 0.50, descripcion: 'Mochila térmica express para pedidos regulares.' },
  auto: { id: 'auto', nombre: 'Vehículo Sedán / Baúl', icono: '🚗', capacidadPesoKg: 80, capacidadVolumenCm3: 350000, dimensionMaximaCm: 90, tarifaBaseUSD: 2.50, tarifaPorKmUSD: 0.80, descripcion: 'Combos al mayor, pedidos medianos y cajas de víveres.' },
  camioneta: { id: 'camioneta', nombre: 'Pick-Up / Camioneta', icono: '🛻', capacidadPesoKg: 750, capacidadVolumenCm3: 1800000, dimensionMaximaCm: 200, tarifaBaseUSD: 7.00, tarifaPorKmUSD: 1.50, descripcion: 'Electrodomésticos, TV grande, congeladores y muebles.' },
  camion_350: { id: 'camion_350', nombre: 'Camión 350 (Carga Mediana)', icono: '🚚', capacidadPesoKg: 3500, capacidadVolumenCm3: 12000000, dimensionMaximaCm: 350, tarifaBaseUSD: 25.00, tarifaPorKmUSD: 2.50, descripcion: 'Paletas comerciales, bultos industriales y ferretería.' },
  gandola: { id: 'gandola', nombre: 'Gandola / Carga Pesada', icono: '🚛', capacidadPesoKg: 30000, capacidadVolumenCm3: 70000000, dimensionMaximaCm: 1200, tarifaBaseUSD: 120.00, tarifaPorKmUSD: 4.00, descripcion: 'Carga pesada a granel (bloques, cemento, arena, vigas).' },
};

export interface PhysicalItem {
  nombre: string;
  precio: number;
  cantidad: number;
  pesoKg?: number;
  largoCm?: number;
  anchoCm?: number;
  altoCm?: number;
}

export interface LogisticsResult {
  vehiculoAsignado: VehicleConfig;
  pesoTotalKg: number;
  volumenTotalCm3: number;
  pesoVolumetricoKg: number;
  pesoFacturableKg: number;
  costoEnvioUSD: number;
  motivoAsignacion: string;
}

export function calculateLogistics(items: PhysicalItem[], distanciaKm: number = 0.6): LogisticsResult {
  let pesoTotalKg = 0;
  let volumenTotalCm3 = 0;
  let dimensionMaximaEncontrada = 0;

  items.forEach((item) => {
    const qty = item.cantidad || 1;
    const pesoUnitario = item.pesoKg || 0.25;
    const largo = item.largoCm || 15;
    const ancho = item.anchoCm || 10;
    const alto = item.altoCm || 5;

    pesoTotalKg += pesoUnitario * qty;
    volumenTotalCm3 += largo * ancho * alto * qty;

    const maxLado = Math.max(largo, ancho, alto);
    if (maxLado > dimensionMaximaEncontrada) { dimensionMaximaEncontrada = maxLado; }
  });

  const pesoVolumetricoKg = Number((volumenTotalCm3 / 5000).toFixed(2));
  const pesoFacturableKg = Math.max(pesoTotalKg, pesoVolumetricoKg);

  const ordenVehiculos: TipoVehiculo[] = ['moto', 'auto', 'camioneta', 'camion_350', 'gandola'];
  let vehiculoSeleccionado = FLEET_TIERS.moto;
  let motivo = "La carga cabe en la mochila térmica express.";

  for (const tipo of ordenVehiculos) {
    const v = FLEET_TIERS[tipo];
    const excedePeso = pesoTotalKg > v.capacidadPesoKg;
    const excedeVolumen = volumenTotalCm3 > v.capacidadVolumenCm3;
    const excedeLargo = dimensionMaximaEncontrada > v.dimensionMaximaCm;

    if (!excedePeso && !excedeVolumen && !excedeLargo) {
      vehiculoSeleccionado = v;
      if (tipo === 'auto') motivo = "Carga voluminosa: asignado a vehículo con maletero.";
      if (tipo === 'camioneta') motivo = "Supera autos: asignado a camioneta Pick-Up.";
      if (tipo === 'camion_350') motivo = "Gran tonelaje: asignado a camión 350.";
      if (tipo === 'gandola') motivo = "Carga pesada industrial: asignado a gandola.";
      break;
    }
    vehiculoSeleccionado = v;
  }

  const costoTotal = vehiculoSeleccionado.tarifaBaseUSD + (distanciaKm * vehiculoSeleccionado.tarifaPorKmUSD);
  return { vehiculoAsignado: vehiculoSeleccionado, pesoTotalKg: Number(pesoTotalKg.toFixed(2)), volumenTotalCm3, pesoVolumetricoKg, pesoFacturableKg: Number(pesoFacturableKg.toFixed(2)), costoEnvioUSD: Number(costoTotal.toFixed(2)), motivoAsignacion: motivo };
}

/**
 * Función requerida por deliveryGps.ts para calcular distancia y tiempo por coordenadas
 */
export async function getDistanceAndTime(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<{ distance: number; duration: number }> {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = (destination.lat - origin.lat) * (Math.PI / 180);
  const dLon = (destination.lng - origin.lng) * (Math.PI / 180);
  const lat1 = origin.lat * (Math.PI / 180);
  const lat2 = destination.lat * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // en metros
  const duration = (distance / 1000 / 30) * 3600; // Duración estimada a 30 km/h en segundos

  return {
    distance: Math.round(distance),
    duration: Math.round(duration),
  };
}