import apiClient from '../lib/axios';

export interface Puntos {
  puntos: number;
}

export interface TransaccionPuntos {
  idTransaccion: number;
  cantidad: number;
  tipo: string;
  descripcion: string;
  fecha: string;
  idEjercicio?: number;
}

export const puntosService = {
  obtener: async (): Promise<{ success: boolean; data: Puntos }> => {
    return await apiClient.get('/puntos');
  },

  historial: async (): Promise<{ success: boolean; data: TransaccionPuntos[] }> => {
    return await apiClient.get('/puntos/historial');
  },
};