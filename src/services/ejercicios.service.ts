import apiClient from '../lib/axios';

// Definimos la forma básica de un ejercicio para TypeScript
export interface Ejercicio {
  id: number | string;
  titulo: string;
  descripcion: string;
  dificultad: string;
  categoria: string;
}

interface EjerciciosResponse {
  success: boolean;
  data: Ejercicio[]; // El backend debería devolver un arreglo de ejercicios en 'data'
  message?: string;
}

export const ejerciciosService = {
  // Nota que NO enviamos el token aquí. ¡Tu lib/axios.ts ya lo hace por debajo!
  obtenerTodos: async (): Promise<EjerciciosResponse> => {
    return await apiClient.get('/ejercicios');
  }
};