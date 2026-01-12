import { Outlet, useNavigate } from 'react-router-dom';
import './dashboard_layout.css'; // Tu CSS para grid/flex

const DashboardLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpiar cookies/tokens
    // navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h1>Mi Campo SaaS</h1>
        <nav>
          <button onClick={() => navigate('/dashboard')}>Resumen</button>
          <button onClick={() => navigate('/dashboard/animales')}>Animales</button>
          <button onClick={() => navigate('/dashboard/sanidad')}>Sanidad</button>
        </nav>
      </aside>
      
      <main className="main-content">
        <header className="topbar">
          <h2>Bienvenido, Usuario</h2>
          <button onClick={handleLogout}>Salir</button>
        </header>
        
        {/* Aquí se renderizarán tus componentes específicos */}
        <div className="page-content">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;