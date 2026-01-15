import { useState, useEffect } from 'react'; // <--- Agregamos useEffect
import { useNavigate } from 'react-router-dom';
import { loginUsuario } from '../api/auth';
import api from '../api/axios_config'; // Importar api para hacer logout opcional
import './login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // --- NUEVO: LIMPIEZA PREVENTIVA ---
  // Cuando este componente se monta (carga), opcionalmente podemos borrar datos viejos
  useEffect(() => {
    // Si usaras Context o LocalStorage para guardar el nombre del usuario,
    // aquí es donde lo borrarías para evitar el "efecto fantasma".
    // localStorage.removeItem('user_data'); 
    
    // Opcional: Si quieres ser ultra estricto, podrías forzar el logout del backend aquí mismo
    // para que nadie pueda estar en la pantalla de login con una sesión activa "por detrás".
    const limpiarSesionAnterior = async () => {
         try {
             // Intentamos limpiar cookies viejas por si acaso
             await api.post('/auth_routes/logout'); 
         } catch (e) {
             // Si falla no importa, significa que no había sesión o ya expiró
         }
    };
    
    // Descomenta la siguiente linea si querés que al entrar al login se cierre la sesión anterior automáticamente
    // limpiarSesionAnterior(); 

  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Al hacer login, el backend enviará Set-Cookie
      // El navegador detectará que el nombre es el mismo y SOBREESCRIBIRÁ la vieja.
      await loginUsuario(email, password);
      
      console.log("Login exitoso, cambio de usuario realizado");
      
      // Forzamos la navegación
      navigate('/campo-selection');
      
    } catch (err) {
      console.error("Error en login:", err);
      if (err.response && err.response.status === 401) {
        setError('Email o contraseña incorrecta');
      } else {
        setError('Error del servidor o de red');
      }
    }
  };

  return (
    <div className="login-container">
       {/* ... resto de tu HTML igual ... */}
       <div className="login-box">
        <h2>Iniciar sesión</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
            {/* ... inputs ... */}
             <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Entrar</button>
        </form>
         <div className="register-link">
          ¿No tenés cuenta?{" "}
          <button onClick={() => navigate("/register")}>Registrate</button>
        </div>
      </div>
    </div>
  );
}

export default Login;