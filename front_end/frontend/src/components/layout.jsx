import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './layout.css';
import api from '../api/axios_config';

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { campo_id } = useParams(); 

  const handleLogout = async () => {
    try {
        await api.post('/auth_routes/logout');
    } catch (e) {
        console.error("Error al cerrar sesión", e);
    } finally {
        navigate('/');
    }
  };

  // --- LÓGICA DE ACTIVACIÓN CORRECTA ---
  const isActive = (path) => {
    const currentPath = location.pathname;

    // Caso 1: Resumen (Es la raíz del dashboard o explícitamente /resumen)
    if (path === `/dashboard/${campo_id}`) {
        // Se activa si es EXACTAMENTE la base O si termina en /resumen
        return currentPath === path || currentPath === `${path}/resumen` ? 'active' : '';
    }

    // Caso 2: El resto (Lotes, Ganado, etc.)
    // Se activa si la URL actual "empieza con" el path del botón
    return currentPath.startsWith(path) ? 'active' : '';
  };

  const menuItems = [
    // Apuntamos a la base, pero la lógica de arriba lo maneja
    { name: 'Resumen', path: `/dashboard/${campo_id}`, icon: '📊' },
    { name: 'Lotes', path: `/dashboard/${campo_id}/lotes`, icon: '🗺️' },
    { name: 'Ganado', path: `/dashboard/${campo_id}/animales`, icon: '🐄' },
    { name: 'Sanidad', path: `/dashboard/${campo_id}/sanidad`, icon: '💉' },
    { name: 'Agenda', path: `/dashboard/${campo_id}/agenda`, icon: '📅' },
    { name: 'Insumos', path: `/dashboard/${campo_id}/insumos`, icon: '📦' },

    { name: 'Personal', path: `/dashboard/${campo_id}/personal`, icon: '👷‍♂️' },
    {/*{ name: 'Suscripcion', path: `/dashboard/${campo_id}/suscripcion`, icon: '⭐' },*/},
  ];

  return (
    <div className="layout-wrapper">
      <header className="mobile-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="mobile-toggle" onClick={() => setIsOpen(true)}>☰</button>
          <span className="mobile-logo">🌾 Mi Campo</span>
        </div>
        
        {/* 👇 NUEVO BOTÓN DE SALIR PARA MÓVIL 👇 */}
        <button 
          onClick={handleLogout} 
          style={{ 
            marginLeft: 'auto', 
            padding: '6px 12px', 
            border: '1px solid #e0e0e0', 
            borderRadius: '6px', 
            background: 'white', 
            color: '#ef4444', 
            fontWeight: '600', 
            cursor: 'pointer' 
          }}
        >
          Salir
        </button>
      </header>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>🌾 Mi Campo SaaS</h3>
          <button className="close-menu" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div 
              key={item.name} 
              className={`nav-item ${isActive(item.path)}`}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false); 
              }}
            >
              <span className="icon">{item.icon}</span>
              {item.name}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
            <button className="btn-back" onClick={() => navigate('/campo-selection')}>
                ← Cambiar Campo
            </button>
        </div>
      </aside>

      <main className="layout-content">
        <div className={`overlay ${isOpen ? 'show' : ''}`} onClick={() => setIsOpen(false)}></div>
        {children}
      </main>
    </div>
  );
};

export default Layout;