import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios_config';
import './resumen.css';
import Layout from '../components/layout'; // <--- IMPORTANTE: Usamos nuestro componente Wrapper

// Gráficos
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

const Resumen = () => {
  const { campo_id } = useParams();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    total_animales: 0,
    total_lotes: 0,
    total_eventos: 0,
    categorias: {},
    alertas: [],
    actividad_mensual: []
  });
  const [loading, setLoading] = useState(true);

  // Colores Gráfico
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Carga de Datos
  useEffect(() => {
    const fetchStats = async () => {
      try {
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

  // Clima
  const [clima, setClima] = useState({ temp: '--', code: 0, city: 'Cargando...' });

  useEffect(() => {
    const getWeatherIcon = (code) => {
        if (code === 0) return '☀️'; 
        if (code >= 1 && code <= 3) return '⛅';
        if (code >= 45 && code <= 48) return '🌫️';
        if (code >= 51 && code <= 67) return '🌧️';
        if (code >= 71 && code <= 77) return '❄️';
        if (code >= 95) return '⚡';
        return '🌡️';
    };

    const fetchClima = async (lat, lon) => {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
            const response = await fetch(url);
            const data = await response.json();
            
            setClima({
                temp: Math.round(data.current_weather.temperature),
                code: data.current_weather.weathercode,
                icon: getWeatherIcon(data.current_weather.weathercode),
                city: ' Campo Actual'
            });
        } catch (error) {
            console.error("Error clima:", error);
            setClima({ temp: '-', icon: '❓', city: 'Error clima' });
        }
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => fetchClima(position.coords.latitude, position.coords.longitude),
            () => fetchClima(-34.6037, -58.3816)
        );
    } else {
        fetchClima(-34.6037, -58.3816);
    }
  }, []);

  const handleDescargarReporte = async () => {
    try {
      const response = await api.get(`/reportes/stock/${campo_id}`, { 
        withCredentials: true,
        responseType: 'blob', 
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Stock_Campo_${campo_id}.csv`); 
      document.body.appendChild(link);
      link.click();
      link.remove(); 
    } catch (error) {
      alert("No se pudo generar el reporte.");
    }
  };

  const dataGrafico = Object.keys(stats.categorias).map((key) => ({
    name: key,
    value: stats.categorias[key]
  }));

  const dataBarras = stats.actividad_mensual || [];

  return (
    <Layout> {/* <--- EL LAYOUT ENVUELVE TODO, INCLUSO EL LOADING */}
      
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'80vh', color:'#666' }}>
            <h2>📊 Cargando Tablero...</h2>
        </div>
      ) : (
        <div className="resumen-container">
          
          {/* HEADER */}
          <div className="dashboard-header">
            <div>
              <h2>Tablero de Control</h2>
              <p className="subtitle">Visión general del establecimiento</p>
            </div>
            
            <div className="header-actions">
                <div className="weather-widget">
                    <span className="weather-icon">{clima.icon || '⏳'}</span>
                    <div className="weather-info">
                        <span className="temp">{clima.temp}°C</span>
                        <span className="city">{clima.city}</span>
                    </div>
                </div>

                <button onClick={handleDescargarReporte} className="btn-reporte" title="Descargar Excel">
                    📄 Exportar
                </button>
            </div>
          </div>

          {/* ALERTAS */}
          {stats.alertas && stats.alertas.length > 0 && (
            <div className="alertas-section">
              {stats.alertas.map((alerta, index) => (
                  <div 
                      key={index} 
                      className={`alerta-banner alerta-${alerta.tipo}`}
                      onClick={() => {
                          const mensaje = alerta.mensaje.toLowerCase();
                          if (mensaje.includes("sin lote")) navigate(`/dashboard/${campo_id}/animales?sin_lote=true`);
                          else if (mensaje.includes("peso")) navigate(`/dashboard/${campo_id}/animales`); 
                          else if (mensaje.includes("potreros")) navigate(`/dashboard/${campo_id}/lotes`);
                          else if (mensaje.includes("tareas")) navigate(`/dashboard/${campo_id}/agenda`);
                      }}
                      style={{ cursor: 'pointer' }}
                  >
                      <div className="alerta-content">
                          <span className="alerta-icon">
                              {alerta.tipo === 'danger' ? '⚠️' : alerta.tipo === 'warning' ? '⚡' : 'ℹ️'}
                          </span>
                          <span>{alerta.mensaje}</span>
                      </div>
                      <span className="alerta-arrow">→</span>
                  </div>
              ))}
            </div>
          )}

          {/* KPI CARDS */}
          <div className="kpi-grid">
            <div className="kpi-card card-blue" onClick={() => navigate(`/dashboard/${campo_id}/animales`)}>
                <h3>🐄 Stock Total</h3>
                <p className="kpi-number">{stats.total_animales}</p>
                <span className="kpi-label">Cabezas</span>
            </div>
            
            <div className="kpi-card card-green" onClick={() => navigate(`/dashboard/${campo_id}/lotes`)}>
                <h3>🗺️ Lotes</h3>
                <p className="kpi-number">{stats.total_lotes}</p>
                <span className="kpi-label">Potreros definidos</span>
            </div>

            <div className="kpi-card card-orange" onClick={() => navigate(`/dashboard/${campo_id}/sanidad`)}>
                <h3>💉 Sanidad</h3>
                <p className="kpi-number">{stats.total_eventos}</p>
                <span className="kpi-label">Eventos este año</span>
            </div>
          </div>

          {/* GRÁFICOS */}
          <div className="charts-grid">
            
            {/* GRÁFICO DE DONA */}
            <div className="chart-card">
                <h3>Distribución del Rodeo</h3>
                {dataGrafico.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={dataGrafico}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {dataGrafico.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="no-data">Cargá animales para ver el gráfico.</p>
                )}
            </div>

            {/* BARRAS */}
            <div className="chart-card">
                <h3>Actividad Sanitaria (2025)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dataBarras}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 12}} />
                        <YAxis allowDecimals={false} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="eventos" fill="#ff9800" radius={[4, 4, 0, 0]} name="Eventos" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Resumen;