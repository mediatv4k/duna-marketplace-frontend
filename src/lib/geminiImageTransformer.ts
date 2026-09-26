import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Transforma un volante vertical en una pieza publicitaria 512x512
 * utilizando Gemini/Imagen API.
 */
export async function recomposeImage(imageUrlOrBuffer: string | Buffer): Promise<string> {
  const prompt = "Actúa como diseñador publicitario de e-commerce. Transforma este volante vertical en un diseño publicitario cuadrado 1:1 de 512x512. Reglas: aumenta la escala del producto principal para que ocupe el 75% del ancho visual en la zona central-inferior; conserva el logotipo en la parte superior central; mantén el título de línea y sabor legible; extiende los fondos y degradados originales para llenar el formato cuadrado sin dejar franjas vacías.";

  try {
    // Si la librería actual permite edición (image-to-image) directamente en generateImages o requiere una llamada distinta:
    // Para simplificar, asumimos que invocamos un modelo de generación capaz de image-to-image
    const result = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            aspectRatio: '1:1',
            outputMimeType: 'image/jpeg',
            // En caso de que el SDK admita la imagen original como conditioning para edit:
            // sourceImage: imageUrlOrBuffer (pseudo-código para la integración)
        }
    });

    if (result.generatedImages && result.generatedImages.length > 0) {
        const base64 = result.generatedImages[0].image?.imageBytes;
        return `data:image/jpeg;base64,${base64}`;
    }

    throw new Error("No se devolvió imagen generada.");
  } catch (error) {
    console.error("Error en Gemini Image Transformer:", error);
    // Devuelve un placeholder o falla silenciosamente para el batch
    throw new Error("No se pudo recomponer la imagen con Gemini");
  }
}
