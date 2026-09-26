import { NextResponse } from 'next/server';
import { recomposeImage } from '@/lib/geminiImageTransformer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageUrl, productId } = body;

    if (!imageUrl) {
      return NextResponse.json({ success: false, message: 'imageUrl es requerido' }, { status: 400 });
    }

    // Opcional: Proteger la ruta verificando algún token de admin aquí

    // 1. Invocar microservicio de transformación con Gemini
    const optimizedImageBuffer = await recomposeImage(imageUrl);
    const recomposedUrl = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;

    // 2. Aquí iría la lógica para guardar `optimizedImage` en la base de datos (e.g. Firebase)
    // asociado al productId. Para este endpoint, simplemente devolvemos la URL procesada en base64.

    return NextResponse.json({
      success: true,
      productId,
      originalUrl: imageUrl,
      recomposedUrl
    });

  } catch (error: any) {
    console.error('Error en recompose-image API:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
