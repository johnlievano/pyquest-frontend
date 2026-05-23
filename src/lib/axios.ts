import axios from 'axios';

// 1. Instancia base
const apiClient = axios.create({
  baseURL: 'http://localhost:8218/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor de Peticiones: Inyectar el token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, 
  (error) => Promise.reject(error)
);

// 3. Interceptor de Respuestas: Manejo de errores globales y formato
apiClient.interceptors.response.use(
  (response) => {
    // Devolvemos directamente la data formateada
    return response.data; 
  },
  (error) => {
    // Manejo automático del 401 (Sesión vencida)
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login'; 
    }
    
    // Rechazamos la promesa devolviendo el error formateado
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;