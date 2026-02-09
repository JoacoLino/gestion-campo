import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Layout.css'; // Crearemos este CSS enseguida

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false); // Estado para abrir/cerrar menú
  const navigate = useNavigate();
  const location = useLocation();

  // Función para saber si el link está activo
  const isActive = (path) => location.pathname === path ? 'active' : '';

  // Menú de navegación
  const menuItems = [
    { name: 'Resumen', path: '/campo-selection', icon: '📊' },
    { name: 'Lotes', path: '/lotes', icon: '🗺️' },
    { name: 'Ganado', path: '/ganado', icon: '🐄' },
    { name: 'Sanidad', path: '/sanidad', icon: '💉' },
    { name: 'Agenda', path: '/agenda', icon: '📅' }, // Si ya la creaste
    { name: 'Insumos', path: '/insumos', icon: '📦' },
  ];

  return (
    <div className="layout-container">
      {/* BOTÓN HAMBURGUESA (Solo visible en móvil) */}
      <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      {/* SIDEBAR (Menú Lateral) */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>🌾 Mi Campo SaaS</h3>
          <button className="close-menu" onClick={() => setIsOpen(false)}>×</button>
        </div>
        
        <nav>
          {menuItems.map((item) => (
            <div 
              key={item.name} 
              className={`menu-item ${isActive(item.path)}`}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false); // Cerrar menú al hacer click en móvil
              }}
            >
              <span className="icon">{item.icon}</span>
              {item.name}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
            <button className="btn-logout" onClick={() => navigate('/')}>
                ← Salir
            </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL (Aquí se carga Resumen, Lotes, etc.) */}
      <main className="main-content">
        {children}
      </main>

      {/* OSCURECER FONDO CUANDO EL MENÚ ESTÁ ABIERTO EN MÓVIL */}
      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)}></div>}
    </div>
  );
};

export default Layout;