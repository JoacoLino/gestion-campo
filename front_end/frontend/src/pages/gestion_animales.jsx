import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/layout';
import api from '../api/axios_config';
import './gestion_animales.css';
import { toast } from 'sonner';

const GestionAnimales = () => {
  const { campo_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Datos
  const [todosLosAnimales, setTodosLosAnimales] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [animales, setAnimales] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Filtros
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({ caravana: '', categoria: '', lote_id: '' });

  // Selección y Modales
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [destinoLoteId, setDestinoLoteId] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [nuevoAnimal, setNuevoAnimal] = useState({ caravana: '', categoria: 'Vaca', raza: '', peso: '', lote_id: '' });

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

        const params = new URLSearchParams(location.search);
        if (params.get('sin_lote') === 'true') {
            setFiltros(prev => ({ ...prev, lote_id: 'sin_lote' }));
            setMostrarFiltros(true);
        } else if (params.get('lote_id')) {
            setFiltros(prev => ({ ...prev, lote_id: params.get('lote_id') }));
            setMostrarFiltros(true);
        } else {
            setAnimales(resAnimales.data);
        }

      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchData();
  }, [campo_id]);

  // 2. EFECTO DE FILTRADO
  useEffect(() => {
    let resultado = todosLosAnimales;
    if (filtros.lote_id) {
        resultado = filtros.lote_id === 'sin_lote' 
            ? resultado.filter(a => a.lote_id === null)
            : resultado.filter(a => a.lote_id === parseInt(filtros.lote_id));
    }
    if (filtros.categoria) resultado = resultado.filter(a => a.categoria === filtros.categoria);
    if (filtros.caravana) resultado = resultado.filter(a => a.caravana.toLowerCase().includes(filtros.caravana.toLowerCase()));

    setAnimales(resultado);
  }, [filtros, todosLosAnimales]);

  const handleFiltroChange = (e) => setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const limpiarFiltros = () => { setFiltros({ caravana: '', categoria: '', lote_id: '' }); navigate(`/dashboard/${campo_id}/animales`); };

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
    if (destinoLoteId === "") return alert("Elegí un destino");
    try {
      const payload = { animal_ids: selectedIds, nuevo_lote_id: destinoLoteId ? parseInt(destinoLoteId) : null };
      await api.put(`/animales/mover-masa/${campo_id}`, payload, { withCredentials: true });
      
      const actualizarLista = (lista) => lista.map(a => selectedIds.includes(a.id) ? { ...a, lote_id: payload.nuevo_lote_id } : a);
      setTodosLosAnimales(actualizarLista(todosLosAnimales));
      
      setSelectedIds([]); setIsAllSelected(false); setShowMoveModal(false);
      alert("✅ Hacienda movida correctamente");
    } catch (error) { alert("Error al mover."); }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...nuevoAnimal, peso: parseFloat(nuevoAnimal.peso) || 0, lote_id: nuevoAnimal.lote_id ? parseInt(nuevoAnimal.lote_id) : null };
      const response = await api.post(`/animales/${campo_id}/`, payload, { withCredentials: true });
      setTodosLosAnimales([...todosLosAnimales, response.data]);
      setShowCreateModal(false);
      setNuevoAnimal({ caravana: '', categoria: 'Vaca', raza: '', peso: '', lote_id: '' });
      toast.success('¡Animal creado con éxito!');
    } catch (error) {console.error(error); 
      
      // Aquí revisamos si es el error de LÍMITE DE PLAN
      if (error.response?.status === 402) {
          toast.error(error.response.data.detail, {
              duration: 8000,
              action: {
                  label: '⭐ Ver Planes',
                  onClick: () => navigate(`/dashboard/${campo_id}/suscripcion`) 
              },
          });
          setShowCreateModal(false); 
      } else {
          toast.error('Hubo un error al crear al animal.'); 
      }
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Baja definitiva?")) return;
    try {
      await api.delete(`/animales/${id}`, { withCredentials: true });
      setTodosLosAnimales(todosLosAnimales.filter(a => a.id !== id));
      toast.info('¡Animal eliminado con éxito!');
    } catch (error) { console.error(error); toast.success('Hubo un error al eliminar el animal.'); }
  };

  const handleExportar = async () => {
    try {
      const response = await api.get(`/reportes/stock/${campo_id}`, { withCredentials: true, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a'); link.href = url;
      link.setAttribute('download', `Stock_Ganado.csv`);
      document.body.appendChild(link); link.click(); link.remove();
    } catch (error) { alert("Error al exportar"); }
  };

  const getBadgeClass = (cat) => {
    const map = { 'Vaca': 'badge-vaca', 'Toro': 'badge-toro', 'Ternero': 'badge-ternero' };
    return map[cat] || 'badge-default';
  };

  if (loading) return <Layout><div style={{padding:'20px'}}>Cargando hacienda... 🐄</div></Layout>;

  return (
    <Layout>
        <div className="animales-container">
        
        {/* HEADER */}
        <div className="dashboard-header">
            {selectedIds.length > 0 ? (
                <div className="selection-toolbar-header">
                    <span className="selection-count">{selectedIds.length} seleccionados</span>
                    <button className="btn-move" onClick={() => setShowMoveModal(true)}>🚚 Mover a Lote</button>
                </div>
            ) : (
                <>
                    <div>
                        <h2>🐄 Stock Ganadero</h2>
                        <p className="subtitle">
                            {filtros.caravana || filtros.categoria || filtros.lote_id 
                            ? `Viendo ${animales.length} resultados filtrados`
                            : `Total: ${todosLosAnimales.length} animales`}
                        </p>
                    </div>

                    <div className="header-actions">
                        <button className={`btn-filter ${mostrarFiltros ? 'active' : ''}`} onClick={() => setMostrarFiltros(!mostrarFiltros)}>🌪️ Filtros</button>
                        <button className="btn-excel" onClick={handleExportar}>📄 Excel</button>
                        <button className="btn-add-animal" onClick={() => setShowCreateModal(true)}>+ Alta</button>
                    </div>
                </>
            )}
        </div>

        {/* FILTROS */}
        {mostrarFiltros && (
            <div className="filter-bar">
                <div className="filter-group">
                    <label>🔎 Caravana</label>
                    <input type="text" name="caravana" className="filter-input" placeholder="Buscar..." value={filtros.caravana} onChange={handleFiltroChange} />
                </div>
                <div className="filter-group">
                    <label>🏷️ Categoría</label>
                    <select name="categoria" className="filter-input" value={filtros.categoria} onChange={handleFiltroChange}>
                        <option value="">Todas</option><option>Vaca</option><option>Toro</option><option>Novillo</option><option>Ternero</option><option>Vaquillona</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>📍 Ubicación</label>
                    <select name="lote_id" className="filter-input" value={filtros.lote_id} onChange={handleFiltroChange}>
                        <option value="">Todos los lotes</option>
                        <option value="sin_lote">⚠️ Sin Lote Asignado</option>
                        {lotes.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                </div>
                <button className="btn-clear-filters" onClick={limpiarFiltros}>Limpiar</button>
            </div>
        )}

        {/* --- TABLA PRINCIPAL --- */}
        {/* Usamos data-label para que en celular sepa qué mostrar */}
        <div className="table-responsive">
            <table className="tabla-animales">
                <thead>
                <tr>
                    <th style={{width: '40px'}}><input type="checkbox" checked={isAllSelected} onChange={handleSelectAll}/></th>
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
                            {/* CELDA CHECKBOX */}
                            <td className="td-check">
                                <input type="checkbox" checked={selectedIds.includes(anim.id)} onChange={() => handleSelectOne(anim.id)}/>
                            </td>
                            
                            {/* DATOS CON LABEL PARA MÓVIL */}
                            <td data-label="Caravana" className="td-caravana">
                                <strong>{anim.caravana}</strong>
                            </td>
                            <td data-label="Categoría">
                                <span className={`badge ${getBadgeClass(anim.categoria)}`}>{anim.categoria}</span>
                            </td>
                            <td data-label="Raza">{anim.raza || '-'}</td>
                            <td data-label="Peso">{anim.peso ? `${anim.peso} kg` : '-'}</td>
                            <td data-label="Ubicación">
                                {anim.lote_id 
                                    ? lotes.find(l => l.id === anim.lote_id)?.name 
                                    : <span style={{color: '#d32f2f', fontWeight: 'bold'}}>⚠️ Sin Asignar</span>}
                            </td>
                            
                            {/* ACCIONES */}
                            <td data-label="Acciones" className="td-actions">
                                <button className="btn-delete-mini" onClick={() => handleEliminar(anim.id)}>🗑️</button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan="7" style={{textAlign:'center', padding:'30px'}}>No hay resultados 🧐</td></tr>
                )}
                </tbody>
            </table>
        </div>

        {/* MODALES IGUAL QUE ANTES */}
        {showMoveModal && (
            <div className="modal-overlay">
            <div className="modal-content">
                <h3>🚚 Rotación de Hacienda</h3>
                <p>Moviendo <strong>{selectedIds.length}</strong> animales.</p>
                <select value={destinoLoteId} onChange={e => setDestinoLoteId(e.target.value)} className="select-lote-move">
                    <option value="">-- Sin Lote (Campo General) --</option>
                    {lotes.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
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
                        <div className="form-row"><label>Caravana</label><input type="text" value={nuevoAnimal.caravana} onChange={e=>setNuevoAnimal({...nuevoAnimal, caravana:e.target.value})} required /></div>
                        <div className="form-row"><label>Categoría</label>
                            <select value={nuevoAnimal.categoria} onChange={e=>setNuevoAnimal({...nuevoAnimal, categoria:e.target.value})}>
                                <option>Vaca</option><option>Toro</option><option>Novillo</option><option>Ternero</option><option>Vaquillona</option>
                            </select>
                        </div>
                        <div className="form-row"><label>Raza</label><input type="text" value={nuevoAnimal.raza} onChange={e=>setNuevoAnimal({...nuevoAnimal, raza:e.target.value})} /></div>
                        <div className="form-row"><label>Peso (Kg)</label><input type="number" value={nuevoAnimal.peso} onChange={e=>setNuevoAnimal({...nuevoAnimal, peso:e.target.value})} /></div>
                        <div className="form-row"><label>Lote Inicial</label>
                            <select value={nuevoAnimal.lote_id} onChange={e=>setNuevoAnimal({...nuevoAnimal, lote_id:e.target.value})}>
                                <option value="">-- Sin Lote --</option>{lotes.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button type="button" onClick={()=>setShowCreateModal(false)}>Cancelar</button>
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

export default GestionAnimales;