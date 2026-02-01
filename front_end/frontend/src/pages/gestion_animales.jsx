import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios_config';
import './gestion_animales.css';

const GestionAnimales = () => {
  const { campo_id } = useParams();
  const [animales, setAnimales] = useState([]);
  const [lotes, setLotes] = useState([]); // Para poder elegir dónde poner la vaca
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  
  // Estado del formulario
  const [nuevoAnimal, setNuevoAnimal] = useState({
    caravana: '',
    categoria: 'Vaca',
    raza: '',
    peso: '',
    lote_id: '' // Importante: Asignar a un lote
  });

  // Cargar Animales y Lotes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resAnimales, resLotes] = await Promise.all([
          api.get(`/animales/${campo_id}/`, { withCredentials: true }),
          api.get(`/lotes/${campo_id}/`, { withCredentials: true })
        ]);
        
        setAnimales(resAnimales.data);
        setLotes(resLotes.data);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [campo_id]);

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...nuevoAnimal,
        peso: parseFloat(nuevoAnimal.peso) || 0,
        lote_id: nuevoAnimal.lote_id ? parseInt(nuevoAnimal.lote_id) : null
      };

      const response = await api.post(`/animales/${campo_id}/`, payload, { withCredentials: true });
      setAnimales([...animales, response.data]);
      setShowModal(false);
      setNuevoAnimal({ caravana: '', categoria: 'Vaca', raza: '', peso: '', lote_id: '' });
    } catch (error) {
      console.error("Error creando animal:", error);
      alert("Error al guardar el animal");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Dar de baja este animal?")) return;
    try {
      await api.delete(`/animales/${id}`, { withCredentials: true });
      setAnimales(animales.filter(a => a.id !== id));
    } catch (error) {
      console.error("Error eliminando:", error);
    }
  };

  // Helper para pintar badges
  const getBadgeClass = (cat) => {
    const map = { 'Vaca': 'badge-vaca', 'Toro': 'badge-toro', 'Ternero': 'badge-ternero' };
    return map[cat] || 'badge-default';
  };

  if (loading) return <div>Cargando hacienda... 🐄</div>;

  return (
    <div className="animales-container">
      <div className="header-actions">
        <h2>🐄 Stock Ganadero ({animales.length})</h2>
        <button className="btn-add-animal" onClick={() => setShowModal(true)}>
          + Alta Animal
        </button>
      </div>

      <table className="tabla-animales">
        <thead>
          <tr>
            <th>Caravana (ID)</th>
            <th>Categoría</th>
            <th>Raza</th>
            <th>Peso (kg)</th>
            <th>Ubicación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {animales.map((anim) => (
            <tr key={anim.id}>
              <td><strong>{anim.caravana}</strong></td>
              <td><span className={`badge ${getBadgeClass(anim.categoria)}`}>{anim.categoria}</span></td>
              <td>{anim.raza || '-'}</td>
              <td>{anim.peso} kg</td>
              {/* Buscamos el nombre del lote por ID */}
              <td>{lotes.find(l => l.id === anim.lote_id)?.name || 'Sin Asignar'}</td>
              <td>
                <button className="btn-delete-mini" onClick={() => handleEliminar(anim.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        
      {animales.length === 0 && <p style={{textAlign:'center', marginTop: 20}}>No hay animales cargados.</p>}

      {/* --- MODAL DE ALTA --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Alta de Hacienda 🐄</h3>
            <form onSubmit={handleCrear}>
                <input 
                    type="text" placeholder="Caravana / Identificación" required
                    value={nuevoAnimal.caravana}
                    onChange={e => setNuevoAnimal({...nuevoAnimal, caravana: e.target.value})}
                />
                
                <select 
                    value={nuevoAnimal.categoria}
                    onChange={e => setNuevoAnimal({...nuevoAnimal, categoria: e.target.value})}
                    style={{padding: '10px', borderRadius: '8px', border: '1px solid #ddd'}}
                >
                    <option value="Vaca">Vaca</option>
                    <option value="Toro">Toro</option>
                    <option value="Novillo">Novillo</option>
                    <option value="Ternero">Ternero</option>
                    <option value="Vaquillona">Vaquillona</option>
                </select>

                <input 
                    type="text" placeholder="Raza (ej: Angus)"
                    value={nuevoAnimal.raza}
                    onChange={e => setNuevoAnimal({...nuevoAnimal, raza: e.target.value})}
                />

                <input 
                    type="number" placeholder="Peso Actual (kg)"
                    value={nuevoAnimal.peso}
                    onChange={e => setNuevoAnimal({...nuevoAnimal, peso: e.target.value})}
                />

                {/* SELECTOR DE LOTE */}
                <select 
                    value={nuevoAnimal.lote_id}
                    onChange={e => setNuevoAnimal({...nuevoAnimal, lote_id: e.target.value})}
                    style={{padding: '10px', borderRadius: '8px', border: '1px solid #ddd'}}
                >
                    <option value="">-- Sin Lote / Campo General --</option>
                    {lotes.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                </select>

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

export default GestionAnimales;