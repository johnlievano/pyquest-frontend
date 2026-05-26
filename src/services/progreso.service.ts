import apiClient from '../lib/axios';

export interface Progreso {
  idProgreso: number;
  idUsuario: number;
  idEjercicio: number;
  completado: boolean;
  ejercicio?: {
    idEjercicio: number;
    titulo: string;
    categoria: string;
    dificultad: string;
  };
}

export interface ProgresoRequest {
  idUsuario: number;
  idEjercicio: number;
  completado: boolean;
}

export const progresoService = {
  getByUsuario: async (idUsuario: number): Promise<{ success: boolean; data: Progreso[] }> => {
    return await apiClient.get(`/progreso?idUsuario=${idUsuario}`);
  },

  guardar: async (body: ProgresoRequest): Promise<{ success: boolean; data: Progreso }> => {
    return await apiClient.post('/progreso', body);
  },

  eliminar: async (idProgreso: number): Promise<{ success: boolean }> => {
    return await apiClient.delete(`/progreso/${idProgreso}`);
  },
};