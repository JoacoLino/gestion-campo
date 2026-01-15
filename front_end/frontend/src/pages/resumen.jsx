import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // <--- Importante
// import api from '../api/axios_config'; 

const Resumen = () => {
  const { campo_id } = useParams(); // <--- Así sabemos qué datos buscar
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Aquí harías: api.get(`/dashboard/resumen/${campo_id}`)
    console.log(`Cargando resumen del campo ${campo_id}...`);
    
    // Simulación de datos por ahora
    setStats({
        totalAnimales: 150,
        tareasPendientes: 3,
        clima: "Soleado"
    });
  }, [campo_id]);

  return (
    <div className="resumen-container">
      <h2>Resumen General</h2>
      <p>Viendo datos del campo #{campo_id}</p>

      <div className="stats-grid" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div className="stat-card" style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <h3>🐄 Animales</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.totalAnimales || 0}</p>
        </div>
        
        <div className="stat-card" style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <h3>⚠️ Alertas</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'orange' }}>{stats?.tareasPendientes || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default Resumen;