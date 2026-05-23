// ─── api.ts ──────────────────────────────────────────────────────────────────
// Conecta el frontend con el backend NestJS (pyquest-backend)
// Reemplaza simularEjecucion() en EntornoCodigo.tsx
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8218';

// ── Tipos que espera/devuelve el backend ──────────────────────────────────────

export interface CompilerRequest {
  codigo: string;
  ejercicioId: string;
  unidadId: number;
}

export interface CompilerResponse {
  salida: string;
  ok: boolean;
  mensaje: string;
  xpGanado: number;
  tiempoMs: number;
}

// ── Ejecutar código contra el compilador real ─────────────────────────────────

export async function ejecutarCodigo(
  req: CompilerRequest,
): Promise<CompilerResponse> {
  const res = await fetch(`${BASE_URL}/compiler/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Error del compilador (${res.status}): ${error}`);
  }

  return res.json() as Promise<CompilerResponse>;
}

// ── Obtener ejercicios desde el backend (opcional) ────────────────────────────
// Útil si en el futuro los ejercicios viven en base de datos

export async function fetchEjercicio(unidadId: number, ejercicioId: string) {
  const res = await fetch(`${BASE_URL}/ejercicios/${unidadId}/${ejercicioId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchUnidades() {
  const res = await fetch(`${BASE_URL}/ejercicios`);
  if (!res.ok) return null;
  return res.json();
}