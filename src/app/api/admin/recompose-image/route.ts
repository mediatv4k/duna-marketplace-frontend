import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    if (!process.env.PHOTOROOM_API_KEY) {
      return NextResponse.json(
        { error: "PHOTOROOM_API_KEY no configurada en el entorno" },
        { status: 400 }
      );
    }

    const body = await req.json();
    let { imageUrl, productId } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'imageUrl es requerido' },
        { status: 400 }
      );
    }

    // 1. Normalizar URL relativa
    if (imageUrl.startsWith('/')) {
      const host = req.headers.get('host') || 'localhost:3000';
      const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
      imageUrl = `${protocol}://${host}${imageUrl}`;
    }

    // 2. Construir la URL de la API de Photoroom
    // Parámetros: remover fondo, fondo blanco, padding 10% (0.1), tamaño 512x512
    const photoroomApiUrl = `https://image-api.photoroom.com/v2/edit?imageUrl=${encodeURIComponent(imageUrl)}&removeBackground=true&background.color=FFFFFF&padding=0.1&outputSize=512x512`;

    // 3. Hacer el fetch a Photoroom
    const response = await fetch(photoroomApiUrl, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.PHOTOROOM_API_KEY,
        'Accept': 'image/png, image/jpeg'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PHOTOROOM ERROR]:', response.status, errorText);
      throw new Error(`Error de Photoroom: ${response.statusText}`);
    }

    // 4. Convertir la respuesta a buffer y base64
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = response.headers.get('content-type') || 'image/png';
    const recomposedUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

    // 5. Responder con JSON válido
    return NextResponse.json({
      success: true,
      productId,
      originalUrl: imageUrl,
      recomposedUrl
    });

  } catch (error: any) {
    console.error('[RECOMPOSE ERROR]:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
