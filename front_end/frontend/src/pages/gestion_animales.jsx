import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios_config';
import './gestion_animales.css';

const GestionAnimales = () => {
  const { campo_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Datos crudos del servidor
  const [todosLosAnimales, setTodosLosAnimales] = useState([]); // Backup ("Source of Truth")
  const [lotes, setLotes] = useState([]);
  
  // Datos mostrados en tabla (Filtrados)
  const [animales, setAnimales] = useState([]); 
  const [loading, setLoading] = useState(true);

  // --- NUEVO: ESTADO DE FILTROS ---
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    caravana: '',
    categoria: '',
    lote_id: '' // Puede ser un ID, "sin_lote" o "" (todos)
  });

  // Estados de selección y modales
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [destinoLoteId, setDestinoLoteId] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [nuevoAnimal, setNuevoAnimal] = useState({
    caravana: '', categoria: 'Vaca', raza: '', peso: '', lote_id: ''
  });

  // 1. CARGA INICIAL
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resAnimales, resLotes] = await Promise.all([
          api.get(`/animales/${campo_id}/`, { withCredentials: true }),
          api.get(`/lotes/${campo_id}/`, { withCredentials: true })
        ]);
        
        setTodosLosAnimales(resAnimales.data);
        setLotes(resLotes.data);

        // --- INICIALIZAR FILTROS DESDE URL ---
        const params = new URLSearchParams(location.search);
        const loteIdParam = params.get('lote_id');
        const sinLoteParam = params.get('sin_lote');

        if (sinLoteParam === 'true') {
            setFiltros(prev => ({ ...prev, lote_id: 'sin_lote' }));
            setMostrarFiltros(true); // Abrir filtros automáticamente para que el usuario vea qué pasa
        } else if (loteIdParam) {
            setFiltros(prev => ({ ...prev, lote_id: loteIdParam }));
            setMostrarFiltros(true);
        } else {
            // Si no hay params, mostramos todo
            setAnimales(resAnimales.data);
        }

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [campo_id]); // Quitamos location.search de aquí para manejarlo manualmente

  // 2. EFECTO DE FILTRADO (Se ejecuta cada vez que cambia 'filtros' o 'todosLosAnimales')
  useEffect(() => {
    let resultado = todosLosAnimales;

    // A. Filtro por Lote
    if (filtros.lote_id) {
        if (filtros.lote_id === 'sin_lote') {
            resultado = resultado.filter(a => a.lote_id === null);
        } else {
            // Convertimos a int porque el select devuelve string
            resultado = resultado.filter(a => a.lote_id === parseInt(filtros.lote_id));
        }
    }

    // B. Filtro por Categoría
    if (filtros.categoria) {
        resultado = resultado.filter(a => a.categoria === filtros.categoria);
    }

    // C. Filtro por Caravana (Búsqueda de texto)
    if (filtros.caravana) {
        const busqueda = filtros.caravana.toLowerCase();
        resultado = resultado.filter(a => a.caravana.toLowerCase().includes(busqueda));
    }

    setAnimales(resultado);
  }, [filtros, todosLosAnimales]);


  // Manejadores de cambios en inputs de filtro
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const limpiarFiltros = () => {
    setFiltros({ caravana: '', categoria: '', lote_id: '' });
    navigate(`/dashboard/${campo_id}/animales`); // Limpiar URL también
  };


  // --- RESTO DE FUNCIONES (CRUD, Exportar, Mover) IGUAL QUE ANTES ---
  const handleSelectAll = () => {
    if (isAllSelected) setSelectedIds([]);
    else setSelectedIds(animales.map(a => a.id));
    setIsAllSelected(!isAllSelected);
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
      setIsAllSelected(false);
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleMoverMasivo = async () => {
    if (!destinoLoteId && destinoLoteId !== "") return alert("Elegí un destino");
    try {
      const payload = { animal_ids: selectedIds, nuevo_lote_id: destinoLoteId ? parseInt(destinoLoteId) : null };
      await api.put(`/animales/mover-masa/${campo_id}`, payload, { withCredentials: true });
      
      const actualizarLista = (lista) => lista.map(a => selectedIds.includes(a.id) ? { ...a, lote_id: payload.nuevo_lote_id } : a);
      setTodosLosAnimales(actualizarLista(todosLosAnimales));
      
      setSelectedIds([]); setIsAllSelected(false); setShowMoveModal(false);
      alert("✅ Hacienda movida correctamente");
    } catch (error) { console.error(error); alert("Error al mover."); }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...nuevoAnimal, peso: parseFloat(nuevoAnimal.peso) || 0, lote_id: nuevoAnimal.lote_id ? parseInt(nuevoAnimal.lote_id) : null };
      const response = await api.post(`/animales/${campo_id}/`, payload, { withCredentials: true });
      setTodosLosAnimales([...todosLosAnimales, response.data]);
      setShowCreateModal(false);
      setNuevoAnimal({ caravana: '', categoria: 'Vaca', raza: '', peso: '', lote_id: '' });
      alert("Animal creado ✨");
    } catch (error) { console.error(error); }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Baja definitiva?")) return;
    try {
      await api.delete(`/animales/${id}`, { withCredentials: true });
      setTodosLosAnimales(todosLosAnimales.filter(a => a.id !== id));
    } catch (error) { console.error(error); }
  };

  const handleExportar = async () => {
    try {
      const response = await api.get(`/reportes/stock/${campo_id}`, { withCredentials: true, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a'); link.href = url;
      link.setAttribute('download', `Stock_Ganado.csv`);
      document.body.appendChild(link); link.click(); link.remove();
    } catch (error) { console.error(error); alert("Error al exportar"); }
  };

  const getBadgeClass = (cat) => {
    const map = { 'Vaca': 'badge-vaca', 'Toro': 'badge-toro', 'Ternero': 'badge-ternero' };
    return map[cat] || 'badge-default';
  };

  if (loading) return <div>Cargando hacienda... 🐄</div>;

  return (
    <div className="animales-container">
      
      <div className="header-actions">
        {selectedIds.length > 0 ? (
          <div className="selection-toolbar">
            <span>{selectedIds.length} seleccionados</span>
            <button className="btn-move" onClick={() => setShowMoveModal(true)}>
              🚚 Mover a Lote
            </button>
          </div>
        ) : (
          <>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                <h2>🐄 Stock Ganadero ({todosLosAnimales.length})</h2>
                {/* Mostramos contador de visualizados si hay filtro */}
                {(filtros.caravana || filtros.categoria || filtros.lote_id) && (
                    <span style={{fontSize: '0.9rem', color: '#666'}}>
                        Viendo {animales.length} resultados
                    </span>
                )}
            </div>

            <div className="actions-group">
                {/* BOTÓN TOGGLE FILTROS */}
                <button 
                    className={`btn-filter ${mostrarFiltros ? 'active' : ''}`} 
                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    title="Filtrar listado"
                >
                    🌪️ Filtros
                </button>

                <button className="btn-excel" onClick={handleExportar}>
                    📄 Excel
                </button>
                <button className="btn-add-animal" onClick={() => setShowCreateModal(true)}>
                    + Alta Animal
                </button>
            </div>
          </>
        )}
      </div>

      {/* --- BARRA DE FILTROS DESPLEGABLE --- */}
      {mostrarFiltros && (
          <div className="filter-bar">
              <div className="filter-group">
                  <label>🔎 Caravana</label>
                  <input 
                      type="text" 
                      name="caravana" 
                      className="filter-input" 
                      placeholder="Buscar..." 
                      value={filtros.caravana}
                      onChange={handleFiltroChange}
                  />
              </div>

              <div className="filter-group">
                  <label>🏷️ Categoría</label>
                  <select name="categoria" className="filter-input" value={filtros.categoria} onChange={handleFiltroChange}>
                      <option value="">Todas</option>
                      <option value="Vaca">Vaca</option>
                      <option value="Toro">Toro</option>
                      <option value="Novillo">Novillo</option>
                      <option value="Ternero">Ternero</option>
                      <option value="Vaquillona">Vaquillona</option>
                  </select>
              </div>

              <div className="filter-group">
                  <label>📍 Ubicación</label>
                  <select name="lote_id" className="filter-input" value={filtros.lote_id} onChange={handleFiltroChange}>
                      <option value="">Todos los lotes</option>
                      <option value="sin_lote">⚠️ Sin Lote Asignado</option>
                      {lotes.map(l => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                  </select>
              </div>

              {(filtros.caravana || filtros.categoria || filtros.lote_id) && (
                  <button className="btn-clear-filters" onClick={limpiarFiltros}>
                      Limpiar todo ✕
                  </button>
              )}
          </div>
      )}

      {/* TABLA */}
      <table className="tabla-animales">
        <thead>
          <tr>
            <th style={{width: '40px'}}>
              <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll}/>
            </th>
            <th>Caravana</th>
            <th>Categoría</th>
            <th>Raza</th>
            <th>Peso</th>
            <th>Ubicación Actual</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {animales.length > 0 ? (
              animales.map((anim) => (
                <tr key={anim.id} className={selectedIds.includes(anim.id) ? 'row-selected' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(anim.id)} 
                      onChange={() => handleSelectOne(anim.id)}
                    />
                  </td>
                  <td><strong>{anim.caravana}</strong></td>
                  <td><span className={`badge ${getBadgeClass(anim.categoria)}`}>{anim.categoria}</span></td>
                  <td>{anim.raza || '-'}</td>
                  <td>{anim.peso} kg</td>
                  <td>
                      {anim.lote_id 
                        ? lotes.find(l => l.id === anim.lote_id)?.name 
                        : <span style={{color: '#d32f2f', fontWeight: 'bold'}}>⚠️ Sin Asignar</span>}
                  </td>
                  <td>
                    <button className="btn-delete-mini" onClick={() => handleEliminar(anim.id)}>🗑️</button>
                  </td>
                </tr>
              ))
          ) : (
              <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '30px', color: '#999'}}>
                      No se encontraron animales con estos filtros. 🧐
                  </td>
              </tr>
          )}
        </tbody>
      </table>

      {/* MODALES MANTENIDOS IGUAL */}
      {showMoveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>🚚 Rotación de Hacienda</h3>
            <p>Moviendo <strong>{selectedIds.length}</strong> animales.</p>
            <select value={destinoLoteId} onChange={e => setDestinoLoteId(e.target.value)} className="select-lote-move">
                <option value="">-- Sin Lote (Campo General) --</option>
                {lotes.map(l => (<option key={l.id} value={l.id}>{l.name}</option>))}
            </select>
            <div className="modal-actions">
                <button onClick={() => setShowMoveModal(false)}>Cancelar</button>
                <button className="btn-confirm" onClick={handleMoverMasivo}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Alta de Hacienda 🐄</h3>
                <form onSubmit={handleCrear}>
                    <input type="text" placeholder="Caravana" value={nuevoAnimal.caravana} onChange={e=>setNuevoAnimal({...nuevoAnimal, caravana:e.target.value})} required />
                    <select value={nuevoAnimal.categoria} onChange={e=>setNuevoAnimal({...nuevoAnimal, categoria:e.target.value})}>
                        <option>Vaca</option><option>Toro</option><option>Novillo</option><option>Ternero</option><option>Vaquillona</option>
                    </select>
                    <input type="text" placeholder="Raza" value={nuevoAnimal.raza} onChange={e=>setNuevoAnimal({...nuevoAnimal, raza:e.target.value})} />
                    <input type="number" placeholder="Peso" value={nuevoAnimal.peso} onChange={e=>setNuevoAnimal({...nuevoAnimal, peso:e.target.value})} />
                    <select value={nuevoAnimal.lote_id} onChange={e=>setNuevoAnimal({...nuevoAnimal, lote_id:e.target.value})}>
                        <option value="">-- Sin Lote --</option>
                        {lotes.map(l => (<option key={l.id} value={l.id}>{l.name}</option>))}
                    </select>
                    <div className="modal-actions">
                        <button type="button" onClick={()=>setShowCreateModal(false)}>Cancelar</button>
                        <button type="submit" className="btn-confirm">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default GestionAnimales;