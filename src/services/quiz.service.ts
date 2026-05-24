import apiClient from '../lib/axios';

export interface Respuesta {
  idRespuesta: number;
  texto: string;
  esCorrrecta?: boolean;
}

export interface Pregunta {
  idPregunta: number;
  enunciado: string;
  respuestas: Respuesta[];
}

export interface Quiz {
  idQuiz: number;
  titulo: string;
  descripcion: string;
  preguntas: Pregunta[];
}

export interface RespuestaSeleccionada {
  idPregunta: number;
  idRespuesta: number;
}

export interface ResultadoQuiz {
  puntaje: number;
  total: number;
  porcentaje: number;
  detalle: {
    idPregunta: number;
    correcto: boolean;
  }[];
}

export const quizService = {
  getAll: async (): Promise<{ success: boolean; data: Quiz[] }> => {
    return await apiClient.get('/quiz');
  },

  getById: async (idQuiz: number): Promise<{ success: boolean; data: Quiz }> => {
    return await apiClient.get(`/quiz/${idQuiz}`);
  },

  responder: async (
    idQuiz: number,
    respuestas: RespuestaSeleccionada[]
  ): Promise<{ success: boolean; data: ResultadoQuiz }> => {
    return await apiClient.post(`/quiz/${idQuiz}/responder`, { respuestas });
  },
};