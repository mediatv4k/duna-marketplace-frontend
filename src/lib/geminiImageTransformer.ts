import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

export async function recomposeImage(
  imageInput: string | Buffer,
  mimeType: string = 'image/jpeg'
): Promise<Buffer> {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  let base64Data: string;

  if (Buffer.isBuffer(imageInput)) {
    base64Data = imageInput.toString('base64');
  } else if (typeof imageInput === 'string' && imageInput.startsWith('http')) {
    const res = await fetch(imageInput);
    const arrayBuffer = await res.arrayBuffer();
    base64Data = Buffer.from(arrayBuffer).toString('base64');
  } else if (typeof imageInput === 'string' && fs.existsSync(imageInput)) {
    base64Data = fs.readFileSync(imageInput).toString('base64');
  } else {
    throw new Error('Formato de imagen inválido');
  }

  const prompt = `Actúa como diseñador publicitario de e-commerce. Transforma esta imagen de producto en un diseño publicitario cuadrado perfecto 1:1 de 512x512.
Reglas universales de diseño:
1. PROTAGONISMO Y ENCUADRE: Identifica el producto principal. Debe quedar 100% visible, sin cortes en sus extremos. Si es pequeño, amplíalo para que ocupe entre 75% y 85% del lienzo. Si está recortado o desbordado, reduce su escala y dale márgenes para que se vea completo.
2. FONDOS: Extiende de forma armónica los tonos, degradados y texturas del fondo hacia todos los márgenes vacíos hasta completar los 512x512.
3. LOGOS Y TEXTOS: Conserva y redistribuye limpiamente marcas o textos sin recortarlos ni distorsionarlos.
4. INTEGRIDAD: No aplastes ni deformes la geometría original del producto.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
      prompt,
    ],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  const candidate = response.candidates?.[0];
  const imagePart = candidate?.content?.parts?.find((part) => part.inlineData?.data);

  if (!imagePart?.inlineData?.data) {
    throw new Error('El modelo no devolvió ninguna imagen generada.');
  }

  return Buffer.from(imagePart.inlineData.data, 'base64');
}
