import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios_config';
import './resumen.css';

// --- IMPORTAMOS LOS GRÁFICOS ---
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Resumen = () => {
  const { campo_id } = useParams();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    total_animales: 0,
    total_lotes: 0,
    total_eventos: 0,
    categorias: {},
    alertas: []
  });
  const [loading, setLoading] = useState(true);

  // Colores para el gráfico (puedes agregar más si tienes muchas categorías)
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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


  // --- NUEVO ESTADO PARA CLIMA ---
  const [clima, setClima] = useState({ temp: '--', code: 0, city: 'Cargando...' });

  // --- EFECTO PARA OBTENER EL CLIMA REAL ---
  useEffect(() => {
    // 1. Función para traducir códigos WMO a Iconos
    const getWeatherIcon = (code) => {
        if (code === 0) return '☀️'; // Despejado
        if (code >= 1 && code <= 3) return '⛅'; // Nublado
        if (code >= 45 && code <= 48) return '🌫️'; // Niebla
        if (code >= 51 && code <= 67) return '🌧️'; // Lluvia
        if (code >= 71 && code <= 77) return '❄️'; // Nieve
        if (code >= 95) return '⚡'; // Tormenta
        return '🌡️';
    };

    // 2. Obtener Ubicación y llamar a API
    const fetchClima = async (lat, lon) => {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
            const response = await fetch(url);
            const data = await response.json();
            
            setClima({
                temp: Math.round(data.current_weather.temperature),
                code: data.current_weather.weathercode,
                icon: getWeatherIcon(data.current_weather.weathercode),
                city: 'Campo Actual' // La API free no devuelve nombre de ciudad, pero sabemos que es tu ubicación
            });
        } catch (error) {
            console.error("Error clima:", error);
            setClima({ temp: '-', icon: '❓', city: 'Error clima' });
        }
    };

    // 3. Pedir permiso al navegador
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchClima(position.coords.latitude, position.coords.longitude);
            },
            () => {
                // Si el usuario bloquea la ubicación, usamos Buenos Aires por defecto
                fetchClima(-34.6037, -58.3816); 
            }
        );
    } else {
        fetchClima(-34.6037, -58.3816); // Fallback
    }
  }, []);

  const handleDescargarReporte = async () => {
    try {
      const response = await api.get(`/reportes/stock/${campo_id}`, { 
        withCredentials: true,
        responseType: 'blob', // Importante: Indica que esperamos un archivo binario
      });
      
      // Truco de Javascript para forzar la descarga del archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // Intentamos sacar el nombre del archivo, o ponemos uno genérico
      link.setAttribute('download', `Stock_Campo_${campo_id}.csv`); 
      document.body.appendChild(link);
      link.click();
      link.remove(); // Limpieza
      
    } catch (error) {
      console.error("Error descargando:", error);
      alert("No se pudo generar el reporte.");
    }
  };

  // Preparamos los datos para Recharts
  // Convertimos el objeto {"Vaca": 10, "Toro": 2} a un array [{name: "Vaca", value: 10}, ...]
  const dataGrafico = Object.keys(stats.categorias).map((key) => ({
    name: key,
    value: stats.categorias[key]
  }));

  if (loading) return <div className="loading-screen">Calculando índices productivos... 📊</div>;

  return (
    <div className="resumen-container">
      
      {/* HEADER MEJORADO CON BOTÓN */}
      <div className="dashboard-header">
        <div>
          <h2>Tablero de Control</h2>
          <p className="subtitle">Visión general del establecimiento</p>
        </div>
        
        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
            {/* Widget Clima REAL */}
            <div className="weather-widget">
                <span className="weather-icon">{clima.icon || '⏳'}</span>
                <div className="weather-info">
                    <span className="temp">{clima.temp}°C</span>
                    <span className="city">{clima.city}</span>
                </div>
            </div>

            {/* --- BOTÓN DE REPORTE --- */}
            <button 
                onClick={handleDescargarReporte}
                className="btn-reporte"
                title="Descargar Excel"
            >
                📄 Exportar
            </button>
        </div>
      </div>

      {/* SECCIÓN DE ALERTAS CLICKEABLES */}
      {stats.alertas && stats.alertas.length > 0 && (
        <div className="alertas-section">
          {stats.alertas.map((alerta, index) => (
              <div 
                  key={index} 
                  className={`alerta-banner alerta-${alerta.tipo}`}
                  onClick={() => {
                      const mensaje = alerta.mensaje.toLowerCase();
                      
                      // Lógica inteligente de navegación
                      if (mensaje.includes("sin lote")) {
                          navigate(`/dashboard/${campo_id}/animales?sin_lote=true`);
                      } 
                      else if (mensaje.includes("peso")) {
                          navigate(`/dashboard/${campo_id}/animales`); 
                          // En el futuro podrías agregar ?sin_peso=true
                      }
                      else if (mensaje.includes("potreros") || mensaje.includes("vacíos")) {
                          navigate(`/dashboard/${campo_id}/lotes`);
                      }
                      else if (mensaje.includes("tareas") || mensaje.includes("atrasadas")) {
                          navigate(`/dashboard/${campo_id}/agenda`);
                      }
                  }}
                  title="Click para solucionar"
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
            <span className="kpi-label">Eventos registrados</span>
        </div>
      </div>

      {/* SECCIÓN DE GRÁFICOS */}
      <div className="charts-grid">
        {/* GRÁFICO DE DONA */}
        <div className="chart-card">
            <h3>Distribución del Rodeo</h3>
            {dataGrafico.length > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={dataGrafico}
                                cx="50%"
                                cy="50%"
                                innerRadius={60} // Esto hace que sea una DONA en vez de una torta
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
                </div>
            ) : (
                <p className="no-data">No hay datos suficientes para graficar.</p>
            )}
        </div>

        {/* PODRÍAMOS AGREGAR OTRO GRÁFICO AQUÍ EN EL FUTURO (EJ: EVOLUCIÓN DE PESO) */}
        <div className="chart-card info-card">
            <h3>💡 Tips de Gestión</h3>
            <ul className="tips-list">
                <li>Mantén actualizada la sanidad para evitar pérdidas.</li>
                <li>Revisa los lotes vacíos para optimizar el pastoreo.</li>
                <li>Registra los pesos mensualmente.</li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Resumen;