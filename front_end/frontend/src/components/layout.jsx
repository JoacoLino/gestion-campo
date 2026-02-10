import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './layout.css';

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false); // Solo se usa en móvil
  const navigate = useNavigate();
  const location = useLocation();
  const { campo_id } = useParams(); 

  const isActive = (path) => location.pathname.includes(path) ? 'active' : '';

  const menuItems = [
    { name: 'Resumen', path: `/dashboard/${campo_id}`, icon: '📊' },
    { name: 'Lotes', path: `/dashboard/${campo_id}/lotes`, icon: '🗺️' },
    { name: 'Ganado', path: `/dashboard/${campo_id}/animales`, icon: '🐄' },
    { name: 'Sanidad', path: `/dashboard/${campo_id}/sanidad`, icon: '💉' },
    { name: 'Agenda', path: `/dashboard/${campo_id}/agenda`, icon: '📅' },
    { name: 'Insumos', path: `/dashboard/${campo_id}/insumos`, icon: '📦' },
  ];

  return (
    <div className="layout-wrapper">
      
      {/* 1. BOTÓN HAMBURGUESA (CSS lo oculta en PC) */}
      <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      {/* 2. SIDEBAR (El menú de siempre) */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>🌾 Mi Campo SaaS</h3>
          {/* Botón X solo visible en móvil */}
          <button className="close-menu" onClick={() => setIsOpen(false)}>×</button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div 
              key={item.name} 
              className={`nav-item ${isActive(item.path)}`}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false); // Cierra menú al tocar (móvil)
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

      {/* 3. TU CONTENIDO ORIGINAL (Resumen) */}
      {/* En PC, esto simplemente se pinta a la derecha del menú */}
      <main className="layout-content">
        {/* Sombra oscura solo en móvil */}
        {isOpen && <div className="overlay" onClick={() => setIsOpen(false)}></div>}
        
        {children}
      </main>
    </div>
  );
};

export default Layout;