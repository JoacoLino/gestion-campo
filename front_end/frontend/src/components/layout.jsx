import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './Layout.css'; // Importamos su CSS específico

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false); // Estado para abrir/cerrar en móvil
  const navigate = useNavigate();
  const location = useLocation();
  
  // Capturamos el ID del campo para armar los links correctamente
  const { campo_id } = useParams(); 

  // Función para marcar el botón activo
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
    <div className="layout-container">
      
      {/* BOTÓN HAMBURGUESA (Solo visible en Móvil) */}
      <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      {/* SIDEBAR (Menú Lateral) */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>🌾 Mi Campo SaaS</h3>
          <button className="close-menu" onClick={() => setIsOpen(false)}>×</button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div 
              key={item.name} 
              className={`nav-item ${isActive(item.path)}`}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false); // Cerrar menú al hacer clic (móvil)
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

      {/* CONTENIDO PRINCIPAL (Aquí se inyectará tu Resumen) */}
      <main className="main-content">
        {/* Fondo oscuro para cuando el menú está abierto en móvil */}
        {isOpen && <div className="overlay" onClick={() => setIsOpen(false)}></div>}
        
        {children}
      </main>
    </div>
  );
};

export default Layout;