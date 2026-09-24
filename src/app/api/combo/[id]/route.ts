import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface ComboSlotState {
  slotIndex: number;
  guestName: string;
  selectedVariants: Record<string, any>;
  exclusions: string[];
  completedAt: string | null;
}

interface ComboRoom {
  id: string;
  productId: string | number;
  productName: string;
  storeName: string;
  storeCode: string;
  totalSlots: number;
  groups: any[];
  slots: ComboSlotState[];
  createdAt: string;
  hostName: string;
}

function generateRoomId(): string {
  // Código corto legible: PANA-XXXX
  const randomChars = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PANA-${randomChars}`;
}

/* ─── GET ────────────────────────────────────────────────────────────────── */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = doc(db, 'comboRooms', params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ ok: false, error: 'Sala no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, room: docSnap.data() as ComboRoom });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Error al consultar la sala' }, { status: 500 });
  }
}

/* ─── POST — crear sala ──────────────────────────────────────────────────── */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      productId,
      productName,
      storeName,
      storeCode,
      totalSlots,
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

    // Generar un ID hasta que no exista colisión
    let finalId = params.id === 'new' ? generateRoomId() : (params.id || generateRoomId());
    
    // Validar si ya existe en Firestore
    const docRef = doc(db, 'comboRooms', finalId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && params.id !== 'new') {
      return NextResponse.json({ ok: false, error: 'Sala ya existe' }, { status: 409 });
    } else if (docSnap.exists()) {
      // Si fue autogenerado y colisionó (muy raro), generamos otro
      finalId = generateRoomId();
    }

    const room: ComboRoom = {
      id: finalId,
      productId,
      productName,
      storeName: storeName || '',
      storeCode: storeCode || '',
      totalSlots,
      groups: [], // Eliminado para hacer el estado ligero
      slots,
      createdAt: new Date().toISOString(),
      hostName: hostName || 'Anfitrión',
    };

    // Guardar en Firestore
    await setDoc(doc(db, 'comboRooms', finalId), room);

    return NextResponse.json({ ok: true, room }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Error al crear la sala' }, { status: 500 });
  }
}

/* ─── PUT — asignar ranura ───────────────────────────────────────────────── */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = doc(db, 'comboRooms', params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ ok: false, error: 'Sala no encontrada' }, { status: 404 });
    }

    const room = docSnap.data() as ComboRoom;
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

    // Actualizar en Firestore
    await updateDoc(docRef, { slots: room.slots });

    return NextResponse.json({ ok: true, room });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Error al actualizar la ranura' }, { status: 500 });
  }
}
