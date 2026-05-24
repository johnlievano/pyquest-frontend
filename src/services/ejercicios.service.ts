import apiClient from '../lib/axios';

// ── Tipos del backend ──────────────────────────────────────────
export type Dificultad = 'BAJO' | 'MEDIO' | 'ALTO';

export interface EjercicioBackend {
  idEjercicio: number;
  titulo: string;
  descripcion: string;
  dificultad: Dificultad;
  categoria: string;
}

export interface ValidarRequest {
  idUsuario: number;
  respuesta: string;
}

export interface ValidarResponse {
  success: boolean;
  data: {
    ejercicioId: number;
    usuarioId: number;
    esCorrecto: boolean;
    feedback: string;
    intento: {
      idIntento: number;
      fecha: string;
      esCorrecto: boolean;
    };
  };
  message?: string;
}

export interface CompilerRequest {
  code: string;
  stdin?: string;
  timeoutMs?: number;
}

export interface CompilerResponse {
  success: boolean;
  data: {
    passed: boolean;
    phase: string;
    language: string;
    output?: string;
    stdout: string;
    stderr: string;
    exitCode: number;
    executionTimeMs: number;
    error?: string;
    details?: string;
  };
  message?: string;
}

// ── Helpers ────────────────────────────────────────────────────
export const mapDificultad = (d: Dificultad): string => {
  const map = { BAJO: 'Principiante', MEDIO: 'Intermedio', ALTO: 'Avanzado' };
  return map[d] ?? d;
};

export const colorDificultad = (d: Dificultad) => {
  const map = {
    BAJO:  { bg: 'rgba(16,185,129,0.15)',  text: '#10b981' },
    MEDIO: { bg: 'rgba(245,158,11,0.15)',  text: '#f59e0b' },
    ALTO:  { bg: 'rgba(239,68,68,0.15)',   text: '#ef4444' },
  };
  return map[d] ?? map['BAJO'];
};

export const colorCategoria = (categoria: string) => {
  const map: Record<string, { accent: string; glow: string; icono: string }> = {
    basicos:       { accent: '#3b82f6', glow: 'rgba(59,130,246,0.3)',   icono: '🐍' },
    variables:     { accent: '#8b5cf6', glow: 'rgba(139,92,246,0.3)',   icono: '📦' },
    listas:        { accent: '#06b6d4', glow: 'rgba(6,182,212,0.3)',    icono: '📋' },
    condicionales: { accent: '#f59e0b', glow: 'rgba(245,158,11,0.3)',   icono: '🔀' },
    bucles:        { accent: '#10b981', glow: 'rgba(16,185,129,0.3)',   icono: '🔁' },
    funciones:     { accent: '#ec4899', glow: 'rgba(236,72,153,0.3)',   icono: '⚡' },
    diccionarios:  { accent: '#f97316', glow: 'rgba(249,115,22,0.3)',   icono: '📖' },
    excepciones:   { accent: '#ef4444', glow: 'rgba(239,68,68,0.3)',    icono: '🛡️' },
    clases:        { accent: '#a855f7', glow: 'rgba(168,85,247,0.3)',   icono: '🏗️' },
  };
  return map[categoria] ?? { accent: '#60a5fa', glow: 'rgba(96,165,250,0.3)', icono: '💻' };
};

// ── Servicio ───────────────────────────────────────────────────
export const ejerciciosService = {
  getAll: async (params?: {
    categoria?: string;
    dificultad?: Dificultad;
    limit?: number;
  }): Promise<{ success: boolean; data: EjercicioBackend[] }> => {
    const query = new URLSearchParams();
    if (params?.categoria)  query.set('categoria',  params.categoria);
    if (params?.dificultad) query.set('dificultad', params.dificultad);
    if (params?.limit)      query.set('limit',      String(params.limit));
    const qs = query.toString();
    return await apiClient.get(`/ejercicios${qs ? `?${qs}` : ''}`);
  },

  getById: async (idEjercicio: number): Promise<{ success: boolean; data: EjercicioBackend }> => {
    return await apiClient.get(`/ejercicios/${idEjercicio}`);
  },

  validar: async (
    idEjercicio: number,
    body: ValidarRequest,
  ): Promise<ValidarResponse> => {
    return await apiClient.post(`/ejercicios/${idEjercicio}/validar`, body);
  },

  ejecutarCodigo: async (body: CompilerRequest): Promise<CompilerResponse> => {
    return await apiClient.post('/compiler/python/execute', body);
  },
};