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

/* ─── Store en memoria ───────────────────────────────────────────────────── */
const comboRooms = new Map<string, ComboRoom>();
const ROOM_TTL_MS = 4 * 60 * 60 * 1000; // 4 h

function pruneExpiredRooms() {
  const cutoff = Date.now() - ROOM_TTL_MS;
  for (const [id, room] of comboRooms.entries()) {
    if (new Date(room.createdAt).getTime() < cutoff) {
      comboRooms.delete(id);
    }
  }
}

function generateRoomId(): string {
  // 8 caracteres alfanuméricos fáciles de compartir
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

/* ─── GET ────────────────────────────────────────────────────────────────── */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const room = comboRooms.get(params.id);
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

    const id = params.id || generateRoomId();

    if (comboRooms.has(id)) {
      return NextResponse.json({ ok: false, error: 'Sala ya existe' }, { status: 409 });
    }

    const slots: ComboSlotState[] = Array.from({ length: totalSlots }, (_, i) => ({
      slotIndex: i,
      guestName: i === 0 ? (hostName || 'Anfitrión') : '',
      selectedVariants: {},
      exclusions: [],
      completedAt: null,
    }));

    const room: ComboRoom = {
      id,
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

    comboRooms.set(id, room);
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
  const room = comboRooms.get(params.id);
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

    // Solo permite tomar ranuras libres (slotIndex 0 = anfitrión siempre)
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

    return NextResponse.json({ ok: true, room });
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al actualizar la ranura' }, { status: 500 });
  }
}
