import apiClient from '../lib/axios';

export interface Usuario {
  idUsuario: number;
  nombre: string;
  email: string;
  perfil?: {
    nivel: number;
    experiencia: number;
    racha: number;
  };
}

export const usersService = {
  getById: async (idUsuario: number): Promise<{ success: boolean; data: Usuario }> => {
    return await apiClient.get(`/users/${idUsuario}`);
  },
};