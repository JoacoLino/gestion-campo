import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // <--- 1. IMPORTAR ESTO
import api from '../api/axios_config';
import './gestion_lotes.css';

const GestionLotes = () => {
  const { campo_id } = useParams();
  const navigate = useNavigate(); // <--- 2. INICIALIZAR ESTO (Es el motor de navegación)
  
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [nuevoLote, setNuevoLote] = useState({ name: '', superficie: '', cultivo: '' });

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

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
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

  const handleEliminar = async (e, id) => {
    e.stopPropagation(); // <--- 3. IMPORTANTE: Evita que al borrar también te lleve a la otra página
    if (!window.confirm("¿Seguro que querés borrar este lote?")) return;
    try {
      await api.delete(`/lotes/${id}`, { withCredentials: true });
      setLotes(lotes.filter(l => l.id !== id));
    } catch (error) {
      console.error("Error eliminando:", error);
    }
  };

  const handleExportar = async () => {
    try {
      const response = await api.get(`/reportes/lotes/${campo_id}`, { withCredentials: true, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a'); link.href = url;
      link.setAttribute('download', `Reporte_Lotes.csv`);
      document.body.appendChild(link); link.click(); link.remove();
    } catch (error) { console.error(error); alert("Error al exportar"); }
  };

  if (loading) return <div>Cargando mapa del campo...</div>;

  return (
    <div className="lotes-container">
      <div className="header-actions">
        <h2>🗺️ Lotes / Potreros</h2>
        <div className="actions-group">
            <button className="btn-excel" onClick={handleExportar}>
              📄 Excel
            </button>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Nuevo Lote
            </button>
        </div>
      </div>

      <div className="lotes-grid">
        {lotes.map((lote) => (
          <div 
             key={lote.id} 
             className="lote-card" 
             /* 4. AQUÍ ESTÁ LA ACCIÓN DE NAVEGAR */
             onClick={() => navigate(`/dashboard/${campo_id}/animales?lote_id=${lote.id}`)}
             style={{ cursor: 'pointer' }}
             title="Ver animales en este lote"
          >
            <div className="lote-header">
                <h3>{lote.name}</h3>
                {/* Pasamos el evento 'e' para detener la propagación */}
                <button className="btn-delete-mini" onClick={(e) => handleEliminar(e, lote.id)}>×</button>
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
                <span style={{ fontWeight: 'bold', color: lote.cantidad_animales > 0 ? '#1565c0' : '#999' }}>
                    🐄 {lote.cantidad_animales} Animales
                </span>
            </div>
          </div>
        ))}
        
        {lotes.length === 0 && (
            <p className="empty-state">No hay lotes creados. ¡Creá el primero!</p>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nuevo Potrero 🌱</h3>
            <form onSubmit={handleCrear}>
                <input type="text" placeholder="Nombre (ej: La Loma)" required
                    value={nuevoLote.name}
                    onChange={e => setNuevoLote({...nuevoLote, name: e.target.value})}
                />
                <input type="number" placeholder="Superficie (Hectáreas)" required
                    value={nuevoLote.superficie}
                    onChange={e => setNuevoLote({...nuevoLote, superficie: e.target.value})}
                />
                <input type="text" placeholder="Cultivo/Recurso (Opcional)"
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