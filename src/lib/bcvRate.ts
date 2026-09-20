// Gestor de Tasa BCV (para Home/Navbar) con última tasa REAL persistida en localStorage.
// Sin tasa fija de respaldo: si no hay tasa viva ni una tasa real guardada, devuelve null.
// La clave es _v2 para descartar valores heredados de versiones anteriores que guardaban un 48.50 inventado.
const STORAGE_KEY = 'duna_tasa_bcv_v2';

export async function getBCVRate(): Promise<number | null> {
  if (typeof window === 'undefined') return null;

  try {
    const response = await fetch('/api/bcv');
    const result = await response.json();
    const tasa = Number(result?.tasa);

    if (result?.success && Number.isFinite(tasa) && tasa > 0) {
      localStorage.setItem(STORAGE_KEY, String(tasa));
      return tasa;
    }
  } catch (e) {
    console.warn('Usando última tasa real almacenada en localStorage por fallo de red.');
  }

  try {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(stored) && stored > 0 ? stored : null;
  } catch {
    return null;
  }
}
