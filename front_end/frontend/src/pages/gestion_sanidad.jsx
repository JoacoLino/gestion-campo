import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios_config';
import './gestion_sanidad.css';

const GestionSanidad = () => {
  const { campo_id } = useParams();
  
  const [eventos, setEventos] = useState([]);
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  
  // Estado del formulario
  const [nuevoEvento, setNuevoEvento] = useState({
    fecha: new Date().toISOString().split('T')[0], 
    tipo: 'Vacunación',
    producto: '',
    notas: '',
    costo_total: '', // Iniciamos vacío para que el input no muestre 0 al escribir
    animal_id: '' 
  });

  // 1. CARGA DE DATOS
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Cargando datos de sanidad..."); // Debug
        
        // Cargamos eventos y animales en paralelo
        const [resEventos, resAnimales] = await Promise.all([
          api.get(`/sanidad/${campo_id}/`, { withCredentials: true }),
          api.get(`/animales/${campo_id}/`, { withCredentials: true })
        ]);

        console.log("Eventos encontrados:", resEventos.data); // Mira esto en la consola (F12)
        console.log("Animales encontrados:", resAnimales.data);

        setEventos(resEventos.data);
        setAnimales(resAnimales.data);
      } catch (error) {
        console.error("Error cargando sanidad:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (campo_id) fetchData();
  }, [campo_id]);

  // 2. GUARDAR
  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...nuevoEvento,
        costo_total: parseFloat(nuevoEvento.costo_total) || 0,
        animal_id: nuevoEvento.animal_id ? parseInt(nuevoEvento.animal_id) : null
      };

      const response = await api.post(`/sanidad/${campo_id}/`, payload, { withCredentials: true });
      
      setEventos([response.data, ...eventos]);
      setShowModal(false);
      
      // Reset form
      setNuevoEvento({ 
        fecha: new Date().toISOString().split('T')[0], 
        tipo: 'Vacunación', producto: '', notas: '', costo_total: '', animal_id: '' 
      });

    } catch (error) {
      console.error("Error creando evento:", error);
      alert("No se pudo guardar el evento.");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Borrar este registro?")) return;
    try {
      await api.delete(`/sanidad/${id}`, { withCredentials: true });
      setEventos(eventos.filter(e => e.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // Helper seguro para fechas (evita que explote si la fecha viene mal)
  const formatDate = (fechaString) => {
    if (!fechaString) return { day: '--', month: '--' };
    const partes = fechaString.split('-');
    if (partes.length < 3) return { day: '??', month: '??' };
    return { day: partes[2], month: `/ ${partes[1]}` };
  };

  // FUNCIÓN DE DESCARGA
  const handleExportar = async () => {
    try {
      const response = await api.get(`/reportes/sanidad/${campo_id}`, { withCredentials: true, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a'); link.href = url;
      link.setAttribute('download', `Historial_Sanitario.csv`);
      document.body.appendChild(link); link.click(); link.remove();
    } catch (error) { console.error(error); alert("Error al exportar"); }
  };

  if (loading) return <div>Cargando libreta sanitaria... 💉</div>;

  return (
    <div className="sanidad-container">
      <div className="header-actions">
  <h2>💉 Registro Sanitario</h2>
  
      {/* NUEVO CONTENEDOR AGRUPADOR */}
        <div className="actions-group">
            <button className="btn-excel" onClick={handleExportar}>
              📄 Excel
            </button>
            
            <button className="btn-add-sanidad" onClick={() => setShowModal(true)}>
              + Registrar Evento
            </button>
        </div>
      </div>
      <div className="timeline-sanidad">
        {eventos.map((ev) => {
          const { day, month } = formatDate(ev.fecha); // Usamos el helper seguro
          return (
            <div key={ev.id} className="evento-card">
              <div className="evento-date">
                <span className="day">{day}</span>
                <span className="month">{month}</span>
              </div>
              
              <div className="evento-info">
                <div className="evento-header">
                  <span className={`badge-tipo ${ev.tipo.toLowerCase()}`}>{ev.tipo}</span>
                  <strong className="producto">{ev.producto}</strong>
                  {/* Mostramos el costo si existe */}
                  {ev.costo_total > 0 && <span style={{color: '#666', fontSize:'0.9rem'}}>(${ev.costo_total})</span>}
                </div>
                
                <p className="alcance">
                  Aplicado a: <strong>{ev.nombre_animal || "🌍 Todo el Establecimiento"}</strong>
                </p>
                
                {ev.notas && <p className="notas">📝 {ev.notas}</p>}
              </div>

              <button className="btn-delete-mini" onClick={() => handleEliminar(ev.id)}>🗑️</button>
            </div>
          );
        })}

        {eventos.length === 0 && <p className="empty-state">No hay eventos registrados.</p>}
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nuevo Evento Sanitario 🩺</h3>
            <form onSubmit={handleCrear}>
                
                <div className="form-row">
                    <label>Fecha:</label>
                    <input type="date" required 
                        value={nuevoEvento.fecha}
                        onChange={e => setNuevoEvento({...nuevoEvento, fecha: e.target.value})}
                    />
                </div>

                <div className="form-row">
                    <label>Tipo:</label>
                    <select value={nuevoEvento.tipo} onChange={e => setNuevoEvento({...nuevoEvento, tipo: e.target.value})}>
                        <option value="Vacunación">Vacunación</option>
                        <option value="Antibiótico">Antibiótico</option>
                        <option value="Antiparasitario">Antiparasitario</option>
                        <option value="Tacto">Tacto / Revisión</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>

                <input type="text" placeholder="Producto / Droga (ej: Ivermectina)" required
                    value={nuevoEvento.producto}
                    onChange={e => setNuevoEvento({...nuevoEvento, producto: e.target.value})}
                />
                
                {/* --- AQUI ESTA EL INPUT DE COSTO QUE FALTABA --- */}
                <input 
                    type="number" 
                    placeholder="Costo Total ($)" 
                    min="0"
                    step="0.01"
                    value={nuevoEvento.costo_total}
                    onChange={e => setNuevoEvento({...nuevoEvento, costo_total: e.target.value})}
                />
                {/* ----------------------------------------------- */}

                <select 
                    value={nuevoEvento.animal_id}
                    onChange={e => setNuevoEvento({...nuevoEvento, animal_id: e.target.value})}
                    className="select-animal"
                >
                    <option value="">🌍 Aplicación General (Todo el Campo)</option>
                    {/* Si animales está vacío, esto no mostrará nada */}
                    {animales.map(a => (
                        <option key={a.id} value={a.id}>
                            🐮 {a.caravana} ({a.categoria})
                        </option>
                    ))}
                </select>

                <textarea placeholder="Notas adicionales..."
                    value={nuevoEvento.notas}
                    onChange={e => setNuevoEvento({...nuevoEvento, notas: e.target.value})}
                ></textarea>

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

export default GestionSanidad;