import { Outlet, useNavigate, useParams, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios_config';
import './dashboard_layout.css'; 

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { campo_id } = useParams(); 
  
  const [campoInfo, setCampoInfo] = useState(null);
  // Eliminamos el estado de loading global que bloqueaba todo
  // const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchCampoInfo = async () => {
      try {
        // No bloqueamos la UI, solo pedimos los datos
        const response = await api.get(`/campos/${campo_id}`, { withCredentials: true });
        setCampoInfo(response.data);
      } catch (error) {
        console.error("Acceso denegado", error);
        navigate('/campo-selection'); 
      }
    };

    if (campo_id) {
        fetchCampoInfo();
    }
  }, [campo_id, navigate]);

  const handleLogout = async () => {
    try {
        await api.post('/auth_routes/logout');
    } catch (e) {
        console.error(e);
    } finally {
        navigate('/');
    }
  };

  // --- BORRAMOS EL IF (LOADING) RETURN ... ---
  // Así la estructura siempre se mantiene firme

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
           <h2>🌾 Mi Campo SaaS</h2>
           
           <div className="campo-info-box">
             {/* Aquí mostramos "Cargando" solo en el texto, sin parpadeos */}
             <h3 style={{fontSize: '1.1rem', margin: '10px 0 5px', color: '#2e7d32'}}>
                {campoInfo ? campoInfo.name : "Cargando..."}
             </h3>
             <p className="campo-badge">
                📍 {campoInfo ? campoInfo.location : "..."}
             </p>
           </div>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink 
            to={`/dashboard/${campo_id}/resumen`}
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            📊 Resumen
          </NavLink>

          <NavLink 
            to={`/dashboard/${campo_id}/lotes`}
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            🗺️ Lotes
          </NavLink>

          <NavLink 
            to={`/dashboard/${campo_id}/animales`}
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            🐄 Ganado
          </NavLink>

          <NavLink 
            to={`/dashboard/${campo_id}/sanidad`}
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            💉 Sanidad
          </NavLink>

          <NavLink 
            to={`/dashboard/${campo_id}/agenda`}
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            📅 Agenda
          </NavLink>


          
          <div className="nav-separator"></div>
          
          <button onClick={() => navigate('/campo-selection')} className="nav-item back-btn">
            ⬅ Cambiar de Campo
          </button>
        </nav>
      </aside>
      
      <main className="main-content">
        <header className="topbar">
            <h3>Gestión: {campoInfo?.name || "..."}</h3>
            <button className="logout-btn-small" onClick={handleLogout}>Salir</button>
        </header>
        
        <div className="page-content">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;