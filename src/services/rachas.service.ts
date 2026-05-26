import apiClient from '../lib/axios';

export interface Rachas {
  rachaDiaria: number;
  rachaDiariaMax: number;
  rachaConsecutiva: number;
  rachaConsecutivaMax: number;
  inicioRachaDiaria: string | null;
  inicioRachaConsecutiva: string | null;
  fechaUltimoEjercicio: string | null;
}

export const rachasService = {
  obtener: async (): Promise<{ success: boolean; data: Rachas }> => {
    return await apiClient.get('/rachas');
  },
};