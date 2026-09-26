// Cofre de Recompensas D'una: recompensas activas del cliente (GET /loyalties/{phone} -> `activeRewards[]`) y cálculo de su descuento.
// Funciones puras (sin React ni red): así el cálculo se verifica de forma aislada. El frontend NUNCA inventa recompensas ni descuentos:
// solo aplica las que devuelve el backend, con las reglas del contrato (applyTo / amountType / amount).

export type RewardApplyTo = 'PURCHASE' | 'DELIVERY';
// 'FIXED' cubre también el `amountType: 'AMOUNT'` del backend (mismo cálculo: monto fijo con tope en la base)
export type RewardAmountType = 'PERCENT' | 'FIXED';

export interface LoyaltyReward {
  id: number;
  code: string | null;
  name: string;
  applyTo: RewardApplyTo;
  amountType: RewardAmountType;
  amount: number;
}

// La forma exacta del sobre de `/loyalties/{phone}` no está documentada en el repo: se busca `activeRewards` en el sobre y en los
// contenedores habituales (`data`, ...), hasta 3 niveles.
function findActiveRewards(node: unknown, depth = 0): unknown[] | null {
  if (!node || typeof node !== 'object' || depth > 3) return null;
  const rec = node as Record<string, unknown>;
  if (Array.isArray(rec.activeRewards)) return rec.activeRewards;
  for (const key of ['data', 'loyalty', 'loyalties', 'customer']) {
    const found = findActiveRewards(rec[key], depth + 1);
    if (found) return found;
  }
  return null;
}

function normalizeReward(raw: unknown): LoyaltyReward | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = Number(r.id ?? r.couponId ?? r.rewardId);
  const applyTo = String(r.applyTo ?? '').toUpperCase();
  const typeRaw = String(r.amountType ?? '').toUpperCase();
  const amountType: RewardAmountType | null = /^PERCENT/.test(typeRaw) ? 'PERCENT' : (typeRaw === 'FIXED' || typeRaw === 'AMOUNT') ? 'FIXED' : null;
  const amount = Number(r.amount);
  // Una recompensa que no se puede calcular con certeza (tipo o destino desconocido, monto no positivo, sin id) se descarta
  if (!Number.isFinite(id) || id <= 0) return null;
  if (applyTo !== 'PURCHASE' && applyTo !== 'DELIVERY') return null;
  if (!amountType || !Number.isFinite(amount) || amount <= 0) return null;
  const code = String(r.code ?? r.couponCode ?? '').trim();
  const name = String(r.name ?? r.title ?? r.description ?? '').trim();
  return { id, code: code || null, name, applyTo, amountType, amount };
}

export interface ParsedLoyalty {
  rewards: LoyaltyReward[];
  // true = el backend respondió con claridad (lista de recompensas o "Cliente no encontrado"); false = fallo de red/timeout/respuesta
  // desconocida: el llamador NO debe concluir que el cliente perdió sus recompensas
  answered: boolean;
}

export function parseLoyaltyResponse(res: unknown): ParsedLoyalty {
  const list = findActiveRewards(res);
  if (list) {
    const seen = new Set<number>();
    const rewards: LoyaltyReward[] = [];
    for (const item of list) {
      const reward = normalizeReward(item);
      if (reward && !seen.has(reward.id)) { seen.add(reward.id); rewards.push(reward); }
    }
    return { rewards, answered: true };
  }
  // Cliente sin historial: HTTP 404 `{ success: false, message: "Cliente no encontrado" }` (verificado en DEV) = sin recompensas
  const body = (res && typeof res === 'object' ? res : {}) as { success?: unknown; message?: unknown };
  if (body.success === false && /no encontrado|not found/i.test(String(body.message || ''))) return { rewards: [], answered: true };
  return { rewards: [], answered: false };
}

export interface RewardBases {
  purchase: number; // subtotal de productos
  delivery: number; // flete (`serviceAmount`); 0 en retiro en tienda
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

// Descuento en USD de una recompensa. Base: PURCHASE = subtotal de productos; DELIVERY = flete.
//  · PERCENT       -> base × (amount / 100)
//  · FIXED/AMOUNT  -> min(amount, base)
// Nunca supera la base ni es negativo; con base 0 (p. ej. recompensa de flete en retiro en tienda) el descuento es 0.
export function rewardDiscount(reward: LoyaltyReward, bases: RewardBases): number {
  const base = reward.applyTo === 'PURCHASE' ? bases.purchase : bases.delivery;
  if (!Number.isFinite(base) || base <= 0) return 0;
  const raw = reward.amountType === 'PERCENT' ? base * (reward.amount / 100) : reward.amount;
  return Math.max(0, Math.min(round2(raw), round2(base)));
}

// Texto para el cliente: "25% de descuento en el envío" / "$5.00 de descuento en tu compra"
export function describeReward(reward: LoyaltyReward): string {
  const value = reward.amountType === 'PERCENT'
    ? `${Number.isInteger(reward.amount) ? reward.amount : reward.amount.toFixed(2)}%`
    : `$${reward.amount.toFixed(2)}`;
  return `${value} de descuento en ${reward.applyTo === 'DELIVERY' ? 'el envío' : 'tu compra'}`;
}

export function rewardTitle(reward: LoyaltyReward): string {
  return reward.name || reward.code || 'Recompensa D\'una';
}
