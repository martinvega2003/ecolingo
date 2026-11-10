// ⚠️ Contradicción detectada entre §0.12 (tabla de rutas: la entrada de
// "*" dice "Redirección a /mapa o /login según sesión" — un redirect
// silencioso, sin pantalla) y los criterios de aceptación de F02 en
// Parte 3 ("Una ruta inexistente muestra 404 con salida al mapa" — eso
// implica una pantalla real, no un redirect silencioso).
//
// Resuelto así: "/" tiene su propia ruta en App.jsx que redirige en
// silencio según sesión (honra literal el texto de §0.12 para la entrada
// al sitio). Cualquier OTRA ruta desconocida cae acá y muestra un 404 de
// verdad, con un botón de salida — que va a /mapa, /docente o /login
// según corresponda, no siempre "al mapa": un docente ahí lo devolvería
// al guard de todos modos. Pendiente de acuerdo bilateral con Cesar,
// igual que USERNAME_TAKEN en F01.
import { motion } from 'framer-motion';
import { Compass, Home, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { homeRouteForRole } from '../../utils/routes.js';
import Button from './Button.jsx';

const NotFoundPage = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return null; // evita parpadeo mientras se rehidrata (§ riesgo de F01/F02)

  const destination = isAuthenticated ? homeRouteForRole(user.role) : '/login';
  const label = isAuthenticated ? 'Volver al inicio' : 'Ir a iniciar sesión';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-4 text-center">
      <motion.div
        initial={{ opacity: 0, rotate: -40, scale: 0.6 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 12 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-surface text-info"
      >
        <Compass aria-hidden="true" className="h-10 w-10" />
      </motion.div>
      <h1 className="text-4xl font-extrabold text-text">404</h1>
      <p className="max-w-xs text-muted">Parece que te desviaste del camino: esta página no existe.</p>
      <Button icon={isAuthenticated ? Home : LogIn} onClick={() => navigate(destination, { replace: true })}>
        {label}
      </Button>
    </div>
  );
};

export default NotFoundPage;
