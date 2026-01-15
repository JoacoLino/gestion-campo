import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios_config'; 
import './campo_selection.css'; 

const CampoSelection = () => {
  const [campos, setCampos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- ESTADOS PARA EL MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [nuevoCampo, setNuevoCampo] = useState({ name: '', location: '' });
  
  const navigate = useNavigate();

  // 1. Cargar campos al inicio
  useEffect(() => {
    const fetchCampos = async () => {
      try {
        const response = await api.get('/campos/mis_campos', { withCredentials: true });
        setCampos(response.data);
      } catch (error) {
        console.error("Error al cargar campos:", error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchCampos();
  }, [navigate]);

  // 2. Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await api.post('/auth_routes/logout');
    } catch (error) {
      console.error("Error logout", error);
    } finally {
      navigate('/');
    }
  };

  // 3. --- FUNCIÓN PARA CREAR CAMPO ---
  const handleCrearCampo = async (e) => {
    e.preventDefault(); // Evitar recarga del form
    if (!nuevoCampo.name) return alert("El nombre es obligatorio");

    try {
      // Llamada al Backend (Tu endpoint POST /campos/)
      const response = await api.post('/campos/', nuevoCampo, { withCredentials: true });
      
      // Actualizamos la lista visualmente sin recargar la página
      setCampos([...campos, response.data]);
      
      // Cerramos modal y limpiamos formulario
      setShowModal(false);
      setNuevoCampo({ name: '', location: '' });
      
    } catch (error) {
      console.error("Error al crear campo:", error);
      alert("Hubo un error al crear el campo.");
    }
  };

  const handleEliminar = async (e, id, nombre) => {
    e.stopPropagation(); // <--- TRUCO: Evita entrar al dashboard al hacer click
    
    // Confirmación para evitar accidentes
    if (!window.confirm(`¿Estás seguro de que querés eliminar el campo "${nombre}"?`)) {
      return;
    }

    try {
      await api.delete(`/campos/${id}`, { withCredentials: true });
      
      // Actualizamos la lista filtrando el que acabamos de borrar
      setCampos(campos.filter(c => c.id !== id));
      
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar el campo.");
    }
  };

  if (loading) return <div className="campo-selection-page"><h2>Cargando...</h2></div>;

  return (
    <div className="campo-selection-page">
      
      <button className="logout-btn" onClick={handleLogout}>
        Cerrar Sesión 🚪
      </button>

      <div className="selection-content">
        <h1>Mis Establecimientos</h1>
        <p>Seleccioná el campo que querés gestionar hoy</p>

        <div className="campos-grid">
          {/* Lista de Campos */}
          {campos.map((campo) => (
            <div 
              key={campo.id} 
              className="campo-card"
              onClick={() => navigate(`/dashboard/${campo.id}/resumen`)}
            >
                {/* --- BOTÓN DE ELIMINAR --- */}
                <button 
                    className="delete-btn" 
                    onClick={(e) => handleEliminar(e, campo.id, campo.name)}
                    title="Eliminar campo"
                >
                    🗑️
                </button>
              <div className="card-top">
                <div className="card-icon">🏡</div>
              </div>
              <div className="card-bottom">
                <h3>{campo.name}</h3>
                <span>📍 {campo.location || 'Sin ubicación'}</span>
              </div>
            </div>
          ))}

          {/* Botón + (Abre el modal) */}
          <div className="add-card" onClick={() => setShowModal(true)}>
            <div className="add-icon">+</div>
            <span>Crear Nuevo Campo</span>
          </div>
        </div>
      </div>

      {/* --- EL MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Nuevo Campo 🌱</h2>
            <form onSubmit={handleCrearCampo} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <input 
                    type="text" 
                    placeholder="Nombre del Establecimiento" 
                    value={nuevoCampo.name}
                    onChange={(e) => setNuevoCampo({...nuevoCampo, name: e.target.value})}
                    autoFocus
                />
                
                <input 
                    type="text" 
                    placeholder="Ubicación (Opcional)" 
                    value={nuevoCampo.location}
                    onChange={(e) => setNuevoCampo({...nuevoCampo, location: e.target.value})}
                />

                <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-confirm">
                        Guardar
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CampoSelection;  