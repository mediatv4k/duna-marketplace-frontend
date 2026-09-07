/**
 * ==============================================================================
 * BITÁCORA DE ACTUALIZACIÓN - MOTOR GPS ESTRICTO (FASE 1)
 * ==============================================================================
 * Fecha: Lunes, 07 de Septiembre de 2026
 * Hora Local: 12:40 AM (Cabimas, Estado Zulia, Venezuela)
 * Archivo: src/lib/deliveryGps.ts
 * ==============================================================================
 */

// Usamos el motor logístico existente en la misma carpeta lib
import { getDistanceAndTime } from '@/lib/logisticsEngine';

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

    const apiKey = process.env.NEXT_PUBLIC_SERVER_API_KEY || 'bf8f1b64-6342-48c5-af05-501e4c15a6cb';
    
    const response = await fetch(
      https://dev.carjos-marketplace.cloud/delivery/request/purchase/deliveryRate?storeId=\&lat=\&lng=\&distance=\&duration=\,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apiKey': apiKey
        }
      }
    );

    const result = await response.json();

    if (result.code === 1 && result.data && result.data.rate !== undefined) {
      return {
        success: true,
        rate: result.data.rate,
        distanceKm,
        durationMin
      };
    } else {
      return {
        success: false,
        message: result.data?.message || "Servicio de entrega no disponible para esta ubicación."
      };
    }

  } catch (error: any) {
    console.error("Error al calcular tarifa GPS punto a punto:", error.message);
    return { success: false, message: "Error de conexión al calcular el flete." };
  }
}
