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
  unitExclusions?: string[][]; // exclusiones por unidad (solo si el invitado personalizó varias unidades por separado)
  notes?: string[]; // sugerencias para la cocina (una por unidad, máx. 80 caracteres c/u)
  isHost: boolean;
  completedAt: string | null;
}

export interface ComboRoomData {
  id: string;
  productId: string | number;
  productName: string;
  storeName: string;
  storeCode: string;
  storeId?: string | number; // id real de la tienda (el invitado carga el catálogo para ofrecer complementos)
  totalUnits: number;
  unitPriceUsd: number;
  claimedUnits: number;
  paymentMode: 'split' | 'host_pays';
  participants: ParticipantClaim[];
  createdAt: string;
  hostName: string;
}

// Sugerencias para la cocina: lista de textos cortos, sin saltos de línea, tope 80 caracteres c/u y 12 en total
function cleanNotes(raw: unknown): string[] {
  const list = Array.isArray(raw) ? raw : typeof raw === "string" ? [raw] : [];
  return list.map((n) => String(n).replace(/s+/g, " ").trim().slice(0, 80)).filter(Boolean).slice(0, 12);
}

// Exclusiones por unidad: lista de listas de textos cortos (máx. `units` listas, 20 por lista, 60 car. c/u)
function cleanUnitExclusions(raw: unknown, units: number): string[][] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, units).map((l) => (Array.isArray(l) ? l.map((e) => String(e).trim().slice(0, 60)).filter(Boolean).slice(0, 20) : []));
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
      storeId,
      totalUnits,
      unitPriceUsd,
      hostName,
      hostUnitsCount,
      hostSelectedVariants,
      hostExclusions,
      hostAddonsUsd,
      hostNotes,
        paymentMode = 'split',
      } = body;
    const rawHostAddons = Number(hostAddonsUsd);
    const hostAddons = Number.isFinite(rawHostAddons) && rawHostAddons > 0 ? Math.round(rawHostAddons * 100) / 100 : 0;

    if (!productId || !productName || !totalUnits || totalUnits < 1) {
      return NextResponse.json({ ok: false, error: 'Parámetros inválidos' }, { status: 400 });
    }

    const hostClaim: ParticipantClaim = {
      id: 'host',
      name: hostName || 'Anfitrión',
      unitsCount: hostUnitsCount || 0,
      exclusions: Array.isArray(hostExclusions) ? hostExclusions : [],
      selectedVariants: hostSelectedVariants || {},
      notes: cleanNotes(hostNotes),
      subtotalUsd: (hostUnitsCount || 0) * (unitPriceUsd || 0) + hostAddons,
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
      ...(storeId !== undefined && storeId !== null && storeId !== '' ? { storeId } : {}),
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
    // Adicionales (papas, bebidas…) que el invitado suma a su porción: monto ya calculado en cliente con los precios
    // reales del producto; aquí solo se sanea (número finito, no negativo, 2 decimales).
    const rawAddons = Number(body.addonsUsd);
    const addonsUsd = Number.isFinite(rawAddons) && rawAddons > 0 ? Math.round(rawAddons * 100) / 100 : 0;

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
      notes: cleanNotes(body.notes),
      ...(unitsCount > 1 && Array.isArray(body.unitExclusions) ? { unitExclusions: cleanUnitExclusions(body.unitExclusions, unitsCount) } : {}),
      subtotalUsd: unitsCount * room.unitPriceUsd + addonsUsd,
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

/* ─── PATCH — el anfitrión actualiza SU personalización (exclusiones / adicionales) ─────────────────────── */
// No cambia las unidades reclamadas ni crea participantes: solo reemplaza exclusiones y opciones elegidas de la
// tarjeta del anfitrión y recalcula su subtotal (unidades × precio unitario + adicionales). Solo admite `host`.
export async function PATCH(
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
    if (body.participantId !== 'host') {
      return NextResponse.json({ ok: false, error: 'Solo se puede actualizar al anfitrión' }, { status: 400 });
    }

    const idx = room.participants.findIndex((p) => p.isHost);
    if (idx < 0) {
      return NextResponse.json({ ok: false, error: 'La sala no tiene anfitrión con unidades' }, { status: 409 });
    }

    const rawAddons = Number(body.addonsUsd);
    const addonsUsd = Number.isFinite(rawAddons) && rawAddons > 0 ? Math.round(rawAddons * 100) / 100 : 0;
    const host = room.participants[idx];
    room.participants[idx] = {
      ...host,
      exclusions: Array.isArray(body.exclusions) ? body.exclusions.map(String) : [],
      notes: cleanNotes(body.notes),
      selectedVariants: body.selectedVariants && typeof body.selectedVariants === 'object' ? body.selectedVariants : {},
      subtotalUsd: host.unitsCount * room.unitPriceUsd + addonsUsd,
    };

    await updateDoc(docRef, { participants: room.participants });

    return NextResponse.json({ ok: true, room });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Error al actualizar la sala' }, { status: 500 });
  }
}
