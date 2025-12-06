import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axios_config';  // O la ruta correcta según tu estructura


//import { authFetch } from './authFetch';

function Dashboard() {
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        //const res = await axios.get('http://localhost:8000/protecter_routers/dashboard', {withCredentials: true,}, navigate);
        const res = await api.get('/protecter_routers/dashboard', { withCredentials: true });

        setMensaje(res.data.mensaje);
      } catch (err) {
        console.error("Error accediendo al dashboard:", err);
        navigate('/');
      }
    };

    fetchDashboard();
  }, [navigate]);

  return (
    <div>
      {mensaje ? <h1>{mensaje}</h1> : <p>Cargando o sin autorización...</p>}
    </div>
  );
}

export default Dashboard;

