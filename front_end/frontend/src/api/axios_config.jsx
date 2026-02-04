import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true, // Necesario para enviar las cookies al backend
});

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log("URL del request con error:", originalRequest.url);
    // Si obtenemos 401 y aún no intentamos hacer refresh
    //if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/refresh-token')) {
    
    
    // CÓDIGO CORREGIDO:
    // Usamos simplemente 'login' para que sea más genérico, o la ruta exacta 'auth_routes/login'
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('login') && !originalRequest.url.includes('refresh-token')) {
    originalRequest._retry = true;
    //Ver bien el tema esta para que no quede intentando hacer miles de refresh tokens y buggue la pagina
      try {
        const res = await api.post('/auth_routes/refresh-token', {}, { withCredentials: true });
        
        console.log("Refresh-token exitoso");
        // Podés guardar el nuevo access token si querés usarlo localmente:
        //const newAccessToken = res.data.access_token;

        // Opcional: setearlo en headers para futuros requests si no usás cookies
        //api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return api(originalRequest); // Reintenta el request original
      } catch (refreshError) {
        console.error('Error al refrescar token', refreshError);
        // Podés redirigir al login si el refresh también falla
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default api;


