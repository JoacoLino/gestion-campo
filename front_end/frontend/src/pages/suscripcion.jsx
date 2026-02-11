import { useState } from 'react';
import Layout from '../components/layout'; // Usamos tu layout actual
import { toast } from 'sonner';
import './suscripcion.css';

const Suscripcion = () => {
  // POR AHORA: Simulamos que el usuario tiene el plan 1 (Gratis)
  // TODO: En el futuro, hacer un fetch al backend para saber el plan real del user
  const [planActual, setPlanActual] = useState(1); 

  const handleUpgrade = (nombrePlan) => {
    // Aquí es donde iría la redirección a MercadoPago / Stripe
    toast.info(`🚀 Próximamente podrás suscribirte al plan ${nombrePlan}. Estamos integrando los pagos.`);
  };

  return (
    <Layout>
      <div className="suscripcion-container">
        
        <div className="suscripcion-header">
            <h2>Elige el plan ideal para tu campo 🌾</h2>
            <p>Escala tu producción ganadera sin límites.</p>
        </div>

        <div className="pricing-grid">
            
            {/* PLAN 1: PRODUCTOR */}
            <div className={`plan-card ${planActual === 1 ? 'current' : ''}`}>
                <h3 className="plan-title">Productor</h3>
                <div className="plan-price">$0 <span>/mes</span></div>
                <ul className="plan-features">
                    <li><span className="check-icon">✓</span> 1 Campo</li>
                    <li><span className="check-icon">✓</span> Hasta 100 Animales</li>
                    <li><span className="check-icon">✓</span> 1 Usuario</li>
                    <li><span className="check-icon">✓</span> Gestión Sanitaria Básica</li>
                </ul>
                <button 
                    className={`btn-plan ${planActual === 1 ? 'btn-current' : 'btn-outline'}`}
                    disabled={planActual === 1}
                >
                    {planActual === 1 ? 'Tu Plan Actual' : 'Elegir Productor'}
                </button>
            </div>

            {/* PLAN 2: ESTABLECIMIENTO (DESTACADO) */}
            <div className={`plan-card popular ${planActual === 2 ? 'current' : ''}`}>
                <div className="badge-popular">Recomendado</div>
                <h3 className="plan-title">Establecimiento</h3>
                <div className="plan-price">$25 <span>/mes</span></div>
                <ul className="plan-features">
                    <li><span className="check-icon">✓</span> <strong>3 Campos</strong></li>
                    <li><span className="check-icon">✓</span> <strong>Hasta 1,000 Animales</strong></li>
                    <li><span className="check-icon">✓</span> 3 Usuarios (Equipo)</li>
                    <li><span className="check-icon">✓</span> Reportes Avanzados en Excel</li>
                    <li><span className="check-icon">✓</span> Soporte Prioritario</li>
                </ul>
                <button 
                    className={`btn-plan ${planActual === 2 ? 'btn-current' : 'btn-primary-plan'}`}
                    onClick={() => planActual !== 2 && handleUpgrade('Establecimiento')}
                    disabled={planActual === 2}
                >
                    {planActual === 2 ? 'Tu Plan Actual' : 'Mejorar Plan 🚀'}
                </button>
            </div>

            {/* PLAN 3: ESTANCIA */}
            <div className={`plan-card ${planActual === 3 ? 'current' : ''}`}>
                <h3 className="plan-title">Estancia</h3>
                <div className="plan-price">$90 <span>/mes</span></div>
                <ul className="plan-features">
                    <li><span className="check-icon">✓</span> <strong>Campos Ilimitados</strong></li>
                    <li><span className="check-icon">✓</span> <strong>Animales Ilimitados</strong></li>
                    <li><span className="check-icon">✓</span> Usuarios Ilimitados</li>
                    <li><span className="check-icon">✓</span> API de Integración</li>
                    <li><span className="check-icon">✓</span> Consultor Asignado</li>
                </ul>
                <button 
                    className={`btn-plan ${planActual === 3 ? 'btn-current' : 'btn-outline'}`}
                    onClick={() => planActual !== 3 && handleUpgrade('Estancia')}
                    disabled={planActual === 3}
                >
                    {planActual === 3 ? 'Tu Plan Actual' : 'Contactar Ventas'}
                </button>
            </div>

        </div>
      </div>
    </Layout>
  );
};

export default Suscripcion;