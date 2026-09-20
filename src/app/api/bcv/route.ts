import { NextResponse } from 'next/server';

// Tasa oficial BCV en vivo (Bs. por USD). Sin tasa de respaldo inventada: si la fuente falla
// se responde success:false / tasa:null y cada pantalla decide cómo degradar (p. ej. ocultar Bs.).
// Nota: el endpoint anterior /v1/dolares/bcv devuelve 404; la tasa oficial del BCV vive en /v1/dolares/oficial.
export async function GET() {
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      next: { revalidate: 3600 }, // Caché de 1 hora
      signal: AbortSignal.timeout(4000) // Timeout de 4 segundos para evitar bloqueos
    });

    if (res.ok) {
      const data = await res.json();
      const tasa = Number(data?.promedio);
      if (Number.isFinite(tasa) && tasa > 0) {
        return NextResponse.json({
          success: true,
          fuente: 'DolarAPI (BCV oficial)',
          tasa,
          actualizado: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.warn('Aviso: No se pudo conectar a la API externa de BCV.');
  }

  return NextResponse.json(
    { success: false, fuente: null, tasa: null, actualizado: new Date().toISOString() },
    { status: 503 }
  );
}
