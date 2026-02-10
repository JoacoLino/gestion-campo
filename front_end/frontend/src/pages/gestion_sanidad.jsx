import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout'; // <--- IMPORTAMOS LAYOUT
import api from '../api/axios_config';
import './gestion_sanidad.css';

const GestionSanidad = () => {
  const { campo_id } = useParams();
  
  const [eventos, setEventos] = useState([]);
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [nuevoEvento, setNuevoEvento] = useState({
    fecha: new Date().toISOString().split('T')[0], 
    tipo: 'Vacunación', producto: '', notas: '', costo_total: '', animal_id: '' 
  });

  // CARGA DE DATOS
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resEventos, resAnimales] = await Promise.all([
          api.get(`/sanidad/${campo_id}/`, { withCredentials: true }),
          api.get(`/animales/${campo_id}/`, { withCredentials: true })
        ]);
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

  // GUARDAR
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
      setNuevoEvento({ fecha: new Date().toISOString().split('T')[0], tipo: 'Vacunación', producto: '', notas: '', costo_total: '', animal_id: '' });
    } catch (error) { alert("Error al guardar"); }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Borrar?")) return;
    try {
      await api.delete(`/sanidad/${id}`, { withCredentials: true });
      setEventos(eventos.filter(e => e.id !== id));
    } catch (error) { console.error(error); }
  };

  const handleExportar = async () => {
    try {
      const response = await api.get(`/reportes/sanidad/${campo_id}`, { withCredentials: true, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a'); link.href = url;
      link.setAttribute('download', `Historial_Sanitario.csv`);
      document.body.appendChild(link); link.click(); link.remove();
    } catch (error) { alert("Error al exportar"); }
  };

  if (loading) return <Layout><div style={{padding:'20px'}}>Cargando...</div></Layout>;

  return (
    <Layout> {/* <--- TODO ENVUELTO EN LAYOUT */}
        <div className="sanidad-container">
            
            {/* HEADER ESTILO RESUMEN */}
            <div className="dashboard-header">
                <div>
                    <h2>💉 Registro Sanitario</h2>
                    <p className="subtitle">Historial de vacunas y tratamientos</p>
                </div>
            
                <div className="header-actions">
                    <button className="btn-excel" onClick={handleExportar}>📄 Excel</button>
                    <button className="btn-add-sanidad" onClick={() => setShowModal(true)}>+ Nuevo Evento</button>
                </div>
            </div>

            {/* LISTA DE EVENTOS */}
            <div className="timeline-sanidad">
                {eventos.map((ev) => (
                    <div key={ev.id} className="evento-card">
                        <div className="evento-date">
                            <span className="day">{ev.fecha ? ev.fecha.split('-')[2] : '--'}</span>
                            <span className="month">{ev.fecha ? ev.fecha.split('-')[1] : '--'}</span>
                        </div>
                        
                        <div className="evento-info">
                            <div className="evento-header">
                                <span className={`badge-tipo ${ev.tipo.toLowerCase()}`}>{ev.tipo}</span>
                                <strong className="producto">{ev.producto}</strong>
                                {ev.costo_total > 0 && <span className="costo">(${ev.costo_total})</span>}
                            </div>
                            
                            <p className="alcance">
                                Aplicado a: <strong>{ev.nombre_animal || "🌍 Todo el Rodeo"}</strong>
                            </p>
                            
                            {ev.notas && <p className="notas">📝 {ev.notas}</p>}
                        </div>

                        <button className="btn-delete-mini" onClick={() => handleEliminar(ev.id)}>🗑️</button>
                    </div>
                ))}
                {eventos.length === 0 && <p className="empty-state">No hay eventos registrados.</p>}
            </div>

            {/* MODAL (Igual que antes) */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Nuevo Evento Sanitario</h3>
                        <form onSubmit={handleCrear}>
                            <div className="form-row">
                                <label>Fecha</label>
                                <input type="date" value={nuevoEvento.fecha} onChange={e => setNuevoEvento({...nuevoEvento, fecha: e.target.value})} required />
                            </div>
                            <div className="form-row">
                                <label>Tipo</label>
                                <select value={nuevoEvento.tipo} onChange={e => setNuevoEvento({...nuevoEvento, tipo: e.target.value})}>
                                    <option>Vacunación</option><option>Antibiótico</option><option>Antiparasitario</option><option>Tacto</option><option>Otro</option>
                                </select>
                            </div>
                            <input type="text" placeholder="Producto (Ej: Ivermectina)" value={nuevoEvento.producto} onChange={e => setNuevoEvento({...nuevoEvento, producto: e.target.value})} required />
                            <input type="number" placeholder="Costo Total ($)" value={nuevoEvento.costo_total} onChange={e => setNuevoEvento({...nuevoEvento, costo_total: e.target.value})} />
                            
                            <select className="select-animal" value={nuevoEvento.animal_id} onChange={e => setNuevoEvento({...nuevoEvento, animal_id: e.target.value})}>
                                <option value="">🌍 Aplicación General (Todo el Campo)</option>
                                {animales.map(a => <option key={a.id} value={a.id}>🐮 {a.caravana} ({a.categoria})</option>)}
                            </select>
                            
                            <textarea placeholder="Notas..." value={nuevoEvento.notas} onChange={e => setNuevoEvento({...nuevoEvento, notas: e.target.value})}></textarea>
                            
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-confirm">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    </Layout>
  );
};

export default GestionSanidad;