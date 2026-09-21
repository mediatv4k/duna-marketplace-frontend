import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Asistente de ventas con Gemini. La API key vive solo en el servidor (GEMINI_API_KEY, sin prefijo NEXT_PUBLIC_):
// el navegador nunca la ve; solo llama a este endpoint.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_INPUT_CHARS = 500;

const SYSTEM_INSTRUCTION =
  "Eres el asistente de voz de D'una, operando en Cabimas, estado Zulia. Tu objetivo es ayudar al usuario a completar su proceso de pago. " +
  'Sé cálido, persuasivo y muy breve (máximo 2 oraciones). ' +
  "Si te preguntan cosas fuera del contexto de ventas, entregas, e-wallet o comercio local (por ejemplo, recetas médicas o dolores de cabeza), " +
  "responde de forma cortés que eres el asistente de pedidos de D'una y redirige la conversación hacia la confirmación de su carrito de compras.";

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
