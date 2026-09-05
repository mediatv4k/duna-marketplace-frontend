// Gestor inteligente de Tasa BCV con persistencia en localStorage
export async function getBCVRate(): Promise<number> {
  const FALLBACK_TASA = 48.50;

  if (typeof window === 'undefined') return FALLBACK_TASA;

  try {
    const response = await fetch('/api/bcv');
    const result = await response.json();
    
    if (result && result.tasa) {
      localStorage.setItem('duna_tasa_bcv', result.tasa.toString());
      return parseFloat(result.tasa);
    }
  } catch (e) {
    console.warn("Usando tasa almacenada en localStorage por fallo de red.");
  }

  // Si todo falla, revisamos el localStorage o tiramos del respaldo fijo
  const stored = localStorage.getItem('duna_tasa_bcv');
  return stored ? parseFloat(stored) : FALLBACK_TASA;
}