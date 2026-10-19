import { Outlet } from 'react-router-dom';
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
const AppLayout = ({ showTabs = false, tabsForStudents = false }) => {
  const { user } = useAuth();
  const withTabs = showTabs || (tabsForStudents && user?.role === 'student');

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      {withTabs && <StudentTabs />}
      <main className={`mx-auto max-w-3xl ${withTabs ? 'pb-16 md:pb-0' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
