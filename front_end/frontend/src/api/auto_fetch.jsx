/*import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const authFetch = async (endpoint, options = {}, navigate) => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const res = await axios({
      url: `${API_URL}${endpoint}`,
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
      },
      data: options.data || null,
    });
    return res;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      // El token puede estar expirado → intentar refrescar
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const refreshRes = await axios.post(`${API_URL}/auth_routers/refresh-token`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = refreshRes.data.access_token;
        localStorage.setItem('access_token', newAccessToken);

        // Volver a intentar la petición original
        const retryRes = await axios({
          url: `${API_URL}${endpoint}`,
          method: options.method || 'GET',
          headers: {
            'Authorization': `Bearer ${newAccessToken}`,
            ...options.headers,
          },
          data: options.data || null,
        });
        return retryRes;
      } catch (refreshErr) {
        // No se pudo refrescar → limpiar y redirigir
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (navigate) navigate('/login');
        throw refreshErr;
      }
    }
    throw err;
  }
};*/


export const authFetch = async (url, options = {}, navigate) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    navigate('/login');
    throw new Error('No autorizado: No hay token');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Token inválido o expirado
    navigate('/login');
    throw new Error('No autorizado');
  }

  if (!response.ok) {
    throw new Error('Error en la petición');
  }

  return response.json();
};

