import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface ParticipantClaim {
  id: string;
  name: string;
  unitsCount: number;
  exclusions: string[];
  selectedVariants: Record<string, any>;
  subtotalUsd: number;
  isHost: boolean;
  completedAt: string | null;
}

export interface ComboRoomData {
  id: string;
  productId: string | number;
  productName: string;
  storeName: string;
  storeCode: string;
  totalUnits: number;
  unitPriceUsd: number;
  claimedUnits: number;
  paymentMode: 'split' | 'host_pays';
  participants: ParticipantClaim[];
  createdAt: string;
  hostName: string;
}

function generateRoomId(): string {
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

    return NextResponse.json({ ok: true, room: docSnap.data() as ComboRoomData });
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
      totalUnits,
      unitPriceUsd,
      hostName,
      hostUnitsCount,
      hostSelectedVariants,
      hostExclusions,
        paymentMode = 'split',
      } = body;

    if (!productId || !productName || !totalUnits || totalUnits < 1) {
      return NextResponse.json({ ok: false, error: 'Parámetros inválidos' }, { status: 400 });
    }

    const hostClaim: ParticipantClaim = {
      id: 'host',
      name: hostName || 'Anfitrión',
      unitsCount: hostUnitsCount || 0,
      exclusions: Array.isArray(hostExclusions) ? hostExclusions : [],
      selectedVariants: hostSelectedVariants || {},
      subtotalUsd: (hostUnitsCount || 0) * (unitPriceUsd || 0),
      isHost: true,
      completedAt: new Date().toISOString(),
    };

    let finalId = params.id === 'new' ? generateRoomId() : (params.id || generateRoomId());
    
    const docRef = doc(db, 'comboRooms', finalId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && params.id !== 'new') {
      return NextResponse.json({ ok: false, error: 'Sala ya existe' }, { status: 409 });
    } else if (docSnap.exists()) {
      finalId = generateRoomId();
    }

    const room: ComboRoomData = {
      id: finalId,
      productId,
      productName,
      storeName: storeName || '',
      storeCode: storeCode || '',
      totalUnits,
      unitPriceUsd: unitPriceUsd || 0,
      claimedUnits: hostClaim.unitsCount,
        paymentMode,
      participants: hostClaim.unitsCount > 0 ? [hostClaim] : [],
      createdAt: new Date().toISOString(),
      hostName: hostName || 'Anfitrión',
    };

    await setDoc(doc(db, 'comboRooms', finalId), room);

    return NextResponse.json({ ok: true, room }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Error al crear la sala' }, { status: 500 });
  }
}

/* ─── PUT — asignar/unirse a sala ───────────────────────────────────────────────── */
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

    const room = docSnap.data() as ComboRoomData;
    const body = await req.json();
    const { name, unitsCount, selectedVariants, exclusions } = body;

    if (!name || String(name).trim().length === 0) {
      return NextResponse.json({ ok: false, error: 'Se requiere un nombre' }, { status: 400 });
    }
    
    if (typeof unitsCount !== 'number' || unitsCount < 1) {
      return NextResponse.json({ ok: false, error: 'Cantidad inválida' }, { status: 400 });
    }

    if (room.claimedUnits + unitsCount > room.totalUnits) {
      return NextResponse.json({ ok: false, error: 'No hay suficientes unidades disponibles' }, { status: 409 });
    }

    const newClaim: ParticipantClaim = {
      id: Math.random().toString(36).slice(2, 9),
      name: String(name).trim(),
      unitsCount,
      exclusions: Array.isArray(exclusions) ? exclusions : [],
      selectedVariants: selectedVariants || {},
      subtotalUsd: unitsCount * room.unitPriceUsd,
      isHost: false,
      completedAt: new Date().toISOString(),
    };

    room.participants.push(newClaim);
    room.claimedUnits += unitsCount;

    await updateDoc(docRef, { participants: room.participants, claimedUnits: room.claimedUnits });

    return NextResponse.json({ ok: true, room });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Error al unirse a la sala' }, { status: 500 });
  }
}
