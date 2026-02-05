import axios from 'axios';

// Lógica inteligente:
// Si existe una variable de entorno (en Vercel), usa esa.
// Si no, usa localhost (para cuando programas en tu casa).
//const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const baseURL = "https://gestion-campo-5scg.onrender.com";

const instance = axios.create({
  baseURL: baseURL, 
  withCredentials: true, // Importante para las cookies
});

// Interceptor para errores 401 (Refresh Token) - Mantenlo como lo tenías
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Intentamos renovar token
        await instance.post('/auth_routes/refresh-token');
        return instance(originalRequest);
      } catch (refreshError) {
        // Si falla, al login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;