import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axios_config';

import './register.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL = 'http://localhost:8000/auth_routes/'; // Cambiar por tu URL real

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post(`${API_URL}registro`, {
        name,
        email,
        password
      });
      navigate('/');
    } catch (err) {
      setError('Error al registrar. ¿El email ya existe?');
    }
  };

  return (
    <div className='register-container'>
        <div className='register-box'>
            <h2>Registrarse</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleRegister}>
                <div>
                <label>Nombre:</label>
                <input type="text" value={name}
                    onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                <label>Email:</label>
                <input type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                <label>Contraseña:</label>
                <input type="password" value={password}
                    onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit">Crear cuenta</button>
                <div className='register-link'>
                    ¿Ya tenés cuenta?{" "}
                    <button onClick={() => navigate("/")}>Iniciar sesión</button>
                </div>
            </form>
        </div>
    </div>
  );
}

export default Register;
