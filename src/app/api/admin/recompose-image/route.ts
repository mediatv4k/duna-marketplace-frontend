import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
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

    // 2. Construir la URL de transformación encadenada de Cloudinary
    // Paso 1: Crop con IA al sujeto principal dejándolo a 400x400
    // Paso 2: Pad a 512x512 con Generative Fill para reconstruir el fondo
    const recomposedUrl = `https://res.cloudinary.com/rukjbnry/image/fetch/c_fill,w_400,h_400,g_auto:subject/c_pad,w_512,h_512,b_gen_fill/${encodeURIComponent(imageUrl)}`;

    // 3. Responder con JSON válido
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
