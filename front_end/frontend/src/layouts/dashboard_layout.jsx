import { Outlet, useNavigate, useParams, NavLink } from 'react-router-dom';
import api from '../api/axios_config';
import './dashboard_layout.css'; 

const DashboardLayout = () => {
  const navigate = useNavigate();
  // 1. CAPTURAMOS EL ID DE LA URL (ej: dashboard/5/...)
  const { campo_id } = useParams(); 

  const handleLogout = async () => {
    try {
        await api.post('/auth_routes/logout');
    } catch (e) {
        console.error(e);
    } finally {
        navigate('/');
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
           <h2>🌾 Mi Campo SaaS</h2>
           <p className="campo-badge">Campo ID: {campo_id}</p>
        </div>
        
        <nav className="sidebar-nav">
          {/* 2. USAMOS RUTAS DINÁMICAS 
             NavLink agrega la clase "active" automáticamente si estás en esa ruta
          */}
          <NavLink 
            to={`/dashboard/${campo_id}/resumen`}
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            📊 Resumen
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
          
          <div className="nav-separator"></div>
          
          <button onClick={() => navigate('/campo-selection')} className="nav-item back-btn">
            ⬅ Cambiar de Campo
          </button>
        </nav>
      </aside>
      
      <main className="main-content">
        <header className="topbar">
          <h3>Gestión del Establecimiento</h3>
          <button className="logout-btn-small" onClick={handleLogout}>Salir</button>
        </header>
        
        {/* 3. AQUÍ SE CARGARÁ "RESUMEN" O "GANADO" SEGÚN EL CLICK */}
        <div className="page-content">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;