// src/auth.jsx
import api from '../api/axios_config';


export async function loginUsuario(email, password) {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  // ✅ CORRECTO: Usamos solo la ruta relativa.
  // La 'api' ya sabe que tiene que ir a Render.
  const response = await api.post(
    '/auth_routes/login', 
    formData,
    {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data;
}