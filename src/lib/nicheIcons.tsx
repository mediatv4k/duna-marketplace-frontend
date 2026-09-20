/**
 * Traduce los slugs de ícono definidos en nicheConfig.ts (estilo FontAwesome,
 * ej. "fa-solid fa-snowflake") a componentes de lucide-react, que es la
 * librería de íconos que usa el resto del proyecto.
 *
 * Si aparece un slug no mapeado, se usa ShieldCheck como respaldo genérico
 * y se avisa por consola (no se rompe el render).
 */

import {
  Snowflake,
  Truck,
  Clock,
  Flame,
  Ruler,
  RotateCcw,
  ShieldCheck,
  PackageCheck,
  Fish,
  Award,
  Zap,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  'snowflake': Snowflake,
  'truck-fast': Truck,
  'clock': Clock,
  'fire': Flame,
  'ruler': Ruler,
  'rotate-left': RotateCcw,
  'shield-halved': ShieldCheck,
  'box-open': PackageCheck,
  'fish': Fish,
  'award': Award,
  'bolt': Zap,
  'briefcase-medical': Stethoscope,
};

export function getNicheIcon(faIconSlug: string): LucideIcon {
  const slug = (faIconSlug || '').replace('fa-solid fa-', '').trim();
  const icon = ICON_MAP[slug];
  if (!icon) {
    console.warn(`[nicheIcons] Slug de ícono no mapeado: "${slug}" — usando ShieldCheck como respaldo.`);
    return ShieldCheck;
  }
  return icon;
}

const COLOR_TOKEN_CLASSES: Record<string, string> = {
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  slate: 'bg-slate-50 text-slate-700 border-slate-200',
};

export function getBadgeColorClasses(colorToken: string): string {
  return COLOR_TOKEN_CLASSES[colorToken] || COLOR_TOKEN_CLASSES.slate;
}
