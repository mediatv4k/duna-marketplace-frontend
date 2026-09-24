/**
 * API Route: /api/combo/[id]
 * Sala de pedido colaborativo en vivo ("Armar Combo con Amigos").
 *
 * GET  /api/combo/[id]           → Estado completo de la sala (ranuras + participantes)
 * POST /api/combo/[id]           → Crear sala (anfitrión)
 * PUT  /api/combo/[id]           → Asignar/actualizar la selección de una ranura
 *
 * Estado almacenado en memoria del proceso (volatile — se reinicia con el servidor).
 * Para producción real, reemplazar `comboRooms` por Redis o similar.
 *
 * TTL: 4 horas por sala (limpia entradas antiguas en cada escritura).
 */

import { NextRequest, NextResponse } from 'next/server';

/* ─── Tipos ──────────────────────────────────────────────────────────────── */
export interface ComboSlotState {
  slotIndex: number;          // 0-based
  guestName: string;          // '' = libre
  selectedVariants: Record<string, any>;
  exclusions: string[];
  completedAt: string | null; // ISO timestamp
}

export interface ComboRoom {
  id: string;
  productId: string | number;
  productName: string;
  storeName: string;
  storeCode: string;
  totalSlots: number;
  groups: any[];              // grupos de variantes normalizados
  slots: ComboSlotState[];
  createdAt: string;          // ISO timestamp
  hostName: string;
}

/* ─── Store en memoria (Fallback Rápido) ─────────────────────────────────── */
const comboRooms: Map<string, ComboRoom> = (globalThis as any).comboRooms ??= new Map<string, ComboRoom>();
const ROOM_TTL_MS = 4 * 60 * 60 * 1000; // 4 h

function pruneExpiredRooms() {
  const cutoff = Date.now() - ROOM_TTL_MS;
  for (const [id, room] of comboRooms.entries()) {
    if (new Date(room.createdAt).getTime() < cutoff) {
      comboRooms.delete(id);
    }
  }
}

// Codifica la sala a Base64URL para persistencia stateless en Vercel
function encodeRoomToBase64(room: ComboRoom): string {
  try {
    return Buffer.from(JSON.stringify(room)).toString('base64url');
  } catch {
    return room.id;
  }
}

// Decodifica la sala desde Base64URL
function decodeRoomFromBase64(base64Str: string): ComboRoom | null {
  try {
    const decoded = Buffer.from(base64Str, 'base64url').toString('utf-8');
    const room = JSON.parse(decoded) as ComboRoom;
    if (room && room.productName && room.totalSlots) {
      return room;
    }
    return null;
  } catch {
    return null;
  }
}

/* ─── GET ────────────────────────────────────────────────────────────────── */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  let room = comboRooms.get(params.id);
  
  // 🛡️ Estrategia Stateless (Vercel): Si no está en memoria, intentamos decodificar el ID
  if (!room) {
    room = decodeRoomFromBase64(params.id) || undefined;
    if (room) {
      // Restaurar en memoria de esta instancia
      comboRooms.set(params.id, room);
    }
  }

  if (!room) {
    return NextResponse.json({ ok: false, error: 'Sala no encontrada' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, room });
}

/* ─── POST — crear sala ──────────────────────────────────────────────────── */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  pruneExpiredRooms();

  try {
    const body = await req.json();
    const {
      productId,
      productName,
      storeName,
      storeCode,
      totalSlots,
      groups,
      hostName,
    } = body;

    if (!productId || !productName || !totalSlots || totalSlots < 1 || totalSlots > 50) {
      return NextResponse.json({ ok: false, error: 'Parámetros inválidos' }, { status: 400 });
    }

    const slots: ComboSlotState[] = Array.from({ length: totalSlots }, (_, i) => ({
      slotIndex: i,
      guestName: i === 0 ? (hostName || 'Anfitrión') : '',
      selectedVariants: {},
      exclusions: [],
      completedAt: null,
    }));

    const room: ComboRoom = {
      id: '', // Se asignará el base64
      productId,
      productName,
      storeName: storeName || '',
      storeCode: storeCode || '',
      totalSlots,
      groups: Array.isArray(groups) ? groups : [],
      slots,
      createdAt: new Date().toISOString(),
      hostName: hostName || 'Anfitrión',
    };

    // 🛡️ Asignar el estado completo codificado como ID de la sala
    const statelessId = encodeRoomToBase64(room);
    room.id = statelessId;

    comboRooms.set(statelessId, room);
    return NextResponse.json({ ok: true, room }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al crear la sala' }, { status: 500 });
  }
}

/* ─── PUT — asignar ranura ───────────────────────────────────────────────── */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let room = comboRooms.get(params.id);

  // 🛡️ Estrategia Stateless (Vercel): Recuperar desde el ID si la memoria se borró
  if (!room) {
    room = decodeRoomFromBase64(params.id) || undefined;
  }

  if (!room) {
    return NextResponse.json({ ok: false, error: 'Sala no encontrada' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { slotIndex, guestName, selectedVariants, exclusions } = body;

    if (typeof slotIndex !== 'number' || slotIndex < 0 || slotIndex >= room.totalSlots) {
      return NextResponse.json({ ok: false, error: 'Ranura inválida' }, { status: 400 });
    }

    if (!guestName || String(guestName).trim().length === 0) {
      return NextResponse.json({ ok: false, error: 'Se requiere un nombre' }, { status: 400 });
    }

    const slot = room.slots[slotIndex];
    if (slotIndex > 0 && slot.guestName && slot.guestName !== guestName) {
      return NextResponse.json(
        { ok: false, error: 'Ranura ya tomada por otro participante' },
        { status: 409 }
      );
    }

    room.slots[slotIndex] = {
      ...slot,
      guestName: String(guestName).trim(),
      selectedVariants: selectedVariants || {},
      exclusions: Array.isArray(exclusions) ? exclusions : [],
      completedAt: new Date().toISOString(),
    };

    // Actualizamos la memoria de este contenedor
    comboRooms.set(params.id, room);

    return NextResponse.json({ ok: true, room });
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al actualizar la ranura' }, { status: 500 });
  }
}
