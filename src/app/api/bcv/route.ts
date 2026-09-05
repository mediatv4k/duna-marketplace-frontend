import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Intentamos consultar un proveedor público secundario ultra rápido y estable
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/bcv', { 
      next: { revalidate: 3600 }, // Caché de 1 hora
      signal: AbortSignal.timeout(4000) // Timeout de 4 segundos para evitar bloqueos
    });

    if (res.ok) {
      const data = await res.json();
      // data.promedio suele contener la tasa oficial del BCV
      const tasaOficial = data.promedio || 48.50;
      
      return NextResponse.json({
        success: true,
        fuente: 'API Externa en Vivo (DolarAPI / BCV)',
        tasa: tasaOficial,
        actualizado: new Date().toISOString()
      });
    }
  } catch (error) {
    // Si la red falla (muy común en Venezuela), aplicamos el respaldo corporativo silencioso
    console.warn("Aviso: No se pudo conectar a la API externa de BCV. Usando tasa de respaldo.");
  }

  // Fallback garantizado (Respaldo Corporativo D'una)
  return NextResponse.json({
    success: true,
    fuente: 'Respaldo Corporativo D\'una (Fallback Local)',
    tasa: 48.50,
    actualizado: new Date().toISOString()
  });
}