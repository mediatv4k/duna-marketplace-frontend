/**
 * ==============================================================================
 * BITÁCORA DE ACTUALIZACIÓN - MOTOR GPS ESTRICTO (FASE 1)
 * ==============================================================================
 * Fecha: Lunes, 07 de Septiembre de 2026
 * Archivo: src/lib/deliveryGps.ts
 * ==============================================================================
 */

import { getDistanceAndTime } from '@/lib/logisticsEngine';
import { getDeliveryRate } from '@/services/marketplaceService';

export async function calculateStrictGpsFare(store: any, customerCoords: { lat: number; lng: number }) {
  if (!customerCoords || !store.location) {
    return { success: false, message: "Se requiere la ubicación GPS exacta para calcular el flete." };
  }

  try {
    const storeCoords = typeof store.location === 'string' ? JSON.parse(store.location) : store.location;

    const matrix = await getDistanceAndTime(storeCoords, customerCoords);
    
    if (!matrix || matrix.distance === 0) {
      return { success: false, message: "No se pudo calcular la ruta GPS con precisión." };
    }

    const distanceKm = Number((matrix.distance / 1000).toFixed(1));
    const durationMin = Math.round(matrix.duration / 60);

    if (distanceKm > 12) {
      return { success: false, message: "Servicio de entrega no disponible a más de 12 km de distancia." };
    }

    const storeId = store.id || store.info?.id;
    if (!storeId) {
      return { success: false, message: "No se pudo identificar la tienda para cotizar el flete." };
    }

    const result = await getDeliveryRate({ storeId, lat: customerCoords.lat, lng: customerCoords.lng, distance: distanceKm, duration: durationMin });

    if (result.ok) {
      return { success: true, rate: result.rate, distanceKm, durationMin };
    }
    return { success: false, message: result.message };

  } catch (error: any) {
    console.error("Error al calcular tarifa GPS punto a punto:", error.message);
    return { success: false, message: "Error de conexión al calcular el flete." };
  }
}