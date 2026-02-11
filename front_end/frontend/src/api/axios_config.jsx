import axios from 'axios';

// Detecta automáticamente si estás en localhost o en Vercel
const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true, // Importante para enviar/recibir cookies
});

// Interceptor de Respuesta (El guardián de los errores)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Detectamos si es un error 401 (No autorizado)
    if (error.response && error.response.status === 401) {
      
      // EVITAR BUCLE INFINITO:
      // Si la petición que falló YA ERA un intento de login o de refresh,
      // NO intentamos de nuevo. Nos rendimos y mandamos al login.
      if (originalRequest._retry || originalRequest.url.includes('/refresh-token') || originalRequest.url.includes('/login')) {
        console.warn("Sesión expirada definitivamente. Redirigiendo al login.");
        window.location.href = '/login'; // <--- Redirección forzada
        return Promise.reject(error);
      }

      // Si es la primera vez que falla, marcamos para no reintentar infinitamente
      originalRequest._retry = true;

      try {
        // Intentamos renovar el token silenciosamente
        await api.post('/auth_routes/refresh-token');
        
        // Si funcionó, reintentamos la petición original que había fallado
        return api(originalRequest);
        
      } catch (refreshError) {
        // Si el refresh también falla, adiós sesión.
        console.error("No se pudo renovar la sesión.");
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;