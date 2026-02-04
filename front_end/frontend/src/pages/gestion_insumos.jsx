import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios_config';
import './gestion_lotes.css'; // Reusamos estilos para mantener consistencia

const GestionInsumos = () => {
  const { campo_id } = useParams();
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Estado para nuevo insumo
  const [nuevo, setNuevo] = useState({ nombre: '', categoria: 'Sanidad', stock: '', unidad: 'Dosis', costo_promedio: '' });

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

  // Ajustar Stock Rápido
  const ajustarStock = async (id, cantidad) => {
    try {
        await api.put(`/insumos/${id}/stock?cantidad=${cantidad}`, {}, { withCredentials: true });
        // Actualización optimista en frontend
        setInsumos(insumos.map(i => i.id === id ? { ...i, stock: i.stock + cantidad } : i));
    } catch (err) { alert("Error al ajustar stock"); }
  };

  const eliminar = async (id) => {
      if(!window.confirm("¿Borrar insumo?")) return;
      try {
          await api.delete(`/insumos/${id}`, { withCredentials: true });
          setInsumos(insumos.filter(i => i.id !== id));
      } catch (e) { console.error(e); }
  };

  if (loading) return <div>Cargando depósito... 📦</div>;

  return (
    <div className="lotes-container"> {/* Reusamos clase container */}
      <div className="header-actions">
        <h2>📦 Stock de Insumos</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Nuevo Insumo</button>
      </div>

      <div className="lotes-grid"> {/* Reusamos el grid de tarjetas */}
        {insumos.map((item) => (
          <div key={item.id} className="lote-card" style={{ borderLeft: '5px solid #ff9800' }}> {/* Borde Naranja */}
            <div className="lote-header">
                <h3>{item.nombre}</h3>
                <button className="btn-delete-mini" onClick={() => eliminar(item.id)}>×</button>
            </div>
            
            <div className="lote-body">
                <div className="dato">
                    <span className="label">Categoría:</span>
                    <span className="valor">{item.categoria}</span>
                </div>
                <div className="dato">
                    <span className="label">Stock Actual:</span>
                    <span className="valor" style={{fontSize: '1.2rem', color: item.stock < 10 ? 'red' : '#333'}}>
                        {item.stock} {item.unidad}
                    </span>
                </div>
            </div>

            <div className="lote-footer" style={{display:'flex', justifyContent:'center', gap:'10px', background:'transparent'}}>
                {/* Botones de ajuste rápido */}
                <button className="btn-move" onClick={() => ajustarStock(item.id, -1)} style={{padding:'5px 12px', background:'#e0e0e0', color:'#333'}}>-</button>
                <button className="btn-move" onClick={() => ajustarStock(item.id, 1)} style={{padding:'5px 12px', background:'#e0e0e0', color:'#333'}}>+</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Alta de Insumo 💉</h3>
            <form onSubmit={handleCrear}>
                <input type="text" placeholder="Nombre (ej: Vacuna Aftosa)" required value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} />
                
                <select value={nuevo.categoria} onChange={e => setNuevo({...nuevo, categoria: e.target.value})}>
                    <option>Sanidad</option>
                    <option>Alimentación</option>
                    <option>Suplementos</option>
                    <option>Combustible</option>
                    <option>Semillas</option>
                </select>

                <div style={{display:'flex', gap:'10px'}}>
                    <input type="number" placeholder="Stock Inicial" required value={nuevo.stock} onChange={e => setNuevo({...nuevo, stock: e.target.value})} />
                    <select value={nuevo.unidad} onChange={e => setNuevo({...nuevo, unidad: e.target.value})} style={{width:'100px'}}>
                        <option>Dosis</option><option>Litros</option><option>Kg</option><option>Unidades</option><option>Rollos</option>
                    </select>
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
  );
};

export default GestionInsumos;