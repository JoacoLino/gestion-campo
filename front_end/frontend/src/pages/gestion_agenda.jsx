import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Estilos base
import api from '../api/axios_config';
import './gestion_agenda.css';

const GestionAgenda = () => {
  const { campo_id } = useParams();
  const [eventos, setEventos] = useState([]);
  const [date, setDate] = useState(new Date()); // Fecha seleccionada en el calendario
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

  // 3. Marcar Completado
  const toggleCheck = async (id) => {
    try {
      await api.put(`/agenda/check/${id}`, {}, { withCredentials: true });
      setEventos(eventos.map(ev => ev.id === id ? { ...ev, completado: !ev.completado } : ev));
    } catch (error) { console.error(error); }
  };

  // 4. Borrar
  const handleDelete = async (id) => {
    if(!window.confirm("¿Eliminar evento?")) return;
    try {
        await api.delete(`/agenda/${id}`, { withCredentials: true });
        setEventos(eventos.filter(e => e.id !== id));
    } catch (error) { console.error(error); }
  };

  // --- NUEVA FUNCIÓN PARA ABRIR EL MODAL ---
  const abrirModalConFecha = () => {
    // 1. Formateamos la fecha seleccionada en el calendario (YYYY-MM-DD)
    // Usamos métodos locales (getFullYear, etc) para evitar errores de zona horaria con toISOString
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const fechaSeleccionada = `${year}-${month}-${day}`;

    // 2. Actualizamos el estado del nuevo evento
    setNuevoEvento(prev => ({
        ...prev, 
        fecha: fechaSeleccionada 
    }));

    // 3. Mostramos el modal
    setShowModal(true);
  };

  // Filtrar eventos del día seleccionado
  const eventosDelDia = eventos.filter(ev => ev.fecha === date.toISOString().split('T')[0]);

  return (
    <div className="agenda-container">
        
        {/* COLUMNA IZQUIERDA: CALENDARIO */}
        <div className="calendar-section">
            <div className="header-actions">
                <h2>📅 Calendario</h2>
                <button className="btn-primary" onClick={abrirModalConFecha}>+ Agendar</button>
            </div>
            
            <Calendar 
                onChange={setDate} 
                value={date}
                tileContent={({ date, view }) => {
                    // Mostrar puntito si hay evento ese día
                    if (view === 'month') {
                        const fechaStr = date.toISOString().split('T')[0];
                        if (eventos.find(ev => ev.fecha === fechaStr)) {
                            return <div className="event-indicator"></div>;
                        }
                    }
                }}
            />
        </div>

        {/* COLUMNA DERECHA: LISTA DEL DÍA */}
        <div className="agenda-sidebar">
            <h3>Agenda para el {date.toLocaleDateString()}</h3>
            {eventosDelDia.length === 0 ? (
                <p style={{color: '#999', marginTop: '20px'}}>No hay tareas para este día. 💤</p>
            ) : (
                <div className="event-list">
                    {eventosDelDia.map(ev => (
                        <div key={ev.id} className={`event-item ${ev.completado ? 'completed' : ''}`}>
                            <input 
                                type="checkbox" 
                                className="event-check"
                                checked={ev.completado}
                                onChange={() => toggleCheck(ev.id)}
                            />
                            <div className="event-details">
                                <div style={{display:'flex', justifyContent:'space-between'}}>
                                    <h4>{ev.title}</h4>
                                    <span className={`badge-tipo tipo-${ev.tipo}`}>{ev.tipo}</span>
                                </div>
                                <p>{ev.descripcion || "Sin descripción"}</p>
                            </div>
                            <button className="btn-delete-mini" onClick={() => handleDelete(ev.id)}>×</button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* MODAL CREAR */}
        {showModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>Nuevo Evento 📌</h3>
                    <form onSubmit={handleCrear}>
                        <input type="text" placeholder="Título (ej: Vacunación)" required 
                            value={nuevoEvento.title} onChange={e => setNuevoEvento({...nuevoEvento, title: e.target.value})} />
                        
                        <input type="date" required 
                            value={nuevoEvento.fecha} onChange={e => setNuevoEvento({...nuevoEvento, fecha: e.target.value})} />
                        
                        <select value={nuevoEvento.tipo} onChange={e => setNuevoEvento({...nuevoEvento, tipo: e.target.value})}>
                            <option value="Sanidad">Sanidad</option>
                            <option value="Manejo">Manejo (Rotación, Pesaje)</option>
                            <option value="Venta">Venta / Compra</option>
                            <option value="Administrativo">Administrativo</option>
                        </select>

                        <textarea placeholder="Detalles..." 
                            value={nuevoEvento.descripcion} onChange={e => setNuevoEvento({...nuevoEvento, descripcion: e.target.value})} />

                        <div className="modal-actions">
                            <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button type="submit" className="btn-confirm">Agendar</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

    </div>
  );
};

export default GestionAgenda;