/**
 * ==============================================================================
 * BITÁCORA DE ACTUALIZACIÓN - CONFIGURADOR DINÁMICO DE NICHOS (FASE 3)
 * ==============================================================================
 * Fecha: Lunes, 07 de Septiembre de 2026
 * Hora Local: 12:50 AM (Cabimas, Estado Zulia, Venezuela)
 * Archivo: src/lib/nicheConfig.ts
 * ==============================================================================
 */

export type StoreNiche = 'BOUTIQUE' | 'PIZZERIA' | 'FAST_FOOD' | 'ABASTO' | 'BODEGON' | 'GENERAL';

export function detectStoreNiche(store: { categories?: string; name?: string; code?: string }): StoreNiche {
  const text = `${store.categories || ''} ${store.name || ''} ${store.code || ''}`.toUpperCase();
  
  if (text.includes('BOUTIQUE') || text.includes('MODA') || text.includes('ROPA')) return 'BOUTIQUE';
  if (text.includes('PIZZA') || text.includes('PIZZERIA') || text.includes('PELUCHE') || text.includes('N&H')) return 'PIZZERIA';
  if (text.includes('BURGER') || text.includes('SHAWARMA') || text.includes('YUKA') || text.includes('FAST')) return 'FAST_FOOD';
  if (text.includes('ABASTO') || text.includes('MINIMARKET') || text.includes('VIVERES')) return 'ABASTO';
  if (text.includes('BODEGON') || text.includes('PROSECO') || text.includes('LICOR')) return 'BODEGON';
  
  return 'GENERAL';
}

export function getNicheFeatures(niche: StoreNiche) {
  return {
    hasSizes: niche === 'BOUTIQUE',
    hasVirtualFitter: niche === 'BOUTIQUE',
    hasExclusions: niche === 'PIZZERIA' || niche === 'FAST_FOOD',
    hasAddonsOrBorders: niche === 'PIZZERIA',
    hasBottlePacks: niche === 'BODEGON',
    hasQuickPantryKits: niche === 'ABASTO',
    hasUpsellTunnel: niche === 'PIZZERIA' || niche === 'FAST_FOOD' || niche === 'ABASTO' || niche === 'BODEGON'
  };
}