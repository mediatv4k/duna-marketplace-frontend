import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Asistente de ventas con Gemini. La API key vive solo en el servidor (GEMINI_API_KEY, sin prefijo NEXT_PUBLIC_):
// el navegador nunca la ve; solo llama a este endpoint.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const MAX_INPUT_CHARS = 500;

const SYSTEM_INSTRUCTION =
  "Eres un asesor de ventas de D'una Marketplace. Eres amable y directo. Tu objetivo es guiar a los clientes a comprar en la tienda. " +
  'No respondas temas fuera de ventas. ' +
  "Si preguntan por medicamentos o síntomas, sugiere un producto general y SIEMPRE agrega: 'Esta es una sugerencia comercial, recuerde consultar a su médico.' " +
  'Sé breve (máximo 2 oraciones por respuesta).';

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
      model: MODEL,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: { maxOutputTokens: 160, temperature: 0.6 },
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
