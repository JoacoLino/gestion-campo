import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Estilos base del calendario
import Layout from '../components/layout'; // <--- IMPORTAMOS LAYOUT
import api from '../api/axios_config';
import './gestion_agenda.css';

const GestionAgenda = () => {
  const { campo_id } = useParams();
  const [eventos, setEventos] = useState([]);
  const [date, setDate] = useState(new Date()); // Fecha seleccionada
  const [showModal, setShowModal] = useState(false);
  
  // Nuevo Evento
  const [nuevoEvento, setNuevoEvento] = useState({
    title: '', tipo: 'Sanidad', descripcion: '', fecha: new Date().toISOString().split('T')[0]
  });

  // 1. Cargar Eventos
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const res = await api.get(`/agenda/${campo_id}/`, { withCredentials: true });
        setEventos(res.data);
      } catch (error) { console.error(error); }
    };
    fetchEventos();
  }, [campo_id]);

  // 2. Crear Evento
  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/agenda/${campo_id}/`, nuevoEvento, { withCredentials: true });
      setEventos([...eventos, res.data]);
      setShowModal(false);
      setNuevoEvento({ title: '', tipo: 'Sanidad', descripcion: '', fecha: new Date().toISOString().split('T')[0] });
    } catch (error) { alert("Error al guardar"); }
  };

  // 3. Marcar Completado (Checkbox)
  const toggleCheck = async (id, estadoActual) => {
    try {
      // Optimistic UI update (actualiza visualmente antes de esperar al servidor)
      const nuevosEventos = eventos.map(ev => ev.id === id ? { ...ev, completado: !estadoActual } : ev);
      setEventos(nuevosEventos);
      
      await api.put(`/agenda/check/${id}`, {}, { withCredentials: true });
    } catch (error) { 
        console.error(error);
        alert("Error al actualizar");
        // Revertir si falla (opcional, requeriría recargar)
    }
  };

  // 4. Borrar
  const handleDelete = async (id) => {
    if(!window.confirm("¿Eliminar evento?")) return;
    try {
        await api.delete(`/agenda/${id}`, { withCredentials: true });
        setEventos(eventos.filter(e => e.id !== id));
    } catch (error) { console.error(error); }
  };

  // Abrir modal pre-cargando la fecha seleccionada en el calendario
  const abrirModal = () => {
    // Ajuste de zona horaria simple para que no reste un día
    const fechaLocal = date.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD
    setNuevoEvento(prev => ({ ...prev, fecha: fechaLocal }));
    setShowModal(true);
  };

  // Filtrar eventos del día seleccionado
  const eventosDelDia = eventos.filter(ev => ev.fecha === date.toLocaleDateString('en-CA'));

  return (
    <Layout> {/* <--- WRAPPER PRINCIPAL */}
        <div className="agenda-container">
            
            {/* HEADER ESTÁNDAR */}
            <div className="dashboard-header">
                <div>
                    <h2>📅 Agenda y Tareas</h2>
                    <p className="subtitle">Planificación del establecimiento</p>
                </div>
                <div className="header-actions">
                    <button className="btn-primary" onClick={abrirModal}>+ Agendar Tarea</button>
                </div>
            </div>

            {/* GRID PRINCIPAL: CALENDARIO + LISTA */}
            <div className="agenda-grid">
                
                {/* COLUMNA IZQUIERDA: CALENDARIO */}
                <div className="calendar-card">
                    <Calendar 
                        onChange={setDate} 
                        value={date}
                        className="custom-calendar"
                        tileContent={({ date, view }) => {
                            // Puntito si hay evento
                            if (view === 'month') {
                                const fechaStr = date.toLocaleDateString('en-CA');
                                if (eventos.some(ev => ev.fecha === fechaStr)) {
                                    return <div className="event-dot"></div>;
                                }
                            }
                        }}
                    />
                </div>

                {/* COLUMNA DERECHA: LISTA DEL DÍA */}
                <div className="events-card">
                    <div className="events-header">
                        <h3>{date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                        <span className="task-count">{eventosDelDia.length} tareas</span>
                    </div>

                    <div className="events-list">
                        {eventosDelDia.length === 0 ? (
                            <div className="empty-day">
                                <span>💤</span>
                                <p>No hay tareas para este día</p>
                                <button className="btn-small-add" onClick={abrirModal}>Crear una</button>
                            </div>
                        ) : (
                            eventosDelDia.map(ev => (
                                <div key={ev.id} className={`event-item ${ev.completado ? 'completed' : ''}`}>
                                    <input 
                                        type="checkbox" 
                                        className="event-check"
                                        checked={ev.completado}
                                        onChange={() => toggleCheck(ev.id, ev.completado)}
                                    />
                                    <div className="event-info">
                                        <div className="event-top">
                                            <h4>{ev.title}</h4>
                                            <span className={`tag-tipo ${ev.tipo}`}>{ev.tipo}</span>
                                        </div>
                                        {ev.descripcion && <p className="event-desc">{ev.descripcion}</p>}
                                    </div>
                                    <button className="btn-delete-event" onClick={() => handleDelete(ev.id)}>🗑️</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Nueva Tarea 📌</h3>
                        <form onSubmit={handleCrear}>
                            <div className="form-row">
                                <label>Título</label>
                                <input type="text" placeholder="Ej: Vacunación Aftosa" required 
                                    value={nuevoEvento.title} onChange={e => setNuevoEvento({...nuevoEvento, title: e.target.value})} />
                            </div>
                            
                            <div className="form-row">
                                <label>Fecha</label>
                                <input type="date" required 
                                    value={nuevoEvento.fecha} onChange={e => setNuevoEvento({...nuevoEvento, fecha: e.target.value})} />
                            </div>
                            
                            <div className="form-row">
                                <label>Tipo de Tarea</label>
                                <select value={nuevoEvento.tipo} onChange={e => setNuevoEvento({...nuevoEvento, tipo: e.target.value})}>
                                    <option value="Sanidad">Sanidad 💉</option>
                                    <option value="Manejo">Manejo 🤠</option>
                                    <option value="Venta">Comercial 💰</option>
                                    <option value="Administrativo">Admin 📝</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <label>Detalles (Opcional)</label>
                                <textarea placeholder="Notas adicionales..." 
                                    value={nuevoEvento.descripcion} onChange={e => setNuevoEvento({...nuevoEvento, descripcion: e.target.value})} />
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-confirm">Guardar Tarea</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    </Layout>
  );
};

export default GestionAgenda;