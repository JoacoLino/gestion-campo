import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios_config';
import './resumen.css'; // Asegúrate de crear este archivo de estilos o usar el inline

const Resumen = () => {
  const { campo_id } = useParams();
  const [stats, setStats] = useState({
    total_animales: 0,
    total_lotes: 0,
    total_eventos: 0,
    categorias: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Llamamos al nuevo endpoint
        const response = await api.get(`/dashboard-data/${campo_id}/stats`, { withCredentials: true });
        setStats(response.data);
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [campo_id]);

  if (loading) return <div>Calculando índices productivos... 📊</div>;

  return (
    <div className="resumen-container">
      <h2>Tablero de Control</h2>
      
      {/* TARJETAS PRINCIPALES */}
      <div className="kpi-grid">
        <div className="kpi-card card-blue">
            <h3>🐄 Stock Total</h3>
            <p className="kpi-number">{stats.total_animales}</p>
            <span className="kpi-label">Cabezas</span>
        </div>
        
        <div className="kpi-card card-green">
            <h3>🗺️ Lotes</h3>
            <p className="kpi-number">{stats.total_lotes}</p>
            <span className="kpi-label">Potreros definidos</span>
        </div>

        <div className="kpi-card card-orange">
            <h3>💉 Sanidad</h3>
            <p className="kpi-number">{stats.total_eventos}</p>
            <span className="kpi-label">Eventos registrados</span>
        </div>
      </div>

      {/* SECCIÓN DE DETALLES */}
      <div className="details-section">
        <h3>Distribución del Rodeo</h3>
        <div className="categorias-list">
            {Object.keys(stats.categorias).length > 0 ? (
                Object.entries(stats.categorias).map(([cat, count]) => (
                    <div key={cat} className="cat-item">
                        <span className="cat-name">{cat}</span>
                        <div className="progress-bar-bg">
                            {/* Calculamos el % para el ancho de la barra */}
                            <div 
                                className="progress-bar-fill" 
                                style={{ width: `${(count / stats.total_animales) * 100}%` }}
                            ></div>
                        </div>
                        <span className="cat-count">{count}</span>
                    </div>
                ))
            ) : (
                <p>No hay animales categorizados.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default Resumen;