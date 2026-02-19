import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout'; // Asegúrate que la ruta sea correcta
import api from '../api/axios_config';
import { toast } from 'sonner';
import './gestion_personal.css';

const GestionPersonal = () => {
    const { campo_id } = useParams();
    const navigate = useNavigate();
    
    // Estados
    const [equipo, setEquipo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nuevo, setNuevo] = useState({ 
        nombre: '', 
        email: '', 
        password: '' 
    });

    // 1. CARGAR LISTA AL INICIO
    const cargarEquipo = async () => {
        try {
            // Ajusta la URL si tu endpoint final es diferente
            const res = await api.get(`/equipo/${campo_id}/`, { withCredentials: true });
            setEquipo(res.data);
        } catch (error) {
            console.error("Error cargando equipo:", error);
            toast.error("No se pudo cargar la lista de personal.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarEquipo();
    }, [campo_id]);

    // 2. CREAR NUEVO USUARIO (Con Guardián de Plan)
    const handleCrear = async (e) => {
        e.preventDefault();
        
        // Validación básica frontend
        if (!nuevo.nombre || !nuevo.email || !nuevo.password) {
            return toast.warning("Por favor completa todos los campos 📝");
        }

        try {
            await api.post(`/equipo/${campo_id}/crear`, nuevo, { withCredentials: true });
            
            toast.success(`¡Bienvenido al equipo, ${nuevo.nombre}! 🎉`);
            
            // Limpiamos form y recargamos lista
            setNuevo({ nombre: '', email: '', password: '' });
            cargarEquipo();

        } catch (error) {
            console.error(error);

            // 🛡️ AQUÍ ESTÁ EL GUARDIÁN DEL PLAN (402)
            if (error.response?.status === 402) {
                 toast.error(error.response.data.detail, {
                     duration: 6000,
                     action: { 
                        label: '⭐ Mejorar Plan', 
                        onClick: () => navigate(`/dashboard/${campo_id}/suscripcion`) 
                    }
                 });
            } else {
                // Errores genéricos (ej. email repetido)
                toast.error(error.response?.data?.detail || "Error al crear usuario.");
            }
        }
    };

    // 3. ELIMINAR (Opcional por ahora)
    const handleEliminar = (id) => {
        if(window.confirm("¿Seguro que quieres quitar a este usuario del campo?")){
            // Aquí iría la llamada a api.delete...
            toast.info("Funcionalidad de eliminar próximamente.");
        }
    };

    return (
        <Layout>
            <div className="personal-container">
                
                {/* HEADER */}
                <div className="personal-header">
                    <h2>👷‍♂️ Gestión de Personal</h2>
                    <p>Crea cuentas para tus peones o encargados. Ellos podrán entrar a la App con estos datos.</p>
                </div>
                
                {/* FORMULARIO DE ALTA */}
                <div className="form-card">
                    <h3>👤 Alta de Nuevo Integrante</h3>
                    <form onSubmit={handleCrear} className="add-member-form">
                        
                        <div className="form-group">
                            <label>Nombre Completo</label>
                            <input 
                                type="text" 
                                className="form-input"
                                placeholder="Ej. Juan Perez" 
                                value={nuevo.nombre} 
                                onChange={e=>setNuevo({...nuevo, nombre:e.target.value})} 
                            />
                        </div>

                        <div className="form-group">
                            <label>Usuario (Email)</label>
                            <input 
                                type="email" 
                                className="form-input"
                                placeholder="juan@campo.com" 
                                value={nuevo.email} 
                                onChange={e=>setNuevo({...nuevo, email:e.target.value})} 
                            />
                        </div>

                        <div className="form-group">
                            <label>Contraseña Inicial</label>
                            <input 
                                type="text" /* Type text para verla y copiarla */
                                className="form-input"
                                placeholder="Ej. campo123" 
                                value={nuevo.password} 
                                onChange={e=>setNuevo({...nuevo, password:e.target.value})} 
                            />
                        </div>

                        <button type="submit" className="btn-add-member">
                            + Crear Cuenta
                        </button>
                    </form>
                </div>

                {/* LISTA DE EQUIPO */}
                <div className="table-container">
                    <table className="team-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Usuario de Acceso</th>
                                <th className="col-rol">Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" style={{textAlign:'center'}}>Cargando equipo...</td></tr>
                            ) : equipo.length === 0 ? (
                                <tr><td colSpan="4" style={{textAlign:'center', padding:'30px'}}>Aún no tienes personal agregado.</td></tr>
                            ) : (
                                equipo.map((miembro) => (
                                    <tr key={miembro.id}>
                                        <td>{miembro.nombre}</td>
                                        <td className="user-email">{miembro.email}</td>
                                        <td className="col-rol">
                                            <span className="badge-rol">{miembro.rol || 'Peón'}</span>
                                        </td>
                                        <td>
                                            <button className="btn-delete" onClick={() => handleEliminar(miembro.id)} title="Eliminar">
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </Layout>
    );
};

export default GestionPersonal;