import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth.js';
import Header from './Header.jsx';
import StudentTabs from './StudentTabs.jsx';

// Armazón compartido de F02: cabecera + (opcional) tabs + contenido de la
// ruta activa.
// - showTabs: las rutas exclusivas de alumno (guard student) siempre llevan
//   los tres tabs (Módulos/Ranking/Logros).
// - tabsForStudents: las rutas compartidas (/perfil, /buscar, /glosario,
//   guard student|teacher) muestran los tabs solo si quien navega es un
//   alumno, para que siempre tenga cómo volver a /mapa. El docente no tiene
//   tabs: vuelve a su panel con el enlace de la cabecera.
// max-w-3xl evita que el contenido quede demasiado estirado en pantallas
// grandes (criterio de aceptación: "layout correcto en 1280 px").
// Transición: el contenido entra con un fundido corto al cambiar de sección.
// Se usa el primer segmento de la ruta como clave (no la ruta completa) para
// que /glosario y /glosario/:slug no se remonten ni recarguen.
const AppLayout = ({ showTabs = false, tabsForStudents = false }) => {
  const { user } = useAuth();
  const location = useLocation();
  const withTabs = showTabs || (tabsForStudents && user?.role === 'student');
  const sectionKey = location.pathname.split('/')[1] || 'root';

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      {withTabs && <StudentTabs />}
      <main className={`mx-auto max-w-3xl ${withTabs ? 'pb-20 md:pb-4' : 'pb-4'}`}>
        <motion.div
          key={sectionKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default AppLayout;
