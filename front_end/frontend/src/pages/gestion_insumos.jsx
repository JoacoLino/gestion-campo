import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout'; // <--- IMPORTAMOS LAYOUT
import api from '../api/axios_config';
import './gestion_insumos.css'; // <--- USAMOS SU PROPIO CSS

const GestionInsumos = () => {
  const { campo_id } = useParams();
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Estado para nuevo insumo
  const [nuevo, setNuevo] = useState({ 
    nombre: '', categoria: 'Sanidad', stock: '', unidad: 'Dosis', costo_promedio: '' 
  });

  // Cargar
  useEffect(() => {
    fetchInsumos();
  }, [campo_id]);

  const fetchInsumos = async () => {
    try {
      const res = await api.get(`/insumos/${campo_id}/`, { withCredentials: true });
      setInsumos(res.data);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  // Crear
  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/insumos/${campo_id}/`, {
          ...nuevo, 
          stock: parseFloat(nuevo.stock) || 0,
          costo_promedio: parseFloat(nuevo.costo_promedio) || 0
      }, { withCredentials: true });
      
      setShowModal(false);
      setNuevo({ nombre: '', categoria: 'Sanidad', stock: '', unidad: 'Dosis', costo_promedio: '' });
      fetchInsumos();
    } catch (err) { alert("Error al crear"); }
  };

  // Ajustar Stock Rápido (Optimista)
  const ajustarStock = async (id, cantidad) => {
    try {
        // Actualización visual inmediata (Optimistic UI)
        setInsumos(insumos.map(i => i.id === id ? { ...i, stock: parseFloat(i.stock) + cantidad } : i));
        
        // Petición real al backend
        await api.put(`/insumos/${id}/stock?cantidad=${cantidad}`, {}, { withCredentials: true });
    } catch (err) { 
        alert("Error al sincronizar stock");
        fetchInsumos(); // Revertir si falla
    }
  };

  const eliminar = async (id) => {
      if(!window.confirm("¿Borrar insumo?")) return;
      try {
          await api.delete(`/insumos/${id}`, { withCredentials: true });
          setInsumos(insumos.filter(i => i.id !== id));
      } catch (e) { console.error(e); }
  };

  if (loading) return <Layout><div style={{padding:'20px'}}>Cargando depósito... 📦</div></Layout>;

  return (
    <Layout> {/* <--- WRAPPER LAYOUT */}
        <div className="insumos-container">
            
            {/* HEADER ESTANDAR */}
            <div className="dashboard-header">
                <div>
                    <h2>📦 Stock de Insumos</h2>
                    <p className="subtitle">Inventario y control de recursos</p>
                </div>
                <div className="header-actions">
                    <button className="btn-primary" onClick={() => setShowModal(true)}>+ Nuevo Insumo</button>
                </div>
            </div>

            {/* GRID DE TARJETAS */}
            <div className="insumos-grid">
                {insumos.map((item) => (
                <div key={item.id} className="insumo-card">
                    <div className="card-header">
                        <h3>{item.nombre}</h3>
                        <button className="btn-delete-mini" onClick={() => eliminar(item.id)}>×</button>
                    </div>
                    
                    <div className="card-body">
                        <div className="dato">
                            <span className="label">Categoría:</span>
                            <span className="valor-cat">{item.categoria}</span>
                        </div>
                        <div className="dato-stock">
                            <span className="label">Disponible:</span>
                            <span className={`valor-stock ${item.stock < 10 ? 'critical' : ''}`}>
                                {item.stock} {item.unidad}
                            </span>
                        </div>
                    </div>

                    <div className="card-footer">
                        <button className="btn-adjust minus" onClick={() => ajustarStock(item.id, -1)}>-</button>
                        <span className="adjust-label">Ajustar</span>
                        <button className="btn-adjust plus" onClick={() => ajustarStock(item.id, 1)}>+</button>
                    </div>
                </div>
                ))}
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="modal-overlay">
                <div className="modal-content">
                    <h3>Alta de Insumo 💉</h3>
                    <form onSubmit={handleCrear}>
                        <div className="form-row">
                            <label>Nombre</label>
                            <input type="text" placeholder="Ej: Vacuna Aftosa" required 
                                value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} 
                            />
                        </div>
                        
                        <div className="form-row">
                            <label>Categoría</label>
                            <select value={nuevo.categoria} onChange={e => setNuevo({...nuevo, categoria: e.target.value})}>
                                <option>Sanidad</option><option>Alimentación</option><option>Suplementos</option>
                                <option>Combustible</option><option>Semillas</option><option>Herramientas</option>
                            </select>
                        </div>

                        <div style={{display:'flex', gap:'10px'}}>
                            <div style={{flex:1}}>
                                <label style={{fontSize:'0.8rem'}}>Cantidad Inicial</label>
                                <input type="number" placeholder="0" required 
                                    value={nuevo.stock} onChange={e => setNuevo({...nuevo, stock: e.target.value})} 
                                />
                            </div>
                            <div style={{width:'100px'}}>
                                <label style={{fontSize:'0.8rem'}}>Unidad</label>
                                <select value={nuevo.unidad} onChange={e => setNuevo({...nuevo, unidad: e.target.value})}>
                                    <option>Dosis</option><option>Litros</option><option>Kg</option><option>Uni</option><option>Rollos</option>
                                </select>
                            </div>
                        </div>

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

export default GestionInsumos;