import { NextResponse } from 'next/server';
import { recomposeImage } from '@/lib/geminiImageTransformer';

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY no configurada en el entorno" },
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

    // 2. Invocar microservicio de transformación con Gemini
    const optimizedImageBuffer = await recomposeImage(imageUrl);
    const recomposedUrl = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;

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
