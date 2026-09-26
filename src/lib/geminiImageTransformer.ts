import { GoogleGenAI } from '@google/genai';

export async function recomposeImage(imageUrlOrBuffer: string | Buffer): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Actúa como diseñador publicitario de e-commerce de alto nivel. Transforma cualquier imagen de producto o afiche (sin importar si es vertical, horizontal, recortada o pequeña) en una composición publicitaria cuadrada perfecta 1:1 de 512x512.
Reglas universales de diseño:
1. PROTAGONISMO: Identifica el producto principal y amplíalo para que ocupe entre 75% y 85% del área visual útil dentro del cuadro.
2. FONDOS: Extiende de forma armónica los tonos, degradados y texturas del fondo hacia todos los márgenes vacíos hasta completar los 512x512, sin franjas muertas ni cortes abruptos.
3. TEXTOS Y MARCAS: Si la imagen contiene logotipos o textos de marca/sabor, redistribúyelos armónicamente arriba o abajo del producto sin recortarlos ni deformarlos.
4. INTEGRIDAD: Mantén la proporción y nitidez real del producto, sin achatamientos ni distorsiones.`;

  try {
    // En la nueva API Developer, generateContent se usa para generar imágenes con modelos imagen.
    // Aunque la API pública puede variar para edición (image-to-image), se invoca de la forma estándar.
    const result = await ai.models.generateContent({
        model: 'imagen-3.0-generate-002',
        contents: prompt,
        config: {
            outputMimeType: "image/jpeg"
        }
    });

    if (result.generatedImages && result.generatedImages.length > 0) {
        const base64 = result.generatedImages[0].image?.imageBytes;
        return `data:image/jpeg;base64,${base64}`;
    }

    throw new Error("No se devolvió imagen generada.");
  } catch (error) {
    console.error("Error en Gemini Image Transformer:", error);
    throw new Error("No se pudo recomponer la imagen con Gemini");
  }
}
