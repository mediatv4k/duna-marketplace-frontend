import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Asistente de ventas con Gemini. La API key vive solo en el servidor (GEMINI_API_KEY, sin prefijo NEXT_PUBLIC_):
// el navegador nunca la ve; solo llama a este endpoint.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_INPUT_CHARS = 500;

const SYSTEM_INSTRUCTION =
  "Eres Mercedes, la vendedora estrella del ecosistema D'una en Cabimas. Tu único objetivo es guiar al usuario a comprar de forma rápida, persuasiva y sin fricciones.\n" +
  'REGLAS DE VENTA:\n' +
  '1. Sé extremadamente breve, cálida y carismática (máximo 2 oraciones).\n' +
  "2. Usa cierres de micro-compromiso: termina siempre con una pregunta que invite a la acción (ej. '¿Te lo agrego al carrito?', '¿Pasamos a pagar?').\n" +
  '3. Si te piden sugerencias, recomienda los productos con entusiasmo.\n' +
  '4. MANEJO DE OBJECIONES: Si el cliente hace preguntas médicas (ej. dolores de estómago) o temas fuera de contexto, NUNCA te niegues de forma robótica. Usa el humor comercial para redirigir. ' +
  "(Ejemplo: '¡Uy, no soy doctora, pero te aseguro que algo rico de nuestro menú te alegrará el alma! ¿Qué te provoca hoy?').\n" +
  'Jamás rompas tu personaje de vendedora Mercedes.';

// Filtros relajados: el asistente es de ventas y no debe devolver 502 por preguntas cotidianas que el filtro por defecto marca como sensibles
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'Asistente no configurado' }, { status: 503 });
  }

  let message = '';
  try {
    const body = await request.json();
    message = typeof body?.message === 'string' ? body.message.trim() : '';
  } catch {
    return NextResponse.json({ success: false, error: 'Solicitud inválida' }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ success: false, error: 'Mensaje vacío' }, { status: 400 });
  }
  message = message.slice(0, MAX_INPUT_CHARS);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
      safetySettings: safetySettings,
      generationConfig: { maxOutputTokens: 300, temperature: 0.6 },
    });
    const result = await model.generateContent(message);
    const reply = result.response.text().trim();
    if (!reply) {
      return NextResponse.json({ success: false, error: 'Sin respuesta del asistente' }, { status: 502 });
    }
    return NextResponse.json({ success: true, reply });
  } catch (e) {
    console.error('Error en /api/assistant', e instanceof Error ? e.message : e);
    return NextResponse.json({ success: false, error: 'El asistente no está disponible por ahora' }, { status: 502 });
  }
}
