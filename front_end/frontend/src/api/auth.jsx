import axios from 'axios';
import qs from 'qs';
import api from '../api/axios_config';

const API_URL = 'http://localhost:8000/auth_routes/'; // Cambiar por tu URL real

export async function loginUsuario(email, password) {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await api.post(
    `${API_URL}login`,  // Asegurate de que sea tu backend real
    formData,
    {
      withCredentials: true,  // ✅ Esto es lo importante para que las cookies se envíen
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data;
}

/*
export const renovarToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) throw new Error('No hay refresh token');

  const res = await axios.post('http://localhost:8000/auth_routes/refresh-token', {
    refresh_token: refreshToken
  });

  localStorage.setItem('access_token', res.data.access_token);
  localStorage.setItem('refresh_token', res.data.refresh_token);

  return res.data.access_token;
};*/

