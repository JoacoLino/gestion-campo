import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios_config';
import './gestion_lotes.css'; // Ahora crearemos este CSS

const GestionLotes = () => {
  const { campo_id } = useParams();
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Modal
  const [showModal, setShowModal] = useState(false);
  const [nuevoLote, setNuevoLote] = useState({ name: '', superficie: '', cultivo: '' });

  // 1. Cargar Lotes al iniciar
  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await api.get(`/lotes/${campo_id}/`, { withCredentials: true });
        setLotes(response.data);
      } catch (error) {
        console.error("Error cargando lotes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLotes();
  }, [campo_id]);

  // 2. Crear Lote
  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      // Convertimos superficie a float
      const payload = {
        ...nuevoLote,
        superficie: parseFloat(nuevoLote.superficie) || 0
      };

      const response = await api.post(`/lotes/${campo_id}/`, payload, { withCredentials: true });
      
      setLotes([...lotes, response.data]);
      setShowModal(false);
      setNuevoLote({ name: '', superficie: '', cultivo: '' });
      
    } catch (error) {
      console.error("Error creando lote:", error);
      alert("Error al crear el lote");
    }
  };

  // 3. Eliminar Lote
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que querés borrar este lote?")) return;
    try {
      await api.delete(`/lotes/${id}`, { withCredentials: true });
      setLotes(lotes.filter(l => l.id !== id));
    } catch (error) {
      console.error("Error eliminando:", error);
    }
  };

  if (loading) return <div>Cargando mapa del campo...</div>;

  return (
    <div className="lotes-container">
      <div className="header-actions">
        <h2>🗺️ Lotes / Potreros</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Nuevo Lote
        </button>
      </div>

      <div className="lotes-grid">
        {lotes.map((lote) => (
          <div key={lote.id} className="lote-card" onClick={() => alert(`//Aca proximamente agregar la ruta para que lo lleve a sus animales del respectivo lote//
          Aquí podrías ir a ver los animales del lote: ${lote.name}`)} style={{ cursor: 'pointer' }}>
            <div className="lote-header">
                <h3>{lote.name}</h3>
                <button className="btn-delete-mini" onClick={() => handleEliminar(lote.id)}>×</button>
            </div>
            <div className="lote-body">
                <div className="dato">
                    <span className="label">Superficie:</span>
                    <span className="valor">{lote.superficie} Has</span>
                </div>
                <div className="dato">
                    <span className="label">Recurso:</span>
                    <span className="valor">{lote.cultivo || "Campo Natural"}</span>
                </div>
            </div>
            <div className="lote-footer">
                {/* AHORA: Usamos el dato real */}
                <span style={{ fontWeight: 'bold', color: lote.cantidad_animales > 0 ? '#2e7d32' : '#999' }}>
                    🐄 {lote.cantidad_animales} Animales
                </span>
                
            </div>
          </div>
        ))}
        
        {lotes.length === 0 && (
            <p className="empty-state">No hay lotes creados. ¡Creá el primero!</p>
        )}
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nuevo Potrero 🌱</h3>
            <form onSubmit={handleCrear}>
                <input 
                    type="text" placeholder="Nombre (ej: La Loma)" required
                    value={nuevoLote.name}
                    onChange={e => setNuevoLote({...nuevoLote, name: e.target.value})}
                />
                <input 
                    type="number" placeholder="Superficie (Hectáreas)" required
                    value={nuevoLote.superficie}
                    onChange={e => setNuevoLote({...nuevoLote, superficie: e.target.value})}
                />
                <input 
                    type="text" placeholder="Cultivo/Recurso (Opcional)"
                    value={nuevoLote.cultivo}
                    onChange={e => setNuevoLote({...nuevoLote, cultivo: e.target.value})}
                />
                <div className="modal-actions">
                    <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
                    <button type="submit" className="btn-confirm">Guardar</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionLotes;