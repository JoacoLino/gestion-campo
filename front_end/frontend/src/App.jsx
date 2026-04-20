import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Register from './pages/register';
import CampoSelection from './pages/campo_selection';
import DashboardLayout from './layouts/dashboard_layout';
import Resumen from './pages/resumen'; // Asegúrate que coincida mayúscula/minúscula con tu archivo
import GestionLotes from './pages/gestion_lotes';
import GestionAnimales from './pages/gestion_animales';
import GestionSanidad from './pages/gestion_sanidad';
import GestionAgenda from './pages/gestion_agenda';
import GestionInsumos from './pages/gestion_insumos';
import Suscripcion from './pages/suscripcion';
import GestionPersonal from './pages/gestion_personal';
import { Toaster } from 'sonner';

// --- BORRA LAS LÍNEAS QUE DECÍAN "const Resumen = ..." ---

// Si todavía no creaste el archivo Ganado.jsx, dejá este temporalmente,
// pero cámbiale el nombre si vas a importarlo después.
const Ganado = () => <h2>🐄 Gestión de Ganado (Próximamente)</h2>; 

function App() {
  return (
    <BrowserRouter>
    <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path='/register' element={<Register/>} />
        <Route path="/campo-selection" element={<CampoSelection />} />

        {/* Dashboard */}
        <Route path="/dashboard/:campo_id" element={<DashboardLayout />}>
            <Route index element={<Navigate to="resumen" replace />} />
            
            {/* Aquí usamos el componente real importado */}
            <Route path="resumen" element={<Resumen />} />
            <Route path="lotes" element={<GestionLotes />} />
            <Route path="animales" element={<GestionAnimales />} />
            <Route path="sanidad" element={<GestionSanidad />} />
            <Route path="agenda" element={<GestionAgenda />} />
            <Route path="insumos" element={<GestionInsumos />} />
            {/*<Route path="suscripcion" element={<Suscripcion />} />*/}
            <Route path="personal" element={<GestionPersonal />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;