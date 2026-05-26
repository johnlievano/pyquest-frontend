import apiClient from '../lib/axios';

export interface Icono {
  idIcono: number;
  nombre: string;
  ruta: string;
  descripcion: string;
  costo: number;
}

export interface IconoUsuario {
  idIcono: number;
  fechaDesbloqueo: string;
  icono: Icono;
}

export const iconosService = {
  catalogo: async (): Promise<{ success: boolean; data: Icono[] }> => {
    return await apiClient.get('/iconos');
  },

  misIconos: async (): Promise<{ success: boolean; data: IconoUsuario[] }> => {
    return await apiClient.get('/iconos/usuario');
  },

  iconoActivo: async (): Promise<{ success: boolean; data: Icono | null }> => {
    return await apiClient.get('/iconos/activo');
  },

  comprar: async (idIcono: number): Promise<{ success: boolean; data: IconoUsuario }> => {
    return await apiClient.post(`/iconos/comprar/${idIcono}`, {});
  },

  setActivo: async (idIcono: number): Promise<{ success: boolean }> => {
    return await apiClient.patch(`/iconos/activo/${idIcono}`, {});
  },
};